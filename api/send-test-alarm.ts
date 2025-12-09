
import { Resend } from 'resend';
import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, email, phone, sendEmail, sendSms } = req.body;
  const results = { email: null as string | null, sms: null as string | null, errors: [] as string[] };

  if (!userId) {
      return res.status(400).json({ errors: ["User ID fehlt. Bitte neu einloggen."] });
  }

  // --- 1. SUBSCRIPTION CHECK ---
  const { data: sub } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing', 'Active', 'Trialing'])
      .maybeSingle();

  if (!sub) {
      return res.status(403).json({ errors: ["Test-Alarm nur mit aktivem Abo möglich."] });
  }

  // --- 2. DUPLICATE CHECK (Cost Savings) ---
  const { data: profile } = await supabase
      .from('profiles')
      .select('last_test_config')
      .eq('id', userId)
      .single();
  
  const lastConfig = profile?.last_test_config || {};
  let performEmail = sendEmail;
  let performSms = sendSms;

  if (sendEmail && lastConfig.email === email) {
      performEmail = false;
      results.errors.push("Email wurde bereits getestet. Ändere die Adresse für einen neuen Test.");
  }

  if (sendSms && lastConfig.phone === phone) {
      performSms = false;
      results.errors.push("SMS wurde bereits an diese Nummer gesendet. Ändere die Nummer für einen neuen Test.");
  }

  // If everything was skipped due to duplicates, stop here.
  if (!performEmail && !performSms) {
      return res.status(200).json({ errors: results.errors }); // 200 so frontend can show alert easily
  }

  // --- SEND EMAIL ---
  if (performEmail && email) {
    if (!process.env.RESEND_API_KEY) {
       results.errors.push("Email aktiviert, aber RESEND_API_KEY fehlt.");
    } else {
        try {
            const resend = new Resend(process.env.RESEND_API_KEY);
            // Load template from DB if exists
            const { data: templateData } = await supabase
                .from('email_templates')
                .select('*')
                .eq('id', 'cust_alarm_test')
                .single();
            
            let subject = '🔔 Test-Alarm: Dein Wächter funktioniert!';
            let htmlBody = `<h1>Funktionstest erfolgreich!</h1><p>Hallo,</p><p>Dies ist ein Test-Alarm.</p>`;

            if (templateData) {
                subject = templateData.subject;
                htmlBody = templateData.body;
                // Basic replacement if variables used
                htmlBody = htmlBody.replace('{firstName}', 'Kunde'); 
                subject = subject.replace('{firstName}', 'Kunde');
            }

            const data = await resend.emails.send({
                from: 'ResortPass Alarm <support@resortpassalarm.com>',
                to: email,
                subject: subject,
                html: htmlBody
            });
            if (data.error) throw data.error;
            results.email = 'sent';
        } catch (error: any) {
            console.error("Email Error:", error);
            results.errors.push(`Email Fehler: ${error.message}`);
        }
    }
  }

  // --- SEND SMS ---
  if (performSms && phone) {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
      const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

      if (!accountSid || !authToken) {
          results.errors.push("SMS Fehler: TWILIO_ACCOUNT_SID oder TWILIO_AUTH_TOKEN fehlen in Vercel.");
      } else if (!messagingServiceSid && !phoneNumber) {
          results.errors.push("SMS Fehler: Weder Messaging Service SID noch Phone Number konfiguriert.");
      } else {
          // Declare variables outside try block to be accessible in catch block
          let twilioClient: any;
          let msgConfig: any;

          try {
              twilioClient = twilio(accountSid, authToken);
              
              msgConfig = {
                  body: '🔔 ResortPass Alarm Test: Dein SMS-Alarm ist aktiv und bereit!',
                  to: phone,
              };

              // Use Messaging Service if available (Preferred for high volume)
              if (messagingServiceSid) {
                  msgConfig.messagingServiceSid = messagingServiceSid;
              } else {
                  msgConfig.from = phoneNumber;
              }

              await twilioClient.messages.create(msgConfig);
              results.sms = 'sent';
          } catch (error: any) {
              console.error("SMS Error:", error);
              // Extract Twilio specific info if available
              const code = error.code ? ` (Code: ${error.code})` : "";
              const msg = error.message || "Unknown error";
              
              // Helper message for common trial error
              let hint = "";
              if (error.code === 21608) {
                  hint = " [HINWEIS: Im Twilio Trial Mode musst du deine Nummer erst verifizieren!]";
              }
              
              // Fallback to direct number if messaging service failed with specific error (e.g. sender not found)
              // We check if twilioClient and msgConfig were initialized (they might be if error happened during create)
              if (messagingServiceSid && error.code === 20404 && phoneNumber && twilioClient && msgConfig) {
                   try {
                       console.log("Fallback to direct send...");
                       delete msgConfig.messagingServiceSid;
                       msgConfig.from = phoneNumber;
                       await twilioClient.messages.create(msgConfig);
                       results.sms = 'sent (fallback)';
                       // Clear error if fallback worked
                   } catch (fallbackErr: any) {
                       results.errors.push(`SMS Fehler: ${msg}${code}${hint}`);
                   }
              } else {
                  results.errors.push(`SMS Fehler: ${msg}${code}${hint}`);
              }
          }
      }
  }

  // --- UPDATE CONFIG ON SUCCESS ---
  if (results.email === 'sent' || results.sms?.startsWith('sent')) {
      const newConfig = {
          email: results.email === 'sent' ? email : lastConfig.email,
          phone: results.sms?.startsWith('sent') ? phone : lastConfig.phone
      };
      await supabase.from('profiles').update({ last_test_config: newConfig }).eq('id', userId);
  }

  // Partial success (e.g. Email sent, SMS failed) is still a 200 for the client to process
  // Only return 500 if EVERYTHING failed AND intended to send
  if (results.errors.length > 0 && !results.email && !results.sms && (performEmail || performSms)) {
      return res.status(500).json(results);
  }

  return res.status(200).json(results);
}
