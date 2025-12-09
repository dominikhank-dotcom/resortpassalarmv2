import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("CRITICAL: SUPABASE_SERVICE_ROLE_KEY missing in api/admin-stats.ts");
      return res.status(200).json({ activeUsers: 0, revenue: 0, profit: 0, newCustomers: 0, conversionRate: 0, history: [], error: 'Config Missing' });
  }

  try {
    const { startDate, endDate } = req.query;
    
    // Default to last 28 days if not provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(end.getDate() - 28));
    
    // Adjust end date to end of day
    end.setHours(23, 59, 59, 999);
    start.setHours(0, 0, 0, 0);

    // --- 1. GLOBAL SETTINGS ---
    const { data: settings } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', ['price_existing_customers', 'global_commission_rate']);
    
    const priceSetting = settings?.find(s => s.key === 'price_existing_customers');
    const commSetting = settings?.find(s => s.key === 'global_commission_rate');
    
    const fallbackPrice = priceSetting ? parseFloat(priceSetting.value) : 1.99;
    const commissionRate = commSetting ? parseFloat(commSetting.value) / 100 : 0.5;

    // --- 2. CURRENT SNAPSHOT STATS ---
    const { data: allActiveSubs } = await supabase
      .from('subscriptions')
      .select('subscription_price, plan_type, status, user_id, profiles:user_id(referred_by)')
      .in('status', ['active', 'trialing', 'Active', 'Trialing']);

    let currentMRR = 0;
    let currentCommissionCost = 0;

    if (allActiveSubs) {
        allActiveSubs.forEach(sub => {
            if (sub.plan_type === 'Manuell (Gratis)') return;
            const price = sub.subscription_price !== null ? Number(sub.subscription_price) : fallbackPrice;
            currentMRR += price;
            // @ts-ignore
            const profile = Array.isArray(sub.profiles) ? sub.profiles[0] : sub.profiles;
            if (profile && profile.referred_by) {
                currentCommissionCost += (price * commissionRate);
            }
        });
    }

    const totalActiveUsers = allActiveSubs ? allActiveSubs.length : 0;
    const currentProfit = currentMRR - currentCommissionCost;

    // --- 3. PERIOD STATS (New Customers) ---
    // New Subscriptions in range
    const { count: newSubsCount, data: newSubs } = await supabase
      .from('subscriptions')
      .select('created_at', { count: 'exact' })
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString());

    // --- 4. CHART HISTORY GENERATION ---
    // We will generate daily buckets between start and end
    const history = [];
    let loopDate = new Date(start);
    
    // Helper to get day string YYYY-MM-DD
    const getDayStr = (d: Date) => d.toISOString().split('T')[0];
    
    // Pre-fetch data for chart efficiency
    // We need sub creations per day
    // We could also try to reconstruct MRR history but that's complex without a events table. 
    // We will chart "New Subscriptions" and "Estimated Revenue Growth" based on new subs.

    while (loopDate <= end) {
        const dayStr = getDayStr(loopDate);
        // Count subs created on this day
        const subsOnDay = newSubs?.filter(s => getDayStr(new Date(s.created_at)) === dayStr).length || 0;
        
        history.push({
            date: dayStr,
            newSubs: subsOnDay,
            revenue: subsOnDay * fallbackPrice // Rough estimate of NEW revenue added that day
        });
        
        loopDate.setDate(loopDate.getDate() + 1);
    }

    return res.status(200).json({
      activeUsers: totalActiveUsers,
      revenue: currentMRR,
      profit: currentProfit,
      newCustomers: newSubsCount || 0,
      history: history
    });

  } catch (error: any) {
    console.error("Admin Stats Error:", error);
    return res.status(500).json({ error: error.message });
  }
}