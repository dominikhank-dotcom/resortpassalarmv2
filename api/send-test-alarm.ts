import { Resend } from 'resend';
import twilio from 'twilio';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, phone, sendEmail, sendSms } = req.body;
  const results = { email: null as string | null, sms: null as string | null, errors: [] as string[] };

  if (sendEmail && email) {
    if (!process.env.RESEND_API_KEY) {
       results.errors.push("Email aktiviert, aber RESEND_API_KEY fehlt.");
    } else {
        try {
            const resend = new Resend(process.env.RESEND_API_KEY);
            const data = await resend.emails.send({
                from: 'ResortPass Alarm <alarm@resortpassalarm.com>',
                to: email,
                subject: '🔔 Test-Alarm: Dein Wächter funktioniert!',
                html: `<h1>Funktionstest erfolgreich!</h1><p>Hallo,</p><p>Dies ist ein Test-Alarm von deinem ResortPass Wächter.</p>`
            });
            if (data.error) throw data.error;
            results.email = 'sent';
        } catch (error: any) {
            console.error("Email Error:", error);
            results.errors.push(`Email Fehler: ${error.message}`);
        }
    }
  }

  if (sendSms && phone) {
      if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
          results.errors.push("SMS aktiviert, aber Twilio Keys fehlen.");
      } else {
          try {
              const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
              await twilioClient.messages.create({
                  body: '🔔 ResortPass Alarm Test: Dein SMS-Alarm ist aktiv und bereit!',
                  from: process.env.TWILIO_PHONE_NUMBER,
                  to: phone,
              });
              results.sms = 'sent';
          } catch (error: any) {
              console.error("SMS Error:", error);
              results.errors.push(`SMS Fehler: ${error.message}`);
          }
      }
  }

  if (results.errors.length > 0 && !results.email && !results.sms) {
      return res.status(500).json(results);
  }

  return res.status(200).json(results);
}