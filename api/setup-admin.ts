import { getServiceSupabase } from './_lib/supabase.js';

export default async function handler(req, res) {
  const supabase = getServiceSupabase();
  const email = 'dominikhank@gmail.com';
  const password = '!w85!q3rkM^&';

  try {
    // 1. Get or Create User
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const existingUser = users.find(u => u.email === email);
    let userId;

    if (existingUser) {
      userId = existingUser.id;
      // Update Password
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId, { 
        password: password 
      });
      if (updateError) throw updateError;
      console.log("Admin password updated.");
    } else {
      // Create User
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });
      if (createError) throw createError;
      userId = newUser.user.id;
      console.log("Admin created.");
    }

    // 2. Set Admin Role in Profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email,
        role: 'ADMIN',
        first_name: 'Dominik',
        last_name: 'Hank'
      });

    if (profileError) throw profileError;

    return res.status(200).json({ 
      success: true, 
      message: "Admin Setup erfolgreich! Du kannst dich jetzt einloggen." 
    });

  } catch (error: any) {
    console.error("Admin Setup Error:", error);
    return res.status(500).json({ error: error.message });
  }
}