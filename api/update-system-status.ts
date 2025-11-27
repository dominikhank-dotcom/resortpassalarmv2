import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import twilio from 'twilio';

// Init Supabase with Service Role Key to bypass RLS for writing system settings
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, status, userId } = req.body;

  if (!type || !status || !userId) {
      return res.status(400).json({ error: 'Missing type, status or userId' });
  }

  // Verify Admin Role
  const { data: user } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  
  if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
      const now = new Date().toISOString();
      const key = type === 'gold' ? 'status_gold' : 'status_silver';

      // Update status AND last_checked
      await supabase
        .from('system_settings')
        .upsert({ key: key, value: status, updated_at: now });
        
      await supabase
        .from('system_settings')
        .upsert({ key: 'last_checked', value: now, updated_at: now });

      // --- SEND ALARM IF STATUS IS 'AVAILABLE' ---
      if (status === 'available') {
          // 1. Get active subscriptions
          const { data: subs } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('status', 'active');
          
          if (subs && subs.length > 0) {
              const userIds = subs.map(s => s.user_id);
              
              // 2. Fetch User Details & Preferences
              const { data: profiles } = await supabase
                .from('profiles')
                .select('id, email, first_name, email_enabled, sms_enabled, phone, notification_email')
                .in('id', userIds);
              
              if (profiles && profiles.length > 0) {
                  // Init Services
                  let resend;
                  if (process.env.RESEND_API_KEY) resend = new Resend(process.env.RESEND_API_KEY);

                  let twilioClient;
                  if (process.env.TWILIO_ACCOUNT_SID) {
                      twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
                  }

                  const product = type === 'gold' ? 'ResortPass Gold' : 'ResortPass Silver';
                  const shopLink = type === 'gold' 
                    ? "https://tickets.mackinternational.de/de/ticket/resortpass-gold"
                    : "https://tickets.mackinternational.de/de/ticket/resortpass-silver";

                  // Loop users and send
                  for (const p of profiles) {
                      // EMAIL
                      const targetEmail = p.notification_email || p.email;
                      if (p.email_enabled !== false && targetEmail && resend) {
                          try {
                              await resend.emails.send({
                                from: 'ResortPass Alarm <alarm@resortpassalarm.com>',
                                to: targetEmail,
                                subject: `🚨 ALARM: ${product} ist VERFÜGBAR!`,
                                html: `
                                  <h1>Schnell sein!</h1>
                                  <p>Hallo ${p.first_name},</p>
                                  <p>Der <strong>${product}</strong> wurde soeben als verfügbar markiert!</p>
                                  <a href="${shopLink}" style="background-color: #00305e; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; margin-top: 10px;">Zum Shop</a>
                                `
                              });
                          } catch (e) {
                              console.error(`Email fail for ${p.id}:`, e);
                          }
                      }

                      // SMS
                      if (p.sms_enabled && p.phone && twilioClient) {
                          try {
                              await twilioClient.messages.create({
                                  body: `🚨 ${product} VERFÜGBAR! Schnell: ${shopLink}`,
                                  from: process.env.TWILIO_PHONE_NUMBER,
                                  to: p.phone,
                              });
                          } catch (e) {
                              console.error(`SMS fail for ${p.id}:`, e);
                          }
                      }
                  }
              }
          }
      }

      return res.status(200).json({ success: true });
  } catch (error: any) {
      return res.status(500).json({ error: error.message });
  }
}