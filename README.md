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
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Datenbank Setup (SQL)

Gehe in dein Supabase Dashboard -> SQL Editor und führe folgendes Skript aus, um die Datenbank zu initialisieren:

```sql
-- 1. Profiles Table (Users & Partners)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key default gen_random_uuid(),
  email text unique not null,
  first_name text,
  last_name text,
  role text default 'CUSTOMER', -- 'CUSTOMER', 'AFFILIATE', 'ADMIN'
  stripe_customer_id text,
  referral_code text unique, -- For Partners
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Subscriptions Table
create table subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  stripe_subscription_id text,
  status text, -- 'active', 'cancelled', 'past_due'
  plan text,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Commissions Table
create table commissions (
  id uuid default gen_random_uuid() primary key,
  partner_id uuid references profiles(id) on delete set null,
  source_user_id uuid references profiles(id) on delete set null,
  amount numeric(10, 2),
  status text default 'pending', -- 'pending', 'paid'
  stripe_subscription_id text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS) is recommended for production!
alter table profiles enable row level security;
alter table subscriptions enable row level security;
alter table commissions enable row level security;

-- Simple Policies (Modify for production security!)
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert their own profile" on profiles for insert with check (true);
create policy "Users can update own profile" on profiles for update using (true);
```