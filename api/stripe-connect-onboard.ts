import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { userId } = req.body;
  try {
    const { data: profile } = await supabase.from('profiles').select('stripe_account_id, email').eq('id', userId).single();
    if (!profile) throw new Error("User not found");
    let accountId = profile.stripe_account_id;
    if (!accountId) {
        const account = await stripe.accounts.create({ type: 'express', country: 'DE', email: profile.email, capabilities: { transfers: { requested: true } } });
        accountId = account.id;
        await supabase.from('profiles').update({ stripe_account_id: accountId }).eq('id', userId);
    }
    const accountLink = await stripe.accountLinks.create({ account: accountId, refresh_url: `${req.headers.origin}/affiliate?stripe_connected=refresh`, return_url: `${req.headers.origin}/affiliate?stripe_connected=true`, type: 'account_onboarding' });
    res.status(200).json({ url: accountLink.url });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}