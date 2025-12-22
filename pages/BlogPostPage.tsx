
import React from 'react';
/* Added missing HelpCircle import */
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

  // Integrated CTA for the blog
  const BlogInjectedCTA = () => (
    <div className="my-12 bg-[#001529] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden not-prose border-l-8 border-[#ffcc00]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4 text-[#ffcc00] font-bold uppercase tracking-widest text-sm">
                <Zap size={18} fill="currentColor" /> Der entscheidende Zeitvorteil
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold mb-4 text-white">Keine Lust auf ständiges Neuladen?</h3>
            <p className="text-blue-100 mb-8 text-lg leading-relaxed">
                Während du diesen Artikel liest, könnten bereits neue ResortPässe freigeschaltet worden sein. Unser Wächter überwacht die Server 24/7 für dich und schickt dir sofort eine <strong>E-Mail & SMS</strong>, wenn neue Kontingente frei werden.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
                <Button onClick={() => navigate('landing')} className="bg-[#5046e5] hover:bg-indigo-700 text-white border-0 px-8 py-4 font-bold text-lg w-full sm:w-auto shadow-lg shadow-indigo-500/20">
                    Jetzt Überwachung starten <ArrowRight size={20} className="ml-2" />
                </Button>
                <div className="text-sm text-slate-400 flex items-center gap-2 italic">
                    <ShieldCheck size={18} className="text-green-500" /> Über 5.000 erfolgreiche Alarme
                </div>
            </div>
        </div>
    </div>
  );

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

            <BlogInjectedCTA />

            <h2 className="text-2xl font-bold text-[#00305e] border-l-4 border-[#ffcc00] pl-4">Die zwei Varianten: Silver vs. Gold</h2>
            <p>Der Europa-Park bietet dir zwei verschiedene ResortPass-Varianten an: <strong>Silver</strong> und <strong>Gold</strong>. Beide haben ihre eigenen Vorteile und richten sich an unterschiedliche Besuchertypen. Schauen wir uns die Unterschiede genau an:</p>

            <h3 className="text-xl font-bold text-indigo-700">ResortPass Silver – Der perfekte Einstieg</h3>
            <p>Der ResortPass Silver ist ideal für dich, wenn du den Europa-Park regelmäßig besuchen möchtest, aber nicht unbedingt an jedem Tag im Jahr kommen musst. Mit dieser Variante kannst du den Park an <strong>über 230 vorab definierten Öffnungstagen</strong> besuchen.</p>
            <p><strong>Was bedeutet das konkret?</strong> Es gibt sogenannte Sperrtage, an denen du mit dem Silver Pass als Tagesgast nicht in den Park kannst. Das betrifft hauptsächlich Feiertage, Brückentages, Wochenenden in den Schulferien und besonders beliebte Events wie Halloween. Insgesamt sind das etwa 130-135 Tage im Jahr.</p>
            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-xl italic text-slate-700 shadow-sm">
                <strong className="text-green-800">💚 Insider-Tipp:</strong> Auch wenn du den Silver Pass hast, kannst du die Sperrtage umgehen! Wenn du eine Übernachtung in einem der Europa-Park Hotels, im Camp Resort oder auf dem Camping buchst, hast du an allen Tagen deines Aufenthalts freien Zugang – unabhängig von den Sperrtagen!
            </div>

            <h3 className="text-xl font-bold text-indigo-700">ResortPass Gold – Volle Flexibilität</h3>
            <p>Der ResortPass Gold ist die Premium-Variante ohne Einschränkungen. Mit ihm kannst du den Europa-Park an <strong>allen Öffnungstagen</strong> besuchen – ohne Sperrtage, ohne Ausnahmen. Du entscheidest spontan, wann du kommen möchtest!</p>
            <p>Zusätzlich enthält der Gold Pass zwei besondere Extras:</p>
            <ul className="list-disc pl-6 space-y-3">
                <li><strong>Zwei Tagestickets für Rulantica:</strong> Die Wasserwelt Rulantica ist normalerweise nicht im regulären Europa-Park Ticket enthalten. Mit dem Gold Pass darfst du zweimal während der Laufzeit die nordische Wasserwelt besuchen (nach Verfügbarkeit und mit Voranmeldung).</li>
                <li><strong>Physische Karte inklusive:</strong> Während du beim Silver Pass eine physische Karte extra bezahlen musst (5 €), erhältst du beim Gold Pass eine hochwertige, gedruckte Karte per Post zugeschickt – ohne Aufpreis.</li>
            </ul>

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
                            <tr className="bg-white/50 border-t-2 border-red-200"><td className="py-4 text-indigo-700 font-bold">ParkingPass (optional)</td><td className="py-4 text-right font-bold text-indigo-700">39 €</td></tr>
                        </tbody>
                    </table>
                </div>
                <p className="text-xs text-slate-400 mt-6 italic m-0">Preise können sich ändern. Stand: Dezember 2025</p>
            </div>
            <p><strong>Wichtig:</strong> Die Preise für 2026 werden vom Europa-Park in der Regel Anfang des Jahres bekanntgegeben. Basierend auf der Preisentwicklung der letzten Jahre ist mit einer moderaten Preisanpassung zu rechnen.</p>

            <BlogInjectedCTA />

            <h2 className="text-2xl font-bold text-[#00305e] border-l-4 border-[#ffcc00] pl-4">Die wichtigsten Vorteile im Überblick</h2>
            <p>Was macht den ResortPass so attraktiv? Hier sind die wichtigsten Vorteile, die beide Varianten (Silver und Gold) bieten:</p>
            <h3 className="text-lg font-bold text-slate-900 mt-6">1. Unbegrenzter Europa-Park Zugang</h3>
            <p>Das ist natürlich der Hauptvorteil: Du kannst ein ganzes Jahr lang so oft in den Europa-Park, wie du möchtest. Bei Einzeltickets von 65-73 € pro Besuch amortisiert sich der Pass bereits nach wenigen Besuchen.</p>
            
            <h3 className="text-lg font-bold text-slate-900 mt-6">2. Partnerparks kostenlos oder vergünstigt</h3>
            <p>Mit deinem ResortPass kannst du auch andere Freizeitparks in Europa besuchen – und das einmal pro Jahr kostenlos! Dazu gehören:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li><strong>Efteling</strong> (Niederlande)</li>
                <li><strong>Liseberg</strong> (Schweden)</li>
                <li><strong>Port Aventura</strong> (Spanien)</li>
                <li><strong>Isla Mágica</strong> (Spanien)</li>
                <li><strong>Pleasure Beach Resort</strong> (England)</li>
                <li><strong>Emerald Park</strong> (Irland)</li>
            </ul>
            <p>Zusätzlich erhältst du <strong>40% Rabatt</strong> auf den Eintritt in allen Plopsa-Parks (Holiday Park, Plopsaland De Panne etc.).</p>

            <h3 className="text-lg font-bold text-slate-900 mt-6">3. VEEJOY Premium-Zugang</h3>
            <p>Als ResortPass-Besitzer hast du kostenlosen Zugang zu exklusiven Premium-Inhalten wie Baudokumentationen, Behind-the-Scenes-Material und Shows auf der Streaming-Plattform VEEJOY.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-6">4. Vergünstigungen im Park</h3>
            <p>Mit dem ResortPass sparst du auch bei weiteren Angeboten: Abendkino (2 € Rabatt), spezielle Event-Aktionen und mehrmals im Jahr "Bring a Friend" Angebote.</p>

            <h2 className="text-2xl font-bold text-[#00305e] border-l-4 border-[#ffcc00] pl-4">Wie funktioniert die Reservierung?</h2>
            <p>Der ResortPass ist nicht einfach eine "Komm-wann-du-willst"-Karte. Du musst deine Besuche vorher <strong>reservieren</strong>. Das geht einfach online:</p>
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                <h3 className="text-xl font-bold text-indigo-700 mb-6 mt-0">Reservierungssystem erklärt</h3>
                <ol className="space-y-4 list-decimal pl-6">
                    <li><strong>Anmeldung im ResortPass Portal:</strong> Logge dich in deinen MackOne Account ein oder lade die Europa-Park App herunter.</li>
                    <li><strong>Besuchstag auswählen:</strong> Im Portal siehst du einen Kalender mit allen verfügbaren Tagen. Wähle deinen Tag aus.</li>
                    <li><strong>Reservierung bestätigen:</strong> Nach der Auswahl erhältst du eine Bestätigung und einen QR-Code in der App.</li>
                    <li><strong>Einlass am Parkeingang:</strong> Am Besuchstag zeigst du einfach den QR-Code am Eingang und kannst direkt loslegen!</li>
                </ol>
                <div className="mt-8 bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm flex gap-3">
                    <Info className="text-blue-600 shrink-0" size={20} />
                    <p className="m-0 font-medium">Du kannst bis zu <strong>fünf Besuchstage gleichzeitig reservieren</strong>. Sobald du einen davon besucht hast, wird ein Platz frei und du kannst den nächsten Tag buchen. So hast du immer genug Flexibilität!</p>
                </div>
            </div>

            <BlogInjectedCTA />

            <h2 className="text-2xl font-bold text-[#00305e] border-l-4 border-[#ffcc00] pl-4">Für wen lohnt sich welcher Pass?</h2>
            <p>Jetzt wird's konkret: Welcher ResortPass passt zu dir? Hier sind unsere Empfehlungen:</p>
            <ul className="grid md:grid-cols-2 gap-6 list-none pl-0">
                <li className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <strong className="text-indigo-700 block mb-2 text-lg">Der Silver Pass ist perfekt für dich, wenn...</strong>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
                        <li>Du etwa 4-8 Mal im Jahr in den Europa-Park möchtest</li>
                        <li>Du hauptsächlich unter der Woche oder in der Nebensaison kommst</li>
                        <li>Du auch mal eine Hotelübernachtung buchst (umgeht Sperrtage)</li>
                        <li>Du ein begrenztes Budget hast</li>
                        <li>Dir die Partnerpark-Vorteile wichtig sind</li>
                    </ul>
                </li>
                <li className="bg-amber-50 p-6 rounded-2xl border border-amber-200">
                    <strong className="text-amber-800 block mb-2 text-lg">Der Gold Pass ist perfekt für dich, wenn...</strong>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                        <li>Du maximale Flexibilität brauchst und spontan kommen willst</li>
                        <li>Du hauptsächlich an Ferien/Wochenenden Zeit hast</li>
                        <li>Du auch Rulantica besuchen möchtest (2 Tickets inkl.!)</li>
                        <li>Du sehr oft (8+ Mal) im Jahr in den Park gehst</li>
                        <li>Du Events wie Halloween oder Silvester nicht verpassen willst</li>
                    </ul>
                </li>
            </ul>

            <h2 className="text-2xl font-bold text-[#00305e] border-l-4 border-[#ffcc00] pl-4">Häufig gestellte Fragen (FAQ)</h2>
            <div className="space-y-4">
                {[
                    { q: "Wie lange ist der ResortPass gültig?", a: "Ab dem gewählten Startdatum exakt 12 Monate. Das Startdatum kannst du beim Kauf bis zu 14 Tage in die Zukunft legen." },
                    { q: "Kann ich den ResortPass verlängern?", a: "Ja! Ab 14 Tage vor Ende der Laufzeit kannst du deinen Pass im Portal zum aktuellen Preis verlängern." },
                    { q: "Ist der Pass übertragbar?", a: "Nein, der ResortPass ist personengebunden und nicht übertragbar. Jede Person braucht ihren eigenen Pass mit Foto." },
                    { q: "Brauche ich eine physische Karte?", a: "Die App reicht völlig aus! Eine physische Karte kannst du optional gegen Gebühr (Silver 5€, Gold kostenlos) erhalten." },
                    { q: "Was ist mit Kindern unter 4 Jahren?", a: "Kinder unter 4 Jahren haben freien Eintritt und brauchen keinen ResortPass und keine Reservierung." }
                ].map((faq, i) => (
                    <div key={i} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                        <h4 className="text-indigo-600 font-bold mb-3 flex items-start gap-2 text-lg"><HelpCircle className="shrink-0 mt-1" size={20}/> {faq.q}</h4>
                        <p className="text-slate-600 text-base m-0 leading-relaxed">{faq.a}</p>
                    </div>
                ))}
            </div>

            <h2 className="text-2xl font-bold text-[#00305e] border-l-4 border-[#ffcc00] pl-4">Unser Fazit: Lohnt sich der ResortPass 2026?</h2>
            <p>Der Europa-Park ResortPass ist eine fantastische Möglichkeit, Deutschlands besten Freizeitpark intensiv zu erleben. Besonders der <strong>ResortPass Silver</strong> bietet ein hervorragendes Preis-Leistungs-Verhältnis: Bereits ab 4-5 Besuchen im Jahr hat sich der Pass amortisiert – und dann kommen noch die Partnerpark-Vorteile, VEEJOY und alle anderen Extras dazu.</p>
            <p>Der <strong>ResortPass Gold</strong> richtet sich an absolute Europa-Park Fans, die maximale Flexibilität wollen und auch die Wasserwelt Rulantica nicht verpassen möchten. Die höheren Kosten rechtfertigen sich durch die fehlenden Sperrtage und die zwei inkludierten Rulantica-Besuche.</p>

            <div className="bg-[#00305e] text-white p-10 rounded-3xl shadow-xl text-center">
                <p className="text-[#ffcc00] font-black text-2xl mb-4">Sichere dir jetzt deinen Vorteil!</p>
                <p className="mb-8 text-lg opacity-90">Die Pässe sind oft ausverkauft. Aktiviere unseren Alarm, um sofort informiert zu werden, wenn neue Kontingente frei werden.</p>
                <Button onClick={() => navigate('landing')} className="bg-[#ffcc00] text-[#00305e] border-0 mx-auto font-bold px-10 py-4 text-xl hover:scale-105 transition-transform shadow-xl shadow-yellow-500/10">
                    ResortPass Alarm aktivieren
                </Button>
            </div>
            <p className="text-xs text-slate-400 italic text-center">Hinweis: Dies ist ein Informationsartikel basierend auf aktuellen Konditionen. Preise und Details können sich für 2026 noch ändern. Offizielle Infos findest du auf der Europa-Park Website.</p>
          </div>
        );
      case 'silver-vs-gold-vergleich':
        return (
          <div className="space-y-8 text-slate-700 leading-relaxed">
            <div className="bg-indigo-50 border-l-8 border-indigo-600 p-8 rounded-r-3xl shadow-sm mb-12">
                <h2 className="text-2xl font-bold text-[#00305e] mb-6 m-0 flex items-center gap-3"><Info className="text-indigo-600"/> 📋 Auf einen Blick</h2>
                <ul className="list-none p-0 space-y-4 m-0 text-lg">
                    <li className="flex items-start gap-3"><Check size={24} className="text-green-600 shrink-0 mt-1" /> <strong>ResortPass Silver:</strong> 295 € für Erwachsene, über 230 Besuchstage, ideal für Sparfüchse</li>
                    <li className="flex items-start gap-3"><Check size={24} className="text-green-600 shrink-0 mt-1" /> <strong>ResortPass Gold:</strong> 475 € für Erwachsene, alle Öffnungstage + 2x Rulantica</li>
                    <li className="flex items-start gap-3"><Check size={24} className="text-green-600 shrink-0 mt-1" /> <strong>Preisdifferenz:</strong> 180 € – aber lohnt sich das Upgrade?</li>
                    <li className="flex items-start gap-3"><Check size={24} className="text-green-600 shrink-0 mt-1" /> <strong>Entscheidungshilfe:</strong> Wir zeigen dir, welche Variante zu deinen Plänen passt</li>
                </ul>
            </div>

            <p className="text-xl">Du willst dir endlich einen Europa-Park ResortPass zulegen, aber die Frage lässt dich nicht los: <strong>Silver oder Gold?</strong> Keine Sorge, du bist nicht allein! Diese decision stellt viele vor ein Dilemma. In diesem Artikel zeigen wir dir ganz genau, wo die Unterschiede liegen und für wen sich welche Variante wirklich lohnt.</p>

            <h2 className="text-3xl font-bold text-[#00305e] pt-6 mb-6">Der direkte Vergleich: Silver vs. Gold</h2>
            <p>Zunächst schauen wir uns die beiden Varianten im direkten Vergleich an. So siehst du auf einen Blick, wo die Unterschiede liegen:</p>

            <div className="overflow-x-auto my-12">
                <table className="w-full border-collapse bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xl">
                    <thead>
                        <tr className="bg-[#00305e] text-white">
                            <th className="p-6 text-left text-lg">Feature</th>
                            <th className="p-6 text-center text-lg">ResortPass Silver</th>
                            <th className="p-6 text-center text-lg">ResortPass Gold</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-base">
                        <tr className="bg-slate-50/50"><td className="p-5 font-bold">Preis (Erwachsene)</td><td className="p-5 text-center font-bold text-indigo-600">295 €</td><td className="p-5 text-center font-bold text-amber-600">475 €</td></tr>
                        <tr><td className="p-5 font-bold">Besuchstage</td><td className="p-5 text-center">Über 230 definierte Tage</td><td className="p-5 text-center">Alle Öffnungstage</td></tr>
                        <tr className="bg-slate-50/50"><td className="p-5 font-bold">Sperrtage vorhanden</td><td className="p-5 text-center font-bold text-red-500">Ja (ca. 135 Tage)</td><td className="p-5 text-center font-bold text-green-600">Keine</td></tr>
                        <tr><td className="p-5 font-bold">Rulantica Tickets</td><td className="p-5 text-center">—</td><td className="p-5 text-center font-bold text-green-600">2 Tagestickets</td></tr>
                        <tr className="bg-slate-50/50"><td className="p-5 font-bold">Partnerparks (kostenlos)</td><td className="p-5 text-center">7 Parks</td><td className="p-5 text-center">7 Parks</td></tr>
                    </tbody>
                </table>
            </div>

            <BlogInjectedCTA />

            <h2 className="text-3xl font-bold text-[#00305e] pt-6">Was bedeuten die Sperrtage beim Silver Pass?</h2>
            <p>Der größte Unterschied zwischen Silver und Gold sind die <strong>Sperrtage</strong>. Beim ResortPass Silver kannst du den Park an über 230 vorab definierten Öffnungstagen besuchen – das klingt nach viel, bedeutet aber auch, dass etwa 135 Tage gesperrt sind.</p>
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-xl shadow-sm mb-8">
                <p className="m-0 text-blue-900"><strong className="text-blue-600">💡 Welche Tage sind gesperrt?</strong> Die Sperrtage liegen hauptsächlich auf besonders beliebten Zeiten wie Feiertagen, Brückentagen, Ferienzeiten und besonderen Event-Wochenenden (z.B. Halloween-Saison). Die genauen Sperrtage findest du im offiziellen Kalender auf der Europa-Park Website.</p>
            </div>
            <p>Die gute Nachricht: <strong>Wenn du im Europa-Park Hotel übernachtest, gelten die Sperrtage nicht!</strong> An deinen Übernachtungstagen hast du auch mit dem Silver Pass uneingeschränkten Zugang zum Park.</p>

            <div className="grid md:grid-cols-2 gap-8 my-16">
                <div className="bg-white border-2 border-slate-100 p-8 rounded-3xl shadow-lg">
                    <h4 className="text-green-600 font-black text-2xl mb-6 flex items-center gap-2"><Check size={28}/> Vorteile Silver</h4>
                    <ul className="space-y-4 text-slate-600">
                        <li className="flex items-start gap-2"><span className="text-green-500 font-bold">+</span> Deutlich günstiger (180 € Ersparnis)</li>
                        <li className="flex items-start gap-2"><span className="text-green-500 font-bold">+</span> Rechnet sich bereits ab 5 Besuchen</li>
                        <li className="flex items-start gap-2"><span className="text-green-500 font-bold">+</span> Alle Partnerpark-Vorteile inklusive</li>
                        <li className="flex items-start gap-2"><span className="text-green-500 font-bold">+</span> Perfekt für Budget-Bewusste</li>
                    </ul>
                </div>
                <div className="bg-white border-2 border-slate-100 p-8 rounded-3xl shadow-lg">
                    <h4 className="text-amber-600 font-black text-2xl mb-6 flex items-center gap-2"><Star size={28} fill="currentColor"/> Vorteile Gold</h4>
                    <ul className="space-y-4 text-slate-600">
                        <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">+</span> Keine Sperrtage – volle Flexibilität</li>
                        <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">+</span> 2 Rulantica-Tagestickets inklusive</li>
                        <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">+</span> Ideal für Familien in Ferienzeiten</li>
                        <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">+</span> Halloween und Events ohne Limit</li>
                    </ul>
                </div>
            </div>

            <BlogInjectedCTA />

            <h2 className="text-3xl font-bold text-[#00305e] pt-6">Unsere Empfehlung</h2>
            <p>Für die meisten Besucher ist der <strong>ResortPass Silver die bessere Wahl</strong>. Warum? Weil er sich schneller amortisiert, die Sperrtage in der Praxis oft verschmerzbar sind und du trotzdem alle wichtigen Vorteile hast.</p>
            <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-xl shadow-sm mb-8 flex gap-4 items-start">
                <AlertTriangle className="text-amber-600 shrink-0 mt-1" size={24} />
                <p className="m-0 text-amber-900 font-medium">Die Sperrtage betreffen vor allem Tage, an denen der Park sowieso sehr voll ist. Viele erfahrene ResortPass-Inhaber empfehlen sogar, diese Tage zu meiden – mit dem Silver Pass hast du also einen "natürlichen" Schutz vor Überfüllung!</p>
            </div>
            <p className="text-lg font-bold text-[#00305e]">🎯 Unser Tipp: Starte mit Silver! Wenn du merkst, dass du doch öfter kommen möchtest oder die Sperrtage dich doch einschränken, kannst du beim nächsten Mal auf Gold upgraden. So lernst du das System erst einmal kennen.</p>
          </div>
        );
      case 'resortpass-preise-2026':
        return (
          <div className="space-y-10 text-slate-700 leading-relaxed">
            <div className="bg-indigo-600 text-white p-12 rounded-[3rem] shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <span className="bg-white/20 px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest mb-6 relative z-10">Preis-Check 2026</span>
                <h2 className="text-4xl md:text-5xl font-black mb-10 text-white m-0 relative z-10 leading-tight">Was kostet der <br/>ResortPass wirklich?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full relative z-10">
                    {[
                        { l: "Silver Erw.", v: "295 €" },
                        { l: "Gold Erw.", v: "475 €" },
                        { l: "Silver Kind", v: "255 €" },
                        { l: "Gold Kind", v: "415 €" }
                    ].map((p, i) => (
                        <div key={i} className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-lg">
                            <p className="text-blue-100 text-xs uppercase font-black mb-1 tracking-wider">{p.l}</p>
                            <p className="text-3xl font-black text-[#ffcc00]">{p.v}</p>
                        </div>
                    ))}
                </div>
            </div>

            <p className="text-xl">Du planst, dir 2026 einen Europa-Park ResortPass zuzulegen? Super decision! Aber was kostet das Ganze eigentlich genau? In diesem Artikel erfährst du <strong>alle Preise für 2026</strong> – übersichtlich, transparent und ohne versteckte Kosten. Egal ob Silver oder Gold, für die ganze Familie oder alleine.</p>

            <BlogInjectedCTA />

            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-indigo-100 pb-2">ResortPass Silver: Preise 2026</h2>
            <div className="bg-white border-2 border-slate-100 p-8 rounded-3xl shadow-xl">
                <table className="w-full text-lg">
                    <tbody className="divide-y divide-slate-100">
                        <tr><td className="py-4 font-bold text-slate-900">Erwachsene (ab 12 J.)</td><td className="py-4 text-right font-black text-indigo-600">295 €</td></tr>
                        <tr><td className="py-4 font-bold text-slate-900">Kinder (4-11 J.)</td><td className="py-4 text-right font-black text-indigo-600">255 €</td></tr>
                        <tr><td className="py-4 font-bold text-slate-900">Senioren (60+)</td><td className="py-4 text-right font-black text-indigo-600">255 €</td></tr>
                        <tr><td className="py-4 font-bold text-slate-900">Ermäßigt (mit Ausweis)</td><td className="py-4 text-right font-black text-indigo-600">255 €</td></tr>
                    </tbody>
                </table>
            </div>

            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-indigo-100 pb-2">ResortPass Gold: Preise 2026</h2>
            <div className="bg-white border-2 border-slate-100 p-8 rounded-3xl shadow-xl">
                <table className="w-full text-lg">
                    <tbody className="divide-y divide-slate-100">
                        <tr><td className="py-4 font-bold text-slate-900">Erwachsene (ab 12 J.)</td><td className="py-4 text-right font-black text-amber-600">475 €</td></tr>
                        <tr><td className="py-4 font-bold text-slate-900">Kinder (4-11 J.)</td><td className="py-4 text-right font-black text-amber-600">415 €</td></tr>
                        <tr><td className="py-4 font-bold text-slate-900">Senioren (60+)</td><td className="py-4 text-right font-black text-amber-600">415 €</td></tr>
                        <tr><td className="py-4 font-bold text-slate-900">Ermäßigt (mit Ausweis)</td><td className="py-4 text-right font-black text-amber-600">415 €</td></tr>
                    </tbody>
                </table>
            </div>

            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-indigo-100 pb-2">Optionale Zusatzkosten</h2>
            <div className="bg-indigo-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute -bottom-10 -right-10 text-indigo-800 opacity-20"><Clock size={200} /></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="bg-indigo-700/50 p-6 rounded-3xl border border-indigo-600">
                        <Calculator className="text-[#ffcc00] mb-2" size={40} />
                        <h3 className="text-[#ffcc00] font-black text-2xl mb-1 m-0">ParkingPass 2026</h3>
                        <p className="text-5xl font-black mb-0">39 €</p>
                    </div>
                    <div className="flex-1">
                        <p className="text-lg font-bold mb-3">Lohnt sich der ParkingPass?</p>
                        <p className="text-blue-100 m-0">Normales Parken kostet 10 € pro Tag. Der ParkingPass rechnet sich also bereits ab dem <strong>4. Besuch</strong>. Wenn du mit dem Auto anreist, ist er ein absolutes Must-have!</p>
                    </div>
                </div>
            </div>

            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-indigo-100 pb-2">Preisentwicklung & Fazit</h2>
            <p>Die Preise für 2026 bleiben stabil! Nach der Preiserhöhung für 2025 hat der Europa-Park die Preise für 2026 <strong>nicht weiter erhöht</strong>. Das ist eine positive Nachricht für alle Fans!</p>
            <div className="bg-green-50 border-l-4 border-green-500 p-8 rounded-r-2xl shadow-sm italic text-slate-700 text-lg">
                <strong>Gute Nachrichten:</strong> Zusammenfassend bewegen sich die Preise zwischen 255 € (Silver Kind) und 475 € (Gold Erwachsener). Für die meisten ist Silver die beste Wahl. Den ParkingPass solltest du unbedingt dazubuchen.
            </div>

            <BlogInjectedCTA />
          </div>
        );
      case 'resortpass-amortisation-rechner':
        return (
          <div className="space-y-10 text-slate-700 leading-relaxed">
            <div className="bg-slate-900 text-white rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-transparent"></div>
                <div className="relative z-10">
                    <h2 className="text-3xl md:text-4xl font-black mb-6 m-0 text-white leading-tight">Lohnt sich der ResortPass? <br/><span className="text-[#ffcc00]">So rechnest du es dir aus.</span></h2>
                    <p className="text-slate-300 text-lg max-w-2xl mb-10">295 € oder sogar 475 € sind eine ordentliche Investition. Wir nutzen für die Rechnung einen durchschnittlichen Ticketpreis von <strong>68 € pro Tag</strong>.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center">
                            <p className="text-xs uppercase font-black text-indigo-400 mb-2">Amortisation Silver</p>
                            <p className="text-4xl font-black text-white">5 Besuche</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center">
                            <p className="text-xs uppercase font-black text-amber-400 mb-2">Amortisation Gold</p>
                            <p className="text-4xl font-black text-white">6-7 Besuche</p>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-xl">Du planst eine Investition in dein Freizeitvergnügen? Wir rechnen es gemeinsam durch! Hier erfährst du, ab wann sich der Pass amortisiert und welche versteckten Vorteile du einberechnen solltest.</p>

            <h2 className="text-3xl font-bold text-[#00305e] border-l-8 border-[#ffcc00] pl-6 py-2">Die Grundrechnung</h2>
            <div className="grid md:grid-cols-2 gap-8 my-16">
                <div className="bg-white border-2 border-slate-100 p-10 rounded-[2.5rem] shadow-xl text-center flex flex-col justify-center">
                    <h3 className="text-indigo-900 font-black text-2xl mb-6 mt-0">💰 Silver Rechnung</h3>
                    <div className="text-6xl font-black text-indigo-600 mb-4 tracking-tighter">5x</div>
                    <p className="text-slate-500 font-medium m-0">295 € ÷ 68 € = 4,3 Tage</p>
                    <div className="mt-8 pt-8 border-t border-slate-50 text-sm text-slate-400">Rechnet sich ab dem 5. Parkbesuch.</div>
                </div>
                <div className="bg-white border-2 border-slate-100 p-10 rounded-[2.5rem] shadow-xl text-center flex flex-col justify-center">
                    <h3 className="text-amber-900 font-black text-2xl mb-6 mt-0">💰 Gold Rechnung</h3>
                    <div className="text-6xl font-black text-amber-600 mb-4 tracking-tighter">6x</div>
                    <p className="text-slate-500 font-medium m-0">Mit Einberechnung der Rulantica Tickets!</p>
                    <div className="mt-8 pt-8 border-t border-slate-50 text-sm text-slate-400">Rechnet sich ab dem 6. Besuch (inkl. 2x Rulantica).</div>
                </div>
            </div>

            <BlogInjectedCTA />

            <h2 className="text-3xl font-bold text-[#00305e] border-l-8 border-[#ffcc00] pl-6 py-2">Versteckte Vorteile nutzen</h2>
            <p>Die reine Ticket-Rechnung ist nicht alles. Vergiss nicht die <strong>Partnerpark-Besuche</strong>. Je einmal kostenlos nach Efteling, Liseberg oder Port Aventura spart dir locker noch einmal 150-200 € pro Jahr! Wenn du nur zwei Partnerparks besuchst, hat sich der Pass oft schon nach 3 Europa-Park Besuchen finanziert.</p>
            <div className="bg-indigo-50 p-8 rounded-3xl border border-indigo-100 flex gap-6 items-start">
                <div className="bg-indigo-600 p-3 rounded-2xl text-white shrink-0 shadow-lg"><Star fill="currentColor" /></div>
                <div>
                    <h4 className="font-black text-indigo-900 text-xl mb-2 mt-0">Echter Mehrwert</h4>
                    <p className="m-0 text-indigo-800 leading-relaxed text-lg">Ein Roadtrip zu den Partnerparks bringt einen massiven finanziellen Vorteil. Kombiniert mit dem ParkingPass (rechnet sich ab 4. Besuch) ist der ResortPass für Stammgäste unschlagbar.</p>
                </div>
            </div>

            <h2 className="text-3xl font-bold text-[#00305e] border-l-8 border-[#ffcc00] pl-6 py-2">Wann lohnt sich der Pass NICHT?</h2>
            <div className="bg-red-50 p-8 rounded-3xl border border-red-100 shadow-sm">
                <p className="font-bold text-red-900 mb-4 mt-0 flex items-center gap-2 text-xl"><AlertCircle size={24}/> Sei vorsichtig, wenn...</p>
                <ul className="space-y-4 text-red-800 text-lg">
                    <li className="flex items-start gap-2"><X size={20} className="shrink-0 mt-1"/> Du nur 1-3 mal im Jahr in den Park fährst.</li>
                    <li className="flex items-start gap-2"><X size={20} className="shrink-0 mt-1"/> Du sehr weit weg wohnst (4+ Stunden) und Spontanität für dich schwierig ist.</li>
                    <li className="flex items-start gap-2"><X size={20} className="shrink-0 mt-1"/> Du eine sehr große Familie hast und nur 2-3 Besuche schaffst.</li>
                </ul>
            </div>

            <h2 className="text-3xl font-bold text-[#00305e] border-l-8 border-[#ffcc00] pl-6 py-2">Fazit: Die wirtschaftlichste Lösung</h2>
            <p className="text-lg">Der ResortPass lohnt sich für fast jeden Stammgast! Wenn du 5 oder mehr Besuche pro Jahr planst, ist Silver eine kluge Investition. Für Familien, die an Ferienzeiten gebunden sind, ist Gold die flexiblere (wenn auch teurere) Wahl.</p>
            
            <div className="bg-[#00305e] text-white p-12 rounded-[3rem] shadow-2xl text-center">
                <div className="inline-block bg-[#ffcc00] text-[#00305e] p-5 rounded-[2rem] mb-8 shadow-lg shadow-yellow-500/20">
                    <Bell size={40} />
                </div>
                <h3 className="text-3xl font-black mb-6 m-0 text-white">Verpasse nie wieder den richtigen Moment!</h3>
                <p className="text-blue-100 mb-10 text-lg max-w-2xl mx-auto leading-relaxed">Die Pässe sind begehrt und oft nach wenigen Minuten vergriffen. Aktiviere unseren Alarm und sichere dir deinen Pass, sobald er verfügbar ist. Erhöhe deine Chancen massiv!</p>
                <Button onClick={() => navigate('landing')} className="bg-[#ffcc00] text-[#00305e] border-0 mx-auto font-black px-12 py-5 text-2xl hover:scale-105 transition-transform shadow-xl shadow-yellow-500/10">
                    ResortPass Alarm aktivieren
                </Button>
            </div>
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
              className="flex items-center text-slate-500 hover:text-indigo-600 font-bold transition-colors mb-8 group"
            >
              <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Zurück zum Blog
            </button>
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-indigo-100 text-indigo-600 text-xs font-black uppercase px-4 py-1.5 rounded-full tracking-widest shadow-sm">
                {postInfo.category}
              </span>
              <span className="text-slate-400 text-sm flex items-center gap-1.5 font-medium">
                <Calendar size={16} /> {postInfo.date}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] mb-10 tracking-tight">
              {postInfo.title}
            </h1>
            <div className="flex items-center gap-5 py-8 border-y border-slate-200/60">
               <div className="w-14 h-14 bg-[#00305e] rounded-2xl flex items-center justify-center text-[#ffcc00] shadow-lg shadow-blue-900/10">
                 {postInfo.icon}
               </div>
               <div>
                  <p className="text-lg font-black text-slate-900 m-0">ResortPass-Experten</p>
                  <p className="text-sm text-slate-500 font-medium m-0">Aktualisiert für die Saison 2026</p>
               </div>
               <div className="ml-auto flex gap-3">
                 <button className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-500 hover:border-indigo-200 flex items-center justify-center transition-all"><Share2 size={20} /></button>
               </div>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-slate prose-lg max-w-none prose-headings:text-[#00305e] prose-headings:font-black prose-a:text-indigo-600 prose-strong:text-slate-900 leading-relaxed prose-img:rounded-[2rem] prose-table:rounded-3xl prose-table:overflow-hidden">
            {renderContent()}
          </div>

          {/* Footer Info */}
          <div className="mt-20 p-10 bg-white rounded-[2.5rem] border border-slate-200/60 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 text-slate-300"><ShieldCheck size={120}/></div>
            <div className="relative z-10 flex items-start gap-6">
                <div className="bg-slate-100 p-4 rounded-2xl text-slate-400 shrink-0">
                    <AlertTriangle size={32} />
                </div>
                <div>
                    <strong className="block mb-3 text-slate-900 text-xl font-black">Transparenz‑Hinweis</strong>
                    <p className="text-base text-slate-500 m-0 leading-relaxed font-medium">
                    Dieser Artikel fasst öffentlich verfügbare Informationen zusammen. Für verbindliche Details gelten ausschließlich die aktuellen Angaben des <strong>Europa‑Park / Mack International Ticketshops</strong>. ResortPassAlarm ist ein unabhängiger Service und steht in keiner offiziellen Verbindung zum Europa-Park Resort.
                    </p>
                </div>
            </div>
          </div>

          {/* More Posts */}
          <div className="mt-24 pt-20 border-t border-slate-200/60">
             <h3 className="text-3xl font-black text-[#00305e] mb-12 flex items-center gap-3"><ArrowRight className="text-[#ffcc00]"/> Das könnte dich auch interessieren</h3>
             <div className="grid md:grid-cols-2 gap-10">
                {BLOG_POSTS.filter(p => p.slug !== slug).slice(0, 2).map(p => (
                  <div 
                    key={p.slug} 
                    className="flex flex-col gap-6 cursor-pointer group bg-white p-8 rounded-[2rem] border border-slate-200/60 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                    onClick={() => { navigate(`blog-post:${p.slug}`); window.scrollTo(0,0); }}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 text-[#00305e] group-hover:bg-[#00305e] group-hover:text-[#ffcc00] transition-colors duration-500">
                      {p.icon}
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2 m-0">{p.title}</h4>
                      <p className="text-sm text-slate-400 mt-6 flex items-center gap-2 font-black uppercase tracking-widest group-hover:text-[#ffcc00] transition-colors">Guide lesen <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform"/></p>
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
