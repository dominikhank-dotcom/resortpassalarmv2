
import React from 'react';
// Added CheckCircle and Ticket to the imports to fix "Cannot find name" errors
import { ArrowLeft, ArrowRight, Calendar, Share2, ChevronRight, Check, Zap, Bell, Clock, Info, ShieldCheck, AlertTriangle, Star, DollarSign, Target, Calculator, AlertCircle, X, HelpCircle, CheckCircle, Ticket, ShoppingBag, UserCheck, Timer, MousePointer2, HelpCircle as HelpIcon, Map, Bed, Users, TrendingUp } from 'lucide-react';
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
                <h2 className="text-2xl font-bold text-[#00305e] mb-6 m-0 flex items-center gap-3"><Calculator className="text-blue-600"/> 📋 Wirtschaftlichkeits-Check</h2>
                <ul className="list-none p-0 space-y-4 m-0 text-lg text-slate-700">
                    <li className="flex items-start gap-3"><Check size={20} className="text-green-600 shrink-0 mt-1" /> <strong>Silver-Amortisation:</strong> Bereits ab dem 5. Besuch profitabel.</li>
                    <li className="flex items-start gap-3"><Check size={20} className="text-green-600 shrink-0 mt-1" /> <strong>Gold-Amortisation:</strong> Ab dem 7. Besuch (oder früher mit Rulantica).</li>
                    <li className="flex items-start gap-3"><Check size={20} className="text-green-600 shrink-0 mt-1" /> <strong>Versteckte Ersparnis:</strong> Partnerparks sparen zusätzlich bis zu 400 € pro Jahr.</li>
                    <li className="flex items-start gap-3"><Check size={20} className="text-green-600 shrink-0 mt-1" /> <strong>Parkgebühren:</strong> Der ParkingPass spart 10 € pro Besuchstag.</li>
                </ul>
            </div>

            <p className="text-xl leading-relaxed">
              Steigende Preise in der Freizeitbranche zwingen viele Fans dazu, ihre Ausgaben genau zu kalkulieren. Der Europa-Park ist hier keine Ausnahme. Mit Tagesticket-Preisen, die in der Hauptsaison die 70-Euro-Marke überschreiten, stellt sich die Frage: Sollte ich einmalig tief in die Tasche greifen und einen <strong>ResortPass</strong> kaufen oder fahre ich mit <strong>Einzeltickets</strong> besser? In diesem Artikel gehen wir weit über die einfachen Eintrittspreise hinaus. Wir berechnen reale Szenarien, inklusive Parkgebühren, Partner-Vorteilen und dem psychologischen Faktor der Spontanität.
            </p>

            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-slate-100 pb-4">Die Basis: Was kosten Einzeltickets wirklich?</h2>
            <p>
              Bevor wir vergleichen können, müssen wir den aktuellen "Gegner" definieren. Die Ticketpreise im Europa-Park sind dynamisch und hängen von der Saison ab:
            </p>
            <div className="grid md:grid-cols-2 gap-4 my-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-2">Nebensaison</h4>
                    <p className="text-2xl font-black text-blue-600">64,50 €</p>
                    <p className="text-xs text-slate-500">Pro Person (Erwachsen)</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-2">Hauptsaison & Ferien</h4>
                    <p className="text-2xl font-black text-indigo-600">73,00 €</p>
                    <p className="text-xs text-slate-500">Pro Person (Erwachsen)</p>
                </div>
            </div>
            <p>
              Für unsere Kalkulation nutzen wir einen fairen <strong>Durchschnittswert von 68,00 € pro Tagesticket</strong>. Wer nur an Halloween oder in den Weihnachtsferien kommt, muss mit den höheren Werten rechnen.
            </p>

            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-slate-100 pb-4">Szenario 1: Der ResortPass Silver (295 €)</h2>
            <p>
              Der Silver Pass ist der Preis-Leistungs-Sieger für alle, die flexibel planen können. Er kostet 295 € für Erwachsene.
            </p>
            <div className="bg-white border-2 border-indigo-100 p-8 rounded-3xl shadow-lg my-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-indigo-600 text-white p-3 rounded-2xl"><Calculator size={28}/></div>
                    <h3 className="text-2xl font-bold text-slate-900 m-0">Rechnung Silver</h3>
                </div>
                <div className="space-y-4 text-lg">
                    <p className="flex justify-between border-b pb-2"><span>Anschaffungskosten</span> <span className="font-bold">295,00 €</span></p>
                    <p className="flex justify-between border-b pb-2"><span>Kosten pro Einzelticket (Ø)</span> <span className="font-bold">68,00 €</span></p>
                    <p className="flex justify-between text-indigo-600 font-black text-2xl pt-4"><span>Amortisation ab</span> <span>4,33 Besuchen</span></p>
                </div>
            </div>
            <p>
              <strong>Fazit Silver:</strong> Ab dem 5. Besuch im Jahr hast du "gewonnen". Ab hier kostet dich jeder weitere Tag im Park effektiv 0 €. Wer plant, einmal im Quartal nach Rust zu fahren, für den ist der Silver Pass fast schon Pflicht.
            </p>

            <BlogInjectedCTA variant={1} />

            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-slate-100 pb-4">Szenario 2: Der ResortPass Gold (475 €)</h2>
            <p>
              Der Gold Pass ist deutlich teurer, bietet aber zwei enorme finanzielle Joker: <strong>Keine Sperrtage</strong> und <strong>2x Rulantica inklusive</strong>.
            </p>
            <p>
              Da ein Rulantica Tagesticket ca. 46,00 € kostet, müssen wir diese 92,00 € vom Anschaffungspreis abziehen, um den "reinen" Europa-Park Wert zu erhalten.
            </p>
            <div className="bg-[#00305e] text-white p-8 rounded-3xl shadow-xl my-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp size={120}/></div>
                <h3 className="text-2xl font-bold mb-6 text-blue-300">Die "echte" Gold-Rechnung</h3>
                <div className="space-y-3">
                    <p className="flex justify-between"><span>Grundpreis Gold</span> <span>475,00 €</span></p>
                    <p className="flex justify-between text-blue-200"><span>Abzug 2x Rulantica (Wert)</span> <span>- 92,00 €</span></p>
                    <p className="flex justify-between font-bold border-t border-blue-700 pt-3"><span>Effektive Kosten Europa-Park</span> <span>383,00 €</span></p>
                    <p className="flex justify-between text-yellow-400 font-black text-2xl pt-6 uppercase tracking-tight"><span>Lohnt sich ab</span> <span>5,6 Besuchen</span></p>
                </div>
            </div>
            <p>
              <strong>Wichtig:</strong> Ohne die Rulantica-Tickets gerechnet, amortisiert sich der Gold-Pass erst ab dem <strong>7. Besuch</strong>. Er ist also das Tool für die absoluten Power-User und Familien, die auf Ferienzeiten angewiesen sind.
            </p>

            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-slate-100 pb-4">Versteckte Ersparnis: Partnerparks & Vorteile</h2>
            <p>
              Was viele bei ihrer Rechnung vergessen, ist der massive Mehrwert durch die Partner-Vorteile. Mit einem aktiven ResortPass (egal ob Silver oder Gold) erhältst du:
            </p>
            <div className="grid md:grid-cols-2 gap-6 my-8">
                <div className="bg-green-50 p-6 rounded-2xl border border-green-100 flex items-start gap-4">
                    <Map className="text-green-600 shrink-0" size={24}/>
                    <div>
                        <h4 className="font-bold text-green-900">7 Partnerparks gratis</h4>
                        <p className="text-sm text-green-800">Efteling, Liseberg, PortAventura etc. Wert pro Besuch: ca. 50 €. Wer nur 2 dieser Parks nutzt, spart 100 € zusätzlich.</p>
                    </div>
                </div>
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-start gap-4">
                    <ShoppingBag className="text-blue-600 shrink-0" size={24}/>
                    <div>
                        <h4 className="font-bold text-blue-900">VEEJOY & Kino</h4>
                        <p className="text-sm text-blue-800">Premium-Zugang zum Streaming-Dienst und Rabatte im Magic Cinema. Wert: ca. 30 € pro Jahr.</p>
                    </div>
                </div>
            </div>

            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-slate-100 pb-4">Der Faktor "Parken"</h2>
            <p>
              Jeder Tagesbesucher zahlt 10,00 € Parkgebühr. ResortPass Inhaber können den <strong>ParkingPass für 39,00 €</strong> dazubuchen.
            </p>
            <ul className="space-y-2 mb-8 list-none p-0">
                <li className="flex items-center gap-3"><CheckCircle size={18} className="text-green-500"/> Ab dem 4. Besuch mit dem Auto ist der ParkingPass profitabel.</li>
                <li className="flex items-center gap-3"><CheckCircle size={18} className="text-green-500"/> Bei 10 Besuchen sparst du bereits 61,00 € reine Parkgebühren.</li>
            </ul>

            <BlogInjectedCTA variant={2} />

            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-slate-100 pb-4">Die psychologische Komponente</h2>
            <p>
              Finanzen sind das eine, das Erlebnis das andere. Mit Einzeltickets stehst du unter "Nutzungszwang". Du zahlst 73 € und willst dafür jede Minute von 9:00 bis 18:00 Uhr ausnutzen, auch wenn es regnet oder die Kinder müde sind.
            </p>
            <div className="bg-amber-50 p-8 rounded-3xl border border-amber-100 italic text-slate-700 text-lg leading-relaxed">
              "Der ResortPass gibt dir die Freiheit, nach 3 Stunden wieder zu gehen, wenn die Warteschlangen zu lang sind. Du gehst einfach nächste Woche wieder. Dieser Stressabbau ist schwer in Euro zu messen, aber für viele Inhaber der eigentliche Grund für den Pass."
            </div>

            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-slate-100 pb-4">Zusammenfassung: Deine Entscheidungshilfe</h2>
            <div className="overflow-x-auto my-8">
                <table className="w-full border-collapse bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                    <thead className="bg-slate-900 text-white">
                        <tr>
                            <th className="p-4 text-left">Besuche pro Jahr</th>
                            <th className="p-4 text-center">Beste Wahl</th>
                            <th className="p-4 text-left">Grund</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        <tr><td className="p-4">1 - 3 mal</td><td className="p-4 text-center font-bold">Einzeltickets</td><td className="p-4 text-sm text-slate-500">Lohnt finanziell noch nicht. Nutze Angebote wie das 2-Tages-Ticket.</td></tr>
                        <tr className="bg-blue-50/50"><td className="p-4">4 - 6 mal</td><td className="p-4 text-center font-bold text-indigo-600">ResortPass Silver</td><td className="p-4 text-sm text-slate-500">Bestes Preis-Leistungs-Verhältnis. Sperrtage durch Planung umgehen.</td></tr>
                        <tr><td className="p-4">7+ mal</td><td className="p-4 text-center font-bold text-yellow-600">ResortPass Gold</td><td className="p-4 text-sm text-slate-500">Maximale Freiheit. Lohnt besonders durch Rulantica-Tickets.</td></tr>
                        <tr><td className="p-4">Vielreisende</td><td className="p-4 text-center font-bold">Jeder Pass</td><td className="p-4 text-sm text-slate-500">Dank Partnerpark-Gratiseintritten (Efteling etc.) extrem wertvoll.</td></tr>
                    </tbody>
                </table>
            </div>

            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-slate-100 pb-4">Das größte Problem: Die Verfügbarkeit</h2>
            <p>
              Jetzt kommt die bittere Pille: Zu wissen, dass man Geld sparen würde, hilft nichts, wenn man keinen Pass kaufen kann. Wie du sicher weißt, sind die Pässe fast dauerhaft ausverkauft. Der finanzielle Vorteil von 200 € oder 300 € pro Jahr bringt dir nur etwas, wenn du in dem kurzen Moment zuschlägst, in dem das Kontingent im Shop offen ist.
            </p>
            <p>
              Genau hier kommen wir ins Spiel. Unser <strong>ResortPassAlarm</strong> sorgt dafür, dass deine Kalkulation nicht nur Theorie bleibt. Wir informieren dich sofort, wenn du deine Ersparnis realisieren kannst.
            </p>

            <div className="bg-indigo-900 text-white p-12 rounded-3xl shadow-2xl text-center">
                <h3 className="text-3xl font-black text-[#ffcc00] mb-6 m-0 uppercase tracking-widest">Sicher dir deine Ersparnis!</h3>
                <p className="text-blue-100 mb-10 max-w-2xl mx-auto text-lg">
                  Lass die Chance auf hunderte Euro Ersparnis nicht verstreichen. Werde benachrichtigt, sobald die Pässe wieder da sind.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button onClick={() => navigate('landing')} className="bg-[#ffcc00] text-[#00305e] border-0 font-black px-12 py-5 text-2xl hover:scale-105 shadow-2xl transition-all">
                        Alarm jetzt aktivieren
                    </Button>
                </div>
            </div>

            <hr className="my-12 border-slate-200" />
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-xs italic">
                <p>Zuletzt aktualisiert am: 23. Dezember 2025</p>
                <p>Preise basierend auf offiziellen Angaben des Europa-Park (Stand Dez 2025).</p>
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
              Für viele Familien ist der Europa-Park das Highlight des Jahres. Doch wer Deutschlands größten Freizeitpark mehrmals im Jahr besuchen möchte, merkt schnell: Die Kosten für Einzeltickets summieren sich rasant. Ein Europa-Park ResortPass scheint da die perfekte Lösung zu sein. Doch ist er das wirklich für die ganze Familie? In diesem ausführlichen Guide nehmen wir das Thema "Jahreskarte für Familien" unter die Lupe. Wir rechnen vor, geben Tipps zur Pass-Wahl und verraten, warum die Verfügbarkeit oft das größte Problem ist.
            </p>

            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-slate-100 pb-4">Die Kosten-Rechnung 2026: Was zahlt eine Familie?</h2>
            <p>
              Zuerst müssen wir über Zahlen sprechen. Ein ResortPass ist eine signifikante Investition. Für eine klassische vierköpfige Familie (2 Erwachsene, 2 Kinder zwischen 4 und 11 Jahren) sieht die Rechnung für das Jahr 2026 wie folgt aus:
            </p>

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
                  <tr>
                    <td className="p-4 font-medium">2 Erwachsene (à 295 € / 475 €)</td>
                    <td className="p-4 text-center">590 €</td>
                    <td className="p-4 text-center">950 €</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">2 Kinder 4-11 J. (à 255 € / 415 €)</td>
                    <td className="p-4 text-center">510 €</td>
                    <td className="p-4 text-center">830 €</td>
                  </tr>
                  <tr className="bg-blue-50 font-bold">
                    <td className="p-4">Gesamtsumme (ohne Parking)</td>
                    <td className="p-4 text-center text-[#00305e]">1.100 €</td>
                    <td className="p-4 text-center text-[#00305e]">1.780 €</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 flex items-start gap-4">
              <Calculator className="text-amber-600 shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-bold text-amber-900 mb-1">Vergleich zum Einzelticket</h4>
                <p className="text-sm text-amber-800 m-0">
                  Ein durchschnittlicher Tag im Europa-Park kostet eine vierköpfige Familie im Jahr 2026 ca. 270 € (Eintritt). Das bedeutet: Der <strong>ResortPass Silver</strong> rechnet sich für die Familie bereits ab dem <strong>5. Besuchstag</strong>. Der Gold-Pass benötigt etwa 7-8 Tage (ohne Rulantica-Vorteile gegenzurechnen).
                </p>
              </div>
            </div>

            <BlogInjectedCTA variant={1} />

            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-slate-100 pb-4">Silver oder Gold? Die Schulkinder-Falle</h2>
            <p>
              Hier liegt der Teufel im Detail. Der ResortPass Silver ist zwar deutlich günstiger, hat aber einen großen Haken: die <strong>Sperrtage</strong>. Für Familien mit Kindern im schulpflichtigen Alter ist das oft ein Ausschlusskriterium.
            </p>
            <p>
              Viele der beliebten Brückentage, Feiertage und Ferienwochenenden (insbesondere um Halloween und Weihnachten) sind im Silver-Pass gesperrt. Wenn ihr also nur in den Ferien fahrt könnt, müsst ihr den Kalender sehr genau prüfen. Der ResortPass Gold hingegen bietet volle Freiheit – jeden Tag, das ganze Jahr. Zudem sind beim Gold-Pass zwei Tagestickets für die Wasserwelt Rulantica enthalten, was für Familien einen zusätzlichen Wert von ca. 180 € darstellt.
            </p>

            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-slate-100 pb-4">Tipps für maximale Ersparnis</h2>
            <p>
              Eine Jahreskarte ist nur der Anfang. Hier sind drei Strategien, wie ihr als Familie noch mehr herausholt:
            </p>
            <div className="grid md:grid-cols-3 gap-6 my-8">
              <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
                <Ticket className="text-indigo-600 mb-4" size={32} />
                <h4 className="font-bold text-lg mb-2">ParkingPass nutzen</h4>
                <p className="text-sm text-slate-500">Wer mit dem Auto anreist, zahlt 10 € pro Parkvorgang. Der ParkingPass für 39 € rechnet sich also ab dem 4. Besuch. Ein Muss für Familien!</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
                <Bed className="text-indigo-600 mb-4" size={32} />
                <h4 className="font-bold text-lg mb-2">Hotel-Übernachtung</h4>
                <p className="text-sm text-slate-500">Wusstet ihr, dass Sperrtage im Silver-Pass nicht gelten, wenn ihr in einem Europa-Park Hotel übernachtet? Das kann eine kluge Kombi sein.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
                <Map className="text-indigo-600 mb-4" size={32} />
                <h4 className="font-bold text-lg mb-2">Partnerparks</h4>
                <p className="text-sm text-slate-500">Mit dem Pass kommt ihr einmalig kostenlos in Parks wie Efteling oder Liseberg. Perfekt für den nächsten Familienurlaub!</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-slate-100 pb-4">Erfahrungen: Lohnt sich der "Stress" beim Kauf?</h2>
            <p>
              Echte Erfahrungen von Familien zeigen: Der ResortPass ist ein Segen für die Spontanität. Man fährt auch mal nur für 4 Stunden in den Park, ohne das Gefühl zu haben, "das teure Ticket ausnutzen zu müssen". Man ist entspannter bei langen Warteschlangen, weil man ja "nächste Woche wiederkommen kann".
            </p>
            <p>
              Der größte Frustfaktor ist jedoch der Kaufprozess. Da die Pässe fast dauerhaft ausverkauft sind, ist es für eine ganze Familie extrem schwierig, 4 Pässe gleichzeitig in den Warenkorb zu bekommen. Oft sind nur noch 1 oder 2 Restkontingente verfügbar. Hier scheitern viele Familien und müssen frustriert wieder auf Einzeltickets ausweichen.
            </p>

            <BlogInjectedCTA variant={2} />

            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-slate-100 pb-4">Fazit: Die ultimative Checkliste für Familien</h2>
            <p>
              Bevor ihr über 1.000 € in die Hand nehmt, stellt euch diese drei Fragen:
            </p>
            <ol className="space-y-6 list-none p-0">
              <li className="flex gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold">1</div>
                <div>
                  <h4 className="font-bold text-slate-900">Schaffen wir mindestens 5-6 Besuchstage im Jahr?</h4>
                  <p className="text-slate-600 text-sm">Inklusive Anfahrt und eventueller Verpflegungskosten vor Ort? Wenn ja, ist der Pass wirtschaftlich sinnvoll.</p>
                </div>
              </li>
              <li className="flex gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold">2</div>
                <div>
                  <h4 className="font-bold text-slate-900">Sind wir auf die Ferien angewiesen?</h4>
                  <p className="text-slate-600 text-sm">Falls ja, rechnet lieber mit dem ResortPass Gold oder plant eure Hotel-Aufenthalte strategisch um die Silver-Sperrtage herum.</p>
                </div>
              </li>
              <li className="flex gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold">3</div>
                <div>
                  <h4 className="font-bold text-slate-900">Haben wir die Geduld für den "Drop"?</h4>
                  <p className="text-slate-600 text-sm">Die Pässe kommen unangekündigt. Wer nicht innerhalb von Minuten reagiert, geht leer aus. Nutzt Tools, um diesen Prozess zu automatisieren.</p>
                </div>
              </li>
            </ol>

            <div className="bg-indigo-900 text-white p-10 rounded-3xl shadow-xl text-center">
                <h3 className="text-2xl font-black text-[#ffcc00] mb-6 m-0 uppercase tracking-widest">Familien-Jahreskarte sichern!</h3>
                <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                  Überlasse den Familienurlaub nicht dem Zufall. Melde dich bei ResortPassAlarm an und wir informieren dich sofort, wenn genug Pässe für deine ganze Familie verfügbar sind.
                </p>
                <Button onClick={() => navigate('landing')} className="bg-[#ffcc00] text-[#00305e] border-0 mx-auto font-black px-12 py-5 text-2xl hover:scale-105 shadow-2xl transition-all">
                    Alarm jetzt aktivieren
                </Button>
            </div>

            <hr className="my-12 border-slate-200" />
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-xs italic">
                <p>Erstellt am: 23. Dezember 2025</p>
                <p>Unabhängiger Ratgeber. Keine Verbindung zur Mack-Gruppe.</p>
            </div>
          </div>
        );
      case 'resortpass-ausverkauft-was-jetzt':
        return (
          <div className="space-y-10">
            <div className="bg-blue-50 border-l-8 border-indigo-600 p-8 rounded-r-3xl shadow-sm">
                <h2 className="text-2xl font-bold text-indigo-900 mb-6 m-0 flex items-center gap-3"><HelpIcon className="text-indigo-600"/> 📋 Inhaltsübersicht</h2>
                <ul className="list-none p-0 space-y-4 m-0 text-lg text-slate-700">
                    <li className="flex items-start gap-3"><Check size={20} className="text-green-600 shrink-0 mt-1" /> Warum der Pass ausverkauft ist und was "Soll-Kontingente" sind.</li>
                    <li className="flex items-start gap-3"><Check size={20} className="text-green-600 shrink-0 mt-1" /> Gibt es eine echte Warteliste? (Die bittere Wahrheit).</li>
                    <li className="flex items-start gap-3"><Check size={20} className="text-green-600 shrink-0 mt-1" /> Alternativen für Kurzentschlossene: Tagestickets & Mehrtages-Deals.</li>
                    <li className="flex items-start gap-3"><Check size={20} className="text-green-600 shrink-0 mt-1" /> Der Hotel-Trick: So kommst du trotzdem rein.</li>
                    <li className="flex items-start gap-3"><Check size={20} className="text-green-600 shrink-0 mt-1" /> Die "Wächter"-Strategie für den nächsten Drop.</li>
                </ul>
            </div>

            <p className="text-xl leading-relaxed">
                Du hast den Urlaub geplant, die Vorfreude ist riesig, und dann das: Du klickst auf den Ticket-Shop des Europa-Park und siehst nur ein rotes Banner mit der Aufschrift „Momentan leider ausverkauft“. Ob ResortPass Silver oder der begehrte Gold-Pass – die Kontingente sind seit Monaten ein knappes Gut. Viele Fans fühlen sich im Stich gelassen und fragen sich: Wie kann das sein? Und vor allem: Was mache ich jetzt? In diesem ausführlichen Guide zeigen wir dir, wie du die Wartezeit überbrückst und wie du doch noch zu deiner Jahreskarte kommst.
            </p>

            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-slate-100 pb-4">Die aktuelle Lage: Warum ist der ResortPass ständig weg?</h2>
            <p>
                Der Europa-Park hat in den letzten zwei Jahren seine Strategie grundlegend geändert. Weg von der unlimitierten Clubkarte, hin zu einem gesteuerten ResortPass-System. Der Grund ist simpel: Kapazitätsmanagement. Um das Erlebnis für jeden Gast im Park (Wartezeiten, Gastronomie-Auslastung) zu optimieren, darf nur eine bestimmte Anzahl an Jahreskarten im Umlauf sein.
            </p>
            <p>
                Sobald eine gewisse Anzahl an Pässen im Umlauf ist, stoppt der Verkauf automatisch. Neue Pässe werden erst wieder freigeschaltet, wenn bestehende Pässe nicht verlängert werden oder der Park entscheidet, die Kapazität geringfügig zu erhöhen. Das passiert oft in unangekündigten Schüben, den sogenannten "Drops".
            </p>

            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 flex items-start gap-4">
              <AlertTriangle className="text-amber-600 shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-bold text-amber-900 mb-1">Gibt es eine Warteliste?</h4>
                <p className="text-sm text-amber-800 m-0">
                  Offiziell bietet der Europa-Park <strong>keine Warteliste</strong> an, auf der du dich eintragen kannst, um benachrichtigt zu werden. Der Support verweist meist auf "regelmäßiges Nachsehen im Shop". Das bedeutet für dich: Wer zuerst kommt, mahlt zuerst. Es gibt keine Priorisierung für treue Fans oder ehemalige Inhaber.
                </p>
              </div>
            </div>

            <BlogInjectedCTA variant={1} />

            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-slate-100 pb-4">Kurzfristige Alternativen: Wenn der Parkbesuch feststeht</h2>
            <p>
                Wenn dein Besuchstermin bereits steht und du keine Jahreskarte bekommen hast, musst du nicht verzagen. Hier sind die besten Wege, um trotzdem den Zauber von Rust zu erleben:
            </p>

            <div className="grid md:grid-cols-2 gap-6 my-8">
              <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex flex-col">
                <Ticket className="text-indigo-600 mb-4" size={32} />
                <h4 className="font-bold text-lg mb-2">Tagestickets & Mehrtageskarten</h4>
                <p className="text-sm text-slate-500 flex-grow">
                  Klassisch, aber effektiv. Buche Einzeltickets frühzeitig online. Besonders die 2-Tages-Tickets bieten eine Ersparnis gegenüber zwei Einzeltitckets. 
                </p>
                <div className="mt-4 text-indigo-600 text-xs font-bold uppercase tracking-wider">Tipp: Reservierung nötig!</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex flex-col">
                <Bed className="text-indigo-600 mb-4" size={32} />
                <h4 className="font-bold text-lg mb-2">Der "Hotel-Trick"</h4>
                <p className="text-sm text-slate-500 flex-grow">
                  Als Übernachtungsgast in den Europa-Park Hotels hast du eine Eintrittsgarantie. Selbst wenn die Tageskontingente für normale Besucher erschöpft sind, bekommst du als Hotelgast fast immer noch Tickets an der Rezeption.
                </p>
                <div className="mt-4 text-indigo-600 text-xs font-bold uppercase tracking-wider">Kostspielig aber sicher</div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-slate-100 pb-4">Langfristige Strategie: So sicherst du dir den nächsten Drop</h2>
            <p>
                Manuelle Suche ist wie ein Lottospiel. Du kannst die Seite 50-mal am Tag aktualisieren und genau in den 10 Minuten nicht schauen, in denen 50 neue Gold-Pässe freigeschaltet wurden. Hier ist dein Schlachtplan:
            </p>
            <ol className="space-y-6 list-none p-0">
              <li className="flex gap-4">
                <div className="bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold">1</div>
                <div>
                  <h4 className="font-bold text-slate-900">MackOne Account fix und fertig machen</h4>
                  <p className="text-slate-600">
                    Hinterlege deine Adresse, deine Zahlungsmittel und verifiziere deine E-Mail. Wenn die Pässe online gehen, zählt jede Sekunde. Du willst nicht erst dein Passwort zurücksetzen müssen.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold">2</div>
                <div>
                  <h4 className="font-bold text-slate-900">Wellen verstehen</h4>
                  <p className="text-slate-600">
                    Erfahrungsgemäß werden Kontingente oft an Wochentagen vormittags (zwischen 9 und 11 Uhr) freigegeben. Am Wochenende passiert selten etwas.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold">3</div>
                <div>
                  <h4 className="font-bold text-slate-900">Automatisierung nutzen</h4>
                  <p className="text-slate-600">
                    Das ist der wichtigste Punkt. Tools wie ResortPassAlarm überwachen die Seite im Minutentakt für dich. Während du arbeitest oder schläfst, scannt der Wächter die Verfügbarkeit.
                  </p>
                </div>
              </li>
            </ol>

            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-slate-100 pb-4">Alternative: Andere Parks mit dem ResortPass entdecken</h2>
            <p>
                Wusstest du, dass du mit einem aktiven ResortPass auch andere Parks kostenlos besuchen kannst? Wenn der Europa-Park gerade überfüllt ist oder du auf deinen Pass wartest, schau dir die Partner-Vorteile an. 
            </p>
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <Map className="text-indigo-600" />
                <h4 className="font-bold text-[#00305e] text-xl m-0">Top Partnerparks (1x pro Laufzeit gratis)</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> Efteling (NL)</div>
                <div className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> Liseberg (SE)</div>
                <div className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> Port Aventura (ES)</div>
                <div className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> Isla Mágica (ES)</div>
                <div className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> Pleasure Beach (UK)</div>
                <div className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> Emerald Park (IE)</div>
              </div>
              <p className="mt-4 text-xs text-slate-400 italic">
                Hinweis: Diese Besuche sind erst möglich, wenn du deinen ResortPass bereits in Händen hältst. Sie sind ein großartiger Zusatznutzen, der den Pass noch wertvoller macht.
              </p>
            </div>

            <BlogInjectedCTA variant={2} />

            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-slate-100 pb-4">Fazit: Nicht aufgeben, klug agieren</h2>
            <p>
                Die Frustration über ausverkaufte ResortPässe ist verständlich, aber mit der richtigen Strategie ist es nur eine Frage der Zeit, bis du deinen eigenen Pass hast. Nutze Tagestickets für dringende Besuche, bereite deinen MackOne Account perfekt vor und lass dich von automatisierten Systemen benachrichtigen. 
            </p>
            <p>
                Denk daran: Sobald der Alarm auf deinem Handy eingeht, hast du meist ein Zeitfenster von 5 bis 15 Minuten. Wer dann vorbereitet ist, sichert sich sein Jahr voller Abenteuer im Europa-Park Resort.
            </p>

            <div className="bg-indigo-900 text-white p-10 rounded-3xl shadow-xl text-center">
                <h3 className="text-2xl font-black text-[#ffcc00] mb-6 m-0 uppercase tracking-widest">Bereit für den nächsten Drop?</h3>
                <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                    Überlasse dein Glück nicht dem Zufall. Werde Teil der ResortPassAlarm Community und erhalte sofort Bescheid, wenn die Pässe wieder verfügbar sind.
                </p>
                <Button onClick={() => navigate('landing')} className="bg-[#ffcc00] text-[#00305e] border-0 mx-auto font-black px-12 py-5 text-2xl hover:scale-105 shadow-2xl transition-all">
                    Überwachung jetzt starten
                </Button>
            </div>

            <hr className="my-12 border-slate-200" />
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-xs italic">
                <p>Zuletzt aktualisiert: {postInfo.date}</p>
                <p>Keine offizielle Seite des Europa-Park.</p>
            </div>
          </div>
        );
      case 'resortpass-kaufen-tipps':
// ... Rest of file remains unchanged
