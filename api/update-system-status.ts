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
      await supabase.from('system_settings').upsert({ key: type === 'gold' ? 'status_gold' : 'status_silver', value: status, updated_at: now });
      await supabase.from('system_settings').upsert({ key: 'last_checked', value: now, updated_at: now });

      if (status === 'available') {
          const { data: subs } = await supabase.from('subscriptions').select('user_id').eq('status', 'active');
          if (subs && subs.length > 0) {
              const { data: profiles } = await supabase.from('profiles').select('*').in('id', subs.map(s => s.user_id));
              let resend; if (process.env.RESEND_API_KEY) resend = new Resend(process.env.RESEND_API_KEY);
              let twilioClient; if (process.env.TWILIO_ACCOUNT_SID) twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
              
              for (const p of profiles || []) {
                  const targetEmail = p.notification_email || p.email;
                  if (p.email_enabled !== false && targetEmail && resend) {
                      try { await resend.emails.send({ from: 'ResortPass Alarm <alarm@resortpassalarm.com>', to: targetEmail, subject: 'ALARM!', html: `<p>Verfügbar!</p>` }); } catch (e) {}
                  }
                  if (p.sms_enabled && p.phone && twilioClient) {
                      try { await twilioClient.messages.create({ body: 'Verfügbar!', from: process.env.TWILIO_PHONE_NUMBER, to: p.phone }); } catch (e) {}
                  }
              }
          }
      }
      return res.status(200).json({ success: true });
  } catch (error: any) { return res.status(500).json({ error: error.message }); }
}