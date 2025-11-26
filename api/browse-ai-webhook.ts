import { Resend } from 'resend';
import twilio from 'twilio';

// This webhook is called by Browse.ai when the robot finishes a task
// You configure this URL in Browse.ai: https://resortpassalarm.com/api/browse-ai-webhook

// Mock database of subscribers (In real app, use Supabase/Firebase)
const SUBSCRIBERS = [
  { email: 'dominik@example.com', phone: '+491510000000', wantsGold: true, wantsSilver: true }
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { event, data } = req.body;

    // Browse.ai sends captured text/data
    // Let's assume the robot captures the text "Ausverkauft" or "Verfügbar"
    // Data structure depends on your Robot configuration in Browse.ai
    const capturedTextGold = data?.capturedLists?.GoldStatus?.[0]?.text || "Ausverkauft";
    const capturedTextSilver = data?.capturedLists?.SilverStatus?.[0]?.text || "Ausverkauft";

    const goldAvailable = !capturedTextGold.toLowerCase().includes("ausverkauft");
    const silverAvailable = !capturedTextSilver.toLowerCase().includes("ausverkauft");

    if (!goldAvailable && !silverAvailable) {
       return res.status(200).json({ message: 'Nothing available, no alarms sent.' });
    }

    // --- INITIALIZE SERVICES ONLY IF NEEDED ---
    let resend = null;
    let twilioClient = null;

    if (process.env.RESEND_API_KEY) {
        resend = new Resend(process.env.RESEND_API_KEY);
    }
    
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }

    // --- TRIGGER ALARMS ---
    for (const user of SUBSCRIBERS) {
      if (goldAvailable && user.wantsGold) {
         // Send Email
         if (resend) {
             try {
                await resend.emails.send({
                    from: 'ALARM <alarm@resortpassalarm.com>',
                    to: user.email,
                    subject: '🚨 GOLD PASS VERFÜGBAR! SCHNELL SEIN!',
                    html: `<h1>ResortPass GOLD ist da!</h1><p>Klicke sofort hier: <a href="https://tickets.mackinternational.de/de/ticket/resortpass-gold">Zum Shop</a></p>`
                });
             } catch(e) { console.error("Webhook Email Error", e); }
         }
         
         // Send SMS
         if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
             try {
                await twilioClient.messages.create({
                    body: '🚨 ALARM: ResortPass GOLD ist verfügbar! Sofort prüfen: https://tickets.mackinternational.de/de/ticket/resortpass-gold',
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: user.phone
                });
             } catch(e) { console.error("Webhook SMS Error", e); }
         }
      }
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}