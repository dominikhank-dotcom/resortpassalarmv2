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
    // 1. Get Profile & Connected Account
    const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_account_id')
        .eq('id', userId)
        .single();

    if (!profile || !profile.stripe_account_id) {
        return res.status(400).json({ error: 'Kein Stripe Konto verbunden.' });
    }

    // 2. Calculate Payout Amount from pending commissions
    const { data: commissions } = await supabase
        .from('commissions')
        .select('id, amount')
        .eq('partner_id', userId)
        .eq('status', 'pending');

    if (!commissions || commissions.length === 0) {
        return res.status(400).json({ error: 'Kein Guthaben verfügbar.' });
    }

    const totalAmount = commissions.reduce((sum, c) => sum + Number(c.amount), 0);

    if (totalAmount < 20) {
        return res.status(400).json({ error: 'Auszahlung erst ab 20,00 €.' });
    }

    const amountInCents = Math.round(totalAmount * 100);

    // 3. Create Transfer to Connected Account
    const transfer = await stripe.transfers.create({
        amount: amountInCents,
        currency: 'eur',
        destination: profile.stripe_account_id,
        description: 'Provision ResortPassAlarm',
    });

    // 4. Update Commissions Status
    const commissionIds = commissions.map(c => c.id);
    await supabase
        .from('commissions')
        .update({ status: 'paid' })
        .in('id', commissionIds);

    // 5. Log Payout
    await supabase.from('payouts').insert({
        partner_id: userId,
        amount: totalAmount,
        status: 'completed', // Instant transfer
        paypal_email: 'stripe_connect',
        completed_at: new Date().toISOString()
    });

    res.status(200).json({ success: true, amount: totalAmount });

  } catch (error: any) {
    console.error('Stripe Payout Error:', error);
    res.status(500).json({ error: error.message });
  }
}