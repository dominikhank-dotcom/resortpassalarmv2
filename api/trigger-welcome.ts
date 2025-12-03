import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId, email, firstName } = req.body;
  if (!userId || !email) {
      return res.status(400).json({ error: 'Missing userId or email' });
  }

  try {
    // 1. Check if already sent
    const { data: profile } = await supabase
        .from('profiles')
        .select('welcome_mail_sent')
        .eq('id', userId)
        .single();
    
    if (profile && profile.welcome_mail_sent) {
        return res.status(200).json({ success: true, message: 'Already sent' });
    }

    // 2. Send Email
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
        const resend = new Resend(apiKey);
        await resend.emails.send({
            from: 'ResortPass Alarm <alarm@resortpassalarm.com>',
            to: email,
            subject: `Willkommen bei ResortPassAlarm, ${firstName}!`,
            html: `<h1>Hallo ${firstName},</h1>
            <p>Willkommen an Bord! Dein Account wurde erfolgreich aktiviert.</p>
            <p>Du bist jetzt bereit, deine Überwachung zu starten. Logge dich in dein Dashboard ein, um dein Abo zu aktivieren und keine Wellen mehr zu verpassen.</p>
            <p><a href="https://resortpassalarm.com/login">Zum Login</a></p>
            <p>Dein ResortPassAlarm Team</p>`
        });
    }

    // 3. Mark as sent
    await supabase.from('profiles').update({ welcome_mail_sent: true }).eq('id', userId);

    return res.status(200).json({ success: true, message: 'Sent' });

  } catch (error: any) {
    console.error("Welcome Trigger Error:", error);
    return res.status(500).json({ error: error.message });
  }
}