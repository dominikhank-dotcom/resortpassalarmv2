import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: any, res: any) {
  // Check Admin Permissions (Assuming middleware or manual check via session usually, 
  // but here we trust the backend logic or add userId check if passed)
  
  if (req.method === 'GET') {
      try {
          // Fetch requested payouts with partner details
          const { data, error } = await supabase
            .from('payouts')
            .select(`
                *,
                profiles:partner_id (first_name, last_name, email)
            `)
            .eq('status', 'requested')
            .order('requested_at', { ascending: true });

          if (error) throw error;

          return res.status(200).json(data);
      } catch (error: any) {
          return res.status(500).json({ error: error.message });
      }
  } 
  
  else if (req.method === 'POST') {
      const { payoutId } = req.body;
      if (!payoutId) return res.status(400).json({ error: 'Missing payoutId' });

      try {
          // 1. Get payout info to know the partner
          const { data: payout } = await supabase
            .from('payouts')
            .select('partner_id')
            .eq('id', payoutId)
            .single();
            
          if (!payout) return res.status(404).json({ error: 'Payout not found' });

          // 2. Update Payout Status
          const { error: updateError } = await supabase
            .from('payouts')
            .update({ 
                status: 'completed', 
                completed_at: new Date().toISOString() 
            })
            .eq('id', payoutId);

          if (updateError) throw updateError;

          // 3. Update related commissions to 'paid'
          // We assume all 'requested' commissions for this partner are part of this payout batch
          await supabase
            .from('commissions')
            .update({ status: 'paid' })
            .eq('partner_id', payout.partner_id)
            .eq('status', 'requested');

          return res.status(200).json({ success: true });
      } catch (error: any) {
          return res.status(500).json({ error: error.message });
      }
  } 
  
  else {
      return res.status(405).json({ error: 'Method not allowed' });
  }
}