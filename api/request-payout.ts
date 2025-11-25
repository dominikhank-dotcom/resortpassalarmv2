import { getServiceSupabase } from './_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { partnerId, paypalEmail } = req.body;
  if (!partnerId || !paypalEmail) {
    return res.status(400).json({ message: 'Fehlende Daten.' });
  }

  const supabase = getServiceSupabase();

  try {
    const { data: pendingCommissions, error: fetchError } = await supabase
      .from('commissions')
      .select('id, amount')
      .eq('partner_id', partnerId)
      .eq('status', 'pending');

    if (fetchError) throw fetchError;

    const totalAmount = pendingCommissions.reduce((sum, c) => sum + Number(c.amount), 0);

    if (totalAmount < 20) {
      return res.status(400).json({ message: 'Mindestauszahlungsbetrag (20€) nicht erreicht.' });
    }

    const { data: payout, error: payoutError } = await supabase
      .from('payouts')
      .insert([{
        partner_id: partnerId,
        amount: totalAmount,
        status: 'pending',
        paypal_email: paypalEmail
      }])
      .select()
      .single();

    if (payoutError) throw payoutError;

    const commissionIds = pendingCommissions.map(c => c.id);
    const { error: updateError } = await supabase
      .from('commissions')
      .update({ 
        status: 'requested',
        payout_id: payout.id 
      })
      .in('id', commissionIds);

    if (updateError) throw updateError;

    return res.status(200).json({ success: true, payoutId: payout.id });

  } catch (error: any) {
    console.error("Payout Request Error:", error);
    return res.status(500).json({ message: error.message });
  }
}