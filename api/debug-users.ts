import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
      // Get all Profiles
      const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
      if (pError) throw pError;

      // Get all Subscriptions
      const { data: subs, error: sError } = await supabase.from('subscriptions').select('*');
      if (sError) throw sError;

      // Get all Commissions (to calc total for partners)
      const { data: commissions, error: cError } = await supabase.from('commissions').select('partner_id, amount');
      if (cError) throw cError;

      // Combine
      const report = profiles.map(p => {
          const sub = subs.find(s => s.user_id === p.id);
          
          // Calculate Partner Stats
          const userCommissions = commissions?.filter(c => c.partner_id === p.id) || [];
          const totalCommission = userCommissions.reduce((sum, c) => sum + Number(c.amount), 0);
          
          // Count Referrals (People who have 'referred_by' matching this user's 'referral_code')
          // Only count if referral_code is set
          let referredCount = 0;
          if (p.referral_code) {
             referredCount = profiles.filter(user => user.referred_by === p.referral_code).length;
          }

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
              website: p.website,
              total_commission: totalCommission,
              referred_count: referredCount
          };
      });

      return res.status(200).json({ count: report.length, users: report });

  } catch (e: any) {
      return res.status(500).json({ error: e.message });
  }
}