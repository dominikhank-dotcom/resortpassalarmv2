
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import twilio from 'twilio';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

// Helper for delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
      
      let logs: any[] = [];

      if (status === 'available') {
          const { data: subs } = await supabase
            .from('subscriptions')
            .select('user_id')
            .in('status', ['active', 'trialing', 'Active', 'Trialing']);
            
          if (subs && subs.length > 0) {
              stats.found_subs = subs.length;
              const userIds = [...new Set(subs.map(s => s.user_id))];
              
              const { data: profiles } = await supabase
                .from('profiles')
                .select('id, email, notification_email, first_name, email_enabled, sms_enabled, phone')
                .in('id', userIds);
              
              stats.found_profiles = profiles?.length || 0;

              let resend; 
              if (process.env.RESEND_API_KEY) resend = new Resend(process.env.RESEND_API_KEY);
              
              let twilioClient; 
              let messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
              if (process.env.TWILIO_ACCOUNT_SID) twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
              
              const productName = type === 'gold' ? 'ResortPass Gold' : 'ResortPass Silver';
              
              const { data: goldUrlSetting } = await supabase.from('system_settings').select('value').eq('key', 'url_gold').single();
              const { data: silverUrlSetting } = await supabase.from('system_settings').select('value').eq('key', 'url_silver').single();
              
              const link = type === 'gold' 
                ? (goldUrlSetting?.value || "https://tickets.mackinternational.de/de/ticket/resortpass-gold")
                : (silverUrlSetting?.value || "https://tickets.mackinternational.de/de/ticket/resortpass-silver");

              // --- EMAIL BATCH SENDING (Resend Batch API) ---
              const validProfilesForEmail = (profiles || []).filter(p => {
                  // Fallback: If profile email is missing, try using notification_email or skip
                  const targetEmail = p.notification_email || p.email;
                  const hasEmail = !!targetEmail;
                  const enabled = p.email_enabled !== false;
                  
                  if (!hasEmail) {
                      stats.skipped_no_email++;
                      logs.push({ email: 'unknown', id: p.id, status: 'SKIPPED', reason: 'No Email' });
                  } else if (!enabled) {
                      stats.skipped_disabled++;
                      logs.push({ email: targetEmail, id: p.id, status: 'SKIPPED', reason: 'Disabled' });
                  }
                  return hasEmail && enabled;
              });

              if (resend && validProfilesForEmail.length > 0) {
                  const BATCH_SIZE = 100; // Resend Batch Limit
                  
                  for (let i = 0; i < validProfilesForEmail.length; i += BATCH_SIZE) {
                      const chunk = validProfilesForEmail.slice(i, i + BATCH_SIZE);
                      
                      const emailPayloads = chunk.map(p => ({
                          from: 'ResortPass Alarm <alarm@resortpassalarm.com>',
                          to: p.notification_email || p.email,
                          subject: `🚨 ${productName} VERFÜGBAR! SCHNELL SEIN!`,
                          html: `
                            <h1 style="color: #d97706;">ALARM STUFE ROT!</h1>
                            <p>Hallo ${p.first_name || 'Fan'},</p>
                            <p>Unser System hat soeben freie Kontingente für <strong>${productName}</strong> gefunden!</p>
                            <p>Die "Wellen" sind oft nur wenige Minuten offen. Handele sofort!</p>
                            <a href="${link}" style="background-color: #00305e; color: white; padding: 15px 25px; text-decoration: none; font-weight: bold; font-size: 18px; border-radius: 5px; display: inline-block; margin: 10px 0;">ZUM TICKET SHOP</a>
                            <p>Oder kopiere diesen Link: ${link}</p>
                            <p>Viel Erfolg!<br>Dein Wächter</p>
                          `
                      }));

                      try {
                          const { data, error } = await resend.batch.send(emailPayloads);
                          
                          if (error) {
                              throw error;
                          }
                          
                          stats.sent += chunk.length;
                          chunk.forEach(p => logs.push({ email: p.notification_email || p.email, id: p.id, status: 'SENT', type: 'Email (Batch)' }));
                          
                      } catch (e: any) {
                          console.error("Batch Email Error:", e);
                          stats.errors += chunk.length;
                          chunk.forEach(p => logs.push({ email: p.notification_email || p.email, id: p.id, status: 'ERROR', reason: e.message || 'Batch Failed' }));
                      }
                  }
              }

              // --- SMS BATCH SENDING (High Concurrency for Twilio) ---
              if (twilioClient) {
                  const smsProfiles = (profiles || []).filter(p => p.sms_enabled && p.phone);
                  const SMS_BATCH_SIZE = 50; // Higher concurrency for Twilio
                  
                  // Load SMS Template from DB
                  const templateId = type === 'gold' ? 'sms_gold_alarm' : 'sms_silver_alarm';
                  const { data: smsTemplate } = await supabase
                      .from('email_templates')
                      .select('body')
                      .eq('id', templateId)
                      .single();
                  
                  let smsBody = smsTemplate?.body || `🚨 ALARM: ${productName} ist VERFÜGBAR! Schnell: {link}`;
                  smsBody = smsBody.replace('{link}', link);

                  for (let i = 0; i < smsProfiles.length; i += SMS_BATCH_SIZE) {
                      const chunk = smsProfiles.slice(i, i + SMS_BATCH_SIZE);
                      await Promise.all(chunk.map(async (p) => {
                          try {
                              const msgConfig: any = { 
                                  body: smsBody, 
                                  to: p.phone 
                              };
                              // Use Messaging Service if available, else fallback to single number
                              if (messagingServiceSid) {
                                  msgConfig.messagingServiceSid = messagingServiceSid;
                              } else {
                                  msgConfig.from = process.env.TWILIO_PHONE_NUMBER;
                              }

                              await twilioClient.messages.create(msgConfig);
                          } catch (e: any) {
                              console.error(`SMS failed for ${p.id}`, e);
                          }
                      }));
                  }
              }
          }
      }
      return res.status(200).json({ success: true, stats, logs });
  } catch (error: any) { 
      return res.status(500).json({ error: error.message }); 
  }
}
