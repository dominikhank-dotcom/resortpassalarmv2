
import { createClient } from '@supabase/supabase-js';

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
            .upsert({ key, value: value.toString(), updated_at: new Date().toISOString() });
          
          if (error) throw error;

          return res.status(200).json({ success: true });
      } catch (error: any) {
          return res.status(500).json({ error: error.message });
      }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
