
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.body;

  if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    // 1. Get Stripe Customer ID from Subscriptions
    const { data: sub } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single();

    if (!sub || !sub.stripe_customer_id) {
        return res.status(404).json({ error: 'Kein aktives Stripe-Abo gefunden.' });
    }

    // Determine Base URL & Force WWW for Production
    // This prevents "Logout" issues when returning from Stripe to non-www domain
    let baseUrl = process.env.VITE_SITE_URL || req.headers.origin;
    
    // Safety check: Ensure we don't double-add or break localhost
    if (baseUrl && !baseUrl.includes('localhost') && !baseUrl.includes('127.0.0.1')) {
        if (!baseUrl.includes('https://www.')) {
            baseUrl = baseUrl.replace('https://', 'https://www.');
        }
    }

    // 2. Create Portal Session
    // Add ?portal_return=true to trigger immediate sync in UserDashboard
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${baseUrl}/dashboard?portal_return=true`,
    });

    res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Portal Error:', error);
    res.status(500).json({ error: error.message });
  }
}
