
import { Resend } from 'resend';
import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  console.log(">>> WEBHOOK RECEIVED FROM BROWSE.AI");

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("FATAL: SUPABASE_SERVICE_ROLE_KEY is missing!");
      return res.status(500).json({ error: "Server Configuration Error" });
  }

  try {
    // FIX 1: Browse.AI sendet Daten manchmal direkt, manchmal in 'data' wrapper
    let payload = req.body;
    
    // Check if we need to unwrap
    if (payload.data && !payload.robotId) {
        console.log(">>> Payload wrapped in 'data' property. Unwrapping...");
        payload = payload.data;
    }

    // --- DEBUGGING ---
    const robotId = payload?.robotId;
    const runStatus = payload?.status; // 'successful', 'failed'
    const capturedLists = payload?.capturedLists || {};
    
    // Log keys to confirm structure matches
    console.log(`>>> Incoming Robot ID: ${robotId}`);
    console.log(`>>> Run Status: ${runStatus}`);
    
    // If still undefined, log the raw body to see what's going on
    if (!robotId) {
        console.error(">>> ERROR: Robot ID is missing. Raw Body Snippet:", JSON.stringify(req.body).substring(0, 200));
        return res.status(400).json({ error: 'Invalid Payload: robotId missing' });
    }
    
    // Safety check: If run failed, do not trigger alarm (could be 404/timeout)
    if (runStatus !== 'successful') {
        console.warn(">>> Robot run failed (BrowseAI Error). Ignoring.");
        return res.status(200).json({ message: 'Run failed, ignored.' });
    }

    // Load configured IDs to know who is who
    const GOLD_ID = process.env.BROWSE_AI_ROBOT_ID_GOLD;
    const SILVER_ID = process.env.BROWSE_AI_ROBOT_ID_SILVER;

    const now = new Date().toISOString();
    const updates = [];
    
    let goldStatus = null;
    let silverStatus = null;

    // --- LOGIC: NEGATIVE MATCH ---
    // Wir suchen nach "Ausverkauft"-Wörtern.
    // Finden wir sie -> Ausverkauft.
    // Finden wir sie NICHT (egal ob anderer Text oder gar kein Text) -> Verfügbar!

    // === GOLD ROBOT LOGIC ===
    if (robotId === GOLD_ID) {
        console.log(">>> Processing GOLD Robot...");
        const list = capturedLists.GoldStatus || capturedLists.List1 || []; 
        const textItem = list.length > 0 ? list[0].text : null;
        
        if (textItem) {
            const text = textItem.toLowerCase().trim();
            console.log(`>>> Gold Text Found: "${text}"`);
            
            // Negative Match Check
            if (text.includes("leider ist dieses produkt") || text.includes("ausverkauft") || text.includes("nicht verfügbar")) {
                goldStatus = 'sold_out';
            } else {
                // Text ist da, aber NICHT "Ausverkauft" (z.B. "Warenkorb") -> ALARM
                console.log(`>>> Gold Text does NOT contain negative keywords. Triggering Available!`);
                goldStatus = 'available'; 
            }
        } else {
            // LISTE LEER -> Der "Ausverkauft"-Satz ist verschwunden -> ALARM!
            console.log(">>> Gold List is EMPTY. 'Sold Out' text missing. Triggering Alarm!");
            goldStatus = 'available';
        }
        
        updates.push({ key: 'status_gold', value: goldStatus, updated_at: now });
    }

    // === SILVER ROBOT LOGIC ===
    if (robotId === SILVER_ID) {
        console.log(">>> Processing SILVER Robot...");
        const list = capturedLists.SilverStatus || capturedLists.List1 || [];
        const textItem = list.length > 0 ? list[0].text : null;
        
        if (textItem) {
            const text = textItem.toLowerCase().trim();
            console.log(`>>> Silver Text Found: "${text}"`);
            
            if (text.includes("leider ist dieses produkt") || text.includes("ausverkauft") || text.includes("nicht verfügbar")) {
                silverStatus = 'sold_out';
            } else {
                console.log(`>>> Silver Text does NOT contain negative keywords. Triggering Available!`);
                silverStatus = 'available';
            }
        } else {
            console.log(">>> Silver List is EMPTY. 'Sold Out' text missing. Triggering Alarm!");
            silverStatus = 'available';
        }

        updates.push({ key: 'status_silver', value: silverStatus, updated_at: now });
    }

    // Always update last_checked
    updates.push({ key: 'last_checked', value: now, updated_at: now });
    
    const { error: dbError } = await supabase.from('system_settings').upsert(updates);
    if (dbError) {
        console.error(">>> DB ERROR updating settings:", dbError);
    } else {
        console.log(`>>> DB Updated. Gold: ${goldStatus}, Silver: ${silverStatus}`);
    }

    const triggerGold = goldStatus === 'available';
    const triggerSilver = silverStatus === 'available';

    if (!triggerGold && !triggerSilver) {
       console.log(">>> No availability detected (Both Sold Out). Done.");
       return res.status(200).json({ message: 'Status updated. No new availability.' });
    }

    // --- ALARM LOGIC (EMAILS & SMS) ---
    console.log(">>> STARTING ALARM SEQUENCE...");
    
    const { data: goldUrlSetting } = await supabase.from('system_settings').select('value').eq('key', 'url_gold').single();
    const { data: silverUrlSetting } = await supabase.from('system_settings').select('value').eq('key', 'url_silver').single();
    
    const goldLink = goldUrlSetting?.value || "https://tickets.mackinternational.de/de/ticket/resortpass-gold";
    const silverLink = silverUrlSetting?.value || "https://tickets.mackinternational.de/de/ticket/resortpass-silver";

    const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('user_id')
        .in('status', ['active', 'trialing', 'Active', 'Trialing']);
    
    if (!subscriptions || subscriptions.length === 0) {
        console.log(">>> Availability found but no active subs.");
        return res.status(200).json({ message: 'Items available but no active subscribers.' });
    }

    const userIds = [...new Set(subscriptions.map(s => s.user_id))];
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, first_name, email_enabled, sms_enabled, phone, notification_email, notify_gold, notify_silver')
        .in('id', userIds);

    if (!profiles) return res.status(200).json({ message: 'No profiles found.' });

    let resend;
    if (process.env.RESEND_API_KEY) resend = new Resend(process.env.RESEND_API_KEY);

    let twilioClient;
    let messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
    if (process.env.TWILIO_ACCOUNT_SID) {
        twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }

    const logs = [];
    const stats = { sent: 0, failed: 0, skipped: 0 };

    // --- PREPARE EMAILS ---
    if (resend) {
        const validProfiles = profiles.filter(user => {
            const hasEmail = !!(user.notification_email || user.email);
            const enabled = user.email_enabled !== false;
            
            // Should user receive ANY alert?
            const matchGold = triggerGold && (user.notify_gold !== false);
            const matchSilver = triggerSilver && (user.notify_silver !== false);
            
            return hasEmail && enabled && (matchGold || matchSilver);
        });

        const payloads = validProfiles.map(user => {
            const matchGold = triggerGold && (user.notify_gold !== false);
            const matchSilver = triggerSilver && (user.notify_silver !== false);
            
            let productName = "";
            let link = "";
            
            if (matchGold && matchSilver) {
                productName = "Gold & Silver";
                link = goldLink; // Prioritize Gold link
            } else if (matchGold) {
                productName = "Gold";
                link = goldLink;
            } else {
                productName = "Silver";
                link = silverLink;
            }

            return {
                from: 'ResortPass Alarm <support@resortpassalarm.com>',
                to: user.notification_email || user.email,
                subject: `🚨 ResortPass ${productName} VERFÜGBAR! SCHNELL SEIN!`,
                html: `
                  <h1 style="color: #d97706;">ALARM STUFE ROT!</h1>
                  <p>Hallo ${user.first_name || 'Fan'},</p>
                  <p>Unser System hat soeben freie Kontingente für <strong>ResortPass ${productName}</strong> gefunden!</p>
                  <p>Die "Wellen" sind oft nur wenige Minuten offen. Handele sofort!</p>
                  <a href="${link}" style="background-color: #00305e; color: white; padding: 15px 25px; text-decoration: none; font-weight: bold; font-size: 18px; border-radius: 5px; display: inline-block; margin: 10px 0;">ZUM TICKET SHOP</a>
                  <p>Oder kopiere diesen Link: ${link}</p>
                  <p>Viel Erfolg!<br>Dein Wächter</p>
                `
            };
        });

        const BATCH_SIZE = 100;
        
        for (let i = 0; i < payloads.length; i += BATCH_SIZE) {
            const batch = payloads.slice(i, i + BATCH_SIZE);
            try {
                const { error } = await resend.batch.send(batch);
                if (error) throw error;
                stats.sent += batch.length;
            } catch (e) {
                console.error(`Batch email failed:`, e);
                stats.failed += batch.length;
                logs.push({ error: e.message, batchIndex: i });
            }
        }
    }

    // --- PREPARE SMS ---
    if (twilioClient) {
        const smsUsers = profiles.filter(user => {
            const enabled = user.sms_enabled && user.phone;
            const matchGold = triggerGold && (user.notify_gold !== false);
            const matchSilver = triggerSilver && (user.notify_silver !== false);
            return enabled && (matchGold || matchSilver);
        });

        // Pre-fetch templates
        const { data: tGold } = await supabase.from('email_templates').select('body').eq('id', 'sms_gold_alarm').single();
        const { data: tSilver } = await supabase.from('email_templates').select('body').eq('id', 'sms_silver_alarm').single();
        
        const SMS_BATCH_SIZE = 50;
        
        for (let i = 0; i < smsUsers.length; i += SMS_BATCH_SIZE) {
            const batch = smsUsers.slice(i, i + SMS_BATCH_SIZE);
            await Promise.all(batch.map(async (user) => {
                try {
                    const matchGold = triggerGold && (user.notify_gold !== false);
                    const matchSilver = triggerSilver && (user.notify_silver !== false);
                    
                    let body = "";
                    let link = "";
                    
                    if (matchGold) {
                        body = tGold?.body || "🚨 Gold ALARM! ResortPass verfügbar! Schnell: {link}";
                        link = goldLink;
                    } else {
                        // Only Silver matched
                        body = tSilver?.body || "🚨 Silver ALARM! ResortPass verfügbar! Schnell: {link}";
                        link = silverLink;
                    }
                    
                    body = body.replace('{link}', link);

                    const msgConfig: any = {
                        body: body,
                        to: user.phone
                    };
                    if (messagingServiceSid) {
                        msgConfig.messagingServiceSid = messagingServiceSid;
                    } else {
                        msgConfig.from = process.env.TWILIO_PHONE_NUMBER;
                    }

                    await twilioClient.messages.create(msgConfig);
                } catch (e) {
                    console.error(`Failed to sms user ${user.id}:`, e);
                }
            }));
        }
    }

    console.log(`>>> ALARM CYCLE COMPLETE. Emails sent: ${stats.sent}`);
    res.status(200).json({ success: true, message: `Alarms processed. Emails: ${stats.sent}`, stats, logs });

  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(200).json({ error: 'Internal Error (Handled)', details: error.message });
  }
}
