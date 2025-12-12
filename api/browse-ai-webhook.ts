
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

    console.log(`>>> Searching in Lists: [${listKeys.join(', ')}] AND Texts: [${textKeys.join(', ')}]`);

    // 1. Check Captured TEXTS (Single Element Captures)
    for (const name of preferredNames) {
        // Exact Match
        if (texts[name]) return { found: true, type: 'text', value: texts[name] };
        // Case Insensitive
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
    if (textKeys.length > 0) {
        console.log(`>>> Fallback: Using first text key '${textKeys[0]}'`);
        return { found: true, type: 'text', value: texts[textKeys[0]] };
    }
    if (listKeys.length > 0) {
        console.log(`>>> Fallback: Using first list key '${listKeys[0]}'`);
        return { found: true, type: 'list', value: lists[listKeys[0]] };
    }

    return { found: false, type: 'none', value: null };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  console.log(">>> WEBHOOK RECEIVED FROM BROWSE.AI");

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("FATAL: SUPABASE_SERVICE_ROLE_KEY is missing!");
      return res.status(500).json({ error: "Server Configuration Error" });
  }

  try {
    let payload = req.body;

    // --- PAYLOAD NORMALIZATION ---
    if (payload.task && typeof payload.task === 'object') {
        console.log(">>> Payload wrapped in 'task' property. Unwrapping...");
        payload = payload.task;
    } else if (payload.data && typeof payload.data === 'object') {
        console.log(">>> Payload wrapped in 'data' property. Unwrapping...");
        payload = payload.data;
    }

    // --- DEBUGGING ---
    const robotId = payload?.robotId;
    const runStatus = payload?.status; // 'successful', 'failed'
    
    // ERROR ANALYSIS
    const errorObj = payload?.error;
    const errorMessage = errorObj?.message?.toLowerCase() || "";
    const errorCode = errorObj?.code || "";

    console.log(`>>> Incoming Robot ID: ${robotId}`);
    console.log(`>>> Run Status: ${runStatus}`);
    
    if (runStatus === 'failed') {
        console.log(`>>> Failure Reason: [${errorCode}] ${errorMessage}`);
    }
    
    if (!robotId) {
        console.error(">>> ERROR: Robot ID is missing after unwrapping. Raw Body Snippet:", JSON.stringify(req.body).substring(0, 300));
        return res.status(400).json({ error: 'Invalid Payload: robotId missing' });
    }
    
    // INTELLIGENT ERROR HANDLING
    // We want to ignore TECHNICAL errors (site down), but trigger alarm on CONTENT errors (element missing = text removed = available)
    const isTechnicalError = 
        errorMessage.includes("navigation timeout") || 
        errorMessage.includes("network") ||
        errorMessage.includes("captcha") ||
        errorMessage.includes("access denied") ||
        errorMessage.includes("http error") ||
        errorMessage.includes("dns resolution");

    if (runStatus !== 'successful') {
        if (isTechnicalError) {
            console.warn(">>> Robot run failed due to TECHNICAL ERROR (Timeout/Network). Ignoring to prevent false alarm.");
            return res.status(200).json({ message: 'Technical failure ignored.' });
        } else {
            console.log(">>> Robot run failed likely due to SELECTOR/CONTENT MISSING. This usually means the 'Sold Out' text is gone. Proceeding as AVAILABLE.");
            // We do NOT return here. We let the logic below handle the "Missing Content" case.
        }
    }

    // Load configured IDs
    const GOLD_ID = process.env.BROWSE_AI_ROBOT_ID_GOLD;
    const SILVER_ID = process.env.BROWSE_AI_ROBOT_ID_SILVER;

    const now = new Date().toISOString();
    const updates = [];
    
    let goldStatus = null;
    let silverStatus = null;

    // === GOLD ROBOT LOGIC ===
    if (robotId === GOLD_ID) {
        console.log(">>> Processing GOLD Robot...");
        const content = getRobotContent(payload, ['GoldStatus', 'List1', 'StatusGold', 'Status']);
        
        if (!content.found) {
             // CASE 1: Nothing found
             if (runStatus === 'failed' && !isTechnicalError) {
                 // Robot failed to find the "Sold Out" element -> It's gone -> AVAILABLE!
                 console.log(">>> Gold Robot failed to find element (Selector Error). Text removed from site. Triggering Available!");
                 goldStatus = 'available';
             } else {
                 // Robot succeeded but found nothing (Empty List glitch) OR Technical Error
                 console.log(">>> WARNING: Gold content missing (Success Empty OR Technical Fail). Assuming SOLD OUT.");
                 goldStatus = 'sold_out'; 
             }
        } else {
            let textToAnalyze = "";

            if (content.type === 'list') {
                 if (content.value.length === 0) {
                     // List exists but is empty -> Text removed -> Available
                     console.log(">>> Gold List is present but EMPTY. Triggering Available!");
                     goldStatus = 'available';
                 } else {
                     textToAnalyze = content.value[0].text;
                 }
            } else if (content.type === 'text') {
                 textToAnalyze = content.value; // Value is directly the string
            }

            // If we have text, analyze it
            if (goldStatus !== 'available' && textToAnalyze) {
                const text = textToAnalyze.toLowerCase().trim();
                console.log(`>>> Gold Text Found (${content.type}): "${text}"`);
                
                // Negative Match Check
                if (text.includes("leider ist dieses produkt") || text.includes("ausverkauft") || text.includes("nicht verfügbar")) {
                    goldStatus = 'sold_out';
                } else {
                    console.log(`>>> Gold Text does NOT contain negative keywords. Triggering Available!`);
                    goldStatus = 'available'; 
                }
            } else if (goldStatus !== 'available') {
                // Content found but text property empty?
                console.log(">>> Gold Content found but empty string. Triggering Available.");
                goldStatus = 'available';
            }
        }
        
        updates.push({ key: 'status_gold', value: goldStatus, updated_at: now });
    }

    // === SILVER ROBOT LOGIC ===
    if (robotId === SILVER_ID) {
        console.log(">>> Processing SILVER Robot...");
        const content = getRobotContent(payload, ['SilverStatus', 'List1', 'StatusSilver', 'Status']);
        
        if (!content.found) {
             if (runStatus === 'failed' && !isTechnicalError) {
                 console.log(">>> Silver Robot failed to find element. Triggering Available!");
                 silverStatus = 'available';
             } else {
                 console.log(">>> WARNING: Silver content missing. Assuming SOLD OUT.");
                 silverStatus = 'sold_out';
             }
        } else {
             let textToAnalyze = "";

             if (content.type === 'list') {
                  if (content.value.length === 0) {
                      console.log(">>> Silver List is EMPTY. Triggering Alarm!");
                      silverStatus = 'available';
                  } else {
                      textToAnalyze = content.value[0].text;
                  }
             } else if (content.type === 'text') {
                  textToAnalyze = content.value;
             }

             if (silverStatus !== 'available' && textToAnalyze) {
                 const text = textToAnalyze.toLowerCase().trim();
                 console.log(`>>> Silver Text Found (${content.type}): "${text}"`);
                 
                 if (text.includes("leider ist dieses produkt") || text.includes("ausverkauft") || text.includes("nicht verfügbar")) {
                     silverStatus = 'sold_out';
                 } else {
                     console.log(`>>> Silver Text does NOT contain negative keywords. Triggering Available!`);
                     silverStatus = 'available';
                 }
             } else if (silverStatus !== 'available') {
                 silverStatus = 'available';
             }
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
       console.log(">>> No availability detected. Done.");
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
