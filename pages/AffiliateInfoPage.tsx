import React, { useState } from 'react';
import { ArrowRight, Check, DollarSign, TrendingUp, Users, Shield, Calculator, ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';
import { Footer } from '../components/Footer';

interface AffiliateInfoProps {
  onSignup: () => void;
  onBack: () => void;
  onLogin: () => void;
  commissionRate: number;
  price: number;
  navigate: (page: string) => void;
}

export const AffiliateInfoPage: React.FC<AffiliateInfoProps> = ({ onSignup, onBack, onLogin, commissionRate, price, navigate }) => {
  const [activeUsers, setActiveUsers] = useState(500);
  const pricePerMonth = price;
  const commissionDecimal = commissionRate / 100;
  
  const monthlyEarnings = (activeUsers * pricePerMonth * commissionDecimal).toFixed(2).replace('.', ',');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-grow">
        {/* Hero Section */}
        <section className="bg-[#00305e] text-white pt-20 pb-24 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-800 text-blue-200 text-sm font-bold tracking-wider mb-6 border border-blue-700">
                FÜR FANSEITEN & INFLUENCER
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                Verdiene Geld mit deiner <br />
                <span className="text-[#ffcc00]">Europa-Park Leidenschaft</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
                Das fairste Partnerprogramm der Freizeitpark-Branche. Empfiehl unser Tool und erhalte dauerhaft {commissionRate}% Provision auf alle Umsätze deiner vermittelten Nutzer.
            </p>
            <div className="flex flex-col items-center gap-3">
                <Button onClick={onSignup} size="lg" className="bg-[#ffcc00] text-[#00305e] hover:bg-yellow-400 border-0 font-bold shadow-xl mx-auto">
                    Jetzt kostenlos Partner werden
                    <ArrowRight size={20} />
                </Button>
                <button onClick={onLogin} className="text-blue-200 text-sm hover:text-white hover:underline">
                    Schon Partner? Hier einloggen.
                </button>
            </div>
            </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
            <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <TrendingUp size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{commissionRate}% Provision</h3>
                <p className="text-slate-600 leading-relaxed">
                Du erhältst {commissionRate}% des Umsatzes. Bei jedem Abo-Abschluss und jeder Verlängerung. Das ist einer der höchsten Sätze der Branche.
                </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
                <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-6">
                <Users size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Lifetime Vergütung</h3>
                <p className="text-slate-600 leading-relaxed">
                Solange der Kunde das Abo behält, wirst du jeden Monat bezahlt. Einmal werben, immer wieder verdienen.
                </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
                <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-6">
                <DollarSign size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Monatliche Auszahlung</h3>
                <p className="text-slate-600 leading-relaxed">
                Wir überweisen dein Guthaben pünktlich zum Monatsanfang direkt auf dein Bankkonto (via Stripe). Zuverlässig und schnell.
                </p>
            </div>
            </div>
        </section>

        {/* Calculator Section */}
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                
                {/* Text Side */}
                <div className="lg:w-1/2">
                <h2 className="text-3xl font-bold text-slate-900 mb-6">
                    Lohnt sich das? <br/>
                    <span className="text-blue-600">Ein Rechenbeispiel.</span>
                </h2>
                <div className="prose prose-lg text-slate-600 mb-8">
                    <p>
                    Viele Fanseiten und Gruppen haben Tausende Mitglieder. Da der ResortPass extrem begehrt ist, sind die Abschlussraten sehr hoch.
                    </p>
                    <p>
                    Angenommen, du nutzt einen Aktionspreis von {pricePerMonth.toFixed(2).replace('.', ',')} € für deine Community:
                    </p>
                </div>
                
                <ul className="space-y-4">
                    <li className="flex items-center gap-3">
                    <div className="bg-green-100 p-1 rounded-full"><Check size={16} className="text-green-600"/></div>
                    <span className="font-medium text-slate-900">Keine Kosten für dich</span>
                    </li>
                    <li className="flex items-center gap-3">
                    <div className="bg-green-100 p-1 rounded-full"><Check size={16} className="text-green-600"/></div>
                    <span className="font-medium text-slate-900">Kein technisches Wissen nötig</span>
                    </li>
                    <li className="flex items-center gap-3">
                    <div className="bg-green-100 p-1 rounded-full"><Check size={16} className="text-green-600"/></div>
                    <span className="font-medium text-slate-900">Live-Dashboard mit deinen Einnahmen</span>
                    </li>
                </ul>
                </div>

                {/* Calculator Side */}
                <div className="lg:w-1/2 w-full">
                <div className="bg-[#00305e] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                    {/* Background FX */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>

                    <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6 text-blue-200 uppercase text-xs font-bold tracking-widest">
                        <Calculator size={14} /> Deine Einnahmen-Prognose
                    </div>

                    <div className="space-y-8">
                        <div>
                        <label className="block text-sm font-medium text-blue-200 mb-2">
                            Anzahl geworbener Mitglieder
                        </label>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-3xl font-bold text-white">{activeUsers}</span>
                            <span className="text-blue-300 text-sm">Aktive Abos</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="2000" 
                            step="10"
                            value={activeUsers}
                            onChange={(e) => setActiveUsers(parseInt(e.target.value))}
                            className="w-full h-2 bg-blue-800 rounded-lg appearance-none cursor-pointer accent-[#ffcc00]"
                        />
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-6 border-t border-blue-700/50 border-b">
                        <div>
                            <p className="text-xs text-blue-300 uppercase">Preis pro Abo</p>
                            <p className="text-lg font-semibold">x {pricePerMonth.toFixed(2).replace('.', ',')} €</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-blue-300 uppercase">Deine Provision</p>
                            <p className="text-lg font-semibold text-[#ffcc00]">{commissionRate}%</p>
                        </div>
                        </div>

                        <div>
                        <p className="text-sm text-blue-200 mb-1">Dein monatlicher Verdienst:</p>
                        <p className="text-5xl font-bold text-[#ffcc00]">{monthlyEarnings} €</p>
                        <p className="text-xs text-blue-300 mt-2">Jeden Monat, solange die Abos laufen.</p>
                        </div>
                    </div>
                    </div>
                </div>
                </div>

            </div>
            </div>
        </section>

        {/* Steps Section */}
        <section className="py-20 bg-slate-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-16">So einfach geht's</h2>
            
            <div className="grid md:grid-cols-3 gap-12 relative">
                {/* Connecting Line (Desktop only) */}
                <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-slate-200 -z-10 transform -translate-y-1/2"></div>

                <div className="relative bg-slate-50 px-4">
                <div className="w-12 h-12 bg-[#00305e] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6 shadow-md">1</div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Anmelden</h3>
                <p className="text-slate-600 text-sm">Registriere dich kostenlos in 30 Sekunden für das Partnerprogramm.</p>
                </div>

                <div className="relative bg-slate-50 px-4">
                <div className="w-12 h-12 bg-[#00305e] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6 shadow-md">2</div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Link teilen</h3>
                <p className="text-slate-600 text-sm">Poste deinen individuellen Link auf deiner Fanseite, Instagram oder in Foren.</p>
                </div>

                <div className="relative bg-slate-50 px-4">
                <div className="w-12 h-12 bg-[#00305e] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6 shadow-md">3</div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Geld verdienen</h3>
                <p className="text-slate-600 text-sm">Lehn dich zurück. Du wirst automatisch benachrichtigt, wenn du Provision erhältst.</p>
                </div>
            </div>
            </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-white border-t border-slate-100">
            <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Bereit, mit deiner Community Geld zu verdienen?</h2>
            <p className="text-lg text-slate-600 mb-10">
                Es gibt kein Risiko, keine versteckten Kosten und du kannst jederzeit aufhören.
            </p>
            
            <div className="flex flex-col items-center gap-4">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                    <Button onClick={onSignup} size="lg" className="w-full sm:w-auto bg-[#00305e] hover:bg-[#002040] text-white shadow-xl">
                    Jetzt Partner Account erstellen
                    </Button>
                    <Button onClick={onBack} variant="outline" size="lg" className="w-full sm:w-auto">
                    <ArrowLeft size={20} />
                    Zurück zur Startseite
                    </Button>
                </div>
                <button onClick={onLogin} className="text-slate-400 text-sm hover:text-[#00305e] hover:underline mt-2">
                    Schon Partner? Hier einloggen.
                </button>
            </div>
            <p className="mt-6 text-sm text-slate-400">Dauert nur 3 Minuten.</p>
            </div>
        </section>
      </div>
      
      <Footer navigate={navigate} />
    </div>
  );
};