import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: any, res: any) {
  try {
    // Determine "Last Month"
    const now = new Date();
    const firstDayPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const monthName = firstDayPrevMonth.toLocaleString('de-DE', { month: 'long', year: 'numeric' });

    // Get all partners
    const { data: partners } = await supabase
        .from('profiles')
        .select('id, email, first_name')
        .eq('role', 'AFFILIATE');

    if (!partners) return res.status(200).json({ message: 'No partners found' });

    const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
    let sentCount = 0;

    for (const partner of partners) {
        if (!partner.email || !resend) continue;

        // Calc Stats for this partner in range
        const { data: commissions } = await supabase
            .from('commissions')
            .select('amount')
            .eq('partner_id', partner.id)
            .gte('created_at', firstDayPrevMonth.toISOString())
            .lte('created_at', lastDayPrevMonth.toISOString());
        
        const count = commissions?.length || 0;
        const earnings = commissions?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;
        // Estimate Revenue (assuming 50% commission, revenue is double)
        const revenue = earnings * 2;

        if (count > 0) {
            try {
                await resend.emails.send({
                    from: 'ResortPass Alarm <alarm@resortpassalarm.com>',
                    to: partner.email,
                    subject: `Deine Einnahmen im ${monthName}`,
                    html: `<h1>Dein Monats-Update</h1>
                    <p>Hallo ${partner.first_name || 'Partner'},</p>
                    <p>Im ${monthName} lief es richtig gut:</p>
                    <ul>
                    <li>Neue Provisionen: ${count}</li>
                    <li>Generierter Umsatz: ${revenue.toFixed(2)} €</li>
                    <li><strong>Dein Verdienst: ${earnings.toFixed(2)} €</strong></li>
                    </ul>
                    <p>Die Auszahlung erfolgt wie gewohnt auf Anfrage im Dashboard.</p>
                    <p>Weiter so!</p>`
                });
                sentCount++;
            } catch (e) {
                console.error("Monthly Report Email Error", e);
            }
        }
    }

    return res.status(200).json({ success: true, sent: sentCount, month: monthName });

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}