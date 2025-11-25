import React from 'react';
import { ArrowLeft, Handshake, AlertTriangle } from 'lucide-react';
import { Button } from '../components/Button';

const LegalLayout: React.FC<{ title: string, icon: React.ReactNode, onBack: () => void, children: React.ReactNode }> = ({ title, icon, onBack, children }) => (
  <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-3xl mx-auto">
      <Button variant="outline" size="sm" onClick={onBack} className="mb-8">
        <ArrowLeft size={16} className="mr-2" /> Zurück zur Registrierung
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

export const PartnerTermsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <LegalLayout title="Partnerbedingungen" icon={<Handshake size={32} />} onBack={onBack}>
    <h2>1. Teilnahme am Programm</h2>
    <p>
      Mit der Registrierung als Partner akzeptieren Sie diese Teilnahmebedingungen. Es besteht kein Anspruch auf Zulassung zum Partnerprogramm. Wir behalten uns das Recht vor, Bewerbungen ohne Angabe von Gründen abzulehnen.
    </p>

    <h2>2. Werberichtlinien & Anti-Spam</h2>
    <p>
      Wir legen größten Wert auf Seriosität und einen respektvollen Umgang innerhalb der Community. Folgende Werbemaßnahmen sind streng untersagt und führen zur sofortigen Sperrung:
    </p>
    <ul>
        <li><strong>Spam:</strong> Massenhaftes Versenden von E-Mails, Direktnachrichten oder Kommentaren.</li>
        <li><strong>Unerwünschte Beiträge:</strong> Das Posten von Partnerlinks in Facebook-Gruppen, Foren, Discord-Servern oder WhatsApp-Gruppen ist nur gestattet, wenn dies ausdrücklich von den jeweiligen Administratoren der Gruppe erlaubt wurde oder den Gruppenregeln entspricht. Fragen Sie im Zweifel vorher den Admin.</li>
        <li><strong>Irreführung:</strong> Es dürfen keine falschen Versprechungen gemacht werden (z.B. "Garantierte Tickets", "Offizieller Partner des Europa-Park"). Es muss klar sein, dass es sich um ein inoffizielles Tool handelt.</li>
        <li><strong>Brand Bidding:</strong> Das Schalten von Suchmaschinenwerbung (Google Ads etc.) auf geschützte Markenbegriffe wie "Europa-Park", "Rulantica" oder "Mack International" ist untersagt.</li>
    </ul>

    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-4">
      <h4 className="text-amber-800 font-bold m-0 flex items-center gap-2"><AlertTriangle size={16}/> Wichtig</h4>
      <p className="text-amber-700 text-sm mt-2 m-0">
        Bei Verstößen gegen diese Richtlinien, insbesondere bei Spam-Beschwerden von Gruppen-Admins, wird der Partner-Account sofort und dauerhaft gesperrt. Bereits verdiente Provisionen können in diesem Fall einbehalten werden.
      </p>
    </div>

    <h2>3. Provisionen & Auszahlung</h2>
    <p>
      Die aktuelle Provisionshöhe entnehmen Sie Ihrem Dashboard. Provisionen werden auf Basis validierter Umsätze berechnet.
    </p>
    <p>
      Auszahlungen können ab einem Guthaben von 20,00 € angefordert werden. Die Auszahlung erfolgt in der Regel monatlich. Ein Anspruch auf Auszahlung besteht nur für rechtmäßig erworbene Provisionen, die nicht durch Stornierungen oder Rückbuchungen der Kunden betroffen sind.
    </p>

    <h2>4. Laufzeit & Kündigung</h2>
    <p>
      Die Partnerschaft läuft auf unbestimmte Zeit.
    </p>
    <h3>Kündigung durch den Partner</h3>
    <p>
      Sie können Ihre Teilnahme am Partnerprogramm jederzeit beenden. Noch offenes Guthaben wird zum nächsten regulären Termin ausgezahlt, sofern die Auszahlungsgrenze erreicht ist.
    </p>
    <h3>Kündigung durch den Anbieter</h3>
    <p>
      Wir behalten uns das Recht vor, jeden Partner jederzeit ohne Angabe von Gründen und ohne Einhaltung einer Frist zu kündigen. Im Falle einer ordentlichen Kündigung ohne Fehlverhalten des Partners werden noch offene, bestätigte Provisionen selbstverständlich ausgezahlt.
    </p>

    <h2>5. Änderungen der Bedingungen</h2>
    <p>
      Wir sind berechtigt, diese Teilnahmebedingungen sowie die Provisionssätze jederzeit zu ändern. Über Änderungen werden Sie per E-Mail oder im Dashboard informiert. Die fortgesetzte Teilnahme am Programm nach Inkrafttreten der Änderungen gilt als Zustimmung zu den neuen Bedingungen.
    </p>

    <h2>6. Unabhängigkeit</h2>
    <p>
      Dieses Partnerprogramm steht in keiner Verbindung zum Europa-Park Resort. Sie handeln als eigenständiger Unternehmer und sind nicht berechtigt, im Namen von ResortPassAlarm oder dem Europa-Park aufzutreten.
    </p>
  </LegalLayout>
);