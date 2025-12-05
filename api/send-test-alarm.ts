import { Resend } from 'resend';
import twilio from 'twilio';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, phone, sendEmail, sendSms } = req.body;
  const results = { email: null as string | null, sms: null as string | null, errors: [] as string[] };

  // --- SEND EMAIL ---
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
                html: `
                  <h1>Funktionstest erfolgreich!</h1>
                  <p>Hallo,</p>
                  <p>Dies ist ein Test-Alarm von deinem ResortPass Wächter.</p>
                  <p>Wenn du diese Mail liest, sind deine Einstellungen korrekt.</p>
                  <p>Wir melden uns, sobald Tickets verfügbar sind.</p>
                `
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
  if (sendSms && phone) {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
      const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

      if (!accountSid || !authToken) {
          results.errors.push("SMS aktiviert, aber TWILIO_ACCOUNT_SID oder TWILIO_AUTH_TOKEN fehlen in Vercel.");
      } else if (!messagingServiceSid && !phoneNumber) {
          results.errors.push("SMS aktiviert, aber weder TWILIO_MESSAGING_SERVICE_SID noch TWILIO_PHONE_NUMBER sind definiert.");
      } else {
          try {
              const twilioClient = twilio(accountSid, authToken);
              
              const msgConfig: any = {
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
              results.errors.push(`SMS Fehler: ${error.message}`);
          }
      }
  }

  if (results.errors.length > 0 && !results.email && !results.sms) {
      return res.status(500).json(results);
  }

  return res.status(200).json(results);
}