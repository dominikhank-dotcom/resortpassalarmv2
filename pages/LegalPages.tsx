
import React from 'react';
import { ArrowLeft, Shield, Scale, FileText, Lock } from 'lucide-react';
import { Button } from '../components/Button';

// Helper to render address as SVG data URI to prevent simple text scraping
const AddressImage = () => (
  <div className="my-4 p-4 bg-slate-50 border border-slate-200 rounded-lg inline-block">
    <img 
      src={`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="350" height="80"><text x="0" y="20" font-family="Arial, sans-serif" font-size="16" fill="%23334155">Dominik Hank</text><text x="0" y="45" font-family="Arial, sans-serif" font-size="16" fill="%23334155">Straßburger Weg 2, 77975 Ringsheim</text><text x="0" y="70" font-family="Arial, sans-serif" font-size="16" fill="%23334155">Support: Tel.: +49 176 64857291</text></svg>`} 
      alt="Anschrift und Kontakt" 
      className="block"
    />
  </div>
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
    <h3>Angaben gemäß § 5 TMG</h3>
    <p>
      Betreiber der Webseite und verantwortlich für den Inhalt:
    </p>
    <AddressImage />
    
    <h3>Kontakt</h3>
    <p>
      E-Mail: <a href="mailto:support@resortpassalarm.com">support@resortpassalarm.com</a>
    </p>

    <h3>Haftungsausschluss</h3>
    <p>
      Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
    </p>
    
    <h3>Urheberrecht</h3>
    <p>
      Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht.
    </p>
    
    <p className="text-sm text-slate-400 mt-8">
      Dieses Impressum gilt auch für unsere Social-Media-Präsenzen.
    </p>
  </LegalLayout>
);

export const PrivacyPage: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <LegalLayout title="Datenschutzerklärung" icon={<Shield size={32} />} onBack={onBack}>
    <h2>1. Datenschutz auf einen Blick</h2>
    <p>
      Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
    </p>
    <p>Verantwortliche Stelle:</p>
    <AddressImage />

    <h2>2. Datenerfassung auf unserer Website</h2>
    <h3>Hosting</h3>
    <p>Unsere Anwendung wird gehostet. Personenbezogene Daten, die auf dieser Website erfasst werden, werden auf den Servern des Hosters gespeichert.</p>
    
    <h3>Zahlungsabwicklung (Stripe)</h3>
    <p>
      Zur Abwicklung von Zahlungen nutzen wir den Dienstleister Stripe. Die Übermittlung Ihrer Zahlungsdaten an Stripe erfolgt ausschließlich zum Zwecke der Zahlungsabwicklung. Rechtsgrundlage hierfür ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
    </p>

    <h3>Benachrichtigungen (Resend & Twilio)</h3>
    <p>
      Um Ihnen E-Mail-Alarme zu senden, nutzen wir "Resend". Für SMS-Alarme nutzen wir "Twilio". Ihre E-Mail-Adresse und Telefonnummer werden an diese Dienstleister übertragen, um die Zustellung der Benachrichtigungen zu gewährleisten.
    </p>

    <h3>Künstliche Intelligenz (Google Gemini)</h3>
    <p>
      Im Rahmen des Partnerprogramms und der Administration nutzen wir KI-Dienste von Google (Gemini) zur Textgenerierung und Datenanalyse. Hierbei werden keine personenbezogenen Daten unserer Endkunden übertragen, sondern lediglich aggregierte Statistikdaten.
    </p>

    <h2>3. Ihre Rechte</h2>
    <p>
      Sie haben jederzeit das Recht unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung, Sperrung oder Löschung dieser Daten zu verlangen.
    </p>
  </LegalLayout>
);

export const TermsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <LegalLayout title="Allgemeine Geschäftsbedingungen (AGB)" icon={<Scale size={32} />} onBack={onBack}>
    <h2>1. Geltungsbereich</h2>
    <p>
      Diese AGB gelten für alle Geschäftsbeziehungen zwischen Dominik Hank (nachfolgend "Anbieter") und dem Kunden über die Nutzung des Dienstes "ResortPassAlarm".
    </p>

    <h2>2. Leistungsgegenstand</h2>
    <p>
      Der Anbieter stellt ein Software-Tool zur Verfügung, das die Verfügbarkeit von Produkten auf der Webseite des Europa-Park Resorts überwacht.
    </p>
    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-4">
      <h4 className="text-amber-800 font-bold m-0">Wichtiger Hinweis zur Leistungsgarantie</h4>
      <p className="text-amber-700 text-sm mt-2 m-0">
        Der Anbieter schuldet lediglich das Bemühen um eine Benachrichtigung (Alarm), nicht jedoch den Erfolg (d.h. den tatsächlichen Erwerb eines Tickets). Aufgrund technischer Gegebenheiten (z.B. Ausfall von Drittsystemen, Serverauslastung, Spam-Filter) kann eine rechtzeitige Zustellung des Alarms nicht zu 100% garantiert werden.
      </p>
    </div>

    <h2>3. Vertragsschluss & Preise</h2>
    <p>
      Der Vertrag kommt durch Abschluss des Bestellvorgangs und Bestätigung durch den Anbieter zustande. Der Preis für das Abonnement beträgt 1,99 € pro Monat inkl. gesetzlicher MwSt.
    </p>

    <h2>4. Haftungsausschluss & Schadenersatz</h2>
    <p>
      Es besteht kein Anspruch auf Schadenersatz oder Rückerstattung der monatlichen Gebühr, falls ein Alarm technisch bedingt ausbleibt oder der Kunde trotz Alarm kein Ticket erwerben kann (z.B. weil das Kontingent bereits erschöpft ist). Die Haftung für leichte Fahrlässigkeit ist ausgeschlossen, sofern keine wesentlichen Vertragspflichten verletzt wurden.
    </p>

    <h2>5. Laufzeit & Kündigung</h2>
    <p>
      Das Abonnement wird auf unbestimmte Zeit geschlossen. Es kann jederzeit zum Ende des aktuellen Abrechnungsmonats über das Dashboard gekündigt werden.
    </p>

    <h2>6. Partnerprogramm</h2>
    <p>
      Im Rahmen des Partnerprogramms ("Affiliate") erhalten registrierte Partner eine Provision für die Vermittlung neuer, zahlender Kunden.
    </p>
    <p>
      <strong>Ausschluss von Eigenprovisionen:</strong> Provisionen werden nur für die Vermittlung echter Dritter gewährt. Eigenwerbung (Self-Referrals) ist strikt untersagt. Dies schließt insbesondere ein:
    </p>
    <ul className="list-disc pl-5">
      <li>Anmeldung über den eigenen Partnerlink für den eigenen Bedarf.</li>
      <li>Verwendung identischer E-Mail-Adressen oder Auszahlungskonten (Stripe) für Partner- und Kundenkonto.</li>
      <li>Anmeldung von Personen, die im selben Haushalt wie der Partner leben (gleiche Anschrift).</li>
    </ul>
    <p>
      Der Anbieter behält sich das Recht vor, bei Verdacht auf Missbrauch Provisionen zu stornieren und Partnerkonten zu sperren.
    </p>
  </LegalLayout>
);

export const RevocationPage: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <LegalLayout title="Widerrufsrecht" icon={<Lock size={32} />} onBack={onBack}>
    <h2>Widerrufsbelehrung für digitale Inhalte</h2>
    <p>
      Verbraucher haben grundsätzlich ein gesetzliches Widerrufsrecht. Bei Verträgen über die Lieferung von digitalen Inhalten, die nicht auf einem körperlichen Datenträger geliefert werden, gelten jedoch besondere Regeln.
    </p>

    <div className="bg-slate-100 p-6 rounded-lg border border-slate-200 my-6">
      <h3 className="mt-0">Erlöschen des Widerrufsrechts</h3>
      <p>
        Das Widerrufsrecht erlischt bei einem Vertrag über die Lieferung von digitalen Inhalten, die sich nicht auf einem körperlichen Datenträger befinden, wenn der Unternehmer mit der Ausführung des Vertrags begonnen hat, nachdem der Verbraucher
      </p>
      <ol className="list-decimal pl-5 space-y-2">
        <li>
          ausdrücklich zugestimmt hat, dass der Unternehmer mit der Ausführung des Vertrags vor Ablauf der Widerrufsfrist beginnt, und
        </li>
        <li>
          seine Kenntnis davon bestätigt hat, dass er durch seine Zustimmung mit Beginn der Ausführung des Vertrags sein Widerrufsrecht verliert.
        </li>
      </ol>
    </div>

    <p>
      Mit Abschluss des Abonnements stimmen Sie der sofortigen Ausführung des Dienstes (Überwachung) zu und verzichten auf Ihr Widerrufsrecht, um den Service ohne Wartezeit von 14 Tagen nutzen zu können.
    </p>
    
    <h3>Muster-Widerrufsformular</h3>
    <p>(Wenn Sie den Vertrag widerrufen wollen - sofern das Recht nicht erloschen ist -, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück.)</p>
    <p>An:</p>
    <AddressImage />
    <p>E-Mail: support@resortpassalarm.com</p>
    <p>
      Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*)/die Erbringung der folgenden Dienstleistung (*)<br/><br/>
      Bestellt am (*)/erhalten am (*)<br/>
      Name des/der Verbraucher(s)<br/>
      Anschrift des/der Verbraucher(s)<br/>
      Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)<br/>
      Datum
    </p>
  </LegalLayout>
);
