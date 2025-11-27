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
- `VITE_SITE_URL` (Deine Vercel Domain, z.B. https://dein-projekt.vercel.app - ohne Slash am Ende)

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

## Datenbank Setup (SQL)

Führe diesen SQL-Code im **Supabase SQL Editor** aus, um die Datenbank zu initialisieren:

```sql
-- 1. Alles sauber entfernen (Clean Slate mit CASCADE für Abhängigkeiten)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.payouts CASCADE;
DROP TABLE IF EXISTS public.commissions CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.system_settings CASCADE;

-- 2. Tabelle: Profile (Nutzer & Partner)
CREATE TABLE public.profiles (
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
  website text, -- Partner Webseite
  paypal_email text, -- Für Partner Auszahlungen
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabelle: Abonnements (Status der Nutzer)
CREATE TABLE public.subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text DEFAULT 'inactive', -- 'active', 'canceled', 'past_due'
  plan_type text DEFAULT 'standard',
  current_period_end timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabelle: Provisionen (Partnerprogramm Tracking)
CREATE TABLE public.commissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL, -- Wer bekommt das Geld?
  source_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL, -- Wer hat gekauft?
  amount decimal(10,2) NOT NULL,
  status text DEFAULT 'pending', -- 'pending' (vorgemerkt), 'paid' (ausbezahlt)
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabelle: Auszahlungen (Partner fordert Geld an)
CREATE TABLE public.payouts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  status text DEFAULT 'requested', -- 'requested', 'completed'
  paypal_email text,
  requested_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at timestamp with time zone
);

-- 6. Tabelle: Systemeinstellungen (Global)
CREATE TABLE public.system_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 7. Sicherheit aktivieren (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- 8. Zugriffsregeln (Policies)
-- Profiles: Öffentlich lesbar (für System), schreibbar nur durch Inhaber
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Subscriptions: Nutzer sehen nur ihr eigenes Abo
CREATE POLICY "Users see own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Commissions: Partner sehen nur ihre eigenen Provisionen
CREATE POLICY "Partners see own commissions" ON public.commissions FOR SELECT USING (auth.uid() = partner_id);

-- Payouts: Partner sehen nur ihre eigenen Auszahlungen
CREATE POLICY "Partners see own payouts" ON public.payouts FOR SELECT USING (auth.uid() = partner_id);

-- System Settings: Jeder darf lesen, Admin darf schreiben
CREATE POLICY "Public read settings" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "Admin update settings" ON public.system_settings FOR UPDATE USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'ADMIN')
);
CREATE POLICY "Admin insert settings" ON public.system_settings FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'ADMIN')
);

-- 9. Automatik: Profil erstellen bei Registrierung
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role, website, referral_code)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name', 
    COALESCE(new.raw_user_meta_data->>'role', 'CUSTOMER'),
    new.raw_user_meta_data->>'website',
    -- Generiere einen kurzen Standard-Code aus dem Vornamen + Zufallszahl, falls keiner da ist
    LOWER(REGEXP_REPLACE(new.raw_user_meta_data->>'first_name', '\W+', '', 'g')) || '-' || FLOOR(RANDOM() * 1000)::text
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Standardwert für Provision
INSERT INTO public.system_settings (key, value) VALUES ('global_commission_rate', '50') ON CONFLICT DO NOTHING;
```

## E-Mail Templates

Füge diesen HTML-Code in Supabase unter **Email Templates -> Confirm signup** ein:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #334155; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; margin-top: 40px; border: 1px solid #e2e8f0; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #00305e; text-decoration: none; }
    .logo span { color: #ffcc00; }
    .button { display: inline-block; background-color: #00305e; color: #ffffff !important; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px; }
    .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="{{ .SiteURL }}" class="logo">ResortPass<span>Alarm</span></a>
    </div>
    
    <!-- INTELLIGENTE UNTERSCHEIDUNG: PARTNER ODER KUNDE -->
    {{ if eq .Data.role "AFFILIATE" }}
        <h2>Willkommen beim Partnerprogramm!</h2>
        <p>Hallo {{ .Data.first_name }},</p>
        <p>Du bist nur noch einen Klick davon entfernt, Provisionen zu verdienen.</p>
        <p>Bitte bestätige deine E-Mail Adresse, um deinen Partner-Account zu aktivieren und Zugriff auf dein Dashboard und deinen Tracking-Link zu erhalten.</p>
    {{ else }}
        <h2>Willkommen an Bord!</h2>
        <p>Hallo {{ .Data.first_name }},</p>
        <p>Du hast dich gerade für den ResortPassAlarm registriert.</p>
        <p>Um deinen Account zu aktivieren und mit der Überwachung zu starten, bestätige bitte deine E-Mail Adresse.</p>
    {{ end }}
    
    <div style="text-align: center;">
      <a href="{{ .ConfirmationURL }}" class="button">E-Mail bestätigen</a>
    </div>
    
    <p style="margin-top: 30px; font-size: 12px; color: #64748b;">Falls du dich nicht registriert hast, kannst du diese E-Mail ignorieren.</p>
    
    <div class="footer">
      &copy; ResortPassAlarm. Keine offizielle Seite des Europa-Park Resorts.
    </div>
  </div>
</body>
</html>
```