
import React, { useState, useEffect } from 'react';
import { Clock, Zap, Check, HelpCircle, ArrowRight, Loader2, Bell, Shield, Smartphone, MousePointer, Star } from 'lucide-react';
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
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-24 lg:pb-32 bg-[#00305e]">
         {/* Background Effects */}
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
             <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
             <div className="absolute top-40 -left-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
         </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-[#ffcc00] text-sm font-bold mb-8 border border-white/10">
            <Zap size={16} fill="currentColor" /> 24/7 Live-Überwachung aktiv
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-8">
            Verpasse nie wieder den <br />
            <span className="text-[#ffcc00]">ResortPass</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            Der Europa-Park ResortPass ist ständig ausverkauft. Unser Tool prüft die Verfügbarkeit in kurzen Abständen und benachrichtigt dich sofort per E-Mail und SMS.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button onClick={onSignup} size="lg" className="w-full sm:w-auto bg-[#ffcc00] text-[#00305e] hover:bg-yellow-400 border-0 font-bold shadow-xl">
              Überwachung jetzt starten
              <ArrowRight size={20} />
            </Button>
            <Button onClick={scrollToHowItWorks} variant="outline" size="lg" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10">
              Wie es funktioniert
            </Button>
          </div>
          
          {/* Trust Elements */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all">
             <div className="flex items-center gap-2 text-white font-semibold"><Shield size={20}/> Sicherer Checkout</div>
             <div className="flex items-center gap-2 text-white font-semibold"><Clock size={20}/> Keine Wartezeit</div>
             <div className="flex items-center gap-2 text-white font-semibold"><Smartphone size={20}/> SMS-Alarm inklusive</div>
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
      <section id="how-it-works" className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                  Das Problem mit den <br />
                  <span className="text-blue-600">ResortPass "Wellen"</span>
                </h2>
                <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                  <p>
                    Der Europa-Park schaltet neue Jahreskarten oft unangekündigt in kleinen Kontingenten ("Wellen") frei. Diese sind meist nach 10-15 Minuten bereits wieder vergriffen.
                  </p>
                  <p className="font-bold text-[#00305e]">
                    Du kannst nicht den ganzen Tag die Seite aktualisieren. Aber unser Tool kann es!
                  </p>
                  <div className="bg-blue-50 p-6 rounded-2xl border-l-4 border-[#00305e]">
                    <p className="text-[#00305e] font-medium italic">
                      "Wir überwachen die offiziellen Ticket-Seiten für Gold & Silver im Minutentakt. Sobald der Status auf 'Verfügbar' springt, schlägt dein Handy Alarm."
                    </p>
                  </div>
                </div>
            </div>
            <div className="lg:w-1/2 relative">
                <div className="absolute inset-0 bg-[#ffcc00]/10 rounded-3xl -rotate-3"></div>
                <div className="relative bg-[#00305e] rounded-3xl p-8 shadow-2xl text-white">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <Bell className="text-[#ffcc00]" /> So funktioniert dein Alarm
                    </h3>
                    <div className="space-y-8">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold shrink-0">1</div>
                            <div>
                                <p className="font-bold mb-1">Registrierung</p>
                                <p className="text-blue-200 text-sm text-balance">Erstelle dein Konto und gib an, ob du per E-Mail, SMS oder beides benachrichtigt werden willst.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold shrink-0">2</div>
                            <div>
                                <p className="font-bold mb-1">Überwachung</p>
                                <p className="text-blue-200 text-sm text-balance">Unser System prüft rund um die Uhr die Verfügbarkeit direkt im Europa-Park Ticketshop.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#ffcc00] text-[#00305e] flex items-center justify-center font-bold shrink-0">3</div>
                            <div>
                                <p className="font-bold mb-1 text-[#ffcc00]">Sofort-Alarm</p>
                                <p className="text-blue-200 text-sm text-balance">Sobald Karten verfügbar sind, erhältst du binnen Sekunden eine SMS und E-Mail mit dem Direktlink zum Kauf.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Warum ResortPassAlarm?</h2>
            <p className="text-slate-500 mt-4 max-w-2xl mx-auto">Alles was du brauchst, um dir deine Jahreskarte zu sichern.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Clock size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">24/7 Überwachung</h3>
              <p className="text-slate-600">Wir prüfen die Seite auch nachts, am Wochenende und an Feiertagen. Wir schlafen nie.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Maximale Speed</h3>
              <p className="text-slate-600">Unsere Server sind optimiert, um Änderungen sofort zu erkennen und den Alarm ohne Verzögerung zu senden.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                <Smartphone size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">SMS-Alert inklusive</h3>
              <p className="text-slate-600">E-Mails gehen oft im Postfach unter. Mit unserem SMS-Alarm verpasst du die 10-Minuten-Fenster garantiert nicht.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-bold tracking-wider uppercase text-sm">Premium Service</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">Sichere dir deinen ResortPass</h2>
          </div>
          <div className="max-w-4xl mx-auto bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-lg flex flex-col md:flex-row">
            <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">ResortPass Alarm</h3>
              <p className="text-slate-600 mb-8">Voller Zugriff auf alle Alarm-Funktionen für Gold & Silver.</p>
              <div className="mt-auto">
                 <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-bold text-[#00305e]">{price.toFixed(2).replace('.', ',')} €</span>
                    <span className="text-slate-500">/ Monat</span>
                 </div>
                 <p className="text-xs text-slate-400">Jederzeit mit einem Klick im Dashboard kündbar.</p>
              </div>
            </div>
            <div className="bg-white p-8 md:p-12 md:w-1/2 border-t md:border-t-0 md:border-l border-slate-200">
              <ul className="space-y-4">
                {[
                  'Überwachung: ResortPass Gold', 
                  'Überwachung: ResortPass Silver', 
                  'Prüfung in extrem kurzen Abständen', 
                  'Sofortiger E-Mail Alarm', 
                  'Sofortiger SMS Alarm (inklusive)', 
                  'Direktlink zum Mack-Ticketshop'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 text-sm">
                    <div className="bg-green-100 p-1 rounded-full shrink-0">
                      <Check size={14} className="text-green-600" />
                    </div>
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Button onClick={onSignup} className="w-full bg-[#00305e] hover:bg-[#002040] text-white shadow-lg py-4">
                  Jetzt Alarm aktivieren
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Häufige Fragen</h2>
            <p className="text-slate-500 mt-4">Wir klären deine Zweifel.</p>
          </div>
          <div className="space-y-4">
            {[
              { 
                q: "Verkauft ihr selbst ResortPässe?", 
                a: "Nein. Wir sind ein unabhängiger Monitoring-Service. Wir informieren dich lediglich über die Verfügbarkeit im offiziellen Europa-Park Shop, damit du dort schnell zuschlagen kannst." 
              },
              { 
                q: "Wie sicher ist es, dass ich einen Pass bekomme?", 
                a: "Unser Tool erhöht deine Chancen massiv, da du sofort informiert wirst. Da die Kontingente aber begrenzt sind, musst du nach Erhalt des Alarms trotzdem schnell sein. Eine Kaufgarantie können wir nicht geben." 
              },
              { 
                q: "Warum kostet der Service monatlich Geld?", 
                a: "Die ständige Überwachung erfordert leistungsstarke Server und spezialisierte Software-Roboter, die rund um die Uhr laufen. Zudem fallen Kosten für den sofortigen SMS-Versand an." 
              },
              { 
                q: "Kann ich jederzeit kündigen?", 
                a: "Ja, absolut. Du kannst dein Abo jederzeit zum Ende des laufenden Monats direkt in deinem Dashboard mit einem Klick beenden. Es gibt keine versteckten Vertragslaufzeiten." 
              }
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <h3 className="font-bold text-lg text-slate-900 mb-2 flex items-start gap-3">
                  <HelpCircle className="text-blue-600 shrink-0 mt-1" size={20} />
                  {faq.q}
                </h3>
                <p className="text-slate-600 pl-8 leading-relaxed text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
             <div className="inline-flex items-center gap-2 text-slate-400 text-sm">
                <Star size={16} fill="currentColor" className="text-yellow-400" />
                Noch Fragen? Schreibe uns an <a href="mailto:support@resortpassalarm.com" className="underline hover:text-[#00305e]">support@resortpassalarm.com</a>
             </div>
          </div>
        </div>
      </section>

      <Footer navigate={navigate} />
    </div>
  );
};
