import Stripe from 'stripe';
import { buffer } from 'micro';
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Init Supabase for Backend with Service Role (Admin access to write commissions etc)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Signature Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        await handleNewSubscription(session);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        await handleRecurringPayment(invoice);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook Logic Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function handleNewSubscription(session) {
  const customerEmail = session.customer_email;
  const stripeCustomerId = session.customer;
  const subscriptionId = session.subscription;
  const referralCode = session.metadata?.referralCode;
  const clientRefId = session.client_reference_id; // Should match UUID from supabase

  console.log(`New Subscription: ${customerEmail}`);

  // 1. Identify User
  let userId = clientRefId;
  
  if (!userId && customerEmail) {
      // Fallback: Try to find by email
      const { data: user } = await supabase.from('profiles').select('id').eq('email', customerEmail).single();
      if (user) userId = user.id;
  }

  if (userId) {
      // 2. Create/Update Subscription in DB
      const { error } = await supabase.from('subscriptions').insert({
          user_id: userId,
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: subscriptionId,
          status: 'active',
          plan_type: 'premium',
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // Approx 1 month
      });
      if (error) console.error("Error creating subscription:", error);
  } else {
      console.warn(`User not found for subscription: ${customerEmail}`);
  }

  // 3. Handle Affiliate Commission (Lifetime Link)
  if (referralCode && userId) {
      // Find Partner
      const { data: partner } = await supabase.from('profiles').select('id').eq('referral_code', referralCode).single();
      
      if (partner) {
          // Link this user to the partner in a 'commissions' table or update user profile 'referred_by'
          // Here we create the first commission entry
          
          // Assume 1.99 EUR price, 50% commission = 0.99
          const commissionAmount = 0.99;
          
          await supabase.from('commissions').insert({
              partner_id: partner.id,
              source_user_id: userId,
              amount: commissionAmount,
              status: 'pending' // Paid out later
          });
          console.log(`Commission of ${commissionAmount} tracked for partner ${partner.id} (Ref: ${referralCode})`);
      }
  }
}

async function handleRecurringPayment(invoice) {
  // Logic for monthly renewals
  if (!invoice.subscription) return;

  const subscriptionId = invoice.subscription;
  
  // 1. Find subscription in our DB
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (sub && sub.user_id) {
     // 2. Extend subscription
     await supabase.from('subscriptions').update({
         status: 'active',
         current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
     }).eq('stripe_subscription_id', subscriptionId);

     // 3. Check if we need to pay commission (Lifetime)
     // For this MVP, let's look for the FIRST commission for this user to find the partner
     const { data: firstComm } = await supabase
        .from('commissions')
        .select('partner_id')
        .eq('source_user_id', sub.user_id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();
        
     if (firstComm && firstComm.partner_id) {
         const commissionAmount = 0.99;
         await supabase.from('commissions').insert({
              partner_id: firstComm.partner_id,
              source_user_id: sub.user_id,
              amount: commissionAmount,
              status: 'pending'
          });
          console.log(`Recurring Commission tracked for partner ${firstComm.partner_id}`);
     }
  }
}