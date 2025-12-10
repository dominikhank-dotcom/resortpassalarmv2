
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
    const maxAttempts = 10; 

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
        console.warn(">>> WARNING: Profile still missing after retries. Proceeding carefully.");
    }

    // 2. ATOMIC LOCK STRATEGY
    let shouldSendEmail = false;

    // Try to update DB to lock the email sending
    const { data: updatedRows, error: updateError } = await supabase
        .from('profiles')
        .update({ welcome_mail_sent: true })
        .eq('id', userId)
        .neq('welcome_mail_sent', true) // Handles FALSE and NULL
        .select();
    
    if (updateError) {
         console.error(">>> DB UPDATE ERROR:", updateError);
         
         // CRITICAL FIX: If schema error (PGRST204), assume DB is buggy but we still want to send ONE email.
         // The frontend (App.tsx) has a localStorage lock that prevents loops/spam.
         if (updateError.code === 'PGRST204' || updateError.message.includes('Could not find the')) {
             console.warn(">>> SCHEMA ERROR (PGRST204): Ignoring DB lock and sending email (relying on Client-Side Lock).");
             shouldSendEmail = true;
         } else {
             // For other errors (connection, timeout), we abort safely.
             console.warn(">>> ABORTING: Could not acquire lock due to generic DB Error.");
             return res.status(200).json({ success: true, message: 'DB Lock Error - Email skipped' });
         }
    } else {
        if (updatedRows && updatedRows.length > 0) {
            console.log(">>> ATOMIC LOCK ACQUIRED: Row updated. Sending email.");
            shouldSendEmail = true;
        } else {
            console.log(">>> ATOMIC LOCK FAILED: Email already sent (row not updated). Aborting.");
            return res.status(200).json({ success: true, message: 'Email already sent (Lock)' });
        }
    }

    if (shouldSendEmail) {
        if (!process.env.RESEND_API_KEY) {
            console.error(">>> API ERROR: RESEND_API_KEY missing");
            return res.status(500).json({ message: 'Server Config Error: RESEND_API_KEY missing' });
        }

        const resend = new Resend(process.env.RESEND_API_KEY);
        const origin = req.headers.origin || 'https://resortpassalarm.com';
        const loginLink = `${origin}/login`;

        // --- LOAD TEMPLATE FROM DB ---
        let templateData = null;
        try {
            const { data } = await supabase
                .from('email_templates')
                .select('*')
                .eq('id', 'cust_welcome')
                .single();
            templateData = data;
        } catch(e) { console.warn("Failed to load template from DB", e); }

        let subject = `Willkommen bei ResortPassAlarm, ${firstName || ''}!`;
        let htmlBody = `<h1>Hallo${firstName ? ' ' + firstName : ''},</h1>
            <p>Willkommen an Bord! Dein Account wurde erfolgreich erstellt.</p>
            <p>Du bist jetzt bereit, deine Überwachung zu starten. Logge dich in dein Dashboard ein, um dein Abo zu aktivieren und keine Wellen mehr zu verpassen.</p>
            <p><a href="${loginLink}">Zum Login</a></p>
            <p>Dein ResortPassAlarm Team</p>`;

        if (templateData && templateData.body) {
            console.log(">>> Using DB Template: cust_welcome");
            subject = templateData.subject;
            htmlBody = templateData.body;
            
            // Replace variables
            htmlBody = htmlBody.replace(/{firstName}/g, firstName || '');
            htmlBody = htmlBody.replace(/{loginLink}/g, loginLink);
            
            subject = subject.replace(/{firstName}/g, firstName || '');
        }

        const emailResponse = await resend.emails.send({
            from: 'ResortPass Alarm <support@resortpassalarm.com>',
            to: email,
            subject: subject,
            html: htmlBody
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
