import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Init Supabase for Backend
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
    // 1. Get User Profile to check if account already exists
    const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_account_id, email')
        .eq('id', userId)
        .single();

    if (!profile) throw new Error("User not found");

    let accountId = profile.stripe_account_id;

    // 2. Create Stripe Account if not exists
    if (!accountId) {
        const account = await stripe.accounts.create({
            type: 'express', // Simplified onboarding
            country: 'DE', // Default to Germany
            email: profile.email,
            capabilities: {
              transfers: { requested: true },
            },
        });
        accountId = account.id;

        // Save to DB
        await supabase
            .from('profiles')
            .update({ stripe_account_id: accountId })
            .eq('id', userId);
    }

    // 3. Create Onboarding Link
    const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${req.headers.origin}/affiliate?stripe_connected=refresh`,
        return_url: `${req.headers.origin}/affiliate?stripe_connected=true`,
        type: 'account_onboarding',
    });

    res.status(200).json({ url: accountLink.url });

  } catch (error: any) {
    console.error('Stripe Connect Error:', error);
    res.status(500).json({ error: error.message });
  }
}