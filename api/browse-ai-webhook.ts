import { Resend } from 'resend';
import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: "Server Configuration Error: Missing Admin Key" });
  }

  try {
    const { data } = req.body;
    const capturedLists = data?.capturedLists || {};
    const now = new Date().toISOString();
    const updates = [];
    
    let goldStatus = null;
    let silverStatus = null;

    if (capturedLists.GoldStatus && capturedLists.GoldStatus.length > 0 && capturedLists.GoldStatus[0].text) {
        const text = capturedLists.GoldStatus[0].text.toLowerCase();
        const isAvailable = !text.includes("ausverkauft") && !text.includes("nicht verfügbar");
        goldStatus = isAvailable ? 'available' : 'sold_out';
        updates.push({ key: 'status_gold', value: goldStatus, updated_at: now });
        console.log(`Updated Gold: ${goldStatus}`);
    }

    if (capturedLists.SilverStatus && capturedLists.SilverStatus.length > 0 && capturedLists.SilverStatus[0].text) {
        const text = capturedLists.SilverStatus[0].text.toLowerCase();
        const isAvailable = !text.includes("ausverkauft") && !text.includes("nicht verfügbar");
        silverStatus = isAvailable ? 'available' : 'sold_out';
        updates.push({ key: 'status_silver', value: silverStatus, updated_at: now });
        console.log(`Updated Silver: ${silverStatus}`);
    }

    updates.push({ key: 'last_checked', value: now, updated_at: now });
    await supabase.from('system_settings').upsert(updates);

    const triggerGold = goldStatus === 'available';
    const triggerSilver = silverStatus === 'available';

    if (!triggerGold && !triggerSilver) {
       return res.status(200).json({ message: 'Status updated. No alarms needed.' });
    }

    let productName = "";
    let link = "";
    if (triggerGold && triggerSilver) {
        productName = "Gold & Silver";
        link = "https://tickets.mackinternational.de/de/ticket/resortpass-gold";
    } else if (triggerGold) {
        productName = "Gold";
        link = "https://tickets.mackinternational.de/de/ticket/resortpass-gold";
    } else if (triggerSilver) {
        productName = "Silver";
        link = "https://tickets.mackinternational.de/de/ticket/resortpass-silver";
    }

    const { data: subscriptions } = await supabase.from('subscriptions').select('user_id').eq('status', 'active');
    if (!subscriptions || subscriptions.length === 0) return res.status(200).json({ message: 'No active subscribers.' });

    const userIds = subscriptions.map(s => s.user_id);
    const { data: profiles } = await supabase.from('profiles').select('*').in('id', userIds);

    if (!profiles) return res.status(200).json({ message: 'No profiles found.' });

    let resend;
    if (process.env.RESEND_API_KEY) resend = new Resend(process.env.RESEND_API_KEY);
    let twilioClient;
    if (process.env.TWILIO_ACCOUNT_SID) twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    for (const user of profiles) {
        const targetEmail = user.notification_email || user.email;
        if (user.email_enabled !== false && targetEmail && resend) {
            try {
                await resend.emails.send({
                    from: 'ResortPass Alarm <alarm@resortpassalarm.com>',
                    to: targetEmail,
                    subject: `🚨 ResortPass ${productName} VERFÜGBAR!`,
                    html: `<h1>ALARM!</h1><p>Der <strong>ResortPass ${productName}</strong> ist verfügbar!</p><p><a href="${link}">ZUM SHOP</a></p>`
                });
            } catch (e) { console.error(e); }
        }
        if (user.sms_enabled && user.phone && twilioClient) {
            try {
                await twilioClient.messages.create({
                    body: `🚨 ALARM: ResortPass ${productName} ist VERFÜGBAR! Schnell: ${link}`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: user.phone,
                });
            } catch (e) { console.error(e); }
        }
    }

    res.status(200).json({ success: true, message: `Alarms sent for ${productName}` });
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}