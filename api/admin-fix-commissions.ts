import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // 1. Basic Admin Security Check
    const { userId } = req.body;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { data: requester } = await supabase.from('profiles').select('role').eq('id', userId).single();
    if (!requester || requester.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

    try {
        console.log("Starting Commission Repair...");
        
        // 2. Get all active subscriptions
        const { data: subs } = await supabase
            .from('subscriptions')
            .select('user_id, subscription_price')
            .in('status', ['active', 'trialing']);
        
        let fixedCount = 0;
        let logs = [];

        for (const sub of subs || []) {
            // 3. Get User Profile with Referrer
            const { data: user } = await supabase
                .from('profiles')
                .select('id, referred_by, email')
                .eq('id', sub.user_id)
                .single();
            
            if (user && user.referred_by) {
                const refCode = user.referred_by.trim();
                
                // 4. Resolve Partner
                let { data: partner } = await supabase
                    .from('profiles')
                    .select('id, email')
                    .ilike('referral_code', refCode)
                    .maybeSingle();
                
                // Fallback ID check
                if (!partner && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(refCode)) {
                     const { data: p } = await supabase.from('profiles').select('id, email').eq('id', refCode).maybeSingle();
                     partner = p;
                }

                if (partner) {
                    // 5. Check if ANY commission exists for this pair
                    // (Simplistic check: If NO commission exists at all, but user has active sub -> Create one)
                    const { data: existing } = await supabase.from('commissions')
                        .select('id')
                        .eq('source_user_id', user.id)
                        .eq('partner_id', partner.id)
                        .limit(1);
                    
                    if (!existing || existing.length === 0) {
                        // Create Commission
                        const price = sub.subscription_price ? Number(sub.subscription_price) : 1.99;
                        const amount = Number((price * 0.5).toFixed(2));
                        
                        await supabase.from('commissions').insert({
                            partner_id: partner.id,
                            source_user_id: user.id,
                            amount: amount,
                            status: 'pending'
                        });
                        fixedCount++;
                        logs.push(`Fixed: User ${user.email} -> Partner ${partner.email} (${amount}€)`);
                    }
                }
            }
        }
        
        return res.status(200).json({ success: true, fixed: fixedCount, logs });

    } catch(e: any) {
        console.error("Repair Error:", e);
        return res.status(500).json({ error: e.message });
    }
}