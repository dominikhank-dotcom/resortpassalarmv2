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
      // Return 0 values but don't crash, so UI shows something
      return res.status(200).json({ activeUsers: 0, activeSubs: 0, revenue: 0, error: 'Config Missing' });
  }

  try {
    // 1. Count Customers
    const { count: customerCount, error: custError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'CUSTOMER');

    if (custError) {
        console.error("Error counting customers:", custError);
    }

    // 2. Count Active Subscriptions & Calculate Revenue
    // Using Service Role to bypass RLS "Users see own subscription"
    const { data: subs, error: subError } = await supabase
      .from('subscriptions')
      .select('subscription_price, plan_type')
      .eq('status', 'active');

    if (subError) {
        console.error("Error fetching subs:", subError);
        throw subError;
    }

    // Calculate revenue based on actual stored prices in subscriptions
    let revenue = 0;
    const activeUsers = subs ? subs.length : 0;
    
    // Fetch fallback price setting
    const { data: priceSetting } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'price_existing_customers')
        .single();
    const fallbackPrice = priceSetting ? parseFloat(priceSetting.value) : 1.99;

    if (subs) {
        subs.forEach(sub => {
            if (sub.plan_type === 'Manuell (Gratis)') return;
            if (sub.subscription_price !== null && sub.subscription_price !== undefined) {
                revenue += Number(sub.subscription_price);
            } else {
                revenue += fallbackPrice;
            }
        });
    }

    return res.status(200).json({
      activeUsers: customerCount || 0,
      activeSubs: activeUsers,
      revenue: revenue
    });

  } catch (error: any) {
    console.error("Admin Stats Error:", error);
    return res.status(500).json({ error: error.message });
  }
}