import { Resend } from 'resend';
import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';

// Init Supabase for Backend with Service Role (Admin access to write settings)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// This webhook is called by Browse.ai when the robot finishes a task
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // --- DEBUG LOGGING ---
  console.log("Browse.ai Webhook Received!");
  
  // --- SECURITY CHECK ---
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("FATAL: SUPABASE_SERVICE_ROLE_KEY is missing!");
      return res.status(500).json({ error: "Server Configuration Error: Missing Admin Key" });
  }

  try {
    const { data } = req.body;
    
    // Check if we have captured lists
    const capturedLists = data?.capturedLists || {};
    
    const now = new Date().toISOString();
    const updates = [];
    
    // Logic for selective updates
    let goldStatus = null; // null means "no update received in this payload"
    let silverStatus = null;

    // 1. Process GOLD if present in this specific webhook call
    if (capturedLists.GoldStatus && capturedLists.GoldStatus.length > 0 && capturedLists.GoldStatus[0].text) {
        const text = capturedLists.GoldStatus[0].text.toLowerCase();
        // Logic: If text contains "ausverkauft" -> sold_out, else available
        const isAvailable = !text.includes("ausverkauft") && !text.includes("nicht verfügbar");
        goldStatus = isAvailable ? 'available' : 'sold_out';
        
        updates.push({ key: 'status_gold', value: goldStatus, updated_at: now });
        console.log(`Updated Gold: ${goldStatus}`);
    }

    // 2. Process SILVER if present in this specific webhook call
    if (capturedLists.SilverStatus && capturedLists.SilverStatus.length > 0 && capturedLists.SilverStatus[0].text) {
        const text = capturedLists.SilverStatus[0].text.toLowerCase();
        const isAvailable = !text.includes("ausverkauft") && !text.includes("nicht verfügbar");
        silverStatus = isAvailable ? 'available' : 'sold_out';
        
        updates.push({ key: 'status_silver', value: silverStatus, updated_at: now });
        console.log(`Updated Silver: ${silverStatus}`);
    }

    // Always update timestamp to show system is alive
    updates.push({ key: 'last_checked', value: now, updated_at: now });

    // Write to DB
    const { error: dbError } = await supabase.from('system_settings').upsert(updates);

    if (dbError) {
        console.error("Supabase Write Error:", dbError);
        return res.status(500).json({ error: "DB Error" });
    }

    // --- ALARM LOGIC ---
    // Only send alarm if something turned AVAILABLE that we actually checked in THIS run
    const triggerGold = goldStatus === 'available';
    const triggerSilver = silverStatus === 'available';

    if (!triggerGold && !triggerSilver) {
       return res.status(200).json({ message: 'Status updated. No new availability found.' });
    }

    // Determine what to announce
    let productName = "";
    let link = "";
    
    // Fetch dynamic links from DB or use defaults
    const { data: goldUrlSetting } = await supabase.from('system_settings').select('value').eq('key', 'url_gold').single();
    const { data: silverUrlSetting } = await supabase.from('system_settings').select('value').eq('key', 'url_silver').single();
    
    const goldLink = goldUrlSetting?.value || "https://tickets.mackinternational.de/de/ticket/resortpass-gold";
    const silverLink = silverUrlSetting?.value || "https://tickets.mackinternational.de/de/ticket/resortpass-silver";

    if (triggerGold && triggerSilver) {
        productName = "Gold & Silver";
        link = goldLink; // Prioritize Gold link if both available
    } else if (triggerGold) {
        productName = "Gold";
        link = goldLink;
    } else if (triggerSilver) {
        productName = "Silver";
        link = silverLink;
    }

    // Get Subscribers with ACTIVE status (Case Insensitive)
    const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('user_id')
        .in('status', ['active', 'trialing', 'Active']);
    
    if (!subscriptions || subscriptions.length === 0) {
        return res.status(200).json({ message: 'Items available but no active subscribers.' });
    }

    // Fetch Profile Settings for these users
    const userIds = [...new Set(subscriptions.map(s => s.user_id))];
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, first_name, email_enabled, sms_enabled, phone, notification_email')
        .in('id', userIds);

    if (!profiles) return res.status(200).json({ message: 'No profiles found.' });

    console.log(`Alarm Triggered for ${productName}! Processing ${profiles.length} subscribers.`);

    // Init Providers (Lazy load)
    let resend;
    if (process.env.RESEND_API_KEY) resend = new Resend(process.env.RESEND_API_KEY);

    let twilioClient;
    if (process.env.TWILIO_ACCOUNT_SID) {
        twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }

    const results = [];
    const stats = { sent: 0, failed: 0, skipped: 0 };

    // BATCH PROCESSING
    const processBatch = async (batch) => {
        const promises = batch.map(async (user) => {
            const targetEmail = user.notification_email || user.email;
            const firstName = user.first_name || 'Fan';
            
            if (!targetEmail) {
                stats.skipped++;
                results.push({ user: user.id, status: 'skipped', reason: 'no_email' });
                return;
            }

            if (user.email_enabled === false) {
                stats.skipped++;
                results.push({ user: user.id, status: 'skipped', reason: 'disabled' });
                return;
            }
            
            // EMAIL
            if (resend) {
                try {
                    await resend.emails.send({
                        from: 'ResortPass Alarm <alarm@resortpassalarm.com>',
                        to: targetEmail,
                        subject: `🚨 ResortPass ${productName} VERFÜGBAR! SCHNELL SEIN!`,
                        html: `
                          <h1 style="color: #d97706;">ALARM STUFE ROT!</h1>
                          <p>Hallo ${firstName},</p>
                          <p>Unser System hat soeben freie Kontingente für <strong>ResortPass ${productName}</strong> gefunden!</p>
                          <p>Die "Wellen" sind oft nur wenige Minuten offen. Handele sofort!</p>
                          <a href="${link}" style="background-color: #00305e; color: white; padding: 15px 25px; text-decoration: none; font-weight: bold; font-size: 18px; border-radius: 5px; display: inline-block; margin: 10px 0;">ZUM TICKET SHOP</a>
                          <p>Oder kopiere diesen Link: ${link}</p>
                          <p>Viel Erfolg!<br>Dein Wächter</p>
                        `
                    });
                    results.push({ type: 'email', user: user.id, status: 'sent' });
                    stats.sent++;
                } catch (e) {
                    console.error(`Failed to email user ${user.id}:`, e);
                    results.push({ type: 'email', user: user.id, status: 'failed', error: e.message });
                    stats.failed++;
                }
            }

            // SMS
            if (user.sms_enabled && user.phone && twilioClient) {
                try {
                    await twilioClient.messages.create({
                        body: `🚨 ALARM: ResortPass ${productName} ist VERFÜGBAR! Schnell: ${link}`,
                        from: process.env.TWILIO_PHONE_NUMBER,
                        to: user.phone,
                    });
                    results.push({ type: 'sms', user: user.id, status: 'sent' });
                } catch (e) {
                    console.error(`Failed to sms user ${user.id}:`, e);
                    results.push({ type: 'sms', user: user.id, status: 'failed', error: e.message });
                }
            }
        });
        
        await Promise.all(promises);
    };

    // Execute in batches of 10
    const BATCH_SIZE = 10;
    for (let i = 0; i < profiles.length; i += BATCH_SIZE) {
        const batch = profiles.slice(i, i + BATCH_SIZE);
        await processBatch(batch);
        // Throttle slightly
        if (i + BATCH_SIZE < profiles.length) await new Promise(r => setTimeout(r, 500));
    }

    res.status(200).json({ success: true, message: `Status updated. Alarms sent for ${productName}`, stats, log: results });

  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}