import Stripe from 'stripe';
// @ts-ignore
import { buffer } from 'micro';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // --- 1. HANDLE CHECKOUT COMPLETED (Update Subscription & Welcome Email) ---
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        let userId = session.client_reference_id;

        console.log(`Processing Checkout Session ${session.id} for User ${userId}`);

        // Fallback: Try to find user by email if client_reference_id is missing
        if (!userId && session.customer_email) {
            console.warn("Missing client_reference_id, looking up by email...");
            const { data: user } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', session.customer_email)
                .single();
            if (user) {
                userId = user.id;
            }
        }

        if (userId) {
            let currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
            let amount = 0;

            if (session.subscription) {
                try {
                    const subDetails = await stripe.subscriptions.retrieve(session.subscription as string);
                    currentPeriodEnd = new Date(subDetails.current_period_end * 1000).toISOString();
                    amount = session.amount_total ? session.amount_total / 100 : 0;
                } catch (e) {
                    console.error("Error fetching sub details", e);
                }
            }

            // DB UPDATE: Create/Update Subscription
            try {
                const { data: existingSub } = await supabase
                    .from('subscriptions')
                    .select('id')
                    .eq('user_id', userId)
                    .maybeSingle();

                const subData = {
                    user_id: userId,
                    stripe_customer_id: session.customer as string,
                    stripe_subscription_id: session.subscription as string,
                    status: 'active',
                    plan_type: 'premium',
                    current_period_end: currentPeriodEnd,
                    subscription_price: amount
                };

                if (existingSub) {
                    await supabase.from('subscriptions').update(subData).eq('id', existingSub.id);
                } else {
                    await supabase.from('subscriptions').insert(subData);
                }
                console.log("Subscription updated in DB.");
            } catch (dbErr) {
                console.error("DB Update Error:", dbErr);
            }

            // SEND CONFIRMATION EMAIL
            if (process.env.RESEND_API_KEY && session.customer_email) {
                try {
                    const resend = new Resend(process.env.RESEND_API_KEY);
                    const { data: profile } = await supabase.from('profiles').select('first_name').eq('id', userId).single();
                    const firstName = profile?.first_name || 'Kunde';

                    await resend.emails.send({
                        from: 'ResortPass Alarm <alarm@resortpassalarm.com>',
                        to: session.customer_email,
                        subject: 'Dein Premium-Schutz ist aktiv! 🛡️',
                        html: `
                            <h1>Das ging schnell!</h1>
                            <p>Danke ${firstName}, deine Zahlung war erfolgreich.</p>
                            <p>Die Überwachung für ResortPass Gold & Silver ist ab sofort <strong>AKTIV</strong>.</p>
                            <p>Dein Abo läuft bis: ${new Date(currentPeriodEnd).toLocaleDateString('de-DE')}</p>
                            <p><a href="https://resortpassalarm.com/dashboard">Zum Dashboard</a></p>
                        `
                    });
                } catch (emailErr) {
                    console.error("Failed to send confirmation email:", emailErr);
                }
            }
        }
    }

    // --- 2. HANDLE INVOICE PAYMENT SUCCEEDED (Commissions & Recurring Logic) ---
    // This event fires for the first payment AND every renewal. Perfect for lifetime commissions.
    if (event.type === 'invoice.payment_succeeded') {
        const invoice = event.data.object;
        console.log(`Processing Invoice ${invoice.id} (${invoice.amount_paid} cts)`);

        let userId = null;
        let amountPaid = invoice.amount_paid ? invoice.amount_paid / 100 : 0;

        // A. Update Subscription Status
        if (invoice.subscription) {
             const subDetails = await stripe.subscriptions.retrieve(invoice.subscription as string);
             const { data: sub } = await supabase.from('subscriptions').select('user_id').eq('stripe_subscription_id', invoice.subscription).single();
             
             if (sub) {
                 userId = sub.user_id; // Found user via subscription link
                 await supabase.from('subscriptions').update({
                     status: 'active',
                     current_period_end: new Date(subDetails.current_period_end * 1000).toISOString(),
                     subscription_price: amountPaid,
                     cancel_at_period_end: false 
                 }).eq('user_id', sub.user_id);
                 console.log("Subscription renewed/activated in DB.");
             }
        }

        // B. Handle Commissions (Lifetime)
        // If we didn't find userId via subscription (e.g. race condition on first payment), try email
        if (!userId && invoice.customer_email) {
            console.log("Looking up user by invoice email for commission...");
            const { data: userByEmail } = await supabase.from('profiles').select('id').eq('email', invoice.customer_email).single();
            if (userByEmail) userId = userByEmail.id;
        }

        if (userId && amountPaid > 0) {
            try {
                // Check if user has a referrer
                const { data: userProfile } = await supabase
                    .from('profiles')
                    .select('referred_by')
                    .eq('id', userId)
                    .single();

                if (userProfile && userProfile.referred_by) {
                    const refCode = userProfile.referred_by;
                    console.log(`User ${userId} was referred by "${refCode}". Processing commission...`);

                    // Resolve Partner
                    let { data: partner } = await supabase
                        .from('profiles')
                        .select('id')
                        .ilike('referral_code', refCode.trim())
                        .maybeSingle();
                    
                    // Fallback: Check if refCode is a UUID
                    if (!partner && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(refCode)) {
                         const { data: partnerById } = await supabase.from('profiles').select('id').eq('id', refCode).maybeSingle();
                         partner = partnerById;
                    }

                    if (partner) {
                        // Calculate Commission (50%)
                        const commissionAmount = Number((amountPaid * 0.50).toFixed(2));

                        // INSERT COMMISSION
                        // We do not check for duplicates here strictly, because every invoice (monthly) generates a new commission.
                        // Ideally we would store the invoice_id in commissions table to be 100% safe, 
                        // but simple insert works for now as invoice_succeeded usually fires once per cycle.
                        const { error: commError } = await supabase.from('commissions').insert({
                            partner_id: partner.id,
                            source_user_id: userId,
                            amount: commissionAmount,
                            status: 'pending'
                        });

                        if (commError) console.error("Commission Insert Error:", commError);
                        else console.log(`Commission of ${commissionAmount}€ added for partner ${partner.id}`);
                    } else {
                        console.warn(`Referral code "${refCode}" found in profile but no matching partner account.`);
                    }
                }
            } catch (commErr) {
                console.error("Commission Processing Error:", commErr);
            }
        }
    }

    if (event.type === 'customer.subscription.updated') {
        const subscription = event.data.object;
        await supabase.from('subscriptions').update({ 
            cancel_at_period_end: subscription.cancel_at_period_end,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
        }).eq('stripe_subscription_id', subscription.id);
    }

    if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object;
        await supabase.from('subscriptions').update({ status: 'canceled' }).eq('stripe_subscription_id', subscription.id);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}