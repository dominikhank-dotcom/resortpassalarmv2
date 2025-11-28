import { createClient } from '@supabase/supabase-js';

// Init Supabase with Service Role Key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Explicitly cast body to any to avoid TypeScript 'never' errors
  const body = req.body as any;
  const { email, secret } = body;

  // Simple protection
  if (secret !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
     return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: 'ADMIN' })
      .eq('email', email)
      .select();

    if (error) throw error;

    return res.status(200).json({ success: true, message: `User ${email} promoted to ADMIN`, data });

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}