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

        // Fallback: Try to find user by email if client_reference_id is missing
        if (!userId && session.customer_email) {
            const { data: user } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', session.customer_email)
                .single();
            if (user) userId = user.id;
        }

        if (userId) {
            // Retrieve full subscription details to get accurate period_end
            let currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // Fallback
            let amount = 0;

            if (session.subscription) {
                try {
                    const subDetails = await stripe.subscriptions.retrieve(session.subscription as string);
                    currentPeriodEnd = new Date(subDetails.current_period_end * 1000).toISOString();
                    // Amount from the session (in cents)
                    amount = session.amount_total ? session.amount_total / 100 : 0;
                } catch (e) {
                    console.error("Error fetching sub details", e);
                }
            }

            // 1. Create/Update Subscription in DB
            await supabase.from('subscriptions').upsert({
                user_id: userId,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: session.subscription as string,
                status: 'active',
                plan_type: 'premium',
                current_period_end: currentPeriodEnd,
                // We could add a 'price' column to subscriptions table in SQL if we wanted to store it permanently per user
            }, { onConflict: 'user_id' }); // Upsert based on user_id to avoid duplicates

            // 2. Handle Affiliate Commission
            if (session.metadata?.referralCode) {
                const { data: partner } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('referral_code', session.metadata.referralCode)
                    .single();
                
                if (partner) {
                    // Calculate commission (e.g. 50% of amount) - logic should match system settings ideally
                    // For now using safe default or recalculating
                    const commissionAmount = amount > 0 ? (amount * 0.5) : 0.99;
                    
                    await supabase.from('commissions').insert({
                        partner_id: partner.id,
                        source_user_id: userId,
                        amount: commissionAmount,
                        status: 'pending'
                    });
                }
            }

            // 3. Send Confirmation Email
            if (process.env.RESEND_API_KEY && session.customer_email) {
                const resend = new Resend(process.env.RESEND_API_KEY);
                
                // Get First Name
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
                        <hr>
                        <p style="font-size: 12px; color: #666;">
                            Rechtliche Hinweise:<br>
                            <a href="https://resortpassalarm.com/terms">AGB</a> | <a href="https://resortpassalarm.com/revocation">Widerrufsbelehrung</a>
                        </p>
                    `
                });
            }
        }
    }

    // Handle Recurring Payments (Invoice Paid)
    if (event.type === 'invoice.payment_succeeded') {
        const invoice = event.data.object;
        if (invoice.subscription) {
             const subDetails = await stripe.subscriptions.retrieve(invoice.subscription as string);
             const { data: sub } = await supabase.from('subscriptions').select('user_id').eq('stripe_subscription_id', invoice.subscription).single();
             
             if (sub) {
                 // Extend Subscription
                 await supabase.from('subscriptions').update({
                     status: 'active',
                     current_period_end: new Date(subDetails.current_period_end * 1000).toISOString()
                 }).eq('user_id', sub.user_id);

                 // Add Commission for Partner (Recurring)
                 // Need to find who referred this user originally.
                 // Complex query or store referrer in subscription table.
                 // For MVP: We check if there was a previous commission for this pair?
                 // Better: Add referrer_id to profiles table (we did that in SQL earlier implicitly?)
                 // Let's rely on profiles.referral_code lookup if we stored who referred whom?
                 // Current SQL schema doesn't strictly link user -> partner ID permanently in profile, 
                 // but we can look at the first commission?
                 // For now, MVP assumes recurring logic will be added later or via 'metadata' on subscription object in Stripe if we added it there.
             }
        }
    }

    // Handle Cancellations
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