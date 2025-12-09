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
      const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

      if (event.type === 'checkout.session.completed') {
          const session = event.data.object;
          let userId = session.client_reference_id;

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

              if (resend && session.customer_email) {
                  try {
                      const { data: profile } = await supabase.from('profiles').select('first_name').eq('id', userId).single();
                      await resend.emails.send({
                          from: 'ResortPass Alarm <support@resortpassalarm.com>',
                          to: session.customer_email,
                          subject: 'Dein Premium-Schutz ist aktiv! 🛡️',
                          html: `<h1>Das ging schnell!</h1><p>Danke ${profile?.first_name || 'Kunde'}, deine Zahlung war erfolgreich. Die Überwachung ist aktiv.</p><p><a href="https://resortpassalarm.com/dashboard">Zum Dashboard</a></p>`
                      });
                  } catch (emailErr) { console.error("Failed to send confirmation email:", emailErr); }
              }
          }
      }

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
                  const { data: userProfile } = await supabase.from('profiles').select('*').eq('id', userId).single();
                  
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

                          // 1. Same ID
                          if (partner.id === userProfile.id) {
                              isBlocked = true;
                              blockReason = "Same ID";
                          }
                          // 2. Same Email / PayPal
                          else if (
                              (partner.email && userProfile.email && partner.email.toLowerCase() === userProfile.email.toLowerCase()) ||
                              (partner.paypal_email && userProfile.paypal_email && partner.paypal_email.toLowerCase() === userProfile.paypal_email.toLowerCase()) ||
                              (partner.email && userProfile.paypal_email && partner.email.toLowerCase() === userProfile.paypal_email.toLowerCase())
                          ) {
                              isBlocked = true;
                              blockReason = "Same Email/PayPal";
                          }
                          // 3. Household (Last Name + Zip + Street match)
                          // Strict check to avoid flagging random neighbors, but catch obvious self-referrals
                          else if (
                              partner.last_name && userProfile.last_name && 
                              partner.zip && userProfile.zip &&
                              partner.street && userProfile.street &&
                              partner.last_name.trim().toLowerCase() === userProfile.last_name.trim().toLowerCase() &&
                              partner.zip.trim() === userProfile.zip.trim() &&
                              partner.street.trim().toLowerCase() === userProfile.street.trim().toLowerCase()
                          ) {
                              isBlocked = true;
                              blockReason = "Household Match (Name+Zip+Street)";
                          }

                          if (isBlocked) {
                              console.warn(`Commission BLOCKED for User ${userId} -> Partner ${partner.id}. Reason: ${blockReason}`);
                          } else {
                              const commissionAmount = Number((amountPaid * 0.50).toFixed(2));
                              await supabase.from('commissions').insert({ 
                                  partner_id: partner.id, 
                                  source_user_id: userId, 
                                  amount: commissionAmount, 
                                  status: 'pending' 
                              });
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
                  html: `<p>Hallo,</p><p>Leider ist die Zahlung für dein Abo fehlgeschlagen. Bitte prüfe deine Daten.</p><p><a href="https://resortpassalarm.com/dashboard">Dashboard</a></p>`
              });
          }
      }

      if (event.type === 'customer.subscription.updated') {
          const subscription = event.data.object;
          await supabase.from('subscriptions').update({ 
              cancel_at_period_end: subscription.cancel_at_period_end,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
          }).eq('stripe_subscription_id', subscription.id);
      }

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
                      subject: 'Dein Abo wurde beendet',
                      html: `<p>Hallo ${profile.first_name || ''},</p><p>Dein ResortPassAlarm Abo ist nun ausgelaufen.</p>`
                  });
               }
          }
      }
  };

  // 3. EXECUTE WITH TIMEOUT PROTECTION (FAIL-SAFE)
  // We give the logic 15 seconds. If it takes longer, we stop waiting and return 200 OK to Stripe.
  // This prevents "Timeout" errors from reaching Stripe.
  try {
      await Promise.race([
          processEvent(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Webhook Logic Timeout")), 15000))
      ]);
  } catch (error: any) {
      // We swallow the error deliberately so Stripe gets a 200.
      // We log it so you can see it in Vercel logs.
      console.error("WEBHOOK WARNING (Timeout or Error):", error.message);
  }

  // 4. Always return 200 OK to keep Stripe happy
  return res.status(200).json({ received: true });
}