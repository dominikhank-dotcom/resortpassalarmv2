
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Define default templates to ensure they exist in the dashboard
const REQUIRED_TEMPLATES = [
    {
        id: 'cust_sub_active',
        name: 'Abo Aktiviert (Kunde)',
        description: 'Bestätigung nach erfolgreicher Bezahlung',
        category: 'CUSTOMER',
        subject: 'Dein Premium-Schutz ist aktiv! 🛡️',
        body: '<h1>Das ging schnell!</h1><p>Hallo {firstName},</p><p>Deine Zahlung war erfolgreich. Die Überwachung für deinen ResortPass ist ab sofort aktiv.</p><p>Du kannst dich zurücklehnen. Wir melden uns, sobald Tickets verfügbar sind.</p><p><a href="{dashboardLink}" style="background-color: #00305e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Zum Dashboard</a></p>',
        variables: ['{firstName}', '{dashboardLink}'],
        isEnabled: true
    },
    {
        id: 'cust_sub_cancel',
        name: 'Abo Gekündigt (Kunde)',
        description: 'Bestätigung der Kündigung zum Laufzeitende',
        category: 'CUSTOMER',
        subject: 'Bestätigung deiner Kündigung',
        body: '<h1>Schade, dass du gehst!</h1><p>Hallo {firstName},</p><p>Wir bestätigen hiermit den Eingang deiner Kündigung.</p><p><strong>Dein Abo läuft noch bis zum: {endDate}</strong></p><p>Bis dahin erhältst du weiterhin Alarme. Nach diesem Datum stoppen alle Benachrichtigungen automatisch.</p><hr><p>Es hat sich eine gute Chance ergeben? Du kannst dein Abo jederzeit vor Ablauf mit einem Klick im Dashboard verlängern:</p><p><a href="{dashboardLink}" style="background-color: #00305e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Kündigung zurücknehmen</a></p>',
        variables: ['{firstName}', '{endDate}', '{dashboardLink}'],
        isEnabled: true
    },
    {
        id: 'part_first_commission',
        name: 'Erste Provision (Partner)',
        description: 'Glückwunsch zur ersten Einnahme',
        category: 'PARTNER',
        subject: 'Glückwunsch! Deine erste Provision 💸',
        body: '<h1>Stark, {firstName}!</h1><p>Du hast soeben deine allererste Provision verdient.</p><p>Jemand hat über deinen Link gebucht. Das Guthaben wurde deinem Konto gutgeschrieben.</p><p>Mach weiter so – das ist erst der Anfang!</p><p><a href="{dashboardLink}" style="background-color: #00305e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Zum Partner Dashboard</a></p>',
        variables: ['{firstName}', '{dashboardLink}'],
        isEnabled: true
    },
    {
        id: 'cust_abandoned_cart',
        name: 'Kein Abo Warnung (24h)',
        description: 'Erinnerung nach 24h ohne Abo-Abschluss',
        category: 'CUSTOMER',
        subject: 'Achtung: Dein Wächter ist noch inaktiv ⚠️',
        body: '<h1>Hallo {firstName},</h1><p>wir haben gesehen, dass du dich registriert hast, aber <strong>noch kein Abo abgeschlossen hast.</strong></p><p>Das bedeutet: <strong>Du erhältst aktuell KEINE Alarme</strong>, wenn ResortPässe verfügbar werden!</p><h2>Warum ResortPassAlarm?</h2><ul><li>✅ 24/7 Überwachung (wir schlafen nie)</li><li>✅ Sofortige E-Mail & SMS bei Verfügbarkeit</li><li>✅ Monatlich kündbar (kein Risiko)</li></ul><p>Verpasse nicht die nächste Welle. Aktiviere deinen Schutz jetzt:</p><p><a href="{dashboardLink}" style="background-color: #ffcc00; color: #00305e; padding: 15px 25px; text-decoration: none; font-weight: bold; border-radius: 5px;">Jetzt Abo aktivieren</a></p><hr><p>Hast du Fragen oder Probleme bei der Buchung? Melde dich jederzeit bei unserem Support: <a href="mailto:support@ressortpassalarm.com">support@ressortpassalarm.com</a></p>',
        variables: ['{firstName}', '{dashboardLink}'],
        isEnabled: true
    }
];

export default async function handler(req: any, res: any) {
  // Allow GET to fetch templates
  if (req.method === 'GET') {
      try {
          console.log(">>> Fetching Email Templates...");
          let { data: existing, error } = await supabase
            .from('email_templates')
            .select('*')
            .order('id');
          
          if (error) {
              console.error(">>> DB Error fetching templates:", error);
              throw error;
          }

          // SEEDING LOGIC: Check if required templates are missing
          const missing = REQUIRED_TEMPLATES.filter(reqT => !existing?.find(exT => exT.id === reqT.id));

          if (missing.length > 0) {
              console.log(`>>> Seeding ${missing.length} missing templates...`);
              const toInsert = missing.map(t => ({
                  id: t.id,
                  name: t.name,
                  description: t.description,
                  category: t.category,
                  subject: t.subject,
                  body: t.body,
                  variables: t.variables,
                  is_enabled: t.isEnabled,
                  updated_at: new Date().toISOString()
              }));

              const { error: seedError } = await supabase.from('email_templates').upsert(toInsert);
              if (seedError) {
                  console.error(">>> Seeding Error:", seedError);
              } else {
                  // Refetch to include new ones
                  const { data: refreshed } = await supabase.from('email_templates').select('*').order('id');
                  existing = refreshed;
              }
          }
          
          console.log(`>>> Templates returned: ${existing?.length || 0}`);
          return res.status(200).json(existing);
      } catch (error: any) {
          console.error(">>> API Error:", error.message);
          return res.status(500).json({ error: error.message });
      }
  } 
  
  // Allow POST to save (ADMIN only)
  else if (req.method === 'POST') {
      const { userId, template } = req.body;

      if (!userId || !template || !template.id) {
          return res.status(400).json({ error: 'Missing parameters' });
      }

      try {
          // Verify Admin
          const { data: user } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();
          
          if (!user || user.role !== 'ADMIN') {
              return res.status(403).json({ error: 'Unauthorized' });
          }

          // Upsert Template
          const { error } = await supabase
            .from('email_templates')
            .upsert({
                id: template.id,
                name: template.name,
                description: template.description,
                category: template.category,
                subject: template.subject,
                body: template.body,
                variables: template.variables,
                is_enabled: template.isEnabled, // Explicitly save boolean
                updated_at: new Date().toISOString()
            });
          
          if (error) throw error;

          return res.status(200).json({ success: true });
      } catch (error: any) {
          return res.status(500).json({ error: error.message });
      }
  } 
  
  else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
