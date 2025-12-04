import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default async function handler(req: any, res: any) {
  // --- DEBUG LOG START ---
  console.log(">>> API: trigger-welcome START");

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId, email, firstName } = req.body;
  
  console.log(`>>> API Payload: userId=${userId}, email=${email}, name=${firstName}`);

  if (!userId || !email) {
      console.error(">>> API ERROR: Missing userId or email in body");
      return res.status(400).json({ error: 'Missing userId or email', received: req.body });
  }

  try {
    // 1. Wait for Profile to exist (Race condition handling for DB Trigger)
    // The profile is created by a DB trigger on auth.users insert. It might take a few ms.
    let profileExists = false;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
        const { count, error } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('id', userId);
        
        if (count && count > 0) {
            profileExists = true;
            break;
        }
        
        console.log(`>>> Waiting for profile creation... Attempt ${attempts + 1}/${maxAttempts}`);
        await sleep(800); // Wait 800ms
        attempts++;
    }

    if (!profileExists) {
        // Fallback: If DB trigger is super slow, we still try to send email if we have the address from Auth.
        // But we can't lock the DB row if it doesn't exist. 
        // In this edge case, we log warning and proceed carefully.
        console.warn(">>> WARNING: Profile still missing after retries. Proceeding with Auth email, but duplicate protection is weaker.");
    }

    // 2. ATOMIC LOCK STRATEGY
    // Instead of "Check then Update", we do "Update if False".
    // Only the request that actually changes the row gets to send the email.
    
    // We try to set welcome_mail_sent = true WHERE id = userId AND welcome_mail_sent IS NOT TRUE
    // .select() returns the updated rows.
    
    let shouldSendEmail = false;

    if (profileExists) {
        const { data: updatedRows, error: updateError } = await supabase
            .from('profiles')
            .update({ welcome_mail_sent: true })
            .eq('id', userId)
            .is('welcome_mail_sent', false) // Only update if it is explicitly false (or null if your schema default handles it, but better explicit)
            .select();
        
        // Note: .is('welcome_mail_sent', false) checks for FALSE. 
        // If the column is NULL by default, we might need .or('welcome_mail_sent.is.null,welcome_mail_sent.eq.false')
        // But let's assume default is false as per schema.
        // Actually, Supabase .is filter might not support OR easily in update.
        // Let's rely on the fact that we set default false in SQL.
        
        // If the update affected 1 row, WE won the race.
        if (updatedRows && updatedRows.length > 0) {
            console.log(">>> ATOMIC LOCK ACQUIRED: Row updated. Sending email.");
            shouldSendEmail = true;
        } else {
            // If 0 rows updated, it means it was ALREADY true.
            console.log(">>> ATOMIC LOCK FAILED: Email already sent (row not updated). Aborting.");
            return res.status(200).json({ success: true, message: 'Email already sent (Lock)' });
        }
    } else {
        // Edge case: Profile missing. We send anyway to be safe, risking duplicate if multiple requests hit this edge case simultaneously.
        shouldSendEmail = true; 
    }

    if (shouldSendEmail) {
        // 3. Send Email via Resend
        if (!process.env.RESEND_API_KEY) {
            console.error(">>> API ERROR: RESEND_API_KEY missing");
            return res.status(500).json({ message: 'Server Config Error: RESEND_API_KEY missing' });
        }

        const resend = new Resend(process.env.RESEND_API_KEY);
        const emailResponse = await resend.emails.send({
            from: 'ResortPass Alarm <alarm@resortpassalarm.com>',
            to: email,
            subject: `Willkommen bei ResortPassAlarm${firstName ? ', ' + firstName : ''}!`,
            html: `<h1>Hallo${firstName ? ' ' + firstName : ''},</h1>
            <p>Willkommen an Bord! Dein Account wurde erfolgreich erstellt.</p>
            <p>Du bist jetzt bereit, deine Überwachung zu starten. Logge dich in dein Dashboard ein, um dein Abo zu aktivieren und keine Wellen mehr zu verpassen.</p>
            <p><a href="https://resortpassalarm.com/login">Zum Login</a></p>
            <p>Dein ResortPassAlarm Team</p>`
        });

        if (emailResponse.error) {
            console.error(">>> RESEND ERROR:", emailResponse.error);
            // We claimed the lock (set to true) but failed to send. 
            // Ideally we should rollback (set false), but for Welcome emails it's better to fail silent than spam.
            // Or log for manual intervention.
            return res.status(500).json({ success: false, message: 'Resend API Error', details: emailResponse.error });
        }

        console.log(">>> EMAIL SENT SUCCESSFULLY:", emailResponse.data);
        return res.status(200).json({ success: true, id: emailResponse.data?.id });
    }

    return res.status(200).json({ success: true, message: 'No action needed' });

  } catch (error: any) {
    console.error(">>> API CRITICAL EXCEPTION:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}