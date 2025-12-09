import { Resend } from 'resend';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { toEmail, firstName } = req.body;
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ message: 'Server Config Error: RESEND_API_KEY missing' });
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
        from: 'ResortPass Alarm <support@resortpassalarm.com>',
        to: toEmail,
        subject: `Willkommen bei ResortPassAlarm, ${firstName}!`,
        html: `<h1>Hallo ${firstName},</h1>
        <p>Willkommen an Bord! Dein Account wurde erfolgreich erstellt.</p>
        <p>Du bist jetzt bereit, deine Überwachung zu starten. Logge dich in dein Dashboard ein, um dein Abo zu aktivieren und keine Wellen mehr zu verpassen.</p>
        <p><a href="https://resortpassalarm.com/login">Zum Login</a></p>
        <p>Dein ResortPassAlarm Team</p>`
    });

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Welcome Email Error:", error);
    // Return 200 even on error to not block the UI flow, but log it server side
    return res.status(200).json({ success: false, message: error.message });
  }
}