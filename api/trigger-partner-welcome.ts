import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default async function handler(req: any, res: any) {
  console.log(">>> PARTNER WELCOME API START");
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { userId, email, firstName } = req.body;
  console.log(`>>> Payload: userId=${userId}, email=${email}`);

  if (!userId || !email) return res.status(400).json({ error: 'Missing userId or email' });

  try {
    // 1. Wait for Profile to exist (Race condition handling for DB Trigger)
    let profileExists = false;
    let attempts = 0;
    const maxAttempts = 10; // Increased to 10 (approx 8 seconds)

    while (attempts < maxAttempts) {
        const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('id', userId);
        
        if (count && count > 0) {
            profileExists = true;
            break;
        }
        
        console.log(`>>> Waiting for partner profile... Attempt ${attempts + 1}/${maxAttempts}`);
        await sleep(800);
        attempts++;
    }

    if (!profileExists) {
        console.warn(">>> WARNING: Partner Profile not found after retries. Proceeding to try lock anyway.");
    }

    // 2. ATOMIC LOCK: Try to set partner_welcome_sent = true where it is NOT TRUE (handles false and null)
    let lockAcquired = false;

    const { data: updatedRows, error: updateError } = await supabase
        .from('profiles')
        .update({ partner_welcome_sent: true })
        .eq('id', userId)
        .neq('partner_welcome_sent', true) // More robust than .is('x', false) for NULLs
        .select();

    if (updateError) {
        console.error(">>> DB UPDATE ERROR:", updateError);
        
        // Handle Schema Cache Error (PGRST204) or Undefined Column (42703) gracefully
        // This happens if the column was just added and PostgREST cache hasn't refreshed yet
        if (updateError.code === 'PGRST204' || updateError.code === '42703' || updateError.message?.includes('schema cache')) {
            console.warn(">>> SCHEMA CACHE ISSUE: Column 'partner_welcome_sent' not visible yet. Using FALLBACK MODE (Sending email without lock).");
            lockAcquired = true; // Force send
        } else {
            throw updateError;
        }
    } else {
        // Normal behavior: If rows updated, we won the race. If 0, it was already sent.
        if (updatedRows && updatedRows.length > 0) {
            lockAcquired = true;
        } else {
            console.log(">>> SKIPPED: Email already sent or profile missing (Lock failed).");
            return res.status(200).json({ success: true, message: 'Already sent or profile missing' });
        }
    }

    if (lockAcquired) {
        console.log(">>> LOCK ACQUIRED (or Fallback). Sending email...");

        // 3. Send Email
        if (process.env.RESEND_API_KEY) {
            const resend = new Resend(process.env.RESEND_API_KEY);
            // Ensure origin is valid or fallback
            const origin = req.headers.origin || 'https://resortpassalarm.com';
            const dashboardLink = `${origin}/affiliate`;
            
            const { data, error } = await resend.emails.send({
                from: 'ResortPass Alarm <alarm@resortpassalarm.com>',
                to: email,
                subject: 'Willkommen im Partnerprogramm',
                html: `<h1>Hallo ${firstName || 'Partner'},</h1>
                <p>Wir freuen uns sehr, dich als Partner begrüßen zu dürfen.</p>
                <p>Du verdienst ab sofort 50% an jedem vermittelten Nutzer. Deinen persönlichen Empfehlungslink findest du in deinem Dashboard.</p>
                <p><a href="${dashboardLink}">Zum Partner-Dashboard</a></p>
                <p>Auf gute Zusammenarbeit!</p>`
            });

            if (error) {
                console.error(">>> RESEND ERROR:", error);
                return res.status(500).json({ error: error.message });
            }
            console.log(">>> EMAIL SENT. ID:", data?.id);
        } else {
            console.warn(">>> RESEND KEY MISSING");
        }
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error(">>> CRITICAL ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
}