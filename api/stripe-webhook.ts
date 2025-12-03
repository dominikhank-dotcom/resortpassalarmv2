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
    // Handle Checkout Session Completed
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
                console.log(`Found User ID via email: ${userId}`);
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

            // 1. ROBUST DB UPDATE (Check existing first)
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
                    subscription_price: amount // SAVE REAL PRICE
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

            // 2. HANDLE COMMISSIONS (Safe Logic)
            try {
                const refCode = session.metadata?.referralCode;
                if (refCode) {
                    console.log(`Processing referral for code: ${refCode}`);
                    
                    // Try to find partner by referral_code OR id
                    let { data: partner } = await supabase
                        .from('profiles')
                        .select('id')
                        .eq('referral_code', refCode)
                        .maybeSingle();
                    
                    if (!partner) {
                        // Fallback: Check if it's a UUID (direct ID reference)
                        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                        if (uuidRegex.test(refCode)) {
                             const { data: partnerById } = await supabase
                                .from('profiles')
                                .select('id')
                                .eq('id', refCode)
                                .maybeSingle();
                             partner = partnerById;
                        }
                    }
                    
                    if (partner) {
                        console.log(`Partner found: ${partner.id}`);
                        const commissionAmount = amount > 0 ? (amount * 0.5) : 0.99;
                        
                        const { error: commError } = await supabase.from('commissions').insert({
                            partner_id: partner.id,
                            source_user_id: userId,
                            amount: commissionAmount,
                            status: 'pending'
                        });
                        
                        if (commError) console.error("Commission Insert Error:", commError);
                        else console.log("Commission recorded successfully.");
                    } else {
                        console.warn(`Referral code ${refCode} not found in database (checked as code and ID).`);
                    }
                } else {
                    console.log("No referral code in metadata.");
                }
            } catch (commErr) {
                console.error("Commission Critical Error:", commErr);
            }

            // 3. SEND CONFIRMATION EMAIL (Safe Mode)
            // Note: Use try-catch block independently to ensure this runs even if commission failed
            if (process.env.RESEND_API_KEY && session.customer_email) {
                try {
                    console.log("Attempting to send confirmation email...");
                    const resend = new Resend(process.env.RESEND_API_KEY);
                    const { data: profile } = await supabase.from('profiles').select('first_name').eq('id', userId).single();
                    const firstName = profile?.first_name || 'Kunde';

                    const emailResult = await resend.emails.send({
                        from: 'ResortPass Alarm <alarm@resortpassalarm.com>',
                        to: session.customer_email,
                        subject: 'Dein Premium-Schutz ist aktiv! 🛡️',
                        html: `
                            <h1>Das ging schnell!</h1>
                            <p>Danke ${firstName}, deine Zahlung war erfolgreich.</p>
                            <p>Die Überwachung für ResortPass Gold & Silver ist ab sofort <strong>AKTIV</strong>.</p>
                            <p>Dein Abo läuft bis: ${new Date(currentPeriodEnd).toLocaleDateString('de-DE')}</p>
                            <p><a href="https://resortpassalarm.com/dashboard">Zum Dashboard</a></p>
                            <hr>
                            <p style="font-size: 12px; color: #666;">
                                Rechtliche Hinweise:<br>
                                <a href="https://resortpassalarm.com/terms">AGB</a> | <a href="https://resortpassalarm.com/revocation">Widerrufsbelehrung</a>
                            </p>
                        `
                    });
                    console.log("Confirmation email sent via Webhook:", emailResult);
                } catch (emailErr) {
                    console.error("Failed to send confirmation email:", emailErr);
                }
            } else {
                console.log("Skipping email: API Key or email missing.");
            }
        } else {
            console.error("No UserId found in session (even after lookup). Cannot process.");
        }
    }

    if (event.type === 'invoice.payment_succeeded') {
        const invoice = event.data.object;
        if (invoice.subscription) {
             const subDetails = await stripe.subscriptions.retrieve(invoice.subscription as string);
             const { data: sub } = await supabase.from('subscriptions').select('user_id').eq('stripe_subscription_id', invoice.subscription).single();
             
             if (sub) {
                 await supabase.from('subscriptions').update({
                     status: 'active',
                     current_period_end: new Date(subDetails.current_period_end * 1000).toISOString(),
                     subscription_price: invoice.amount_paid ? invoice.amount_paid / 100 : null,
                     cancel_at_period_end: false 
                 }).eq('user_id', sub.user_id);
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