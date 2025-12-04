import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default async function handler(req: any, res: any) {
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
    let profileExists = false;
    let attempts = 0;
    const maxAttempts = 10; // Increased to 10

    while (attempts < maxAttempts) {
        const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('id', userId);
        
        if (count && count > 0) {
            profileExists = true;
            break;
        }
        
        console.log(`>>> Waiting for profile creation... Attempt ${attempts + 1}/${maxAttempts}`);
        await sleep(800); 
        attempts++;
    }

    if (!profileExists) {
        console.warn(">>> WARNING: Profile still missing after retries. Proceeding with Auth email.");
    }

    // 2. ATOMIC LOCK STRATEGY
    // Update welcome_mail_sent = true WHERE id = userId AND welcome_mail_sent IS NOT TRUE (False or Null)
    
    let shouldSendEmail = false;

    if (profileExists) {
        const { data: updatedRows, error: updateError } = await supabase
            .from('profiles')
            .update({ welcome_mail_sent: true })
            .eq('id', userId)
            .neq('welcome_mail_sent', true) // Handles FALSE and NULL
            .select();
        
        if (updatedRows && updatedRows.length > 0) {
            console.log(">>> ATOMIC LOCK ACQUIRED: Row updated. Sending email.");
            shouldSendEmail = true;
        } else {
            console.log(">>> ATOMIC LOCK FAILED: Email already sent (row not updated). Aborting.");
            return res.status(200).json({ success: true, message: 'Email already sent (Lock)' });
        }
    } else {
        // Fallback if profile missing
        shouldSendEmail = true; 
    }

    if (shouldSendEmail) {
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