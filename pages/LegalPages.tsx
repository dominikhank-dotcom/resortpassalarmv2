
import React from 'react';
import { ArrowLeft, Shield, Scale, FileText, Lock } from 'lucide-react';
import { Button } from '../components/Button';

// Helper to render Name as SVG data URI to prevent simple text scraping
const NameAsImage = () => (
    <img 
      src={`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="18"><text x="0" y="14" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="%23334155">Dominik Hank</text></svg>`} 
      alt="Dominik Hank" 
      className="inline-block align-bottom"
      style={{ height: '16px' }}
    />
);

const LegalLayout: React.FC<{ title: string, icon: React.ReactNode, onBack: () => void, children: React.ReactNode }> = ({ title, icon, onBack, children }) => (
  <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-3xl mx-auto">
      <Button variant="outline" size="sm" onClick={onBack} className="mb-8">
        <ArrowLeft size={16} className="mr-2" /> Zurück
      </Button>
      
      <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
        <div className="bg-[#00305e] p-8 text-white flex items-center gap-4">
          <div className="bg-white/10 p-3 rounded-xl">
            {icon}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
        </div>
        <div className="p-8 md:p-12 prose prose-slate max-w-none">
          {children}
        </div>
      </div>
    </div>
  </div>
);

export const ImprintPage: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <LegalLayout title="Impressum" icon={<FileText size={32} />} onBack={onBack}>
    <section id="impressum">
      <p>Angaben gemäß § 5 TMG</p>

      <p>
        <strong>ResortPassAlarm</strong><br />
        c/o Block Services<br />
        Stuttgarter Str. 106<br />
        70736 Fellbach<br />
        Deutschland
      </p>

      <p>
        <strong>Inhaber:</strong><br />
        <NameAsImage />
      </p>

      <p>
        <strong>Kontakt:</strong><br />
        E-Mail: <a href="mailto:support@resortpassalarm.com">support@resortpassalarm.com</a>
      </p>

      <p>
        <strong>Umsatzsteuer-ID:</strong><br />
        Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
        DE224296401
      </p>

      <h2>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
      <p>
        <NameAsImage /><br />
        c/o Block Services<br />
        Stuttgarter Str. 106<br />
        70736 Fellbach<br />
        Deutschland
      </p>

      <h2>Streitschlichtung</h2>
      <p>
        Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
        <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="ml-1">
          https://ec.europa.eu/consumers/odr
        </a>
      </p>
      <p>
        Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer
        Verbraucherschlichtungsstelle teilzunehmen.
      </p>

      <h2>Haftung für Inhalte</h2>
      <p>
        Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten
        nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als
        Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
        Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
        Tätigkeit hinweisen.
      </p>

      <h2>Haftung für Links</h2>
      <p>
        Unser Angebot enthält ggf. Links zu externen Websites Dritter, auf deren Inhalte wir
        keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr
        übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder
        Betreiber der Seiten verantwortlich.
      </p>

      <h2>Urheberrecht</h2>
      <p>
        Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
        dem deutschen Urheberrecht. Beiträge Dritter sind als solche gekennzeichnet.
      </p>
    </section>
  </LegalLayout>
);

export const PrivacyPage: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <LegalLayout title="Datenschutzerklärung" icon={<Shield size={32} />} onBack={onBack}>
    <section id="datenschutzerklaerung">
      <p>Stand: 22. Dezember 2025</p>

      <h2>1. Allgemeine Hinweise zum Datenschutz</h2>
      <p>
        Wir nehmen den Schutz Ihrer personenbezogenen Daten sehr ernst. Personenbezogene Daten sind alle Daten, mit denen Sie
        persönlich identifiziert werden können. Wir verarbeiten personenbezogene Daten nur, soweit dies zur Bereitstellung
        unserer Website und zur Erbringung unserer Leistungen erforderlich ist oder Sie in die Verarbeitung eingewilligt haben.
        Die Verarbeitung erfolgt im Einklang mit der Datenschutz-Grundverordnung (DSGVO) sowie den einschlägigen deutschen
        Datenschutzgesetzen.
      </p>

      <h2>2. Verantwortliche Stelle</h2>
      <p><strong>Verantwortlicher</strong> im Sinne der DSGVO ist:</p>
      <address className="not-italic bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6">
        <strong>ResortPassAlarm</strong><br />
        c/o Block Services<br />
        Stuttgarter Str. 106<br />
        70736 Fellbach<br />
        Deutschland<br /><br />
        Inhaber: <NameAsImage /><br />
        USt-ID: DE224296401<br /><br />
        E-Mail (Support/Datenschutzanfragen): <a href="mailto:support@resortpassalarm.com">support@resortpassalarm.com</a>
      </address>
      <p>
        <em>Hinweis:</em> Es ist kein Datenschutzbeauftragter bestellt, da hierfür nach den gesetzlichen Vorgaben keine
        Verpflichtung besteht.
      </p>

      <h2>3. Begriffe</h2>
      <p>
        Diese Datenschutzerklärung verwendet Begriffe der DSGVO (z. B. „personenbezogene Daten“, „Verarbeitung“,
        „Verantwortlicher“, „Auftragsverarbeiter“). Die entsprechenden Definitionen finden sich in Art. 4 DSGVO.
      </p>

      <h2>4. Rechtsgrundlagen der Verarbeitung</h2>
      <p>Wir verarbeiten personenbezogene Daten auf Basis folgender Rechtsgrundlagen:</p>
      <ul>
        <li><strong>Art. 6 Abs. 1 lit. b DSGVO</strong> (Vertrag/vertragsähnliche Maßnahmen), z. B. bei Registrierung, Abo-Verwaltung, Alerts.</li>
        <li><strong>Art. 6 Abs. 1 lit. c DSGVO</strong> (rechtliche Verpflichtung), z. B. handels- und steuerrechtliche Aufbewahrungspflichten.</li>
        <li><strong>Art. 6 Abs. 1 lit. f DSGVO</strong> (berechtigte Interessen), z. B. IT-Sicherheit, Missbrauchsvermeidung, Server-Logfiles.</li>
        <li><strong>Art. 6 Abs. 1 lit. a DSGVO</strong> (Einwilligung), z. B. für Analyse/Tracking (Google Analytics) und Conversion-Tracking über Cookies/ähnliche Technologien.</li>
      </ul>

      <h2>5. Empfänger personenbezogener Daten</h2>
      <p>
        Wir setzen Dienstleister als Auftragsverarbeiter ein (Art. 28 DSGVO). Je nach Nutzung können Empfänger Ihrer Daten sein:
      </p>
      <ul>
        <li>Hosting- und Infrastruktur-Dienstleister</li>
        <li>Datenbank-/Backend-Dienstleister</li>
        <li>Zahlungsdienstleister</li>
        <li>E-Mail- und SMS-Dienstleister</li>
        <li>Analyse- und Messdienstleister</li>
        <li>Behörden/öffentliche Stellen, soweit wir dazu verpflichtet sind</li>
      </ul>

      <h2>6. Speicherdauer</h2>
      <p>
        Wir speichern personenbezogene Daten grundsätzlich nur so lange, wie es für die jeweiligen Zwecke erforderlich ist.
        Anschließend werden die Daten gelöscht oder anonymisiert, sofern keine gesetzlichen Aufbewahrungspflichten bestehen.
      </p>
      <ul>
        <li><strong>Konten ohne aktives Abo:</strong> Löschung erfolgt automatisiert (sofort nach Wegfall des Zwecks).</li>
        <li><strong>Rechnungs- und steuerrelevante Daten (bei Abo-Kunden):</strong> Aufbewahrung gemäß gesetzlichen Vorgaben (in der Regel 10 Jahre).</li>
        <li><strong>Server-Logfiles:</strong> 30 Tage.</li>
      </ul>

      <h2>7. Ihre Rechte</h2>

      <h3>7.1 Auskunft, Berichtigung, Löschung</h3>
      <p>
        Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16 DSGVO) sowie Löschung (Art. 17 DSGVO) Ihrer
        personenbezogenen Daten, soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
      </p>

      <h3>7.2 Einschränkung der Verarbeitung</h3>
      <p>
        Sie haben das Recht, die Einschränkung der Verarbeitung zu verlangen (Art. 18 DSGVO), z. B. wenn Sie die Richtigkeit
        Ihrer Daten bestreiten oder die Verarbeitung unrechtmäßig ist.
      </p>

      <h3>7.3 Recht auf Datenübertragbarkeit</h3>
      <p>
        Sie haben das Recht, Daten, die wir auf Grundlage Ihrer Einwilligung oder zur Vertragserfüllung automatisiert verarbeiten,
        in einem gängigen, maschinenlesbaren Format zu erhalten oder an einen Dritten übertragen zu lassen (Art. 20 DSGVO).
      </p>

      <h3>7.4 Widerruf von Einwilligungen</h3>
      <p>
        Sofern eine Verarbeitung auf Ihrer Einwilligung beruht, können Sie diese jederzeit mit Wirkung für die Zukunft widerrufen
        (Art. 7 Abs. 3 DSGVO). Die Rechtmäßigkeit der bis zum Widerruf erfolgten Verarbeitung bleibt unberührt.
      </p>

      <h3>7.5 Widerspruchsrecht (Art. 21 DSGVO)</h3>
      <p>
        <strong>Widerspruch aus besonderen Gründen:</strong> Sie können aus Gründen, die sich aus Ihrer besonderen Situation ergeben,
        jederzeit gegen die Verarbeitung Ihrer personenbezogenen Daten Widerspruch einlegen, soweit diese auf Art. 6 Abs. 1 lit. f
        DSGVO beruht. Wir verarbeiten die Daten dann nicht mehr, es sei denn, wir können zwingende schutzwürdige Gründe nachweisen.
      </p>
      <p>
        <strong>Widerspruch gegen Direktwerbung:</strong> Sie können jederzeit Widerspruch gegen die Verarbeitung zum Zwecke der
        Direktwerbung einlegen. <em>Wir versenden keine Werbe-E-Mails.</em> Sollten Sie dennoch Werbemitteilungen erhalten, können
        Sie diesen jederzeit widersprechen.
      </p>

      <h3>7.6 Beschwerderecht bei der Aufsichtsbehörde</h3>
      <p>
        Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren (Art. 77 DSGVO), insbesondere in dem
        Mitgliedstaat Ihres gewöhnlichen Aufenthalts, Ihres Arbeitsplatzes oder des Ortes des mutmaßlichen Verstoßes.
      </p>

      <h2>8. Datensicherheit (SSL/TLS)</h2>
      <p>
        Diese Website nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte (z. B. Bestellungen,
        Zahlungsprozesse) eine SSL-/TLS-Verschlüsselung. Sie erkennen eine verschlüsselte Verbindung u. a. an „https://“ in der
        Adresszeile Ihres Browsers.
      </p>

      <h2>9. Bereitstellung der Website und Server-Logfiles</h2>
      <p>
        Beim Aufruf der Website werden durch unseren Hosting-Anbieter Informationen in Server-Logfiles verarbeitet, die Ihr Browser
        automatisch übermittelt. Dies ist technisch erforderlich, um die Website bereitzustellen und die Sicherheit zu gewährleisten.
      </p>
      <p><strong>Verarbeitete Daten:</strong></p>
      <ul>
        <li>IP-Adresse</li>
        <li>Datum und Uhrzeit der Anfrage</li>
        <li>Browsertyp/-version, Betriebssystem</li>
      </ul>
      <p><strong>Zwecke:</strong> Auslieferung der Website, IT-Sicherheit, Fehleranalyse, Missbrauchsabwehr.</p>
      <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).</p>
      <p><strong>Speicherdauer:</strong> 30 Tage.</p>

      <h2>10. Kundenkonto, Registrierung und Vertragsabwicklung (Abo)</h2>
      <p>
        Wir bieten Endkunden ein Abonnement an, mit dem die Verfügbarkeit bestimmter Resortpässe (Silver/Gold) überwacht und
        Benachrichtigungen ausgelöst werden können. Das Abo läuft 1 Monat und verlängert sich automatisch; es ist monatlich kündbar
        (Kündigung im Nutzerkonto).
      </p>

      <p><strong>Verarbeitete Daten (je nach Eingabe):</strong></p>
      <ul>
        <li>E-Mail-Adresse</li>
        <li>Vorname und Nachname</li>
        <li>Telefonnummer (für SMS-Alerts)</li>
        <li>Rechnungsadresse</li>
        <li>Passwort/Login-Daten (zur Authentifizierung)</li>
      </ul>

      <p><strong>Zwecke:</strong> Kontoerstellung, Authentifizierung, Vertragsdurchführung, Abrechnung, Support, Versand von Service-Mitteilungen.</p>
      <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertrag/vertragsähnliche Maßnahmen).</p>

      <h2>11. Zahlungsabwicklung (Stripe)</h2>
      <p>
        Für Zahlungen nutzen wir den Zahlungsdienstleister Stripe. Die Zahlungsabwicklung erfolgt über Stripe; Zahlungsdaten werden
        nicht auf unseren Servern gespeichert.
      </p>
      <p><strong>Zahlungsmethoden (je nach Verfügbarkeit):</strong> Kreditkarte, Apple Pay / Google Pay, Klarna.</p>
      <p><strong>Verarbeitete Daten:</strong> z. B. Name, Rechnungsadresse, Transaktionsdaten, ggf. Geräte-/Sicherheitsinformationen.</p>
      <p><strong>Zwecke:</strong> Zahlungsabwicklung, Betrugsprävention, Buchhaltung.</p>
      <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertrag) und ggf. Art. 6 Abs. 1 lit. f DSGVO (Betrugsprävention).</p>

      <h2>12. E-Mail-Versand (Resend)</h2>
      <p>
        Für den Versand von E-Mails (z. B. Vertrags- und Service-Informationen) nutzen wir den Dienst Resend.
        Es erfolgt kein Versand von Werbe-E-Mails.
      </p>
      <p><strong>Verarbeitete Daten:</strong> E-Mail-Adresse, Inhalte der E-Mail, ggf. technische Metadaten (z. B. Zustellstatus).</p>
      <p><strong>Zwecke:</strong> Zustellung von Service- und Vertragsinformationen.</p>
      <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertrag).</p>

      <h2>13. SMS-Alarme (Twilio)</h2>
      <p>
        Für SMS-Alerts nutzen wir Twilio. Die SMS dienen ausschließlich der vertraglich geschuldeten Benachrichtigung (Service/Alerts),
        nicht zu Werbezwecken.
      </p>
      <p><strong>Verarbeitete Daten:</strong> Telefonnummer, SMS-Inhalt, Zustell-/Routingdaten.</p>
      <p><strong>Zwecke:</strong> Zustellung der SMS-Benachrichtigungen.</p>
      <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertrag).</p>

      <h2>14. Datenbank/Backend (Supabase)</h2>
      <p>
        Zur Speicherung und Verarbeitung von Kundendaten nutzen wir Supabase in einer EU-Region (Frankfurt).
      </p>
      <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertrag) sowie Art. 6 Abs. 1 lit. f DSGVO (sichere und effiziente Bereitstellung).</p>

      <h2>15. Hosting/Deployment (Vercel)</h2>
      <p>
        Das Hosting der Website erfolgt über Vercel. Dabei kann es zur Verarbeitung personenbezogener Daten in den USA kommen
        (z. B. bei der Auslieferung der Website und in Logfiles).
      </p>
      <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an sicherer, stabiler Bereitstellung).</p>

      <h2>16. Cookies, Einwilligungsmanagement</h2>
      <p>
        Wir verwenden ein selbst entwickeltes Einwilligungs-/Consent-Management, um – sofern erforderlich – Ihre Einwilligung
        für Analyse- und Messdienste einzuholen. Nicht notwendige Cookies/Technologien werden erst nach Einwilligung gesetzt.
      </p>
      <p>
        Sie können eine erteilte Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen, indem Sie Ihre Cookie-Einstellungen
        entsprechend ändern (z. B. über die Einwilligungsverwaltung auf der Website) oder Cookies in Ihrem Browser löschen.
      </p>

      <h2>17. Google Analytics</h2>
      <p>
        Wir nutzen Google Analytics, um die Nutzung unserer Website zu analysieren und zu verbessern. Die Verarbeitung erfolgt nur
        nach Ihrer Einwilligung über das Consent-Management.
      </p>
      <p><strong>Konfiguration/Schutzmaßnahmen:</strong></p>
      <ul>
        <li>IP-Anonymisierung aktiviert</li>
        <li>Google Signals deaktiviert</li>
        <li>Datenfreigaben an Google eingeschränkt</li>
        <li>Auftragsverarbeitungsvertrag (AVV) mit Google abgeschlossen</li>
      </ul>
      <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).</p>
      <p><strong>Datenübermittlung in Drittländer:</strong> möglich (z. B. USA); Absicherung über Standardvertragsklauseln (SCC).</p>

      <h2>18. Google Ads &amp; Conversion-Tracking</h2>
      <p>
        Wir nutzen Google Ads und Google Conversion-Tracking, um die Wirksamkeit unserer Werbemaßnahmen zu messen. Dabei setzen wir
        Conversion-Tracking <strong>ohne Profilbildung</strong> ein. Remarketing und personalisierte Werbung werden nicht genutzt.
        Die Verarbeitung erfolgt nur nach Ihrer Einwilligung.
      </p>
      <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).</p>
      <p><strong>Datenübermittlung in Drittländer:</strong> möglich (z. B. USA); Absicherung über Standardvertragsklauseln (SCC).</p>

      <h2>19. Newsletter (Service-Informationen)</h2>
      <p>
        Wir bieten einen Newsletter an, der ausschließlich <strong>Service-Informationen</strong> (z. B. Vertragsinfos) enthält.
        Die Anmeldung erfolgt im Double-Opt-in-Verfahren. Für den Versand nutzen wir Resend.
      </p>
      <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).</p>
      <p><strong>Widerruf:</strong> Sie können den Newsletter jederzeit abbestellen (z. B. über den Abmeldelink oder per E-Mail an <a href="mailto:support@resortpassalarm.com">support@resortpassalarm.com</a>).</p>

      <h2>20. KI-Dienste (Google Gemini) – nur aggregierte Daten</h2>
      <p>
        Im Rahmen des Partnerprogramms und der Administration nutzen wir KI-Dienste von Google (Gemini) zur Textgenerierung und Datenanalyse.
        Dabei werden <strong>keine personenbezogenen Daten unserer Endkunden</strong> an Gemini übermittelt, sondern ausschließlich
        aggregierte Statistikdaten.
      </p>
      <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an effizienter Administration/Analyse).</p>

      <h2>21. Übermittlung in Drittländer (insbesondere USA)</h2>
      <p>
        Einige unserer Dienstleister verarbeiten Daten in den USA (z. B. Vercel, Resend, Twilio, ggf. Google). Für diese
        Drittlandübermittlungen nutzen wir geeignete Garantien, insbesondere <strong>Standardvertragsklauseln (SCC)</strong>,
        um ein angemessenes Datenschutzniveau sicherzustellen.
      </p>
      <p>
        <strong>Hinweis zu Auftragsverarbeitung:</strong> Wir sind bestrebt, mit allen eingesetzten Dienstleistern die erforderlichen
        Vereinbarungen zur Auftragsverarbeitung (Art. 28 DSGVO) abzuschließen bzw. aktuell zu halten.
      </p>

      <h2>22. Keine Kontaktformulare, keine Social-Media-Plugins</h2>
      <p>
        Wir stellen derzeit kein Kontaktformular bereit und verwenden keine Social-Media-Plugins oder externen Social-Media-Einbindungen.
      </p>

      <h2>23. Aktualität und Änderungen</h2>
      <p>
        Wir können diese Datenschutzerklärung anpassen, wenn sich Rechtslage, unsere Website oder Datenverarbeitungen ändern.
        Es gilt die jeweils auf dieser Website veröffentlichte Fassung.
      </p>
    </section>
  </LegalLayout>
);

export const TermsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <LegalLayout title="Allgemeine Geschäftsbedingungen (AGB)" icon={<Scale size={32} />} onBack={onBack}>
    <section id="agb">
      <p>Stand: 22. Dezember 2025</p>

      <h2>1. Geltungsbereich</h2>
      <p>
        Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen
        <strong> ResortPassAlarm</strong>, Inhaber <NameAsImage />, c/o Block Services,
        Stuttgarter Str. 106, 70736 Fellbach, Deutschland
        (nachfolgend „Anbieter“)
        und Verbrauchern (§ 13 BGB), die über die Website
        <strong> www.resortpassalarm.com</strong> abgeschlossen werden.
      </p>

      <h2>2. Vertragsgegenstand</h2>
      <p>
        Der Anbieter stellt eine digitale Dienstleistung zur Verfügung, mit der Kunden die
        Verfügbarkeit bestimmter Resortpässe (Silver und Gold) des Europa-Park überwachen
        lassen und bei Verfügbarkeit per E-Mail und/oder SMS benachrichtigt werden.
      </p>
      <p>
        Es handelt sich ausdrücklich nicht um einen Ticketverkauf oder eine Garantie für den
        Erwerb von Resortpässen.
      </p>

      <h2>3. Vertragsschluss</h2>
      <p>
        Der Vertrag kommt durch Abschluss des Bestellvorgangs auf der Website zustande.
        Durch Anklicken des Buttons
        <strong> „zahlungspflichtig abonnieren“</strong>
        gibt der Kunde ein verbindliches Angebot zum Abschluss eines Vertrags ab.
      </p>
      <p>
        Der Anbieter bestätigt den Vertragsschluss per E-Mail.
      </p>

      <h2>4. Nutzerkonto</h2>
      <p>
        Zur Nutzung der Dienstleistung ist die Erstellung eines Nutzerkontos erforderlich.
        Die Zugangsdaten sind vertraulich zu behandeln und dürfen nicht an Dritte
        weitergegeben werden.
      </p>

      <h2>5. Leistungen &amp; Verfügbarkeit</h2>
      <p>
        Der Anbieter bemüht sich um eine hohe Verfügbarkeit der Dienstleistung,
        übernimmt jedoch keine Garantie für eine unterbrechungsfreie oder fehlerfreie
        Nutzung.
      </p>
      <p>
        Wartungsarbeiten, technische Störungen oder Ereignisse außerhalb des Einflussbereichs
        des Anbieters können zu vorübergehenden Einschränkungen führen.
      </p>

      <h2>6. Preise und Zahlung</h2>
      <p>
        Die angegebenen Preise verstehen sich als Endpreise inklusive der gesetzlichen
        Umsatzsteuer.
      </p>
      <p>
        Die Zahlung erfolgt monatlich im Voraus über den Zahlungsdienstleister Stripe
        (z. B. Kreditkarte, Apple Pay / Google Pay, Klarna).
      </p>

      <h2>7. Laufzeit, Verlängerung und Kündigung</h2>
      <p>
        Das Abonnement hat eine Laufzeit von einem Monat und verlängert sich automatisch
        jeweils um einen weiteren Monat, sofern es nicht vor Ablauf gekündigt wird.
      </p>
      <p>
        Die Kündigung kann jederzeit zum Ende des jeweiligen Abrechnungsmonats
        über das Nutzerkonto erfolgen.
      </p>

      <h2>8. Widerrufsrecht</h2>
      <p>
        Verbrauchern steht grundsätzlich ein Widerrufsrecht zu.
        Einzelheiten ergeben sich aus der
        <button onClick={() => window.scrollTo(0,0)} className="text-blue-600 underline font-medium mx-1">Widerrufsbelehrung</button>.
      </p>
      <p>
        Das Widerrufsrecht erlischt bei digitalen Dienstleistungen vorzeitig,
        wenn der Kunde ausdrücklich zugestimmt hat, dass der Anbieter vor Ablauf
        der Widerrufsfrist mit der Ausführung des Vertrags beginnt, und der Kunde
        seine Kenntnis vom Erlöschen des Widerrufsrechts bestätigt hat.
      </p>

      <h2>9. Pflichten des Kunden</h2>
      <p>
        Der Kunde verpflichtet sich, bei der Registrierung wahrheitsgemäße Angaben zu machen
        und Änderungen unverzüglich zu aktualisieren.
      </p>
      <p>
        Eine missbräuchliche Nutzung der Dienstleistung ist untersagt.
      </p>

      <h2>10. Haftung</h2>
      <p>
        Der Anbieter haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei
        Verletzung von Leben, Körper oder Gesundheit.
      </p>
      <p>
        Bei einfacher Fahrlässigkeit haftet der Anbieter nur bei Verletzung wesentlicher
        Vertragspflichten (Kardinalpflichten) und beschränkt auf den vertragstypischen,
        vorhersehbaren Schaden.
      </p>

      <h2>11. Datenschutz</h2>
      <p>
        Informationen zur Verarbeitung personenbezogener Daten sind in der
        <button onClick={() => window.scrollTo(0,0)} className="text-blue-600 underline font-medium mx-1">Datenschutzerklärung</button>
        abrufbar.
      </p>

      <h2>12. Änderungen der AGB</h2>
      <p>
        Der Anbieter behält sich vor, diese AGB anzupassen, sofern dies aus rechtlichen,
        technischen oder wirtschaftlichen Gründen erforderlich ist.
      </p>

      <h2>13. Schlussbestimmungen</h2>
      <p>
        Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.
      </p>
      <p>
        Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit der
        übrigen Bestimmungen unberührt.
      </p>
    </section>
  </LegalLayout>
);

export const RevocationPage: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <LegalLayout title="Widerrufsbelehrung" icon={<Lock size={32} />} onBack={onBack}>
    <section id="widerrufsbelehrung">
      <p>Stand: 22. Dezember 2025</p>

      <h2>Widerrufsrecht</h2>
      <p>
        Verbraucher haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.
      </p>

      <p>
        Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.
      </p>

      <p>
        Um Ihr Widerrufsrecht auszuüben, müssen Sie uns
      </p>

      <address className="not-italic bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6">
        <strong>ResortPassAlarm</strong><br />
        Inhaber: <NameAsImage /><br />
        c/o Block Services<br />
        Stuttgarter Str. 106<br />
        70736 Fellbach<br />
        Deutschland<br /><br />
        E-Mail: <a href="mailto:support@resortpassalarm.com">support@resortpassalarm.com</a>
      </address>

      <p>
        mittels einer eindeutigen Erklärung (z. B. per E-Mail) über Ihren Entschluss,
        diesen Vertrag zu widerrufen, informieren.
      </p>

      <h2>Folgen des Widerrufs</h2>
      <p>
        Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben,
        unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über
        Ihren Widerruf dieses Vertrags bei uns eingegangen ist.
      </p>
      <p>
        Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion
        eingesetzt haben; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.
      </p>

      <h2>Erlöschen des Widerrufsrechts</h2>
      <p>
        Das Widerrufsrecht erlischt bei einem Vertrag über die Erbringung digitaler Dienstleistungen,
        wenn wir mit der Ausführung des Vertrags begonnen haben, nachdem
      </p>
      <ul>
        <li>Sie ausdrücklich zugestimmt haben, dass wir mit der Ausführung des Vertrags vor Ablauf der Widerrufsfrist beginnen, und</li>
        <li>Sie Ihre Kenntnis davon bestätigt haben, dass Sie durch Ihre Zustimmung mit Beginn der Ausführung des Vertrags Ihr Widerrufsrecht verlieren.</li>
      </ul>

      <p>
        Dies ist bei ResortPassAlarm der Fall, da die digitale Dienstleistung (Monitoring und Benachrichtigungen)
        unmittelbar nach Vertragsschluss bereitgestellt wird.
      </p>

      <h2>Muster-Widerrufsformular</h2>
      <p>
        (Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es per E-Mail an uns.)
      </p>

      <div className="bg-slate-50 p-8 rounded-2xl border border-dashed border-slate-300 font-mono text-sm">
        <p>
          An:<br />
          ResortPassAlarm<br />
          c/o Block Services<br />
          Stuttgarter Str. 106<br />
          70736 Fellbach<br />
          Deutschland<br />
          E-Mail: support@resortpassalarm.com
        </p>

        <p className="mt-6">
          Hiermit widerrufe ich den von mir abgeschlossenen Vertrag über die Erbringung der folgenden Dienstleistung:
        </p>

        <p className="mt-4">
          Bestellt am / erhalten am: _______________________
        </p>

        <p>
          Name des Verbrauchers: _______________________
        </p>

        <p>
          Anschrift des Verbrauchers: _______________________
        </p>

        <p>
          Datum: _______________________
        </p>

        <p className="mt-8">
          Unterschrift des Verbrauchers (nur bei Mitteilung auf Papier): _______________________
        </p>
      </div>

      <h2 className="mt-12">Hinweis</h2>
      <p>
        Das Widerrufsrecht besteht ausschließlich für Verbraucher im Sinne des § 13 BGB.
      </p>
    </section>
  </LegalLayout>
);
