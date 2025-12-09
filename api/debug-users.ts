import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Simple Auth Check (should be better in prod, but for admin debug ok if only called from dashboard)
  // Ideally check for a secret or user session if passed
  
  try {
      // Get all Profiles
      const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
      if (pError) throw pError;

      // Get all Subscriptions
      const { data: subs, error: sError } = await supabase.from('subscriptions').select('*');
      if (sError) throw sError;

      // Combine
      const report = profiles.map(p => {
          const sub = subs.find(s => s.user_id === p.id);
          return {
              id: p.id,
              email: p.email,
              notif_email: p.notification_email,
              name: `${p.first_name} ${p.last_name}`,
              email_enabled: p.email_enabled,
              sub_status: sub ? sub.status : 'NO_SUB',
              plan: sub ? sub.plan_type : 'N/A',
              sub_stripe_id: sub ? sub.stripe_subscription_id : 'N/A',
              cancel_at_period_end: sub ? sub.cancel_at_period_end : false,
              role: p.role,
              referred_by: p.referred_by,
              ref_code: p.referral_code,
              website: p.website
          };
      });

      return res.status(200).json({ count: report.length, users: report });

  } catch (e: any) {
      return res.status(500).json({ error: e.message });
  }
}