
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
  abandoned_cart_mail_sent boolean DEFAULT false, -- NEU: Warenkorb-Abbrecher Mail
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
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS abandoned_cart_mail_sent boolean DEFAULT false;
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
```
