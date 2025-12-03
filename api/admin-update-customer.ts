import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { adminId, targetUserId, email, firstName, lastName, address } = req.body;

  if (!adminId || !targetUserId) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
      // 1. Verify Admin
      const { data: adminUser } = await supabase.from('profiles').select('role').eq('id', adminId).single();
      if (!adminUser || adminUser.role !== 'ADMIN') {
          return res.status(403).json({ error: 'Unauthorized' });
      }

      // 2. Update Auth Email (if changed)
      if (email) {
          const { error: authError } = await supabase.auth.admin.updateUserById(targetUserId, { email: email });
          if (authError) throw authError;
      }

      // 3. Update Profile
      const { error: profileError } = await supabase.from('profiles').update({
          email: email, // Sync email to profile
          first_name: firstName,
          last_name: lastName,
          street: address.street,
          house_number: address.houseNumber,
          zip: address.zip,
          city: address.city,
          country: address.country
      }).eq('id', targetUserId);

      if (profileError) throw profileError;

      return res.status(200).json({ success: true });

  } catch (error: any) {
      console.error("Admin Update Customer Error:", error);
      return res.status(500).json({ error: error.message });
  }
}