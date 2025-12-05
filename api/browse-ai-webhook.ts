
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
      console.error("FATAL: SUPABASE_SERVICE_ROLE_KEY is missing!");
      return res.status(500).json({ error: "Server Configuration Error" });
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
    }

    if (capturedLists.SilverStatus && capturedLists.SilverStatus.length > 0 && capturedLists.SilverStatus[0].text) {
        const text = capturedLists.SilverStatus[0].text.toLowerCase();
        const isAvailable = !text.includes("ausverkauft") && !text.includes("nicht verfügbar");
        silverStatus = isAvailable ? 'available' : 'sold_out';
        updates.push({ key: 'status_silver', value: silverStatus, updated_at: now });
    }

    updates.push({ key: 'last_checked', value: now, updated_at: now });
    await supabase.from('system_settings').upsert(updates);

    const triggerGold = goldStatus === 'available';
    const triggerSilver = silverStatus === 'available';

    if (!triggerGold && !triggerSilver) {
       return res.status(200).json({ message: 'Status updated. No new availability.' });
    }

    let productName = "";
    const { data: goldUrlSetting } = await supabase.from('system_settings').select('value').eq('key', 'url_gold').single();
    const { data: silverUrlSetting } = await supabase.from('system_settings').select('value').eq('key', 'url_silver').single();
    
    let link = "";
    const goldLink = goldUrlSetting?.value || "https://tickets.mackinternational.de/de/ticket/resortpass-gold";
    const silverLink = silverUrlSetting?.value || "https://tickets.mackinternational.de/de/ticket/resortpass-silver";

    // Determine Logic: Which Product?
    let smsTemplateId = 'sms_gold_alarm'; // Default
    if (triggerGold && triggerSilver) {
        productName = "Gold & Silver";
        link = goldLink; // Prioritize Gold Link
        smsTemplateId = 'sms_gold_alarm'; // Prioritize Gold Msg
    } else if (triggerGold) {
        productName = "Gold";
        link = goldLink;
        smsTemplateId = 'sms_gold_alarm';
    } else if (triggerSilver) {
        productName = "Silver";
        link = silverLink;
        smsTemplateId = 'sms_silver_alarm';
    }

    const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('user_id')
        .in('status', ['active', 'trialing', 'Active', 'Trialing']);
    
    if (!subscriptions || subscriptions.length === 0) {
        return res.status(200).json({ message: 'Items available but no active subscribers.' });
    }

    const userIds = [...new Set(subscriptions.map(s => s.user_id))];
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, first_name, email_enabled, sms_enabled, phone, notification_email')
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

    // --- EMAIL BATCHING (Resend) ---
    if (resend) {
        const validProfiles = profiles.filter(user => {
            const hasEmail = !!(user.notification_email || user.email);
            const enabled = user.email_enabled !== false;
            return hasEmail && enabled;
        });

        const BATCH_SIZE = 100;
        
        for (let i = 0; i < validProfiles.length; i += BATCH_SIZE) {
            const batch = validProfiles.slice(i, i + BATCH_SIZE);
            const payloads = batch.map(user => ({
                from: 'ResortPass Alarm <alarm@resortpassalarm.com>',
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
            }));

            try {
                const { error } = await resend.batch.send(payloads);
                if (error) throw error;
                stats.sent += batch.length;
            } catch (e) {
                console.error(`Batch email failed:`, e);
                stats.failed += batch.length;
                logs.push({ error: e.message, batchIndex: i });
            }
        }
    }

    // --- SMS SENDING ---
    if (twilioClient) {
        const smsUsers = profiles.filter(u => u.sms_enabled && u.phone);
        const SMS_BATCH_SIZE = 50;
        
        // Fetch specific SMS template from DB
        const { data: smsTemplate } = await supabase
            .from('email_templates')
            .select('body')
            .eq('id', smsTemplateId)
            .single();
        
        let smsBody = smsTemplate?.body || `🚨 ALARM: ResortPass ${productName} ist VERFÜGBAR! Schnell: {link}`;
        smsBody = smsBody.replace('{link}', link);
        
        for (let i = 0; i < smsUsers.length; i += SMS_BATCH_SIZE) {
            const batch = smsUsers.slice(i, i + SMS_BATCH_SIZE);
            await Promise.all(batch.map(async (user) => {
                try {
                    const msgConfig: any = {
                        body: smsBody,
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

    res.status(200).json({ success: true, message: `Alarms sent for ${productName}`, stats, logs });

  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(200).json({ error: 'Internal Error (Handled)', details: error.message });
  }
}
