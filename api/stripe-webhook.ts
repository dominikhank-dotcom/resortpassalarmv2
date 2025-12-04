import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { Buffer } from 'buffer';

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

// Native Buffer Helper to replace 'micro'
async function getRawBody(readable: any): Promise<Buffer> {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const buf = await getRawBody(req);
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error(`Webhook Signature Error: ${err.message}`);
    // 400 is correct here: The request was invalid (bad signature), so Stripe SHOULD know it failed.
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // --- FAIL-SAFE LOGIC WRAPPER ---
  // We wrap the entire business logic in a try-catch.
  // If ANYTHING fails (DB connection, Email sending, Logic bug), we catch it,
  // LOG IT (so you see it in Vercel), but return 200 to Stripe to stop the retries.
  try {
    const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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
            if (resend && session.customer_email) {
                try {
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
                 userId = sub.user_id; 
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
                    // Resolve Partner
                    let { data: partner } = await supabase
                        .from('profiles')
                        .select('id')
                        .ilike('referral_code', refCode.trim())
                        .maybeSingle();
                    
                    // Fallback
                    if (!partner && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(refCode)) {
                         const { data: partnerById } = await supabase.from('profiles').select('id').eq('id', refCode).maybeSingle();
                         partner = partnerById;
                    }

                    if (partner) {
                        const commissionAmount = Number((amountPaid * 0.50).toFixed(2));

                        const { error: commError } = await supabase.from('commissions').insert({
                            partner_id: partner.id,
                            source_user_id: userId,
                            amount: commissionAmount,
                            status: 'pending'
                        });

                        if (commError) console.error("Commission Insert Error:", commError);
                        else console.log(`Commission of ${commissionAmount}€ added for partner ${partner.id}`);
                    }
                }
            } catch (commErr) {
                console.error("Commission Processing Error:", commErr);
            }
        }
    }

    // --- 3. HANDLE PAYMENT FAILED ---
    if (event.type === 'invoice.payment_failed') {
        const invoice = event.data.object;
        console.log(`Payment failed for invoice ${invoice.id}`);
        
        if (invoice.customer_email && resend) {
            try {
                await resend.emails.send({
                    from: 'ResortPass Alarm <alarm@resortpassalarm.com>',
                    to: invoice.customer_email,
                    subject: 'Wichtig: Zahlung fehlgeschlagen ⚠️',
                    html: `
                        <p>Hallo,</p>
                        <p>Leider konnten wir dein Abo für den ResortPassAlarm nicht verlängern. Die Zahlung ist fehlgeschlagen.</p>
                        <p><strong>Deine Überwachung ist aktuell gefährdet.</strong></p>
                        <p>Bitte überprüfe deine Zahlungsmethode, um den Schutz aufrechtzuerhalten:</p>
                        <p><a href="https://resortpassalarm.com/dashboard">Zahlungsdaten prüfen</a></p>
                    `
                });
            } catch (e) {
                console.error("Failed to send payment failed email:", e);
            }
        }
    }

    // --- 4. HANDLE SUBSCRIPTION UPDATED / DELETED ---
    if (event.type === 'customer.subscription.updated') {
        const subscription = event.data.object;
        await supabase.from('subscriptions').update({ 
            cancel_at_period_end: subscription.cancel_at_period_end,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
        }).eq('stripe_subscription_id', subscription.id);
    }

    if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object;
        
        // Update DB
        await supabase.from('subscriptions').update({ status: 'canceled' }).eq('stripe_subscription_id', subscription.id);
        
        // Get User Email to notify
        const { data: sub } = await supabase.from('subscriptions').select('user_id').eq('stripe_subscription_id', subscription.id).single();
        if (sub && sub.user_id && resend) {
             const { data: profile } = await supabase.from('profiles').select('email, first_name').eq('id', sub.user_id).single();
             if (profile && profile.email) {
                 try {
                     await resend.emails.send({
                        from: 'ResortPass Alarm <alarm@resortpassalarm.com>',
                        to: profile.email,
                        subject: 'Dein Abo wurde beendet',
                        html: `
                            <p>Hallo ${profile.first_name || ''},</p>
                            <p>Dein ResortPassAlarm Abo ist nun ausgelaufen und wurde beendet.</p>
                            <p>Du erhältst ab sofort keine Alarme mehr.</p>
                            <p>Du kannst jederzeit zurückkehren: <a href="https://resortpassalarm.com/dashboard">Zum Dashboard</a></p>
                        `
                    });
                 } catch (e) {
                     console.error("Failed to send cancellation email:", e);
                 }
             }
        }
    }

    // --- SUCCESS RESPONSE ---
    res.status(200).json({ received: true });

  } catch (error) {
    // --- FAIL-SAFE CATCH ---
    // We log the error thoroughly, but we respond with 200 OK to Stripe.
    // This stops Stripe from retrying the event for 3 days and disabling the webhook.
    console.error("CRITICAL WEBHOOK PROCESSING ERROR (Swallowed to prevent retry):", error);
    res.status(200).json({ received: true, warning: "Internal Error Occurred, check logs." });
  }
}