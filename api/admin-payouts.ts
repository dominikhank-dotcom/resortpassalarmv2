import { getServiceSupabase } from './_lib/supabase';

export default async function handler(req, res) {
  const supabase = getServiceSupabase();

  if (req.method === 'GET') {
    // List all payouts
    const { data: payouts, error } = await supabase
      .from('payouts')
      .select(`
        *,
        profiles (email, first_name, last_name)
      `)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(payouts);
  }

  if (req.method === 'POST') {
    // Mark as Paid
    const { payoutId } = req.body;
    
    try {
        // 1. Update Payout
        const { error: payoutError } = await supabase
            .from('payouts')
            .update({ 
                status: 'paid', 
                paid_at: new Date().toISOString() 
            })
            .eq('id', payoutId);

        if (payoutError) throw payoutError;

        // 2. Update linked commissions to 'paid'
        const { error: commError } = await supabase
            .from('commissions')
            .update({ status: 'paid' })
            .eq('payout_id', payoutId);

        if (commError) throw commError;

        return res.status(200).json({ success: true });
    } catch(e: any) {
        return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}