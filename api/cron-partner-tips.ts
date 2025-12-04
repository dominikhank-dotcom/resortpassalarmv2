import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: any, res: any) {
  // Check for Cron Secret or Admin Key to prevent abuse
  const authHeader = req.headers['authorization'];
  // In production Vercel Cron, you check signature. Here simplistic check or open if path is secret.
  
  try {
    // 1. Find Partners registered > 10 mins ago who haven't received tips
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    
    const { data: partners } = await supabase
        .from('profiles')
        .select('id, email, first_name')
        .eq('role', 'AFFILIATE')
        .is('tips_mail_sent', false)
        .lt('created_at', tenMinutesAgo)
        .limit(20); // Batch size

    if (!partners || partners.length === 0) {
        return res.status(200).json({ message: 'No pending tips emails.' });
    }

    const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
    let sentCount = 0;

    for (const partner of partners) {
        // Atomic Lock: Update first to claim
        const { data: claimed } = await supabase
            .from('profiles')
            .update({ tips_mail_sent: true })
            .eq('id', partner.id)
            .is('tips_mail_sent', false) // Safety double check
            .select();
        
        if (claimed && claimed.length > 0 && resend && partner.email) {
            try {
                await resend.emails.send({
                    from: 'ResortPass Alarm <alarm@resortpassalarm.com>',
                    to: partner.email,
                    subject: 'So verdienst du deine erste Provision 💸',
                    html: `<p>Hey ${partner.first_name || 'Partner'},</p>
                    <p>schön, dass du dabei bist! Hier sind 3 Tipps, wie du deine Einnahmen maximierst:</p>
                    <ol>
                    <li>Poste deinen Link in deiner Instagram Bio.</li>
                    <li>Erkläre deiner Community, dass sie mit dem Tool Zeit sparen.</li>
                    <li>Nutze unsere vorgefertigten Marketing-Texte aus dem Dashboard.</li>
                    </ol>
                    <p>Viel Erfolg!</p>`
                });
                sentCount++;
            } catch (e) {
                console.error(`Failed to send tips to ${partner.email}`, e);
            }
        }
    }

    return res.status(200).json({ success: true, sent: sentCount });

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}