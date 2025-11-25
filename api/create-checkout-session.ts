import Stripe from 'stripe';
import { getServiceSupabase } from './_lib/supabase.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, referralCode } = req.body;
    const supabase = getServiceSupabase();

    // Ensure User exists in DB before creating session
    // This allows us to link Stripe Customer ID correctly later
    const { data: user } = await supabase.from('profiles').select('id, stripe_customer_id').eq('email', email).single();
    
    // Create checkout session
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
      },
      subscription_data: {
        metadata: {
          referralCode: referralCode || ''
        }
      }
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}