
import { Resend } from 'resend';
import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Helper to extract text from either Lists or Texts objects
function getRobotContent(payload, preferredNames = []) {
    const lists = payload.capturedLists || {};
    const texts = payload.capturedTexts || {};

    const listKeys = Object.keys(lists);
    const textKeys = Object.keys(texts);

    // 1. Check Captured TEXTS (Single Element Captures)
    for (const name of preferredNames) {
        if (texts[name]) return { found: true, type: 'text', value: texts[name] };
        const key = textKeys.find(k => k.toLowerCase() === name.toLowerCase());
        if (key) return { found: true, type: 'text', value: texts[key] };
    }

    // 2. Check Captured LISTS (List Captures)
    for (const name of preferredNames) {
        if (lists[name]) return { found: true, type: 'list', value: lists[name] };
        const key = listKeys.find(k => k.toLowerCase() === name.toLowerCase());
        if (key) return { found: true, type: 'list', value: lists[key] };
    }

    // 3. Fallback: Take the first available data
    if (textKeys.length > 0) return { found: true, type: 'text', value: texts[textKeys[0]] };
    if (listKeys.length > 0) return { found: true, type: 'list', value: lists[listKeys[0]] };

    return { found: false, type: 'none', value: null };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let payload = req.body;

    // --- PAYLOAD NORMALIZATION ---
    if (payload.task && typeof payload.task === 'object') payload = payload.task;
    else if (payload.data && typeof payload.data === 'object') payload = payload.data;

    const robotId = payload?.robotId;
    const runStatus = payload?.status; 
    
    if (!robotId) return res.status(400).json({ error: 'Invalid Payload: robotId missing' });
    
    const errorObj = payload?.error;
    const errorMessage = errorObj?.message?.toLowerCase() || "";
    const isTechnicalError = 
        errorMessage.includes("navigation timeout") || 
        errorMessage.includes("network") ||
        errorMessage.includes("captcha") ||
        errorMessage.includes("access denied");

    if (runStatus !== 'successful' && isTechnicalError) {
        console.warn(">>> Technical failure ignored.");
        return res.status(200).json({ message: 'Technical failure ignored.' });
    }

    // --- 1. LOAD CURRENT DB STATE (CRITICAL FOR THROTTLING) ---
    const { data: settings } = await supabase.from('system_settings').select('key, value');
    const oldGoldStatus = settings?.find(s => s.key === 'status_gold')?.value || 'sold_out';
    const oldSilverStatus = settings?.find(s => s.key === 'status_silver')?.value || 'sold_out';

    const GOLD_ID = process.env.BROWSE_AI_ROBOT_ID_GOLD;
    const SILVER_ID = process.env.BROWSE_AI_ROBOT_ID_SILVER;

    const now = new Date().toISOString();
    let newGoldStatus = oldGoldStatus;
    let newSilverStatus = oldSilverStatus;

    // === GOLD ROBOT LOGIC ===
    if (robotId === GOLD_ID) {
        const content = getRobotContent(payload, ['GoldStatus', 'StatusGold', 'Status']);
        if (!content.found) {
             newGoldStatus = (runStatus === 'failed') ? 'available' : 'sold_out';
        } else {
            let textToAnalyze = (content.type === 'list') ? (content.value[0]?.text || "") : content.value;
            const text = textToAnalyze.toLowerCase().trim();
            if (text.includes("ausverkauft") || text.includes("leider ist dieses produkt") || text.includes("nicht verfügbar")) {
                newGoldStatus = 'sold_out';
            } else {
                newGoldStatus = 'available';
            }
        }
        await supabase.from('system_settings').upsert({ key: 'status_gold', value: newGoldStatus, updated_at: now });
    }

    // === SILVER ROBOT LOGIC ===
    if (robotId === SILVER_ID) {
        const content = getRobotContent(payload, ['SilverStatus', 'StatusSilver', 'Status']);
        if (!content.found) {
             newSilverStatus = (runStatus === 'failed') ? 'available' : 'sold_out';
        } else {
             let textToAnalyze = (content.type === 'list') ? (content.value[0]?.text || "") : content.value;
             const text = textToAnalyze.toLowerCase().trim();
             if (text.includes("ausverkauft") || text.includes("leider ist dieses produkt") || text.includes("nicht verfügbar")) {
                 newSilverStatus = 'sold_out';
             } else {
                 newSilverStatus = 'available';
             }
        }
        await supabase.from('system_settings').upsert({ key: 'status_silver', value: newSilverStatus, updated_at: now });
    }

    await supabase.from('system_settings').upsert({ key: 'last_checked', value: now, updated_at: now });

    // --- 2. TRANSITION CHECK (THROTTLING) ---
    // Only trigger if it was sold_out and is now available
    const triggerGold = (newGoldStatus === 'available' && oldGoldStatus === 'sold_out');
    const triggerSilver = (newSilverStatus === 'available' && oldSilverStatus === 'sold_out');

    if (!triggerGold && !triggerSilver) {
       const reason = (newGoldStatus === 'available' || newSilverStatus === 'available') 
            ? "Pausiert: Bereits verfügbar und Kunden bereits alarmiert."
            : "Keine Kontingente gefunden.";
       console.log(`>>> ${reason}`);
       return res.status(200).json({ message: reason });
    }

    // --- 3. ALARM LOGIC ---
    console.log(">>> TRIGGERING ALARMS (State transition detected!)");
    
    const { data: goldUrlSetting } = await supabase.from('system_settings').select('value').eq('key', 'url_gold').single();
    const { data: silverUrlSetting } = await supabase.from('system_settings').select('value').eq('key', 'url_silver').single();
    const goldLink = goldUrlSetting?.value || "https://tickets.mackinternational.de/de/ticket/resortpass-gold";
    const silverLink = silverUrlSetting?.value || "https://tickets.mackinternational.de/de/ticket/resortpass-silver";

    const { data: subscriptions } = await supabase.from('subscriptions').select('user_id').eq('status', 'active');
    if (!subscriptions || subscriptions.length === 0) return res.status(200).json({ message: 'No active subscribers.' });

    const userIds = [...new Set(subscriptions.map(s => s.user_id))];
    const { data: profiles } = await supabase.from('profiles').select('id, email, first_name, email_enabled, sms_enabled, phone, notification_email, notify_gold, notify_silver').in('id', userIds);
    if (!profiles) return res.status(200).json({ message: 'No profiles found.' });

    let resend; if (process.env.RESEND_API_KEY) resend = new Resend(process.env.RESEND_API_KEY);
    let twilioClient; if (process.env.TWILIO_ACCOUNT_SID) twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    if (resend) {
        const emailUsers = profiles.filter(u => {
            const matchGold = triggerGold && u.notify_gold !== false;
            const matchSilver = triggerSilver && u.notify_silver !== false;
            return (u.notification_email || u.email) && u.email_enabled !== false && (matchGold || matchSilver);
        });

        const payloads = emailUsers.map(user => {
            const wantsGold = triggerGold && user.notify_gold !== false;
            const wantsSilver = triggerSilver && user.notify_silver !== false;
            const pName = (wantsGold && wantsSilver) ? "Gold & Silver" : (wantsGold ? "Gold" : "Silver");
            const link = wantsGold ? goldLink : silverLink;
            return {
                from: 'ResortPass Alarm <support@resortpassalarm.com>',
                to: user.notification_email || user.email,
                subject: `🚨 ResortPass ${pName} VERFÜGBAR! SCHNELL SEIN!`,
                html: `<h1>ALARM STUFE ROT!</h1><p>Hallo ${user.first_name || 'Fan'},</p><p>Unser System hat soeben freie Kontingente für <strong>ResortPass ${pName}</strong> gefunden!</p><p>Die "Wellen" sind oft nur wenige Minuten offen.</p><a href="${link}" style="background-color: #00305e; color: white; padding: 15px 25px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;">ZUM TICKET SHOP</a><p>Viel Erfolg!</p>`
            };
        });
        for (let i = 0; i < payloads.length; i += 100) await resend.batch.send(payloads.slice(i, i + 100));
    }

    if (twilioClient) {
        const smsUsers = profiles.filter(u => u.sms_enabled && u.phone && ((triggerGold && u.notify_gold !== false) || (triggerSilver && u.notify_silver !== false)));
        for (const user of smsUsers) {
            try {
                const wantsGold = triggerGold && user.notify_gold !== false;
                const link = wantsGold ? goldLink : silverLink;
                const body = `🚨 ResortPass ${wantsGold ? 'Gold' : 'Silver'} ALARM! Verfügbar unter: ${link}`;
                await twilioClient.messages.create({ body, to: user.phone, messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID });
            } catch (e) {}
        }
    }

    res.status(200).json({ success: true, message: 'Alarms processed for state transition.' });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    res.status(200).json({ error: error.message });
  }
}
