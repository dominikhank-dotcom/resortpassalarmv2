
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
      return res.status(200).json({ activeUsers: 0, revenue: 0, profit: 0, newCustomers: 0, history: [], error: 'Config Missing' });
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
      .select('subscription_price, plan_type, status, cancel_at_period_end, user_id, profiles:user_id(referred_by)')
      .in('status', ['active', 'trialing', 'Active', 'Trialing']);

    let currentMRR = 0;
    let currentCommissionCost = 0;
    let activeUncanceled = 0;
    let activeCanceling = 0;

    if (allActiveSubs) {
        allActiveSubs.forEach(sub => {
            if (sub.plan_type === 'Manuell (Gratis)') return;
            
            // Count Status
            if (sub.cancel_at_period_end) {
                activeCanceling++;
            } else {
                activeUncanceled++;
            }

            const price = sub.subscription_price !== null ? Number(sub.subscription_price) : fallbackPrice;
            currentMRR += price;
            // @ts-ignore
            const profile = Array.isArray(sub.profiles) ? sub.profiles[0] : sub.profiles;
            if (profile && profile.referred_by) {
                currentCommissionCost += (price * commissionRate);
            }
        });
    }

    const currentProfit = currentMRR - currentCommissionCost;

    // --- 3. PERIOD STATS (New Customers & Cancellations) ---
    // New Subscriptions in range
    const { count: newSubsCount, data: newSubs } = await supabase
      .from('subscriptions')
      .select('created_at', { count: 'exact' })
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString());

    // New Cancellations in range (requires canceled_at column)
    const { count: newCancellationsCount } = await supabase
        .from('subscriptions')
        .select('canceled_at', { count: 'exact' })
        .gte('canceled_at', start.toISOString())
        .lte('canceled_at', end.toISOString());

    // --- 4. CHART HISTORY GENERATION ---
    const history = [];
    let loopDate = new Date(start);
    
    const getDayStr = (d: Date) => d.toISOString().split('T')[0];
    
    while (loopDate <= end) {
        const dayStr = getDayStr(loopDate);
        // Count subs created on this day
        const subsOnDay = newSubs?.filter(s => getDayStr(new Date(s.created_at)) === dayStr).length || 0;
        
        history.push({
            date: dayStr,
            newSubs: subsOnDay,
            revenue: subsOnDay * fallbackPrice 
        });
        
        loopDate.setDate(loopDate.getDate() + 1);
    }

    return res.status(200).json({
      activeUncanceled: activeUncanceled,
      activeCanceling: activeCanceling,
      newCancellations: newCancellationsCount || 0,
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
