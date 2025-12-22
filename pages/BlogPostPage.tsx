
import React from 'react';
import { ArrowLeft, Calendar, User, Clock, Share2, Tag, ChevronRight } from 'lucide-react';
import { Button } from '../components/Button';
import { Footer } from '../components/Footer';
import { BlogCTA } from '../components/BlogCTA';
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

  // Simple Name-as-Image helper
  const NameAsImage = () => (
      <img 
        src={`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="18"><text x="0" y="14" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="%23334155">Dominik Hank</text></svg>`} 
        alt="Dominik Hank" 
        className="inline-block align-bottom h-[14px]"
      />
  );

  const renderContent = () => {
    switch (slug) {
      case 'resortpass-erfahrungen-1-jahr':
        return (
          <>
            <p className="lead text-xl text-slate-600 mb-8 italic">Erfahrungsberichte ranken, weil Menschen echte Antworten wollen. Dieser Artikel ist bewusst praxisorientiert: Was hat sich gelohnt, was nervt – und für wen welcher Pass passt.</p>
            <section>
              <h2>Was viele nach 3 Monaten merken (und vorher unterschätzen)</h2>
              <ul>
                <li>Man fährt häufiger „kurz und spontan“ – wenn man es zeitlich hinbekommt.</li>
                <li>Der Pass spart nicht nur Geld, sondern auch Entscheidungsmüdigkeit („Lohnt sich ein Tagesticket heute?“).</li>
                <li>Reservierung/Planung ist ein echter Faktor – besonders bei beliebten Tagen.</li>
              </ul>
            </section>
            <BlogCTA onSignup={handleSignup} />
            <section>
              <h2>Pro & Contra (ehrlich)</h2>
              <div className="overflow-x-auto my-6">
                <table className="w-full border-collapse border border-slate-200">
                  <thead className="bg-slate-50">
                    <tr><th className="border border-slate-200 p-4 text-left font-bold">Pro</th><th className="border border-slate-200 p-4 text-left font-bold">Contra</th></tr>
                  </thead>
                  <tbody>
                    <tr><td className="border border-slate-200 p-4 text-sm">Mehr Besuche ohne jedes Mal Ticketkauf</td><td className="border border-slate-200 p-4 text-sm">Verfügbarkeit/Verkauf kann zeitweise geschlossen sein</td></tr>
                    <tr><td className="border border-slate-200 p-4 text-sm">Gold: maximale Flexibilität + 2× Rulantica</td><td className="border border-slate-200 p-4 text-sm">Silver: Kalender‑Einschränkungen</td></tr>
                    <tr><td className="border border-slate-200 p-4 text-sm">Partner‑Parks als Bonus</td><td className="border border-slate-200 p-4 text-sm">Zusatzkosten (Anreise/Essen) bleiben</td></tr>
                  </tbody>
                </table>
              </div>
            </section>
            <section>
              <h2>So schreibst du deinen eigenen Erfahrungsbericht (SEO‑Struktur)</h2>
              <ol>
                <li>Wie oft bist du gefahren? (Monate/Anlässe)</li>
                <li>Welche Tage hast du genutzt? (Ferien vs. Nebensaison)</li>
                <li>Was waren deine Top‑Momente? (Shows/Events/Attraktionen)</li>
                <li>Was würdest du beim nächsten Mal anders machen?</li>
              </ol>
            </section>
          </>
        );
      case 'resortpass-faq-haeufige-fragen':
        return (
          <>
            <p className="lead text-xl text-slate-600 mb-8 italic">Hier findest du Antworten auf die Fragen, die bei Google & in Foren am häufigsten auftauchen – kurz, verständlich und mit Fokus auf Praxis.</p>
            <section>
              <h2>Reservierung & Zutritt</h2>
              <ul>
                <li><b>Muss ich reservieren?</b> Je nach Vorgaben kann eine Reservierung über das ResortPass‑Portal erforderlich sein.</li>
                <li><b>Ist Zutritt garantiert?</b> Innerhalb der Regeln des jeweiligen Modells ist der Eintritt grundsätzlich vorgesehen.</li>
              </ul>
            </section>
            <section>
              <h2>Partner‑Freizeitparks</h2>
              <p>Laut offiziellen FAQ gibt es <b>keinen Unterschied</b> zwischen Silver und Gold bei den Partner‑Parks: Beide Modelle erlauben den einmaligen kostenfreien bzw. ermäßigten Besuch.</p>
            </section>
            <BlogCTA onSignup={handleSignup} />
            <section>
              <h2>Rulantica (nur Gold)</h2>
              <ul>
                <li><b>2 Tagestickets</b> sind enthalten.</li>
                <li>Die <b>Termine sind frei wählbar</b> (nach Verfügbarkeit), müssen aber vorab reserviert werden.</li>
              </ul>
            </section>
          </>
        );
      case 'resortpass-gold-vorteile-rulantica':
        return (
          <>
            <p className="lead text-xl text-slate-600 mb-8 italic">Gold ist die Premium‑Variante: volle Flexibilität im Europa‑Park und zwei Rulantica‑Tagestickets. Hier sind die Vorteile.</p>
            <section>
              <h2>Die Kernvorteile</h2>
              <ul>
                <li><b>Uneingeschränkter Zutritt</b> zum Europa‑Park an allen Öffnungstagen.</li>
                <li><b>2 Tagestickets für Rulantica</b> während der Laufzeit.</li>
                <li><b>Partner‑Freizeitparks</b> einmalig kostenfrei/ermäßigt.</li>
              </ul>
            </section>
            <BlogCTA onSignup={handleSignup} />
          </>
        );
      case 'resortpass-kaufen-verfuegbarkeit-tipps':
        return (
          <>
            <p className="lead text-xl text-slate-600 mb-8 italic">Wenn der ResortPass gefragt ist, ist er oft schnell vergriffen. Mit der richtigen Vorbereitung bist du beim nächsten Verkaufsfenster schneller.</p>
            <BlogCTA onSignup={handleSignup} />
            <section>
              <h2>Die 7‑Punkte‑Checkliste für den Kauf</h2>
              <ol className="space-y-2">
                <li><b>Account im Ticketshop</b> anlegen.</li>
                <li>Personendaten bereithalten.</li>
                <li>Zahlungsart vorbereiten.</li>
                <li>Auf Mobil & Desktop testen.</li>
                <li>Browser‑Autofill aktivieren.</li>
                <li>Stabile Verbindung sicherstellen.</li>
                <li><b>Alarm setzen</b>, damit du den Verkaufsstart nicht verpasst.</li>
              </ol>
            </section>
          </>
        );
      case 'resortpass-lohnt-sich-rechner':
        return (
          <>
            <p className="lead text-xl text-slate-600 mb-8 italic">Die häufigste Google‑Frage: „Ab wie vielen Besuchen lohnt sich die Jahreskarte?“ Hier bekommst du die Antworten.</p>
            <section>
              <h2>Aktuelle Richtpreise (Stand: 2025)</h2>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 my-6">
                <ul className="m-0 space-y-2">
                  <li><b>ResortPass Silver:</b> Ab 255 €</li>
                  <li><b>ResortPass Gold:</b> Ab 415 €</li>
                </ul>
              </div>
            </section>
            <BlogCTA onSignup={handleSignup} />
          </>
        );
      case 'resortpass-preise-bedingungen-rabatte':
        return (
          <>
            <p className="lead text-xl text-slate-600 mb-8 italic">Hier findest du die Preisstruktur und die wichtigsten Bedingungen für den Europa-Park ResortPass.</p>
            <BlogCTA onSignup={handleSignup} />
            <section>
              <h2>Zusatzkosten einplanen</h2>
              <ul>
                <li>Parkgebühren</li>
                <li>Verpflegung im Park</li>
                <li>Event-Tickets</li>
              </ul>
            </section>
          </>
        );
      case 'resortpass-silver-oeffnungstage-sperrtage':
        return (
          <>
            <p className="lead text-xl text-slate-600 mb-8 italic">Mit Silver kannst du den Europa‑Park als Tagesgast an über 230 vorab definierten Öffnungstagen besuchen. Planung ist hier alles.</p>
            <BlogCTA onSignup={handleSignup} />
          </>
        );
      case 'resortpass-silver-vs-gold-unterschiede':
        return (
          <>
            <p className="lead text-xl text-slate-600 mb-8 italic">Silver ist der günstige Einstieg, Gold die volle Freiheit. Hier kommt der direkte Vergleich.</p>
            <BlogCTA onSignup={handleSignup} />
          </>
        );
      case 'resortpass-tipps-tricks-vielbesucher':
        return (
          <>
            <p className="lead text-xl text-slate-600 mb-8 italic">Du hast einen ResortPass? Dann hol mit diesen Tipps mehr aus jedem Besuch raus – weniger Wartezeit, bessere Planung.</p>
            <BlogCTA onSignup={handleSignup} />
          </>
        );
      case 'resortpass-was-ist-das':
        return (
          <>
            <p className="lead text-xl text-slate-600 mb-8 italic">Der ResortPass ist die moderne Jahreskarte des Europa‑Park. Hier erfährst du alles über das System.</p>
            <BlogCTA onSignup={handleSignup} />
          </>
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
              className="flex items-center text-slate-500 hover:text-[#00305e] font-medium transition-colors mb-6"
            >
              <ArrowLeft size={16} className="mr-2" /> Zurück zum Blog
            </button>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-blue-100 text-[#00305e] text-xs font-bold uppercase px-3 py-1 rounded-full">
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
                  <p className="text-sm font-bold text-slate-900"><NameAsImage /></p>
                  <p className="text-xs text-slate-400">ResortPass Experte</p>
               </div>
               <div className="ml-auto flex gap-2">
                 <button className="p-2 text-slate-400 hover:text-blue-500 transition"><Share2 size={20} /></button>
               </div>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-slate prose-lg max-w-none prose-headings:text-[#00305e] prose-headings:font-bold prose-a:text-blue-600 prose-strong:text-slate-900">
            {renderContent()}
          </div>

          {/* Footer Info */}
          <div className="mt-12 p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <strong className="block mb-2 text-slate-900">Transparenz‑Hinweis</strong>
            <p className="text-sm text-slate-500 m-0 leading-relaxed">
              Dieser Artikel fasst öffentlich verfügbare Informationen zusammen (z. B. offizielle ResortPass‑Seiten & FAQ). Für verbindliche Details gelten die Angaben des Europa‑Park/Mack International Ticketshops. ResortPassAlarm ist ein unabhängiger Service.
            </p>
          </div>

          {/* More Posts */}
          <div className="mt-16 pt-16 border-t border-slate-200">
             <h3 className="text-2xl font-bold text-[#00305e] mb-8">Das könnte dich auch interessieren</h3>
             <div className="grid md:grid-cols-2 gap-8">
                {BLOG_POSTS.filter(p => p.slug !== slug).slice(0, 2).map(p => (
                  <div 
                    key={p.slug} 
                    className="flex gap-4 cursor-pointer group bg-white p-4 rounded-xl border border-slate-100 hover:shadow-md transition-all"
                    onClick={() => { navigate(`blog-post:${p.slug}`); window.scrollTo(0,0); }}
                  >
                    <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-[#00305e]">
                      {p.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 leading-snug group-hover:text-[#00305e] transition-colors line-clamp-2">{p.title}</h4>
                      <p className="text-xs text-slate-400 mt-2 flex items-center gap-1 font-bold uppercase tracking-wider">Lesen <ChevronRight size={12}/></p>
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
