
import React from 'react';
// Added CheckCircle and Ticket to the imports to fix "Cannot find name" errors
import { ArrowLeft, ArrowRight, Calendar, Share2, ChevronRight, Check, Zap, Bell, Clock, Info, ShieldCheck, AlertTriangle, Star, DollarSign, Target, Calculator, AlertCircle, X, HelpCircle, CheckCircle, Ticket, ShoppingBag, UserCheck, Timer, MousePointer2, HelpCircle as HelpIcon, Map, Bed } from 'lucide-react';
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
        return (
          <div className="space-y-10">
            <div className="bg-amber-50 border-l-8 border-amber-400 p-8 rounded-r-3xl shadow-sm">
                <h2 className="text-2xl font-bold text-[#00305e] mb-6 m-0 flex items-center gap-3"><Info className="text-amber-500"/> 📋 Das Wichtigste auf einen Blick</h2>
                <ul className="list-none p-0 space-y-4 m-0 text-lg">
                    <li className="flex items-start gap-3"><Check size={24} className="text-green-600 shrink-0 mt-1" /> <strong>Limitiertes Kontingent:</strong> Der Europa-Park gibt Pässe oft in "Wellen" frei.</li>
                    <li className="flex items-start gap-3"><Check size={24} className="text-green-600 shrink-0 mt-1" /> <strong>Vorbereitung:</strong> MackOne Account vorab erstellen und Daten hinterlegen.</li>
                    <li className="flex items-start gap-3"><Check size={24} className="text-green-600 shrink-0 mt-1" /> <strong>Schnelligkeit:</strong> Bei Verfügbarkeit zählen oft Sekunden statt Minuten.</li>
                    <li className="flex items-start gap-3"><Check size={24} className="text-green-600 shrink-0 mt-1" /> <strong>Wächter-Lösung:</strong> Automatisierte Alarme sind der sicherste Weg zum Pass.</li>
                </ul>
            </div>

            <p className="text-xl leading-relaxed">
                Der Europa-Park ResortPass ist weit mehr als eine einfache Eintrittskarte. Er ist die Eintrittskarte in eine world voller Magie, Achterbahnen und unvergesslicher Momente. Doch für viele Fans beginnt das Abenteuer schon weit vor dem Parkeingang: beim Versuch, überhaupt einen der begehrten Pässe zu ergattern. Da der ResortPass Gold und Silver regelmäßig als „ausverkauft“ markiert ist, gleicht der Kaufprozess oft einer digitalen Schatzsuche. In diesem Guide erfährst du, wie du deine Chancen maximierst und was du tun kannst, wenn der Shop mal wieder keine Kontingente anzeigt.
            </p>

            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-slate-100 pb-4">1. Warum ist der ResortPass so schwer zu bekommen?</h2>
            <p>
                Seit der Einführung des ResortPass-Systems hat der Europa-Park eine klare Strategie: Qualität vor Quantität. Um die Besucherströme besser steuern zu können und das Erlebnis im Park auf einem hohen Niveau zu halten, wird die Gesamtzahl der ausgegebenen Jahreskarten streng limitiert. Anders als früher bei der klassischen Clubkarte, die fast jederzeit verfügbar war, entscheidet der Park heute tagesaktuell oder saisonal über neue Kontingente.
            </p>
            <p>
                Besonders der <strong>ResortPass Gold</strong> ist aufgrund seiner unbegrenzten Gültigkeit (ohne Sperrtage) und der inkludierten Rulantica-Tickets extrem gefragt. Sobald eine neue "Welle" an Pässen freigeschaltet wird, spricht sich das in Fan-Foren und Social-Media-Gruppen in Windeseile herum. Die Folge: Innerhalb weniger Minuten kann das Kontingent bereits wieder erschöpft sein.
            </p>

            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-slate-100 pb-4">2. Die perfekte Vorbereitung: Dein MackOne Account</h2>
            <p>
                Wenn der Moment der Verfügbarkeit kommt, hast du keine Zeit mehr für Bürokratie. Dein größter Feind ist der Zeitverlust durch Dateneingabe.
            </p>
            <div className="grid md:grid-cols-2 gap-6 my-8">
                <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
                    <UserCheck className="text-indigo-600 mb-4" size={32} />
                    <h4 className="font-bold text-lg mb-2">Account vorab erstellen</h4>
                    <p className="text-sm text-slate-500">Erstelle dir bereits heute einen MackOne Account auf der offiziellen Webseite. Bestätige deine E-Mail Adresse und logge dich einmal ein, um sicherzustellen, dass alles funktioniert.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
                    <MousePointer2 className="text-indigo-600 mb-4" size={32} />
                    <h4 className="font-bold text-lg mb-2">Daten hinterlegen</h4>
                    <p className="text-sm text-slate-500">Hinterlege im Profil deine vollständige Anschrift. Beim Kaufprozess werden diese Daten automatisch gezogen, was dir wertvolle Sekunden spart.</p>
                </div>
            </div>

            <BlogInjectedCTA variant={1} />

            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-slate-100 pb-4">3. Die "Wellen-Taktik": Wann werden Pässe frei?</h2>
            <p>
                Es gibt keinen offiziellen Fahrplan für die Freischaltung neuer Pässe. Dennoch zeigen Erfahrungen der letzten Monate bestimmte Muster. Oft werden Kontingente am <strong>Vormittag zwischen 9:00 und 11:00 Uhr</strong> oder am frühen Nachmittag freigeschaltet. Auch zum Saisonstart oder vor großen Events (wie den Horror Nights) gibt es häufiger Bewegung im Shop.
            </p>
            <p>
                Ein weiterer wichtiger Faktor sind Stornierungen oder nicht abgeschlossene Zahlungen. Wenn ein Nutzer Pässe in den Warenkorb legt, diese aber nicht innerhalb der Reservierungszeit bezahlt, fließen sie zurück in den Pool. Das bedeutet: Auch wenn gerade "ausverkauft" da steht, kann 15 Minuten später plötzlich wieder ein Pass verfügbar sein.
            </p>

            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-slate-100 pb-4">4. Profi-Tipps für den Kaufprozess</h2>
            <p>
                Wenn du es in den Shop geschafft hast und die Pässe als "verfügbar" angezeigt werden, beachte diese Tipps:
            </p>
            <ul className="space-y-4">
                <li className="flex items-start gap-4 bg-slate-50 p-4 rounded-xl">
                    <div className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold">1</div>
                    <div>
                        <strong className="block text-[#00305e]">Nicht zögern:</strong>
                        Leg die Pässe sofort in den Warenkorb. In den meisten Shops sind sie dort für eine kurze Zeit (oft 10-15 Min) für dich reserviert.
                    </div>
                </li>
                <li className="flex items-start gap-4 bg-slate-50 p-4 rounded-xl">
                    <div className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold">2</div>
                    <div>
                        <strong className="block text-[#00305e]">Zahlungsmittel bereit halten:</strong>
                        Nutze schnelle Zahlungsmethoden wie PayPal oder Kreditkarte. Das Eintippen von IBANs für Lastschriften dauert zu lange und birgt Fehlerrisiken.
                    </div>
                </li>
                <li className="flex items-start gap-4 bg-slate-50 p-4 rounded-xl">
                    <div className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold">3</div>
                    <div>
                        <strong className="block text-[#00305e]">Ein Pass nach dem anderen:</strong>
                        Wenn du für eine ganze Familie kaufst, kann es manchmal schwierig sein, 4 oder 5 Pässe gleichzeitig zu bekommen, wenn das Restkontingent klein ist. Versuche es im Notfall mit kleineren Mengen.
                    </div>
                </li>
            </ul>

            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-slate-100 pb-4">5. Was tun, wenn dauerhaft ausverkauft ist?</h2>
            <p>
                Es kann frustrierend sein: Du schaust zehnmal am Tag auf die Seite, und immer leuchtet dir das rote "Ausverkauft" entgegen. Viele Nutzer verfallen dann in den "F5-Wahn" und laden die Seite ständig neu. Das ist nicht nur zeitraubend, sondern oft auch erfolglos, da man genau die 5 Minuten verpasst, in denen das Fenster offen war.
            </p>
            <div className="bg-indigo-50 p-8 rounded-3xl border border-indigo-100 flex items-start gap-6">
                <div className="bg-white p-3 rounded-2xl shadow-sm text-indigo-600 shrink-0"><Timer size={32} /></div>
                <div>
                    <h4 className="font-bold text-[#00305e] text-xl mb-2">Der Zeitfaktor ist entscheidend</h4>
                    <p className="text-indigo-900 m-0 leading-relaxed">
                        Statistiken zeigen, dass kleine Kontingente oft innerhalb von weniger als 12 Minuten wieder vergriffen sind. Wer manuell sucht, braucht eine enorme Portion Glück. Die Lösung ist die Automatisierung der Überwachung.
                    </p>
                </div>
            </div>

            <BlogInjectedCTA variant={2} />

            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-slate-100 pb-4">6. Häufig gestellte Fragen (FAQ)</h2>
            <div className="space-y-6">
                <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <h4 className="text-indigo-600 font-bold mb-2 flex items-center gap-2">
                        <HelpCircle size={20}/> Kann ich den ResortPass auch vor Ort im Park kaufen?
                    </h4>
                    <p className="text-slate-600 m-0">Nein, der Verkauf erfolgt ausschließlich online über den Mack International Ticketshop. Vor Ort können lediglich bestehende Pässe verlängert oder physische Karten gedruckt werden (sofern online bereits erworben).</p>
                </div>
                <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <h4 className="text-indigo-600 font-bold mb-2 flex items-center gap-2">
                        <HelpCircle size={20}/> Gibt es eine Warteliste?
                    </h4>
                    <p className="text-slate-600 m-0">Der Europa-Park bietet aktuell keine offizielle Warteliste an. Es gilt das Prinzip: Wer zuerst kommt, mahlt zuerst.</p>
                </div>
                <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <h4 className="text-indigo-600 font-bold mb-2 flex items-center gap-2">
                        <HelpCircle size={20}/> Wie oft werden neue Pässe freigeschaltet?
                    </h4>
                    <p className="text-slate-600 m-0">Das variiert stark. In manchen Wochen gibt es fast täglich kleine Kontingente, in anderen Phasen bleibt der Shop über Wochen geschlossen. Das hängt stark von der aktuellen Auslastung des Parks ab.</p>
                </div>
            </div>

            <h2 className="text-3xl font-bold text-[#00305e] border-b-2 border-slate-100 pb-4">Fazit: Mit Geduld und Technik zum Ziel</h2>
            <p>
                Den Europa-Park ResortPass zu kaufen erfordert heute ein wenig strategisches Vorgehen. Eine gute Vorbereitung deines MackOne Accounts ist die Basis. Der eigentliche Schlüssel zum Erfolg ist jedoch die Information über die Verfügbarkeit in Echtzeit.
            </p>
            <p>
                Lass dich nicht entmutigen, wenn es beim ersten Mal nicht klappt. Mit den richtigen Tools und ein wenig Schnelligkeit wirst auch du bald deine eigene Jahreskarte in den Händen halten und ein Jahr voller Abenteuer im Europa-Park Resort genießen können.
            </p>

            <div className="bg-[#00305e] text-white p-10 rounded-3xl shadow-xl text-center">
                <h3 className="text-2xl font-black text-amber-400 mb-4 m-0 uppercase tracking-widest">🚀 Hol dir deinen Vorteil</h3>
                <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
                    Warum selbst suchen, wenn du dich automatisch benachrichtigen lassen kannst? Aktiviere unseren ResortPass Wächter und sei der Erste im Shop!
                </p>
                <Button onClick={() => navigate('landing')} className="bg-amber-400 text-indigo-900 border-0 mx-auto font-black px-10 py-4 text-xl hover:bg-yellow-300 transition-colors">
                    Jetzt Überwachung starten
                </Button>
            </div>

            <hr className="my-12 border-slate-200" />
            <p className="text-slate-400 text-xs italic text-center">
                Hinweis: Dieser Artikel dient der Information und basiert auf Erfahrungswerten. Wir stehen in keiner offiziellen Verbindung zum Europa-Park. Alle Angaben ohne Gewähr.
            </p>
          </div>
        );
      case 'resortpass-guide-2026':
        return (
          <div className="space-y-8">
            <div className="bg-blue-50 border-l-4 border-[#00305e] p-6 rounded-r-xl shadow-sm">
              <h3 className="text-[#00305e] font-bold text-xl mb-3 mt-0">📋 Zusammenfassung</h3>
              <p className="text-slate-700 leading-relaxed m-0">Der Europa-Park ResortPass ist die Jahreskarte für Deutschlands größten Freizeitpark. Mit der Karte kannst du ein ganzes Jahr lang den Europa-Park besuchen – entweder mit dem <strong>ResortPass Silver</strong> an über 230 Tagen oder mit dem <strong>ResortPass Gold</strong> an allen Öffnungstagen. Zusätzlich erhältst du Zugang zu Partnerparks in ganz Europa, Premium-Inhalte auf VEEJOY und weitere exklusive Vorteile. In diesem Guide erfährst du alles, was du als Einsteiger über den ResortPass 2026 wissen musst!</p>
            </div>

            <p>Du liebst den Europa-Park und überlegst, ob sich eine Jahreskarte für dich lohnt? Dann bist du hier genau richtig! Der ResortPass ist die offizielle Jahreskarte des Europa-Park und bietet dir unglaublich viele Möglichkeiten, Deutschlands besten Freizeitpark so oft zu besuchen, wie du möchtest. Aber was genau steckt dahinter? Welche Varianten gibt es? Und für wen lohnt sich welcher Pass? In diesem ultimativen Guide erklären wir dir Schritt für Schritt alles Wichtige zum Europa-Park ResortPass 2026.</p>

            <h2 className="text-2xl font-bold text-[#00305e] border-l-4 border-[#ffcc00] pl-4">Was ist der Europa-Park ResortPass?</h2>
            <p>Der <strong>Europa-Park ResortPass</strong> ist die moderne Jahreskarte des Europa-Park Erlebnis-Resorts. Er wurde 2022 als Nachfolger der früheren ClubCard eingeführt und ermöglicht dir ein ganzes Jahr lang den Zugang zum Europa-Park – je nach gewählter variante an bestimmten oder allen Öffnungstagen.</p>
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
                    <li className="flex items-start gap-3"><Check size={24} className="text-[#d4af37] shrink-0 mt-1" /> <strong>Entscheidungshilfe:</strong> Wir zeigen dir, welche variante zu deinen Plänen passt</li>
                </ul>
            </div>

            <p className="text-xl leading-relaxed">Du willst dir endlich einen Europa-Park ResortPass zulegen, aber die Frage lässt dich nicht los: <strong>Silver oder Gold?</strong> Keine Sorge, du bist nicht allein! Diese Entscheidung stellt viele vor ein Dilemma. In diesem Artikel zeigen wir dir ganz genau, wo die Unterschiede liegen und für wen sich welche variante wirklich lohnt.</p>

            <h2 className="text-3xl font-bold text-[#1a472a] mt-12 mb-6">Der direkte Vergleich: Silver vs. Gold</h2>
            <p>Zunächst schauen wir uns die beiden varianten im direkten Vergleich an. So siehst du auf einen Blick, wo die Unterschiede liegen:</p>

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
            <p>Schauen wir uns an, wann sich die jeweilige variante rechnet. Ein normales Tagesticket für den Europa-Park kostet zwischen 64,50 € (Nebensaison) und 73 € (Hauptsaison).</p>

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
                    <p className="text-slate-600 m-0">Ein direktes Upgrade während der Laufzeit ist nicht möglich. Du kannst aber bei der nächsten verlängerung auf Gold wechseln.</p>
                </div>
                <div>
                    <h4 className="text-xl font-bold text-[#1a472a] mb-3">Gibt es auch einen ResortPass für Familien?</h4>
                    <p className="text-slate-600 m-0">Es gibt keine spezielle Familienkarte. Du kaufst für jede Person einzeln einen Silver oder Gold Pass. Kinder unter 4 Jahren brauchen generell keinen Pass.</p>
                </div>
                <div>
                    <h4 className="text-xl font-bold text-[#1a472a] mb-3">Muss ich meinen Besuch vorher reservieren?</h4>
                    <p className="text-slate-600 m-0">Ja, bei beiden varianten musst du deinen Besuchstag vorher über das ResortPass-Portal reservieren. Du kannst bis zu 5 Termine gleichzeitig buchen.</p>
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
            <div className="bg-indigo-900 text-white rounded-3xl p-8 md:p-12 shadow-xl border-b-8 border-amber-400">
              <span className="bg-amber-400 text-indigo-900 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-6 inline-block">2026 Edition</span>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6 m-0 leading-tight">Was kostet der Europa-Park ResortPass 2026?</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                <div className="bg-white/10 p-4 rounded-2xl border border-white/10"><p className="text-[10px] uppercase font-bold text-blue-200 mb-1">Silver Erw.</p><p className="text-2xl font-black">295 €</p></div>
                <div className="bg-white/10 p-4 rounded-2xl border border-white/10"><p className="text-[10px] uppercase font-bold text-blue-200 mb-1">Gold Erw.</p><p className="text-2xl font-black">475 €</p></div>
                <div className="bg-white/10 p-4 rounded-2xl border border-white/10"><p className="text-[10px] uppercase font-bold text-blue-200 mb-1">Silver Kind</p><p className="text-2xl font-black">255 €</p></div>
                <div className="bg-white/10 p-4 rounded-2xl border border-white/10"><p className="text-[10px] uppercase font-bold text-blue-200 mb-1">Gold Kind</p><p className="text-2xl font-black">415 €</p></div>
              </div>
            </div>

            <p className="text-xl leading-relaxed">Du planst, dir 2026 einen Europa-Park ResortPass zuzulegen? Super Entscheidung! Aber was kostet das Ganze eigentlich genau? In diesem Artikel erfährst du <strong>alle Preise für 2026</strong> – übersichtlich, transparent und ohne versteckte Kosten. Egal ob Silver oder Gold, ob für die ganze Familie oder alleine: Hier findest du alle Infos, die du brauchst.</p>

            <BlogInjectedCTA variant={1} />

            <h2 className="text-2xl font-bold text-[#00305e] border-l-4 border-[#ffcc00] pl-4">ResortPass Silver: Preise 2026</h2>
            <p>Der ResortPass Silver ist die günstigere variante und ermöglicht dir Zugang zum Europa-Park an über 230 definierten Öffnungstagen pro Jahr. Perfekt, wenn du flexibel bist und ein paar Sperrtage verschmerzen kannst.</p>

            <div className="grid md:grid-cols-2 gap-8 my-10">
                <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
                    <div className="bg-[#00305e] text-white p-6 text-center">
                        <h4 className="font-bold text-lg mb-1">ResortPass Silver</h4>
                        <p className="text-4xl font-black">295 €</p>
                        <p className="text-[10px] opacity-70 uppercase tracking-widest mt-1">Pro Person / 12 Monate</p>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-50 pb-2"><span className="text-sm font-medium">Erwachsene (ab 12 J.)</span><span className="font-bold">295 €</span></div>
                        <div className="flex justify-between items-center border-b border-slate-50 pb-2"><span className="text-sm font-medium">Kinder (4-11 Jahre)</span><span className="font-bold text-indigo-600">255 €</span></div>
                        <div className="flex justify-between items-center border-b border-slate-50 pb-2"><span className="text-sm font-medium">Senioren (60+ Jahre)</span><span className="font-bold text-indigo-600">255 €</span></div>
                        <div className="flex justify-between items-center"><span className="text-sm font-medium">Ermäßigt (mit Ausweis)</span><span className="font-bold text-indigo-600">255 €</span></div>
                    </div>
                </div>
                <div className="bg-white rounded-3xl shadow-lg border border-amber-100 overflow-hidden">
                    <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-white p-6 text-center">
                        <h4 className="font-bold text-lg mb-1">ResortPass Gold</h4>
                        <p className="text-4xl font-black">475 €</p>
                        <p className="text-[10px] opacity-70 uppercase tracking-widest mt-1">Pro Person / 12 Monate</p>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-50 pb-2"><span className="text-sm font-medium">Erwachsene (ab 12 J.)</span><span className="font-bold">475 €</span></div>
                        <div className="flex justify-between items-center border-b border-slate-50 pb-2"><span className="text-sm font-medium">Kinder (4-11 Jahre)</span><span className="font-bold text-amber-600">415 €</span></div>
                        <div className="flex justify-between items-center border-b border-slate-50 pb-2"><span className="text-sm font-medium">Senioren (60+ Jahre)</span><span className="font-bold text-amber-600">415 €</span></div>
                        <div className="flex justify-between items-center"><span className="text-sm font-medium">Ermäßigt (mit Ausweis)</span><span className="font-bold text-amber-600">415 €</span></div>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex gap-4 items-start shadow-sm">
                <Info className="text-blue-600 shrink-0" size={24} />
                <div>
                    <h4 className="font-bold text-blue-900 mb-1">Wichtig zu wissen</h4>
                    <p className="text-sm text-blue-800 m-0">Kinder unter 4 Jahren haben generell freien Eintritt in den Europa-Park und benötigen keinen ResortPass. Die ermäßigten Preise gelten für Personen mit entsprechendem Schwerbehindertenausweis (bestimmte Merkzeichen erforderlich).</p>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-[#00305e] border-l-4 border-[#ffcc00] pl-4">Optionale Zusatzkosten</h2>
            <p>Neben dem ResortPass selbst gibt es noch einige optionale Zusatzleistungen, die du dazubuchen kannst:</p>
            
            <div className="bg-indigo-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden my-8">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    <div className="text-center md:text-left flex-1">
                        <h3 className="text-2xl font-black mb-2 flex items-center gap-2 m-0"><CheckCircle className="text-amber-400" /> 🚗 ParkingPass 2026</h3>
                        <p className="text-slate-200 m-0">Ermöglicht dir 1 Jahr lang kostenloses Parken auf dem Besucherparkplatz während aller Park-Öffnungszeiten.</p>
                    </div>
                    <div className="text-center bg-white/10 p-6 rounded-2xl border border-white/10 min-w-[140px]">
                        <p className="text-3xl font-black m-0 text-amber-400">39 €</p>
                        <p className="text-[10px] uppercase font-bold opacity-60">Pauschalpreis</p>
                    </div>
                </div>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-xl italic text-slate-700 shadow-sm">
                <strong className="text-green-800 flex items-center gap-2 mb-2"><Star size={18} fill="currentColor" /> Lohnt sich der ParkingPass?</strong>
                <p className="m-0">Normales Parken kostet 10 € pro Tag. Der ParkingPass rechnet sich also bereits ab dem <strong>4. Besuch</strong>. Wenn du mit dem Auto anreist und öfter kommst, ist er ein absolutes Must-have!</p>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mt-8">Gedruckte Karte (Optional)</h3>
            <p>Der ResortPass ist standardmäßig eine digitale Karte in deinem MackOne Account. Eine <strong>gedruckte Plastikkarte</strong> kannst du optional vor Ort an der Information am Turm im Europa-Park gegen eine Gebühr von <strong>5 €</strong> erhalten.</p>

            <h2 className="text-2xl font-bold text-[#00305e] border-l-4 border-[#ffcc00] pl-4">Familienpreise: Was kostet es für alle?</h2>
            <div className="overflow-x-auto my-8">
                <table className="w-full text-sm border-collapse bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                    <thead>
                        <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                            <th className="p-4 text-left">Konstellation</th>
                            <th className="p-4 text-center">Silver Gesamt</th>
                            <th className="p-4 text-center">Gold Gesamt</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        <tr><td className="p-4 font-medium">2 Erwachsene</td><td className="p-4 text-center font-bold">590 €</td><td className="p-4 text-center font-bold">950 €</td></tr>
                        <tr><td className="p-4 font-medium">2 Erw. + 1 Kind</td><td className="p-4 text-center font-bold">845 €</td><td className="p-4 text-center font-bold">1.365 €</td></tr>
                        <tr className="bg-blue-50/30"><td className="p-4 font-medium">2 Erw. + 2 Kinder</td><td className="p-4 text-center font-bold text-[#00305e]">1.100 €</td><td className="p-4 text-center font-bold text-[#00305e]">1.780 €</td></tr>
                        <tr><td className="p-4 font-medium">2 Erw. + 3 Kinder</td><td className="p-4 text-center font-bold">1.355 €</td><td className="p-4 text-center font-bold">2.195 €</td></tr>
                        <tr><td className="p-4 font-medium">Alleinerz. + 1 Kind</td><td className="p-4 text-center font-bold">550 €</td><td className="p-4 text-center font-bold">890 €</td></tr>
                    </tbody>
                </table>
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl shadow-sm mb-8">
                <strong className="text-red-800 flex items-center gap-2 mb-2"><AlertCircle size={18} /> Wichtig für Familien</strong>
                <p className="m-0 text-red-700">Es gibt leider <strong>keine Familienrabatte</strong> beim ResortPass. Jede Person braucht ihren eigenen Pass. Bei größeren Familien können die Kosten schnell in die Höhe gehen – rechne dir vorher genau aus, ob sich der Pass für eure Besuchshäufigkeit lohnt!</p>
            </div>

            <h2 className="text-2xl font-bold text-[#00305e] border-l-4 border-[#ffcc00] pl-4">Preisentwicklung: 2025 vs. 2026</h2>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 my-8">
                <table className="w-full text-sm">
                    <thead><tr className="text-left font-bold text-slate-400 uppercase tracking-tighter"><th className="pb-3">Kategorie</th><th className="pb-3">2025</th><th className="pb-3">2026</th><th className="pb-3">Änderung</th></tr></thead>
                    <tbody className="divide-y divide-slate-100">
                        <tr><td className="py-2">Silver Erw.</td><td>295 €</td><td className="font-bold">295 €</td><td className="text-green-600 font-bold">±0 €</td></tr>
                        <tr><td className="py-2">Silver Kind</td><td>255 €</td><td className="font-bold">255 €</td><td className="text-green-600 font-bold">±0 €</td></tr>
                        <tr><td className="py-2">Gold Erw.</td><td>475 €</td><td className="font-bold">475 €</td><td className="text-green-600 font-bold">±0 €</td></tr>
                        <tr><td className="py-2">ParkingPass</td><td>39 €</td><td className="font-bold">39 €</td><td className="text-green-600 font-bold">±0 €</td></tr>
                    </tbody>
                </table>
            </div>

            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 shadow-sm mb-12">
                <h4 className="font-bold text-indigo-900 mb-1 flex items-center gap-2"><CheckCircle size={20} className="text-indigo-600" /> Gute Nachrichten!</h4>
                <p className="text-indigo-800 m-0">Die Preise für 2026 bleiben stabil! Nach der Preiserhöhung für 2025 (damals +30 € auf alle Pässe) hat der Europa-Park die Preise für 2026 <strong>nicht weiter erhöht</strong>. Das ist eine positive Nachricht für alle ResortPass-Fans!</p>
            </div>

            <h2 className="text-2xl font-bold text-[#00305e] border-l-4 border-[#ffcc00] pl-4">Was ist im Preis enthalten?</h2>
            <div className="grid md:grid-cols-2 gap-8 my-8">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h4 className="font-bold mb-4 flex items-center gap-2"><Ticket size={18} className="text-indigo-600"/> Im Silver Pass:</h4>
                    <ul className="space-y-2 list-none pl-0 text-sm text-slate-600">
                        <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Über 230 Besuchstage / Jahr</li>
                        <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Zugang an Übernachtungstagen</li>
                        <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> 7 Partnerparks (1x gratis)</li>
                        <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> 40% Plopsa Rabatt</li>
                        <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> VEEJOY Premium Zugang</li>
                    </ul>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-amber-100">
                    <h4 className="font-bold mb-4 flex items-center gap-2"><Zap size={18} className="text-amber-500"/> Zusätzlich im Gold:</h4>
                    <ul className="space-y-2 list-none pl-0 text-sm text-slate-600">
                        <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> ALLE Öffnungstage (keine Sperrtage)</li>
                        <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> 2 Tagestickets für Rulantica</li>
                        <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Wert der Extras: ca. 90-100 €</li>
                    </ul>
                </div>
            </div>

            <BlogInjectedCTA variant={2} />

            <h2 className="text-2xl font-bold text-[#00305e] border-l-4 border-[#ffcc00] pl-4">Häufig gestellte Fragen (Preise FAQ)</h2>
            <div className="space-y-4 my-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h4 className="font-bold text-slate-900 mb-2">Kann ich den ResortPass in Raten zahlen?</h4>
                    <p className="text-sm text-slate-500 m-0">Nein, der ResortPass muss komplett im Voraus bezahlt werden. Eine Ratenzahlung wird nicht angeboten.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h4 className="font-bold text-slate-900 mb-2">Gibt es Rabatte oder Sonderaktionen?</h4>
                    <p className="text-sm text-slate-500 m-0">Offizielle Rabattaktionen gibt es so gut wie nie. Der Preis ist fix. Ein Tipp: Nutze die Partnerpark-Besuche, um den Wert des Passes massiv zu steigern!</p>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-[#00305e] border-l-4 border-[#ffcc00] pl-4">Fazit: Was kostet der ResortPass 2026 wirklich?</h2>
            <p className="text-lg leading-relaxed">Zusammengefasst bewegen sich die Preise für den Europa-Park ResortPass 2026 zwischen <strong>255 € (Silver Kind)</strong> und <strong>475 € (Gold Erwachsener)</strong>. Die gute Nachricht: Die Preise sind gegenüber 2025 stabil geblieben!</p>
            
            <div className="bg-[#00305e] text-white p-8 rounded-3xl shadow-xl text-center my-10">
                <h3 className="text-2xl font-black text-amber-400 mb-4 m-0 uppercase tracking-widest">💰 Unsere Preis-Empfehlung</h3>
                <p className="text-indigo-100 mb-6 leading-relaxed">Für die meisten Besucher ist der <strong>ResortPass Silver</strong> die beste Wahl. Er rechnet sich bereits ab 5 Besuchen und bietet ein hervorragendes Preis-Leistungs-Verhältnis. Den <strong>ParkingPass für 39 €</strong> solltest du definitiv dazubuchen, wenn du mit dem Auto anreist.</p>
                <Button onClick={() => navigate('landing')} className="bg-amber-400 text-indigo-900 border-0 mx-auto font-black px-10 py-4 text-xl hover:bg-yellow-300">
                    ResortPass Alarm aktivieren
                </Button>
            </div>

            <hr className="my-12 border-slate-200" />
            <p className="text-slate-400 text-xs italic"><strong>Hinweis:</strong> Alle Preisangaben entsprechen dem Stand Dezember 2024 für die Saison 2026. Änderungen durch den Europa-Park vorbehalten. Aktuelle Preise findest du immer im offiziellen Mack International Ticketshop.</p>
          </div>
        );
      case 'resortpass-amortisation-rechner':
        return (
          <div className="space-y-8">
            <div className="bg-indigo-900 text-white rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <h2 className="text-3xl md:text-5xl font-black text-white mb-6 m-0 leading-tight">Lohnt sich der ResortPass? <br/><span className="text-amber-400">So rechnest du es dir aus.</span></h2>
                <p className="text-lg text-indigo-100 max-w-2xl mb-8">Die ehrliche Antwort mit konkreten Zahlen, Rechnungen und echten Erfahrungen. Finde heraus, ob sich die Investition für dich wirklich lohnt.</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/10 p-4 rounded-xl border border-white/10 text-center"><p className="text-[10px] uppercase font-bold text-indigo-300 mb-1">Silver Amortisation</p><p className="text-xl font-black">5 Besuche</p></div>
                    <div className="bg-white/10 p-4 rounded-xl border border-white/10 text-center"><p className="text-[10px] uppercase font-bold text-indigo-300 mb-1">Gold Amortisation</p><p className="text-xl font-black">6-7 Besuche</p></div>
                </div>
            </div>

            <p className="text-xl leading-relaxed">Du überlegst, dir einen Europa-Park ResortPass zu kaufen, aber die große Frage lautet: <strong>Lohnt sich das überhaupt für mich?</strong> 295 € oder sogar 475 € sind eine ordentliche Investition – da will man vorher genau wissen, ob es sich rechnet.</p>

            <div className="bg-indigo-50 border-l-8 border-[#00305e] p-8 rounded-r-3xl shadow-sm">
                <h3 className="text-2xl font-bold text-[#00305e] mb-6 m-0 flex items-center gap-3">📋 TL;DR – Die Kurzfassung</h3>
                <ul className="list-none p-0 space-y-4 m-0 text-lg text-slate-700">
                    <li className="flex items-start gap-3"><Check size={24} className="text-green-600 shrink-0 mt-1" /> <strong>Silver:</strong> Ab 5 Besuchen lohnenswert</li>
                    <li className="flex items-start gap-3"><Check size={24} className="text-green-600 shrink-0 mt-1" /> <strong>Gold:</strong> Ab 6-7 Besuchen (mit Rulantica)</li>
                    <li className="flex items-start gap-3"><Check size={24} className="text-green-600 shrink-0 mt-1" /> <strong>Bonus:</strong> Mit Partnerparks schon ab 4 Besuchen</li>
                    <li className="flex items-start gap-3"><Check size={24} className="text-green-600 shrink-0 mt-1" /> <strong>Familien:</strong> Müssen genauer kalkulieren</li>
                </ul>
            </div>

            <p className="leading-relaxed">In diesem Artikel rechnen wir es gemeinsam durch! Du erfährst nicht nur, ab wie vielen Besuchen sich der Pass amortisiert, sondern auch, welche versteckten Vorteile du mit einberechnen solltest.</p>

            <h2 className="text-3xl font-bold text-[#00305e] border-l-4 border-[#ffcc00] pl-4 mt-12 mb-6">Die Grundrechnung: Ab wann rechnet es sich?</h2>
            <p>Fangen wir mit den nackten Zahlen an. Ein normales Tagesticket für den Europa-Park kostet zwischen 64,50 € (Nebensaison) und 73 € (Hauptsaison). Für unsere Berechnung nehmen wir einen Durchschnitt von <strong>68 € pro Besuch</strong>.</p>

            <div className="grid md:grid-cols-2 gap-8 my-10">
                <div className="bg-white border-2 border-slate-100 p-8 rounded-3xl shadow-lg flex flex-col items-center text-center">
                    <h4 className="font-bold text-[#00305e] mb-4">💰 Die Silver-Rechnung</h4>
                    <div className="space-y-2 text-sm text-slate-500 mb-6">
                        <p>Preis Silver: 295 €</p>
                        <p>Tickets Ø: 68 €</p>
                        <p>295 ÷ 68 = 4,3</p>
                    </div>
                    <div className="bg-indigo-600 text-white p-6 rounded-2xl w-full">
                        <p className="text-xs uppercase font-bold opacity-80 mb-1">Amortisation ab</p>
                        <p className="text-4xl font-black">5 Besuchen</p>
                    </div>
                </div>
                <div className="bg-white border-2 border-slate-100 p-8 rounded-3xl shadow-lg flex flex-col items-center text-center">
                    <h4 className="font-bold text-[#00305e] mb-4">💰 Die Gold-Rechnung</h4>
                    <div className="space-y-2 text-sm text-slate-500 mb-6">
                        <p>Preis Gold: 475 €</p>
                        <p>Minus 2x Rulantica: -95 €</p>
                        <p>Effektiver Preis: 380 €</p>
                    </div>
                    <div className="bg-amber-500 text-white p-6 rounded-2xl w-full">
                        <p className="text-xs uppercase font-bold opacity-80 mb-1">Amortisation ab</p>
                        <p className="text-4xl font-black">6 Besuchen</p>
                    </div>
                </div>
            </div>

            <BlogInjectedCTA variant={1} />

            <h2 className="text-3xl font-bold text-[#00305e] border-l-4 border-[#ffcc00] pl-4 mt-12 mb-6">Versteckte Vorteile berücksichtigen</h2>
            <p>Die reine Ticket-Rechnung ist nicht alles. Der ResortPass bringt noch einige zusätzliche Vorteile mit sich, die du mit einberechnen solltest:</p>
            
            <div className="bg-green-50 p-8 rounded-3xl border border-green-100 flex items-start gap-6 my-8">
                <div className="bg-green-600 text-white p-3 rounded-2xl shrink-0 shadow-lg"><Star fill="currentColor" /></div>
                <div>
                    <h4 className="font-bold text-green-900 text-xl mb-2 mt-0">Kostenlose Partnerparks = Massiver Mehrwert</h4>
                    <p className="text-green-800 m-0 leading-relaxed">Mit dem ResortPass (Silver und Gold) kannst du 7 Partnerparks je einmal kostenlos besuchen (u.a. <strong>Efteling, Liseberg, Port Aventura</strong>). Normaler Preis: Ø 45-60 € pro Park! Besuchst du nur zwei davon, sparst du zusätzlich ca. 100 €.</p>
                </div>
            </div>

            <div className="bg-indigo-50 p-8 rounded-3xl border border-indigo-100 flex items-start gap-6 my-8">
                <div className="bg-indigo-600 text-white p-3 rounded-2xl shrink-0 shadow-lg"><CheckCircle fill="currentColor" /></div>
                <div>
                    <h4 className="font-bold text-indigo-900 text-xl mb-2 mt-0">ParkingPass (optional)</h4>
                    <p className="text-indigo-800 m-0 leading-relaxed">Normales Parken kostet 10 € pro Besuch. Der optionale ParkingPass kostet einmalig 39 €. <strong>Rechnet sich ab dem 4. Besuch mit dem Auto!</strong></p>
                </div>
            </div>

            <h2 className="text-3xl font-bold text-[#00305e] border-l-4 border-[#ffcc00] pl-4 mt-12 mb-6">Wann lohnt sich der Pass NICHT?</h2>
            <div className="bg-red-50 p-8 rounded-3xl border border-red-100 flex items-start gap-6 my-8">
                <div className="bg-red-600 text-white p-3 rounded-2xl shrink-0 shadow-lg"><AlertTriangle fill="currentColor" /></div>
                <div>
                    <h4 className="font-bold text-red-900 text-xl mb-2 mt-0">Sei vorsichtig, wenn...</h4>
                    <ul className="text-red-800 m-0 space-y-2 list-disc pl-5 text-sm">
                        <li>Du nur 1-3 mal im Jahr in den Park gehst.</li>
                        <li>Du sehr weit weg wohnst (4+ Stunden Anfahrt) und spontane Besuche unrealistisch sind.</li>
                        <li>Du eine große Familie hast (4+ Kinder) und nur 2-3 Besuche planst.</li>
                        <li>Du den Park erst "ausprobieren" möchtest (keine Testphase möglich).</li>
                    </ul>
                </div>
            </div>

            <h2 className="text-3xl font-bold text-[#00305e] border-l-4 border-[#ffcc00] pl-4 mt-12 mb-6">Die versteckten Kosten pro Besuch</h2>
            <p>Bedenke, dass der ResortPass nur den Eintritt deckt. Jeder Besuch verursacht weitere Kosten:</p>
            <div className="overflow-x-auto my-6">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase"><tr><th className="p-4 text-left">Posten</th><th className="p-4 text-center">Kosten / Besuch</th><th className="p-4 text-center">Bei 6 Besuchen</th></tr></thead>
                    <tbody className="divide-y divide-slate-100">
                        <tr><td className="p-4">Parken</td><td className="p-4 text-center">10 €</td><td className="p-4 text-center">60 €</td></tr>
                        <tr><td className="p-4">Sprit / Anfahrt</td><td className="p-4 text-center">20-50 €</td><td className="p-4 text-center">120-300 €</td></tr>
                        <tr><td className="p-4">Verpflegung</td><td className="p-4 text-center">30-50 €</td><td className="p-4 text-center">180-300 €</td></tr>
                        <tr className="bg-slate-50 font-bold"><td className="p-4">Zusatzkosten Gesamt</td><td className="p-4 text-center">60-110 €</td><td className="p-4 text-center text-red-600">360-660 €</td></tr>
                    </tbody>
                </table>
            </div>

            <BlogInjectedCTA variant={2} />

            <h2 className="text-3xl font-bold text-[#00305e] border-l-4 border-[#ffcc00] pl-4 mt-12 mb-6">Erfahrungen von echten Pass-Inhabern</h2>
            <div className="space-y-6 my-8">
                <div className="p-6 bg-white rounded-2xl border-l-4 border-indigo-500 shadow-sm italic text-slate-600">
                    "Der Pass hat sich bei mir schon nach 6 Besuchen gerechnet. Die mentale Freiheit ist unbezahlbar: Ich muss nicht mehr jedes Mal überlegen, ob sich der Besuch 'lohnt'."
                </div>
                <div className="p-6 bg-white rounded-2xl border-l-4 border-indigo-500 shadow-sm italic text-slate-600">
                    "Gerade mit den Sperrtagen beim Silver Pass meidet man automatisch die vollsten Tage – ein versteckter Vorteil!"
                </div>
            </div>

            <h2 className="text-3xl font-bold text-[#00305e] border-l-4 border-[#ffcc00] pl-4 mt-12 mb-6">Fazit: Lohnt es sich?</h2>
            <p className="text-lg leading-relaxed font-bold">Die Antwort lautet: Für die meisten regelmäßigen Besucher: Ja, definitiv!</p>
            <p className="leading-relaxed">Wenn du <strong>5 oder mehr Besuche pro Jahr</strong> planst, ist der ResortPass Silver eine kluge Investition. Er zahlt sich finanziell aus und gibt dir die Freiheit, spontan in den Park zu gehen. Nutze unseren <strong>ResortPassAlarm</strong> Service, um den richtigen Moment für den Kauf nicht zu verpassen!</p>
            
            <div className="bg-[#00305e] text-white p-10 rounded-3xl shadow-xl text-center my-12">
                <h3 className="text-2xl font-black text-amber-400 mb-6 m-0 uppercase tracking-widest">🚀 Bereit für dein Europa-Park Jahr?</h3>
                <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">Die Pässe sind begehrt und oft schnell ausverkauft. Aktiviere unseren Wächter und wir sagen dir sofort Bescheid, wenn du zuschlagen kannst!</p>
                <Button onClick={() => navigate('landing')} className="bg-[#ffcc00] text-[#00305e] border-0 mx-auto font-black px-12 py-5 text-2xl hover:scale-105 shadow-xl">
                    Alarm jetzt aktivieren
                </Button>
            </div>

            <hr className="my-12 border-slate-200" />
            <p className="text-slate-400 text-xs italic"><strong>Hinweis:</strong> Alle Berechnungen basieren auf Durchschnittspreisen. Die Entscheidung liegt letztendlich bei dir – wir helfen dir nur dabei, sie informiert zu treffen!</p>
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
