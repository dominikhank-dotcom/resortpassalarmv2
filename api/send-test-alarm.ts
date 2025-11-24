import { Resend } from 'resend';
import twilio from 'twilio';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, phone, sendEmail, sendSms } = req.body;
  const results = { email: null, sms: null, errors: [] };

  try {
    // 1. Send Email via Resend
    if (sendEmail && email) {
      if (!process.env.RESEND_API_KEY) {
        console.warn("Skipping Email: RESEND_API_KEY is missing");
        results.errors.push("Server Config Error: RESEND_API_KEY missing");
      } else {
        try {
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: 'ResortPass Alarm <alarm@resortpassalarm.com>',
            to: email,
            subject: '🔔 TEST-ALARM: ResortPass Wächter',
            html: `
              <div style="font-family: sans-serif; color: #333;">
                <h1 style="color: #00305e;">Funktionstest erfolgreich!</h1>
                <p>Hallo,</p>
                <p>Dies ist ein <strong>Test-Alarm</strong> von deinem ResortPass Wächter.</p>
                <p>Wenn du diese Mail liest, sind deine Einstellungen korrekt. Wir benachrichtigen dich, sobald Tickets verfügbar sind.</p>
                <br/>
                <p>Viele Grüße,<br/>Dein ResortPassAlarm Team</p>
              </div>
            `,
          });
          results.email = 'sent';
        } catch (err) {
          console.error("Resend Error:", err);
          results.errors.push(`Email Error: ${err.message}`);
        }
      }
    }

    // 2. Send SMS via Twilio
    if (sendSms && phone) {
      if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
        console.warn("Skipping SMS: Twilio credentials missing");
        results.errors.push("Server Config Error: Twilio credentials missing");
      } else {
        try {
          const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
          await twilioClient.messages.create({
            body: '🔔 TEST-ALARM: Dein ResortPassAlarm Setup funktioniert! Wir melden uns, sobald Tickets da sind.',
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone,
          });
          results.sms = 'sent';
        } catch (err) {
          console.error("Twilio Error:", err);
          results.errors.push(`SMS Error: ${err.message}`);
        }
      }
    }

    if (results.errors.length > 0 && !results.email && !results.sms) {
        return res.status(500).json({ message: 'Failed to send notifications', results });
    }

    res.status(200).json({ message: 'Process completed', results });

  } catch (error) {
    console.error("General API Error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}