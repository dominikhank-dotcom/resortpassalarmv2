import Stripe from 'stripe';
import { buffer } from 'micro';

// NOTE: In Vercel, you need to disable body parsing for webhooks to verify signature
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

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      handleNewSubscription(session);
      break;

    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      handleRecurringPayment(invoice);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).json({ received: true });
}

// Logic to handle new subscription
async function handleNewSubscription(session) {
  const customerEmail = session.customer_email;
  const referralCode = session.metadata?.referralCode;

  console.log(`New Subscription for ${customerEmail}. Referrer: ${referralCode || 'None'}`);

  if (referralCode) {
    // TODO: Connect to your Database (Supabase/Postgres)
    // 1. Find affiliate by referralCode
    // 2. Add commission record (e.g. 50% of 1.99€)
    console.log(`>> COMMISSION: Accrediting 0.99€ to Partner ${referralCode}`);
  }
}

// Logic to handle recurring payments (Monthly renewal)
async function handleRecurringPayment(invoice) {
  // We need to fetch the original subscription to get the metadata (referral code)
  // because invoices don't always carry the session metadata directly.
  if (invoice.subscription) {
      try {
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
        const referralCode = subscription.metadata?.referralCode; // Needs to be copied to sub metadata or we check DB

        // Alternatively, look up customer in your own DB
        console.log(`Recurring Payment for Subscription ${invoice.subscription}. Referrer: ${referralCode || 'Unknown'}`);
        
        if (referralCode) {
            console.log(`>> RECURRING COMMISSION: Accrediting 0.99€ to Partner ${referralCode}`);
        }
      } catch (e) {
          console.error("Error retrieving subscription details", e);
      }
  }
}