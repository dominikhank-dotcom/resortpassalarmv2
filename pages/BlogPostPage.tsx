
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

  // Simple Name-as-Image helper (matching legal pages)
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
                <li><b>Ist Zutritt garantiert?</b> Innerhalb der Regeln des jeweiligen Modells (z. B. Silver‑Gültigkeitstage) ist der Eintritt grundsätzlich vorgesehen – Details stehen in den offiziellen Bedingungen.</li>
              </ul>
            </section>

            <section>
              <h2>Partner‑Freizeitparks</h2>
              <p>Laut offiziellen FAQ gibt es <b>keinen Unterschied</b> zwischen Silver und Gold bei den Partner‑Parks: Beide Modelle erlauben den einmaligen kostenfreien bzw. ermäßigten Besuch während der Laufzeit.</p>
            </section>

            <BlogCTA onSignup={handleSignup} />

            <section>
              <h2>Rulantica (nur Gold)</h2>
              <ul>
                <li><b>2 Tagestickets</b> sind enthalten.</li>
                <li>Die <b>Termine sind frei wählbar</b> (nach Verfügbarkeit), müssen aber vorab reserviert werden.</li>
              </ul>
            </section>

            <section>
              <h2>Print‑Karte / Ausweis</h2>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 my-6">
                <strong className="block mb-2">Gut zu wissen</strong>
                <p className="text-sm m-0">Eine gedruckte Karte ist nicht überall automatisch erhältlich. In den offiziellen FAQ gibt es Hinweise, dass eine Print‑Karte gegen Gebühr an einer Info‑Stelle im Park ausgestellt werden kann.</p>
              </div>
            </section>
          </>
        );

      case 'resortpass-gold-vorteile-rulantica':
        return (
          <>
            <p className="lead text-xl text-slate-600 mb-8 italic">Gold ist die Premium‑Variante: volle Flexibilität im Europa‑Park und zwei Rulantica‑Tagestickets. Hier sind die echten Vorteile – und wie du sie clever nutzt.</p>
            
            <section>
              <h2>Die Kernvorteile</h2>
              <ul>
                <li><b>Uneingeschränkter Zutritt</b> zum Europa‑Park an allen Öffnungstagen.</li>
                <li><b>2 Tagestickets für Rulantica</b> während der Laufzeit (Termine frei wählbar nach Verfügbarkeit).</li>
                <li><b>Partner‑Freizeitparks</b> einmalig kostenfrei/ermäßigt.</li>
                <li>Weitere Benefits wie Aktionen bei Events und Vergünstigungen.</li>
              </ul>
            </section>

            <BlogCTA onSignup={handleSignup} />

            <section>
              <h2>Rulantica mit Gold: so funktioniert’s praktisch</h2>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 my-6">
                <strong className="block mb-2 text-[#00305e]">Reservierung nicht vergessen</strong>
                <p className="text-sm m-0">Für Rulantica‑Besuche ist eine vorherige Reservierung der Termine erforderlich und läuft über das ResortPass‑Portal im Ticketshop (laut offizieller Beschreibung).</p>
              </div>
              <ul>
                <li>Plane Rulantica am besten an einem Tag, an dem du <b>nicht</b> den ganzen Tag im Park sein willst.</li>
                <li>Bei Kurzurlauben: 1 Tag Europa‑Park + 1 Tag Rulantica ist oft die perfekte Kombi.</li>
              </ul>
            </section>

            <section>
              <h2>Für wen Gold besonders stark ist</h2>
              <ul>
                <li>Spontane Besucher (auch „mal eben“ nach Feierabend/wochenends)</li>
                <li>Fans von saisonalen Events & Ferienzeiten</li>
              </ul>
            </section>
          </>
        );

      case 'resortpass-kaufen-verfuegbarkeit-tipps':
        return (
          <>
            <p className="lead text-xl text-slate-600 mb-8 italic">Wenn der ResortPass gefragt ist, ist er oft schnell vergriffen oder zeitweise nicht verfügbar. Mit der richtigen Vorbereitung bist du beim nächsten Verkaufsfenster deutlich schneller.</p>
            
            <section>
              <h2>Warum ist der ResortPass manchmal nicht verfügbar?</h2>
              <p>ResortPässe können kontingentiert sein. Das bedeutet: Der Verkauf wird zeitweise gestoppt, wenn das Kontingent erreicht ist – und später wieder geöffnet. Das betrifft häufig sowohl Silver als auch Gold.</p>
            </section>

            <BlogCTA onSignup={handleSignup} />

            <section>
              <h2>Die 7‑Punkte‑Checkliste für den Kauf</h2>
              <ol className="space-y-2">
                <li><b>Account im Ticketshop</b> anlegen und eingeloggt bleiben.</li>
                <li>Personendaten bereithalten (Name, Geburtsdatum etc.).</li>
                <li>Zahlungsart vorbereiten.</li>
                <li>Auf Mobil & Desktop testen (Backup‑Gerät).</li>
                <li>Browser‑Autofill aktivieren.</li>
                <li>Wenn möglich: stabile Verbindung (WLAN/LAN).</li>
                <li><b>Alarm setzen</b>, damit du den Verkaufsstart nicht verpasst.</li>
              </ol>
            </section>

            <section>
              <h2>Silver oder Gold – was ist schneller weg?</h2>
              <p>Das kann je nach Saison variieren. Gold ist wegen der Flexibilität und der Rulantica‑Leistung häufig besonders nachgefragt. Entscheidend ist: Sobald der Verkauf offen ist, zählt Geschwindigkeit.</p>
            </section>
          </>
        );

      case 'resortpass-lohnt-sich-rechner':
        return (
          <>
            <p className="lead text-xl text-slate-600 mb-8 italic">Die häufigste Google‑Frage: „Ab wie vielen Besuchen lohnt sich die Jahreskarte?“ Hier bekommst du nachvollziehbare Beispiele – realistischen Szenarien.</p>
            
            <section>
              <h2>Aktuelle Richtpreise (Stand: 22. Dezember 2025)</h2>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 my-6">
                <strong className="block mb-3 text-[#00305e]">ResortPass‑Preise (offizielle Übersicht)</strong>
                <ul className="m-0 space-y-2">
                  <li><b>ResortPass Silver:</b> Kinder 255 €, Erwachsene 295 €, Senioren 255 €</li>
                  <li><b>ResortPass Gold:</b> Kinder 415 €, Erwachsene 475 €, Senioren 415 €</li>
                </ul>
              </div>
            </section>

            <section>
              <h2>So rechnest du schnell selbst</h2>
              <p><b>Break‑even‑Idee:</b> ResortPass‑Preis ÷ durchschnittlicher Ticketpreis pro Besuch ≈ Besuche, ab denen es sich lohnt.</p>
            </section>

            <BlogCTA onSignup={handleSignup} />

            <section>
              <h2>Beispiel 1: Paar, 3 Besuche pro Jahr</h2>
              <ul>
                <li>Wenn alle 3 Besuche auf <b>Silver‑Tagen</b> liegen, kann Silver schnell günstiger als 3 Einzel‑Tickets sein.</li>
                <li>Wenn mindestens 1 Besuch in Ferien/Peak fällt, wird <b>Gold</b> wegen der Flexibilität interessanter.</li>
              </ul>
            </section>

            <section>
              <h2>Beispiel 2: Familie, 4–5 Besuche + 1× Rulantica</h2>
              <ul>
                <li>Mit Rulantica‑Interesse ist Gold spannend, weil <b>2 Rulantica‑Tagestickets</b> enthalten sind.</li>
                <li>Wenn Rulantica kein Thema ist, ist Silver oft der Preis‑Leistungs‑Champion.</li>
              </ul>
            </section>
          </>
        );

      case 'resortpass-preise-bedingungen-rabatte':
        return (
          <>
            <p className="lead text-xl text-slate-600 mb-8 italic">Wer „Europa‑Park Jahreskarte Preis“ googelt, meint meistens den ResortPass. Hier findest du die Preisstruktur und die wichtigsten Bedingungen.</p>
            
            <section>
              <h2>ResortPass Preise (offizielle Übersicht)</h2>
              <div className="overflow-x-auto my-6">
                <table className="w-full border-collapse border border-slate-200">
                  <thead className="bg-slate-50">
                    <tr><th className="border border-slate-200 p-4 text-left">Modell</th><th className="border border-slate-200 p-4 text-left">Kinder (4–11)</th><th className="border border-slate-200 p-4 text-left">Erwachsene (ab 12)</th><th className="border border-slate-200 p-4 text-left">Senioren (ab 60)</th></tr>
                  </thead>
                  <tbody>
                    <tr><td className="border border-slate-200 p-4 font-bold">Silver</td><td className="border border-slate-200 p-4">255 €</td><td className="border border-slate-200 p-4">295 €</td><td className="border border-slate-200 p-4">255 €</td></tr>
                    <tr><td className="border border-slate-200 p-4 font-bold">Gold</td><td className="border border-slate-200 p-4">415 €</td><td className="border border-slate-200 p-4">475 €</td><td className="border border-slate-200 p-4">415 €</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            <BlogCTA onSignup={handleSignup} />

            <section>
              <h2>Was ist enthalten – und was nicht?</h2>
              <ul>
                <li><b>Europa‑Park Zutritt:</b> Silver (über 230 definierte Tage), Gold (alle Öffnungstage).</li>
                <li><b>Rulantica:</b> Nur bei Gold: zwei Tagestickets.</li>
                <li><b>Partner‑Parks:</b> Beide Modelle: einmalig kostenfrei/ermäßigt.</li>
              </ul>
            </section>

            <section>
              <h2>Typische Zusatzkosten</h2>
              <ul>
                <li>Parken/Anreise</li>
                <li>Essen & Getränke</li>
                <li>Übernachtungen im Resort</li>
              </ul>
            </section>
          </>
        );

      case 'resortpass-silver-oeffnungstage-sperrtage':
        return (
          <>
            <p className="lead text-xl text-slate-600 mb-8 italic">Mit Silver kannst du den Europa‑Park als Tagesgast an über 230 vorab definierten Öffnungstagen besuchen. Hier zeige ich dir, wie du den Kalender richtig planst.</p>
            
            <section>
              <h2>Warum gibt es Sperrtage?</h2>
              <p>Silver ist bewusst günstiger und dafür an besonders nachfragestarken Tagen (z. B. viele Ferien/Feiertage) eingeschränkt. Das hilft dem Park, Besucherströme zu steuern.</p>
            </section>

            <section>
              <h2>So planst du mit dem Silver‑Kalender</h2>
              <ul>
                <li><b>Wähle 2–3 Wunschmonate</b> und prüfe dort die gültigen Silver‑Tage.</li>
                <li>Nutze <b>Brückentage</b> und „Randtage“ außerhalb der Ferien.</li>
                <li>Plane pro Trip einen <b>Backup‑Tag</b> ein.</li>
              </ul>
            </section>

            <BlogCTA onSignup={handleSignup} />

            <section>
              <h2>Wichtiger Punkt: „Über 230 Tage“ heißt nicht „jeder Tag“</h2>
              <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 my-6">
                <strong className="block mb-2 text-amber-900">Typische Fehlannahme</strong>
                <p className="text-sm m-0 text-amber-800">Viele denken, Silver sei „fast immer“ gültig. Tatsächlich gilt: Du hast sehr viele Besuchstage – aber eben nicht alle. Deshalb lohnt sich ein kurzer Kalender‑Check.</p>
              </div>
            </section>

            <section>
              <h2>Pro‑Tipp: Silver + Kurzurlaub</h2>
              <p>Wenn du eh im Europa‑Park Hotel übernachtest, kannst du deinen Aufenthalt so legen, dass die Parktage in die Silver‑Gültigkeit fallen.</p>
            </section>
          </>
        );

      case 'resortpass-silver-vs-gold-unterschiede':
        return (
          <>
            <p className="lead text-xl text-slate-600 mb-8 italic">Silver ist der günstige Einstieg mit fest definierten Besuchstagen. Gold ist die flexible Premium‑Variante. Hier kommt der direkte Vergleich.</p>
            
            <section>
              <h2>Die Unterschiede auf einen Blick</h2>
              <div className="overflow-x-auto my-6">
                <table className="w-full border-collapse border border-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr><th className="border border-slate-200 p-4 text-left">Kriterium</th><th className="border border-slate-200 p-4 text-left">Silver</th><th className="border border-slate-200 p-4 text-left">Gold</th></tr>
                  </thead>
                  <tbody>
                    <tr><td className="border border-slate-200 p-4 font-bold">Zutritt</td><td className="border border-slate-200 p-4">über 230 definierte Tage</td><td className="border border-slate-200 p-4">alle Öffnungstage</td></tr>
                    <tr><td className="border border-slate-200 p-4 font-bold">Rulantica</td><td className="border border-slate-200 p-4">nicht enthalten</td><td className="border border-slate-200 p-4">2 Tagestickets inkl.</td></tr>
                    <tr><td className="border border-slate-200 p-4 font-bold">Zielgruppe</td><td className="border border-slate-200 p-4">Planer, Off‑Season</td><td className="border border-slate-200 p-4">Spontane, Peak‑Season</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            <BlogCTA onSignup={handleSignup} />

            <section>
              <h2>Für wen lohnt sich ResortPass Silver?</h2>
              <ul>
                <li>Du fährst <b>mehrmals</b>, aber hauptsächlich in ruhigeren Monaten.</li>
                <li>Du kannst deine Besuche nach dem <b>Silver‑Kalender</b> planen.</li>
              </ul>
            </section>

            <section>
              <h2>Für wen lohnt sich ResortPass Gold?</h2>
              <ul>
                <li>Du willst <b>maximale Flexibilität</b> (auch Ferien/Feiertage).</li>
                <li>Du willst Europa‑Park & Rulantica kombinieren.</li>
                <li>Du machst häufiger <b>spontane Tagestrips</b>.</li>
              </ul>
            </section>
          </>
        );

      case 'resortpass-tipps-tricks-vielbesucher':
        return (
          <>
            <p className="lead text-xl text-slate-600 mb-8 italic">Du hast einen ResortPass? Dann hol mit diesen Tipps mehr aus jedem Besuch raus – weniger Wartezeit, bessere Planung.</p>
            
            <section>
              <h2>Planung & Timing</h2>
              <ul>
                <li><b>Früh starten</b>: Die erste Stunde ist oft die ruhigste.</li>
                <li><b>Randzeiten nutzen</b>: Mittag/Spätnachmittag sind ideal für Shows.</li>
              </ul>
            </section>

            <section>
              <h2>Wartezeiten smart reduzieren</h2>
              <ul>
                <li>Beginne mit Top‑Attraktionen in entgegengesetzter Laufrichtung.</li>
                <li>Nutze ruhigere Bereiche als „Puffer“.</li>
              </ul>
            </section>

            <BlogCTA onSignup={handleSignup} />

            <section>
              <h2>Budget‑Tricks</h2>
              <ul>
                <li>Setze ein fixes Essensbudget pro Besuch.</li>
                <li>Souvenir‑Regel: nur 1 „Lieblingsstück“ pro Saison.</li>
              </ul>
            </section>
          </>
        );

      case 'resortpass-was-ist-das':
        return (
          <>
            <p className="lead text-xl text-slate-600 mb-8 italic">Der ResortPass ist die „Jahreskarte“ des Europa‑Park Erlebnis‑Resorts. Hier bekommst du einen schnellen Überblick über Modelle und Vorteile.</p>
            
            <section>
              <h2>Das Wichtigste in 60 Sekunden</h2>
              <div className="bg-[#00305e] text-white p-8 rounded-2xl my-6">
                <strong className="block text-xl mb-4 text-[#ffcc00]">Kurzfassung</strong>
                <ul className="m-0 space-y-3">
                  <li><b>Silver:</b> Tageszutritt an über 230 definierten Tagen.</li>
                  <li><b>Gold:</b> Unbegrenzter Zutritt + 2 Tagestickets für Rulantica.</li>
                  <li>Beide: Partner‑Freizeitparks & weitere Benefits.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2>ResortPass Silver und Gold: die Grundidee</h2>
              <p>Der ResortPass richtet sich an Menschen, die den Europa‑Park öfter besuchen wollen als 1–2 Mal pro Jahr. Statt jedes Mal ein Tagesticket zu kaufen, erhältst du für <b>ein Jahr Laufzeit</b> einen wiederkehrenden Zutritt.</p>
            </section>

            <BlogCTA onSignup={handleSignup} />

            <section>
              <h2>Warum „ResortPassAlarm“ sinnvoll ist</h2>
              <p>ResortPässe sind häufig <b>kontingentiert</b> und zeitweise nicht verfügbar. Wenn du flexibel sein willst, hilft ein Alarm‑Service: Du wirst informiert, sobald ein Verkauf wieder möglich ist.</p>
            </section>
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
          <div className="mb-8">
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
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight mb-6">
              {postInfo.title}
            </h1>
            <div className="flex items-center gap-4 py-6 border-y border-slate-100">
               <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
                 <User size={24} />
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

          {/* Hero Image */}
          <div className="mb-12 rounded-3xl overflow-hidden shadow-lg h-[300px] md:h-[450px]">
             <img 
               src={postInfo.image} 
               alt={postInfo.title} 
               className="w-full h-full object-cover" 
             />
          </div>

          {/* Content */}
          <div className="prose prose-slate prose-lg max-w-none prose-headings:text-[#00305e] prose-headings:font-bold prose-a:text-blue-600 prose-strong:text-slate-900">
            {renderContent()}
          </div>

          {/* Footer Info */}
          <div className="mt-12 p-8 bg-slate-100 rounded-2xl border border-slate-200">
            <strong className="block mb-2 text-slate-900">Transparenz‑Hinweis</strong>
            <p className="text-sm text-slate-500 m-0">
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
                    className="flex gap-4 cursor-pointer group"
                    onClick={() => { navigate(`blog/${p.slug}`); window.scrollTo(0,0); }}
                  >
                    <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
                      <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 leading-snug group-hover:text-[#00305e] transition-colors line-clamp-2">{p.title}</h4>
                      <p className="text-xs text-slate-400 mt-2 flex items-center gap-1 font-bold">LESEN <ChevronRight size={12}/></p>
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
