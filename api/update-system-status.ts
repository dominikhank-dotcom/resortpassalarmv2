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
      // Update System Settings
      await supabase.from('system_settings').upsert({ key: type === 'gold' ? 'status_gold' : 'status_silver', value: status, updated_at: now });
      await supabase.from('system_settings').upsert({ key: 'last_checked', value: now, updated_at: now });

      let stats = { 
          found_subs: 0, 
          found_profiles: 0, 
          sent: 0, 
          errors: 0, 
          skipped_disabled: 0, 
          skipped_no_email: 0 
      };
      
      let logs: any[] = [];

      if (status === 'available') {
          // 1. Get Active Subscriptions (Case Insensitive Check done by OR logic in application if needed, or rely on consistent DB status)
          // Using .in() with various casings to be safe
          const { data: subs } = await supabase
            .from('subscriptions')
            .select('user_id, status')
            .in('status', ['active', 'trialing', 'Active', 'Trialing']);
            
          if (subs && subs.length > 0) {
              stats.found_subs = subs.length;
              
              // Get unique User IDs
              const userIds = [...new Set(subs.map(s => s.user_id))];
              
              const { data: profiles } = await supabase
                .from('profiles')
                .select('id, email, notification_email, first_name, email_enabled, sms_enabled, phone')
                .in('id', userIds);
              
              stats.found_profiles = profiles?.length || 0;

              let resend; 
              if (process.env.RESEND_API_KEY) resend = new Resend(process.env.RESEND_API_KEY);
              
              let twilioClient; 
              if (process.env.TWILIO_ACCOUNT_SID) twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
              
              const productName = type === 'gold' ? 'ResortPass Gold' : 'ResortPass Silver';
              
              const { data: goldUrlSetting } = await supabase.from('system_settings').select('value').eq('key', 'url_gold').single();
              const { data: silverUrlSetting } = await supabase.from('system_settings').select('value').eq('key', 'url_silver').single();
              
              const link = type === 'gold' 
                ? (goldUrlSetting?.value || "https://tickets.mackinternational.de/de/ticket/resortpass-gold")
                : (silverUrlSetting?.value || "https://tickets.mackinternational.de/de/ticket/resortpass-silver");

              // HELPER: Send Single Batch
              const processBatch = async (batch: any[]) => {
                  const promises = batch.map(async (p) => {
                      const targetEmail = p.notification_email || p.email;
                      const firstName = p.first_name || 'Fan';
                      
                      // LOGIC: Check why we might skip
                      if (!targetEmail) {
                          stats.skipped_no_email++;
                          logs.push({ email: 'unknown', id: p.id, status: 'SKIPPED', reason: 'No Email in Profile' });
                          return;
                      }

                      if (p.email_enabled === false) {
                          stats.skipped_disabled++;
                          logs.push({ email: targetEmail, id: p.id, status: 'SKIPPED', reason: 'Email Disabled by User' });
                          return;
                      }

                      let sentEmail = false;
                      let sentSms = false;

                      // Send Email
                      if (resend) {
                          try { 
                              await resend.emails.send({ 
                                  from: 'ResortPass Alarm <alarm@resortpassalarm.com>', 
                                  to: targetEmail, 
                                  subject: `🚨 ${productName} VERFÜGBAR! SCHNELL SEIN!`, 
                                  html: `
                                    <h1 style="color: #d97706;">ALARM STUFE ROT!</h1>
                                    <p>Hallo ${firstName},</p>
                                    <p>Unser System hat soeben freie Kontingente für <strong>${productName}</strong> gefunden!</p>
                                    <p>Die "Wellen" sind oft nur wenige Minuten offen. Handele sofort!</p>
                                    <a href="${link}" style="background-color: #00305e; color: white; padding: 15px 25px; text-decoration: none; font-weight: bold; font-size: 18px; border-radius: 5px; display: inline-block; margin: 10px 0;">ZUM TICKET SHOP</a>
                                    <p>Oder kopiere diesen Link: ${link}</p>
                                    <p>Viel Erfolg!<br>Dein Wächter</p>
                                  ` 
                              }); 
                              sentEmail = true;
                          } catch (e: any) {
                              console.error(`Email send failed for ${p.id}`, e);
                              logs.push({ email: targetEmail, id: p.id, status: 'ERROR', reason: `Resend: ${e.message}` });
                              stats.errors++;
                          }
                      }

                      // Send SMS
                      if (p.sms_enabled && p.phone && twilioClient) {
                          try { 
                              await twilioClient.messages.create({ 
                                  body: `🚨 ALARM: ${productName} ist VERFÜGBAR! Schnell: ${link}`, 
                                  from: process.env.TWILIO_PHONE_NUMBER, 
                                  to: p.phone 
                              }); 
                              sentSms = true;
                          } catch (e: any) {
                              console.error(`SMS send failed for ${p.id}`, e);
                              // We don't fail the whole log if SMS fails but Email worked
                          }
                      }
                      
                      if(sentEmail) {
                          stats.sent++;
                          logs.push({ email: targetEmail, id: p.id, status: 'SENT', type: sentSms ? 'Email+SMS' : 'Email' });
                      }
                  });
                  await Promise.all(promises);
              };

              // Process in SMALLER chunks (5) with DELAY to prevent rate limits
              const BATCH_SIZE = 5;
              const allProfiles = profiles || [];
              
              for (let i = 0; i < allProfiles.length; i += BATCH_SIZE) {
                  const batch = allProfiles.slice(i, i + BATCH_SIZE);
                  await processBatch(batch);
                  
                  // 1 Second Delay between batches
                  if (i + BATCH_SIZE < allProfiles.length) {
                      await new Promise(resolve => setTimeout(resolve, 1000));
                  }
              }
          }
      }
      return res.status(200).json({ success: true, stats, logs });
  } catch (error: any) { 
      return res.status(500).json({ error: error.message }); 
  }
}