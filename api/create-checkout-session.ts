import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

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
    let userId = null;
    if (email) {
        const { data: user } = await supabase.from('profiles').select('id').eq('email', email).single();
        if (user) userId = user.id;
    }

    const { data: priceSetting } = await supabase.from('system_settings').select('value').eq('key', 'price_new_customers').single();
    const priceValue = priceSetting && priceSetting.value ? parseFloat(priceSetting.value) : 1.99;
    const unitAmount = Math.round(priceValue * 100);
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'ResortPass Alarm Premium',
              description: 'Monatliche Überwachung für Gold & Silver Pässe',
            },
            unit_amount: unitAmount,
            recurring: { interval: 'month' },
          },
          quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${req.headers.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}&payment_success=true`,
      cancel_url: `${req.headers.origin}/dashboard?payment_cancelled=true`,
      customer_email: email,
      metadata: { service: 'ResortPassAlarm', referralCode: referralCode || '', userId: userId || '' },
      client_reference_id: userId
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}