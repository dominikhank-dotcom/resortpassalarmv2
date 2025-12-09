import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

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

        // 1.5 Get Global Commission Rate
        let commissionRate = 0.5;
        const { data: commSetting } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'global_commission_rate')
            .single();
        if (commSetting && commSetting.value) {
            commissionRate = parseFloat(commSetting.value) / 100;
        }
        
        // 2. Get all active subscriptions
        const { data: subs } = await supabase
            .from('subscriptions')
            .select('user_id, subscription_price, stripe_customer_id')
            .in('status', ['active', 'trialing']);
        
        let fixedCount = 0;
        let logs = [];

        for (const sub of subs || []) {
            // 3. Get User Profile
            const { data: user } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', sub.user_id)
                .single();
            
            if (!user) continue;

            let refCode = user.referred_by;

            // --- RECOVERY LOGIC START ---
            if (!refCode && sub.stripe_customer_id) {
                try {
                    const sessions = await stripe.checkout.sessions.list({
                        customer: sub.stripe_customer_id,
                        limit: 5
                    });
                    const validSession = sessions.data.find(s => s.metadata && s.metadata.referralCode);
                    
                    if (validSession && validSession.metadata?.referralCode) {
                        refCode = validSession.metadata.referralCode.trim();
                        await supabase.from('profiles').update({ referred_by: refCode }).eq('id', user.id);
                        logs.push(`RECOVERY: Found code "${refCode}" in Stripe for ${user.email}. Profile updated.`);
                    }
                } catch (stripeErr: any) {
                    console.error(`Stripe Lookup Error for ${user.email}:`, stripeErr.message);
                }
            }
            // --- RECOVERY LOGIC END ---

            if (refCode) {
                // 4. Resolve Partner
                let { data: partner } = await supabase
                    .from('profiles')
                    .select('*')
                    .ilike('referral_code', refCode.trim())
                    .maybeSingle();
                
                if (!partner && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(refCode)) {
                     const { data: p } = await supabase.from('profiles').select('*').eq('id', refCode).maybeSingle();
                     partner = p;
                }

                if (partner) {
                    // Check if ANY commission exists (including declined)
                    const { data: existing } = await supabase.from('commissions')
                        .select('id')
                        .eq('source_user_id', user.id)
                        .eq('partner_id', partner.id)
                        .limit(1);
                    
                    if (!existing || existing.length === 0) {
                        // --- SELF-REFERRAL BLOCKER ---
                        let isBlocked = false;
                        let blockReason = "";

                        // 1. Same ID
                        if (partner.id === user.id) {
                            isBlocked = true;
                            blockReason = "Same ID";
                        }
                        // 2. Same Email / PayPal
                        else if (
                            (partner.email && user.email && partner.email.toLowerCase() === user.email.toLowerCase()) ||
                            (partner.paypal_email && user.paypal_email && partner.paypal_email.toLowerCase() === user.paypal_email.toLowerCase()) ||
                            (partner.email && user.paypal_email && partner.email.toLowerCase() === user.paypal_email.toLowerCase())
                        ) {
                            isBlocked = true;
                            blockReason = "Same Email/PayPal";
                        }
                        // 3. Household (Last Name + Zip + Street match)
                        else if (
                            partner.last_name && user.last_name && 
                            partner.zip && user.zip &&
                            partner.street && user.street &&
                            partner.last_name.trim().toLowerCase() === user.last_name.trim().toLowerCase() &&
                            partner.zip.trim() === user.zip.trim() &&
                            partner.street.trim().toLowerCase() === user.street.trim().toLowerCase()
                        ) {
                            isBlocked = true;
                            blockReason = "Household Match (Name+Zip+Street)";
                        }

                        const price = sub.subscription_price ? Number(sub.subscription_price) : 1.99;
                        const amount = Number((price * commissionRate).toFixed(2));

                        if (isBlocked) {
                            // INSERT AS DECLINED to track it
                            await supabase.from('commissions').insert({
                                partner_id: partner.id,
                                source_user_id: user.id,
                                amount: amount,
                                status: 'declined'
                            });
                            logs.push(`MARKED DECLINED: ${user.email} -> Partner ${partner.email}. Reason: ${blockReason}`);
                        } else {
                            // CREATE VALID COMMISSION
                            await supabase.from('commissions').insert({
                                partner_id: partner.id,
                                source_user_id: user.id,
                                amount: amount,
                                status: 'pending'
                            });
                            fixedCount++;
                            logs.push(`FIXED: Commission created for ${user.email} -> Partner ${partner.email} (${amount}€)`);
                        }
                    }
                } else {
                    logs.push(`Warning: Referral code "${refCode}" found for ${user.email} but no partner exists.`);
                }
            }
        }
        
        return res.status(200).json({ success: true, fixed: fixedCount, logs });

    } catch(e: any) {
        console.error("Repair Error:", e);
        return res.status(500).json({ error: e.message });
    }
}