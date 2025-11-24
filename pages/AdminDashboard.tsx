import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, Settings, Briefcase, 
  TrendingUp, DollarSign, Activity, Calendar, 
  Search, Save, Database, CreditCard, Mail, MessageSquare, 
  Sparkles, Download, AlertCircle, CheckCircle, Globe, Key,
  ArrowLeft, RotateCcw, AlertTriangle, UserX, UserCheck, Ban,
  Wifi, Edit3, Eye, Send, X, Copy, Terminal, Gift, Lock, Shield
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend 
} from 'recharts';
import { Button } from '../components/Button';
import { generateAdminInsights } from '../services/geminiService';
import { sendTestAlarm, sendTemplateTest, testBrowseAiConnection, testGeminiConnection } from '../services/backendService';
import { EmailTemplate } from '../types';

// --- Mock Data ---
const DASHBOARD_DATA = [
  { date: '01.05', revenue: 450, growth: 12 },
  { date: '05.05', revenue: 680, growth: 25 },
  { date: '10.05', revenue: 1200, growth: 45 },
  { date: '15.05', revenue: 1800, growth: 80 },
  { date: '20.05', revenue: 2400, growth: 120 },
  { date: '25.05', revenue: 3100, growth: 160 },
  { date: '30.05', revenue: 4200, growth: 210 },
];

const CUSTOMERS_LIST = [
  { id: 'KD-1001', name: 'Max Mustermann', email: 'max@test.de', status: 'Active', joined: '12.05.2024' },
  { id: 'KD-1002', name: 'Sarah Schmidt', email: 'sarah@web.de', status: 'Active', joined: '14.05.2024' },
  { id: 'KD-1003', name: 'Michael Weber', email: 'm.weber@gmx.de', status: 'Inactive', joined: '01.04.2024' },
  { id: 'KD-1004', name: 'Lisa Müller', email: 'lisa.m@gmail.com', status: 'Active', joined: '20.05.2024' },
  { id: 'KD-1005', name: 'Tom Bauer', email: 'tom.b@yahoo.com', status: 'Inactive', joined: '10.02.2024' },
];

// Detailed Mock Data Generator
const generateCustomerDetails = (summary: any) => {
  return {
    ...summary,
    firstName: summary.name.split(' ')[0],
    lastName: summary.name.split(' ')[1],
    address: { street: 'Musterstraße', houseNumber: '1', zip: '12345', city: 'Berlin', country: 'Deutschland' },
    subscription: {
      status: summary.status,
      startDate: summary.joined,
      endDate: summary.status === 'Inactive' ? '20.06.2024' : null,
      plan: 'Monatsabo (1,99 €)',
      isFree: false, // New field for manual override
      paymentMethod: 'PayPal (max...@test.de)'
    },
    referrer: summary.id === 'KD-1001' ? { name: 'Freizeitpark News DE', id: 'P-502', date: '12.05.2024' } : null,
    transactions: [
      { id: 'TX-901', date: '2024-06-12', amount: 1.99, status: 'Paid' },
      { id: 'TX-804', date: '2024-05-12', amount: 1.99, status: 'Paid' },
      { id: 'TX-702', date: '2024-04-12', amount: 1.99, status: 'Refunded' },
    ]
  };
};

const PARTNER_TOP_10 = [
  { rank: 1, name: 'Freizeitpark News DE', revenue: 12400.50, conversions: 450 },
  { rank: 2, name: 'RollerCoaster Girl', revenue: 8200.00, conversions: 310 },
  { rank: 3, name: 'EP Fanclub Süd', revenue: 5100.25, conversions: 180 },
  { rank: 4, name: 'ThemePark Traveller', revenue: 3200.00, conversions: 110 },
  { rank: 5, name: 'Achterbahn Junkies', revenue: 1800.50, conversions: 65 },
];

const CONVERSION_QUALITY_DATA = [
  { source: 'Instagram', clicks: 5000, conversions: 120 },
  { source: 'TikTok', clicks: 8000, conversions: 80 },
  { source: 'Blog/SEO', clicks: 2000, conversions: 150 },
  { source: 'YouTube', clicks: 3000, conversions: 110 },
  { source: 'Newsletter', clicks: 1000, conversions: 90 },
];

// --- EMAIL TEMPLATES DEFAULT DATA ---
const DEFAULT_TEMPLATES: EmailTemplate[] = [
  // --- CUSTOMER EMAILS ---
  {
    id: 'cust_welcome',
    name: 'Registrierungs-Mail',
    description: 'Wird nach der Registrierung eines neuen Kundenkontos versendet.',
    category: 'CUSTOMER',
    subject: 'Willkommen bei ResortPassAlarm, {firstName}!',
    body: `<h1>Hallo {firstName},</h1>
<p>Willkommen an Bord! Dein Account wurde erfolgreich erstellt.</p>
<p>Du bist jetzt bereit, deine Überwachung zu starten. Logge dich in dein Dashboard ein, um dein Abo zu aktivieren und keine Wellen mehr zu verpassen.</p>
<p><a href="{loginLink}">Zum Login</a></p>
<p>Dein ResortPassAlarm Team</p>`,
    variables: ['{firstName}', '{loginLink}'],
    isEnabled: true
  },
  {
    id: 'cust_pw_reset',
    name: 'Passwort vergessen',
    description: 'Versendet, wenn ein Kunde sein Passwort zurücksetzen möchte.',
    category: 'CUSTOMER',
    subject: 'Passwort zurücksetzen',
    body: `<p>Hallo {firstName},</p>
<p>Wir haben eine Anfrage erhalten, dein Passwort zurückzusetzen.</p>
<p>Klicke auf den folgenden Link, um ein neues Passwort festzulegen:</p>
<p><a href="{resetLink}">Passwort zurücksetzen</a></p>
<p>Falls du das nicht warst, kannst du diese E-Mail ignorieren.</p>`,
    variables: ['{firstName}', '{resetLink}'],
    isEnabled: true
  },
  {
    id: 'cust_sub_active',
    name: 'Abo aktiviert',
    description: 'Bestätigung nach erfolgreichem Abschluss des Abos.',
    category: 'CUSTOMER',
    subject: 'Dein Premium-Schutz ist aktiv! 🛡️',
    body: `<h1>Das ging schnell!</h1>
<p>Danke {firstName}, deine Zahlung war erfolgreich.</p>
<p>Die Überwachung für ResortPass Gold & Silver ist ab sofort <strong>AKTIV</strong>.</p>
<p>Wir prüfen die Europa-Park Seite nun rund um die Uhr für dich. Stelle sicher, dass deine Handy-Nummer für SMS-Alarme hinterlegt ist.</p>
<p><a href="{dashboardLink}">Zum Dashboard</a></p>`,
    variables: ['{firstName}', '{dashboardLink}'],
    isEnabled: true
  },
  {
    id: 'cust_sub_expired',
    name: 'Abo abgelaufen / Fehlgeschlagen',
    description: 'Info, wenn die Zahlung fehlschlägt oder das Abo endet.',
    category: 'CUSTOMER',
    subject: 'Wichtig: Dein Schutz ist inaktiv',
    body: `<p>Hallo {firstName},</p>
<p>Leider konnten wir dein Abo für den ResortPassAlarm nicht verlängern.</p>
<p><strong>Deine Überwachung ist aktuell pausiert.</strong> Du erhältst keine Alarme mehr, wenn Tickets verfügbar sind.</p>
<p>Bitte überprüfe deine Zahlungsmethode, um den Schutz zu reaktivieren:</p>
<p><a href="{dashboardLink}">Zahlungsdaten prüfen</a></p>`,
    variables: ['{firstName}', '{dashboardLink}'],
    isEnabled: true
  },
  {
    id: 'cust_alarm_test',
    name: 'Test-Alarm',
    description: 'Wird versendet, wenn der Nutzer "Test-Alarm senden" klickt.',
    category: 'CUSTOMER',
    subject: '🔔 TEST-ALARM: ResortPass Wächter',
    body: `<h1>Funktionstest erfolgreich!</h1>
<p>Hallo {firstName},</p>
<p>Dies ist ein <strong>Test-Alarm</strong> von deinem ResortPass Wächter.</p>
<p>Wenn du diese Mail liest, sind deine Einstellungen korrekt. Wir benachrichtigen dich sofort, wenn Tickets verfügbar sind.</p>`,
    variables: ['{firstName}'],
    isEnabled: true
  },
  {
    id: 'cust_alarm_real',
    name: 'ECHT ALARM (Verfügbar)',
    description: 'Die wichtigste Mail: Wenn Tickets gefunden wurden.',
    category: 'CUSTOMER',
    subject: '🚨 {productName} VERFÜGBAR! SCHNELL SEIN!',
    body: `<h1 style="color: #d97706;">ALARM STUFE ROT!</h1>
<p>Hallo {firstName},</p>
<p>Unser System hat soeben freie Kontingente für <strong>{productName}</strong> gefunden!</p>
<p>Die "Wellen" sind oft nur wenige Minuten offen. Handele sofort!</p>
<a href="{shopLink}" style="background-color: #00305e; color: white; padding: 15px 25px; text-decoration: none; font-weight: bold; font-size: 18px; border-radius: 5px; display: inline-block; margin: 10px 0;">ZUM TICKET SHOP</a>
<p>Oder kopiere diesen Link: {shopLink}</p>
<p>Viel Erfolg!<br>Dein Wächter</p>`,
    variables: ['{firstName}', '{productName}', '{shopLink}'],
    isEnabled: true
  },
  // --- PARTNER EMAILS ---
  {
    id: 'part_register',
    name: 'Partner Registrierung',
    description: 'Willkommensmail für neue Affiliates.',
    category: 'PARTNER',
    subject: 'Willkommen im Partnerprogramm',
    body: `<h1>Hallo {firstName},</h1>
<p>Wir freuen uns sehr, dich als Partner begrüßen zu dürfen.</p>
<p>Du verdienst ab sofort 50% an jedem vermittelten Nutzer. Deinen persönlichen Empfehlungslink findest du in deinem Dashboard.</p>
<p><a href="{affiliateLink}">Zum Partner-Dashboard</a></p>
<p>Auf gute Zusammenarbeit!</p>`,
    variables: ['{firstName}', '{affiliateLink}'],
    isEnabled: true
  },
  {
    id: 'part_pw_reset',
    name: 'Partner Passwort vergessen',
    description: 'Passwort Reset für Partner.',
    category: 'PARTNER',
    subject: 'Partner-Login: Neues Passwort',
    body: `<p>Hallo {firstName},</p>
<p>hier ist der Link, um dein Passwort für den Partner-Bereich zurückzusetzen:</p>
<p><a href="{resetLink}">Passwort ändern</a></p>`,
    variables: ['{firstName}', '{resetLink}'],
    isEnabled: true
  },
  {
    id: 'part_welcome',
    name: 'Partner: Tipps zum Start',
    description: 'Tipps für neue Partner (Follow-up).',
    category: 'PARTNER',
    subject: 'So verdienst du deine erste Provision 💸',
    body: `<p>Hey {firstName},</p>
<p>schön, dass du dabei bist! Hier sind 3 Tipps, wie du deine Einnahmen maximierst:</p>
<ol>
<li>Poste deinen Link in deiner Instagram Bio.</li>
<li>Erkläre deiner Community, dass sie mit dem Tool Zeit sparen.</li>
<li>Nutze unsere vorgefertigten Marketing-Texte aus dem Dashboard.</li>
</ol>
<p>Viel Erfolg!</p>`,
    variables: ['{firstName}'],
    isEnabled: true
  },
  {
    id: 'part_monthly',
    name: 'Partner: Monats-Statistik',
    description: 'Automatischer Report über Einnahmen.',
    category: 'PARTNER',
    subject: 'Deine Einnahmen im {month}',
    body: `<h1>Dein Monats-Update</h1>
<p>Hallo {firstName},</p>
<p>Im {month} lief es richtig gut:</p>
<ul>
<li>Neue Kunden: {newCustomers}</li>
<li>Umsatz: {revenue} €</li>
<li><strong>Deine Provision: {commission} €</strong></li>
</ul>
<p>Die Auszahlung erfolgt automatisch zum Monatsanfang.</p>
<p>Weiter so!</p>`,
    variables: ['{firstName}', '{month}', '{newCustomers}', '{revenue}', '{commission}'],
    isEnabled: true
  }
];

interface AdminDashboardProps {
  commissionRate: number;
  onUpdateCommission: (rate: number) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ commissionRate, onUpdateCommission }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'customers' | 'partners' | 'emails' | 'settings'>('dashboard');
  
  // Customer Detail State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerDetail, setCustomerDetail] = useState<any>(null);
  const [refundRange, setRefundRange] = useState({ start: '', end: '' });

  // Partner Settings
  const [dateRange, setDateRange] = useState({ start: '2024-05-01', end: '2024-05-31' });
  const [aiInsights, setAiInsights] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // Email Management State
  const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_TEMPLATES);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);

  // Admin Account Settings State
  const [adminAuth, setAdminAuth] = useState({
      currentEmail: 'dominikhank@gmail.com', // Default updated to your email
      newEmail: '',
      emailPassword: '', 
      pwCurrent: '',
      pwNew: '',
      pwConfirm: ''
  });

  const handleSelectCustomer = (customer: any) => {
    const details = generateCustomerDetails(customer);
    setCustomerDetail(details);
    setSelectedCustomerId(customer.id);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Kundendaten erfolgreich aktualisiert.");
  };

  const handleToggleSubscription = () => {
    if (customerDetail.subscription.status === 'Active') {
      if (confirm("Möchtest du das Abo dieses Kunden wirklich sofort beenden?")) {
        setCustomerDetail({
            ...customerDetail, 
            subscription: {
                ...customerDetail.subscription, 
                status: 'Inactive', 
                endDate: new Date().toLocaleDateString(),
                isFree: false,
                plan: 'Monatsabo (1,99 €)'
            }
        });
      }
    } else {
       // Standard reactivation (Paid)
       setCustomerDetail({
           ...customerDetail, 
           subscription: {
               ...customerDetail.subscription, 
               status: 'Active', 
               endDate: null,
               isFree: false
           }
       });
    }
  };

  const handleToggleFreeSubscription = () => {
      if (customerDetail.subscription.isFree) {
          if(confirm("Möchtest du das kostenlose Abo widerrufen? Der Nutzer verliert sofort den Zugriff.")) {
            setCustomerDetail({
                ...customerDetail,
                subscription: {
                    ...customerDetail.subscription,
                    status: 'Inactive',
                    isFree: false,
                    plan: 'Monatsabo (1,99 €)',
                    endDate: new Date().toLocaleDateString()
                }
            });
          }
      } else {
          if(confirm("Diesen Nutzer manuell kostenlos freischalten? Er erhält alle Premium-Funktionen ohne Zahlung.")) {
            setCustomerDetail({
                ...customerDetail,
                subscription: {
                    ...customerDetail.subscription,
                    status: 'Active',
                    isFree: true,
                    plan: 'Manuell (Gratis)',
                    endDate: null
                }
            });
          }
      }
  };

  const handleRefundSingle = (txId: string) => {
    if(confirm(`Transaktion ${txId} wirklich erstatten?`)) {
      const updatedTx = customerDetail.transactions.map((tx: any) => 
        tx.id === txId ? {...tx, status: 'Refunded'} : tx
      );
      setCustomerDetail({...customerDetail, transactions: updatedTx});
      alert("Rückzahlung eingeleitet.");
    }
  };

  const handleRefundAll = () => {
    if(confirm("WARNUNG: Möchtest du wirklich ALLE Zahlungen dieses Kunden erstatten? Dies kann nicht rückgängig gemacht werden.")) {
      const updatedTx = customerDetail.transactions.map((tx: any) => ({...tx, status: 'Refunded'}));
      setCustomerDetail({...customerDetail, transactions: updatedTx});
      alert("Alle Zahlungen wurden erstattet.");
    }
  };

  const handleRefundRange = () => {
    if (!refundRange.start || !refundRange.end) {
        alert("Bitte Start- und Enddatum wählen.");
        return;
    }
    const start = new Date(refundRange.start);
    const end = new Date(refundRange.end);
    
    const count = customerDetail.transactions.filter((tx: any) => {
        const txDate = new Date(tx.date.split('.').reverse().join('-'));
        return txDate >= start && txDate <= end && tx.status === 'Paid';
    }).length;

    if(count === 0) {
        alert("Keine bezahlten Transaktionen im Zeitraum gefunden.");
        return;
    }

    if(confirm(`${count} Zahlungen im Zeitraum erstatten?`)) {
        const updatedTx = customerDetail.transactions.map((tx: any) => {
            const txDate = new Date(tx.date.split('.').reverse().join('-'));
            if (txDate >= start && txDate <= end && tx.status === 'Paid') {
                return {...tx, status: 'Refunded'};
            }
            return tx;
        });
        setCustomerDetail({...customerDetail, transactions: updatedTx});
        alert("Rückzahlungen für Zeitraum durchgeführt.");
    }
  };

  const handleSaveCommission = () => {
    alert(`Globale Provision erfolgreich auf ${commissionRate}% geändert. Alle Anzeigetexte und Abrechnungen wurden aktualisiert.`);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const insights = await generateAdminInsights({ topPartners: PARTNER_TOP_10, conversion: CONVERSION_QUALITY_DATA });
      setAiInsights(insights);
    } catch (error) {
      setAiInsights("Fehler bei der Analyse.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTestConnection = async (service: 'email' | 'sms' | 'browseai' | 'gemini') => {
    setIsTestingConnection(true);
    try {
      if (service === 'browseai') {
         const result = await testBrowseAiConnection();
         alert(`✅ ERFOLG: Verbindung zu Browse.ai hergestellt!\nRoboter: ${result.robotName}`);
      } else if (service === 'gemini') {
         const result = await testGeminiConnection();
         alert(`✅ ERFOLG: ${result.message}`);
      } else {
          // --- SIMULATION FOR OTHERS ---
          await new Promise(resolve => setTimeout(resolve, 1500));
          alert(`Test für ${service} erfolgreich initiiert. (Prüfe Vercel Logs für echte Sende-Status)`);
      }
    } catch (e: any) {
      alert(`❌ FEHLER: ${e.message}`);
    } finally {
      setIsTestingConnection(false);
    }
  };

  // --- EMAIL MANAGEMENT HANDLERS ---
  const toggleEmailTemplate = (id: string) => {
    setTemplates(prev => prev.map(t => 
      t.id === id ? { ...t, isEnabled: !t.isEnabled } : t
    ));
  };

  const updateTemplate = (id: string, field: 'subject' | 'body', value: string) => {
    setTemplates(prev => prev.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  const handleSendTestEmail = async (template: EmailTemplate) => {
    setIsSendingTestEmail(true);
    try {
      // Pass the current admin email (dominikhank@gmail.com) to the backend service
      const result = await sendTemplateTest(template, adminAuth.currentEmail);
      alert(`Test-E-Mail "${template.subject}" wurde an ${adminAuth.currentEmail} gesendet!`);
    } catch (error: any) {
      alert(`Fehler beim Senden: ${error.message}`);
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  // --- ADMIN ACCOUNT HANDLERS ---
  const handleUpdateAdminPassword = (e: React.FormEvent) => {
      e.preventDefault();
      if (!adminAuth.pwCurrent) {
          alert("Bitte aktuelles Passwort eingeben.");
          return;
      }
      if (adminAuth.pwNew.length < 6) {
          alert("Das neue Passwort muss mindestens 6 Zeichen lang sein.");
          return;
      }
      if (adminAuth.pwNew !== adminAuth.pwConfirm) {
          alert("Die neuen Passwörter stimmen nicht überein.");
          return;
      }
      alert("Admin-Passwort erfolgreich geändert!");
      setAdminAuth(prev => ({...prev, pwCurrent: '', pwNew: '', pwConfirm: ''}));
  };

  const handleUpdateAdminEmail = (e: React.FormEvent) => {
      e.preventDefault();
      if (!adminAuth.newEmail) {
          alert("Bitte neue E-Mail Adresse eingeben.");
          return;
      }
      if (!adminAuth.emailPassword) {
          alert("Bitte aktuelles Passwort zur Bestätigung eingeben.");
          return;
      }
      // Simulation of verification
      alert(`Bestätigungs-Link wurde an ${adminAuth.newEmail} gesendet. Bitte rufe die E-Mail ab und klicke auf den Link, um die Änderung abzuschließen.`);
      setAdminAuth(prev => ({...prev, newEmail: '', emailPassword: ''}));
  };

  const renderTabButton = (id: typeof activeTab, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`pb-4 px-4 flex items-center gap-2 font-medium text-sm transition-colors border-b-2 ${
        activeTab === id 
          ? 'border-[#00305e] text-[#00305e]' 
          : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  const EnvVarRow = ({ name, description }: { name: string, description: string }) => (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-xs mb-2 flex flex-col md:flex-row gap-2 justify-between items-start md:items-center">
          <div className="flex items-center gap-2 text-slate-700 font-bold overflow-hidden break-all">
              <Key size={12} className="shrink-0 text-slate-400" />
              {name}
          </div>
          <div className="text-slate-500 text-[10px] md:text-right">{description}</div>
      </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Konsole</h1>
          <p className="text-slate-500">Systemstatus & Management</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
          <Activity size={14} />
          System Online
        </div>
      </div>

      {/* Tabs Navigation */}
      {!selectedCustomerId && (
        <div className="border-b border-slate-200 flex overflow-x-auto">
            {renderTabButton('dashboard', 'Dashboard', <LayoutDashboard size={18} />)}
            {renderTabButton('customers', 'Kunden', <Users size={18} />)}
            {renderTabButton('partners', 'Partner', <Briefcase size={18} />)}
            {renderTabButton('emails', 'E-Mail Management', <Mail size={18} />)}
            {renderTabButton('settings', 'Einstellungen', <Settings size={18} />)}
        </div>
      )}

      {/* TAB: DASHBOARD */}
      {activeTab === 'dashboard' && !selectedCustomerId && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-slate-500 text-sm font-medium">Aktive Nutzer</p>
                  <h3 className="text-3xl font-bold text-slate-900">1,284</h3>
                </div>
                <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Users size={20} /></div>
              </div>
              <div className="text-xs text-green-600 flex items-center gap-1 font-medium">
                <TrendingUp size={12} /> +12% diese Woche
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-slate-500 text-sm font-medium">Reingewinn (Profit)</p>
                  <h3 className="text-3xl font-bold text-slate-900">2,450 €</h3>
                </div>
                <div className="bg-green-50 p-2 rounded-lg text-green-600"><DollarSign size={20} /></div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Gesamtumsatz</span>
                  <span className="font-medium">4,900 €</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Provisionen</span>
                  <span className="font-medium text-red-400">-2,450 €</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-slate-500 text-sm font-medium">API Calls (Heute)</p>
                  <h3 className="text-3xl font-bold text-slate-900">142k</h3>
                </div>
                <div className="bg-purple-50 p-2 rounded-lg text-purple-600"><Database size={20} /></div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <p className="text-xs text-slate-400 mt-1">65% des Tages-Limits</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-slate-500 text-sm font-medium">Conversion Rate</p>
                  <h3 className="text-3xl font-bold text-slate-900">4.2%</h3>
                </div>
                <div className="bg-amber-50 p-2 rounded-lg text-amber-600"><Activity size={20} /></div>
              </div>
              <div className="text-xs text-slate-400">Besucher zu Abo Abschluss</div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[400px]">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Wachstum & Umsatz</h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DASHBOARD_DATA}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00305e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#00305e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffcc00" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ffcc00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Area type="monotone" dataKey="revenue" stackId="1" stroke="#00305e" fill="url(#colorRevenue)" name="Umsatz (€)" />
                <Area type="monotone" dataKey="growth" stackId="2" stroke="#eab308" fill="url(#colorGrowth)" name="Nutzer Wachstum" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB: CUSTOMERS (List & Details) */}
      {activeTab === 'customers' && (
        <>
            {!selectedCustomerId ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-900">Kundenverzeichnis</h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input type="text" placeholder="Kunden suchen..." className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                            <tr>
                            <th className="px-6 py-4">Kunden ID</th>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Beigetreten am</th>
                            <th className="px-6 py-4 text-right">Aktionen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {CUSTOMERS_LIST.map((customer) => (
                            <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs text-slate-500">{customer.id}</td>
                                <td className="px-6 py-4 font-medium text-slate-900">{customer.name}</td>
                                <td className="px-6 py-4 text-slate-600">{customer.email}</td>
                                <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    customer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                                }`}>
                                    {customer.status === 'Active' ? 'Aktiv' : 'Inaktiv'}
                                </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500 text-sm">{customer.joined}</td>
                                <td className="px-6 py-4 text-right">
                                <button 
                                    onClick={() => handleSelectCustomer(customer)}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded hover:bg-blue-50"
                                >
                                    Details
                                </button>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-right-4">
                    <div className="flex items-center gap-4 mb-6">
                        <Button variant="outline" size="sm" onClick={() => setSelectedCustomerId(null)}>
                            <ArrowLeft size={16} className="mr-2" /> Zurück zur Liste
                        </Button>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                {customerDetail.name}
                                <span className={`text-sm px-3 py-1 rounded-full border ${
                                    customerDetail.subscription.status === 'Active' 
                                    ? 'bg-green-50 border-green-200 text-green-700' 
                                    : 'bg-slate-50 border-slate-200 text-slate-500'
                                }`}>
                                    {customerDetail.subscription.status === 'Active' ? 'Abo Aktiv' : 'Gekündigt'}
                                </span>
                                {customerDetail.subscription.isFree && (
                                    <span className="text-sm px-3 py-1 rounded-full border bg-purple-50 border-purple-200 text-purple-700 flex items-center gap-1">
                                        <Gift size={12} /> Kostenlos
                                    </span>
                                )}
                            </h2>
                            <p className="text-slate-500 text-sm font-mono">{customerDetail.id}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LEFT COLUMN */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Personal Data Form */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Users size={20} className="text-blue-600" /> Stammdaten Bearbeiten
                                </h3>
                                <form onSubmit={handleSaveCustomer} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase">Vorname</label>
                                            <input 
                                                type="text" 
                                                value={customerDetail.firstName}
                                                onChange={(e) => setCustomerDetail({...customerDetail, firstName: e.target.value})}
                                                className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 outline-none" 
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase">Nachname</label>
                                            <input 
                                                type="text" 
                                                value={customerDetail.lastName}
                                                onChange={(e) => setCustomerDetail({...customerDetail, lastName: e.target.value})}
                                                className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 outline-none" 
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">E-Mail</label>
                                        <input 
                                            type="email" 
                                            value={customerDetail.email}
                                            onChange={(e) => setCustomerDetail({...customerDetail, email: e.target.value})}
                                            className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 outline-none" 
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-2 flex gap-4">
                                             <div className="flex-1">
                                                <label className="text-xs font-bold text-slate-500 uppercase">Straße</label>
                                                <input 
                                                    type="text" 
                                                    value={customerDetail.address.street}
                                                    onChange={(e) => setCustomerDetail({...customerDetail, address: {...customerDetail.address, street: e.target.value}})}
                                                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 outline-none" 
                                                />
                                             </div>
                                             <div className="w-24">
                                                <label className="text-xs font-bold text-slate-500 uppercase">Nr.</label>
                                                <input 
                                                    type="text" 
                                                    value={customerDetail.address.houseNumber}
                                                    onChange={(e) => setCustomerDetail({...customerDetail, address: {...customerDetail.address, houseNumber: e.target.value}})}
                                                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 outline-none" 
                                                />
                                             </div>
                                        </div>
                                        
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase">Land</label>
                                            <select 
                                                value={customerDetail.address.country}
                                                onChange={(e) => setCustomerDetail({...customerDetail, address: {...customerDetail.address, country: e.target.value}})}
                                                className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 outline-none bg-white"
                                            >
                                                <option>Deutschland</option>
                                                <option>Österreich</option>
                                                <option>Schweiz</option>
                                                <option>Frankreich</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase">PLZ</label>
                                            <input 
                                                type="text" 
                                                value={customerDetail.address.zip}
                                                onChange={(e) => setCustomerDetail({...customerDetail, address: {...customerDetail.address, zip: e.target.value}})}
                                                className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 outline-none" 
                                            />
                                        </div>
                                        <div className="col-span-1 md:col-span-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Ort</label>
                                            <input 
                                                type="text" 
                                                value={customerDetail.address.city}
                                                onChange={(e) => setCustomerDetail({...customerDetail, address: {...customerDetail.address, city: e.target.value}})}
                                                className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 outline-none" 
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <Button type="submit" size="sm" variant="outline">
                                            <Save size={14} className="mr-2" /> Änderungen speichern
                                        </Button>
                                    </div>
                                </form>
                            </div>

                            {/* Transactions */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                        <CreditCard size={20} className="text-slate-600" /> Zahlungen & Rückerstattungen
                                    </h3>
                                </div>
                                
                                <div className="p-6 space-y-6">
                                    {/* Transaction List */}
                                    <div className="space-y-3">
                                        {customerDetail.transactions.map((tx: any) => (
                                            <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2 rounded-full ${tx.status === 'Paid' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                        {tx.status === 'Paid' ? <CheckCircle size={16} /> : <RotateCcw size={16} />}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">{tx.amount.toFixed(2)} €</p>
                                                        <p className="text-xs text-slate-500">{tx.date} • {tx.id}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-xs font-bold uppercase ${tx.status === 'Paid' ? 'text-green-600' : 'text-red-500'}`}>
                                                        {tx.status === 'Paid' ? 'Bezahlt' : 'Erstattet'}
                                                    </span>
                                                    {tx.status === 'Paid' && (
                                                        <button 
                                                            onClick={() => handleRefundSingle(tx.id)}
                                                            className="text-xs bg-white border border-slate-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 px-3 py-1 rounded transition-colors"
                                                        >
                                                            Erstatten
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Bulk Refunds */}
                                    <div className="border-t border-slate-200 pt-6">
                                        <h4 className="text-sm font-bold text-slate-900 mb-3">Erweiterte Rückerstattungen</h4>
                                        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-xs font-bold text-red-800 uppercase mb-2">Zeitraum Erstatten</label>
                                                    <div className="flex gap-2 mb-2">
                                                        <input type="date" className="w-full text-xs p-2 rounded border border-red-200 text-slate-600" value={refundRange.start} onChange={(e) => setRefundRange({...refundRange, start: e.target.value})} />
                                                        <input type="date" className="w-full text-xs p-2 rounded border border-red-200 text-slate-600" value={refundRange.end} onChange={(e) => setRefundRange({...refundRange, end: e.target.value})} />
                                                    </div>
                                                    <button onClick={handleRefundRange} className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-100 text-xs font-bold py-2 rounded transition">
                                                        Zahlungen im Zeitraum erstatten
                                                    </button>
                                                </div>
                                                <div className="flex flex-col justify-between">
                                                    <label className="block text-xs font-bold text-red-800 uppercase mb-2">Notfall-Option</label>
                                                    <button onClick={handleRefundAll} className="w-full h-full flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700 text-xs font-bold py-2 rounded transition shadow-sm">
                                                        <AlertTriangle size={14} /> ALLE Zahlungen erstatten
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <h3 className="font-bold text-slate-900 mb-4">Abo Übersicht</h3>
                                <div className="space-y-4">
                                    <div><p className="text-xs text-slate-500 uppercase">Aktueller Plan</p><p className="font-medium text-slate-900">{customerDetail.subscription.plan}</p></div>
                                    <div><p className="text-xs text-slate-500 uppercase">Startdatum</p><p className="font-medium text-slate-900">{customerDetail.subscription.startDate}</p></div>
                                    <div><p className="text-xs text-slate-500 uppercase">Enddatum</p><p className="font-medium text-slate-900">{customerDetail.subscription.endDate || '– (Laufend)'}</p></div>
                                    
                                    <div className="pt-4 border-t border-slate-100 space-y-2">
                                        <Button onClick={handleToggleSubscription} className={`w-full justify-center ${customerDetail.subscription.status === 'Active' && !customerDetail.subscription.isFree ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 shadow-none' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                                            {customerDetail.subscription.status === 'Active' && !customerDetail.subscription.isFree ? <><UserX size={16} className="mr-2" /> Abo regulär beenden</> : <><UserCheck size={16} className="mr-2" /> Abo regulär reaktivieren</>}
                                        </Button>

                                        <Button 
                                            onClick={handleToggleFreeSubscription}
                                            variant="secondary"
                                            className={`w-full justify-center border ${customerDetail.subscription.isFree ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-white text-purple-600 border-purple-200 hover:bg-purple-50'}`}
                                        >
                                            {customerDetail.subscription.isFree ? <><UserX size={16} className="mr-2" /> Kostenloses Abo entziehen</> : <><Gift size={16} className="mr-2" /> Kostenloses Abo geben</>}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-6">
                                <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2"><Briefcase size={20} /> Partner Info</h3>
                                {customerDetail.referrer ? (
                                    <div className="space-y-2">
                                        <p className="text-sm text-indigo-800">Geworben von: <br/><span className="font-bold">{customerDetail.referrer.name}</span></p>
                                        <p className="text-xs text-indigo-600">Partner-ID: {customerDetail.referrer.id}</p>
                                        <p className="text-xs text-indigo-600">Datum: {customerDetail.referrer.date}</p>
                                        <div className="mt-3 pt-3 border-t border-indigo-200/50"><span className="inline-block bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded font-medium">Provision: 50%</span></div>
                                    </div>
                                ) : <p className="text-sm text-indigo-600 italic">Kein Partner zugeordnet (Organisch).</p>}
                            </div>
                            <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 opacity-75 hover:opacity-100 transition-opacity">
                                <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2"><Ban size={16} /> Account Sperrung</h3>
                                <p className="text-xs text-slate-500 mb-4">Sperrt den Zugang zum Dashboard dauerhaft.</p>
                                <button className="text-xs text-red-500 font-bold hover:underline">Nutzer sperren & Daten archivieren</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
      )}

      {/* TAB: PARTNER */}
      {activeTab === 'partners' && !selectedCustomerId && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-indigo-900 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
             <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-indigo-800 to-transparent pointer-events-none"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
                  <Settings size={24} className="text-[#ffcc00]" /> Programm Konfiguration
                </h3>
                <p className="text-indigo-200 max-w-xl">
                  Änderungen hier wirken sich sofort auf die gesamte Plattform aus (Anzeigetexte, Rechenbeispiele, Provisionsabrechnung).
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 flex flex-col gap-4 min-w-[300px]">
                <label className="text-sm font-bold uppercase tracking-wider text-indigo-200">Globale Provision (%)</label>
                <div className="flex gap-4">
                  <input 
                    type="number" 
                    min="0" max="100"
                    value={commissionRate}
                    onChange={(e) => onUpdateCommission(parseInt(e.target.value))}
                    className="flex-1 bg-indigo-950 border border-indigo-700 rounded-lg px-4 py-2 text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-[#ffcc00]"
                  />
                  <Button onClick={handleSaveCommission} size="sm" className="bg-[#ffcc00] text-[#00305e] hover:bg-yellow-400 border-0">
                    Speichern
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-slate-500 text-sm mb-1">Partner Gesamt</p>
              <h3 className="text-2xl font-bold text-slate-900">842</h3>
              <p className="text-xs text-green-600 mt-2">+24 diesen Monat</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-slate-500 text-sm mb-1">Neue Partner</p>
              <h3 className="text-2xl font-bold text-slate-900">12</h3>
              <p className="text-xs text-slate-400 mt-2">Im ausgewählten Zeitraum</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-slate-500 text-sm mb-1">Ausgezahlt</p>
              <h3 className="text-2xl font-bold text-slate-900">8.450 €</h3>
              <p className="text-xs text-slate-400 mt-2">Im ausgewählten Zeitraum</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-slate-500 text-sm mb-1">Offene Auszahlungen</p>
              <h3 className="text-2xl font-bold text-amber-600">1.240 €</h3>
              <Button size="sm" variant="secondary" className="w-full mt-2 text-xs h-7">Prüfen</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">Top 10 Partner (Nach Umsatz)</h3>
              </div>
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-3">#</th>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3 text-right">Umsatz</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {PARTNER_TOP_10.map((partner) => (
                    <tr key={partner.rank}>
                      <td className="px-6 py-3 text-slate-500 font-mono text-xs">{partner.rank}</td>
                      <td className="px-6 py-3 font-medium text-slate-900">{partner.name}</td>
                      <td className="px-6 py-3 text-right text-slate-700">{partner.revenue.toFixed(2)} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-6">Conversion Qualität</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={CONVERSION_QUALITY_DATA} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="source" type="category" width={80} tick={{fontSize: 12}} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="clicks" fill="#cbd5e1" name="Klicks" barSize={20} radius={[0, 4, 4, 0]} />
                    <Bar dataKey="conversions" fill="#00305e" name="Abschlüsse" barSize={20} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="text-blue-600" size={20} /> KI Insights (Server-Side)
              </h3>
              <Button onClick={handleAnalyze} disabled={isAnalyzing} size="sm" className="bg-[#00305e] text-white hover:bg-[#002040] border-0 shadow-md">
                {isAnalyzing ? 'Analysiere...' : 'Analyse starten'}
              </Button>
            </div>
            
            {aiInsights ? (
              <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                <pre className="whitespace-pre-wrap font-sans text-slate-700">{aiInsights}</pre>
              </div>
            ) : (
              <p className="text-slate-500 text-sm">Lasse die künstliche Intelligenz deine Partner-Daten analysieren, um versteckte Muster und Optimierungspotenziale zu finden.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB: EMAIL MANAGEMENT */}
      {activeTab === 'emails' && !selectedCustomerId && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div>
                  <h2 className="text-xl font-bold text-slate-900">E-Mail Vorlagen</h2>
                  <p className="text-slate-500">Verwalte alle automatischen Benachrichtigungen für Kunden und Partner.</p>
              </div>
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium border border-blue-100 flex items-center gap-2">
                  <Mail size={16} />
                  {templates.filter(t => t.isEnabled).length} von {templates.length} aktiv
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* List of Emails */}
               <div className="space-y-8 lg:col-span-1">
                   {['CUSTOMER', 'PARTNER'].map((category) => (
                       <div key={category} className="space-y-3">
                           <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                               {category === 'CUSTOMER' ? 'Kunden E-Mails' : 'Partner E-Mails'}
                           </h3>
                           {templates.filter(t => t.category === category).map(template => (
                               <div 
                                   key={template.id}
                                   onClick={() => setEditingTemplateId(template.id)}
                                   className={`bg-white p-4 rounded-xl border cursor-pointer transition-all shadow-sm hover:shadow-md ${
                                       editingTemplateId === template.id 
                                       ? 'border-blue-500 ring-2 ring-blue-100' 
                                       : 'border-slate-200 hover:border-blue-300'
                                   }`}
                               >
                                   <div className="flex justify-between items-start mb-2">
                                       <h4 className="font-bold text-slate-900 text-sm">{template.name}</h4>
                                       <div className={`w-2 h-2 rounded-full ${template.isEnabled ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                                   </div>
                                   <p className="text-xs text-slate-500 line-clamp-2">{template.description}</p>
                               </div>
                           ))}
                       </div>
                   ))}
               </div>

               {/* Editor Area */}
               <div className="lg:col-span-2">
                   {editingTemplateId ? (
                       (() => {
                           const template = templates.find(t => t.id === editingTemplateId)!;
                           return (
                               <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
                                   {/* Editor Header */}
                                   <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                       <div>
                                           <h3 className="font-bold text-slate-900">{template.name}</h3>
                                           <p className="text-xs text-slate-500">ID: {template.id}</p>
                                       </div>
                                       <div className="flex items-center gap-3">
                                           <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="sr-only peer" 
                                                    checked={template.isEnabled}
                                                    onChange={() => toggleEmailTemplate(template.id)}
                                                />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                                <span className="ml-3 text-sm font-medium text-slate-700">{template.isEnabled ? 'Aktiv' : 'Inaktiv'}</span>
                                            </label>
                                            <Button variant="outline" size="sm" onClick={() => setEditingTemplateId(null)}>
                                                <X size={16} />
                                            </Button>
                                       </div>
                                   </div>

                                   {/* Editor Body */}
                                   <div className="p-6 space-y-6">
                                       <div>
                                           <label className="block text-sm font-bold text-slate-700 mb-2">Betreffzeile</label>
                                           <input 
                                                type="text" 
                                                value={template.subject}
                                                onChange={(e) => updateTemplate(template.id, 'subject', e.target.value)}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                           />
                                       </div>

                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">
                                           {/* HTML Input */}
                                           <div className="flex flex-col h-full">
                                               <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                                   <Edit3 size={14} /> HTML Inhalt
                                               </label>
                                               <textarea 
                                                    value={template.body}
                                                    onChange={(e) => updateTemplate(template.id, 'body', e.target.value)}
                                                    className="flex-1 w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs resize-none bg-slate-50"
                                               />
                                               <div className="mt-2">
                                                   <p className="text-xs font-bold text-slate-500 mb-1">Verfügbare Variablen:</p>
                                                   <div className="flex flex-wrap gap-2">
                                                       {template.variables.map(v => (
                                                           <span key={v} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100 font-mono">
                                                               {v}
                                                           </span>
                                                       ))}
                                                   </div>
                                               </div>
                                           </div>

                                           {/* Preview */}
                                           <div className="flex flex-col h-full">
                                               <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                                   <Eye size={14} /> Vorschau
                                               </label>
                                               <div className="flex-1 w-full border border-slate-200 rounded-lg overflow-y-auto bg-white">
                                                   <div className="bg-slate-100 p-3 border-b border-slate-200 text-xs text-slate-500">
                                                       Von: ResortPassAlarm &lt;alarm@resortpassalarm.com&gt;<br/>
                                                       Betreff: <span className="text-slate-900 font-bold">{template.subject}</span>
                                                   </div>
                                                   <div 
                                                       className="p-4 prose prose-sm max-w-none"
                                                       dangerouslySetInnerHTML={{ 
                                                           __html: template.body
                                                            .replace('{firstName}', 'Max')
                                                            .replace('{productName}', 'ResortPass Gold')
                                                            .replace('{month}', 'Mai 2024')
                                                            .replace('{revenue}', '1.250,00')
                                                            .replace('{commission}', '625,00')
                                                        }} 
                                                   />
                                               </div>
                                           </div>
                                       </div>
                                   </div>

                                   {/* Editor Footer */}
                                   <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                                       <Button 
                                            onClick={() => handleSendTestEmail(template)} 
                                            disabled={isSendingTestEmail}
                                            variant="outline"
                                       >
                                            <Send size={16} className="mr-2" />
                                            {isSendingTestEmail ? 'Sende...' : 'Test-Mail an mich senden'}
                                       </Button>
                                       <Button onClick={() => alert('Änderungen für die Session gespeichert.')}>
                                            <Save size={16} className="mr-2" />
                                            Speichern
                                       </Button>
                                   </div>
                               </div>
                           );
                       })()
                   ) : (
                       <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                           <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                               <Mail size={32} className="text-slate-300" />
                           </div>
                           <h3 className="text-lg font-bold text-slate-900 mb-2">Wähle eine Vorlage</h3>
                           <p className="text-slate-500 max-w-xs">
                               Klicke links auf eine E-Mail Vorlage, um den Inhalt zu bearbeiten oder eine Test-Mail zu senden.
                           </p>
                       </div>
                   )}
               </div>
           </div>
        </div>
      )}

      {/* TAB: SETTINGS & ENV GUIDE */}
      {activeTab === 'settings' && !selectedCustomerId && (
        <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 space-y-8">
          
          {/* Admin Account Settings */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-6 border-b border-slate-100 bg-slate-50">
                 <div className="flex items-center gap-3">
                     <div className="bg-white p-2 rounded-lg text-slate-700 shadow-sm border border-slate-100"><Lock size={20} /></div>
                     <div>
                         <h3 className="text-lg font-bold text-slate-900">Admin Sicherheit & Login</h3>
                         <p className="text-slate-500 text-sm">Verwalte deine Zugangsdaten für diesen Bereich.</p>
                     </div>
                 </div>
             </div>
             
             <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Change Email */}
                 <form onSubmit={handleUpdateAdminEmail} className="space-y-4">
                     <h4 className="font-bold text-slate-800 flex items-center gap-2"><Mail size={16} /> E-Mail ändern</h4>
                     <div className="bg-blue-50 px-3 py-2 rounded text-xs text-blue-700 border border-blue-100">
                         Aktuell: <strong>{adminAuth.currentEmail}</strong>
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Neue E-Mail Adresse</label>
                         <input 
                             type="email" 
                             required
                             value={adminAuth.newEmail}
                             onChange={(e) => setAdminAuth({...adminAuth, newEmail: e.target.value})}
                             className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-blue-500 outline-none"
                         />
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Zur Bestätigung: Aktuelles Passwort</label>
                         <input 
                             type="password" 
                             required
                             value={adminAuth.emailPassword}
                             onChange={(e) => setAdminAuth({...adminAuth, emailPassword: e.target.value})}
                             className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-blue-500 outline-none"
                         />
                     </div>
                     <Button type="submit" variant="secondary" size="sm" className="w-full justify-center">
                         Bestätigungs-Link anfordern
                     </Button>
                 </form>

                 {/* Change Password */}
                 <form onSubmit={handleUpdateAdminPassword} className="space-y-4 md:border-l md:pl-8 border-slate-100">
                     <h4 className="font-bold text-slate-800 flex items-center gap-2"><Key size={16} /> Passwort ändern</h4>
                     <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Aktuelles Passwort</label>
                         <input 
                             type="password" 
                             required
                             value={adminAuth.pwCurrent}
                             onChange={(e) => setAdminAuth({...adminAuth, pwCurrent: e.target.value})}
                             className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-blue-500 outline-none"
                         />
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Neues Passwort</label>
                         <input 
                             type="password" 
                             required
                             value={adminAuth.pwNew}
                             onChange={(e) => setAdminAuth({...adminAuth, pwNew: e.target.value})}
                             className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-blue-500 outline-none"
                         />
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Neues Passwort bestätigen</label>
                         <input 
                             type="password" 
                             required
                             value={adminAuth.pwConfirm}
                             onChange={(e) => setAdminAuth({...adminAuth, pwConfirm: e.target.value})}
                             className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-blue-500 outline-none"
                         />
                     </div>
                     <Button type="submit" size="sm" className="w-full bg-[#00305e] text-white hover:bg-[#002040] justify-center">
                         Passwort ändern
                     </Button>
                 </form>
             </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-amber-50">
              <div className="flex items-start gap-3">
                 <AlertTriangle className="text-amber-500 shrink-0 mt-1" size={24} />
                 <div>
                    <h3 className="text-lg font-bold text-amber-800">System Konfiguration (Vercel)</h3>
                    <p className="text-amber-700 text-sm mt-1 leading-relaxed">
                      Diese Anwendung läuft "Serverless". Aus Sicherheitsgründen werden API-Schlüssel nicht hier gespeichert.
                    </p>
                    <p className="text-amber-800 text-sm font-bold mt-2">
                      Bitte trage die folgenden Schlüssel (Keys) im Vercel Dashboard unter "Settings" → "Environment Variables" ein.
                    </p>
                 </div>
              </div>
            </div>
            
            <div className="p-6 space-y-8">
              
              {/* Gemini */}
              <section className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                   <div className="flex items-center gap-2">
                      <Sparkles size={18} className="text-blue-500" />
                      <h4 className="font-bold text-slate-900">Google Gemini (KI)</h4>
                   </div>
                   <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleTestConnection('gemini')}
                      disabled={isTestingConnection}
                   >
                      <Wifi size={14} className="mr-2" /> Verbindung testen
                   </Button>
                </div>
                <div>
                   <EnvVarRow name="API_KEY" description="Dein Google AI Studio API Key für die Textgenerierung." />
                </div>
              </section>

              {/* Stripe */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                   <CreditCard size={18} className="text-indigo-500" />
                   <h4 className="font-bold text-slate-900">Stripe Payments</h4>
                </div>
                <div>
                   <EnvVarRow name="NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" description="pk_live_... (Für das Frontend)" />
                   <EnvVarRow name="STRIPE_SECRET_KEY" description="sk_live_... (Für das Backend)" />
                </div>
              </section>

              {/* Resend */}
              <section className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                   <div className="flex items-center gap-2">
                      <Mail size={18} className="text-slate-500" />
                      <h4 className="font-bold text-slate-900">Resend (E-Mail)</h4>
                   </div>
                   <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleTestConnection('email')}
                      disabled={isTestingConnection}
                   >
                      <Wifi size={14} className="mr-2" /> Verbindung testen
                   </Button>
                </div>
                <div>
                    <EnvVarRow name="RESEND_API_KEY" description="re_... (API Schlüssel von Resend.com)" />
                </div>
              </section>

              {/* Twilio */}
              <section className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                   <div className="flex items-center gap-2">
                      <MessageSquare size={18} className="text-red-500" />
                      <h4 className="font-bold text-slate-900">Twilio (SMS)</h4>
                   </div>
                   <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleTestConnection('sms')}
                      disabled={isTestingConnection}
                   >
                      <Wifi size={14} className="mr-2" /> Verbindung testen
                   </Button>
                </div>
                <div>
                    <EnvVarRow name="TWILIO_ACCOUNT_SID" description="AC... (Account ID)" />
                    <EnvVarRow name="TWILIO_AUTH_TOKEN" description="Dein geheimer Auth Token" />
                    <EnvVarRow name="TWILIO_PHONE_NUMBER" description="+123... (Deine gekaufte Twilio Nummer)" />
                </div>
              </section>

              {/* Browse AI */}
              <section className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                   <div className="flex items-center gap-2">
                      <Globe size={18} className="text-emerald-500" />
                      <h4 className="font-bold text-slate-900">Browse.ai (Scraping)</h4>
                   </div>
                   <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleTestConnection('browseai')}
                      disabled={isTestingConnection}
                   >
                      <Wifi size={14} className="mr-2" /> Verbindung testen
                   </Button>
                </div>
                <div>
                    <EnvVarRow name="BROWSE_AI_API_KEY" description="Dein API Schlüssel von Browse.ai" />
                    <EnvVarRow name="BROWSE_AI_ROBOT_ID" description="robot_... (Die ID deines ResortPass Monitors)" />
                </div>
              </section>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};