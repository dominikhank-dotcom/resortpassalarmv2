import React from 'react';
import { Clock, Zap, Check, HelpCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import { Footer } from '../components/Footer';

interface LandingProps {
  onSignup: () => void;
  onAffiliate: () => void;
  onAffiliateInfo: () => void;
  navigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingProps> = ({ onSignup, onAffiliate, onAffiliateInfo, navigate }) => {
  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
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
            Der Europa-Park ResortPass ist ständig ausverkauft. Unser Tool prüft die Verfügbarkeit rund um die Uhr und benachrichtigt dich in Sekunden.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button onClick={onSignup} size="lg" className="w-full sm:w-auto bg-[#ffcc00] text-[#00305e] hover:bg-yellow-400 border-0 font-bold">
              Jetzt Überwachung Starten
              <ArrowRight size={20} />
            </Button>
            <Button onClick={scrollToFeatures} variant="outline" size="lg" className="w-full sm:w-auto border-slate-600 text-slate-300 hover:text-white hover:border-white hover:bg-transparent">
              Wie es funktioniert
            </Button>
          </div>
        </div>
      </section>

      {/* Status Ticker */}
      <div className="bg-slate-950 border-y border-slate-800 py-3 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-sm gap-2">
          <div className="flex gap-6 font-mono">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
              ResortPass Gold: <span className="text-red-400 font-bold uppercase">Ausverkauft</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
              ResortPass Silver: <span className="text-red-400 font-bold uppercase">Ausverkauft</span>
            </div>
          </div>
          <div className="text-slate-500 text-xs flex items-center gap-1">
            <Clock size={12} /> Zuletzt geprüft: Vor 1 Minute
          </div>
        </div>
      </div>

      {/* Premium Service & Pricing */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-bold tracking-wider uppercase text-sm">Premium Service</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">Deine Chance auf eine Jahreskarte</h2>
            <p className="mt-4 text-slate-500 max-w-2xl mx-auto">
              Egal ob du den ResortPass Gold (inkl. Parken & Wasserwelt) oder den ResortPass Silver suchst – wir sagen dir Bescheid.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-lg flex flex-col md:flex-row">
            {/* Left: Pitch */}
            <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">ResortPass Alarm</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Verliere keine Zeit mit ständigem Nachsehen auf der Ticket-Seite. Unser System erledigt das für dich und verschafft dir den entscheidenden Vorteil. Rund um die Uhr, 24h am Tag!
              </p>
              <div className="mt-auto">
                 <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-bold text-[#00305e]">1,99 €</span>
                    <span className="text-slate-500">/ Monat</span>
                 </div>
                 <p className="text-xs text-slate-400">Inkl. MwSt. Monatlich kündbar.</p>
              </div>
            </div>

            {/* Right: Features */}
            <div className="bg-white p-8 md:p-12 md:w-1/2 border-t md:border-t-0 md:border-l border-slate-200">
              <h4 className="font-bold text-slate-900 mb-6 uppercase text-sm tracking-wide">Alles Inklusive</h4>
              <ul className="space-y-4">
                {[
                  'Überwachung: Gold & Silver',
                  '5-Minuten Intervalle',
                  'Sofortige E-Mail Alert',
                  'Sofortige SMS Alert',
                  'Direktlink zum Warenkorb',
                  'Jederzeit kündbar'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700">
                    <div className="bg-green-100 p-1 rounded-full">
                      <Check size={14} className="text-green-600" />
                    </div>
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button onClick={onSignup} className="w-full bg-[#00305e] hover:bg-[#002040] text-white">
                  Jetzt buchen
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Urgency Section */}
      <section className="py-20 bg-[#00305e] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl font-bold mb-6 text-[#ffcc00]">Nur kleine Wellen</h2>
          <div className="grid md:grid-cols-2 gap-12 text-left mt-12">
            <div>
               <h3 className="text-xl font-bold mb-3 flex items-center gap-2"><Zap className="text-[#ffcc00]" /> Warum du schnell sein musst</h3>
               <p className="text-blue-100 leading-relaxed">
                 Der Europa-Park gibt ResortPässe oft unangekündigt und nur in sehr kleinen Kontingenten frei. Oft sind diese "Wellen" nach wenigen Minuten wieder vorbei.
               </p>
            </div>
            <div>
               <h3 className="text-xl font-bold mb-3 flex items-center gap-2"><Clock className="text-[#ffcc00]" /> Die 10-Minuten-Regel</h3>
               <p className="text-blue-100 leading-relaxed">
                 Wer nicht innerhalb von 10 Minuten nach Freischaltung bucht, geht meistens leer aus. Unser Tool verschafft dir den entscheidenden Zeitvorteil durch sofortige Benachrichtigung.
               </p>
            </div>
          </div>
          <div className="mt-12 flex justify-center">
            <Button onClick={onSignup} size="lg" className="bg-[#ffcc00] text-[#00305e] hover:bg-yellow-400 font-bold border-0 shadow-xl">
              Überwachung starten
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Häufige Fragen</h2>
            <p className="mt-4 text-slate-500">Alles, was du über den ResortPassAlarm wissen musst.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                q: "Was bringt mir ResortPassAlarm?",
                a: "Du sparst dir das ständige, nervige Neuladen der Ticket-Seite. Unser System prüft rund um die Uhr im Minutentakt die Verfügbarkeit und benachrichtigt dich sofort, wenn Gold oder Silver Pässe freigeschaltet werden."
              },
              {
                q: "Was kostet der Service?",
                a: "Der Service kostet nur 1,99 € pro Monat. Das deckt unsere Serverkosten für die ständige Überwachung und die SMS-Kosten ab. Ein kleiner Preis für die Chance auf eine Jahreskarte."
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
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 h-full">
                <h3 className="font-bold text-lg text-slate-900 mb-2 flex items-start gap-3">
                  <HelpCircle className="text-blue-600 shrink-0 mt-1" size={20} />
                  {faq.q}
                </h3>
                <p className="text-slate-600 pl-8">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Affiliate Section */}
      <section id="partner" className="relative py-24 overflow-hidden bg-[#00305e]">
         <div className="absolute inset-0 pointer-events-none">
             <div className="absolute inset-0 bg-[#00305e] z-0"></div>
             <img 
               src="https://images.unsplash.com/photo-1513883049090-d0b7439799bf?q=80&w=2070&auto=format&fit=crop" 
               alt="Roller Coaster Structure Schematic" 
               className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale z-0"
             />
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:40px_40px] z-0"></div>
             <div className="absolute inset-0 bg-gradient-to-t from-[#00305e] via-[#00305e]/80 to-[#00305e]/30 z-0"></div>
         </div>

         <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Betreibst du eine Fanseite? <br/> Werde Partner.</h2>
            <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              Hilf anderen Europa-Park Fans an ihre Tickets zu kommen und verdiene dabei. 
              Unser Partnerprogramm ist fair, transparent und lukrativ.
            </p>
            
            <Button onClick={onAffiliateInfo} size="lg" className="bg-[#ffcc00] text-[#00305e] hover:bg-yellow-400 border-0 mx-auto font-bold shadow-xl transform hover:scale-105 transition-all">
              Zum Partnerprogramm
            </Button>
            
            <div className="mt-8">
              <button onClick={onAffiliateInfo} className="text-white/90 hover:text-white font-medium inline-flex items-center gap-2 group transition-colors">
                Mehr Infos und Rechenbeispiele ansehen
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform text-[#ffcc00]" />
              </button>
            </div>
         </div>
      </section>

      <Footer navigate={navigate} />
    </div>
  );
};