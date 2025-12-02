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

    // 1. Get User ID from Supabase
    let userId = null;
    if (email) {
        const { data: user } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single();
        if (user) {
            userId = user.id;
        }
    }

    // 2. Fetch Price from Database
    const { data: priceSetting } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'price_new_customers')
      .single();
    
    // Default to 1.99 if setting not found
    const priceValue = priceSetting && priceSetting.value ? parseFloat(priceSetting.value) : 1.99;
    const unitAmount = Math.round(priceValue * 100); // Stripe needs cents
    
    // Ensure referralCode is a safe string
    // If frontend didn't pass it, check DB for 'referred_by'
    let safeRefCode = referralCode ? String(referralCode) : "";
    
    if (!safeRefCode && userId) {
        const { data: userProfile } = await supabase
            .from('profiles')
            .select('referred_by')
            .eq('id', userId)
            .single();
        if (userProfile && userProfile.referred_by) {
            safeRefCode = userProfile.referred_by;
        }
    }

    const session = await stripe.checkout.sessions.create({
      // REQUIRED: Collect address for invoices
      billing_address_collection: 'required',
      
      // ENABLE STRIPE TAX AUTOMATION
      automatic_tax: {
        enabled: true,
      },
      
      // Only 'card' is enabled by default. Apple Pay / Google Pay work automatically via 'card'.
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'ResortPass Alarm Premium',
              description: 'Monatliche Überwachung für Gold & Silver Pässe',
            },
            unit_amount: unitAmount,
            recurring: {
              interval: 'month',
            },
            tax_behavior: 'inclusive',
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}&payment_success=true`,
      cancel_url: `${req.headers.origin}/dashboard?payment_cancelled=true`,
      customer_email: email,
      // Metadata is KEY for the webhook to know who referred this user
      metadata: {
        service: 'ResortPassAlarm',
        referralCode: safeRefCode,
        userId: userId || ''
      },
      client_reference_id: userId // CRITICAL: Links stripe session to internal user ID
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}