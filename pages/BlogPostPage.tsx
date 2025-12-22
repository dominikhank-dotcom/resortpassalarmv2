
import React from 'react';
// Add missing imports for ArrowRight and Star from lucide-react
import { ArrowLeft, ArrowRight, Calendar, Share2, ChevronRight, Check, Zap, Bell, Clock, Info, ShieldCheck, AlertTriangle, Star } from 'lucide-react';
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

  const handleSignup = () => navigate('user-signup');

  // Integrated CTA for the blog
  const BlogInjectedCTA = ({ variant = 'default' }: { variant?: 'default' | 'small' }) => (
    <div className={`my-10 bg-[#001529] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden not-prose border-l-4 border-[#ffcc00]`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
            <h4 className="text-[#ffcc00] font-bold text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
                <Zap size={16} fill="currentColor" /> Tipp vom Experten
            </h4>
            <h3 className="text-xl md:text-2xl font-bold mb-4">Keine Lust auf ständiges Nachsehen?</h3>
            <p className="text-slate-300 mb-6 leading-relaxed">
                Der ResortPass ist oft binnen Minuten ausverkauft. Unser Alarm-Tool überwacht die Server rund um die Uhr und benachrichtigt dich sofort per E-Mail & SMS, wenn neue Kontingente frei werden.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
                <Button onClick={() => navigate('landing')} className="bg-[#5046e5] hover:bg-indigo-700 text-white border-0 px-6 py-3 font-bold w-full sm:w-auto">
                    Jetzt Alarm aktivieren <ArrowRight size={18} />
                </Button>
                <div className="text-xs text-slate-400 flex items-center gap-1 italic">
                    <ShieldCheck size={14} className="text-green-500" /> Über 5.000 erfolgreiche Alarme
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
            <div className="bg-blue-50 border-l-4 border-[#00305e] p-6 rounded-r-xl">
              <h3 className="text-[#00305e] font-bold text-lg mb-2">📋 Zusammenfassung</h3>
              <p className="text-slate-700 leading-relaxed m-0">Der Europa-Park ResortPass ist die Jahreskarte für Deutschlands größten Freizeitpark. Mit der Karte kannst du ein ganzes Jahr lang den Europa-Park besuchen – entweder mit dem <strong>ResortPass Silver</strong> an über 230 Tagen oder mit dem <strong>ResortPass Gold</strong> an allen Öffnungstagen. Zusätzlich erhältst du Zugang zu Partnerparks in ganz Europa, Premium-Inhalte auf VEEJOY und weitere exklusive Vorteile. In diesem Guide erfährst du alles, was du als Einsteiger über den ResortPass 2026 wissen musst!</p>
            </div>

            <p>Du liebst den Europa-Park und überlegst, ob sich eine Jahreskarte für dich lohnt? Dann bist du hier genau richtig! Der ResortPass ist die offizielle Jahreskarte des Europa-Park und bietet dir unglaublich viele Möglichkeiten, Deutschlands besten Freizeitpark so oft zu besuchen, wie du möchtest. In diesem ultimativen Guide erklären wir dir Schritt für Schritt alles Wichtige zum Europa-Park ResortPass 2026.</p>

            <h2 className="text-2xl font-bold text-[#00305e] pt-4">Was ist der Europa-Park ResortPass?</h2>
            <p>Der <strong>Europa-Park ResortPass</strong> ist die moderne Jahreskarte des Europa-Park Erlebnis-Resorts. Er ermöglicht dir ein ganzes Jahr lang den Zugang zum Europa-Park – je nach gewählter Variante an bestimmten oder allen Öffnungstagen.</p>
            
            <div className="bg-yellow-50 border-2 border-yellow-200 p-6 rounded-2xl flex gap-4 items-start">
              <div className="bg-yellow-400 p-2 rounded-lg text-white shrink-0"><Zap size={20} /></div>
              <div>
                <strong className="block text-slate-900 mb-1">💡 Gut zu wissen:</strong>
                <p className="text-slate-700 text-sm m-0">Der ResortPass ist eine digitale Jahreskarte, die in der Europa-Park App oder im MackOne Account hinterlegt wird. Du brauchst keine physische Karte – alles läuft über einen QR-Code auf deinem Smartphone!</p>
              </div>
            </div>

            <BlogInjectedCTA />

            <h2 className="text-2xl font-bold text-[#00305e] pt-4">Die zwei Varianten: Silver vs. Gold</h2>
            <p>Der Europa-Park bietet dir zwei verschiedene ResortPass-Varianten an: <strong>Silver</strong> und <strong>Gold</strong>. Beide haben ihre eigenen Vorteile und richten sich an unterschiedliche Besuchertypen.</p>

            <h3 className="text-xl font-bold text-indigo-700">ResortPass Silver – Der perfekte Einstieg</h3>
            <p>Der ResortPass Silver ist ideal für dich, wenn du den Europa-Park regelmäßig besuchen möchtest, aber nicht unbedingt an jedem Tag im Jahr kommen musst. Mit dieser Variante kannst du den Park an <strong>über 230 vorab definierten Öffnungstagen</strong> besuchen.</p>
            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-xl italic text-slate-700">
                <strong>Insider-Tipp:</strong> Auch wenn du den Silver Pass hast, kannst du die Sperrtage umgehen! Wenn du eine Übernachtung in einem der Europa-Park Hotels buchst, hast du an allen Tagen deines Aufenthalts freien Zugang!
            </div>

            <h3 className="text-xl font-bold text-indigo-700">ResortPass Gold – Volle Flexibilität</h3>
            <p>Der ResortPass Gold ist die Premium-Variante ohne Einschränkungen. Mit ihm kannst du den Europa-Park an <strong>allen Öffnungstagen</strong> besuchen – ohne Sperrtage, ohne Ausnahmen.</p>
            <ul className="list-disc pl-6 space-y-2">
                <li><strong>Zwei Tagestickets für Rulantica inklusive.</strong></li>
                <li><strong>Physische Karte ohne Aufpreis per Post.</strong></li>
            </ul>

            <div className="bg-red-50 border-2 border-red-100 p-8 rounded-3xl text-center my-10">
                <h3 className="text-[#00305e] text-2xl font-bold mb-4">💰 ResortPass Preise 2026 (voraussichtlich)</h3>
                <div className="grid grid-cols-2 gap-4 text-left max-w-md mx-auto">
                    <div className="font-bold text-slate-900 border-b pb-2">Kategorie</div>
                    <div className="font-bold text-slate-900 border-b pb-2 text-right">Preis</div>
                    <div className="text-slate-600">Silver Erwachsen</div><div className="font-bold text-right">295 €</div>
                    <div className="text-slate-600">Silver Kind (4-11)</div><div className="font-bold text-right">255 €</div>
                    <div className="text-slate-600 pt-2 border-t">Gold Erwachsen</div><div className="font-bold text-right pt-2">475 €</div>
                    <div className="text-slate-600 border-b pb-2">Gold Kind (4-11)</div><div className="font-bold text-right border-b pb-2">415 €</div>
                </div>
                <p className="text-xs text-slate-400 mt-4 italic">Stand: Dezember 2025. Preise können sich ändern.</p>
            </div>

            <h2 className="text-2xl font-bold text-[#00305e] pt-4">Wie funktioniert die Reservierung?</h2>
            <p>Du musst deine Besuche vorher <strong>reservieren</strong>. Das geht einfach über den MackOne Account oder die App. Du kannst bis zu <strong>fünf Besuchstage gleichzeitig reservieren</strong>. Sobald ein Tag vorbei ist, kannst du den nächsten buchen.</p>

            <BlogInjectedCTA />

            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">❓ Häufig gestellte Fragen</h3>
                <div className="space-y-6">
                    <div>
                        <h4 className="font-bold text-indigo-600 mb-2">Wie lange ist der Pass gültig?</h4>
                        <p className="text-slate-600 m-0">Exakt 12 Monate ab dem von dir gewählten Startdatum.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-indigo-600 mb-2">Brauche ich die physische Karte?</h4>
                        <p className="text-slate-600 m-0">Nein, die App reicht völlig aus. Die Plastikkarte ist optional (5€ bei Silver, inkl. bei Gold).</p>
                    </div>
                </div>
            </div>
          </div>
        );
      case 'silver-vs-gold-vergleich':
        return (
          <div className="space-y-8">
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-xl mb-8">
                <h2 className="text-xl font-bold text-slate-900 mb-4 m-0">📋 Auf einen Blick</h2>
                <ul className="list-none p-0 space-y-2 m-0 text-slate-700">
                    <li className="flex items-center gap-2"><Check size={16} className="text-green-600" /> <strong>ResortPass Silver:</strong> 295 €, über 230 Besuchstage, ideal für Sparfüchse.</li>
                    <li className="flex items-center gap-2"><Check size={16} className="text-green-600" /> <strong>ResortPass Gold:</strong> 475 €, alle Öffnungstage + 2x Rulantica.</li>
                    <li className="flex items-center gap-2"><Check size={16} className="text-green-600" /> <strong>Preisdifferenz:</strong> 180 € – aber lohnt sich das Upgrade?</li>
                </ul>
            </div>

            <p>Du willst dir endlich einen Europa-Park ResortPass zulegen, aber die Frage lässt dich nicht los: <strong>Silver oder Gold?</strong> In diesem Artikel zeigen wir dir ganz genau, wo die Unterschiede liegen und für wen sich welche Variante wirklich lohnt.</p>

            <h2 className="text-2xl font-bold text-[#00305e] pt-4">Der direkte Vergleich</h2>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                    <thead>
                        <tr className="bg-[#00305e] text-white">
                            <th className="p-4 text-left">Feature</th>
                            <th className="p-4 text-center">Silver</th>
                            <th className="p-4 text-center">Gold</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        <tr><td className="p-4 font-bold">Preis (Erwachsen)</td><td className="p-4 text-center">295 €</td><td className="p-4 text-center">475 €</td></tr>
                        <tr><td className="p-4 font-bold">Besuchstage</td><td className="p-4 text-center">Über 230</td><td className="p-4 text-center">Alle Tage</td></tr>
                        <tr><td className="p-4 font-bold">Sperrtage</td><td className="p-4 text-center text-red-500">Ja (~135)</td><td className="p-4 text-center text-green-600">Keine</td></tr>
                        <tr><td className="p-4 font-bold">Rulantica</td><td className="p-4 text-center">—</td><td className="p-4 text-center text-green-600">2 Tagestickets</td></tr>
                        <tr><td className="p-4 font-bold">Partnerparks</td><td className="p-4 text-center">Inkl.</td><td className="p-4 text-center">Inkl.</td></tr>
                    </tbody>
                </table>
            </div>

            <BlogInjectedCTA />

            <h2 className="text-2xl font-bold text-[#00305e] pt-4">Was bedeuten die Sperrtage beim Silver Pass?</h2>
            <p>Der größte Unterschied sind die <strong>Sperrtage</strong>. Silver ist an besonders beliebten Tagen wie Feiertagen, Brückentagen und in den Ferien oft gesperrt. <strong>Aber:</strong> Bei Hotelübernachtungen gelten diese Sperrtage nicht!</p>

            <div className="grid md:grid-cols-2 gap-6 my-10">
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                    <h4 className="text-green-600 font-bold text-lg mb-4 flex items-center gap-2"><Check /> Vorteile Silver</h4>
                    <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm">
                        <li>Deutlich günstiger (180 € Ersparnis)</li>
                        <li>Rechnet sich bereits ab 5 Besuchen</li>
                        <li>Perfekt für Budget-Bewusste</li>
                    </ul>
                </div>
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                    <h4 className="text-indigo-600 font-bold text-lg mb-4 flex items-center gap-2"><Star /> Vorteile Gold</h4>
                    <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm">
                        <li>Volle Flexibilität ohne Sperrtage</li>
                        <li>2 Rulantica Tickets (Wert ca. 100 €)</li>
                        <li>Ideal für Familien in Ferienzeiten</li>
                    </ul>
                </div>
            </div>

            <BlogInjectedCTA />

            <div className="bg-blue-50 border-2 border-indigo-200 p-8 rounded-3xl">
                <h3 className="text-[#00305e] text-2xl font-bold mb-4">🎯 Unser Fazit</h3>
                <p className="text-slate-700 leading-relaxed mb-6">Für die meisten Besucher ist <strong>Silver die klügere Wahl</strong>: günstiger, rechnet sich schneller und die Sperrtage sind in der Praxis oft verschmerzbar.</p>
                <p className="text-slate-700 leading-relaxed font-bold">Starte mit Silver! Du kannst bei der nächsten Verlängerung immer noch auf Gold upgraden.</p>
            </div>
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

            <BlogInjectedCTA />

            <h2 className="text-2xl font-bold text-[#00305e] pt-4">Optionale Zusatzkosten</h2>
            <div className="bg-indigo-50 border-2 border-indigo-100 p-8 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 text-indigo-200"><Clock size={120} opacity={0.1} /></div>
                <h3 className="text-indigo-900 font-bold text-xl mb-4">🚗 ParkingPass 2026</h3>
                <p className="text-4xl font-extrabold text-[#00305e] mb-4">39 €</p>
                <p className="text-indigo-800 text-sm max-w-md m-0">Ermöglicht dir 1 Jahr lang kostenloses Parken. Rechnet sich bereits ab dem <strong>4. Besuch</strong>, da Parken sonst 10 € pro Tag kostet.</p>
            </div>

            <h2 className="text-2xl font-bold text-[#00305e] pt-4">Preisentwicklung & Fazit</h2>
            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-xl">
                <p className="text-slate-700 m-0"><strong>Gute Nachrichten:</strong> Die Preise für 2026 bleiben nach dem Preissprung in 2025 stabil! Das ist eine tolle Nachricht für alle Europa-Park Fans.</p>
            </div>

            <BlogInjectedCTA />
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

            <BlogInjectedCTA />

            <h2 className="text-2xl font-bold text-[#00305e] pt-4">Versteckte Vorteile</h2>
            <p>Die reine Ticket-Rechnung ist nicht alles. Vergiss nicht die <strong>Partnerpark-Besuche</strong>. Je einmal kostenlos nach Efteling, Liseberg oder Port Aventura spart dir locker noch einmal 150-200 € pro Jahr!</p>

            <h2 className="text-2xl font-bold text-[#00305e] pt-4">Unsere Kaufempfehlung</h2>
            <div className="bg-indigo-900 text-white p-10 rounded-3xl shadow-xl text-center">
                <div className="inline-block bg-[#ffcc00] text-[#00305e] p-3 rounded-2xl mb-6">
                    <Info size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-4 m-0 text-white">Der Pass lohnt sich für fast jeden Stammgast!</h3>
                <p className="text-indigo-200 mb-8 max-w-2xl mx-auto">Wenn du 5 oder mehr Besuche pro Jahr planst, ist Silver eine kluge Investition. Für Familien in Ferienzeiten ist Gold die bessere Wahl.</p>
                <BlogInjectedCTA />
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
              className="flex items-center text-slate-500 hover:text-indigo-600 font-medium transition-colors mb-6"
            >
              <ArrowLeft size={16} className="mr-2" /> Zurück zum Blog
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
