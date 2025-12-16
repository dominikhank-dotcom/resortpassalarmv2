
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: any, res: any) {
  // Simple auth check via header or cron secret if needed
  // if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) ...

  try {
    // 1. Calculate time window: Registered between 24 and 26 hours ago
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    const twentySixHoursAgo = new Date(now.getTime() - (26 * 60 * 60 * 1000));

    console.log(`Cron: Abandoned Cart check for users created between ${twentySixHoursAgo.toISOString()} and ${twentyFourHoursAgo.toISOString()}`);

    // 2. Find eligible users
    // Criteria: Role=CUSTOMER, Created in window, abandoned_cart_mail_sent=false
    const { data: users, error } = await supabase
        .from('profiles')
        .select('id, email, first_name')
        .eq('role', 'CUSTOMER')
        .is('abandoned_cart_mail_sent', false) 
        .gte('created_at', twentySixHoursAgo.toISOString())
        .lte('created_at', twentyFourHoursAgo.toISOString());

    if (error) throw error;
    if (!users || users.length === 0) {
        return res.status(200).json({ success: true, message: 'No eligible users found.' });
    }

    // 3. Check for Active Subscriptions
    // We only want users who DO NOT have an active subscription
    const userIds = users.map(u => u.id);
    const { data: subs } = await supabase
        .from('subscriptions')
        .select('user_id')
        .in('user_id', userIds)
        .in('status', ['active', 'trialing']);
    
    const activeUserIds = new Set(subs?.map(s => s.user_id) || []);
    const targetUsers = users.filter(u => !activeUserIds.has(u.id));

    if (targetUsers.length === 0) {
        return res.status(200).json({ success: true, message: 'All new users have subscriptions. Good job!' });
    }

    // 4. Send Emails
    const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
    let sentCount = 0;

    // Load Template
    const { data: template } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', 'cust_abandoned_cart')
        .single();
    
    // Check if template exists and is enabled
    if (!template || template.is_enabled === false) {
        return res.status(200).json({ success: true, message: 'Template disabled or missing.' });
    }

    for (const user of targetUsers) {
        if (!user.email || !resend) continue;

        // Atomic update to prevent double sending
        const { error: updateErr } = await supabase
            .from('profiles')
            .update({ abandoned_cart_mail_sent: true })
            .eq('id', user.id);
        
        if (!updateErr) {
            let subject = template.subject || 'Achtung: Dein Wächter ist noch inaktiv ⚠️';
            let body = template.body || '<p>Bitte schließe dein Abo ab.</p>';
            
            body = body.replace(/{firstName}/g, user.first_name || 'Fan');
            body = body.replace(/{dashboardLink}/g, 'https://resortpassalarm.com/dashboard');
            subject = subject.replace(/{firstName}/g, user.first_name || 'Fan');

            try {
                await resend.emails.send({
                    from: 'ResortPass Alarm <support@resortpassalarm.com>',
                    to: user.email,
                    subject: subject,
                    html: body
                });
                sentCount++;
            } catch (e) {
                console.error(`Failed to send abandoned mail to ${user.email}`, e);
            }
        }
    }

    return res.status(200).json({ success: true, sent: sentCount, targets: targetUsers.length });

  } catch (error: any) {
    console.error("Abandoned Cart Cron Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
