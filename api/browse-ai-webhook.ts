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
  try {
      console.log("Body Payload:", JSON.stringify(req.body, null, 2));
  } catch (e) {
      console.log("Could not stringify body:", e);
  }

  // --- SECURITY CHECK ---
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("FATAL: SUPABASE_SERVICE_ROLE_KEY is missing!");
      return res.status(500).json({ error: "Server Configuration Error: Missing Admin Key" });
  }

  try {
    const { event, data } = req.body;

    // --- DATA PARSING & FALLBACKS ---
    let goldAvailable = false;
    let silverAvailable = false;
    
    // Check Gold
    if (data?.capturedLists?.GoldStatus?.[0]?.text) {
        const text = data.capturedLists.GoldStatus[0].text.toLowerCase();
        goldAvailable = !text.includes("ausverkauft") && !text.includes("nicht verfügbar");
        console.log(`Parsed Gold Status: ${text} => Available: ${goldAvailable}`);
    } else {
        console.warn("GoldStatus list not found in payload. Defaulting to FALSE.");
    }

    // Check Silver
    if (data?.capturedLists?.SilverStatus?.[0]?.text) {
        const text = data.capturedLists.SilverStatus[0].text.toLowerCase();
        silverAvailable = !text.includes("ausverkauft") && !text.includes("nicht verfügbar");
        console.log(`Parsed Silver Status: ${text} => Available: ${silverAvailable}`);
    } else {
        console.warn("SilverStatus list not found in payload. Defaulting to FALSE.");
    }

    // --- 1. ALWAYS SAVE STATUS TO DATABASE (For Landing Page) ---
    const now = new Date().toISOString();
    
    const updates = [
        { key: 'status_gold', value: goldAvailable ? 'available' : 'sold_out', updated_at: now },
        { key: 'status_silver', value: silverAvailable ? 'available' : 'sold_out', updated_at: now },
        { key: 'last_checked', value: now, updated_at: now }
    ];

    const { error: dbError } = await supabase.from('system_settings').upsert(updates);

    if (dbError) {
        console.error("Supabase Write Error:", dbError);
    } else {
        console.log("Database updated successfully.");
    }

    // --- 2. ALARM LOGIC ---
    // Only proceed if available and status changed to available (implied by this webhook usually triggering on change)
    if (!goldAvailable && !silverAvailable) {
       return res.status(200).json({ message: 'Nothing available, status updated, no alarms sent.' });
    }

    // Get Subscribers with ACTIVE status
    const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('status', 'active');
    
    if (!subscriptions || subscriptions.length === 0) {
        return res.status(200).json({ message: 'Items available but no active subscribers.' });
    }

    // Fetch Profile Settings for these users
    const userIds = subscriptions.map(s => s.user_id);
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, first_name, email_enabled, sms_enabled, phone, notification_email')
        .in('id', userIds);

    if (!profiles) return res.status(200).json({ message: 'No profiles found.' });

    console.log(`Alarm Triggered! Processing ${profiles.length} subscribers.`);

    // Init Providers (Lazy load to prevent crash if env vars missing)
    let resend;
    if (process.env.RESEND_API_KEY) resend = new Resend(process.env.RESEND_API_KEY);

    let twilioClient;
    if (process.env.TWILIO_ACCOUNT_SID) {
        twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }

    const results = [];

    // Loop through users and send based on preferences
    for (const user of profiles) {
        const targetEmail = user.notification_email || user.email;
        const productName = goldAvailable && silverAvailable ? "Gold & Silver" : goldAvailable ? "Gold" : "Silver";
        const link = "https://tickets.mackinternational.de/de/ticket/resortpass-gold"; // Simplified for MVP
        
        // EMAIL
        if (user.email_enabled !== false && targetEmail && resend) {
            try {
                await resend.emails.send({
                    from: 'ResortPass Alarm <alarm@resortpassalarm.com>',
                    to: targetEmail,
                    subject: `🚨 ResortPass ${productName} VERFÜGBAR! Schnell sein!`,
                    html: `
                      <h1>ALARM STUFE ROT!</h1>
                      <p>Hallo ${user.first_name || 'Fan'},</p>
                      <p>Der <strong>ResortPass ${productName}</strong> ist verfügbar!</p>
                      <p><a href="${link}">ZUM SHOP</a></p>
                    `
                });
                results.push({ type: 'email', user: user.id, status: 'sent' });
            } catch (e) {
                console.error(`Failed to email user ${user.id}:`, e);
            }
        }

        // SMS
        if (user.sms_enabled && user.phone && twilioClient) {
            try {
                await twilioClient.messages.create({
                    body: `🚨 ALARM: ResortPass ist VERFÜGBAR! Schnell zugreifen: ${link}`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: user.phone,
                });
                results.push({ type: 'sms', user: user.id, status: 'sent' });
            } catch (e) {
                console.error(`Failed to sms user ${user.id}:`, e);
            }
        }
    }

    res.status(200).json({ success: true, message: "Status updated and alarms sent based on preferences", log: results });

  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}