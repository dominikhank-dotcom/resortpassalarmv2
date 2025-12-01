import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const body = req.body as any;
  if (body.secret !== process.env.SUPABASE_SERVICE_ROLE_KEY) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const { data, error } = await supabase.from('profiles').update({ role: 'ADMIN' }).eq('email', body.email).select();
    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (error: any) { return res.status(500).json({ error: error.message }); }
}