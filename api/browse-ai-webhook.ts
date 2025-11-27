import { Resend } from 'resend';
import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';

// Init Supabase for Backend with Service Role (Admin access to write settings)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// This webhook is called by Browse.ai when the robot finishes a task
// You configure this URL in Browse.ai: https://resortpassalarm.com/api/browse-ai-webhook

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
    // Try to find the lists. If they are missing, assume Sold Out (safe default)
    // but LOG the error so we can debug.
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
    // Use upsert to update if exists, insert if new
    const now = new Date().toISOString();
    
    const updates = [
        { key: 'status_gold', value: goldAvailable ? 'available' : 'sold_out', updated_at: now },
        { key: 'status_silver', value: silverAvailable ? 'available' : 'sold_out', updated_at: now },
        { key: 'last_checked', value: now, updated_at: now }
    ];

    const { error: dbError } = await supabase.from('system_settings').upsert(updates);

    if (dbError) {
        console.error("Supabase Write Error:", dbError);
        // Continue anyway to send alarms if needed, but this is bad
    } else {
        console.log("Database updated successfully.");
    }

    // --- 2. ALARM LOGIC ---
    if (!goldAvailable && !silverAvailable) {
       return res.status(200).json({ message: 'Nothing available, status updated, no alarms sent.' });
    }

    // Get Subscribers who want alerts (In a real scenario, filter by preference)
    // Here we just get all active paid subscriptions
    const { data: activeSubs } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('status', 'active');
    
    if (!activeSubs || activeSubs.length === 0) {
        return res.status(200).json({ message: 'Items available but no active subscribers.' });
    }

    // Fetch contact details for these users
    // For this MVP, we assume we just notify everyone.
    // In production, you would loop and use Resend/Twilio
    console.log(`Alarm Triggered! Found ${activeSubs.length} active subscribers to notify.`);

    // ... (Alarm logic omitted for brevity as focus is on status update)

    res.status(200).json({ success: true, message: "Status updated in DB" });

  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}