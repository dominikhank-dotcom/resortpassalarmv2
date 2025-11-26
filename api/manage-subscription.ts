import { createClient } from '@supabase/supabase-js';

// Init Supabase with Service Role Key to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, action } = req.body;

  if (!userId || !action) {
      return res.status(400).json({ error: 'Missing userId or action' });
  }

  try {
      if (action === 'grant_free') {
          // Check if subscription exists
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('user_id', userId)
            .single();

          if (sub) {
              // Update existing
              const { error } = await supabase
                .from('subscriptions')
                .update({
                    status: 'active',
                    plan_type: 'Manuell (Gratis)',
                    // Set end date far in the future or null
                    current_period_end: new Date(Date.now() + 365 * 10 * 24 * 60 * 60 * 1000).toISOString()
                })
                .eq('user_id', userId);
              if (error) throw error;
          } else {
              // Create new
              const { error } = await supabase
                .from('subscriptions')
                .insert({
                    user_id: userId,
                    status: 'active',
                    plan_type: 'Manuell (Gratis)',
                    current_period_end: new Date(Date.now() + 365 * 10 * 24 * 60 * 60 * 1000).toISOString()
                });
               if (error) throw error;
          }
      } else if (action === 'revoke_free') {
          // Revoke
          const { error } = await supabase
            .from('subscriptions')
            .update({
                status: 'inactive',
                plan_type: 'standard'
            })
            .eq('user_id', userId);
          if (error) throw error;
      }

      return res.status(200).json({ success: true });

  } catch (error: any) {
    console.error("Manage Subscription Error:", error);
    return res.status(500).json({ error: error.message });
  }
}