import Stripe from 'stripe';
// @ts-ignore
import { buffer } from 'micro';
import { createClient } from '@supabase/supabase-js';

export const config = { api: { bodyParser: false } };
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) { return res.status(400).send(`Webhook Error: ${err.message}`); }

  try {
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        let userId = session.client_reference_id;
        if (!userId && session.customer_email) {
            const { data: user } = await supabase.from('profiles').select('id').eq('email', session.customer_email).single();
            if (user) userId = user.id;
        }
        if (userId) {
            await supabase.from('subscriptions').insert({ user_id: userId, stripe_customer_id: session.customer, stripe_subscription_id: session.subscription, status: 'active', plan_type: 'premium', current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() });
            if (session.metadata?.referralCode) {
                const { data: partner } = await supabase.from('profiles').select('id').eq('referral_code', session.metadata.referralCode).single();
                if (partner) await supabase.from('commissions').insert({ partner_id: partner.id, source_user_id: userId, amount: 0.99, status: 'pending' });
            }
        }
    }
    res.status(200).json({ received: true });
  } catch (error) { res.status(500).json({ error: "Internal Server Error" }); }
}