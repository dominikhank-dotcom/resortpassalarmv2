
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Init Supabase with Service Role Key to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, action } = req.body;

  if (!userId || !action) {
      return res.status(400).json({ error: 'Missing userId or action' });
  }

  try {
      if (action === 'grant_free') {
          // Check if subscription exists
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('user_id', userId)
            .single();

          if (sub) {
              // Update existing
              const { error } = await supabase
                .from('subscriptions')
                .update({
                    status: 'active',
                    plan_type: 'Manuell (Gratis)',
                    // Set end date far in the future or null
                    current_period_end: new Date(Date.now() + 365 * 10 * 24 * 60 * 60 * 1000).toISOString()
                })
                .eq('user_id', userId);
              if (error) throw error;
          } else {
              // Create new
              const { error } = await supabase
                .from('subscriptions')
                .insert({
                    user_id: userId,
                    status: 'active',
                    plan_type: 'Manuell (Gratis)',
                    current_period_end: new Date(Date.now() + 365 * 10 * 24 * 60 * 60 * 1000).toISOString()
                });
               if (error) throw error;
          }
      } else if (action === 'revoke_free') {
          // Revoke
          const { error } = await supabase
            .from('subscriptions')
            .update({
                status: 'inactive',
                plan_type: 'standard'
            })
            .eq('user_id', userId);
          if (error) throw error;
      } else if (action === 'cancel_sub') {
           // 1. Find subscription
           const { data: sub } = await supabase.from('subscriptions').select('stripe_subscription_id').eq('user_id', userId).eq('status', 'active').single();
           
           if (sub && sub.stripe_subscription_id) {
               // Cancel in Stripe
               try {
                   await stripe.subscriptions.cancel(sub.stripe_subscription_id);
               } catch (e: any) {
                   console.warn("Stripe cancel failed (maybe already canceled):", e.message);
               }
           }
           
           // Update DB
           await supabase.from('subscriptions').update({ 
               status: 'canceled',
               cancel_at_period_end: false, // Immediate cancel means it's done
               current_period_end: new Date().toISOString(), // Ends now
               canceled_at: new Date().toISOString() // Track time
           }).eq('user_id', userId);

      } else if (action === 'resume_sub') {
           // 1. Find subscription that is still active but marked as canceling
           const { data: sub } = await supabase.from('subscriptions').select('stripe_subscription_id').eq('user_id', userId).eq('status', 'active').single();

           if (sub && sub.stripe_subscription_id) {
               try {
                   // Remove cancellation at period end in Stripe
                   await stripe.subscriptions.update(sub.stripe_subscription_id, { cancel_at_period_end: false });
                   
                   // Update DB
                   await supabase.from('subscriptions').update({ 
                       cancel_at_period_end: false 
                   }).eq('user_id', userId);
               } catch (e: any) {
                   console.error("Stripe resume failed:", e.message);
                   throw new Error("Konnte Abo bei Stripe nicht reaktivieren.");
               }
           } else {
               throw new Error("Kein aktives Abo zum Fortsetzen gefunden.");
           }
      }

      return res.status(200).json({ success: true });

  } catch (error: any) {
    console.error("Manage Subscription Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
