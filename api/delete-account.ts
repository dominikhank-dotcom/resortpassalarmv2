
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID fehlt.' });
  }

  try {
    // 1. Prüfe Abo-Status
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();

    // Falls ein aktives Abo besteht
    if (sub && sub.status === 'active') {
      const now = new Date();
      const periodEnd = new Date(sub.current_period_end);

      if (!sub.cancel_at_period_end) {
        return res.status(400).json({ 
          error: 'Aktives Abo gefunden! Du musst dein Abonnement zuerst kündigen, bevor du deinen Account löschen kannst.' 
        });
      }

      if (periodEnd > now) {
        const dateStr = periodEnd.toLocaleDateString('de-DE');
        return res.status(400).json({ 
          error: `Dein Abo ist gekündigt, läuft aber noch bis zum ${dateStr}. Eine Löschung ist aus technischen Gründen erst nach Ablauf möglich.` 
        });
      }
    }

    // 2. Prüfe Abo-Historie (Wurde jemals bezahlt?)
    const { count: hasSubHistory } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const hasHistory = hasSubHistory && hasSubHistory > 0;

    if (!hasHistory) {
      // SZENARIO A: Nie ein Abo gehabt -> Alles löschen
      console.log(`GDPR: Full deletion for user ${userId}`);
      
      // Profile wird durch FK "ON DELETE CASCADE" in der DB mitgelöscht, 
      // aber wir löschen den Auth-User primär.
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) throw authError;

      return res.status(200).json({ success: true, message: 'Account vollständig gelöscht.' });
    } else {
      // SZENARIO B: Abo-Historie vorhanden -> Anonymisieren
      console.log(`GDPR: Anonymizing user ${userId} for tax reasons`);

      // 1. Auth-User löschen, um Login zu sperren
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) {
        // Falls der Auth-User schon weg ist, machen wir trotzdem mit dem Profil weiter
        console.warn("Auth User deletion failed or already gone:", authError.message);
      }

      // 2. Profil-Daten anonymisieren (Handy, E-Mail, Name entfernen)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          email: 'geloescht@resortpassalarm.com',
          notification_email: null,
          phone: null,
          first_name: 'Gelöschter',
          last_name: 'Nutzer',
          street: 'Gelöscht',
          house_number: '0',
          zip: '00000',
          city: 'Gelöscht',
          email_enabled: false,
          sms_enabled: false,
          last_test_config: {}
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      return res.status(200).json({ 
        success: true, 
        message: 'Account gesperrt und personenbezogene Daten anonymisiert (Steuer-Aufbewahrungsfrist).' 
      });
    }

  } catch (error: any) {
    console.error("GDPR Deletion Logic Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
