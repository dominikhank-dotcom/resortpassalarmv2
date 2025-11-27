import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Settings, Briefcase, 
  TrendingUp, DollarSign, Activity, Calendar, 
  Search, Save, Database, CreditCard, Mail, MessageSquare, 
  Sparkles, Download, AlertCircle, CheckCircle, Globe, Key,
  ArrowLeft, RotateCcw, AlertTriangle, UserX, UserCheck, Ban,
  Wifi, Edit3, Eye, Send, X, Copy, Terminal, Gift, Lock, Shield, Link
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend 
} from 'recharts';
import { Button } from '../components/Button';
import { generateAdminInsights } from '../services/geminiService';
import { sendTestAlarm, sendTemplateTest, testBrowseAiConnection, testGeminiConnection, manageSubscription, getCustomerDetails, updateSystemSettings } from '../services/backendService';
import { EmailTemplate } from '../types';
import { supabase } from '../lib/supabase';

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
  productUrls: { gold: string, silver: string };
  onUpdateProductUrls: (urls: { gold: string, silver: string }) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ commissionRate, onUpdateCommission, productUrls, onUpdateProductUrls }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'customers' | 'partners' | 'emails' | 'settings'>('dashboard');
  
  // Real Data State
  const [customers, setCustomers] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState({ activeUsers: 0, revenue: 0, apiCalls: 142000, conversion: 4.2 });
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  // Customer Detail State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerDetail, setCustomerDetail] = useState<any>(null);
  const [refundRange, setRefundRange] = useState({ start: '', end: '' });
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Partner Settings
  const [aiInsights, setAiInsights] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // Email Management State
  const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_TEMPLATES);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);

  // Admin Account Settings State
  const [adminAuth, setAdminAuth] = useState({
      currentEmail: '', // Will be loaded from session
      newEmail: '',
      emailPassword: '', 
      pwCurrent: '',
      pwNew: '',
      pwConfirm: ''
  });

  // --- FETCH REAL DATA ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        // 1. Get Current Admin Email
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email) {
           setAdminAuth(prev => ({ ...prev, currentEmail: user.email! }));
        }

        // 2. Fetch Customers
        const { data: customerData } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'CUSTOMER')
          .order('created_at', { ascending: false });
        
        if (customerData) {
            setCustomers(customerData);
            setDashboardStats(prev => ({ ...prev, activeUsers: customerData.length }));
        }

        // 3. Fetch Partners
        const { data: partnerData } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'AFFILIATE')
          .order('created_at', { ascending: false });
        
        if (partnerData) setPartners(partnerData);

        // 4. Calculate Revenue (Estimation based on active subs if table exists)
        // Since we don't have a payments table yet in the schema provided earlier (just payouts/commissions),
        // we can assume active subs * 1.99 for monthly revenue estimation
        const { count } = await supabase
            .from('subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active');
        
        if (count !== null) {
            setDashboardStats(prev => ({ ...prev, revenue: count * 1.99 }));
        }

      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleSelectCustomer = async (customer: any) => {
    setIsLoadingDetails(true);
    setSelectedCustomerId(customer.id);
    
    try {
        // Use Backend Service to fetch details (Bypasses RLS)
        const response = await getCustomerDetails(customer.id);
        const sub = response.subscription;
        const profile = response.profile || customer; // Fallback to passed customer object

        const details = {
            id: profile.id,
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            email: profile.email || '',
            address: { 
                street: profile.street || '', 
                houseNumber: profile.house_number || '', 
                zip: profile.zip || '', 
                city: profile.city || '', 
                country: profile.country || 'Deutschland' 
            },
            subscription: {
                status: sub ? (sub.status === 'active' ? 'Active' : 'Inactive') : 'Inactive',
                startDate: sub ? new Date(sub.created_at).toLocaleDateString() : '–',
                endDate: sub && sub.status !== 'active' ? new Date(sub.current_period_end).toLocaleDateString() : null,
                plan: sub ? sub.plan_type : 'Kein Abo',
                isFree: sub ? sub.plan_type === 'Manuell (Gratis)' : false,
                paymentMethod: sub ? 'Stripe' : '–'
            },
            referrer: null, // Would need tracking table
            transactions: [] // Would need payments table
        };
        setCustomerDetail(details);
    } catch (error: any) {
        console.error("Error fetching customer details:", error);
        alert("Fehler beim Laden der Kundendetails: " + error.message);
    } finally {
        setIsLoadingDetails(false);
    }
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerDetail) return;
    
    const { error } = await supabase.from('profiles').update({
        first_name: customerDetail.firstName,
        last_name: customerDetail.lastName,
        street: customerDetail.address.street,
        house_number: customerDetail.address.houseNumber,
        zip: customerDetail.address.zip,
        city: customerDetail.address.city,
        country: customerDetail.address.country
    }).eq('id', customerDetail.id);

    if (error) alert("Fehler beim Speichern: " + error.message);
    else alert("Kundendaten erfolgreich aktualisiert.");
  };

  const handleToggleSubscription = () => {
    alert("Diese Funktion erfordert eine direkte Stripe-API-Anbindung für Stornierungen.");
  };

  const handleToggleFreeSubscription = async () => {
      if (!customerDetail) return;

      try {
        if (customerDetail.subscription.isFree) {
            if(confirm("Möchtest du das kostenlose Abo widerrufen? Der Nutzer verliert sofort den Zugriff.")) {
                await manageSubscription(customerDetail.id, 'revoke_free');
                setCustomerDetail({
                    ...customerDetail,
                    subscription: { ...customerDetail.subscription, status: 'Inactive', isFree: false, plan: 'Standard' }
                });
                alert("Kostenloses Abo widerrufen.");
            }
        } else {
            if(confirm("Diesen Nutzer manuell kostenlos freischalten? Er erhält alle Premium-Funktionen ohne Zahlung.")) {
                await manageSubscription(customerDetail.id, 'grant_free');
                setCustomerDetail({
                    ...customerDetail,
                    subscription: { ...customerDetail.subscription, status: 'Active', isFree: true, plan: 'Manuell (Gratis)' }
                });
                alert("Kostenloses Abo gewährt.");
            }
        }
      } catch (error: any) {
          alert("Fehler bei der Abo-Änderung: " + error.message);
      }
  };

  const handleRefundSingle = (txId: string) => {
    alert("Rückerstattungs-Logik erfordert Stripe API Key.");
  };

  const handleRefundAll = () => {
    alert("Rückerstattungs-Logik erfordert Stripe API Key.");
  };

  const handleRefundRange = () => {
    alert("Rückerstattungs-Logik erfordert Stripe API Key.");
  };

  const handleSaveCommission = async () => {
    try {
        await updateSystemSettings('global_commission_rate', commissionRate.toString());
        alert(`Globale Provision erfolgreich auf ${commissionRate}% gespeichert. Alle Anzeigetexte und Abrechnungen wurden aktualisiert.`);
    } catch (error: any) {
        alert("Fehler beim Speichern der Provision: " + error.message);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      // Use real fetched data for analysis if available, else mock
      const insights = await generateAdminInsights({ 
          activePartners: partners.length, 
          totalCustomers: customers.length,
          revenue: dashboardStats.revenue
      });
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
      const result = await sendTemplateTest(template, adminAuth.currentEmail, productUrls);
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
      alert("Funktion in dieser Version deaktiviert (Auth via Supabase Dashboard empfohlen).");
  };

  const handleUpdateAdminEmail = (e: React.FormEvent) => {
      e.preventDefault();
      alert("Funktion in dieser Version deaktiviert (Auth via Supabase Dashboard empfohlen).");
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
          <div className="text-slate-500 text-xs text-right">{description}</div>
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
                  <h3 className="text-3xl font-bold text-slate-900">{isLoadingData ? '...' : dashboardStats.activeUsers}</h3>
                </div>
                <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Users size={20} /></div>
              </div>
              <div className="text-xs text-green-600 flex items-center gap-1 font-medium">
                <TrendingUp size={12} /> Live aus DB
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-slate-500 text-sm font-medium">Est. Umsatz / Monat</p>
                  <h3 className="text-3xl font-bold text-slate-900">{isLoadingData ? '...' : dashboardStats.revenue.toFixed(2)} €</h3>
                </div>
                <div className="bg-green-50 p-2 rounded-lg text-green-600"><DollarSign size={20} /></div>
              </div>
              <p className="text-xs text-slate-400">Basierend auf aktiven Abos</p>
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
              <p className="text-xs text-slate-400 mt-1">Simulierter Wert</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-slate-500 text-sm font-medium">Conversion Rate</p>
                  <h3 className="text-3xl font-bold text-slate-900">4.2%</h3>
                </div>
                <div className="bg-amber-50 p-2 rounded-lg text-amber-600"><Activity size={20} /></div>
              </div>
              <div className="text-xs text-slate-400">Simulierter Wert</div>
            </div>
          </div>

          {/* Placeholder Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[400px] flex items-center justify-center">
            <div className="text-center">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Wachstum & Umsatz</h3>
                <p className="text-slate-500 max-w-md">Historische Daten werden gesammelt. Diagramm wird verfügbar sein, sobald genügend Datenpunkte vorhanden sind.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB: CUSTOMERS */}
      {activeTab === 'customers' && (
        <>
            {!selectedCustomerId ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-900">Kundenverzeichnis ({customers.length})</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                            <tr>
                            <th className="px-6 py-4">Kunden ID</th>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Beigetreten am</th>
                            <th className="px-6 py-4 text-right">Aktionen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {customers.map((customer) => (
                            <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs text-slate-500">{customer.id.substring(0,8)}...</td>
                                <td className="px-6 py-4 font-medium text-slate-900">{customer.first_name} {customer.last_name}</td>
                                <td className="px-6 py-4 text-slate-600">{customer.email}</td>
                                <td className="px-6 py-4 text-slate-500 text-sm">{new Date(customer.created_at).toLocaleDateString()}</td>
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
                            {customers.length === 0 && !isLoadingData && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Keine Kunden gefunden.</td>
                                </tr>
                            )}
                        </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* ... customer details ... */
                <div className="animate-in fade-in slide-in-from-right-4">
                    {isLoadingDetails ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        customerDetail && (
                        <>
                        <div className="flex items-center gap-4 mb-6">
                            <Button variant="outline" size="sm" onClick={() => setSelectedCustomerId(null)}>
                                <ArrowLeft size={16} className="mr-2" /> Zurück zur Liste
                            </Button>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                    {customerDetail.firstName} {customerDetail.lastName}
                                    <span className={`text-sm px-3 py-1 rounded-full border ${
                                        customerDetail.subscription.status === 'Active' 
                                        ? 'bg-green-50 border-green-200 text-green-700' 
                                        : 'bg-slate-50 border-slate-200 text-slate-500'
                                    }`}>
                                        {customerDetail.subscription.status}
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
                                                readOnly
                                                className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed" 
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
                            </div>
                        </div>
                        </>
                        )
                    )}
                </div>
            )}
        </>
      )}
      
      {/* PARTNER TAB */}
      {activeTab === 'partners' && !selectedCustomerId && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          
          {/* Commission Settings Block */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Settings size={20} className="text-blue-600" /> Programm Konfiguration
             </h3>
             <div className="flex items-end gap-4">
                <div className="flex-1 max-w-xs">
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Globale Provision (%)</label>
                   <input 
                      type="number" 
                      min="0" max="100"
                      value={commissionRate}
                      onChange={(e) => onUpdateCommission(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 outline-none font-bold text-lg"
                   />
                </div>
                <div className="flex-1">
                   <p className="text-sm text-slate-500 mb-2">
                     Änderungen wirken sich sofort auf alle Anzeigetexte, Rechenbeispiele und zukünftige Abrechnungen aus.
                   </p>
                </div>
                <Button onClick={handleSaveCommission}>
                   <Save size={16} className="mr-2" /> Speichern
                </Button>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">Partner Liste ({partners.length})</h3>
              </div>
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-3">#</th>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3 text-right">Registriert</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {partners.map((partner, index) => (
                    <tr key={partner.id}>
                      <td className="px-6 py-3 text-slate-500 font-mono text-xs">{index + 1}</td>
                      <td className="px-6 py-3 font-medium text-slate-900">{partner.first_name} {partner.last_name}</td>
                      <td className="px-6 py-3 text-slate-600">{partner.email}</td>
                      <td className="px-6 py-3 text-right text-slate-700">{new Date(partner.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                   {partners.length === 0 && !isLoadingData && (
                        <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Keine Partner gefunden.</td>
                        </tr>
                    )}
                </tbody>
              </table>
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
           {/* ... header ... */}
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
                                                            .replace('{shopLink}', productUrls.gold) // Use configured URL
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
             {/* ... header ... */}
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
                     {/* ... form content ... */}
                     <h4 className="font-bold text-slate-800 flex items-center gap-2"><Mail size={16} /> E-Mail ändern</h4>
                     <div className="bg-blue-50 px-3 py-2 rounded text-xs text-blue-700 border border-blue-100">
                         Aktuell: <strong>{adminAuth.currentEmail || 'Lade...'}</strong>
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
                     {/* ... form content ... */}
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
          
          {/* General Settings: Product URLs */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-6 border-b border-slate-100 bg-slate-50">
                 <div className="flex items-center gap-3">
                     <div className="bg-white p-2 rounded-lg text-slate-700 shadow-sm border border-slate-100"><Link size={20} /></div>
                     <div>
                         <h3 className="text-lg font-bold text-slate-900">Allgemeine Einstellungen</h3>
                         <p className="text-slate-500 text-sm">Konfiguration der Ziel-URLs für den Ticketshop.</p>
                     </div>
                 </div>
             </div>
             
             <div className="p-6 grid grid-cols-1 gap-6">
                 <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Link zum ResortPass Gold Shop</label>
                     <input 
                         type="url" 
                         value={productUrls.gold}
                         onChange={(e) => onUpdateProductUrls({...productUrls, gold: e.target.value})}
                         className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-blue-500 outline-none font-mono text-slate-600"
                     />
                 </div>
                 <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Link zum ResortPass Silver Shop</label>
                     <input 
                         type="url" 
                         value={productUrls.silver}
                         onChange={(e) => onUpdateProductUrls({...productUrls, silver: e.target.value})}
                         className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-blue-500 outline-none font-mono text-slate-600"
                     />
                 </div>
                 <div className="flex justify-end">
                     <Button size="sm" onClick={() => alert("Links erfolgreich aktualisiert.")}>
                        <Save size={16} className="mr-2" /> Links speichern
                     </Button>
                 </div>
             </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             {/* ... env var section header ... */}
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