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

  const { userId } = req.body;

  if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
  }

  try {
      // 1. Get Subscription
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single(); // It's okay if this returns null (no rows) or errors if not found

      // 2. Get Profile (Address etc) - Optional if already passed, but good for refresh
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      return res.status(200).json({ 
          success: true, 
          subscription: sub, 
          profile: profile 
      });

  } catch (error: any) {
    console.error("Get Customer Details Error:", error);
    // Return empty success structure even on error to allow UI to render basic info
    return res.status(200).json({ success: false, error: error.message });
  }
}