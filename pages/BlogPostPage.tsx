
import React from 'react';
import { ArrowLeft, ArrowRight, Calendar, Share2, ChevronRight, Check, Zap, Bell, Clock, Info, ShieldCheck, AlertTriangle, Star, DollarSign, Target, Calculator, AlertCircle, X, HelpCircle, CheckCircle, Ticket, ShoppingBag, UserCheck, Timer, MousePointer2, Map, Bed, Users, TrendingUp } from 'lucide-react';
import { Button } from '../components/Button';
import { Footer } from '../components/Footer';
import { BLOG_POSTS } from './BlogOverviewPage';

interface BlogPostPageProps {
  slug: string;
  navigate: (page: string) => void;
}

export const BlogPostPage: React.FC<BlogPostPageProps> = ({ slug, navigate }) => {
  const postInfo = BLOG_POSTS.find(p => p.slug === slug);
  
  if (!postInfo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Beitrag nicht gefunden</h2>
        <Button onClick={() => navigate('blog')}>Zum Blog zurück</Button>
      </div>
    );
  }

  // Common CTA component for insertion within blog posts
  const BlogInjectedCTA = ({ variant = 1 }: { variant?: 1 | 2 }) => {
    if (variant === 1) {
      return (
        <div className="my-12 bg-[#001529] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden not-prose border-l-8 border-[#ffcc00]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4 text-[#ffcc00] font-bold uppercase tracking-widest text-sm">
              <Zap size={18} fill="currentColor" /> Der entscheidende Zeitvorteil
            </div>
            <h3 className="text-2xl font-extrabold mb-4 text-white">ResortPass ausverkauft?</h3>
            <p className="text-blue-100 mb-8 text-lg leading-relaxed">
              Verliere keine Zeit mit manuellem Suchen. Unser Wächter überwacht die Server 24/7 für dich und schickt dir sofort eine <strong>E-Mail & SMS</strong>, wenn neue Kontingente frei werden.
            </p>
            <Button onClick={() => navigate('landing')} className="bg-[#5046e5] hover:bg-indigo-700 text-white border-0 px-8 py-4 font-bold text-lg w-full sm:w-auto shadow-lg shadow-indigo-500/20">
              Jetzt Alarm aktivieren <ArrowRight size={20} className="ml-2" />
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div className="my-12 bg-white rounded-3xl p-8 shadow-xl border border-indigo-100 flex flex-col md:flex-row items-center gap-8 not-prose">
        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
          <Bell size={32} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="text-xl font-bold text-slate-900 mb-1">Erhöhe deine Chancen massiv!</h4>
          <p className="text-slate-600 text-sm">Unser System benachrichtigt dich in Echtzeit über neue Verfügbarkeiten – oft Stunden bevor andere es merken.</p>
        </div>
        <Button onClick={() => navigate('landing')} variant="outline" className="whitespace-nowrap border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-bold">
          Mehr erfahren
        </Button>
      </div>
    );
  };

  const renderContent = () => {
    switch (slug) {
      case 'resortpass-vs-einzeltickets':
        return (
          <div className="space-y-10">
            <div className="bg-blue-50 border-l-8 border-[#00305e] p-8 rounded-r-3xl shadow-sm">
                <h2 className="text-2xl font-bold text-[#00305e] mb-6 m-0 flex items-center gap-3"><Calculator className="text-blue-600"/> 📋 Wirtschaftlichkeits-Check 2026</h2>
                <ul className="list-none p-0 space-y-4 m-0 text-lg text-slate-700">
                    <li className="flex items-start gap-3"><Check size={20} className="text-green-600 shrink-0 mt-1" /> <strong>Silver-Amortisation:</strong> Bereits ab dem 5. Besuch profitabel.</li>
                    <li className="flex items-start gap-3"><Check size={20} className="text-green-600 shrink-0 mt-1" /> <strong>Gold-Amortisation:</strong> Ab dem 7. Besuch (oder früher mit Rulantica).</li>
                    <li className="flex items-start gap-3"><Check size={20} className="text-green-600 shrink-0 mt-1" /> <strong>Versteckte Ersparnis:</strong> Partnerparks sparen zusätzlich bis zu 400 € pro Jahr.</li>
                    <li className="flex items-start gap-3"><Check size={20} className="text-green-600 shrink-0 mt-1" /> <strong>Parkgebühren:</strong> Der ParkingPass spart 10 € pro Besuchstag.</li>
                </ul>
            </div>

            <p className="text-xl leading-relaxed">
              Wer den Europa-Park liebt, steht früher oder später vor der großen Frage: Lohnt sich die Anschaffung eines ResortPass wirklich, oder fahre ich mit Einzeltickets am Ende günstiger? In Zeiten steigender Lebenshaltungskosten und dynamischer Ticketpreise ist eine genaue Kalkulation wichtiger denn je. In diesem umfassenden Guide analysieren wir die Kostenstruktur für die Saison 2026, decken versteckte Sparpotentiale auf und zeigen dir, ab welchem Punkt die Jahreskarte nicht nur ein emotionaler Gewinn, sondern ein echtes finanzielles Schnäppchen ist.
            </p>

            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-slate-100 pb-4">1. Die Ausgangslage: Ticketpreise 2026</h2>
            <p>
              Um einen fairen Vergleich anzustellen, müssen wir wissen, was ein Tag im Europa-Park ohne Jahreskarte kostet. Für 2026 liegen die Preise für ein Standard-Tagesticket (Erwachsene) im Durchschnitt bei etwa 68,00 €. Je nach Saison kann dieser Preis schwanken – in der Nebensaison startest du bei ca. 64,50 €, während an besucherstarken Tagen in der Hauptsaison oder zu Events wie Halloween bis zu 73,00 € fällig werden.
            </p>
            <div className="grid md:grid-cols-2 gap-6 my-8">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-2">Durchschnitt Ticket</h4>
                    <p className="text-3xl font-black text-[#00305e]">68,00 €</p>
                    <p className="text-xs text-slate-500">Basis für unsere Rechnung</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-2">Parkgebühr</h4>
                    <p className="text-3xl font-black text-[#00305e]">10,00 €</p>
                    <p className="text-xs text-slate-500">Pro PKW und Tag</p>
                </div>
            </div>

            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-slate-100 pb-4">2. Szenario: Der ResortPass Silver (295 €)</h2>
            <p>
              Der Silver Pass ist der Einstieg in die Welt der Jahreskarten. Mit einem Preis von 295,00 € für Erwachsene ermöglicht er den Zugang an über 230 definierten Tagen im Jahr.
            </p>
            <div className="bg-white border-2 border-indigo-100 p-8 rounded-3xl shadow-lg my-8">
                <h3 className="text-2xl font-bold text-indigo-900 mb-6 flex items-center gap-2"><TrendingUp /> Die Silver-Rechnung</h3>
                <div className="space-y-4 text-lg">
                    <p className="flex justify-between border-b pb-2"><span>Kosten ResortPass Silver</span> <span className="font-bold">295,00 €</span></p>
                    <p className="flex justify-between border-b pb-2"><span>Gegenwert Tagestickets (Ø 68 €)</span> <span className="font-bold text-slate-400">x 4,3</span></p>
                    <p className="flex justify-between text-indigo-600 font-black text-2xl pt-4"><span>Gewinnzone ab</span> <span>5. Besuch</span></p>
                </div>
            </div>
            <p>
              <strong>Das bedeutet:</strong> Wer plant, mindestens fünfmal im Jahr nach Rust zu reisen, für den ist der Silver Pass finanziell bereits profitabel. Ab dem sechsten Besuch "verdienst" du bei jedem Eintritt bares Geld im Vergleich zum Einzelkauf.
            </p>

            <BlogInjectedCTA variant={1} />

            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-slate-100 pb-4">3. Szenario: Der ResortPass Gold (475 €)</h2>
            <p>
              Der Gold Pass ist das "Rundum-Sorglos-Paket". Für 475,00 € gibt es keine Sperrtage und zwei Tagestickets für die Wasserwelt Rulantica sind bereits inklusive.
            </p>
            <div className="bg-[#00305e] text-white p-8 rounded-3xl shadow-xl my-8 relative overflow-hidden">
                <h3 className="text-2xl font-bold mb-6 text-yellow-400">Die Gold-Rechnung (mit Rulantica)</h3>
                <div className="space-y-3">
                    <p className="flex justify-between"><span>Anschaffungspreis Gold</span> <span>475,00 €</span></p>
                    <p className="flex justify-between text-blue-200"><span>Wert 2x Rulantica Tickets (ca.)</span> <span>- 92,00 €</span></p>
                    <p className="flex justify-between font-bold border-t border-blue-700 pt-3"><span>Effektiver Preis Europa-Park</span> <span>383,00 €</span></p>
                    <p className="flex justify-between text-yellow-400 font-black text-2xl pt-6 uppercase"><span>Gewinnzone ab</span> <span>5,6 Besuchen</span></p>
                </div>
            </div>
            <p>
              Wenn du die Rulantica-Tickets ohnehin nutzen würdest, amortisiert sich der Gold Pass fast so schnell wie der Silver Pass (nach ca. 6 Besuchen). Ohne Berücksichtigung von Rulantica liegt die Schwelle bei etwa 7 Besuchstagen.
            </p>

            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-slate-100 pb-4">4. Versteckte Ersparnisse: Mehr als nur Eintritt</h2>
            <p>
              Die reine Ticket-Kalkulation ist oft nur die halbe Wahrheit. Ein ResortPass bringt Vorteile mit sich, die in der Gesamtrechnung oft Hunderte Euro ausmachen:
            </p>
            <ul className="space-y-6">
                <li className="flex gap-4 items-start">
                    <div className="bg-green-100 p-2 rounded-lg text-green-600 shrink-0"><Map size={24} /></div>
                    <div>
                        <h4 className="font-bold text-slate-900">Kostenlose Partnerparks</h4>
                        <p className="text-slate-600">Mit dem Pass besuchst du 7 Partnerparks (u.a. Efteling, Liseberg, PortAventura) je einmal kostenlos. Wert pro Besuch: ca. 50 €. Wer zwei dieser Parks im Urlaub nutzt, spart bereits 100 € zusätzlich.</p>
                    </div>
                </li>
                <li className="flex gap-4 items-start">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600 shrink-0"><Ticket size={24} /></div>
                    <div>
                        <h4 className="font-bold text-slate-900">Der ParkingPass Effekt</h4>
                        <p className="text-slate-600">Für 39 € pro Jahr parkst du unbegrenzt. Ohne diesen Pass zahlst du 10 € pro Tag. Wer 10-mal kommt, spart hier allein 61,00 €.</p>
                    </div>
                </li>
                <li className="flex gap-4 items-start">
                    <div className="bg-purple-100 p-2 rounded-lg text-purple-600 shrink-0"><Zap size={24} /></div>
                    <div>
                        <h4 className="font-bold text-slate-900">VEEJOY Premium</h4>
                        <p className="text-slate-600">Der Zugang zu Premium-Inhalten auf der Streaming-Plattform ist inklusive (Wert ca. 30 €/Jahr).</p>
                    </div>
                </li>
            </ul>

            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-slate-100 pb-4">5. Der psychologische Faktor: Freiheit statt Nutzungszwang</h2>
            <p>
              Dies ist ein Punkt, der in keiner Excel-Tabelle auftaucht, aber für viele Inhaber entscheidend ist. Wenn du 73 € für ein Tagesticket zahlst, stehst du unter dem Druck, den Park von 9:00 bis 18:00 Uhr "auszunutzen". Du bleibst auch bei Regen, du rennst von Attraktion zu Attraktion, auch wenn du müde bist.
            </p>
            <div className="bg-amber-50 p-8 rounded-3xl border border-amber-100 italic text-slate-700 text-lg leading-relaxed">
              "Seit ich den ResortPass habe, gehe ich viel entspannter durch den Park. Wenn es zu voll ist oder ich nach 4 Stunden keine Lust mehr habe, gehe ich einfach. Ich weiß ja, dass ich nächste Woche kostenlos wiederkommen kann. Das ist wahre Lebensqualität."
            </div>

            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-slate-100 pb-4">6. Fazit: Für wen lohnt sich was?</h2>
            <div className="overflow-x-auto my-8">
                <table className="w-full border-collapse bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                    <thead className="bg-slate-900 text-white">
                        <tr>
                            <th className="p-4 text-left">Besuchstyp</th>
                            <th className="p-4 text-center">Empfehlung</th>
                            <th className="p-4 text-left">Grund</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        <tr><td className="p-4">1-3 Besuche / Jahr</td><td className="p-4 text-center font-bold">Einzeltickets</td><td className="p-4 text-sm text-slate-500">Finanziell lohnt sich der Pass noch nicht.</td></tr>
                        <tr className="bg-blue-50/50"><td className="p-4">4-6 Besuche / Jahr</td><td className="p-4 text-center font-bold text-indigo-600">ResortPass Silver</td><td className="p-4 text-sm text-slate-500">Das beste Preis-Leistungs-Verhältnis.</td></tr>
                        <tr><td className="p-4">7+ Besuche / Jahr</td><td className="p-4 text-center font-bold text-yellow-600">ResortPass Gold</td><td className="p-4 text-sm text-slate-500">Maximale Freiheit & Rulantica-Boni.</td></tr>
                        <tr><td className="p-4">Reisende (Partnerparks)</td><td className="p-4 text-center font-bold">Jeder Pass</td><td className="p-4 text-sm text-slate-500">Dank Gratis-Eintritten in Europa extrem wertvoll.</td></tr>
                    </tbody>
                </table>
            </div>

            <BlogInjectedCTA variant={2} />

            <p className="text-lg leading-relaxed font-bold">Das größte Hindernis ist jedoch nicht der Preis, sondern die Verfügbarkeit.</p>
            <p>
              Wie du sicher weißt, ist der ResortPass oft über Monate hinweg "ausverkauft". Die Ersparnis nützt dir nur etwas, wenn du im richtigen Moment zuschlägst. Mit unserem **ResortPassAlarm** stellen wir sicher, dass du die nächste Freischaltung nicht verpasst und dir deine Jahreskarte sicherst, bevor die Kontingente wieder erschöpft sind.
            </p>

            <div className="bg-[#00305e] text-white p-12 rounded-3xl shadow-2xl text-center">
                <h3 className="text-3xl font-black text-[#ffcc00] mb-6 m-0 uppercase tracking-widest">Warte nicht länger!</h3>
                <p className="text-blue-100 mb-10 max-w-2xl mx-auto text-lg">
                  Sichere dir hunderte Euro Ersparnis pro Jahr. Wir informieren dich sofort per SMS und E-Mail, wenn der ResortPass wieder verfügbar ist.
                </p>
                <Button onClick={() => navigate('landing')} className="bg-[#ffcc00] text-[#00305e] border-0 mx-auto font-black px-12 py-5 text-2xl hover:scale-105 shadow-2xl transition-all">
                    Alarm jetzt aktivieren
                </Button>
            </div>

            <hr className="my-12 border-slate-200" />
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-xs italic">
                <p>Zuletzt aktualisiert am: 23. Dezember 2025</p>
                <p>Preise basierend auf offiziellen Angaben des Europa-Park.</p>
            </div>
          </div>
        );

      case 'resortpass-familien-guide':
        return (
          <div className="space-y-10">
            <div className="bg-indigo-50 border-l-8 border-indigo-600 p-8 rounded-r-3xl shadow-sm">
                <h2 className="text-2xl font-bold text-indigo-900 mb-6 m-0 flex items-center gap-3"><Users className="text-indigo-600"/> 📋 Inhaltsübersicht für Familien</h2>
                <ul className="list-none p-0 space-y-4 m-0 text-lg text-slate-700">
                    <li className="flex items-start gap-3"><Check size={20} className="text-green-600 shrink-0 mt-1" /> Die Kosten-Rechnung 2026 für 4 Personen.</li>
                    <li className="flex items-start gap-3"><Check size={20} className="text-green-600 shrink-0 mt-1" /> Silver oder Gold? Warum Schulkinder die Entscheidung diktieren.</li>
                    <li className="flex items-start gap-3"><Check size={20} className="text-green-600 shrink-0 mt-1" /> Versteckte Kosten und wie man sie minimiert.</li>
                    <li className="flex items-start gap-3"><Check size={20} className="text-green-600 shrink-0 mt-1" /> Echte Erfahrungen: Wann sich der Pass als Familie amortisiert.</li>
                    <li className="flex items-start gap-3"><Check size={20} className="text-green-600 shrink-0 mt-1" /> Überlebens-Tipps für ausverkaufte Phasen.</li>
                </ul>
            </div>

            <p className="text-xl leading-relaxed">
              Für viele Familien ist der Europa-Park das Highlight des Jahres. Doch wer Deutschlands größten Freizeitpark mehrmals im Jahr besuchen möchte, merkt schnell: Die Kosten für Einzeltickets summieren sich rasant. Ein Europa-Park ResortPass scheint da die perfekte Lösung zu sein. In diesem ausführlichen Guide nehmen wir das Thema "Jahreskarte für Familien" unter die Lupe.
            </p>

            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-slate-100 pb-4">Die Kosten-Rechnung 2026: Was zahlt eine Familie?</h2>
            <div className="overflow-x-auto my-8">
              <table className="w-full text-sm border-collapse bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider">
                    <th className="p-4 text-left">Konstellation</th>
                    <th className="p-4 text-center">ResortPass Silver</th>
                    <th className="p-4 text-center">ResortPass Gold</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <tr><td className="p-4 font-medium">2 Erwachsene</td><td className="p-4 text-center">590 €</td><td className="p-4 text-center">950 €</td></tr>
                  <tr><td className="p-4 font-medium">2 Kinder 4-11 J.</td><td className="p-4 text-center">510 €</td><td className="p-4 text-center">830 €</td></tr>
                  <tr className="bg-blue-50 font-bold"><td className="p-4">Gesamtsumme</td><td className="p-4 text-center text-[#00305e]">1.100 €</td><td className="p-4 text-center text-[#00305e]">1.780 €</td></tr>
                </tbody>
              </table>
            </div>

            <BlogInjectedCTA variant={1} />

            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-slate-100 pb-4">Silver oder Gold? Die Schulkinder-Falle</h2>
            <p>
              Für Familien mit Kindern im schulpflichtigen Alter ist der ResortPass Silver oft schwierig, da viele beliebte Wochenenden in den Ferien als Sperrtage markiert sind. Der ResortPass Gold bietet hier volle Freiheit. Ein weiterer Bonus für Familien im Gold-Pass sind die zwei inkludierten Rulantica-Tickets pro Person, die einen Gesamtwert für eine 4-köpfige Familie von ca. 180 € bis 200 € haben.
            </p>

            <div className="grid md:grid-cols-3 gap-6 my-8">
              <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
                <Ticket className="text-indigo-600 mb-4" size={32} />
                <h4 className="font-bold text-lg mb-2">ParkingPass</h4>
                <p className="text-sm text-slate-500">Wer mit dem Auto anreist, spart ab dem 4. Besuch massiv durch den ParkingPass.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
                <Bed className="text-indigo-600 mb-4" size={32} />
                <h4 className="font-bold text-lg mb-2">Hotel-Trick</h4>
                <p className="text-sm text-slate-500">Bei Hotelübernachtungen gelten keine Sperrtage für Inhaber eines Silver Passes.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
                <Map className="text-indigo-600 mb-4" size={32} />
                <h4 className="font-bold text-lg mb-2">Partnerparks</h4>
                <p className="text-sm text-slate-500">Nutzt den Pass für den Familienurlaub in anderen europäischen Top-Parks.</p>
              </div>
            </div>

            <BlogInjectedCTA variant={2} />

            <div className="bg-indigo-900 text-white p-10 rounded-3xl shadow-xl text-center">
                <h3 className="text-2xl font-black text-[#ffcc00] mb-6 m-0 uppercase tracking-widest">Familien-Jahreskarte sichern!</h3>
                <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                  Überlassen den Familienurlaub nicht dem Zufall. Melde dich bei ResortPassAlarm an und wir informieren dich sofort.
                </p>
                <Button onClick={() => navigate('landing')} className="bg-[#ffcc00] text-[#00305e] border-0 mx-auto font-black px-12 py-5 text-2xl hover:scale-105 shadow-2xl transition-all">
                    Alarm jetzt aktivieren
                </Button>
            </div>
          </div>
        );

      case 'resortpass-ausverkauft-was-jetzt':
        return (
          <div className="space-y-10">
            <div className="bg-blue-50 border-l-8 border-indigo-600 p-8 rounded-r-3xl shadow-sm">
                <h2 className="text-2xl font-bold text-indigo-900 mb-6 m-0 flex items-center gap-3"><HelpCircle className="text-indigo-600"/> 📋 Inhaltsübersicht</h2>
                <ul className="list-none p-0 space-y-4 m-0 text-lg text-slate-700">
                    <li className="flex items-start gap-3"><Check size={20} className="text-green-600 shrink-0 mt-1" /> Warum der Pass ausverkauft ist.</li>
                    <li className="flex items-start gap-3"><Check size={20} className="text-green-600 shrink-0 mt-1" /> Gibt es eine echte Warteliste?</li>
                    <li className="flex items-start gap-3"><Check size={20} className="text-green-600 shrink-0 mt-1" /> Der Hotel-Trick.</li>
                </ul>
            </div>
            <p className="text-xl leading-relaxed">
                Du hast den Urlaub geplant, die Vorfreude ist riesig, und dann das: Du siehst nur ein rotes Banner mit der Aufschrift „Momentan leider ausverkauft“. In diesem Guide zeigen wir dir, wie du die Wartezeit überbrückst und wie du doch noch zu deiner Jahreskarte kommst.
            </p>
            <BlogInjectedCTA variant={1} />
            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-slate-100 pb-4">Die Strategie für den nächsten Drop</h2>
            <p>
                Die Pässe werden oft in Schüben freigeschaltet. Manuelle Suche ist hier wie ein Lottospiel. Tools wie unser ResortPassAlarm automatisieren die Überwachung und senden dir sofort eine Nachricht.
            </p>
            <BlogInjectedCTA variant={2} />
          </div>
        );

      case 'resortpass-kaufen-tipps':
        return (
          <div className="space-y-10">
            <div className="bg-amber-50 border-l-8 border-amber-400 p-8 rounded-r-3xl shadow-sm">
                <h2 className="text-2xl font-bold text-[#00305e] mb-6 m-0 flex items-center gap-3"><Info className="text-amber-500"/> 📋 Tipps zum Kauf</h2>
                <ul className="list-none p-0 space-y-4 m-0 text-lg text-slate-700">
                    <li className="flex items-start gap-3"><Check size={20} className="text-green-600 shrink-0 mt-1" /> MackOne Account vorbereiten.</li>
                    <li className="flex items-start gap-3"><Check size={20} className="text-green-600 shrink-0 mt-1" /> Schnelle Zahlungsmittel nutzen.</li>
                </ul>
            </div>
            <p className="text-xl leading-relaxed">
                Der Kaufprozess eines ResortPass gleicht heute einer digitalen Schatzsuche. Wer gut vorbereitet ist, hat die Nase vorn. Erstelle dir bereits heute einen MackOne Account und hinterlege deine Daten.
            </p>
            <BlogInjectedCTA variant={1} />
            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-slate-100 pb-4">Die Wellen-Taktik verstehen</h2>
            <p>
                Kontingente werden oft am Vormittag zwischen 9:00 und 11:00 Uhr freigeschaltet. Sei bereit!
            </p>
          </div>
        );

      case 'resortpass-guide-2026':
        return (
          <div className="space-y-10">
             <h2 className="text-3xl font-bold text-[#00305e]">Alles über den ResortPass 2026</h2>
             <p className="text-lg">In diesem Guide erfährst du alles Wichtige für die kommende Saison. Der ResortPass ist digital und wird einfach in der Europa-Park App hinterlegt.</p>
             <div className="bg-blue-50 p-6 rounded-2xl">
                 <h4 className="font-bold mb-2">Vorteile 2026:</h4>
                 <ul className="list-disc pl-5">
                     <li>Eintritt an über 230 oder allen Tagen.</li>
                     <li>Partnerpark-Vorteile.</li>
                     <li>Digitale Verwaltung.</li>
                 </ul>
             </div>
             <BlogInjectedCTA variant={1} />
          </div>
        );

      case 'silver-vs-gold-vergleich':
        return (
          <div className="space-y-10">
             <h2 className="text-3xl font-bold text-[#00305e]">Silver oder Gold? Der Vergleich</h2>
             <p className="text-lg">Der Silver Pass ist ideal für Sparfüchse und flexible Besucher. Der Gold Pass richtet sich an Power-User und Familien, die keine Sperrtage akzeptieren möchten.</p>
             <BlogInjectedCTA variant={2} />
             <div className="grid md:grid-cols-2 gap-8">
                 <div className="bg-slate-100 p-6 rounded-xl">
                     <h3 className="font-bold text-xl mb-3">Silver Pass</h3>
                     <p>295 € / über 230 Tage / ideal für unter der Woche.</p>
                 </div>
                 <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                     <h3 className="font-bold text-xl mb-3">Gold Pass</h3>
                     <p>475 € / alle Tage / inkl. 2x Rulantica.</p>
                 </div>
             </div>
          </div>
        );

      case 'resortpass-preise-2026':
        return (
          <div className="space-y-10">
             <h2 className="text-3xl font-bold text-[#00305e]">Aktuelle Preise für 2026</h2>
             <div className="bg-white p-8 rounded-2xl border shadow-sm">
                 <p className="text-2xl font-bold mb-4">Preisübersicht (Erwachsene):</p>
                 <ul className="space-y-2 text-xl">
                     <li>ResortPass Silver: 295 €</li>
                     <li>ResortPass Gold: 475 €</li>
                     <li>ParkingPass: 39 €</li>
                 </ul>
             </div>
             <p>Die Preise bleiben im Vergleich zu 2025 stabil, was eine gute Nachricht für alle Fans ist.</p>
             <BlogInjectedCTA variant={1} />
          </div>
        );

      case 'resortpass-amortisation-rechner':
        return (
          <div className="space-y-10">
             <h2 className="text-3xl font-bold text-[#00305e]">Lohnt sich der Pass? Der Rechner</h2>
             <p className="text-lg">Berechne deine Besuche gegen den Ticketpreis. Im Durchschnitt kostet ein Ticket 68 €.</p>
             <div className="bg-indigo-600 text-white p-8 rounded-2xl text-center">
                 <p className="text-4xl font-black">Ab 5 Besuchen profitabel!</p>
             </div>
             <p>Dies gilt für den Silver Pass. Beim Gold Pass rechnet es sich ab ca. 7 Besuchen (ohne Rulantica).</p>
             <BlogInjectedCTA variant={2} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <button 
              onClick={() => navigate('blog')}
              className="flex items-center text-slate-500 hover:text-indigo-600 font-medium transition-colors mb-6 group"
            >
              <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Zurück zum Blog
            </button>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-indigo-100 text-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded-full">
                {postInfo.category}
              </span>
              <span className="text-slate-400 text-sm flex items-center gap-1">
                <Calendar size={14} /> {postInfo.date}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight mb-8">
              {postInfo.title}
            </h1>
            <div className="flex items-center gap-4 py-6 border-y border-slate-100">
               <div className="w-12 h-12 bg-[#00305e] rounded-full flex items-center justify-center text-[#ffcc00]">
                 {postInfo.icon}
               </div>
               <div>
                  <p className="text-sm font-bold text-slate-900">ResortPass-Experten</p>
                  <p className="text-xs text-slate-400">Aktualisiert für die Saison 2026</p>
               </div>
               <div className="ml-auto flex gap-2">
                 <button className="p-2 text-slate-400 hover:text-indigo-500 transition"><Share2 size={20} /></button>
               </div>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-slate prose-lg max-w-none prose-headings:text-[#00305e] prose-headings:font-bold prose-a:text-indigo-600 prose-strong:text-slate-900 leading-relaxed">
            {renderContent()}
          </div>

          {/* Footer Info */}
          <div className="mt-16 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-start gap-4">
                <AlertTriangle className="text-amber-500 shrink-0 mt-1" size={24} />
                <div>
                    <strong className="block mb-2 text-slate-900">Transparenz-Hinweis</strong>
                    <p className="text-sm text-slate-500 m-0 leading-relaxed">
                    Dieser Artikel fasst öffentlich verfügbare Informationen zusammen. Für verbindliche Details gelten ausschließlich die Angaben des Europa-Park / Mack International Ticketshops. ResortPassAlarm ist ein unabhängiger Service.
                    </p>
                </div>
            </div>
          </div>

          {/* More Posts */}
          <div className="mt-16 pt-16 border-t border-slate-200">
             <h3 className="text-2xl font-bold text-[#00305e] mb-8">Das könnte dich auch interessieren</h3>
             <div className="grid md:grid-cols-2 gap-8">
                {BLOG_POSTS.filter(p => p.slug !== slug).slice(0, 2).map(p => (
                  <div 
                    key={p.slug} 
                    className="flex gap-4 cursor-pointer group bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-all"
                    onClick={() => { navigate(`blog-post:${p.slug}`); window.scrollTo(0,0); }}
                  >
                    <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-[#00305e]">
                      {p.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">{p.title}</h4>
                      <p className="text-xs text-slate-400 mt-2 flex items-center gap-1 font-bold uppercase tracking-wider">Guide lesen <ChevronRight size={12}/></p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
      <Footer navigate={navigate} />
    </div>
  );
};
