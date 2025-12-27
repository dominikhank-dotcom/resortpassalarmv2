
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: any, res: any) {
  const { method } = req;

  try {
    if (method === 'GET') {
      const { slug } = req.query;
      if (slug) {
        const { data, error } = await supabase.from('blog_posts').select('*').eq('slug', slug).single();
        if (error) throw error;
        return res.status(200).json(data);
      } else {
        const { data, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return res.status(200).json(data);
      }
    }

    if (method === 'DELETE') {
      const { id, adminId } = req.body;
      const { data: admin } = await supabase.from('profiles').select('role').eq('id', adminId).single();
      if (!admin || admin.role !== 'ADMIN') return res.status(403).json({ error: 'Unauthorized' });

      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
