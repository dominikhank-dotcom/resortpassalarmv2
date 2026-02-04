
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import twilio from 'twilio';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { type, status, userId } = req.body;
  const { data: user } = await supabase.from('profiles').select('role').eq('id', userId).single();
  if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Unauthorized' });

  try {
      const now = new Date().toISOString();
      
      // 1. Get previous state
      const key = type === 'gold' ? 'status_gold' : 'status_silver';
      const { data: oldSetting } = await supabase.from('system_settings').select('value').eq('key', key).single();
      const previousValue = oldSetting?.value || 'sold_out';

      // 2. Update DB
      await supabase.from('system_settings').upsert({ key, value: status, updated_at: now });
      await supabase.from('system_settings').upsert({ key: 'last_checked', value: now, updated_at: now });

      // 3. Throttling Logic
      // Only send alarms if status changes to available
      const shouldNotify = status === 'available' && previousValue === 'sold_out';

      if (shouldNotify) {
          const { data: subs } = await supabase.from('subscriptions').select('user_id').eq('status', 'active');
            
          if (subs && subs.length > 0) {
              const userIds = [...new Set(subs.map(s => s.user_id))];
              const { data: profiles } = await supabase.from('profiles').select('id, email, notification_email, first_name, email_enabled, sms_enabled, phone, notify_gold, notify_silver').in('id', userIds);
              
              let resend; if (process.env.RESEND_API_KEY) resend = new Resend(process.env.RESEND_API_KEY);
              let twilioClient; if (process.env.TWILIO_ACCOUNT_SID) twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
              
              const productName = type === 'gold' ? 'ResortPass Gold' : 'ResortPass Silver';
              const { data: urlSetting } = await supabase.from('system_settings').select('value').eq('key', type === 'gold' ? 'url_gold' : 'url_silver').single();
              const link = urlSetting?.value || `https://tickets.mackinternational.de/de/ticket/resortpass-${type}`;

              if (resend) {
                  const emailUsers = (profiles || []).filter(p => (p.notification_email || p.email) && p.email_enabled !== false && (type === 'gold' ? p.notify_gold !== false : p.notify_silver !== false));
                  const emailPayloads = emailUsers.map(p => ({
                      from: 'ResortPass Alarm <support@resortpassalarm.com>',
                      to: p.notification_email || p.email,
                      subject: `🚨 ${productName} VERFÜGBAR! SCHNELL SEIN!`,
                      html: `<h1>ALARM STUFE ROT!</h1><p>Hallo ${p.first_name || 'Fan'},</p><p>Soeben wurden Kontingente für <strong>${productName}</strong> gefunden!</p><p>Die "Wellen" sind oft nur wenige Minuten offen.</p><a href="${link}" style="background-color: #00305e; color: white; padding: 15px 25px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;">ZUM TICKET SHOP</a>`
                  }));
                  for (let i = 0; i < emailPayloads.length; i += 100) await resend.batch.send(emailPayloads.slice(i, i + 100));
              }

              if (twilioClient) {
                  const smsUsers = (profiles || []).filter(p => p.sms_enabled && p.phone && (type === 'gold' ? p.notify_gold !== false : p.notify_silver !== false));
                  for (const p of smsUsers) {
                      try {
                          await twilioClient.messages.create({ body: `🚨 ALARM: ${productName} ist VERFÜGBAR! Schnell: ${link}`, to: p.phone, messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID });
                      } catch (e) {}
                  }
              }
          }
      }
      return res.status(200).json({ success: true, notified: shouldNotify });
  } catch (error: any) { 
      return res.status(500).json({ error: error.message }); 
  }
}
