import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { userId, email, firstName } = req.body;
  if (!userId || !email) return res.status(400).json({ error: 'Missing userId or email' });

  try {
    // 1. Wait for Profile to exist (Race condition handling for DB Trigger)
    let profileExists = false;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
        const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('id', userId);
        
        if (count && count > 0) {
            profileExists = true;
            break;
        }
        
        await sleep(800); // Wait 800ms
        attempts++;
    }

    if (!profileExists) {
        console.warn("Partner Profile not found after retries. Proceeding anyway to attempt lock.");
    }

    // 2. ATOMIC LOCK: Try to set partner_welcome_sent = true where it is false
    const { data: updatedRows } = await supabase
        .from('profiles')
        .update({ partner_welcome_sent: true })
        .eq('id', userId)
        .is('partner_welcome_sent', false)
        .select();

    if (!updatedRows || updatedRows.length === 0) {
        return res.status(200).json({ success: true, message: 'Already sent or profile missing' });
    }

    // 3. Send Email
    if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const dashboardLink = `${req.headers.origin}/affiliate`;
        
        await resend.emails.send({
            from: 'ResortPass Alarm <alarm@resortpassalarm.com>',
            to: email,
            subject: 'Willkommen im Partnerprogramm',
            html: `<h1>Hallo ${firstName || 'Partner'},</h1>
            <p>Wir freuen uns sehr, dich als Partner begrüßen zu dürfen.</p>
            <p>Du verdienst ab sofort 50% an jedem vermittelten Nutzer. Deinen persönlichen Empfehlungslink findest du in deinem Dashboard.</p>
            <p><a href="${dashboardLink}">Zum Partner-Dashboard</a></p>
            <p>Auf gute Zusammenarbeit!</p>`
        });
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Partner Welcome Error:", error);
    return res.status(500).json({ error: error.message });
  }
}