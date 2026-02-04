
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
  // STRICT: Only 'active' (which includes canceled but running)
  const { data: sub } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

  if (!sub) {
      return res.status(403).json({ errors: ["Test-Alarm nur mit aktivem Abo möglich."] });
  }

  // --- 1.5 TEST LIMIT CHECK ---
  const { data: profile } = await supabase
      .from('profiles')
      .select('last_test_config, test_alarm_count')
      .eq('id', userId)
      .single();

  const currentCount = profile?.test_alarm_count || 0;
  if (currentCount >= 5) {
      return res.status(403).json({ errors: ["Du hast das Limit von 5 Test-Alarmen erreicht."] });
  }

  // --- 2. DUPLICATE CHECK ---
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

  if (!performEmail && !performSms) {
      return res.status(200).json({ errors: results.errors });
  }

  // --- SEND EMAIL ---
  if (performEmail && email) {
    if (!process.env.RESEND_API_KEY) {
       results.errors.push("Email aktiviert, aber RESEND_API_KEY fehlt.");
    } else {
        try {
            const resend = new Resend(process.env.RESEND_API_KEY);
            const { data: templateData } = await supabase.from('email_templates').select('*').eq('id', 'cust_alarm_test').single();
            let subject = '🔔 Test-Alarm: Dein Wächter funktioniert!';
            let htmlBody = `<h1>Funktionstest erfolgreich!</h1><p>Hallo,</p><p>Dies ist ein Test-Alarm.</p>`;
            if (templateData) {
                subject = templateData.subject;
                htmlBody = templateData.body;
            }
            await resend.emails.send({
                from: 'ResortPass Alarm <support@resortpassalarm.com>',
                to: email,
                subject: subject,
                html: htmlBody
            });
            results.email = 'sent';
        } catch (error: any) {
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
          results.errors.push("SMS Fehler: TWILIO_ACCOUNT_SID/TOKEN fehlt.");
      } else {
          try {
              const twilioClient = twilio(accountSid, authToken);
              const msgConfig: any = { body: '🔔 ResortPass Alarm Test: Dein SMS-Alarm ist bereit!', to: phone };
              if (messagingServiceSid) msgConfig.messagingServiceSid = messagingServiceSid;
              else msgConfig.from = phoneNumber;
              await twilioClient.messages.create(msgConfig);
              results.sms = 'sent';
          } catch (error: any) {
              results.errors.push(`SMS Fehler: ${error.message}`);
          }
      }
  }

  // --- UPDATE CONFIG ON SUCCESS ---
  if (results.email === 'sent' || results.sms === 'sent') {
      const newConfig = {
          email: results.email === 'sent' ? email : lastConfig.email,
          phone: results.sms === 'sent' ? phone : lastConfig.phone
      };
      await supabase.from('profiles').update({ last_test_config: newConfig, test_alarm_count: currentCount + 1 }).eq('id', userId);
  }

  return res.status(200).json(results);
}
