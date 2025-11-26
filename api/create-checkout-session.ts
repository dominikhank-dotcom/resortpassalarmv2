import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Init Supabase for Backend (using env vars directly)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, referralCode } = req.body;

    // 1. Get or Create User in Supabase to link Stripe ID
    // We assume user already signed up via frontend and exists in Auth
    // But for metadata, we just pass the email.
    
    // In a full implementation, you'd lookup the user UUID from Supabase Auth
    // const { data: users } = await supabase.from('profiles').select('id').eq('email', email).single();
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'paypal'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'ResortPass Alarm Premium',
              description: 'Monatliche Überwachung für Gold & Silver Pässe',
            },
            unit_amount: 199, // 1.99 EUR
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}&payment_success=true`,
      cancel_url: `${req.headers.origin}/dashboard?payment_cancelled=true`,
      customer_email: email,
      metadata: {
        service: 'ResortPassAlarm',
        referralCode: referralCode || ''
      }
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}