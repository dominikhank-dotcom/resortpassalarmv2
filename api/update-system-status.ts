import { createClient } from '@supabase/supabase-js';

// Init Supabase with Service Role Key to bypass RLS for writing system settings
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, status, userId } = req.body;

  if (!type || !status || !userId) {
      return res.status(400).json({ error: 'Missing type, status or userId' });
  }

  // Verify Admin Role
  const { data: user } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  
  if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
      const now = new Date().toISOString();
      const key = type === 'gold' ? 'status_gold' : 'status_silver';

      // Update status AND last_checked
      await supabase
        .from('system_settings')
        .upsert({ key: key, value: status, updated_at: now });
        
      await supabase
        .from('system_settings')
        .upsert({ key: 'last_checked', value: now, updated_at: now });

      return res.status(200).json({ success: true });
  } catch (error: any) {
      return res.status(500).json({ error: error.message });
  }
}