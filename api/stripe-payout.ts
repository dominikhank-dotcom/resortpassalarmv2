import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { userId } = req.body;
  try {
    const { data: profile } = await supabase.from('profiles').select('stripe_account_id').eq('id', userId).single();
    if (!profile?.stripe_account_id) return res.status(400).json({ error: 'Kein Stripe Konto.' });

    const { data: commissions } = await supabase.from('commissions').select('id, amount').eq('partner_id', userId).eq('status', 'pending');
    const totalAmount = commissions?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;
    if (totalAmount < 20) return res.status(400).json({ error: 'Min. 20€.' });

    await stripe.transfers.create({ amount: Math.round(totalAmount * 100), currency: 'eur', destination: profile.stripe_account_id });
    await supabase.from('commissions').update({ status: 'paid' }).in('id', commissions.map(c => c.id));
    await supabase.from('payouts').insert({ partner_id: userId, amount: totalAmount, status: 'completed', paypal_email: 'stripe_connect', completed_at: new Date().toISOString() });

    res.status(200).json({ success: true, amount: totalAmount });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
}