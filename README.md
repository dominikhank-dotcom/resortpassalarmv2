
# ResortPassAlarm

Ein professionelles SaaS-Tool zur Überwachung der Verfügbarkeit des Europa-Park ResortPass (Gold & Silver).

## Features

- **Echtzeit-Überwachung:** Prüft Intervalle und alarmiert bei Änderungen.
- **Benachrichtigungen:** E-Mail (via Resend) und SMS (via Twilio).
- **Zahlungssystem:** Stripe Integration für monatliche Abos.
- **Partnerprogramm:** Affiliate-Dashboard mit Tracking und Provisionsberechnung.
- **Admin Dashboard:** Volle Kontrolle über Nutzer, Finanzen und Systemstatus.

## Tech Stack

- **Frontend:** React, Tailwind CSS, Lucide Icons, Recharts
- **Backend:** Vercel Serverless Functions (`/api`)
- **Dienste:** Stripe, Twilio, Resend, Browse.ai, Google Gemini AI, Supabase

## Deployment

Dieses Projekt ist für das Deployment auf Vercel optimiert.

### Environment Variables

Für den Live-Betrieb müssen folgende Variablen in Vercel gesetzt werden:

**Frontend (Vite Prefix):**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SITE_URL` (Deine Domain, z.B. https://resortpassalarm.com - ohne Slash am Ende!)

**Backend (Server):**
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `TWILIO_MESSAGING_SERVICE_SID`
- `BROWSE_AI_API_KEY`
- `BROWSE_AI_ROBOT_ID`
- `API_KEY` (für Google Gemini)
- `NEXT_PUBLIC_SUPABASE_URL` (Gleicher Wert wie VITE_SUPABASE_URL)
- `SUPABASE_SERVICE_ROLE_KEY` (Für Admin-Zugriff im Backend)

## GO-LIVE CHECKLISTE (Domain Umzug)

Wenn du deine eigene Domain (z.B. resortpassalarm.com) aufschaltest, beachte folgende Punkte:

1. **Vercel Env Var:** Ändere `VITE_SITE_URL` auf `https://resortpassalarm.com` und redeploye die App.
2. **Supabase Auth:** Ändere unter Authentication -> URL Configuration die Site URL auf `https://resortpassalarm.com` und füge `https://resortpassalarm.com/**` zu den Redirect URLs hinzu.
3. **Stripe Webhook:** Aktualisiere die URL im Stripe Dashboard auf `https://resortpassalarm.com/api/stripe-webhook`.
4. **Browse.ai Webhook:** Aktualisiere die Integration auf `https://resortpassalarm.com/api/browse-ai-webhook`.

## Datenbank Setup (SQL)

Führe diesen SQL-Code im **Supabase SQL Editor** aus, um die Datenbank zu initialisieren.
Falls Fehler wie "relation already exists" auftreten, ist das gut - dann existiert die Tabelle schon.

```sql
-- 1. Bestehende Tabellen entfernen (Vorsicht: Löscht Daten!)
-- Nur ausführen wenn du ganz von vorne startest!
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS public.handle_new_user();
-- DROP TABLE IF EXISTS public.payouts CASCADE;
-- DROP TABLE IF EXISTS public.commissions CASCADE;
-- DROP TABLE IF EXISTS public.subscriptions CASCADE;
-- DROP TABLE IF EXISTS public.profiles CASCADE;
-- DROP TABLE IF EXISTS public.system_settings CASCADE;
-- DROP TABLE IF EXISTS public.email_templates CASCADE;

-- 2. Tabellen erstellen (Falls nicht vorhanden)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email text,
  first_name text,
  last_name text,
  role text DEFAULT 'CUSTOMER', -- 'ADMIN', 'CUSTOMER', 'AFFILIATE'
  street text,
  house_number text,
  zip text,
  city text,
  country text DEFAULT 'Deutschland',
  referral_code text UNIQUE, -- Für Partner: Ihr eigener Code
  referred_by text, -- Code des Partners, der diesen User geworben hat
  website text, -- Partner Webseite
  paypal_email text, -- Für Partner Auszahlungen
  stripe_account_id text, -- Für Stripe Connect Auszahlungen
  welcome_mail_sent boolean DEFAULT false, -- Verhindert doppelte Willkommens-Mails für Kunden
  partner_welcome_sent boolean DEFAULT false, -- NEU: Partner Willkommens-Mail
  tips_mail_sent boolean DEFAULT false, -- NEU: Partner Tipps Mail (nach 10 Min)
  notify_gold boolean DEFAULT true, -- NEU: Gold Alarm erwünscht
  notify_silver boolean DEFAULT true, -- NEU: Silver Alarm erwünscht
  last_test_config jsonb DEFAULT '{}'::jsonb, -- Speichert letzte Test-Konfig (Email/SMS)
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Spalten nachträglich hinzufügen (Falls Tabelle schon da war)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_enabled boolean DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sms_enabled boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text; -- Für SMS
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_email text; -- Falls abweichend von Login-Email
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_account_id text; -- Stripe Connect ID
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS welcome_mail_sent boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS partner_welcome_sent boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tips_mail_sent boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notify_gold boolean DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notify_silver boolean DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_test_config jsonb DEFAULT '{}'::jsonb;

-- Constraints sicherstellen (Ignorieren falls schon da)
DO $$ BEGIN
  ALTER TABLE public.profiles ADD CONSTRAINT unique_referral_code UNIQUE (referral_code);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text DEFAULT 'inactive', -- 'active', 'canceled', 'past_due'
  plan_type text DEFAULT 'standard',
  current_period_end timestamp with time zone,
  subscription_price decimal(10,2), -- Individual price for the user
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add price column if missing
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS subscription_price decimal(10,2);

CREATE TABLE IF NOT EXISTS public.commissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  source_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount decimal(10,2) NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.payouts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  status text DEFAULT 'requested',
  paypal_email text,
  requested_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS public.system_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- EMAIL TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS public.email_templates (
  id text PRIMARY KEY, -- 'cust_welcome', 'cust_alarm' etc.
  name text NOT NULL,
  description text,
  category text NOT NULL, -- 'CUSTOMER' oder 'PARTNER'
  subject text NOT NULL,
  body text NOT NULL,
  variables text[], -- Array von Strings: ['{firstName}', '{link}']
  is_enabled boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Sicherheit aktivieren (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- 4. Policies (Wer darf was?)
-- Hinweis: Fehler "policy already exists" kann ignoriert werden
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users see own subscription" ON public.subscriptions;
CREATE POLICY "Users see own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Partners see own commissions" ON public.commissions;
CREATE POLICY "Partners see own commissions" ON public.commissions FOR SELECT USING (auth.uid() = partner_id);

DROP POLICY IF EXISTS "Partners see own payouts" ON public.payouts;
CREATE POLICY "Partners see own payouts" ON public.payouts FOR SELECT USING (auth.uid() = partner_id);

DROP POLICY IF EXISTS "Public read settings" ON public.system_settings;
CREATE POLICY "Public read settings" ON public.system_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin update settings" ON public.system_settings;
CREATE POLICY "Admin update settings" ON public.system_settings FOR UPDATE USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'ADMIN')
);

DROP POLICY IF EXISTS "Admin insert settings" ON public.system_settings;
CREATE POLICY "Admin insert settings" ON public.system_settings FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'ADMIN')
);

-- Email Templates Policies
DROP POLICY IF EXISTS "Public read templates" ON public.email_templates;
CREATE POLICY "Public read templates" ON public.email_templates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin update templates" ON public.email_templates;
CREATE POLICY "Admin update templates" ON public.email_templates FOR ALL USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'ADMIN')
);

-- 5. Automatik Trigger (WICHTIG FÜR NEUE USER)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
DECLARE
  base_code text;
  final_code text;
  website_input text;
  notify_gold_val boolean;
  notify_silver_val boolean;
BEGIN
  website_input := new.raw_user_meta_data->>'website';
  
  -- Lese notify values (default true wenn nicht gesetzt)
  IF (new.raw_user_meta_data->>'notify_gold') IS NOT NULL THEN
    notify_gold_val := (new.raw_user_meta_data->>'notify_gold')::boolean;
  ELSE
    notify_gold_val := true;
  END IF;

  IF (new.raw_user_meta_data->>'notify_silver') IS NOT NULL THEN
    notify_silver_val := (new.raw_user_meta_data->>'notify_silver')::boolean;
  ELSE
    notify_silver_val := true;
  END IF;
  
  -- 1. Versuch: Code aus Webseite generieren
  IF website_input IS NOT NULL AND length(website_input) > 0 THEN
     -- Entfernt http, www, alles nach dem ersten Slash und alle Sonderzeichen
     base_code := lower(regexp_replace(website_input, '^(https?://)?(www\.)?|/.*$|\W', '', 'g'));
     -- Falls z.B. "instagram.com/user" eingegeben wurde, versuchen wir den User part zu greifen
     IF length(base_code) > 20 OR length(base_code) < 3 THEN
        -- Fallback: Einfach alles säubern
        base_code := lower(regexp_replace(website_input, '\W+', '', 'g'));
     END IF;
  END IF;

  -- 2. Fallback: Vorname nutzen, wenn Webseiten-Code nix taugt
  IF base_code IS NULL OR length(base_code) < 3 THEN
     base_code := lower(regexp_replace(new.raw_user_meta_data->>'first_name', '\W+', '', 'g'));
  END IF;

  -- 3. Code bauen: Basis + Zufallszahl (um Kollisionen zu vermeiden)
  final_code := substring(base_code from 1 for 15) || '-' || floor(random() * 1000)::text;

  INSERT INTO public.profiles (id, email, first_name, last_name, role, website, referral_code, referred_by, notify_gold, notify_silver)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name', 
    COALESCE(new.raw_user_meta_data->>'role', 'CUSTOMER'),
    website_input,
    final_code,
    new.raw_user_meta_data->>'referred_by',
    notify_gold_val,
    notify_silver_val
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Standardwert Provision & Preise
INSERT INTO public.system_settings (key, value) VALUES ('global_commission_rate', '50') ON CONFLICT DO NOTHING;
INSERT INTO public.system_settings (key, value) VALUES ('price_new_customers', '1.99') ON CONFLICT DO NOTHING;
INSERT INTO public.system_settings (key, value) VALUES ('price_existing_customers', '1.99') ON CONFLICT DO NOTHING;

-- Standard Templates (alle 8)
DELETE FROM public.email_templates;
INSERT INTO public.email_templates (id, name, description, category, subject, body, variables, is_enabled)
VALUES
('cust_welcome', 'Registrierungs-Mail', 'Wird nach der Registrierung eines neuen Kundenkontos versendet.', 'CUSTOMER', 'Willkommen bei ResortPassAlarm, {firstName}!', '<h1>Hallo {firstName},</h1>
<p>Willkommen an Bord! Dein Account wurde erfolgreich erstellt.</p>
<p>Du bist jetzt bereit, deine Überwachung zu starten. Logge dich in dein Dashboard ein, um dein Abo zu aktivieren und keine Wellen mehr zu verpassen.</p>
<p><a href="{loginLink}">Zum Login</a></p>
<p>Dein ResortPassAlarm Team</p>', ARRAY['{firstName}', '{loginLink}'], true),

('cust_pw_reset', 'Passwort vergessen', 'Versendet, wenn ein Kunde sein Passwort zurücksetzen möchte.', 'CUSTOMER', 'Passwort zurücksetzen', '<p>Hallo {firstName},</p>
<p>Wir haben eine Anfrage erhalten, dein Passwort zurückzusetzen.</p>
<p>Klicke auf den folgenden Link, um ein neues Passwort festzulegen:</p>
<p><a href="{resetLink}">Passwort zurücksetzen</a></p>
<p>Falls du das nicht warst, kannst du diese E-Mail ignorieren.</p>', ARRAY['{firstName}', '{resetLink}'], true),

('cust_sub_active', 'Abo aktiviert', 'Bestätigung nach erfolgreichem Abschluss des Abos.', 'CUSTOMER', 'Dein Premium-Schutz ist aktiv! 🛡️', '<h1>Das ging schnell!</h1>
<p>Danke {firstName}, deine Zahlung war erfolgreich.</p>
<p>Die Überwachung für ResortPass Gold & Silver ist ab sofort <strong>AKTIV</strong>.</p>
<p>Wir prüfen die Europa-Park Seite nun rund um die Uhr für dich. Stelle sicher, dass deine Handy-Nummer für SMS-Alarme hinterlegt ist.</p>
<p><a href="{dashboardLink}">Zum Dashboard</a></p>', ARRAY['{firstName}', '{dashboardLink}'], true),

('cust_sub_expired', 'Abo abgelaufen / Fehlgeschlagen', 'Info, wenn die Zahlung fehlschlägt oder das Abo endet.', 'CUSTOMER', 'Wichtig: Dein Schutz ist inaktiv', '<p>Hallo {firstName},</p>
<p>Leider konnten wir dein Abo für den ResortPassAlarm nicht verlängern.</p>
<p><strong>Deine Überwachung ist aktuell pausiert.</strong> Du erhältst keine Alarme mehr, wenn Tickets verfügbar sind.</p>
<p>Bitte überprüfe deine Zahlungsmethode, um den Schutz zu reaktivieren:</p>
<p><a href="{dashboardLink}">Zahlungsdaten prüfen</a></p>', ARRAY['{firstName}', '{dashboardLink}'], true),

('cust_alarm_test', 'Test-Alarm', 'Wird versendet, wenn der Nutzer "Test-Alarm senden" klickt.', 'CUSTOMER', '🔔 TEST-ALARM: ResortPass Wächter', '<h1>Funktionstest erfolgreich!</h1>
<p>Hallo {firstName},</p>
<p>Dies ist ein <strong>Test-Alarm</strong> von deinem ResortPass Wächter.</p>
<p>Wenn du diese Mail liest, sind deine Einstellungen korrekt. Wir benachrichtigen dich sofort, wenn Tickets verfügbar sind.</p>', ARRAY['{firstName}'], true),

('cust_alarm_real', 'ECHT ALARM (Verfügbar)', 'Die wichtigste Mail: Wenn Tickets gefunden wurden.', 'CUSTOMER', '🚨 {productName} VERFÜGBAR! SCHNELL SEIN!', '<h1 style="color: #d97706;">ALARM STUFE ROT!</h1>
<p>Hallo {firstName},</p>
<p>Unser System hat soeben freie Kontingente für <strong>{productName}</strong> gefunden!</p>
<p>Die "Wellen" sind oft nur wenige Minuten offen. Handele sofort!</p>
<a href="{shopLink}" style="background-color: #00305e; color: white; padding: 15px 25px; text-decoration: none; font-weight: bold; font-size: 18px; border-radius: 5px; display: inline-block; margin: 10px 0;">ZUM TICKET SHOP</a>
<p>Oder kopiere diesen Link: {shopLink}</p>
<p>Viel Erfolg!<br>Dein Wächter</p>', ARRAY['{firstName}', '{productName}', '{shopLink}'], true),

('part_register', 'Partner Registrierung', 'Willkommensmail für neue Affiliates.', 'PARTNER', 'Willkommen im Partnerprogramm', '<h1>Hallo {firstName},</h1>
<p>Wir freuen uns sehr, dich als Partner begrüßen zu dürfen.</p>
<p>Du verdienst ab sofort 50% an jedem vermittelten Nutzer. Deinen persönlichen Empfehlungslink findest du in deinem Dashboard.</p>
<p><a href="{affiliateLink}">Zum Partner-Dashboard</a></p>
<p>Auf gute Zusammenarbeit!</p>', ARRAY['{firstName}', '{affiliateLink}'], true),

('part_pw_reset', 'Partner Passwort vergessen', 'Passwort Reset für Partner.', 'PARTNER', 'Partner-Login: Neues Passwort', '<p>Hallo {firstName},</p>
<p>hier ist der Link, um dein Passwort für den Partner-Bereich zurückzusetzen:</p>
<p><a href="{resetLink}">Passwort ändern</a></p>', ARRAY['{firstName}', '{resetLink}'], true),

('part_welcome', 'Partner: Tipps zum Start', 'Tipps für neue Partner (Follow-up).', 'PARTNER', 'So verdienst du deine erste Provision 💸', '<p>Hey {firstName},</p>
<p>schön, dass du dabei bist! Hier sind 3 Tipps, wie du deine Einnahmen maximierst:</p>
<ol>
<li>Poste deinen Link in deiner Instagram Bio.</li>
<li>Erkläre deiner Community, dass sie mit dem Tool Zeit sparen.</li>
<li>Nutze unsere vorgefertigten Marketing-Texte aus dem Dashboard.</li>
</ol>
<p>Viel Erfolg!</p>', ARRAY['{firstName}'], true),

('part_monthly', 'Partner: Monats-Statistik', 'Automatischer Report über Einnahmen.', 'PARTNER', 'Deine Einnahmen im {month}', '<h1>Dein Monats-Update</h1>
<p>Hallo {firstName},</p>
<p>Im {month} lief es richtig gut:</p>
<ul>
<li>Neue Kunden: {newCustomers}</li>
<li>Umsatz: {revenue} €</li>
<li><strong>Deine Provision: {commission} €</strong></li>
</ul>
<p>Die Auszahlung erfolgt automatisch zum Monatsanfang.</p>
<p>Weiter so!</p>', ARRAY['{firstName}', '{month}', '{newCustomers}', '{revenue}', '{commission}'], true),

('sms_gold_alarm', 'SMS Alarm: Gold', 'SMS Text für Gold Verfügbarkeit.', 'SMS', 'SMS Gold', '🚨 Gold ALARM! ResortPass verfügbar! Schnell: {link}', ARRAY['{link}'], true),
('sms_silver_alarm', 'SMS Alarm: Silver', 'SMS Text für Silver Verfügbarkeit.', 'SMS', 'SMS Silver', '🚨 Silver ALARM! ResortPass verfügbar! Schnell: {link}', ARRAY['{link}'], true);
