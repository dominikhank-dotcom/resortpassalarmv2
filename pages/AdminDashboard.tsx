
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Settings, Briefcase, 
  TrendingUp, DollarSign, Activity, Database, Mail, 
  Sparkles, Key, ArrowLeft, UserX, Gift, Lock, Link, RefreshCw, Wallet, Check, Save, Terminal, Calendar, UserPlus, XCircle, Wrench, PiggyBank, Search, MessageSquare
} from 'lucide-react';
import { Button } from '../components/Button';
import { generateAdminInsights } from '../services/geminiService';
import { sendTemplateTest, testBrowseAiConnection, testGeminiConnection, manageSubscription, getCustomerDetails, updateSystemSettings, updateSystemStatus, getSystemSettings, getAdminPayouts, markPayoutComplete, adminUpdateCustomer, getEmailTemplates, saveEmailTemplate } from '../services/backendService';
import { EmailTemplate } from '../types';
import { supabase } from '../lib/supabase';

// --- DEFAULT TEMPLATES (Fallback) ---
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
  },
  // --- SMS TEMPLATES ---
  {
    id: 'sms_gold_alarm',
    name: 'SMS Alarm: Gold',
    description: 'SMS Text für Gold Verfügbarkeit.',
    category: 'SMS',
    subject: 'SMS Gold', // Placeholder subject
    body: '🚨 Gold ALARM! ResortPass verfügbar! Schnell: {link}',
    variables: ['{link}'],
    isEnabled: true
  },
  {
    id: 'sms_silver_alarm',
    name: 'SMS Alarm: Silver',
    description: 'SMS Text für Silver Verfügbarkeit.',
    category: 'SMS',
    subject: 'SMS Silver', // Placeholder subject
    body: '🚨 Silver ALARM! ResortPass verfügbar! Schnell: {link}',
    variables: ['{link}'],
    isEnabled: true
  }
];

interface AdminDashboardProps {
  commissionRate: number;
  onUpdateCommission: (rate: number) => void;
  productUrls: { gold: string, silver: string };
  onUpdateProductUrls: (urls: { gold: string, silver: string }) => void;
  prices: { new: number, existing: number };
  onUpdatePrices: (prices: { new: number, existing: number }) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ commissionRate, onUpdateCommission, productUrls, onUpdateProductUrls, prices, onUpdatePrices }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'customers' | 'partners' | 'emails' | 'settings'>('dashboard');
  
  // Real Data State
  const [customers, setCustomers] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState({ 
      activeUsers: 0, 
      revenue: 0, 
      profit: 0,
      newCustomers: 0, 
      conversionRate: 0 
  });
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [currentStatus, setCurrentStatus] = useState({ gold: 'unknown', silver: 'unknown', lastChecked: '' });
  
  // Date Filter State
  const [dateRange, setDateRange] = useState('28d'); // '7d', '28d', '90d', 'ytd', 'all'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Customer Detail State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerDetail, setCustomerDetail] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Partner Settings & Payouts
  const [aiInsights, setAiInsights] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pendingPayouts, setPendingPayouts] = useState<any[]>([]);
  const [isRepairing, setIsRepairing] = useState(false);

  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // Email Management State
  const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_TEMPLATES);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);

  // Admin Account Settings State
  const [adminAuth, setAdminAuth] = useState({
      currentEmail: '', 
      newEmail: '',
      emailPassword: '', 
      pwCurrent: '',
      pwNew: '',
      pwConfirm: ''
  });

  const calculateDateRange = () => {
      const end = new Date();
      let start = new Date();
      
      switch(dateRange) {
          case '7d': start.setDate(end.getDate() - 7); break;
          case '28d': start.setDate(end.getDate() - 28); break;
          case '90d': start.setDate(end.getDate() - 90); break;
          case 'ytd': start = new Date(new Date().getFullYear(), 0, 1); break;
          case 'all': return { startDate: null, endDate: null };
          default: return { startDate: null, endDate: null };
      }
      return { startDate: start.toISOString(), endDate: end.toISOString() };
  };

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
        }

        // 3. Fetch Partners
        const { data: partnerData } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'AFFILIATE')
          .order('created_at', { ascending: false });
        
        if (partnerData) setPartners(partnerData);

        // 4. Fetch Stats via Server API (Bypass RLS) with Date Range
        const { startDate, endDate } = calculateDateRange();
        let queryParams = '';
        if (startDate) queryParams = `?startDate=${startDate.split('T')[0]}&endDate=${endDate?.split('T')[0]}`;
        
        const statsRes = await fetch(`/api/admin-stats${queryParams}`);
        if (statsRes.ok) {
            const stats = await statsRes.json();
            setDashboardStats({
                activeUsers: stats.activeUsers || 0, 
                revenue: stats.revenue || 0,
                profit: stats.profit || 0,
                newCustomers: stats.newCustomers || 0, 
                conversionRate: stats.conversionRate || 0
            });
        }

        // 5. Fetch Current System Status (Availability)
        const settings = await getSystemSettings();
        if (settings) {
            setCurrentStatus({
                gold: settings.status_gold || 'unknown',
                silver: settings.status_silver || 'unknown',
                lastChecked: settings.last_checked || 'Nie'
            });
        }

        // 6. Fetch Pending Payouts (Only if tab is partners)
        if (activeTab === 'partners') {
            const payouts = await getAdminPayouts();
            if (payouts) setPendingPayouts(payouts);
        }

        // 7. Fetch Email Templates
        if (activeTab === 'emails') {
            const dbTemplates = await getEmailTemplates();
            if (dbTemplates) {
                if (dbTemplates.length > 0) {
                    // Map DB keys (snake_case) to Frontend types (camelCase)
                    const mappedTemplates = dbTemplates.map((t: any) => ({
                        id: t.id,
                        name: t.name,
                        description: t.description,
                        category: t.category, // May now include 'SMS'
                        subject: t.subject,
                        body: t.body,
                        variables: t.variables,
                        isEnabled: t.is_enabled
                    }));
                    setTemplates(mappedTemplates);
                }
            } else {
                // If getEmailTemplates returns null, it means there was an error fetching
                alert("Warnung: Konnte E-Mail Templates nicht laden. Zeige Standard-Werte.");
            }
        }

      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [activeTab, dateRange]); // Refetch when dateRange changes

  const handleManualStatusChange = async (type: 'gold' | 'silver', status: 'available' | 'sold_out') => {
      try {
          const result = await updateSystemStatus(type, status);
          setCurrentStatus(prev => ({ ...prev, [type]: status, lastChecked: new Date().toISOString() }));
          
          let msg = `Status für ${type} manuell auf ${status} gesetzt.`;
          if (status === 'available' && result.stats) {
              msg += `\n\nErgebnis:`;
              msg += `\n- Abos gefunden: ${result.stats.found_subs}`;
              msg += `\n- Mails gesendet: ${result.stats.sent}`;
              msg += `\n- Übersprungen (Keine E-Mail): ${result.stats.skipped_no_email}`;
              msg += `\n- Übersprungen (Deaktiviert): ${result.stats.skipped_disabled}`;
              msg += `\n- Fehler: ${result.stats.errors}`;
              
              if (result.logs && result.logs.length > 0) {
                  msg += `\n\nDetails (Letzte Einträge):`;
                  result.logs.slice(0, 5).forEach((l: any) => {
                      msg += `\n[${l.status}] ${l.email}: ${l.reason || 'OK'}`;
                  });
              }
          }
          alert(msg);
      } catch (e: any) {
          alert("Fehler beim Status-Update: " + e.message);
      }
  };

  const handleRunDiagnostics = async () => {
      const w = window.open('', '_blank');
      if (w) w.document.write('<h1>Lade System Diagnose...</h1>');
      
      try {
          const res = await fetch('/api/debug-users');
          const data = await res.json();
          if (w) {
              w.document.body.innerHTML = '';
              w.document.write('<h1>System Diagnose</h1>');
              w.document.write(`<p>Anzahl Nutzer: ${data.count}</p>`);
              w.document.write('<table border="1" style="border-collapse: collapse; width: 100%;"><thead><tr><th>Email</th><th>Name</th><th>Abo Status</th><th>Plan</th><th>Email Aktiv?</th></tr></thead><tbody>');
              data.users.forEach((u: any) => {
                  w.document.write(`<tr><td>${u.email}</td><td>${u.name}</td><td>${u.sub_status}</td><td>${u.plan}</td><td>${u.email_enabled}</td></tr>`);
              });
              w.document.write('</tbody></table>');
          }
      } catch (e: any) {
          if (w) w.document.write(`Fehler: ${e.message}`);
      }
  };

  const handleSelectCustomer = async (customer: any) => {
    setIsLoadingDetails(true);
    setSelectedCustomerId(customer.id);
    try {
        const response = await getCustomerDetails(customer.id);
        const sub = response.subscription;
        const profile = response.profile || customer;
        const details = {
            id: profile.id,
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            email: profile.email || '',
            address: { 
                street: profile.street || '', houseNumber: profile.house_number || '', zip: profile.zip || '', city: profile.city || '', country: profile.country || 'Deutschland' 
            },
            subscription: {
                status: sub ? (sub.status === 'active' ? 'Active' : 'Inactive') : 'Inactive',
                startDate: sub ? new Date(sub.created_at).toLocaleDateString() : '–',
                endDate: sub && sub.status !== 'active' ? new Date(sub.current_period_end).toLocaleDateString() : null,
                plan: sub ? sub.plan_type : 'Kein Abo',
                isFree: sub ? sub.plan_type === 'Manuell (Gratis)' : false,
                paymentMethod: sub ? 'Stripe' : '–'
            },
            referrer: profile.referred_by || null,
            transactions: []
        };
        setCustomerDetail(details);
    } catch (error: any) {
        alert("Fehler beim Laden der Kundendetails: " + error.message);
    } finally {
        setIsLoadingDetails(false);
    }
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerDetail) return;
    try {
        await adminUpdateCustomer({
            targetUserId: customerDetail.id,
            email: customerDetail.email,
            firstName: customerDetail.firstName,
            lastName: customerDetail.lastName,
            address: customerDetail.address
        });
        alert("Kundendaten (inkl. E-Mail) erfolgreich aktualisiert.");
    } catch (error: any) { alert("Fehler beim Speichern: " + error.message); }
  };

  const handleToggleFreeSubscription = async () => {
      if (!customerDetail) return;
      try {
        if (customerDetail.subscription.isFree) {
            if(confirm("Möchtest du das kostenlose Abo widerrufen?")) {
                await manageSubscription(customerDetail.id, 'revoke_free');
                setCustomerDetail({ ...customerDetail, subscription: { ...customerDetail.subscription, status: 'Inactive', isFree: false, plan: 'Standard' } });
                alert("Kostenloses Abo widerrufen.");
            }
        } else {
            if(confirm("Diesen Nutzer manuell kostenlos freischalten?")) {
                await manageSubscription(customerDetail.id, 'grant_free');
                setCustomerDetail({ ...customerDetail, subscription: { ...customerDetail.subscription, status: 'Active', isFree: true, plan: 'Manuell (Gratis)' } });
                alert("Kostenloses Abo gewährt.");
            }
        }
      } catch (error: any) { alert("Fehler: " + error.message); }
  };

  const handleCancelSubscription = async () => {
    if (!customerDetail) return;
    if(!confirm("Abo wirklich SOFORT beenden?")) return;
    try {
        await manageSubscription(customerDetail.id, 'cancel_sub');
        setCustomerDetail({ ...customerDetail, subscription: { ...customerDetail.subscription, status: 'Canceled', endDate: new Date().toLocaleDateString() } });
        alert("Abo gekündigt.");
    } catch (e: any) { alert("Fehler: " + e.message); }
  };

  const handleSaveCommission = async () => {
    try {
        await updateSystemSettings('global_commission_rate', commissionRate.toString());
        alert(`Globale Provision auf ${commissionRate}% gespeichert.`);
    } catch (error: any) { alert("Fehler: " + error.message); }
  };

  const handleMarkPayoutComplete = async (payoutId: string) => {
    if (confirm("Geld gesendet?")) {
        try {
            await markPayoutComplete(payoutId);
            setPendingPayouts(prev => prev.filter(p => p.id !== payoutId));
            alert("Markiert.");
        } catch (e: any) { alert("Fehler: " + e.message); }
    }
  }

  const handleRepairCommissions = async () => {
      setIsRepairing(true);
      try {
          const { data: { user } } = await supabase.auth.getUser();
          const response = await fetch('/api/admin-fix-commissions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user?.id })
          });
          const result = await response.json();
          alert(result.success ? `Erfolgreich! ${result.fixed} repariert.` : `Fehler: ${result.error}`);
      } catch (e: any) { alert("Fehler: " + e.message); } finally { setIsRepairing(false); }
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const insights = await generateAdminInsights({ activePartners: partners.length, totalCustomers: customers.length, revenue: dashboardStats.revenue });
      setAiInsights(insights);
    } catch (error) { setAiInsights("Fehler bei der Analyse."); } finally { setIsAnalyzing(false); }
  };

  const toggleEmailTemplate = (id: string) => { 
      setTemplates(prev => prev.map(t => {
          if (t.id === id) {
              const newState = !t.isEnabled;
              // Save immediately when toggling
              saveEmailTemplate({ ...t, isEnabled: newState }).catch(err => alert("Fehler beim Speichern: " + err.message));
              return { ...t, isEnabled: newState };
          }
          return t;
      })); 
  };
  
  const updateTemplate = (id: string, field: 'subject' | 'body', value: string) => { setTemplates(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t)); };
  
  const handleSaveTemplateLocal = async (id: string) => {
      const template = templates.find(t => t.id === id);
      if (template) {
          try {
              await saveEmailTemplate(template);
              alert("Template gespeichert!");
              setEditingTemplateId(null);
          } catch (e: any) {
              alert("Fehler: " + e.message);
          }
      }
  };

  const handleSendTestEmail = async (template: EmailTemplate) => {
    setIsSendingTestEmail(true);
    try { await sendTemplateTest(template, adminAuth.currentEmail, productUrls); alert("Gesendet!"); } catch (error: any) { alert("Fehler: " + error.message); } finally { setIsSendingTestEmail(false); }
  };

  const renderTabButton = (id: typeof activeTab, label: string, icon: React.ReactNode) => (
    <button onClick={() => setActiveTab(id)} className={`pb-4 px-4 flex items-center gap-2 font-medium text-sm transition-colors border-b-2 ${activeTab === id ? 'border-[#00305e] text-[#00305e]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>{icon}{label}</button>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div><h1 className="text-2xl font-bold text-slate-900">Admin Konsole</h1><p className="text-slate-500">Systemstatus & Management</p></div>
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200"><Activity size={14} /> System Online</div>
      </div>

      {!selectedCustomerId && (
        <div className="border-b border-slate-200 flex overflow-x-auto justify-between items-center">
            <div className="flex">
                {renderTabButton('dashboard', 'Dashboard', <LayoutDashboard size={18} />)}
                {renderTabButton('customers', 'Kunden', <Users size={18} />)}
                {renderTabButton('partners', 'Partner', <Briefcase size={18} />)}
                {renderTabButton('emails', 'E-Mail Management', <Mail size={18} />)}
                {renderTabButton('settings', 'Einstellungen', <Settings size={18} />)}
            </div>
            {activeTab === 'dashboard' && (
                <div className="flex items-center gap-2 pb-2"><Calendar size={16} className="text-slate-400" /><select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg block p-1.5"><option value="7d">Letzte 7 Tage</option><option value="28d">Letzte 28 Tage</option><option value="90d">Letzte 90 Tage</option><option value="ytd">Dieses Jahr (YTD)</option><option value="all">Gesamter Zeitraum</option></select></div>
            )}
        </div>
      )}

      {activeTab === 'dashboard' && !selectedCustomerId && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-slate-900 flex items-center gap-2"><RefreshCw size={20} className="text-blue-600" /> Live Status Override</h3><div className="text-xs text-slate-400">Letzte Prüfung: {currentStatus.lastChecked ? new Date(currentStatus.lastChecked).toLocaleString() : 'Nie'}</div></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {['gold', 'silver'].map(type => (
                      <div key={type} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <div className="flex justify-between items-center mb-3"><span className="font-bold text-slate-700">ResortPass {type === 'gold' ? 'Gold' : 'Silver'}</span><span className={`text-xs font-bold uppercase px-2 py-1 rounded ${currentStatus[type as 'gold'|'silver'] === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{currentStatus[type as 'gold'|'silver'] === 'available' ? 'Verfügbar' : 'Ausverkauft'}</span></div>
                          <div className="flex gap-2"><Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleManualStatusChange(type as 'gold'|'silver', 'available')}>Verfügbar setzen</Button><Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={() => handleManualStatusChange(type as 'gold'|'silver', 'sold_out')}>Ausverkauft setzen</Button></div>
                      </div>
                  ))}
              </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"><div className="flex justify-between items-start mb-4"><div><p className="text-slate-500 text-sm font-medium">Aktive Nutzer</p><h3 className="text-3xl font-bold text-slate-900">{isLoadingData ? '...' : dashboardStats.activeUsers}</h3></div><div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Users size={20} /></div></div><div className="text-xs text-green-600 flex items-center gap-1 font-medium"><TrendingUp size={12} /> Live aus DB (Gesamt)</div></div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"><div className="flex justify-between items-start mb-4"><div><p className="text-slate-500 text-sm font-medium">Umsatz / Monat</p><h3 className="text-3xl font-bold text-slate-900">{isLoadingData ? '...' : dashboardStats.revenue.toFixed(2)} €</h3></div><div className="bg-green-50 p-2 rounded-lg text-green-600"><DollarSign size={20} /></div></div><p className="text-xs text-slate-400">Aktuelles MRR (Laufend)</p></div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"><div className="flex justify-between items-start mb-4"><div><p className="text-slate-500 text-sm font-medium">Gewinn / Monat</p><h3 className="text-3xl font-bold text-green-700">{isLoadingData ? '...' : dashboardStats.profit.toFixed(2)} €</h3></div><div className="bg-emerald-50 p-2 rounded-lg text-emerald-600"><PiggyBank size={20} /></div></div><p className="text-xs text-slate-400">Netto (nach Provisionen)</p></div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"><div className="flex justify-between items-start mb-4"><div><p className="text-slate-500 text-sm font-medium">Neue Abos</p><h3 className="text-3xl font-bold text-slate-900">{isLoadingData ? '...' : dashboardStats.newCustomers}</h3></div><div className="bg-purple-50 p-2 rounded-lg text-purple-600"><UserPlus size={20} /></div></div><p className="text-xs text-slate-400">Im gewählten Zeitraum</p></div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"><div className="flex justify-between items-start mb-4"><div><p className="text-slate-500 text-sm font-medium">Conversion Rate</p><h3 className="text-3xl font-bold text-slate-900">{isLoadingData ? '...' : dashboardStats.conversionRate}%</h3></div><div className="bg-amber-50 p-2 rounded-lg text-amber-600"><Activity size={20} /></div></div><div className="text-xs text-slate-400">Bezahlte Abos / Anmeldungen</div></div>
          </div>
        </div>
      )}

      {activeTab === 'customers' && (
        <>
            {!selectedCustomerId ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center"><h3 className="text-lg font-bold text-slate-900">Kundenverzeichnis ({customers.length})</h3></div>
                    <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold"><tr><th className="px-6 py-4">Kunden ID</th><th className="px-6 py-4">Name</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Beigetreten am</th><th className="px-6 py-4 text-right">Aktionen</th></tr></thead><tbody className="divide-y divide-slate-100">{customers.map((customer) => (<tr key={customer.id} className="hover:bg-slate-50 transition-colors"><td className="px-6 py-4 font-mono text-xs text-slate-500">{customer.id.substring(0,8)}...</td><td className="px-6 py-4 font-medium text-slate-900">{customer.first_name} {customer.last_name}</td><td className="px-6 py-4 text-slate-600">{customer.email}</td><td className="px-6 py-4 text-slate-500 text-sm">{new Date(customer.created_at).toLocaleDateString()}</td><td className="px-6 py-4 text-right"><button onClick={() => handleSelectCustomer(customer)} className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded hover:bg-blue-50">Details</button></td></tr>))}</tbody></table></div>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-right-4">
                    <div className="flex items-center gap-4 mb-6"><Button variant="outline" size="sm" onClick={() => setSelectedCustomerId(null)}><ArrowLeft size={16} className="mr-2" /> Zurück zur Liste</Button><div className="flex-1"><h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">{customerDetail?.firstName} {customerDetail?.lastName}{customerDetail?.subscription.isFree && (<span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-bold">Free User</span>)}{customerDetail?.subscription.status === 'Active' && !customerDetail?.subscription.isFree && (<span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">Premium</span>)}</h2></div></div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"><h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Users size={20} className="text-blue-600" /> Stammdaten Bearbeiten</h3><form onSubmit={handleSaveCustomer} className="space-y-4"><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vorname</label><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg" value={customerDetail?.firstName} onChange={e => setCustomerDetail({...customerDetail, firstName: e.target.value})} /></div><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nachname</label><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg" value={customerDetail?.lastName} onChange={e => setCustomerDetail({...customerDetail, lastName: e.target.value})} /></div></div><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-Mail Adresse</label><input type="email" className="w-full px-3 py-2 border border-slate-300 rounded-lg" value={customerDetail?.email} onChange={e => setCustomerDetail({...customerDetail, email: e.target.value})} /></div><div className="flex justify-end pt-2"><Button type="submit" size="sm" variant="outline"><Save size={14} className="mr-2" /> Änderungen speichern</Button></div></form></div>
                        </div>
                        <div className="space-y-6"><div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"><h3 className="font-bold text-slate-900 mb-4">Abo Übersicht</h3><div className="space-y-3 text-sm"><div className="flex justify-between py-2 border-b border-slate-50"><span className="text-slate-500">Status</span><span className={`font-bold ${customerDetail?.subscription.status === 'Active' ? 'text-green-600' : 'text-slate-900'}`}>{customerDetail?.subscription.status}</span></div><div className="flex justify-between py-2 border-b border-slate-50"><span className="text-slate-500">Plan</span><span className="font-medium text-slate-900">{customerDetail?.subscription.plan}</span></div></div><div className="pt-4 border-t border-slate-100 space-y-2"><Button onClick={handleToggleFreeSubscription} variant="secondary" className={`w-full justify-center border ${customerDetail?.subscription.isFree ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-white text-purple-600 border-purple-200 hover:bg-purple-50'}`}>{customerDetail?.subscription.isFree ? <><UserX size={16} className="mr-2" /> Kostenloses Abo entziehen</> : <><Gift size={16} className="mr-2" /> Kostenloses Abo geben</>}</Button>{!customerDetail?.subscription.isFree && customerDetail?.subscription.status === 'Active' && (<Button onClick={handleCancelSubscription} variant="secondary" className="w-full justify-center bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"><XCircle size={16} className="mr-2" /> Abo sofort kündigen</Button>)}</div></div></div>
                    </div>
                </div>
            )}
        </>
      )}
      
      {activeTab === 'partners' && !selectedCustomerId && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"><div className="flex justify-between items-start mb-4"><h3 className="font-bold text-slate-900 flex items-center gap-2"><Settings size={20} className="text-blue-600" /> Programm Konfiguration</h3><Button onClick={handleRepairCommissions} disabled={isRepairing} size="sm" variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200"><Wrench size={16} className={isRepairing ? "animate-spin mr-2" : "mr-2"} />{isRepairing ? "Prüfe..." : "Provisionen Reparieren"}</Button></div><div className="flex items-end gap-4"><div className="flex-1 max-w-xs"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Globale Provision (%)</label><input type="number" min="0" max="100" value={commissionRate} onChange={(e) => onUpdateCommission(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 outline-none font-bold text-lg" /></div><div className="flex-1"><p className="text-sm text-slate-500 mb-2">Änderungen wirken sich sofort auf alle Anzeigetexte, Rechenbeispiele und zukünftige Abrechnungen aus.</p></div><Button onClick={handleSaveCommission}><Save size={16} className="mr-2" /> Speichern</Button></div></div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8"><div className="p-6 border-b border-slate-100 bg-amber-50"><h3 className="font-bold text-amber-900 flex items-center gap-2"><Wallet size={20} /> Offene Auszahlungen (PayPal)</h3></div><table className="w-full text-left"><thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold"><tr><th className="px-6 py-3">Datum</th><th className="px-6 py-3">Partner</th><th className="px-6 py-3">PayPal Email</th><th className="px-6 py-3 text-right">Betrag</th><th className="px-6 py-3 text-right">Aktion</th></tr></thead><tbody className="divide-y divide-slate-100">{pendingPayouts.map((payout) => (<tr key={payout.id}><td className="px-6 py-4 text-slate-500 text-sm">{new Date(payout.requested_at).toLocaleDateString()}</td><td className="px-6 py-4 font-medium text-slate-900">{payout.profiles?.first_name} {payout.profiles?.last_name}</td><td className="px-6 py-4 text-slate-600 font-mono text-sm bg-slate-50">{payout.paypal_email}</td><td className="px-6 py-4 text-right font-bold text-green-600">{Number(payout.amount).toFixed(2)} €</td><td className="px-6 py-4 text-right"><Button size="sm" onClick={() => handleMarkPayoutComplete(payout.id)}><Check size={14} className="mr-1" /> Geld gesendet</Button></td></tr>))}</tbody></table></div>
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8"><div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"><div className="p-6 border-b border-slate-100"><h3 className="font-bold text-slate-900">Partner Liste ({partners.length})</h3></div><table className="w-full text-left"><thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold"><tr><th className="px-6 py-3">#</th><th className="px-6 py-3">Name</th><th className="px-6 py-3">Email</th><th className="px-6 py-3">Code</th><th className="px-6 py-3 text-right">Registriert</th></tr></thead><tbody className="divide-y divide-slate-100">{partners.map((partner, index) => (<tr key={partner.id}><td className="px-6 py-3 text-slate-500 font-mono text-xs">{index + 1}</td><td className="px-6 py-3 font-medium text-slate-900">{partner.first_name} {partner.last_name}</td><td className="px-6 py-3 text-slate-600">{partner.email}</td><td className="px-6 py-3"><span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200 block w-fit">{partner.referral_code || '—'}</span></td><td className="px-6 py-3 text-right text-slate-700">{new Date(partner.created_at).toLocaleDateString()}</td></tr>))}</tbody></table></div></div>
          </div>
      )}

      {activeTab === 'emails' && !selectedCustomerId && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"><h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Mail size={20} className="text-blue-600" /> System E-Mails</h2></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Customers */}
                 <div className="space-y-4"><h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Kunden Kommunikation</h3>{templates.filter(t => t.category === 'CUSTOMER').map(template => (<div key={template.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-blue-300 transition-colors"><div className="p-4 flex items-start justify-between bg-slate-50/50 border-b border-slate-100"><div><h4 className="font-bold text-slate-900">{template.name}</h4><p className="text-xs text-slate-500 mt-1">{template.description}</p></div><div className="flex items-center gap-2"><button onClick={() => toggleEmailTemplate(template.id)} className={`w-8 h-4 rounded-full relative transition-colors ${template.isEnabled ? 'bg-green-500' : 'bg-slate-300'}`}><div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${template.isEnabled ? 'left-4.5' : 'left-0.5'}`}></div></button></div></div>{editingTemplateId === template.id ? (<div className="p-4 space-y-4 bg-slate-50"><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Betreff</label><input type="text" value={template.subject} onChange={(e) => updateTemplate(template.id, 'subject', e.target.value)} className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg" /></div><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Inhalt (HTML)</label><textarea value={template.body} onChange={(e) => updateTemplate(template.id, 'body', e.target.value)} className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg h-32 font-mono text-xs" /></div><div className="flex justify-end gap-2 pt-2"><Button size="sm" variant="outline" onClick={() => setEditingTemplateId(null)}>Abbrechen</Button><Button size="sm" onClick={() => handleSaveTemplateLocal(template.id)}>Speichern</Button></div></div>) : (<div className="p-4"><div className="text-sm text-slate-600 mb-3 font-medium">Betreff: {template.subject}</div><div className="flex gap-2 justify-end"><Button size="sm" variant="secondary" onClick={() => handleSendTestEmail(template)} disabled={isSendingTestEmail}>Test senden</Button><Button size="sm" variant="outline" onClick={() => setEditingTemplateId(template.id)}>Bearbeiten</Button></div></div>)}</div>))}</div>
                 
                 {/* Partners + SMS */}
                 <div className="space-y-8">
                    <div className="space-y-4"><h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Partner Kommunikation</h3>{templates.filter(t => t.category === 'PARTNER').map(template => (<div key={template.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-purple-300 transition-colors"><div className="p-4 flex items-start justify-between bg-slate-50/50 border-b border-slate-100"><div><h4 className="font-bold text-slate-900">{template.name}</h4><p className="text-xs text-slate-500 mt-1">{template.description}</p></div><div className="flex items-center gap-2"><button onClick={() => toggleEmailTemplate(template.id)} className={`w-8 h-4 rounded-full relative transition-colors ${template.isEnabled ? 'bg-green-500' : 'bg-slate-300'}`}><div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${template.isEnabled ? 'left-4.5' : 'left-0.5'}`}></div></button></div></div>{editingTemplateId === template.id ? (<div className="p-4 space-y-4 bg-slate-50"><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Betreff</label><input type="text" value={template.subject} onChange={(e) => updateTemplate(template.id, 'subject', e.target.value)} className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg" /></div><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Inhalt (HTML)</label><textarea value={template.body} onChange={(e) => updateTemplate(template.id, 'body', e.target.value)} className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg h-32 font-mono text-xs" /></div><div className="flex justify-end gap-2 pt-2"><Button size="sm" variant="outline" onClick={() => setEditingTemplateId(null)}>Abbrechen</Button><Button size="sm" onClick={() => handleSaveTemplateLocal(template.id)}>Speichern</Button></div></div>) : (<div className="p-4"><div className="text-sm text-slate-600 mb-3 font-medium">Betreff: {template.subject}</div><div className="flex gap-2 justify-end"><Button size="sm" variant="secondary" onClick={() => handleSendTestEmail(template)} disabled={isSendingTestEmail}>Test senden</Button><Button size="sm" variant="outline" onClick={() => setEditingTemplateId(template.id)}>Bearbeiten</Button></div></div>)}</div>))}</div>
                    
                    {/* SMS Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><MessageSquare size={16} /> SMS Vorlagen (Twilio)</h3>
                        {templates.filter(t => t.category === 'SMS').map(template => (
                            <div key={template.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-orange-300 transition-colors">
                                <div className="p-4 flex items-start justify-between bg-slate-50/50 border-b border-slate-100">
                                    <div><h4 className="font-bold text-slate-900">{template.name}</h4><p className="text-xs text-slate-500 mt-1">{template.description}</p></div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => toggleEmailTemplate(template.id)} className={`w-8 h-4 rounded-full relative transition-colors ${template.isEnabled ? 'bg-green-500' : 'bg-slate-300'}`}><div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${template.isEnabled ? 'left-4.5' : 'left-0.5'}`}></div></button>
                                    </div>
                                </div>
                                {editingTemplateId === template.id ? (
                                    <div className="p-4 space-y-4 bg-slate-50">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Inhalt (Kein HTML!)</label>
                                            <textarea 
                                                value={template.body} 
                                                onChange={(e) => updateTemplate(template.id, 'body', e.target.value)} 
                                                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg h-24 font-mono text-xs" 
                                            />
                                            <p className={`text-xs text-right mt-1 ${template.body.length > 160 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                                                {template.body.length} / 160 Zeichen (1 SMS)
                                            </p>
                                        </div>
                                        <div className="flex justify-end gap-2 pt-2">
                                            <Button size="sm" variant="outline" onClick={() => setEditingTemplateId(null)}>Abbrechen</Button>
                                            <Button size="sm" onClick={() => handleSaveTemplateLocal(template.id)}>Speichern</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4">
                                        <div className="text-sm text-slate-600 mb-3 font-mono bg-slate-50 p-2 rounded border border-slate-100">
                                            {template.body}
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <Button size="sm" variant="outline" onClick={() => setEditingTemplateId(template.id)}>Bearbeiten</Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                 </div>
              </div>
          </div>
      )}

      {activeTab === 'settings' && !selectedCustomerId && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"><h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><DollarSign size={20} className="text-green-600" /> Preisgestaltung</h3><div className="space-y-4"><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Preis für Neukunden (€)</label><div className="flex gap-2"><input type="number" step="0.01" value={prices.new} onChange={(e) => onUpdatePrices({...prices, new: Number(e.target.value)})} className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 outline-none" /></div></div><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Basispreis Bestandskunden (€)</label><div className="flex gap-2"><input type="number" step="0.01" value={prices.existing} onChange={(e) => onUpdatePrices({...prices, existing: Number(e.target.value)})} className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 outline-none" /></div></div><div className="pt-2"><Button size="sm" onClick={() => { updateSystemSettings('price_new_customers', prices.new.toString()); updateSystemSettings('price_existing_customers', prices.existing.toString()); alert("Preise gespeichert!"); }}>Preise Speichern</Button></div></div></div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"><h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Link size={20} className="text-blue-600" /> Produkt Links</h3><div className="space-y-4"><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">ResortPass Gold URL</label><input type="text" value={productUrls.gold} onChange={(e) => onUpdateProductUrls({...productUrls, gold: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" /></div><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">ResortPass Silver URL</label><input type="text" value={productUrls.silver} onChange={(e) => onUpdateProductUrls({...productUrls, silver: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" /></div><div className="pt-2"><Button size="sm" onClick={() => alert("Links aktualisiert")}>Links Speichern</Button></div></div></div>
              </div>
              
              {/* DIAGNOSTICS */}
              <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200">
                  <h3 className="font-bold text-amber-900 mb-4 flex items-center gap-2">
                      <Search size={20} className="text-amber-700" /> Datenbank Inspektion
                  </h3>
                  <p className="text-sm text-amber-800 mb-4">
                      Zeigt eine rohe Liste aller Nutzer und deren Abo/Email Status an. Hilfreich, wenn Mails nicht ankommen.
                  </p>
                  <Button variant="secondary" onClick={handleRunDiagnostics} className="bg-white text-amber-800 border-amber-300 hover:bg-amber-100">
                      System Diagnose (User & Abos) öffnen
                  </Button>
              </div>

              {/* Integrations Test */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200"><h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Terminal size={20} className="text-slate-600" /> Integrationen testen</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Button variant="outline" onClick={async () => { setIsTestingConnection(true); try { const res = await testBrowseAiConnection(); alert(res.success ? "Browse.ai Verbunden! Robot: " + res.robotName : "Fehler: " + res.message); } catch (e: any) { alert("Test Fehlgeschlagen: " + e.message); } setIsTestingConnection(false); }} disabled={isTestingConnection}>Browse.ai Verbindung testen</Button><Button variant="outline" onClick={async () => { setIsTestingConnection(true); try { const res = await testGeminiConnection(); alert(res.success ? "Gemini Verbunden! " + res.message : "Fehler: " + res.message); } catch (e: any) { alert("Test Fehlgeschlagen: " + e.message); } setIsTestingConnection(false); }} disabled={isTestingConnection}>Google Gemini Verbindung testen</Button></div></div>
          </div>
      )}
    </div>
  );
};
