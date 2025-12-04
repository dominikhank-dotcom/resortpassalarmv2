import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if Service Role Key is available
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("CRITICAL: SUPABASE_SERVICE_ROLE_KEY missing in api/admin-stats.ts");
      return res.status(200).json({ activeUsers: 0, revenue: 0, profit: 0, newCustomers: 0, conversionRate: 0, error: 'Config Missing' });
  }

  try {
    const { startDate, endDate } = req.query;

    // --- 1. GLOBAL SETTINGS ---
    const { data: settings } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', ['price_existing_customers', 'global_commission_rate']);
    
    const priceSetting = settings?.find(s => s.key === 'price_existing_customers');
    const commSetting = settings?.find(s => s.key === 'global_commission_rate');
    
    const fallbackPrice = priceSetting ? parseFloat(priceSetting.value) : 1.99;
    const commissionRate = commSetting ? parseFloat(commSetting.value) / 100 : 0.5; // Default 50%

    // --- 2. GLOBAL STATS (Total MRR, Commission Liability, Profit) ---
    // Count ALL subscriptions that are currently providing access
    // Join with profiles to check if the user was referred
    const { data: allActiveSubs, error: subError } = await supabase
      .from('subscriptions')
      .select('subscription_price, plan_type, status, user_id, profiles:user_id(referred_by)')
      .in('status', ['active', 'trialing', 'Active']);

    if (subError) throw subError;

    let currentMRR = 0;
    let currentCommissionCost = 0;

    if (allActiveSubs) {
        allActiveSubs.forEach(sub => {
            if (sub.plan_type === 'Manuell (Gratis)') return;
            
            // Ensure we handle numbers correctly
            const price = sub.subscription_price !== null ? Number(sub.subscription_price) : fallbackPrice;
            currentMRR += price;

            // Check if referred (profiles might be an array or object depending on join, usually object for foreign key)
            // Supabase returns an object if it's a single relation, but types can be tricky. Safe check.
            const profile = Array.isArray(sub.profiles) ? sub.profiles[0] : sub.profiles;
            
            if (profile && profile.referred_by) {
                currentCommissionCost += (price * commissionRate);
            }
        });
    }

    const totalActiveUsers = allActiveSubs ? allActiveSubs.length : 0;
    const currentProfit = currentMRR - currentCommissionCost;

    // --- 3. PERIOD STATS ---
    
    // A. New Registrations (Profiles) - for Conversion Rate denominator
    let registrationsQuery = supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'CUSTOMER');

    // B. New Subscriptions (Sales) - for "Neue Abos" display and numerator
    let newSubsQuery = supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true });

    if (startDate) {
        registrationsQuery = registrationsQuery.gte('created_at', startDate);
        newSubsQuery = newSubsQuery.gte('created_at', startDate);
    }
    if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        registrationsQuery = registrationsQuery.lte('created_at', endDateTime.toISOString());
        newSubsQuery = newSubsQuery.lte('created_at', endDateTime.toISOString());
    }

    const { count: newRegistrationsCount } = await registrationsQuery;
    const { count: newSubsCount } = await newSubsQuery;

    // Calculate Conversion Rate: New Subs / New Registrations
    let conversionRate = 0;
    const validRegistrations = newRegistrationsCount || 0;
    const validNewSubs = newSubsCount || 0;

    if (validRegistrations > 0) {
        conversionRate = (validNewSubs / validRegistrations) * 100;
    }

    return res.status(200).json({
      activeUsers: totalActiveUsers,
      revenue: currentMRR,
      profit: currentProfit,
      newCustomers: validNewSubs, // Return count of new SUBSCRIPTIONS
      conversionRate: parseFloat(conversionRate.toFixed(2))
    });

  } catch (error: any) {
    console.error("Admin Stats Error:", error);
    return res.status(500).json({ error: error.message });
  }
}