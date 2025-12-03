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

  console.log(`Triggering welcome mail for ${email} (${userId})`);

  try {
    // 1. Check if already sent
    const { data: profile } = await supabase
        .from('profiles')
        .select('welcome_mail_sent')
        .eq('id', userId)
        .single();
    
    if (profile && profile.welcome_mail_sent) {
        console.log("Welcome mail already sent.");
        return res.status(200).json({ success: true, message: 'Already sent' });
    }

    // 2. Send Email
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
        const resend = new Resend(apiKey);
        try {
            await resend.emails.send({
                from: 'ResortPass Alarm <alarm@resortpassalarm.com>',
                to: email,
                subject: `Willkommen bei ResortPassAlarm, ${firstName || 'Gast'}!`,
                html: `<h1>Hallo ${firstName || 'Gast'},</h1>
                <p>Willkommen an Bord! Dein Account wurde erfolgreich aktiviert.</p>
                <p>Du bist jetzt bereit, deine Überwachung zu starten. Logge dich in dein Dashboard ein, um dein Abo zu aktivieren und keine Wellen mehr zu verpassen.</p>
                <p><a href="https://resortpassalarm.com/login">Zum Login</a></p>
                <p>Dein ResortPassAlarm Team</p>`
            });
            console.log("Welcome email sent to Resend.");
        } catch (mailError: any) {
            console.error("Resend API Error:", mailError);
            // DO NOT THROW. Return success so frontend stops retrying.
            // But verify: If keys are invalid, we can't send.
        }
    } else {
        console.warn("No Resend API Key found.");
    }

    // 3. Mark as sent (Even if email failed, to stop infinite loops in frontend)
    await supabase.from('profiles').update({ welcome_mail_sent: true }).eq('id', userId);

    return res.status(200).json({ success: true, message: 'Processed' });

  } catch (error: any) {
    console.error("Welcome Trigger Fatal Error:", error);
    return res.status(500).json({ error: error.message });
  }
}