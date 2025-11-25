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
- `VITE_SUPABASE_URL` (oder `NEXT_PUBLIC_SUPABASE_URL`)
- `VITE_SUPABASE_ANON_KEY` (oder `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- `SUPABASE_SERVICE_ROLE_KEY`

### WICHTIG: Admin User erstellen
Nach dem Deployment musst du einmalig folgende URL aufrufen, um den Admin-Account (`dominikhank@gmail.com`) zu erstellen und das Passwort zu setzen:

`https://DEINE-APP-URL.vercel.app/api/setup-admin`

## Komplettes Datenbank Setup (SQL)

Kopiere diesen gesamten Block in den Supabase SQL Editor und führe ihn aus ("Run"), um alle Tabellen korrekt zu erstellen.

```sql
-- 1. Profiles Table (Nutzer & Partner) -- MUSS ZUERST KOMMEN
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  first_name text,
  last_name text,
  role text default 'CUSTOMER', -- 'CUSTOMER', 'AFFILIATE', 'ADMIN'
  stripe_customer_id text,
  referral_code text unique, -- Für Partner
  
  -- Adressdaten
  street text,
  house_number text,
  zip text,
  city text,
  country text,
  company text,
  vat_id text,

  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Payouts Table (Auszahlungsanträge) -- MUSS VOR COMMISSIONS KOMMEN
create table if not exists payouts (
  id uuid default gen_random_uuid() primary key,
  partner_id uuid references profiles(id) on delete cascade not null,
  amount numeric(10, 2) not null,
  status text default 'pending', -- 'pending', 'paid', 'rejected'
  paypal_email text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  paid_at timestamp with time zone
);

-- 3. Commissions Table (Provisionen) -- REFERENZIERT PAYOUTS
create table if not exists commissions (
  id uuid default gen_random_uuid() primary key,
  partner_id uuid references profiles(id) on delete set null,
  source_user_id uuid references profiles(id) on delete set null,
  amount numeric(10, 2),
  status text default 'pending', -- 'pending' (offen), 'requested' (in Auszahlung), 'paid' (ausbezahlt)
  stripe_subscription_id text,
  description text,
  payout_id uuid references payouts(id), -- Verknüpfung zur Auszahlung
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Subscriptions Table (Abos)
create table if not exists subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  stripe_subscription_id text,
  status text, -- 'active', 'cancelled', 'past_due'
  plan text,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Row Level Security (RLS) aktivieren
alter table profiles enable row level security;
alter table subscriptions enable row level security;
alter table commissions enable row level security;
alter table payouts enable row level security;

-- Policies (Berechtigungen)
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Partner dürfen ihre eigenen Provisionen sehen
create policy "Partners see own commissions" on commissions for select using (auth.uid() = partner_id);

-- Partner dürfen ihre eigenen Auszahlungen sehen und beantragen
create policy "Partners see own payouts" on payouts for select using (auth.uid() = partner_id);
create policy "Partners can request payouts" on payouts for insert with check (auth.uid() = partner_id);

-- Nutzer sehen ihre eigenen Abos
create policy "Users see own subscriptions" on subscriptions for select using (auth.uid() = user_id);

-- Admins: Haben Zugriff über den 'service_role' Key (Backend), daher hier keine Policy nötig.
```