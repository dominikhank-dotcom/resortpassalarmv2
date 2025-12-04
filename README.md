
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
BEGIN
  website_input := new.raw_user_meta_data->>'website';
  
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

  INSERT INTO public.profiles (id, email, first_name, last_name, role, website, referral_code, referred_by)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name', 
    COALESCE(new.raw_user_meta_data->>'role', 'CUSTOMER'),
    website_input,
    final_code,
    new.raw_user_meta_data->>'referred_by'
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

-- Standard Templates
INSERT INTO public.email_templates (id, name, description, category, subject, body, variables, is_enabled)
VALUES
('cust_welcome', 'Registrierungs-Mail', 'Wird nach der Registrierung versendet.', 'CUSTOMER', 'Willkommen bei ResortPassAlarm, {firstName}!', '<h1>Hallo {firstName},</h1><p>Willkommen an Bord! Dein Account wurde erfolgreich erstellt.</p><p><a href="{loginLink}">Zum Login</a></p>', ARRAY['{firstName}', '{loginLink}'], true),
('cust_sub_active', 'Abo aktiviert', 'Bestätigung nach Kauf.', 'CUSTOMER', 'Dein Premium-Schutz ist aktiv! 🛡️', '<h1>Das ging schnell!</h1><p>Danke {firstName}, deine Überwachung läuft.</p><p><a href="{dashboardLink}">Zum Dashboard</a></p>', ARRAY['{firstName}', '{dashboardLink}'], true),
('cust_alarm_real', 'ECHT ALARM (Verfügbar)', 'Wenn Tickets gefunden wurden.', 'CUSTOMER', '🚨 {productName} VERFÜGBAR! SCHNELL SEIN!', '<h1 style="color: #d97706;">ALARM STUFE ROT!</h1><p>Hallo {firstName},</p><p>Es gibt freie Kontingente für <strong>{productName}</strong>!</p><a href="{shopLink}">ZUM TICKET SHOP</a>', ARRAY['{firstName}', '{productName}', '{shopLink}'], true),
('part_register', 'Partner Registrierung', 'Willkommensmail für Partner.', 'PARTNER', 'Willkommen im Partnerprogramm', '<h1>Hallo {firstName},</h1><p>Schön, dass du dabei bist.</p><p><a href="{affiliateLink}">Zum Dashboard</a></p>', ARRAY['{firstName}', '{affiliateLink}'], true)
ON CONFLICT (id) DO NOTHING;
