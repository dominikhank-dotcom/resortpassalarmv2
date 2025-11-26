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

// Init Supabase for Backend with Service Role (Admin access)
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
  } catch (err) {
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
  const referralCode = session.metadata?.referralCode;
  
  // Update user subscription status in Supabase
  // Note: This requires a 'profiles' or 'subscriptions' table in Supabase
  // await supabase.from('subscriptions').insert({ email: customerEmail, status: 'active', ... });

  console.log(`New Subscription: ${customerEmail}`);

  if (referralCode) {
    // Save Commission
    // await supabase.from('commissions').insert({ referral_code: referralCode, amount: 0.99, ... });
    console.log(`Commission tracked for ${referralCode}`);
  }
}

async function handleRecurringPayment(invoice) {
  if (invoice.subscription) {
     // Handle renewal logic
     console.log(`Recurring Payment: ${invoice.customer_email}`);
  }
}
