import { Resend } from 'resend';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { template, toEmail } = req.body;
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ message: 'Server Config Error: RESEND_API_KEY missing' });
  }

  if (!toEmail) {
    return res.status(400).json({ message: 'Empfänger E-Mail fehlt.' });
  }

  try {
    // 1. Prepare Content: Replace variables with dummy data
    let body = template.body;
    let subject = template.subject;
    
    const replacements = {
        '{firstName}': 'Admin',
        '{productName}': 'ResortPass Gold',
        '{loginLink}': 'https://resortpassalarm.com/login',
        '{resetLink}': 'https://resortpassalarm.com/reset',
        '{dashboardLink}': 'https://resortpassalarm.com/dashboard',
        '{shopLink}': 'https://tickets.mackinternational.de',
        '{affiliateLink}': 'https://resortpassalarm.com/affiliate',
        '{month}': 'Mai 2024',
        '{newCustomers}': '12',
        '{revenue}': '145,00',
        '{commission}': '72,50'
    };

    // Simple string replacement
    for (const [key, value] of Object.entries(replacements)) {
       body = body.split(key).join(value);
       subject = subject.split(key).join(value);
    }

    // 2. Send Email
    const resend = new Resend(apiKey);
    await resend.emails.send({
        from: 'ResortPass Alarm <alarm@resortpassalarm.com>',
        to: toEmail,
        subject: `[TEST] ${subject}`,
        html: body,
    });

    return res.status(200).json({ success: true, message: 'Email sent successfully' });

  } catch (error) {
    console.error("Resend Template Error:", error);
    return res.status(500).json({ message: `Resend Error: ${error.message}` });
  }
}