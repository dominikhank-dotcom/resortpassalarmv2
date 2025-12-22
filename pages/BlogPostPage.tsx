
import React from 'react';
import { ArrowLeft, Calendar, User, Clock, Share2, Tag, ChevronRight, Check } from 'lucide-react';
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
            <p className="lead text-xl text-slate-600 mb-8">Erfahrungsberichte ranken, weil Menschen echte Antworten wollen. Dieser Artikel ist bewusst praxisorientiert: Was hat sich gelohnt, was nervt – und für wen welcher Pass passt.</p>
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Was viele nach 3 Monaten merken (und vorher unterschätzen)</h2>
              <ul className="space-y-2 list-disc pl-6 mb-6">
                <li>Man fährt häufiger „kurz und spontan“ – wenn man es zeitlich hinbekommt.</li>
                <li>Der Pass spart nicht nur Geld, sondern auch Entscheidungsmüdigkeit („Lohnt sich ein Tagesticket heute?“).</li>
                <li>Reservierung/Planung ist ein echter Faktor – besonders bei beliebten Tagen.</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Pro & Contra (ehrlich)</h2>
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
            <BlogCTA onSignup={handleSignup} />
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">So schreibst du deinen eigenen Erfahrungsbericht (SEO‑Struktur)</h2>
              <ol className="space-y-2 list-decimal pl-6 mb-6">
                <li>Wie oft bist du gefahren? (Monate/Anlässe)</li>
                <li>Welche Tage hast du genutzt? (Ferien vs. Nebensaison)</li>
                <li>Was waren deine Top‑Momente? (Shows/Events/Attraktionen)</li>
                <li>Was würdest du beim nächsten Mal anders machen?</li>
              </ol>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Ideen für echte Mehrwerte im Text</h2>
              <ul className="space-y-2 list-disc pl-6 mb-6">
                <li>Mini‑Rechner: „Kosten pro Besuch“ (Passpreis ÷ Besuche)</li>
                <li>Beste Besuchszeiten (deine Statistik)</li>
                <li>Rulantica‑Kombi (falls Gold)</li>
              </ul>
            </section>
          </>
        );
      case 'resortpass-faq-haeufige-fragen':
        return (
          <>
            <p className="lead text-xl text-slate-600 mb-8">Hier findest du Antworten auf die Fragen, die bei Google & in Foren am häufigsten auftauchen – kurz, verständlich und mit Fokus auf Praxis.</p>
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Reservierung & Zutritt</h2>
              <ul className="space-y-2 list-disc pl-6 mb-6">
                <li><b>Muss ich reservieren?</b> Je nach Vorgaben kann eine Reservierung über das ResortPass‑Portal erforderlich sein.</li>
                <li><b>Ist Zutritt garantiert?</b> Innerhalb der Regeln des jeweiligen Modells (z. B. Silver‑Gültigkeitstage) ist der Eintritt grundsätzlich vorgesehen – Details stehen in den offiziellen Bedingungen.</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Partner‑Freizeitparks</h2>
              <p className="mb-6">Laut offiziellen FAQ gibt es <b>keinen Unterschied</b> zwischen Silver und Gold bei den Partner‑Parks: Beide Modelle erlauben den einmaligen kostenfreien bzw. ermäßigten Besuch während der Laufzeit.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Rulantica (nur Gold)</h2>
              <ul className="space-y-2 list-disc pl-6 mb-6">
                <li><b>2 Tagestickets</b> sind enthalten.</li>
                <li>Die <b>Termine sind frei wählbar</b> (nach Verfügbarkeit), müssen aber vorab reserviert werden.</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Print‑Karte / Ausweis</h2>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6">
                <strong className="block mb-2">Gut zu wissen</strong>
                <div className="text-sm">Eine gedruckte Karte ist nicht überall automatisch erhältlich. In den offiziellen FAQ gibt es Hinweise, dass eine Print‑Karte gegen Gebühr an einer Info‑Stelle im Park ausgestellt werden kann.</div>
              </div>
            </section>
            <BlogCTA onSignup={handleSignup} />
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Warum ResortPassAlarm?</h2>
              <p className="mb-6">Viele Nutzer scheitern nicht an der Entscheidung Silver vs. Gold – sondern daran, dass der Pass gerade nicht verkauft wird. Ein Alarm spart Zeit und Nerven.</p>
            </section>
          </>
        );
      case 'resortpass-gold-vorteile-rulantica':
        return (
          <>
            <p className="lead text-xl text-slate-600 mb-8">Gold ist die Premium‑Variante: volle Flexibilität im Europa‑Park und zwei Rulantica‑Tagestickets. Hier sind die echten Vorteile – und wie du sie clever nutzt.</p>
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Die Kernvorteile</h2>
              <ul className="space-y-2 list-disc pl-6 mb-6">
                <li><b>Uneingeschränkter Zutritt</b> zum Europa‑Park an allen Öffnungstagen.</li>
                <li><b>2 Tagestickets für Rulantica</b> während der Laufzeit (Termine frei wählbar nach Verfügbarkeit).</li>
                <li><b>Partner‑Freizeitparks</b> einmalig kostenfrei/ermäßigt.</li>
                <li>Weitere Benefits wie Aktionen bei Events und Vergünstigungen (z. B. Abendkino, je nach Angebot).</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Rulantica mit Gold: so funktioniert’s praktisch</h2>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6">
                <strong className="block mb-2">Reservierung nicht vergessen</strong>
                <div className="text-sm">Für Rulantica‑Besuche ist eine vorherige Reservierung der Termine erforderlich und läuft über das ResortPass‑Portal im Ticketshop (laut offizieller Beschreibung).</div>
              </div>
              <ul className="space-y-2 list-disc pl-6 mb-6">
                <li>Plane Rulantica am besten an einem Tag, an dem du <b>nicht</b> den ganzen Tag im Park sein willst.</li>
                <li>Bei Kurzurlauben: 1 Tag Europa‑Park + 1 Tag Rulantica ist oft die perfekte Kombi.</li>
              </ul>
            </section>
            <BlogCTA onSignup={handleSignup} />
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Für wen Gold besonders stark ist</h2>
              <ul className="space-y-2 list-disc pl-6 mb-6">
                <li>Spontane Besucher (auch „mal eben“ nach Feierabend/wochenends)</li>
                <li>Fans von saisonalen Events & Ferienzeiten</li>
                <li>Alle, die Europa‑Park und Wasserwelt als „Gesamt‑Resort“ erleben wollen</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Gold ist oft kontingentiert</h2>
              <p className="mb-6">Weil Gold ein exklusiveres Gesamtpaket ist, ist er häufig nur <b>begrenzt verfügbar</b>. Wenn du ihn möchtest, lohnt sich ein Alarm, sobald der Verkauf wieder startet.</p>
            </section>
          </>
        );
      case 'resortpass-kaufen-verfuegbarkeit-tipps':
        return (
          <>
            <p className="lead text-xl text-slate-600 mb-8">Wenn der ResortPass gefragt ist, ist er oft schnell vergriffen oder zeitweise nicht verfügbar. Mit der richtigen Vorbereitung bist du beim nächsten Verkaufsfenster deutlich schneller – hier ist die Checkliste.</p>
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Warum ist der ResortPass manchmal nicht verfügbar?</h2>
              <p className="mb-6">ResortPässe können kontingentiert sein. Das bedeutet: Der Verkauf wird zeitweise gestoppt, wenn das Kontingent erreicht ist – und später wieder geöffnet. Das betrifft häufig sowohl Silver als auch Gold.</p>
            </section>
            <BlogCTA onSignup={handleSignup} />
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Die 7‑Punkte‑Checkliste für den Kauf</h2>
              <ol className="space-y-2 list-decimal pl-6 mb-6">
                <li><b>Account im Ticketshop</b> anlegen und eingeloggt bleiben.</li>
                <li>Personendaten bereithalten (Name, Geburtsdatum etc.).</li>
                <li>Zahlungsart vorbereiten (z. B. Kreditkarte/PayPal – je nach Shop‑Option).</li>
                <li>Auf Mobil & Desktop testen (Backup‑Gerät).</li>
                <li>Browser‑Autofill aktivieren.</li>
                <li>Wenn möglich: stabile Verbindung (WLAN/LAN).</li>
                <li><b>Alarm setzen</b>, damit du den Verkaufsstart nicht verpasst.</li>
              </ol>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Silver oder Gold – was ist schneller weg?</h2>
              <p className="mb-6">Das kann je nach Saison variieren. Gold ist wegen der Flexibilität und der Rulantica‑Leistung häufig besonders nachgefragt. Entscheidend ist: Sobald der Verkauf offen ist, zählt Geschwindigkeit.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Nach dem Kauf: Was du sofort prüfen solltest</h2>
              <ul className="space-y-2 list-disc pl-6 mb-6">
                <li>Deine Daten im Ticketshop (Tippfehler kosten später Nerven).</li>
                <li>Wie Reservierung/Portalzugang funktioniert.</li>
                <li>Welche Tage bei Silver gültig sind (Kalender speichern).</li>
              </ul>
            </section>
          </>
        );
      case 'resortpass-lohnt-sich-rechner':
        return (
          <>
            <p className="lead text-xl text-slate-600 mb-8">Die häufigste Google‑Frage: „Ab wie vielen Besuchen lohnt sich die Jahreskarte?“ Hier bekommst du nachvollziehbare Beispiele – ohne Marketing‑Buzz, dafür mit realistischen Szenarien.</p>
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Aktuelle Richtpreise (Stand: 22. Dezember 2025)</h2>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6">
                <strong className="block mb-2">ResortPass‑Preise (offizielle Übersicht – kann sich ändern)</strong>
                <ul className="space-y-1 text-sm list-disc pl-6">
                  <li><b>ResortPass Silver:</b> Kinder (4–11) 255 €, Erwachsene (ab 12) 295 €, Senioren (ab 60) 255 €</li>
                  <li><b>ResortPass Gold:</b> Kinder (4–11) 415 €, Erwachsene (ab 12) 475 €, Senioren (ab 60) 415 €</li>
                </ul>
                <div className="text-xs text-slate-400 mt-4 italic">Tipp: Prüfe immer den aktuellen Stand im offiziellen Ticketshop, weil Preise/Verfügbarkeit variieren können.</div>
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">So rechnest du schnell selbst</h2>
              <p className="mb-4"><b>Break‑even‑Idee:</b> ResortPass‑Preis ÷ durchschnittlicher Ticketpreis pro Besuch ≈ Besuche, ab denen es sich lohnt.</p>
              <ul className="space-y-2 list-disc pl-6 mb-6">
                <li>Wenn du sonst oft an teuren Tagen gehst, kippt die Rechnung schneller Richtung <b>Gold</b>.</li>
                <li>Wenn du gezielt günstigere Tage nutzt, kann <b>Silver</b> extrem stark sein.</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Beispiel 1: Paar, 3 Besuche pro Jahr</h2>
              <ul className="space-y-2 list-disc pl-6 mb-6">
                <li>Wenn alle 3 Besuche auf <b>Silver‑Tagen</b> liegen, kann Silver schnell günstiger als 3 Einzel‑Tickets sein.</li>
                <li>Wenn mindestens 1 Besuch in Ferien/Peak fällt, wird <b>Gold</b> wegen der Flexibilität interessanter.</li>
              </ul>
            </section>
            <BlogCTA onSignup={handleSignup} />
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Beispiel 2: Familie, 4–5 Besuche + 1× Rulantica</h2>
              <ul className="space-y-2 list-disc pl-6 mb-6">
                <li>Mit Rulantica‑Interesse ist Gold spannend, weil <b>2 Rulantica‑Tagestickets</b> enthalten sind.</li>
                <li>Wenn Rulantica kein Thema ist und ihr planbar fahrt, ist Silver oft der Preis‑Leistungs‑Champion.</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Versteckte Kosten, die du einplanen solltest</h2>
              <ul className="space-y-2 list-disc pl-6 mb-6">
                <li><b>Anreise & Parken</b> (je nach Option ggf. Zusatzpässe/Tagestickets)</li>
                <li><b>Essen & Merchandise</b> (Budget festlegen)</li>
                <li><b>Übernachtung</b> bei Resort‑Trips</li>
              </ul>
            </section>
          </>
        );
      case 'resortpass-preise-bedingungen-rabatte':
        return (
          <>
            <p className="lead text-xl text-slate-600 mb-8">Wer „Europa‑Park Jahreskarte Preis“ googelt, meint meistens den ResortPass. Hier findest du die Preisstruktur, die wichtigsten Bedingungen – und die Dinge, die in der Kalkulation oft vergessen werden.</p>
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">ResortPass Preise (offizielle Übersicht)</h2>
              <div className="overflow-x-auto my-6">
                <table className="w-full border-collapse border border-slate-200">
                  <thead className="bg-slate-50">
                    <tr><th className="border border-slate-200 p-4 text-left font-bold">Modell</th><th className="border border-slate-200 p-4 text-left font-bold">Kinder (4–11)</th><th className="border border-slate-200 p-4 text-left font-bold">Erwachsene (ab 12)</th><th className="border border-slate-200 p-4 text-left font-bold">Senioren (ab 60)</th></tr>
                  </thead>
                  <tbody>
                    <tr><td className="border border-slate-200 p-4 text-sm font-bold">ResortPass Silver</td><td className="border border-slate-200 p-4 text-sm">255 €</td><td className="border border-slate-200 p-4 text-sm">295 €</td><td className="border border-slate-200 p-4 text-sm">255 €</td></tr>
                    <tr><td className="border border-slate-200 p-4 text-sm font-bold">ResortPass Gold</td><td className="border border-slate-200 p-4 text-sm">415 €</td><td className="border border-slate-200 p-4 text-sm">475 €</td><td className="border border-slate-200 p-4 text-sm">415 €</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-400 mb-6">Stand: 22. Dezember 2025. Verbindlich sind die Angaben im offiziellen Ticketshop/auf den Ticketseiten.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Was ist enthalten – und was nicht?</h2>
              <ul className="space-y-2 list-disc pl-6 mb-6">
                <li><b>Europa‑Park Zutritt:</b> Silver (über 230 definierte Tage), Gold (alle Öffnungstage).</li>
                <li><b>Rulantica:</b> Nur bei Gold: zwei Tagestickets.</li>
                <li><b>Partner‑Parks:</b> Beide Modelle: einmalig kostenfrei/ermäßigt.</li>
              </ul>
            </section>
            <BlogCTA onSignup={handleSignup} />
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Typische Zusatzkosten</h2>
              <ul className="space-y-2 list-disc pl-6 mb-6">
                <li>Parken/Anreise</li>
                <li>Essen & Getränke</li>
                <li>Übernachtungen im Resort (Hotels/Camping/Silver Lake City)</li>
                <li>Extras (Events, spezielle Tickets, Souvenirs)</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Preis‑Tipp: So vergleichst du fair</h2>
              <p className="mb-6">Vergleiche nicht nur den ResortPass‑Preis mit einem einzelnen Tagesticket. Entscheidend ist, <b>an welchen Tagen</b> du sonst fahren würdest (günstige vs. teure Tage) – und ob du Rulantica ohnehin eingeplant hast.</p>
            </section>
          </>
        );
      case 'resortpass-silver-oeffnungstage-sperrtage':
        return (
          <>
            <p className="lead text-xl text-slate-600 mb-8">Mit Silver kannst du den Europa‑Park als Tagesgast an über 230 vorab definierten Öffnungstagen besuchen. Die Kunst ist, diese Tage smart zu nutzen – hier zeige ich dir, wie du den Kalender richtig liest und optimal planst.</p>
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Warum gibt es Sperrtage?</h2>
              <p className="mb-6">Silver ist bewusst günstiger und dafür an besonders nachfragestarken Tagen (z. B. viele Ferien/Feiertage) eingeschränkt. Das hilft dem Park, Besucherströme zu steuern – und dir, an ruhigeren Tagen günstiger und entspannter zu besuchen.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">So planst du mit dem Silver‑Kalender</h2>
              <ul className="space-y-2 list-disc pl-6 mb-6">
                <li><b>Wähle 2–3 Wunschmonate</b> und prüfe dort die gültigen Silver‑Tage.</li>
                <li>Nutze <b>Brückentage</b> und „Randtage“ außerhalb der Ferien.</li>
                <li>Plane pro Trip einen <b>Backup‑Tag</b> ein, falls du krank wirst oder sich Pläne ändern.</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Wichtiger Punkt: „Über 230 Tage“ heißt nicht „jeder Tag“</h2>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6">
                <strong className="block mb-2">Typische Fehlannahme</strong>
                <div className="text-sm">Viele denken, Silver sei „fast immer“ gültig. Tatsächlich gilt: Du hast sehr viele Besuchstage – aber eben nicht alle. Deshalb lohnt sich ein kurzer Kalender‑Check, bevor du buchst oder Urlaub einreichst.</div>
              </div>
            </section>
            <BlogCTA onSignup={handleSignup} />
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Reservierung & Zutritt</h2>
              <p className="mb-6">Je nach Regelwerk kann für den Besuch eine <b>Reservierung über das ResortPass‑Portal</b> erforderlich sein. Wer auf Nummer sicher gehen will, reserviert frühzeitig – besonders an beliebten Silver‑Tagen.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Pro‑Tipp: Silver + Kurzurlaub</h2>
              <p className="mb-6">Wenn du eh im Europa‑Park Hotel übernachtest, kannst du deinen Aufenthalt so legen, dass die Parktage in die Silver‑Gültigkeit fallen. Das spart oft deutlich im Vergleich zu einzelnen Tagestickets.</p>
            </section>
          </>
        );
      case 'resortpass-silver-vs-gold-unterschiede':
        return (
          <>
            <p className="lead text-xl text-slate-600 mb-8">Silver ist der günstige Einstieg mit fest definierten Besuchstagen. Gold ist die flexible Premium‑Variante mit Zugang an allen Öffnungstagen und zwei Rulantica‑Tagestickets. Hier kommt der Vergleich, der bei der Entscheidung wirklich hilft.</p>
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Die Unterschiede auf einen Blick</h2>
              <div className="overflow-x-auto my-6">
                <table className="w-full border-collapse border border-slate-200">
                  <thead className="bg-slate-50">
                    <tr><th className="border border-slate-200 p-4 text-left font-bold">Kriterium</th><th className="border border-slate-200 p-4 text-left font-bold">Silver</th><th className="border border-slate-200 p-4 text-left font-bold">Gold</th></tr>
                  </thead>
                  <tbody>
                    <tr><td className="border border-slate-200 p-4 text-sm font-bold">Zutritt als Tagesgast</td><td className="border border-slate-200 p-4 text-sm">über 230 definierte Öffnungstage</td><td className="border border-slate-200 p-4 text-sm">alle Öffnungstage</td></tr>
                    <tr><td className="border border-slate-200 p-4 text-sm font-bold">Spontan‑Trips</td><td className="border border-slate-200 p-4 text-sm">eingeschränkt (Kalender beachten)</td><td className="border border-slate-200 p-4 text-sm">sehr gut (max. flexibel)</td></tr>
                    <tr><td className="border border-slate-200 p-4 text-sm font-bold">Rulantica</td><td className="border border-slate-200 p-4 text-sm">nicht enthalten</td><td className="border border-slate-200 p-4 text-sm">2 Tagestickets inklusive</td></tr>
                    <tr><td className="border border-slate-200 p-4 text-sm font-bold">Partner‑Parks</td><td className="border border-slate-200 p-4 text-sm">inklusive</td><td className="border border-slate-200 p-4 text-sm">inklusive</td></tr>
                    <tr><td className="border border-slate-200 p-4 text-sm font-bold">Zielgruppe</td><td className="border border-slate-200 p-4 text-sm">Planer, Off‑Season‑Fans</td><td className="border border-slate-200 p-4 text-sm">Spontane, Peak‑Season, Resort‑Kombi</td></tr>
                  </tbody>
                </table>
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Für wen lohnt sich ResortPass Silver?</h2>
              <ul className="space-y-2 list-disc pl-6 mb-6">
                <li>Du fährst <b>mehrmals</b>, aber hauptsächlich in ruhigeren Monaten.</li>
                <li>Du kannst deine Besuche nach dem <b>Silver‑Kalender</b> planen.</li>
                <li>Du brauchst Rulantica nicht zwingend in der Jahreskarte.</li>
              </ul>
            </section>
            <BlogCTA onSignup={handleSignup} />
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Für wen lohnt sich ResortPass Gold?</h2>
              <ul className="space-y-2 list-disc pl-6 mb-6">
                <li>Du willst <b>maximale Flexibilität</b> (auch Ferien/Feiertage).</li>
                <li>Du willst Europa‑Park & Rulantica kombinieren (2 Rulantica‑Tagestickets sind enthalten).</li>
                <li>Du machst häufiger <b>spontane Tagestrips</b> oder Kurzurlaube im Resort.</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Entscheidungshilfe in 3 Fragen</h2>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6">
                <strong className="block mb-2">Quick‑Check</strong>
                <ol className="space-y-2 list-decimal pl-6 text-sm">
                  <li>Willst du in Ferien/Top‑Tagen fahren? → eher <b>Gold</b>.</li>
                  <li>Planst du 3+ Besuche, hauptsächlich außerhalb der Peaks? → oft <b>Silver</b>.</li>
                  <li>Willst du Rulantica fix dabei haben? → <b>Gold</b>.</li>
                </ol>
              </div>
            </section>
          </>
        );
      case 'resortpass-tipps-tricks-vielbesucher':
        return (
          <>
            <p className="lead text-xl text-slate-600 mb-8">Du hast (oder willst) einen ResortPass? Dann hol mit diesen Tipps mehr aus jedem Besuch raus – weniger Wartezeit, bessere Planung, mehr Erlebnisse pro Tag.</p>
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Planung & Timing</h2>
              <ul className="space-y-2 list-disc pl-6 mb-6">
                <li><b>Früh starten</b>: Die erste Stunde ist oft die ruhigste.</li>
                <li><b>Randzeiten nutzen</b>: Mittag/Spätnachmittag sind ideal für Shows oder Essen.</li>
                <li><b>Event‑Tage bewusst wählen</b>: Manche Tage sind voller, aber auch spektakulärer.</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Wartezeiten smart reduzieren</h2>
              <ul className="space-y-2 list-disc pl-6 mb-6">
                <li>Beginne mit Top‑Attraktionen in entgegengesetzter Laufrichtung.</li>
                <li>Nutze ruhigere Bereiche als „Puffer“, wenn ein Bereich überfüllt ist.</li>
                <li>Plane 1–2 „Fixpunkte“ (Must‑dos) und bleib ansonsten flexibel.</li>
              </ul>
            </section>
            <BlogCTA onSignup={handleSignup} />
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Silver‑Spezial: Maximiere deine gültigen Tage</h2>
              <ul className="space-y-2 list-disc pl-6 mb-6">
                <li>Lege Urlaub auf Silver‑Tage (Kalender checken).</li>
                <li>Fahre bewusst an Wochentagen außerhalb der Ferien.</li>
                <li>Wenn möglich: mehrere Kurzbesuche statt einen Marathon‑Tag.</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Gold‑Spezial: Rulantica clever einbauen</h2>
              <ul className="space-y-2 list-disc pl-6 mb-6">
                <li>Setze einen Rulantica‑Tag als „Erholungstag“ zwischen zwei Parktagen.</li>
                <li>Reserviere früh, wenn du an Wochenenden willst.</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Budget‑Tricks</h2>
              <ul className="space-y-2 list-disc pl-6 mb-6">
                <li>Setze ein fixes Essensbudget pro Besuch.</li>
                <li>Souvenir‑Regel: nur 1 „Lieblingsstück“ pro Saison.</li>
              </ul>
            </section>
          </>
        );
      case 'resortpass-was-ist-das':
        return (
          <>
            <p className="lead text-xl text-slate-600 mb-8">Der ResortPass ist die „Jahreskarte“ des Europa‑Park Erlebnis‑Resorts. Hier bekommst du einen schnellen, ehrlichen Überblick über Modelle, Vorteile und typische Stolperfallen (Reservierung, Gültigkeitstage, Verfügbarkeit).</p>
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Das Wichtigste in 60 Sekunden</h2>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6">
                <strong className="block mb-2">Kurzfassung</strong>
                <ul className="space-y-2 list-disc pl-6 text-sm">
                  <li><b>Silver:</b> Zutritt als Tagesgast an <b>über 230 vorab definierten Öffnungstagen</b>.</li>
                  <li><b>Gold:</b> <b>uneingeschränkter Zutritt</b> zum Europa‑Park an allen Öffnungstagen + <b>2 Tagestickets für Rulantica</b>.</li>
                  <li>Beide Modelle: <b>Partner‑Freizeitparks</b> (einmalig kostenfrei/ermäßigt), Aktionen bei Events und weitere Benefits.</li>
                  <li>Für Europa‑Park und (bei Gold auch Rulantica) kann eine <b>Reservierung über das ResortPass‑Portal</b> erforderlich sein.</li>
                </ul>
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">ResortPass Silver und Gold: die Grundidee</h2>
              <p className="mb-6">Der ResortPass richtet sich an Menschen, die den Europa‑Park öfter besuchen wollen als 1–2 Mal pro Jahr. Statt jedes Mal ein Tagesticket zu kaufen, erhältst du für <b>ein Jahr Laufzeit</b> einen wiederkehrenden Zutritt – beim Silver mit fixen Besuchstagen, beim Gold mit voller Flexibilität.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Welche Vorteile sind typischerweise enthalten?</h2>
              <div className="overflow-x-auto my-6">
                <table className="w-full border-collapse border border-slate-200">
                  <thead className="bg-slate-50">
                    <tr><th className="border border-slate-200 p-4 text-left font-bold">Leistung</th><th className="border border-slate-200 p-4 text-left font-bold">Silver</th><th className="border border-slate-200 p-4 text-left font-bold">Gold</th></tr>
                  </thead>
                  <tbody>
                    <tr><td className="border border-slate-200 p-4 text-sm font-bold">Europa‑Park als Tagesgast</td><td className="border border-slate-200 p-4 text-sm">über 230 definierte Tage</td><td className="border border-slate-200 p-4 text-sm">alle Öffnungstage</td></tr>
                    <tr><td className="border border-slate-200 p-4 text-sm font-bold">Europa‑Park als Übernachtungsgast</td><td className="border border-slate-200 p-4 text-sm">Zutritt möglich</td><td className="border border-slate-200 p-4 text-sm">Zutritt möglich</td></tr>
                    <tr><td className="border border-slate-200 p-4 text-sm font-bold">Rulantica</td><td className="border border-slate-200 p-4 text-sm">nicht enthalten</td><td className="border border-slate-200 p-4 text-sm">2 Tagestickets</td></tr>
                    <tr><td className="border border-slate-200 p-4 text-sm font-bold">Partner‑Parks</td><td className="border border-slate-200 p-4 text-sm">inkl.</td><td className="border border-slate-200 p-4 text-sm">inkl.</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-400 mb-6">Quelle: offizielle ResortPass‑Übersichten & Ticketshop‑Beschreibungen.</p>
            </section>
            <BlogCTA onSignup={handleSignup} />
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Warum „ResortPassAlarm“ sinnvoll ist</h2>
              <p className="mb-6">ResortPässe sind häufig <b>kontingentiert</b> und zeitweise nicht verfügbar. Wenn du flexibel sein willst, hilft ein Alarm‑Service: Du wirst informiert, sobald ein Verkauf wieder möglich ist – ohne täglich selbst zu prüfen.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-[#00305e] mt-8 mb-4">Praxis‑Tipp: Vor dem Kauf klären</h2>
              <ul className="space-y-2 list-disc pl-6 mb-6">
                <li>Wie oft willst du realistisch fahren – und in welchen Monaten?</li>
                <li>Brauchst du Rulantica (dann ist Gold oft die „ein Ticket für alles“-Option)?</li>
                <li>Reist du eher spontan (Gold) oder planbar (Silver)?</li>
              </ul>
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
