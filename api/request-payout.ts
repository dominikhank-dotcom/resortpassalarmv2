import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    const { data: profile } = await supabase.from('profiles').select('paypal_email, email').eq('id', userId).single();
    if (!profile) return res.status(404).json({ error: "User not found" });
    const paypalEmail = profile.paypal_email || profile.email;
    
    const { data: commissions } = await supabase.from('commissions').select('id, amount').eq('partner_id', userId).eq('status', 'pending');
    if (!commissions || commissions.length === 0) return res.status(400).json({ error: 'Kein Guthaben.' });

    const totalAmount = commissions.reduce((sum, c) => sum + Number(c.amount), 0);
    if (totalAmount < 20) return res.status(400).json({ error: 'Auszahlung erst ab 20,00 €.' });

    await supabase.from('payouts').insert({ partner_id: userId, amount: totalAmount, status: 'requested', paypal_email: paypalEmail, requested_at: new Date().toISOString() });
    const commissionIds = commissions.map(c => c.id);
    await supabase.from('commissions').update({ status: 'requested' }).in('id', commissionIds);

    res.status(200).json({ success: true, amount: totalAmount });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}