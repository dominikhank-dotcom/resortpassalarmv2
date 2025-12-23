
import React from 'react';
import { ArrowLeft, ArrowRight, Calendar, Share2, ChevronRight, Check, Zap, Bell, Clock, Info, ShieldCheck, AlertTriangle, Star, DollarSign, Target, Calculator, AlertCircle, X, HelpCircle } from 'lucide-react';
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
      case 'resortpass-guide-2026':
        return (
          <div className="space-y-8">
            <div className="bg-blue-50 border-l-4 border-[#00305e] p-6 rounded-r-xl shadow-sm">
              <h3 className="text-[#00305e] font-bold text-xl mb-3 mt-0">📋 Zusammenfassung</h3>
              <p className="text-slate-700 leading-relaxed m-0">Der Europa-Park ResortPass ist die Jahreskarte für Deutschlands größten Freizeitpark. Mit der Karte kannst du ein ganzes Jahr lang den Europa-Park besuchen – entweder mit dem <strong>ResortPass Silver</strong> an über 230 Tagen oder mit dem <strong>ResortPass Gold</strong> an allen Öffnungstagen. Zusätzlich erhältst du Zugang zu Partnerparks in ganz Europa, Premium-Inhalte auf VEEJOY und weitere exklusive Vorteile. In diesem Guide erfährst du alles, was du als Einsteiger über den ResortPass 2026 wissen musst!</p>
            </div>

            <p>Du liebst den Europa-Park und überlegst, ob sich eine Jahreskarte für dich lohnt? Dann bist du hier genau richtig! Der ResortPass ist die offizielle Jahreskarte des Europa-Park und bietet dir unglaublich viele Möglichkeiten, Deutschlands besten Freizeitpark so oft zu besuchen, wie du möchtest. Aber was genau steckt dahinter? Welche Varianten gibt es? Und für wen lohnt sich welcher Pass? In diesem ultimativen Guide erklären wir dir Schritt für Schritt alles Wichtige zum Europa-Park ResortPass 2026.</p>

            <h2 className="text-2xl font-bold text-[#00305e] border-l-4 border-[#ffcc00] pl-4">Was ist der Europa-Park ResortPass?</h2>
            <p>Der <strong>Europa-Park ResortPass</strong> ist die moderne Jahreskarte des Europa-Park Erlebnis-Resorts. Er wurde 2022 als Nachfolger der früheren ClubCard eingeführt und ermöglicht dir ein ganzes Jahr lang den Zugang zum Europa-Park – je nach gewählter Variante an bestimmten oder allen Öffnungstagen.</p>
            <p>Der ResortPass ist nicht einfach nur eine Eintrittskarte. Er ist dein Schlüssel zu einem ganzen Jahr voller Abenteuer, Achterbahnen und magischer Momente in Deutschlands größtem Freizeitpark. Mit über 100 Attraktionen und Shows, 15 europäischen Themenbereichen und regelmäßigen Events wie dem Traumzeit-Dome, der Horror Nights – Traumatica oder der HALLOWinter-Saison gibt es das ganze Jahr über etwas zu erleben.</p>
            
            <div className="bg-yellow-50 border-2 border-yellow-200 p-6 rounded-2xl flex gap-4 items-start shadow-sm">
              <div className="bg-yellow-400 p-2 rounded-lg text-white shrink-0 shadow-sm"><Zap size={20} fill="currentColor" /></div>
              <div>
                <strong className="block text-slate-900 text-lg mb-1">💡 Gut zu wissen:</strong>
                <p className="text-slate-700 m-0">Der ResortPass ist eine digitale Jahreskarte, die in der Europa-Park App oder im MackOne Account hinterlegt wird. Du brauchst keine physische Karte – alles läuft über einen QR-Code auf deinem Smartphone!</p>
              </div>
            </div>

            <BlogInjectedCTA variant={1} />

            <h2 className="text-2xl font-bold text-[#00305e] border-l-4 border-[#ffcc00] pl-4">Die zwei Varianten: Silver vs. Gold</h2>
            <p>Der Europa-Park bietet dir zwei verschiedene ResortPass-Varianten an: <strong>Silver</strong> und <strong>Gold</strong>. Beide haben ihre eigenen Vorteile und richten sich an unterschiedliche Besuchertypen. Schauen wir uns die Unterschiede genau an:</p>

            <h3 className="text-xl font-bold text-indigo-700">ResortPass Silver – Der perfekte Einstieg</h3>
            <p>Der ResortPass Silver ist ideal für dich, wenn du den Europa-Park regelmäßig besuchen möchtest, aber nicht unbedingt an jedem Tag im Jahr kommen musst. Mit dieser Variante kannst du den Park an <strong>über 230 vorab definierten Öffnungstagen</strong> besuchen.</p>
            <p><strong>Was bedeutet das konkret?</strong> Es gibt sogenannte Sperrtage, an denen du mit dem Silver Pass als Tagesgast nicht in den Park kannst. Das betrifft hauptsächlich Feiertage, Brückentage, Wochenenden in den Schulferien und besonders beliebte Events wie Halloween. Insgesamt sind das etwa 130-135 Tage im Jahr.</p>
            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-xl italic text-slate-700 shadow-sm">
                <strong className="text-green-800">💚 Insider-Tipp:</strong> Auch wenn du den Silver Pass hast, kannst du die Sperrtage umgehen! Wenn du eine Übernachtung in einem der Europa-Park Hotels, im Camp Resort oder auf dem Camping buchst, hast du an allen Tagen deines Aufenthalts freien Zugang – unabhängig von den Sperrtagen!
            </div>

            <h3 className="text-xl font-bold text-indigo-700">ResortPass Gold – Volle Flexibilität</h3>
            <p>Der ResortPass Gold ist die Premium-Variante ohne Einschränkungen. Mit ihm kannst du den Europa-Park an <strong>allen Öffnungstagen</strong> besuchen – ohne Sperrtage, ohne Ausnahmen. Du entscheidest spontan, wann du kommen möchtest!</p>

            <BlogInjectedCTA variant={2} />

            <h2 className="text-2xl font-bold text-[#00305e] border-l-4 border-[#ffcc00] pl-4">Preise für den ResortPass 2026</h2>
            <div className="bg-red-50 border-2 border-red-100 p-8 rounded-3xl shadow-sm my-10 text-center">
                <h3 className="text-red-700 text-2xl font-bold mb-6 mt-0">💰 ResortPass Preise 2026 (voraussichtlich)</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left max-w-md mx-auto">
                        <tbody className="divide-y divide-red-100">
                            <tr className="bg-white/50"><td className="py-3 text-slate-700 font-bold">ResortPass Silver</td><td></td></tr>
                            <tr><td className="py-2 text-slate-600">Erwachsene (ab 12 Jahre)</td><td className="py-2 text-right font-bold">295 €</td></tr>
                            <tr><td className="py-2 text-slate-600">Kinder (4-11 J.) / Senioren (60+)</td><td className="py-2 text-right font-bold">255 €</td></tr>
                            <tr className="bg-white/50"><td className="py-3 text-slate-700 font-bold pt-4">ResortPass Gold</td><td></td></tr>
                            <tr><td className="py-2 text-slate-600">Erwachsene (ab 12 Jahre)</td><td className="py-2 text-right font-bold">475 €</td></tr>
                            <tr><td className="py-2 text-slate-600">Kinder (4-11 J.) / Senioren (60+)</td><td className="py-2 text-right font-bold">415 €</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <p><strong>Wichtig:</strong> Die Preise für 2026 werden vom Europa-Park in der Regel Anfang des Jahres bekanntgegeben. Basierend auf der Preisentwicklung der letzten Jahre ist mit einer moderaten Preisanpassung zu rechnen.</p>
          </div>
        );
      case 'silver-vs-gold-vergleich':
        return (
          <div className="space-y-8">
            <div className="bg-blue-50/50 border-l-8 border-[#1a472a] p-8 rounded-r-3xl shadow-sm">
                <h2 className="text-2xl font-bold text-[#1a472a] mb-6 m-0 flex items-center gap-3">📋 Auf einen Blick</h2>
                <ul className="list-none p-0 space-y-4 m-0 text-lg">
                    <li className="flex items-start gap-3"><Check size={24} className="text-[#d4af37] shrink-0 mt-1" /> <strong>ResortPass Silver:</strong> 295 € für Erwachsene, über 230 Besuchstage, ideal für Sparfüchse</li>
                    <li className="flex items-start gap-3"><Check size={24} className="text-[#d4af37] shrink-0 mt-1" /> <strong>ResortPass Gold:</strong> 475 € für Erwachsene, alle Öffnungstage + 2x Rulantica</li>
                    <li className="flex items-start gap-3"><Check size={24} className="text-[#d4af37] shrink-0 mt-1" /> <strong>Preisdifferenz:</strong> 180 € – aber lohnt sich das Upgrade?</li>
                    <li className="flex items-start gap-3"><Check size={24} className="text-[#d4af37] shrink-0 mt-1" /> <strong>Entscheidungshilfe:</strong> Wir zeigen dir, welche Variante zu deinen Plänen passt</li>
                </ul>
            </div>

            <p className="text-xl leading-relaxed">Du willst dir endlich einen Europa-Park ResortPass zulegen, aber die Frage lässt dich nicht los: <strong>Silver oder Gold?</strong> Keine Sorge, du bist nicht allein! Diese Entscheidung stellt viele vor ein Dilemma. In diesem Artikel zeigen wir dir ganz genau, wo die Unterschiede liegen und für wen sich welche Variante wirklich lohnt.</p>

            <h2 className="text-3xl font-bold text-[#1a472a] mt-12 mb-6">Der direkte Vergleich: Silver vs. Gold</h2>
            <p>Zunächst schauen wir uns die beiden Varianten im direkten Vergleich an. So siehst du auf einen Blick, wo die Unterschiede liegen:</p>

            <div className="overflow-x-auto my-8">
                <table className="w-full border-collapse bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xl text-sm md:text-base">
                    <thead>
                        <tr className="bg-[#1a472a] text-white">
                            <th className="p-6 text-left font-bold">Feature</th>
                            <th className="p-6 text-center font-bold">ResortPass Silver</th>
                            <th className="p-6 text-center font-bold">ResortPass Gold</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        <tr className="bg-slate-50/50"><td className="p-5 font-bold">Preis (Erwachsene)</td><td className="p-5 text-center font-bold text-indigo-600">295 €</td><td className="p-5 text-center font-bold text-[#d4af37]">475 €</td></tr>
                        <tr><td className="p-5 font-bold">Preis (Kinder 4-11 Jahre)</td><td className="p-5 text-center">255 €</td><td className="p-5 text-center">415 €</td></tr>
                        <tr className="bg-slate-50/50"><td className="p-5 font-bold">Anzahl Besuchstage</td><td className="p-5 text-center">Über 230 definierte Tage</td><td className="p-5 text-center">Alle Öffnungstage</td></tr>
                        <tr><td className="p-5 font-bold">Sperrtage vorhanden</td><td className="p-5 text-center font-bold text-green-600"><Check size={18} className="inline mr-1"/> (ca. 135 Tage)</td><td className="p-5 text-center font-bold text-red-500"><X size={18} className="inline mr-1"/> Keine</td></tr>
                        <tr className="bg-slate-50/50"><td className="p-5 font-bold">Rulantica Tickets inkl.</td><td className="p-5 text-center text-red-500"><X size={18}/></td><td className="p-5 text-center text-green-600"><Check size={18} className="inline mr-1"/> 2 Tagestickets</td></tr>
                        <tr><td className="p-5 font-bold">Partnerparks (kostenlos)</td><td className="p-5 text-center text-green-600"><Check size={18} className="inline mr-1"/> 7 Parks</td><td className="p-5 text-center text-green-600"><Check size={18} className="inline mr-1"/> 7 Parks</td></tr>
                        <tr className="bg-slate-50/50"><td className="p-5 font-bold">VEEJOY Premium</td><td className="p-5 text-center text-green-600"><Check size={18}/></td><td className="p-5 text-center text-green-600"><Check size={18}/></td></tr>
                        <tr><td className="p-5 font-bold">Abendkino-Rabatt</td><td className="p-5 text-center text-green-600"><Check size={18}/></td><td className="p-5 text-center text-green-600"><Check size={18}/></td></tr>
                        <tr className="bg-slate-50/50"><td className="p-5 font-bold">Event-Vergünstigungen</td><td className="p-5 text-center text-green-600"><Check size={18}/></td><td className="p-5 text-center text-green-600"><Check size={18}/></td></tr>
                        <tr><td className="p-5 font-bold">Zugang bei Hotelübernachtung</td><td className="p-5 text-center text-green-600"><Check size={18} className="inline mr-1"/> Auch an Sperrtagen</td><td className="p-5 text-center text-green-600"><Check size={18}/></td></tr>
                    </tbody>
                </table>
            </div>

            <BlogInjectedCTA variant={1} />

            <h2 className="text-3xl font-bold text-[#1a472a] mt-12 mb-6">Was bedeuten die Sperrtage beim Silver Pass?</h2>
            <p>Der größte Unterschied zwischen Silver und Gold sind die <strong>Sperrtage</strong>. Beim ResortPass Silver kannst du den Park an über 230 vorab definierten Öffnungstagen besuchen – das klingt nach viel, bedeutet aber auch, dass etwa 135 Tage gesperrt sind.</p>

            <div className="bg-indigo-50 border-l-4 border-indigo-400 p-6 rounded-r-xl shadow-sm my-8">
                <strong className="text-indigo-700 block mb-2 font-bold text-lg">💡 Welche Tage sind gesperrt?</strong>
                <p className="m-0 text-indigo-900 leading-relaxed italic">Die Sperrtage liegen hauptsächlich auf besonders beliebten Zeiten wie Feiertagen, Brückentagen, Ferienzeiten und besonderen Event-Wochenenden (z.B. Halloween-Saison). Die genauen Sperrtage findest du im offiziellen Kalender auf der Europa-Park Website.</p>
            </div>

            <p>Die gute Nachricht: <strong>Wenn du im Europa-Park Hotel übernachtest, gelten die Sperrtage nicht!</strong> An deinen Übernachtungstagen hast du auch mit dem Silver Pass uneingeschränkten Zugang zum Park.</p>

            <h2 className="text-3xl font-bold text-[#1a472a] mt-12 mb-6">ResortPass Silver: Vor- und Nachteile</h2>
            <div className="grid md:grid-cols-2 gap-8 my-8">
                <div className="bg-white p-8 rounded-3xl shadow-lg border border-green-100">
                    <h4 className="text-xl font-bold text-green-600 mb-6 flex items-center gap-2"><Check size={24}/> Vorteile</h4>
                    <ul className="space-y-4 text-slate-600 pl-0 list-none">
                        <li className="flex items-start gap-2"><strong>+</strong> Deutlich günstiger (180 € Ersparnis)</li>
                        <li className="flex items-start gap-2"><strong>+</strong> Rechnet sich bereits ab 5 Besuchen</li>
                        <li className="flex items-start gap-2"><strong>+</strong> Über 230 Besuchstage verfügbar</li>
                        <li className="flex items-start gap-2"><strong>+</strong> Sperrtage umgehbar durch Hotels</li>
                        <li className="flex items-start gap-2"><strong>+</strong> Alle Partnerpark-Vorteile inklusive</li>
                        <li className="flex items-start gap-2"><strong>+</strong> Perfekt für Budget-Bewusste</li>
                    </ul>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-lg border border-red-100">
                    <h4 className="text-xl font-bold text-red-600 mb-6 flex items-center gap-2"><X size={24}/> Nachteile</h4>
                    <ul className="space-y-4 text-slate-600 pl-0 list-none">
                        <li className="flex items-start gap-2"><strong>−</strong> Ca. 135 Sperrtage im Jahr</li>
                        <li className="flex items-start gap-2"><strong>−</strong> Keine Spontanbesuche an Feiertagen</li>
                        <li className="flex items-start gap-2"><strong>−</strong> Halloween-Woche oft gesperrt</li>
                        <li className="flex items-start gap-2"><strong>−</strong> Keine Rulantica-Tickets inklusive</li>
                        <li className="flex items-start gap-2"><strong>−</strong> Reservierung vorher nötig</li>
                    </ul>
                </div>
            </div>

            <h2 className="text-3xl font-bold text-[#1a472a] mt-12 mb-6">ResortPass Gold: Vor- und Nachteile</h2>
            <div className="grid md:grid-cols-2 gap-8 my-8">
                <div className="bg-white p-8 rounded-3xl shadow-lg border border-green-100">
                    <h4 className="text-xl font-bold text-green-600 mb-6 flex items-center gap-2"><Check size={24}/> Vorteile</h4>
                    <ul className="space-y-4 text-slate-600 pl-0 list-none">
                        <li className="flex items-start gap-2"><strong>+</strong> Keine Sperrtage – volle Flexibilität</li>
                        <li className="flex items-start gap-2"><strong>+</strong> 2 Rulantica-Tickets (Wert ~90-100 €)</li>
                        <li className="flex items-start gap-2"><strong>+</strong> Spontanbesuche jederzeit möglich</li>
                        <li className="flex items-start gap-2"><strong>+</strong> Ideal für Familien in Ferienzeiten</li>
                        <li className="flex items-start gap-2"><strong>+</strong> Halloween und Events ohne Limit</li>
                        <li className="flex items-start gap-2"><strong>+</strong> Maximale Nutzungsmöglichkeiten</li>
                    </ul>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-lg border border-red-100">
                    <h4 className="text-xl font-bold text-red-600 mb-6 flex items-center gap-2"><X size={24}/> Nachteile</h4>
                    <ul className="space-y-4 text-slate-600 pl-0 list-none">
                        <li className="flex items-start gap-2"><strong>−</strong> 180 € teurer als Silver</li>
                        <li className="flex items-start gap-2"><strong>−</strong> Rechnet sich erst ab 6-7 Besuchen</li>
                        <li className="flex items-start gap-2"><strong>−</strong> Höhere Anfangsinvestition</li>
                        <li className="flex items-start gap-2"><strong>−</strong> Lohnt nur bei häufiger Nutzung</li>
                    </ul>
                </div>
            </div>

            <h2 className="text-3xl font-bold text-[#1a472a] mt-12 mb-6">Die Rechnung: Ab wann lohnt sich welcher Pass?</h2>
            <p>Schauen wir uns an, wann sich die jeweilige Variante rechnet. Ein normales Tagesticket für den Europa-Park kostet zwischen 64,50 € (Nebensaison) und 73 € (Hauptsaison).</p>

            <div className="grid md:grid-cols-2 gap-8 my-8">
                <div className="bg-gradient-to-br from-[#d4af37] to-[#8b4513] text-white p-10 rounded-3xl text-center shadow-xl">
                    <h3 className="text-2xl font-bold mb-4 mt-0 text-white">ResortPass Silver</h3>
                    <p className="text-5xl font-black mb-6">295 €</p>
                    <p className="text-lg leading-snug"><strong>Rechnet sich ab:</strong> 5 Besuchen im Park (nur Europa-Park)<br/><strong>Mit Partnerparks:</strong> Bereits ab 4 Besuchen</p>
                </div>
                <div className="bg-gradient-to-br from-[#1a472a] to-[#0d2818] text-white p-10 rounded-3xl text-center shadow-xl">
                    <h3 className="text-2xl font-bold mb-4 mt-0 text-white">ResortPass Gold</h3>
                    <p className="text-5xl font-black mb-6">475 €</p>
                    <p className="text-lg leading-snug"><strong>Ohne Rulantica:</strong> Ab 7-8 Besuchen<br/><strong>Mit Rulantica:</strong> Ab 6 Besuchen (Rulantica-Ticket ≈ 46-52 €)</p>
                </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-8 rounded-r-3xl shadow-sm">
                <strong className="text-blue-800 text-xl block mb-4">💰 Rechenbeispiel Familie (2 Erw. + 2 Kinder):</strong>
                <ul className="space-y-2 list-none pl-0 text-lg">
                    <li><strong>Silver:</strong> 1.100 € (295+295+255+255)</li>
                    <li><strong>Gold:</strong> 1.780 € (475+475+415+415)</li>
                    <li className="pt-4 border-t border-blue-200 mt-4 font-bold text-blue-900">Differenz: 680 € mehr für Gold</li>
                </ul>
            </div>

            <h2 className="text-3xl font-bold text-[#1a472a] mt-12 mb-6">Für wen ist der ResortPass Silver ideal?</h2>
            <div className="bg-white border-2 border-[#d4af37] p-8 rounded-3xl shadow-sm">
                <h3 className="text-2xl font-bold text-[#1a472a] mt-0 mb-6 flex items-center gap-2"><Check className="text-green-600"/> Du bist ein Silver-Typ, wenn...</h3>
                <ul className="space-y-4 list-none pl-0 text-lg">
                    <li className="flex items-start gap-2">✓ Du 4-6 mal im Jahr in den Europa-Park willst</li>
                    <li className="flex items-start gap-2">✓ Du flexibel außerhalb von Ferienzeiten planen kannst</li>
                    <li className="flex items-start gap-2">✓ Du auf dein Budget achten möchtest</li>
                    <li className="flex items-start gap-2">✓ Dir Sperrtage nichts ausmachen (z.B. wegen Hotelbuchungen)</li>
                    <li className="flex items-start gap-2">✓ Du Rulantica separat besuchst (oder gar nicht)</li>
                    <li className="flex items-start gap-2">✓ Du auch Partnerparks besuchen möchtest</li>
                </ul>
            </div>

            <BlogInjectedCTA variant={2} />

            <h2 className="text-3xl font-bold text-[#1a472a] mt-12 mb-6">Für wen ist der ResortPass Gold ideal?</h2>
            <div className="bg-white border-2 border-[#d4af37] p-8 rounded-3xl shadow-sm">
                <h3 className="text-2xl font-bold text-[#1a472a] mt-0 mb-6 flex items-center gap-2"><Check className="text-green-600"/> Du bist ein Gold-Typ, wenn...</h3>
                <ul className="space-y-4 list-none pl-0 text-lg">
                    <li className="flex items-start gap-2">✓ Du maximale Flexibilität brauchst</li>
                    <li className="flex items-start gap-2">✓ Du 7+ mal im Jahr in den Park willst</li>
                    <li className="flex items-start gap-2">✓ Du Kinder hast und auf Ferienzeiten angewiesen bist</li>
                    <li className="flex items-start gap-2">✓ Du auch Rulantica besuchen möchtest</li>
                    <li className="flex items-start gap-2">✓ Dir spontane Besuche wichtig sind</li>
                    <li className="flex items-start gap-2">✓ Du an Halloween oder besonderen Events dabei sein willst</li>
                    <li className="flex items-start gap-2">✓ Du den Park sehr häufig besuchst (Power-User)</li>
                </ul>
            </div>

            <h2 className="text-3xl font-bold text-[#1a472a] mt-12 mb-6">Unsere Empfehlung</h2>
            <p className="text-lg leading-relaxed">Für die meisten Besucher ist der <strong>ResortPass Silver die bessere Wahl</strong>. Warum? Weil er sich schneller amortisiert, die Sperrtage in der Praxis oft verschmerzbar sind und du trotzdem alle wichtigen Vorteile hast.</p>

            <div className="bg-amber-50 border-l-4 border-amber-400 p-8 rounded-r-3xl shadow-sm my-8 flex items-start gap-4">
                <AlertTriangle className="text-amber-600 shrink-0 mt-1" size={28} />
                <div>
                    <strong className="text-amber-800 text-xl block mb-2">⚠️ Wichtig zu wissen:</strong>
                    <p className="m-0 text-slate-700 leading-relaxed">Die Sperrtage betreffen vor allem sehr beliebte Tage, an denen der Park sowieso sehr voll ist. Viele erfahrene ResortPass-Inhaber empfehlen sogar, diese Tage zu meiden – mit dem Silver Pass hast du also einen "natürlichen" Schutz vor Überfüllung!</p>
                </div>
            </div>

            <h2 className="text-3xl font-bold text-[#1a472a] mt-12 mb-6">Häufig gestellte Fragen (FAQ)</h2>
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-10 space-y-8">
                <div>
                    <h4 className="text-xl font-bold text-[#1a472a] mb-3">Kann ich vom Silver auf Gold upgraden?</h4>
                    <p className="text-slate-600 m-0">Ein direktes Upgrade während der Laufzeit ist nicht möglich. Du kannst aber bei der nächsten Verlängerung auf Gold wechseln.</p>
                </div>
                <div>
                    <h4 className="text-xl font-bold text-[#1a472a] mb-3">Gibt es auch einen ResortPass für Familien?</h4>
                    <p className="text-slate-600 m-0">Es gibt keine spezielle Familienkarte. Du kaufst für jede Person einzeln einen Silver oder Gold Pass. Kinder unter 4 Jahren brauchen generell keinen Pass.</p>
                </div>
                <div>
                    <h4 className="text-xl font-bold text-[#1a472a] mb-3">Muss ich meinen Besuch vorher reservieren?</h4>
                    <p className="text-slate-600 m-0">Ja, bei beiden Varianten musst du deinen Besuchstag vorher über das ResortPass-Portal reservieren. Du kannst bis zu 5 Termine gleichzeitig buchen.</p>
                </div>
            </div>

            <h2 className="text-3xl font-bold text-[#1a472a] mt-12 mb-6">Fazit: Silver oder Gold?</h2>
            <p className="text-lg leading-relaxed">Die Entscheidung zwischen Silver und Gold hängt stark von deiner persönlichen Situation ab. <strong>Für die meisten Besucher ist Silver die klügere Wahl:</strong> günstiger, rechnet sich schneller und die Sperrtage sind in der Praxis gut zu verkraften.</p>

            <div className="bg-indigo-50 border-l-4 border-indigo-600 p-8 rounded-r-3xl shadow-sm my-8">
                <strong className="text-indigo-900 text-xl block mb-2">🎯 Unser Tipp:</strong>
                <p className="m-0 text-slate-700 leading-relaxed font-bold">Starte mit dem ResortPass Silver! Wenn du merkst, dass du noch öfter kommen möchtest oder die Sperrtage dich doch einschränken, kannst du beim nächsten Mal auf Gold upgraden. So gehst du kein finanzielles Risiko ein und lernst erst mal das System kennen.</p>
            </div>

            <hr className="my-12 border-slate-200" />
            <p className="text-slate-500 text-sm italic"><strong>Hinweis:</strong> Alle Preise und Informationen entsprechen dem Stand Dezember 2024. Änderungen durch den Europa-Park sind vorbehalten. Aktuelle Informationen findest du immer auf der offiziellen Website.</p>
          </div>
        );
      case 'resortpass-preise-2026':
        return (
          <div className="space-y-8">
            <div className="bg-[#5046e5] text-white p-10 rounded-3xl shadow-xl flex flex-col items-center text-center">
                <span className="bg-white/20 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4">Preis-Check 2026</span>
                <h2 className="text-3xl font-bold mb-6 text-white m-0">Was kostet der Pass wirklich?</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full mt-4">
                    <div className="bg-white/10 p-4 rounded-xl">
                        <p className="text-xs opacity-70 uppercase font-bold mb-1">Silver Erw.</p>
                        <p className="text-2xl font-bold">295 €</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-xl">
                        <p className="text-xs opacity-70 uppercase font-bold mb-1">Gold Erw.</p>
                        <p className="text-2xl font-bold">475 €</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-xl">
                        <p className="text-xs opacity-70 uppercase font-bold mb-1">Silver Kind</p>
                        <p className="text-2xl font-bold">255 €</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-xl">
                        <p className="text-xs opacity-70 uppercase font-bold mb-1">Gold Kind</p>
                        <p className="text-2xl font-bold">415 €</p>
                    </div>
                </div>
            </div>

            <p>Du planst, dir 2026 einen ResortPass zuzulegen? In diesem Artikel erfährst du <strong>alle Preise für 2026</strong> – übersichtlich, transparent und ohne versteckte Kosten.</p>

            <BlogInjectedCTA variant={1} />

            <h2 className="text-2xl font-bold text-[#00305e] pt-4">Optionale Zusatzkosten</h2>
            <div className="bg-indigo-50 border-2 border-indigo-100 p-8 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 text-indigo-200"><Clock size={120} opacity={0.1} /></div>
                <h3 className="text-indigo-900 font-bold text-xl mb-4">🚗 ParkingPass 2026</h3>
                <p className="text-4xl font-extrabold text-[#00305e] mb-4">39 €</p>
                <p className="text-indigo-800 text-sm max-w-md m-0">Ermöglicht dir 1 Jahr lang kostenloses Parken. Rechnet sich bereits ab dem <strong>4. Besuch</strong>, da Parken sonst 10 € pro Tag kostet.</p>
            </div>

            <BlogInjectedCTA variant={2} />
          </div>
        );
      case 'resortpass-amortisation-rechner':
        return (
          <div className="space-y-8">
            <div className="bg-slate-900 text-white rounded-3xl p-10 shadow-2xl">
                <div className="flex flex-wrap justify-between gap-6">
                    <div className="flex-1 min-w-[200px]">
                        <h2 className="text-2xl font-bold mb-4 m-0 text-white">Wann rechnet sich der Pass?</h2>
                        <p className="text-slate-400 mb-0">Rechne es hier direkt durch. Wir nutzen einen durchschnittlichen Ticketpreis von 68 € pro Tag.</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <div className="text-center bg-indigo-600 p-4 rounded-2xl w-32">
                            <p className="text-[10px] uppercase font-bold mb-1 opacity-70">Silver</p>
                            <p className="text-xl font-bold">5x</p>
                        </div>
                        <div className="text-center bg-amber-600 p-4 rounded-2xl w-32">
                            <p className="text-[10px] uppercase font-bold mb-1 opacity-70">Gold</p>
                            <p className="text-xl font-bold">6-7x</p>
                        </div>
                    </div>
                </div>
            </div>

            <p>295 € oder sogar 475 € sind eine Investition. Hier rechnen wir gemeinsam durch, ab wann sich der Pass wirklich für dich amortisiert.</p>

            <BlogInjectedCTA variant={1} />

            <h2 className="text-2xl font-bold text-[#00305e] pt-4">Die Grundrechnung</h2>
            <div className="grid md:grid-cols-2 gap-8 my-10">
                <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm text-center">
                    <h3 className="text-[#00305e] font-bold text-xl mb-4">💰 Silver Amortisation</h3>
                    <div className="text-4xl font-black text-indigo-600 mb-2">5 Besuche</div>
                    <p className="text-slate-500 text-sm m-0">295 € ÷ 68 € = 4,3 Tage</p>
                </div>
                <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm text-center">
                    <h3 className="text-[#00305e] font-bold text-xl mb-4">💰 Gold Amortisation</h3>
                    <div className="text-4xl font-black text-amber-600 mb-2">6 Besuche</div>
                    <p className="text-slate-500 text-sm m-0">Mit Einberechnung der Rulantica Tickets!</p>
                </div>
            </div>

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
                    <strong className="block mb-2 text-slate-900">Transparenz‑Hinweis</strong>
                    <p className="text-sm text-slate-500 m-0 leading-relaxed">
                    Dieser Artikel fasst öffentlich verfügbare Informationen zusammen. Für verbindliche Details gelten ausschließlich die Angaben des Europa‑Park / Mack International Ticketshops. ResortPassAlarm ist ein unabhängiger Service.
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
