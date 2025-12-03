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
      return res.status(200).json({ activeUsers: 0, activeSubs: 0, revenue: 0, conversionRate: 0, newCustomers: 0, error: 'Config Missing' });
  }

  try {
    const { startDate, endDate } = req.query;

    // --- 1. GLOBAL STATS (Total MRR & Total Active Users - independent of date range usually, but let's see) ---
    // User expects "Revenue / Month". This is usually Current MRR (Monthly Recurring Revenue).
    // We calculate this globally (all active subs), because "Revenue of the last 28 days" is confusing for a subscription model
    // unless we look at transaction tables (which we don't have yet, we only have subscription state).
    
    // Fetch all active subscriptions for MRR calculation
    const { data: allActiveSubs, error: subError } = await supabase
      .from('subscriptions')
      .select('subscription_price, plan_type')
      .eq('status', 'active');

    if (subError) throw subError;

    // Calculate Global MRR
    let currentMRR = 0;
    
    // Fetch fallback price setting
    const { data: priceSetting } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'price_existing_customers')
        .single();
    const fallbackPrice = priceSetting ? parseFloat(priceSetting.value) : 1.99;

    if (allActiveSubs) {
        allActiveSubs.forEach(sub => {
            if (sub.plan_type === 'Manuell (Gratis)') return;
            if (sub.subscription_price !== null && sub.subscription_price !== undefined) {
                currentMRR += Number(sub.subscription_price);
            } else {
                currentMRR += fallbackPrice;
            }
        });
    }

    const totalActiveUsers = allActiveSubs ? allActiveSubs.length : 0;

    // --- 2. PERIOD STATS (For Conversion Rate & New Signups) ---
    // If dates provided, use them. Else default to all time for safety, though frontend sends defaults.
    
    let customersQuery = supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'CUSTOMER');

    let newSubsQuery = supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .neq('plan_type', 'Manuell (Gratis)'); // Only count paid conversions

    if (startDate) {
        customersQuery = customersQuery.gte('created_at', startDate);
        newSubsQuery = newSubsQuery.gte('created_at', startDate);
    }
    if (endDate) {
        // Add one day to include the end date fully if it's just YYYY-MM-DD
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        customersQuery = customersQuery.lte('created_at', endDateTime.toISOString());
        newSubsQuery = newSubsQuery.lte('created_at', endDateTime.toISOString());
    }

    const { count: newCustomersCount } = await customersQuery;
    const { count: newPaidSubsCount } = await newSubsQuery;

    // Calculate Conversion Rate for the period
    // (New Paid Subs created in period / New Signups in period) * 100
    let conversionRate = 0;
    const validCustomerBase = newCustomersCount || 0;
    const validConversions = newPaidSubsCount || 0;

    if (validCustomerBase > 0) {
        conversionRate = (validConversions / validCustomerBase) * 100;
    }

    return res.status(200).json({
      activeUsers: totalActiveUsers, // Total currently active
      revenue: currentMRR, // Total current MRR
      newCustomers: validCustomerBase, // New signups in period
      conversionRate: parseFloat(conversionRate.toFixed(2)) // Real conversion in period
    });

  } catch (error: any) {
    console.error("Admin Stats Error:", error);
    return res.status(500).json({ error: error.message });
  }
}