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
      return res.status(200).json({ activeUsers: 0, revenue: 0, newCustomers: 0, conversionRate: 0, error: 'Config Missing' });
  }

  try {
    const { startDate, endDate } = req.query;

    // --- 1. GLOBAL STATS (Total MRR & Total Active Users) ---
    // Count ALL subscriptions that are currently providing access
    // We check for various status spellings to be robust using .in()
    const { data: allActiveSubs, error: subError } = await supabase
      .from('subscriptions')
      .select('subscription_price, plan_type, status')
      .in('status', ['active', 'trialing', 'Active']);

    if (subError) throw subError;

    // Calculate Global MRR
    let currentMRR = 0;
    
    const { data: priceSetting } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'price_existing_customers')
        .single();
    const fallbackPrice = priceSetting ? parseFloat(priceSetting.value) : 1.99;

    if (allActiveSubs) {
        allActiveSubs.forEach(sub => {
            if (sub.plan_type === 'Manuell (Gratis)') return;
            // Ensure we handle numbers correctly
            const price = sub.subscription_price !== null ? Number(sub.subscription_price) : fallbackPrice;
            currentMRR += price;
        });
    }

    const totalActiveUsers = allActiveSubs ? allActiveSubs.length : 0;

    // --- 2. PERIOD STATS ---
    
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
      newCustomers: validNewSubs, // Return count of new SUBSCRIPTIONS
      conversionRate: parseFloat(conversionRate.toFixed(2))
    });

  } catch (error: any) {
    console.error("Admin Stats Error:", error);
    return res.status(500).json({ error: error.message });
  }
}