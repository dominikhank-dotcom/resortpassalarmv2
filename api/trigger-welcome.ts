import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: any, res: any) {
  // --- DEBUG LOG START ---
  console.log(">>> API: trigger-welcome START");

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId, email, firstName } = req.body;
  
  // Log incoming data (masked email for safety if needed, but useful for debug now)
  console.log(`>>> API Payload: userId=${userId}, email=${email}, name=${firstName}`);

  if (!userId || !email) {
      console.error(">>> API ERROR: Missing userId or email in body");
      return res.status(400).json({ error: 'Missing userId or email', received: req.body });
  }

  try {
    // 1. Check idempotency
    const { data: profile, error: dbError } = await supabase
        .from('profiles')
        .select('welcome_mail_sent')
        .eq('id', userId)
        .single();
    
    if (dbError) {
        console.error(">>> API DB ERROR (Fetch Profile):", dbError);
    } else {
        console.log(`>>> API DB Check: welcome_mail_sent is currently '${profile?.welcome_mail_sent}'`);
    }

    if (profile && profile.welcome_mail_sent) {
        console.log(">>> API: Mail already marked as sent. Skipping.");
        return res.status(200).json({ success: true, message: 'Already sent' });
    }

    // 2. Check API Key
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.error(">>> API FATAL ERROR: RESEND_API_KEY is missing in Environment Variables!");
        return res.status(500).json({ error: 'Server Config Error: RESEND_API_KEY missing' });
    }
    console.log(">>> API: RESEND_API_KEY found (length: " + apiKey.length + ")");

    // 3. Send Email
    const resend = new Resend(apiKey);
    console.log(`>>> API: Attempting to send email via Resend to ${email}...`);

    const { data: emailData, error: emailError } = await resend.emails.send({
        from: 'ResortPass Alarm <alarm@resortpassalarm.com>',
        to: email,
        subject: `Willkommen bei ResortPassAlarm, ${firstName || 'Gast'}!`,
        html: `<h1>Hallo ${firstName || 'Gast'},</h1>
        <p>Willkommen an Bord! Dein Account wurde erfolgreich aktiviert.</p>
        <p>Du bist jetzt bereit, deine Überwachung zu starten. Logge dich in dein Dashboard ein, um dein Abo zu aktivieren und keine Wellen mehr zu verpassen.</p>
        <p><a href="https://resortpassalarm.com/login">Zum Login</a></p>
        <p>Dein ResortPassAlarm Team</p>`
    });

    if (emailError) {
        // THIS IS THE MOST IMPORTANT LOG
        console.error(">>> API RESEND ERROR DETAILS:", JSON.stringify(emailError, null, 2));
        return res.status(500).json({ success: false, error: emailError, message: "Resend API rejected the request." });
    }

    console.log(">>> API RESEND SUCCESS:", JSON.stringify(emailData, null, 2));

    // 4. Mark as sent in DB
    const { error: updateError } = await supabase.from('profiles').update({ welcome_mail_sent: true }).eq('id', userId);
    
    if (updateError) {
        console.error(">>> API DB UPDATE ERROR:", updateError);
    } else {
        console.log(">>> API: DB profile updated (welcome_mail_sent = true).");
    }

    return res.status(200).json({ success: true, message: 'Email sent & DB updated', data: emailData });

  } catch (error: any) {
    console.error(">>> API CRITICAL EXCEPTION:", error);
    return res.status(500).json({ error: error.message, stack: error.stack });
  }
}