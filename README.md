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
- **Dienste:** Stripe, Twilio, Resend, Browse.ai, Google Gemini AI

## Deployment

Dieses Projekt ist für das Deployment auf Vercel optimiert.

### Environment Variables

Für den Live-Betrieb müssen folgende Variablen in Vercel gesetzt werden:

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `RESEND_API_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `BROWSE_AI_API_KEY`
- `API_KEY` (für Google Gemini)