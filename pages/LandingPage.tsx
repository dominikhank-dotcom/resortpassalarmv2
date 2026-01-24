
import React, { useState, useEffect } from 'react';
import { Clock, Check, HelpCircle, ArrowRight, Loader2, Lightbulb } from 'lucide-react';
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
    return `Vor ${diff} Minuten`;
  };

  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      {/* Page 1: Hero Section */}
      <section className="bg-[#001529] pt-20 pb-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Verpasse nie wieder den <br />
            <span className="text-[#ffcc00]">ResortPass</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-4 max-w-2xl mx-auto leading-relaxed">
            Der Europa-Park ResortPass ist ständig ausverkauft. Unser Tool prüft die Verfügbarkeit in kurzen Abständen und benachrichtigt dich sofort.
          </p>
          <p className="text-xs text-slate-500 mb-10 font-medium">
            Hinweis: Unabhängiger Service - keine offizielle Seite des Europa-Park Resorts.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button 
              onClick={onSignup}
              className="w-full sm:w-auto bg-[#5046e5] hover:bg-[#4338ca] text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              Jetzt Überwachung Starten <ArrowRight size={20} />
            </button>
            <button 
              onClick={scrollToHowItWorks}
              className="w-full sm:w-auto border-2 border-slate-700 hover:border-slate-500 text-slate-300 px-8 py-4 rounded-xl font-bold text-lg transition-all"
            >
              Wie es funktioniert
            </button>
          </div>
        </div>
      </section>

      {/* Page 1: Status Ticker */}
      <div className="bg-[#000d1a] py-6 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 mb-3">
            <div className="flex items-center gap-2 text-white font-medium">
              <span className={`w-2 h-2 rounded-full ${status.gold === 'available' ? 'bg-green-50 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'}`}></span>
              <span>ResortPass Gold:</span>
              <span className={status.gold === 'available' ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                {status.gold === 'available' ? 'VERFÜGBAR' : 'AUSVERKAUFT'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-white font-medium">
              <span className={`w-2 h-2 rounded-full ${status.silver === 'available' ? 'bg-green-50 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'}`}></span>
              <span>ResortPass Silver:</span>
              <span className={status.silver === 'available' ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                {status.silver === 'available' ? 'VERFÜGBAR' : 'AUSVERKAUFT'}
              </span>
            </div>
          </div>
          <div className="text-slate-500 text-xs flex items-center gap-1">
            <Clock size={12} /> Zuletzt geprüft: {loadingStatus ? '...' : getTimeAgo(status.lastChecked)}
          </div>
        </div>
      </div>

      {/* Page 1/2: Problem & Intro */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">
              Du wartest auf eine Jahreskarte des Europa-Park?
            </h2>
            
            <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
              <p>
                <span className="font-bold text-slate-900">Kennst du das Problem?</span> Du möchtest unbedingt eine Europa-Park Jahreskarte, aber die sind ständig ausverkauft. Und wenn sie wieder angeboten werden, musst du schnell sein. Es werden immer nur eine begrenzte Zahl vom Europa-Park freigegeben.
              </p>
              <p>
                Du kannst nun jeden Tag selbst den Ticket-Shop besuchen und diesen wichtigen Moment doch verpassen, weil du genau dann nicht online warst.
              </p>
            </div>

            {/* Blue Solution Box (Page 2) */}
            <div className="mt-12 bg-blue-50/50 rounded-2xl p-8 md:p-10 border border-blue-100 relative">
              <div className="flex gap-6">
                <div className="hidden md:block">
                  <div className="bg-white p-3 rounded-xl shadow-sm text-[#001529]">
                    <Lightbulb size={32} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-[#001529] mb-4">
                    Oder du nutzt ResortPassAlarm!
                  </h3>
                  <p className="text-slate-700 leading-relaxed mb-6">
                    Wir erledigen das für dich in kurzen Abständen, Tag und Nacht. Sobald Jahreskarten verfügbar sind, erhältst du eine E-Mail und eine SMS auf dein Handy.
                  </p>
                  <p className="text-[#001529] font-bold italic text-lg text-center md:text-left mt-10">
                    So steigen deine Chancen auf eine Jahreskarte erheblich! <br className="hidden md:block" />
                    Sei schnell und schlau! Nutze ResortPassAlarm!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Page 2/3: Pricing / Premium Service */}
      <section className="py-20 px-4 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-[#5046e5] font-bold text-sm tracking-widest uppercase mb-4 block">PREMIUM SERVICE</span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Deine Chance auf eine Jahreskarte</h2>
          <p className="text-slate-500 text-lg mb-16 max-w-2xl mx-auto">
            Egal ob du den ResortPass Gold (inkl. Parken & Wasserwelt) oder den ResortPass Silver suchst – wir sagen dir Bescheid.
          </p>

          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden text-left max-w-4xl mx-auto">
            <div className="p-8 md:p-12">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">ResortPass Alarm</h3>
              
              <div className="flex flex-col md:flex-row gap-10 md:gap-16">
                <div className="flex-1">
                  <p className="text-slate-600 mb-10 leading-relaxed">
                    Verliere keine Zeit mit ständigem Nachsehen auf der Ticket-Seite. Unser System erledigt das für dich und verschafft dir den entscheidenden Vorteil. Rund um die Uhr, 24h am Tag!
                  </p>
                  
                  <div className="mb-10">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-extrabold text-slate-900">{price.toFixed(2).replace('.', ',')} €</span>
                      <span className="text-slate-500 text-xl">/ Monat</span>
                    </div>
                    <p className="text-slate-400 text-sm mt-2 italic">Inkl. MwSt. Monatlich kündbar.</p>
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">ALLES INKLUSIVE</p>
                  <div className="space-y-4 mb-10">
                    {[
                      'Überwachung: Gold & Silver',
                      'Prüfung in kurzen Abständen',
                      'Sofortige E-Mail Alert',
                      'Sofortige SMS Alert',
                      'Direktlink zum Warenkorb',
                      'Jederzeit kündbar'
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="bg-green-100 rounded-full p-0.5">
                          <Check size={16} className="text-green-600" />
                        </div>
                        <span className="text-slate-700 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={onSignup}
                className="w-full bg-[#5046e5] hover:bg-[#4338ca] text-white py-5 rounded-2xl font-bold text-xl transition-all shadow-lg active:scale-[0.98]"
              >
                Jetzt buchen
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Page 3/4: Only Small Waves */}
      <section className="bg-[#001529] py-24 px-4 relative overflow-hidden">
        {/* Background grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-[#ffcc00] text-3xl md:text-4xl font-bold text-center mb-16">
            Nur begrenzt verfügbar
          </h2>

          <div className="grid md:grid-cols-2 gap-12 text-white">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold flex items-center gap-3">
                <span className="text-[#ffcc00]">⚡</span> Warum du schnell sein musst
              </h3>
              <p className="text-slate-300 leading-relaxed text-lg">
                Der Europa-Park gibt ResortPässe oft in nur kleinen Kontingenten frei. Oft sind die Jahreskarten dann nach kurzer Zeit wieder ausverkauft.
              </p>
            </div>
            <div className="space-y-6">
              <h3 className="text-2xl font-bold flex items-center gap-3">
                <span className="text-[#ffcc00]">🕒</span> Die 10-Minuten-Regel
              </h3>
              <p className="text-slate-300 leading-relaxed text-lg">
                Beste Chancen haben alle, die in den ersten 10 Minuten eine Jahreskarte ergattern können! Unser Tool verschafft dir den entscheidenden Zeitvorteil durch sofortige Benachrichtigung.
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <button 
              onClick={onSignup}
              className="bg-[#5046e5] hover:bg-[#4338ca] text-white px-10 py-5 rounded-2xl font-bold text-xl transition-all shadow-xl"
            >
              Überwachung starten
            </button>
          </div>
        </div>
      </section>

      {/* Page 4/5: FAQ */}
      <section className="py-24 px-4 bg-[#f8fafc]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Häufige Fragen</h2>
            <p className="text-slate-500 text-lg">Alles, was du über den ResortPassAlarm wissen musst.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { 
                q: "Ist das ein offizieller Service des EP?", 
                a: "Nein. Dies ist ein unabhängiger Fan-Service, es besteht kein Zusammenhang zum Europa-Park. Dies ist keine offizielle Seite des Europa-Park Resorts." 
              },
              { 
                q: "Was bringt mir ResortPassAlarm?", 
                a: "Du sparst dir das ständige, nervige Neuladen der Ticket-Seite. Unser System prüft rund um die Uhr in kurzen Abständen die Verfügbarkeit und benachrichtigt dich sofort, wenn Gold oder Silver Pässe freigeschaltet werden." 
              },
              { 
                q: "Was kostet der Service?", 
                a: `Der Service kostet nur ${price.toFixed(2).replace('.', ',')} € pro Monat. Das deckt unsere Serverkosten für die ständige Überwachung und die SMS-Kosten ab. Ein kleiner Preis für die Chance auf eine Jahreskarte.` 
              },
              { 
                q: "Kann ich jederzeit kündigen?", 
                a: "Ja, absolut. Du kannst dein Abo jederzeit mit einem einzigen Klick in deinem Dashboard beenden. Es gibt keine langen Vertragslaufzeiten." 
              },
              { 
                q: "Ist das eine Abofalle?", 
                a: "Nein! Wir setzen auf volle Transparenz. Die Zahlungsabwicklung erfolgt sicher über Stripe. Du hast volle Kontrolle über dein Abo und keine versteckten Kosten." 
              },
              { 
                q: "Wie bekomme ich den Alarm?", 
                a: "Sobald Tickets verfügbar sind, erhältst du sofort eine E-Mail. Optional (und kostenlos inklusive) senden wir dir auch eine SMS auf dein Handy, damit du es unterwegs nicht verpasst." 
              },
              { 
                q: "Gibt es eine Jahreskarten-Garantie?", 
                a: "Wir garantieren, dass wir dich benachrichtigen. Da die Kontingente oft sehr klein sind, musst du nach dem Alarm trotzdem schnell sein. Wir verschaffen dir aber den entscheidenden Zeitvorteil gegenüber allen anderen." 
              }
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
                <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-start gap-3">
                  <HelpCircle className="text-[#5046e5] shrink-0 mt-1" size={20} />
                  {faq.q}
                </h4>
                <p className="text-slate-600 leading-relaxed pl-8">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Page 6: Become a Partner */}
      <section className="bg-[#002a52] py-24 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Betreibst du eine Fanseite? <br className="hidden md:block" /> Werde Partner.
          </h2>
          <p className="text-slate-300 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
            Hilf anderen Europa-Park Fans an ihre Tickets zu kommen und verdiene dabei. Unser Partnerprogramm ist fair, transparent und lukrativ.
          </p>
          <div className="flex flex-col items-center gap-4">
            <button 
              onClick={() => navigate('affiliate-signup')}
              className="bg-[#5046e5] hover:bg-[#4338ca] text-white px-10 py-5 rounded-2xl font-bold text-xl transition-all shadow-xl"
            >
              Zum Partnerprogramm
            </button>
            <button 
              onClick={() => navigate('affiliate-info')}
              className="text-[#ffcc00] hover:text-yellow-400 font-bold text-sm mt-4 flex items-center gap-2"
            >
              Mehr Infos und Rechenbeispiele ansehen <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      <Footer navigate={navigate} />
    </div>
  );
};
