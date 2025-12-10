
import { Buffer } from 'buffer';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Vercel config to allow raw body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Native Buffer helper (Global Buffer is safer in recent Node versions)
async function getRawBody(readable: any): Promise<Buffer> {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

// Helper to parse address line 1 into street and house number
function parseAddressLine(line1: string) {
    if (!line1) return { street: '', houseNumber: '' };
    // Try to match standard format: "Main Street 123" or "Main Street 123a"
    const match = line1.match(/^(.*?)\s+(\d+[a-zA-Z]?(-\d+)?)$/);
    if (match) return { street: match[1], houseNumber: match[2] };
    return { street: line1, houseNumber: '' };
}

// Helper to fetch template from DB
async function getTemplate(id: string) {
    const { data } = await supabase.from('email_templates').select('*').eq('id', id).single();
    return data;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  const sig = req.headers['stripe-signature'];
  let event;

  // 1. Validate Signature (Must be fast)
  try {
    const buf = await getRawBody(req);
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error(`Webhook Signature Error: ${err.message}`);
    // If signature is wrong, we MUST return 400.
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 2. Define the Heavy Lifting Logic
  const processEvent = async () => {
      // Initialize Resend
      let resend: Resend | null = null;
      if (process.env.RESEND_API_KEY) {
          resend = new Resend(process.env.RESEND_API_KEY);
      } else {
          console.warn("Webhook: RESEND_API_KEY missing. Emails will not be sent.");
      }

      console.log(`>>> Webhook Processing Event: ${event.type} [ID: ${event.id}]`);

      // --- HANDLE NEW SUBSCRIPTION (ACTIVATION) ---
      if (event.type === 'checkout.session.completed') {
          const session = event.data.object;
          let userId = session.client_reference_id;

          // Fallback: Try to find user by email if client_reference_id is missing
          if (!userId && session.customer_email) {
              const { data: user } = await supabase.from('profiles').select('id').eq('email', session.customer_email).single();
              if (user) userId = user.id;
          }

          if (userId) {
              let currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
              let amount = 0;

              if (session.subscription) {
                  try {
                      const subDetails = await stripe.subscriptions.retrieve(session.subscription as string);
                      currentPeriodEnd = new Date(subDetails.current_period_end * 1000).toISOString();
                      amount = session.amount_total ? session.amount_total / 100 : 0;
                  } catch (e) {
                      console.error("Error fetching sub details", e);
                  }
              }

              // Update DB
              try {
                  const { data: existingSub } = await supabase.from('subscriptions').select('id').eq('user_id', userId).maybeSingle();
                  const subData = {
                      user_id: userId,
                      stripe_customer_id: session.customer as string,
                      stripe_subscription_id: session.subscription as string,
                      status: 'active',
                      plan_type: 'premium',
                      current_period_end: currentPeriodEnd,
                      subscription_price: amount
                  };

                  if (existingSub) await supabase.from('subscriptions').update(subData).eq('id', existingSub.id);
                  else await supabase.from('subscriptions').insert(subData);
              } catch (dbErr) { console.error("DB Update Error:", dbErr); }

              // Send Activation Email using Template
              if (resend) {
                  try {
                      // Retrieve fresh profile to get name and correct email
                      const { data: profile } = await supabase.from('profiles').select('email, first_name').eq('id', userId).single();
                      // Prefer session email, fallback to profile email
                      const recipientEmail = session.customer_email || profile?.email;
                      
                      if (recipientEmail) {
                          // Fetch Template from DB
                          const template = await getTemplate('cust_sub_active');
                          
                          // Default Fallback
                          let subject = template?.subject || 'Dein Premium-Schutz ist aktiv! 🛡️';
                          let htmlBody = template?.body || `
                                <h1>Das ging schnell!</h1>
                                <p>Hallo {firstName},</p>
                                <p>Deine Zahlung war erfolgreich. Die Überwachung für deinen ResortPass ist ab sofort aktiv.</p>
                                <p>Du kannst dich zurücklehnen. Wir melden uns, sobald Tickets verfügbar sind.</p>
                                <p><a href="https://resortpassalarm.com/dashboard" style="background-color: #00305e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Zum Dashboard</a></p>
                          `;

                          // Replace Variables
                          const dashboardLink = "https://resortpassalarm.com/dashboard";
                          htmlBody = htmlBody.replace(/{firstName}/g, profile?.first_name || 'Fan');
                          htmlBody = htmlBody.replace(/{dashboardLink}/g, dashboardLink);
                          subject = subject.replace(/{firstName}/g, profile?.first_name || 'Fan');

                          await resend.emails.send({
                              from: 'ResortPass Alarm <support@resortpassalarm.com>',
                              to: recipientEmail,
                              subject: subject,
                              html: htmlBody
                          });
                          console.log(`Activation email sent to ${recipientEmail}`);
                      } else {
                          console.warn("Could not find email for activation notification.");
                      }
                  } catch (emailErr) { console.error("Failed to send activation email:", emailErr); }
              }
          }
      }

      // --- HANDLE INVOICE PAYMENT (RENEWAL) ---
      if (event.type === 'invoice.payment_succeeded') {
          const invoice = event.data.object;
          let userId = null;
          let amountPaid = invoice.amount_paid ? invoice.amount_paid / 100 : 0;

          if (invoice.subscription) {
               const subDetails = await stripe.subscriptions.retrieve(invoice.subscription as string);
               const { data: sub } = await supabase.from('subscriptions').select('user_id').eq('stripe_subscription_id', invoice.subscription).single();
               if (sub) {
                   userId = sub.user_id; 
                   await supabase.from('subscriptions').update({
                       status: 'active',
                       current_period_end: new Date(subDetails.current_period_end * 1000).toISOString(),
                       subscription_price: amountPaid,
                       cancel_at_period_end: false 
                   }).eq('user_id', sub.user_id);
               }
          }

          if (!userId && invoice.customer_email) {
              const { data: userByEmail } = await supabase.from('profiles').select('id').eq('email', invoice.customer_email).single();
              if (userByEmail) userId = userByEmail.id;
          }

          if (userId && amountPaid > 0) {
              try {
                  // --- SYNC STRIPE ADDRESS TO PROFILE (Auto-Fill) ---
                  let userProfile = null;
                  const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
                  userProfile = profile;

                  if (userProfile && (!userProfile.street || !userProfile.zip) && invoice.customer_address) {
                      const addr = invoice.customer_address;
                      if (addr.line1 && addr.postal_code && addr.city) {
                          const { street, houseNumber } = parseAddressLine(addr.line1);
                          const updateData = {
                              street: street,
                              house_number: houseNumber,
                              zip: addr.postal_code,
                              city: addr.city,
                              country: addr.country || 'Deutschland'
                          };
                          
                          // Update DB
                          await supabase.from('profiles').update(updateData).eq('id', userId);
                          userProfile = { ...userProfile, ...updateData };
                      }
                  }

                  // --- COMMISSION LOGIC ---
                  if (userProfile && userProfile.referred_by) {
                      const refCode = userProfile.referred_by;
                      let { data: partner } = await supabase.from('profiles').select('*').ilike('referral_code', refCode.trim()).maybeSingle();
                      
                      // Fallback ID check
                      if (!partner && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(refCode)) {
                           const { data: p } = await supabase.from('profiles').select('*').eq('id', refCode).maybeSingle();
                           partner = p;
                      }

                      if (partner) {
                          // --- SELF-REFERRAL BLOCKER ---
                          let isBlocked = false;
                          let blockReason = "";

                          if (partner.id === userProfile.id) {
                              isBlocked = true;
                              blockReason = "Same ID";
                          } else if (
                              (partner.email && userProfile.email && partner.email.toLowerCase() === userProfile.email.toLowerCase())
                          ) {
                              isBlocked = true;
                              blockReason = "Same Email";
                          }

                          // Fetch Global Commission Rate
                          let commissionRate = 0.5; // Default 50%
                          const { data: commSetting } = await supabase
                              .from('system_settings')
                              .select('value')
                              .eq('key', 'global_commission_rate')
                              .single();
                          
                          if (commSetting && commSetting.value) {
                              commissionRate = parseFloat(commSetting.value) / 100;
                          }

                          const commissionAmount = Number((amountPaid * commissionRate).toFixed(2));
                          
                          let commissionId = null;

                          if (isBlocked) {
                              await supabase.from('commissions').insert({ 
                                  partner_id: partner.id, 
                                  source_user_id: userId, 
                                  amount: commissionAmount, 
                                  status: 'declined' 
                              });
                          } else {
                              const { data: insertedComm } = await supabase.from('commissions').insert({ 
                                  partner_id: partner.id, 
                                  source_user_id: userId, 
                                  amount: commissionAmount, 
                                  status: 'pending' 
                              }).select('id').single();
                              commissionId = insertedComm?.id;
                          }

                          // --- PARTNER FIRST COMMISSION EMAIL ---
                          if (commissionId && !isBlocked && resend && partner.email) {
                              // Check how many commissions this partner has
                              const { count } = await supabase
                                .from('commissions')
                                .select('*', { count: 'exact', head: true })
                                .eq('partner_id', partner.id)
                                .eq('status', 'pending');
                              
                              // If this is the first (or only) one pending, and maybe total count is 1
                              // A safer check is total commissions count
                              const { count: totalCount } = await supabase
                                .from('commissions')
                                .select('*', { count: 'exact', head: true })
                                .eq('partner_id', partner.id);
                              
                              if (totalCount === 1) {
                                  try {
                                      const template = await getTemplate('part_first_commission');
                                      let subject = template?.subject || 'Glückwunsch! Deine erste Provision 💸';
                                      let htmlBody = template?.body || `
                                        <h1>Stark, {firstName}!</h1>
                                        <p>Du hast soeben deine allererste Provision verdient.</p>
                                        <p>Jemand hat über deinen Link gebucht. Das Guthaben wurde deinem Konto gutgeschrieben.</p>
                                        <p><a href="{dashboardLink}" style="background-color: #00305e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Zum Partner Dashboard</a></p>
                                      `;
                                      
                                      htmlBody = htmlBody.replace(/{firstName}/g, partner.first_name || 'Partner');
                                      htmlBody = htmlBody.replace(/{dashboardLink}/g, 'https://resortpassalarm.com/affiliate');
                                      subject = subject.replace(/{firstName}/g, partner.first_name || 'Partner');

                                      await resend.emails.send({
                                          from: 'ResortPass Alarm <support@resortpassalarm.com>',
                                          to: partner.email,
                                          subject: subject,
                                          html: htmlBody
                                      });
                                  } catch (mailErr) { console.error("Failed to send partner first commission email", mailErr); }
                              }
                          }
                      }
                  }
              } catch (commErr) { console.error("Commission Error:", commErr); }
          }
      }

      if (event.type === 'invoice.payment_failed') {
          const invoice = event.data.object;
          if (invoice.customer_email && resend) {
              await resend.emails.send({
                  from: 'ResortPass Alarm <support@resortpassalarm.com>',
                  to: invoice.customer_email,
                  subject: 'Wichtig: Zahlung fehlgeschlagen ⚠️',
                  html: `<p>Hallo,</p><p>Leider ist die Zahlung für dein Abo fehlgeschlagen. Bitte prüfe deine Daten im Dashboard, um weiterhin Alarme zu erhalten.</p><p><a href="https://resortpassalarm.com/dashboard">Dashboard</a></p>`
              });
          }
      }

      // --- HANDLE CANCELLATION (Triggered when user clicks cancel in Stripe) ---
      if (event.type === 'customer.subscription.updated') {
          console.log(">>> Checking for Cancellation...");
          const subscription = event.data.object;
          const previousAttributes = event.data.previous_attributes;

          // DEBUG LOG: Show exactly what changed
          if (previousAttributes) {
              console.log(">>> Previous Attributes:", JSON.stringify(previousAttributes));
          }

          // 0. Fetch current DB state (Fallback for robustness)
          const { data: currentDbSub } = await supabase.from('subscriptions').select('cancel_at_period_end').eq('stripe_subscription_id', subscription.id).single();

          // 1. Update DB Status (Sync Always)
          const { error: dbError } = await supabase.from('subscriptions').update({ 
              cancel_at_period_end: subscription.cancel_at_period_end,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
          }).eq('stripe_subscription_id', subscription.id);

          if (dbError) console.error(">>> DB Update Error in Cancellation check:", dbError);

          // 2. Check if this update IS a cancellation
          // Logic: 
          // A) Stripe says it changed (previous_attributes.cancel_at_period_end === false)
          // B) OR Stripe says it is canceling NOW, and our DB said it wasn't before (Fallback)
          const stripeSaysChanged = previousAttributes && previousAttributes.cancel_at_period_end === false;
          const dbSaysChanged = currentDbSub && currentDbSub.cancel_at_period_end === false && subscription.cancel_at_period_end === true;

          if (subscription.cancel_at_period_end === true && (stripeSaysChanged || dbSaysChanged)) {
              console.log(`>>> CANCELLATION DETECTED! (Source: ${stripeSaysChanged ? 'Stripe PrevAttr' : 'DB Diff'}). Sending confirmation...`);
              if (resend) {
                  try {
                      // Fetch user info using Stripe Sub ID to be sure
                      const { data: sub } = await supabase
                          .from('subscriptions')
                          .select('user_id')
                          .eq('stripe_subscription_id', subscription.id)
                          .single();

                      if (sub && sub.user_id) {
                          const { data: profile } = await supabase.from('profiles').select('email, first_name').eq('id', sub.user_id).single();
                          
                          if (profile && profile.email) {
                              const endDate = new Date(subscription.current_period_end * 1000).toLocaleDateString('de-DE');
                              const dashboardLink = "https://resortpassalarm.com/dashboard";

                              // Fetch Template from DB
                              const template = await getTemplate('cust_sub_cancel');

                              // Default Fallback
                              let subject = template?.subject || 'Bestätigung deiner Kündigung';
                              let htmlBody = template?.body || `
                                    <h1>Schade, dass du gehst!</h1>
                                    <p>Hallo {firstName},</p>
                                    <p>Wir bestätigen hiermit den Eingang deiner Kündigung.</p>
                                    <p><strong>Dein Abo läuft noch bis zum: {endDate}</strong></p>
                                    <p>Bis dahin erhältst du weiterhin Alarme. Nach diesem Datum stoppen alle Benachrichtigungen automatisch.</p>
                                    <hr>
                                    <p>Es hat sich eine gute Chance ergeben? Du kannst dein Abo jederzeit vor Ablauf mit einem Klick im Dashboard verlängern:</p>
                                    <p><a href="{dashboardLink}" style="background-color: #00305e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Kündigung zurücknehmen</a></p>
                              `;
                              
                              // Replace Variables
                              htmlBody = htmlBody.replace(/{firstName}/g, profile.first_name || 'Fan');
                              htmlBody = htmlBody.replace(/{endDate}/g, endDate);
                              htmlBody = htmlBody.replace(/{dashboardLink}/g, dashboardLink);
                              subject = subject.replace(/{firstName}/g, profile.first_name || 'Fan');

                              await resend.emails.send({
                                  from: 'ResortPass Alarm <support@resortpassalarm.com>',
                                  to: profile.email,
                                  subject: subject,
                                  html: htmlBody
                              });
                              console.log(`Cancellation confirmation sent to ${profile.email}`);
                          } else {
                              console.warn(">>> Cancellation: Profile email not found.");
                          }
                      } else {
                          console.warn(">>> Cancellation: Subscription not found in DB for sub ID:", subscription.id);
                      }
                  } catch (e: any) {
                      console.error("Failed to send cancellation email:", e);
                  }
              }
          }
      }

      // --- HANDLE FINAL DELETION (Period ended) ---
      if (event.type === 'customer.subscription.deleted') {
          const subscription = event.data.object;
          await supabase.from('subscriptions').update({ status: 'canceled' }).eq('stripe_subscription_id', subscription.id);
          
          const { data: sub } = await supabase.from('subscriptions').select('user_id').eq('stripe_subscription_id', subscription.id).single();
          if (sub && sub.user_id && resend) {
               const { data: profile } = await supabase.from('profiles').select('email, first_name').eq('id', sub.user_id).single();
               if (profile && profile.email) {
                   await resend.emails.send({
                      from: 'ResortPass Alarm <support@resortpassalarm.com>',
                      to: profile.email,
                      subject: 'Dein Abo ist beendet',
                      html: `<p>Hallo ${profile.first_name || ''},</p><p>Dein ResortPassAlarm Abo ist heute ausgelaufen. Du erhältst keine Benachrichtigungen mehr.</p><p>Du kannst jederzeit ein neues Abo im Dashboard starten.</p>`
                  });
               }
          }
      }
  };

  // 3. EXECUTE WITH TIMEOUT PROTECTION (FAIL-SAFE)
  try {
      await Promise.race([
          processEvent(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Webhook Logic Timeout")), 8500)) // INCREASED TO 8.5s for Email sending safety
      ]);
  } catch (error: any) {
      console.error("WEBHOOK WARNING (Timeout or Error):", error.message);
  }

  // 4. Always return 200 OK to keep Stripe happy
  return res.status(200).json({ received: true });
}
