import Stripe from 'stripe';
import { buffer } from 'micro';
import { getServiceSupabase } from '../lib/supabase';

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

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
  } catch (err) {
    console.error(`Webhook Signature Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const supabase = getServiceSupabase();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await handleNewSubscription(session, supabase);
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        await handleRecurringPayment(invoice, supabase);
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    console.error("Database Error processing webhook:", error);
    return res.status(500).json({ error: 'Database error' });
  }

  res.status(200).json({ received: true });
}

async function handleNewSubscription(session, supabase) {
  const email = session.customer_email;
  const referralCode = session.metadata?.referralCode;
  const stripeCustomerId = session.customer;
  const subscriptionId = session.subscription;

  console.log(`Processing New Subscription: ${email}, Ref: ${referralCode}`);

  // 1. Upsert User Profile
  // We search by email. If not found, we create a placeholder user.
  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  let userId = user?.id;

  if (!userId) {
    // Create new profile
    const { data: newUser, error: createError } = await supabase
      .from('profiles')
      .insert([{ 
        email, 
        stripe_customer_id: stripeCustomerId,
        role: 'CUSTOMER',
        first_name: 'Customer', // Placeholder until they update profile
        last_name: '(New)'
      }])
      .select()
      .single();
    
    if (createError) {
      console.error("Error creating profile:", createError);
      return; 
    }
    userId = newUser.id;
  } else {
    // Update existing profile with stripe ID
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: stripeCustomerId })
      .eq('id', userId);
  }

  // 2. Create Subscription Record
  const { error: subError } = await supabase
    .from('subscriptions')
    .insert([{
      user_id: userId,
      stripe_subscription_id: subscriptionId,
      status: 'active',
      plan: 'premium',
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // Approx 1 month
    }]);

  if (subError) console.error("Error creating subscription:", subError);

  // 3. Handle Affiliate Commission
  if (referralCode) {
    await distributeCommission(supabase, referralCode, 1.99, userId, subscriptionId);
  }
}

async function handleRecurringPayment(invoice, supabase) {
  const subscriptionId = invoice.subscription;
  const amountPaid = invoice.amount_paid / 100; // Convert cents to EUR

  console.log(`Processing Recurring Payment: ${subscriptionId}`);

  // 1. Extend Subscription in DB
  await supabase
    .from('subscriptions')
    .update({ 
      status: 'active',
      current_period_end: new Date(invoice.lines.data[0].period.end * 1000).toISOString()
    })
    .eq('stripe_subscription_id', subscriptionId);

  // 2. Check for Affiliate Link and Distribute Commission
  // We need to find who referred this user originally.
  // We look up the original subscription in our DB (or Stripe) to find metadata, 
  // OR we look up a "referrals" table if we created one. 
  // For simplicity, let's check Stripe subscription metadata.
  
  const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
  const referralCode = stripeSub.metadata?.referralCode;

  if (referralCode) {
    // Find the user ID associated with this subscription to link the commission
    const { data: sub } = await supabase.from('subscriptions').select('user_id').eq('stripe_subscription_id', subscriptionId).single();
    if (sub) {
        await distributeCommission(supabase, referralCode, amountPaid, sub.user_id, subscriptionId);
    }
  }
}

async function distributeCommission(supabase, referralCode, amount, sourceUserId, subscriptionId) {
  // 1. Find Affiliate Partner ID
  // referralCode usually matches the partner's ref_link slug or ID
  // Assuming we have a `referral_code` column in profiles or separate table
  // For this MVP, let's assume referralCode IS the partner's profile ID or a mapped code
  
  // Let's verify if a partner exists with this referral code
  const { data: partner } = await supabase
    .from('profiles')
    .select('id')
    .eq('referral_code', referralCode) // You need to add this column to profiles!
    .single();

  if (!partner) {
    console.log(`Partner with code ${referralCode} not found.`);
    return;
  }

  const commissionAmount = amount * 0.5; // 50% Commission

  // 2. Insert Commission Record
  const { error } = await supabase
    .from('commissions')
    .insert([{
      partner_id: partner.id,
      source_user_id: sourceUserId,
      amount: commissionAmount,
      status: 'pending', // payout pending
      stripe_subscription_id: subscriptionId,
      description: 'Monatsabo Provision'
    }]);

  if (error) console.error("Error saving commission:", error);
  else console.log(`Commission of ${commissionAmount}€ recorded for partner ${partner.id}`);
}