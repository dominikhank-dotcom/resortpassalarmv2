import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: any, res: any) {
  // START LOG
  console.log("START: api/trigger-welcome called");

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId, email, firstName } = req.body;
  
  console.log(`[Welcome Trigger] Request received for: ${email} (ID: ${userId})`);

  if (!userId || !email) {
      console.error("[Welcome Trigger] REJECTED: Missing userId or email", req.body);
      return res.status(400).json({ error: 'Missing userId or email' });
  }

  try {
    // 1. Check if already sent (Idempotency)
    const { data: profile, error: dbError } = await supabase
        .from('profiles')
        .select('welcome_mail_sent')
        .eq('id', userId)
        .single();
    
    if (dbError) {
        console.error("[Welcome Trigger] DB Error fetching profile:", dbError);
    }

    if (profile && profile.welcome_mail_sent) {
        console.log(`[Welcome Trigger] Mail already marked sent for ${userId}. Skipping.`);
        return res.status(200).json({ success: true, message: 'Already sent' });
    }

    // 2. Send Email
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
        const resend = new Resend(apiKey);
        try {
            console.log(`[Welcome Trigger] Attempting to send via Resend to ${email}...`);
            const result = await resend.emails.send({
                from: 'ResortPass Alarm <alarm@resortpassalarm.com>',
                to: email,
                subject: `Willkommen bei ResortPassAlarm, ${firstName || 'Gast'}!`,
                html: `<h1>Hallo ${firstName || 'Gast'},</h1>
                <p>Willkommen an Bord! Dein Account wurde erfolgreich aktiviert.</p>
                <p>Du bist jetzt bereit, deine Überwachung zu starten. Logge dich in dein Dashboard ein, um dein Abo zu aktivieren und keine Wellen mehr zu verpassen.</p>
                <p><a href="https://resortpassalarm.com/login">Zum Login</a></p>
                <p>Dein ResortPassAlarm Team</p>`
            });
            
            if (result.error) {
                console.error("[Welcome Trigger] Resend API Error:", result.error);
            } else {
                console.log(`[Welcome Trigger] Email sent successfully. ID: ${result.data?.id}`);
            }
        } catch (mailError: any) {
            console.error("[Welcome Trigger] Resend Exception:", mailError);
        }
    } else {
        console.warn("[Welcome Trigger] No RESEND_API_KEY found in env vars.");
    }

    // 3. Mark as sent
    // We mark it sent even if email failed to prevent infinite loops on the client
    const { error: updateError } = await supabase.from('profiles').update({ welcome_mail_sent: true }).eq('id', userId);
    if (updateError) console.error("[Welcome Trigger] Failed to update profile DB:", updateError);
    else console.log(`[Welcome Trigger] DB updated: welcome_mail_sent = true for ${userId}`);

    return res.status(200).json({ success: true, message: 'Processed' });

  } catch (error: any) {
    console.error("[Welcome Trigger] Fatal Error:", error);
    return res.status(500).json({ error: error.message });
  }
}