import { createClient } from '@supabase/supabase-js';

// Init Supabase with Service Role Key to bypass RLS for writing if needed, 
// though we usually rely on user session. For settings, we might want to enforce admin check here.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
      try {
          const { data, error } = await supabase
            .from('system_settings')
            .select('*');
          
          if (error) throw error;
          
          // Convert array to object
          const settings = {};
          if (data) {
            data.forEach((item: any) => {
                settings[item.key] = item.value;
            });
          }

          return res.status(200).json(settings);
      } catch (error: any) {
          return res.status(500).json({ error: error.message });
      }
  } else if (req.method === 'POST') {
      const { key, value, userId } = req.body;

      if (!key || value === undefined || !userId) {
          return res.status(400).json({ error: 'Missing key, value or userId' });
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
          const { error } = await supabase
            .from('system_settings')
            .upsert({ key, value, updated_at: new Date().toISOString() });
          
          if (error) throw error;

          return res.status(200).json({ success: true });
      } catch (error: any) {
          return res.status(500).json({ error: error.message });
      }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}