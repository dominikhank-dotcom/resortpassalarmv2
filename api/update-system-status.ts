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

      let stats = { 
          found_subs: 0, 
          found_profiles: 0, 
          sent: 0, 
          errors: 0, 
          skipped_disabled: 0, 
          skipped_no_email: 0 
      };

      if (status === 'available') {
          // 1. Get Active Subscriptions
          const { data: subs } = await supabase
            .from('subscriptions')
            .select('user_id')
            .in('status', ['active', 'trialing', 'Active']);
            
          if (subs && subs.length > 0) {
              stats.found_subs = subs.length;
              
              // Get unique User IDs
              const userIds = [...new Set(subs.map(s => s.user_id))];
              
              const { data: profiles } = await supabase.from('profiles').select('*').in('id', userIds);
              
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

              // BATCH PROCESSING HELPER
              const processBatch = async (batch: any[]) => {
                  const promises = batch.map(async (p) => {
                      const targetEmail = p.notification_email || p.email;
                      const firstName = p.first_name || 'Fan';
                      let sent = false;

                      // Check if email exists
                      if (!targetEmail) {
                          stats.skipped_no_email++;
                          console.log(`Skipping user ${p.id}: No email found`);
                          return;
                      }

                      // Check if notifications are enabled
                      if (p.email_enabled === false) {
                          stats.skipped_disabled++;
                          console.log(`Skipping user ${p.id}: Email disabled in settings`);
                          return;
                      }

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
                              sent = true;
                          } catch (e) {
                              console.error(`Email send failed for ${p.id}`, e);
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
                              sent = true;
                          } catch (e) {
                              console.error(`SMS send failed for ${p.id}`, e);
                              stats.errors++;
                          }
                      }
                      
                      if(sent) stats.sent++;
                  });
                  await Promise.all(promises);
              };

              // Process in chunks of 10 (Safe batch size)
              const BATCH_SIZE = 10;
              const allProfiles = profiles || [];
              for (let i = 0; i < allProfiles.length; i += BATCH_SIZE) {
                  const batch = allProfiles.slice(i, i + BATCH_SIZE);
                  await processBatch(batch);
                  // Brief pause to allow API rate limits to recover
                  if (i + BATCH_SIZE < allProfiles.length) {
                      await new Promise(resolve => setTimeout(resolve, 500));
                  }
              }
          }
      }
      return res.status(200).json({ success: true, stats });
  } catch (error: any) { return res.status(500).json({ error: error.message }); }
}