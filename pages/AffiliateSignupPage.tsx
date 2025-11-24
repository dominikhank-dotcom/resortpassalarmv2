import React from 'react';
import { Check, Star, TrendingUp, MousePointer, Clock, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';

interface AffiliateSignupProps {
  onLoginClick: () => void;
  onRegister: () => void;
}

export const AffiliateSignupPage: React.FC<AffiliateSignupProps> = ({ onLoginClick, onRegister }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left Side: Form */}
      <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Werde ResortPassAlarm Partner</h1>
          <p className="text-slate-500 mb-8">Registriere dich jetzt und starte in weniger als 3 Minuten.</p>

          <form onSubmit={(e) => { e.preventDefault(); onRegister(); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vorname</label>
                <input required type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nachname</label>
                <input required type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Adresse</label>
              <input required type="email" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Deine Webseite / Kanal <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input type="text" placeholder="z.B. Instagram, TikTok, Blog..." className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Passwort erstellen</label>
                <input required type="password" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Passwort wiederholen</label>
                <input required type="password" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
              </div>
            </div>

            <div className="flex items-center gap-3 py-2">
              <input required type="checkbox" id="terms" className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
              <label htmlFor="terms" className="text-sm text-slate-600">
                Ich stimme den <a href="#" className="text-blue-600 hover:underline">Partnerbedingungen</a> zu.
              </label>
            </div>

            <Button type="submit" size="lg" className="w-full bg-[#00305e] text-white hover:bg-[#002040]">
              Kostenlos registrieren
              <ArrowRight size={18} />
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-600 text-sm">
              Oder
            </p>
            <button onClick={onLoginClick} className="mt-2 text-[#00305e] font-semibold hover:underline">
              Bereits einen Account? Hier einloggen
            </button>
          </div>
        </div>
      </div>

      {/* Right Side: Benefits */}
      <div className="w-full md:w-1/2 bg-[#00305e] text-white p-8 md:p-12 lg:p-16 flex flex-col justify-center relative overflow-hidden">
        {/* Background Texture */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20"></div>

        <div className="relative z-10 max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-[#ffcc00]">Deine Vorteile als Partner</h2>

          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="bg-white/10 p-3 rounded-xl h-fit">
                <TrendingUp className="text-[#ffcc00]" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Hohe Provision</h3>
                <p className="text-blue-200 text-sm leading-relaxed">
                  50% Lifetime auf alle Umsätze. Das sind knapp 1€ pro Nutzer jeden Monat.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-white/10 p-3 rounded-xl h-fit">
                <MousePointer className="text-[#ffcc00]" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Einfaches Tracking</h3>
                <p className="text-blue-200 text-sm leading-relaxed">
                  Erhalte einen individuellen Link. Wir tracken jeden Klick und jeden Kauf automatisch.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-white/10 p-3 rounded-xl h-fit">
                <Clock className="text-[#ffcc00]" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Schnelle Auszahlung</h3>
                <p className="text-blue-200 text-sm leading-relaxed">
                  Keine langen Wartezeiten. Wir zahlen monatlich zuverlässig aus.
                </p>
              </div>
            </div>
          </div>

          {/* Testimonial Card */}
          <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex gap-1 text-[#ffcc00] mb-3">
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
            </div>
            <p className="italic text-blue-100 mb-4 font-medium leading-relaxed">
              "Seit ich ResortPassAlarm empfehle, finanziere ich mir meine eigenen Parkbesuche komplett durch die Provisionen."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">
                TM
              </div>
              <div>
                <p className="font-bold text-sm">Thomas M.</p>
                <p className="text-xs text-blue-300">TikTok-Influencer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};