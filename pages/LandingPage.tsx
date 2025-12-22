
import React, { useState, useEffect } from 'react';
import { Clock, Zap, Check, HelpCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../components/Button';
import { Footer } from '../components/Footer';
import { getSystemSettings } from '../services/backendService';

interface LandingProps {
  onSignup: () => void;
  onAffiliate: () => void;
  onAffiliateInfo: () => void;
  navigate: (page: string) => void;
  price: number;
}

export const LandingPage: React.FC<LandingProps> = ({ onSignup, onAffiliate, onAffiliateInfo, navigate, price }) => {
  const [status, setStatus] = useState({
    gold: 'sold_out',
    silver: 'sold_out',
    lastChecked: null as string | null
  });
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const settings = await getSystemSettings();
        if (settings) {
          setStatus({
            gold: settings.status_gold || 'sold_out',
            silver: settings.status_silver || 'sold_out',
            lastChecked: settings.last_checked || null
          });
        }
      } catch (e) {
        console.error("Failed to load status", e);
      } finally {
        setLoadingStatus(false);
      }
    };
    fetchStatus();
  }, []);

  const getTimeAgo = (isoString: string | null) => {
    if (!isoString) return "Warte auf Daten...";
    const diff = Math.floor((new Date().getTime() - new Date(isoString).getTime()) / 60000);
    if (diff < 1) return "Gerade eben";
    if (diff === 1) return "Vor 1 Minute";
    if (diff > 60) return "Vor > 1 Stunde";
    return `Vor ${diff} Minuten`;
  };

  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-24 lg:pb-32 bg-slate-900">
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
             <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#00305e] rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
             <div className="absolute top-40 -left-40 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
         </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-8">
            Verpasse nie wieder den <br />
            <span className="text-[#ffcc00]">ResortPass</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Der Europa-Park ResortPass ist ständig ausverkauft. Unser Tool prüft die Verfügbarkeit in kurzen Abständen und benachrichtigt dich sofort.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button onClick={onSignup} size="lg" className="w-full sm:w-auto bg-[#ffcc00] text-[#00305e] hover:bg-yellow-400 border-0 font-bold">
              Jetzt Überwachung Starten
              <ArrowRight size={20} />
            </Button>
            <Button onClick={scrollToHowItWorks} variant="outline" size="lg" className="w-full sm:w-auto border-slate-600 text-slate-300 hover:text-white hover:border-white hover:bg-transparent">
              Wie es funktioniert
            </Button>
          </div>
        </div>
      </section>

      {/* Status Ticker */}
      <div className="bg-slate-950 border-y border-slate-800 py-3 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-sm gap-2">
          {loadingStatus ? (
             <div className="flex items-center gap-2 text-slate-500">
                <Loader2 size={14} className="animate-spin" /> Lade Live-Status...
             </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 font-mono items-center w-full sm:w-auto">
                <div className="flex items-center gap-2 text-slate-300">
                <span className={`h-2 w-2 rounded-full ${status.gold === 'available' ? 'bg-green-500' : 'bg-red-500'} ${status.lastChecked ? 'animate-pulse' : ''}`}></span>
                ResortPass Gold: <span className={`${status.gold === 'available' ? 'text-green-400' : 'text-red-400'} font-bold uppercase`}>{status.gold === 'available' ? 'VERFÜGBAR' : 'Ausverkauft'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                <span className={`h-2 w-2 rounded-full ${status.silver === 'available' ? 'bg-green-500' : 'bg-red-500'} ${status.lastChecked ? 'animate-pulse' : ''}`}></span>
                ResortPass Silver: <span className={`${status.silver === 'available' ? 'text-green-400' : 'text-red-400'} font-bold uppercase`}>{status.silver === 'available' ? 'VERFÜGBAR' : 'Ausverkauft'}</span>
                </div>
            </div>
          )}
          <div className="text-slate-500 text-xs flex items-center gap-1 mt-2 sm:mt-0"><Clock size={12} /> Zuletzt geprüft: {loadingStatus ? '...' : getTimeAgo(status.lastChecked)}</div>
        </div>
      </div>

      {/* Intro Section */}
      <section id="how-it-works" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-slate-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-48 h-48 bg-[#ffcc00] rounded-full mix-blend-multiply filter blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2"></div>
             <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 relative z-10">Du wartest auf eine Jahreskarte des Europa-Park?</h2>
             <div className="space-y-6 text-lg text-slate-600 leading-relaxed relative z-10">
                <p>Du kannst jeden Tag selbst den Ticket-Shop besuchen und diesen wichtigen Moment doch verpassen. <span className="font-bold text-[#00305e]">Oder du nutzt ResortPassAlarm!</span></p>
                <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-[#00305e] my-8">
                    <p className="text-slate-700 text-base">Wir erledigen das für dich Tag und Nacht. Sobald Jahreskarten verfügbar sind, erhältst du eine E-Mail und eine SMS.</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-bold tracking-wider uppercase text-sm">Premium Service</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">Deine Chance auf eine Jahreskarte</h2>
          </div>
          <div className="max-w-4xl mx-auto bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-lg flex flex-col md:flex-row">
            <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">ResortPass Alarm</h3>
              <div className="mt-auto">
                 <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-bold text-[#00305e]">{price.toFixed(2).replace('.', ',')} €</span>
                    <span className="text-slate-500">/ Monat</span>
                 </div>
              </div>
            </div>
            <div className="bg-white p-8 md:p-12 md:w-1/2 border-t md:border-t-0 md:border-l border-slate-200">
              <ul className="space-y-4">
                {['Überwachung: Gold & Silver', 'Prüfung in kurzen Abständen', 'Sofortige E-Mail Alert', 'Sofortige SMS Alert', 'Jederzeit kündbar'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700"><div className="bg-green-100 p-1 rounded-full"><Check size={14} className="text-green-600" /></div><span className="font-medium">{item}</span></li>
                ))}
              </ul>
              <div className="mt-8"><Button onClick={onSignup} className="w-full bg-[#00305e] hover:bg-[#002040] text-white">Jetzt buchen</Button></div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16"><h2 className="text-3xl font-bold text-slate-900">Häufige Fragen</h2></div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { q: "Was bringt mir ResortPassAlarm?", a: "Du sparst dir das ständige Neuladen der Ticket-Seite. Wir prüfen die Verfügbarkeit rund um die Uhr." },
              { q: "Was kostet der Service?", a: `Der Service kostet nur ${price.toFixed(2).replace('.', ',')} € pro Monat.` }
            ].map((faq, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-6 border border-slate-200 h-full">
                <h3 className="font-bold text-lg text-slate-900 mb-2 flex items-start gap-3"><HelpCircle className="text-blue-600 shrink-0 mt-1" size={20} />{faq.q}</h3>
                <p className="text-slate-600 pl-8">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer navigate={navigate} />
    </div>
  );
};
