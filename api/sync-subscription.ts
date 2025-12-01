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
    // 1. Get User Profile for Email
    const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();

    if (!profile || !profile.email) {
        return res.status(404).json({ error: 'User profile or email not found' });
    }

    // 2. Search Stripe for Customer by Email
    const customers = await stripe.customers.list({
        email: profile.email,
        limit: 1,
        expand: ['data.subscriptions']
    });

    if (customers.data.length === 0) {
        return res.status(200).json({ message: 'No Stripe customer found for this email.', found: false });
    }

    const customer = customers.data[0];
    
    // 3. Check for Active Subscriptions
    const subscriptions = customer.subscriptions?.data.filter(sub => sub.status === 'active' || sub.status === 'trialing');

    if (subscriptions && subscriptions.length > 0) {
        const sub = subscriptions[0]; // Take the first active one
        
        // 4. Update Database
        await supabase.from('subscriptions').upsert({
            user_id: userId,
            stripe_customer_id: customer.id,
            stripe_subscription_id: sub.id,
            status: 'active',
            plan_type: 'premium',
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        }, { onConflict: 'user_id' });

        return res.status(200).json({ success: true, message: 'Subscription synced successfully.', found: true });
    } else {
        // If user has no active sub in Stripe, make sure DB reflects that
        await supabase.from('subscriptions').update({ status: 'inactive' }).eq('user_id', userId);
        return res.status(200).json({ success: true, message: 'No active subscription found in Stripe.', found: false });
    }

  } catch (error: any) {
    console.error('Sync Error:', error);
    res.status(500).json({ error: error.message });
  }
}