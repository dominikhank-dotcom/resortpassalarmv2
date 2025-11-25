import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Settings, Briefcase, 
  TrendingUp, DollarSign, Activity, Calendar, 
  Search, Save, Database, CreditCard, Mail, MessageSquare, 
  Sparkles, Download, AlertCircle, CheckCircle, Globe, Key,
  ArrowLeft, RotateCcw, AlertTriangle, UserX, UserCheck, Ban,
  Wifi, Edit3, Eye, Send, X, Copy, Terminal, Gift, Lock, Shield, Link,
  FileSpreadsheet, Loader2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend 
} from 'recharts';
import { Button } from '../components/Button';
import { generateAdminInsights } from '../services/geminiService';
import { sendTestAlarm, sendTemplateTest, testBrowseAiConnection, testGeminiConnection, fetchAdminPayouts, markPayoutPaid, toggleFreeSubscription } from '../services/backendService';
import { EmailTemplate } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Real Templates List
const DEFAULT_TEMPLATES: EmailTemplate[] = [
    // CUSTOMER TEMPLATES
    {
        id: 'c1',
        name: 'Kunde: Registrierung',
        description: 'Willkommensmail nach Account-Erstellung',
        category: 'CUSTOMER',
        subject: 'Willkommen beim ResortPass Wächter',
        body: '<p>Hallo {firstName},</p><p>Willkommen an Bord! Dein Account wurde erfolgreich erstellt.</p><p>Du kannst dich jetzt einloggen und deine Alarme konfigurieren.</p><p><a href="{loginLink}">Jetzt einloggen</a></p>',
        variables: ['{firstName}', '{loginLink}'],
        isEnabled: true
    },
    {
        id: 'c2',
        name: 'Kunde: Passwort vergessen',
        description: 'Link zum Zurücksetzen des Passworts',
        category: 'CUSTOMER',
        subject: 'Passwort zurücksetzen',
        body: '<p>Hallo,</p><p>Du hast angefordert, dein Passwort zurückzusetzen.</p><p>Klicke hier: <a href="{resetLink}">Neues Passwort festlegen</a></p>',
        variables: ['{resetLink}'],
        isEnabled: true
    },
    {
        id: 'c3',
        name: 'Kunde: Abo Aktiviert',
        description: 'Bestätigung nach erfolgreicher Zahlung',
        category: 'CUSTOMER',
        subject: 'Dein Premium-Schutz ist aktiv!',
        body: '<p>Hallo {firstName},</p><p>Vielen Dank! Deine Zahlung war erfolgreich.</p><p>Wir überwachen ab sofort den ResortPass Gold & Silver für dich im Minutentakt.</p><p><a href="{dashboardLink}">Zum Dashboard</a></p>',
        variables: ['{firstName}', '{dashboardLink}'],
        isEnabled: true
    },
    {
        id: 'c4',
        name: 'Kunde: Abo Abgelaufen',
        description: 'Wenn Kündigung wirksam wird',
        category: 'CUSTOMER',
        subject: 'Dein Schutz ist abgelaufen',
        body: '<p>Hallo {firstName},</p><p>Dein Abonnement ist heute abgelaufen. Deine Alarme sind pausiert.</p><p>Reaktiviere deinen Schutz jederzeit, um keine Chance zu verpassen.</p><p><a href="{dashboardLink}">Jetzt reaktivieren</a></p>',
        variables: ['{firstName}', '{dashboardLink}'],
        isEnabled: true
    },
    {
        id: 'c5',
        name: 'Kunde: ALARM (Gold/Silver)',
        description: 'Wird bei Verfügbarkeit gesendet',
        category: 'CUSTOMER',
        subject: '🚨 ALARM: {productName} verfügbar!',
        body: '<h1>Schnell sein!</h1><p>{productName} ist jetzt verfügbar.</p><p>Klicke sofort auf den Link:</p><p><a href="{shopLink}" style="font-size:18px; font-weight:bold;">Zum Europa-Park Shop</a></p><p>Viel Erfolg!</p>',
        variables: ['{productName}', '{shopLink}'],
        isEnabled: true
    },
    {
        id: 'c6',
        name: 'Kunde: Test Alarm',
        description: 'Manueller Test vom Dashboard',
        category: 'CUSTOMER',
        subject: '🔔 TEST-ALARM: ResortPass Wächter',
        body: '<p>Dies ist ein <strong>Test-Alarm</strong>.</p><p>Deine Einstellungen sind korrekt! Wir melden uns, wenn es ernst wird.</p>',
        variables: [],
        isEnabled: true
    },

    // PARTNER TEMPLATES
    {
        id: 'p1',
        name: 'Partner: Registrierung',
        description: 'Bestätigung der Partner-Anmeldung',
        category: 'PARTNER',
        subject: 'Willkommen im Partnerprogramm',
        body: '<p>Hallo {firstName},</p><p>Du bist dabei! Dein Partner-Account ist aktiv.</p><p>Dein Tracking-Link wartet bereits auf dich.</p><p><a href="{affiliateLink}">Zum Partner Dashboard</a></p>',
        variables: ['{firstName}', '{affiliateLink}'],
        isEnabled: true
    },
    {
        id: 'p2',
        name: 'Partner: Passwort vergessen',
        description: 'Reset Link für Partner',
        category: 'PARTNER',
        subject: 'Partner Login: Passwort zurücksetzen',
        body: '<p>Hallo,</p><p>Hier ist dein Link zum Zurücksetzen des Passworts:</p><p><a href="{resetLink}">Neues Passwort</a></p>',
        variables: ['{resetLink}'],
        isEnabled: true
    },
    {
        id: 'p3',
        name: 'Partner: Statistik / Monatsbericht',
        description: 'Monatliche Übersicht (Optional)',
        category: 'PARTNER',
        subject: 'Deine Einnahmen im {month}',
        body: '<p>Hallo {firstName},</p><p>Hier ist dein Update für {month}:</p><ul><li>Neue Kunden: {newCustomers}</li><li>Umsatz: {revenue} €</li><li><strong>Deine Provision: {commission} €</strong></li></ul><p>Weiter so!</p>',
        variables: ['{firstName}', '{month}', '{newCustomers}', '{revenue}', '{commission}'],
        isEnabled: true
    },
    {
        id: 'p4',
        name: 'Partner: Auszahlung',
        description: 'Bestätigung einer Auszahlung',
        category: 'PARTNER',
        subject: 'Geld ist unterwegs! 💸',
        body: '<p>Hallo {firstName},</p><p>Wir haben soeben deine Auszahlung in Höhe von <strong>{commission} €</strong> veranlasst.</p><p>Das Geld sollte in Kürze auf deinem Konto eingehen.</p>',
        variables: ['{firstName}', '{commission}'],
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'customers' | 'partners' | 'emails' | 'finance' | 'settings'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Stats State
  const [stats, setStats] = useState({
      revenue: 0,
      activeCustomers: 0,
      partnerCommissions: 0,
      apiCalls: 0 // Cannot track this easily without DB logging, will stay 0 or mock
  });

  // AI States
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Email States
  const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_TEMPLATES);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [testEmail, setTestEmail] = useState("dominikhank@gmail.com");
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Customer Management
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");

  // Admin Account Settings
  const [adminEmail, setAdminEmail] = useState("dominikhank@gmail.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Payouts State (Finance Tab)
  const [payouts, setPayouts] = useState<any[]>([]);
  const [isLoadingPayouts, setIsLoadingPayouts] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    if (activeTab === 'dashboard') {
        loadDashboardStats();
    }
    if (activeTab === 'finance') {
        loadPayouts();
    }
    if (activeTab === 'customers') {
        loadCustomers();
    }
  }, [activeTab]);

  const loadDashboardStats = async () => {
      try {
          // 1. Count Active Subscriptions
          const { count: subCount } = await supabase
            .from('subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active');
          
          // 2. Sum Pending Commissions
          const { data: comms } = await supabase
            .from('commissions')
            .select('amount');
          
          const totalComms = comms?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;

          // 3. Estimate Revenue (Active Subs * 1.99) - simplified
          // In reality you would sum up stripe invoices via webhook events stored in a 'payments' table
          const estimatedRevenue = (subCount || 0) * 1.99; 

          setStats({
              activeCustomers: subCount || 0,
              revenue: estimatedRevenue,
              partnerCommissions: totalComms,
              apiCalls: 0 // Real API tracking requires middleware logging
          });

      } catch (e) {
          console.error("Stats load error", e);
      }
  };

  const loadPayouts = async () => {
      setIsLoadingPayouts(true);
      try {
          const data = await fetchAdminPayouts();
          setPayouts(data || []);
      } catch (e) {
          alert("Fehler beim Laden der Auszahlungen");
      } finally {
          setIsLoadingPayouts(false);
      }
  };

  const loadCustomers = async () => {
      setIsLoadingCustomers(true);
      try {
          const { data: profiles, error } = await supabase
            .from('profiles')
            .select(`
                *,
                subscriptions (status, plan, current_period_end)
            `)
            .order('created_at', { ascending: false });

          if (error) throw error;
          
          const mappedCustomers = profiles.map(p => {
              const sub = p.subscriptions?.[0]; // Assuming 1 sub per user
              const isFree = sub?.plan === 'free_admin';
              return {
                  id: p.id,
                  name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unbekannt',
                  email: p.email,
                  status: sub?.status === 'active' ? 'Aktiv' : 'Inaktiv',
                  plan: isFree ? 'Manuell (Gratis)' : sub?.plan || '-',
                  isFree: isFree,
                  since: new Date(p.created_at).toLocaleDateString(),
                  street: p.street || '',
                  nr: p.house_number || '',
                  zip: p.zip || '',
                  city: p.city || '',
                  country: p.country || 'Deutschland'
              };
          });

          setCustomers(mappedCustomers);
      } catch (e: any) {
          console.error("Load Customers Error", e);
      } finally {
          setIsLoadingCustomers(false);
      }
  };

  const handleToggleFreeSub = async (customerId: string, currentIsFree: boolean) => {
      try {
         await toggleFreeSubscription(customerId, !currentIsFree);
         
         // Update Local State
         setCustomers(prev => prev.map(c => c.id === customerId ? {
             ...c, 
             isFree: !currentIsFree,
             plan: !currentIsFree ? 'Manuell (Gratis)' : '-',
             status: !currentIsFree ? 'Aktiv' : 'Inaktiv'
         } : c));
         
         if (selectedCustomer?.id === customerId) {
             setSelectedCustomer(prev => ({
                 ...prev,
                 isFree: !currentIsFree,
                 plan: !currentIsFree ? 'Manuell (Gratis)' : '-',
                 status: !currentIsFree ? 'Aktiv' : 'Inaktiv'
             }));
         }

         alert(!currentIsFree ? "Kostenloses Abo aktiviert!" : "Kostenloses Abo deaktiviert.");
      } catch (e: any) {
          alert("Fehler: " + e.message);
      }
  };

  const handleGenerateInsights = async () => {
    setIsAnalyzing(true);
    setAiAnalysis("Analysiere Daten...");
    try {
        // Here we would pass real data, for now we pass stats
      const text = await generateAdminInsights({
          activeCustomers: stats.activeCustomers,
          revenue: stats.revenue,
          commissions: stats.partnerCommissions
      });
      setAiAnalysis(text);
    } catch (e) {
      setAiAnalysis("Fehler bei der Analyse.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTestConnection = async (service: 'browse' | 'stripe' | 'resend' | 'twilio' | 'gemini') => {
    if (service === 'browse') {
        try {
            const res = await testBrowseAiConnection();
            alert(res.message);
        } catch (e: any) {
            alert("Fehler: " + e.message);
        }
        return;
    }
    if (service === 'gemini') {
        try {
            const res = await testGeminiConnection();
            alert(res.message);
        } catch (e: any) {
            alert("Fehler: " + e.message);
        }
        return;
    }
    // Simulation for others
    setTimeout(() => {
        alert(`${service.toUpperCase()} Verbindung erfolgreich! (Simuliert)`);
    }, 1000);
  };

  const handleSendTestEmail = async () => {
    if (!editingTemplate) return;
    setIsSendingTest(true);
    try {
      await sendTemplateTest(editingTemplate, testEmail, productUrls);
      alert(`Test-Email gesendet an ${testEmail}`);
    } catch (e: any) {
      alert("Fehler: " + e.message);
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleMarkPaid = async (payoutId: string) => {
      if (!confirm("Auszahlung als 'Bezahlt' markieren? Dies informiert den Partner.")) return;
      try {
          await markPayoutPaid(payoutId);
          await loadPayouts(); // Refresh
          alert("Status aktualisiert.");
      } catch (e: any) {
          alert("Fehler: " + e.message);
      }
  };

  const handleExportPayPalCSV = () => {
      const pendingPayouts = payouts.filter(p => p.status === 'pending');
      if (pendingPayouts.length === 0) {
          alert("Keine offenen Auszahlungen für den Export.");
          return;
      }

      // Format: Email, Amount, Currency, ID
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Email,Amount,Currency,ReferenceID\n";
      
      pendingPayouts.forEach(p => {
          csvContent += `${p.paypal_email},${p.amount},EUR,${p.id}\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `paypal_payouts_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const filteredCustomers = customers.filter(c => 
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
      c.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  // Render Functions
  const renderSidebar = () => (
    <div className={`bg-[#00305e] text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col fixed h-full z-20`}>
      <div className="p-4 border-b border-blue-800 flex items-center justify-between">
        {isSidebarOpen ? <span className="font-bold text-xl">Admin</span> : <span className="font-bold text-xl mx-auto">A</span>}
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-blue-800 rounded">
          {isSidebarOpen ? <ArrowLeft size={18} /> : <ArrowLeft size={18} className="rotate-180" />}
        </button>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-3 w-full p-3 rounded-lg transition ${activeTab === 'dashboard' ? 'bg-[#ffcc00] text-[#00305e] font-bold' : 'hover:bg-blue-800'}`}>
          <LayoutDashboard size={20} />
          {isSidebarOpen && "Dashboard"}
        </button>
        <button onClick={() => setActiveTab('customers')} className={`flex items-center gap-3 w-full p-3 rounded-lg transition ${activeTab === 'customers' ? 'bg-[#ffcc00] text-[#00305e] font-bold' : 'hover:bg-blue-800'}`}>
          <Users size={20} />
          {isSidebarOpen && "Kunden"}
        </button>
        <button onClick={() => setActiveTab('partners')} className={`flex items-center gap-3 w-full p-3 rounded-lg transition ${activeTab === 'partners' ? 'bg-[#ffcc00] text-[#00305e] font-bold' : 'hover:bg-blue-800'}`}>
          <Briefcase size={20} />
          {isSidebarOpen && "Partner"}
        </button>
        <button onClick={() => setActiveTab('emails')} className={`flex items-center gap-3 w-full p-3 rounded-lg transition ${activeTab === 'emails' ? 'bg-[#ffcc00] text-[#00305e] font-bold' : 'hover:bg-blue-800'}`}>
          <Mail size={20} />
          {isSidebarOpen && "E-Mail Management"}
        </button>
        <button onClick={() => setActiveTab('finance')} className={`flex items-center gap-3 w-full p-3 rounded-lg transition ${activeTab === 'finance' ? 'bg-[#ffcc00] text-[#00305e] font-bold' : 'hover:bg-blue-800'}`}>
          <FileSpreadsheet size={20} />
          {isSidebarOpen && "Finanzen"}
        </button>
        <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-3 w-full p-3 rounded-lg transition ${activeTab === 'settings' ? 'bg-[#ffcc00] text-[#00305e] font-bold' : 'hover:bg-blue-800'}`}>
          <Settings size={20} />
          {isSidebarOpen && "Einstellungen"}
        </button>
      </nav>

      <div className="p-4 border-t border-blue-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center">A</div>
          {isSidebarOpen && (
              <div className="overflow-hidden">
                  <p className="text-sm font-bold truncate">Admin</p>
                  <p className="text-xs text-blue-300 truncate">Online</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {renderSidebar()}
      
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'} p-8`}>
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in">
            <h1 className="text-2xl font-bold text-slate-900">Dashboard Übersicht</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 text-sm">Monatlicher Umsatz (Est.)</p>
                    <h3 className="text-2xl font-bold text-slate-900">{stats.revenue.toFixed(2)} €</h3>
                  </div>
                  <div className="bg-green-50 p-2 rounded-lg text-green-600"><DollarSign size={20} /></div>
                </div>
                <div className="mt-4 flex items-center text-sm text-green-600">
                   Basierend auf {stats.activeCustomers} aktiven Abos
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 text-sm">Aktive Kunden</p>
                    <h3 className="text-2xl font-bold text-slate-900">{stats.activeCustomers}</h3>
                  </div>
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Users size={20} /></div>
                </div>
                <div className="mt-4 flex items-center text-sm text-blue-600">
                  Realtime aus DB
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 text-sm">Partner Provisionen (Ges.)</p>
                    <h3 className="text-2xl font-bold text-slate-900">{stats.partnerCommissions.toFixed(2)} €</h3>
                  </div>
                  <div className="bg-purple-50 p-2 rounded-lg text-purple-600"><Briefcase size={20} /></div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 text-sm">API Health</p>
                    <h3 className="text-xl font-bold text-slate-900">OK</h3>
                  </div>
                  <div className="bg-orange-50 p-2 rounded-lg text-orange-600"><Activity size={20} /></div>
                </div>
                <div className="mt-4 text-sm text-slate-400">System läuft</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[400px] flex items-center justify-center text-slate-400 flex-col">
              <h3 className="text-lg font-bold text-slate-900 mb-6 self-start">Wachstum & Umsatz</h3>
              {/* Placeholder for chart since we removed mock data */}
              <Activity size={48} className="mb-4 opacity-50"/>
              <p>Diagramm wird verfügbar sobald historische Daten gesammelt wurden.</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Sparkles size={20} className="text-[#ffcc00]" />
                        KI Insights
                    </h3>
                    <Button onClick={handleGenerateInsights} disabled={isAnalyzing} size="sm" className="bg-[#00305e] text-white">
                        {isAnalyzing ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} className="mr-2" />}
                        {isAnalyzing ? 'Analysiere...' : 'Analyse generieren'}
                    </Button>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 min-h-[100px]">
                    {aiAnalysis ? (
                        <p className="whitespace-pre-wrap text-slate-700">{aiAnalysis}</p>
                    ) : (
                        <p className="text-slate-400 text-center pt-8">Klicke auf Generieren für eine KI-Analyse deiner aktuellen Daten.</p>
                    )}
                </div>
            </div>
          </div>
        )}

        {/* CUSTOMERS TAB */}
        {activeTab === 'customers' && (
          <div className="space-y-6 animate-in fade-in">
             {!selectedCustomer ? (
                <>
                    <h1 className="text-2xl font-bold text-slate-900">Kundenverwaltung</h1>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex gap-4">
                        <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Suchen..." 
                            value={customerSearch}
                            onChange={(e) => setCustomerSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                        </div>
                        <Button variant="outline" onClick={loadCustomers}><RotateCcw size={20} className={isLoadingCustomers ? "animate-spin" : ""}/></Button>
                    </div>
                    {isLoadingCustomers ? (
                        <div className="p-12 text-center">
                            <Loader2 className="w-8 h-8 text-slate-400 animate-spin mx-auto" />
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-sm">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Plan</th>
                                <th className="px-6 py-4">Seit</th>
                                <th className="px-6 py-4 text-right">Aktion</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            {filteredCustomers.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-4 text-center text-slate-500">Keine Kunden gefunden.</td></tr>
                            ) : (
                                filteredCustomers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900">{customer.name}</div>
                                        <div className="text-xs text-slate-500">{customer.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${customer.status === 'Aktiv' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {customer.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">{customer.plan}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{customer.since}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="secondary" size="sm" onClick={() => setSelectedCustomer(customer)}>Details</Button>
                                    </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    )}
                    </div>
                </>
             ) : (
                <div className="max-w-4xl mx-auto">
                    <Button variant="outline" size="sm" onClick={() => { setSelectedCustomer(null); setIsEditMode(false); }} className="mb-6">
                        <ArrowLeft size={16} className="mr-2"/> Zurück zur Liste
                    </Button>
                    
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Users size={24} className="text-blue-600" />
                                {selectedCustomer.name}
                            </h2>
                            <div className="flex gap-2">
                                <Button 
                                    variant={selectedCustomer.isFree ? "danger" : "secondary"} 
                                    size="sm"
                                    onClick={() => handleToggleFreeSub(selectedCustomer.id, selectedCustomer.isFree)}
                                >
                                    {selectedCustomer.isFree ? <Ban size={16} className="mr-2" /> : <Gift size={16} className="mr-2" />}
                                    {selectedCustomer.isFree ? "Gratis Abo beenden" : "Kostenloses Abo (Admin)"}
                                </Button>
                                <Button variant="primary" size="sm" onClick={() => setIsEditMode(!isEditMode)}>
                                    {isEditMode ? <Save size={16} className="mr-2" /> : <Edit3 size={16} className="mr-2" />}
                                    {isEditMode ? "Speichern" : "Bearbeiten"}
                                </Button>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-6">
                             <div>
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Stammdaten</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Name</label>
                                        <input disabled={!isEditMode} value={selectedCustomer.name} onChange={e => setSelectedCustomer({...selectedCustomer, name: e.target.value})} className="w-full p-2 border rounded bg-slate-50 disabled:bg-slate-100" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Email</label>
                                        <input disabled={!isEditMode} value={selectedCustomer.email} onChange={e => setSelectedCustomer({...selectedCustomer, email: e.target.value})} className="w-full p-2 border rounded bg-slate-50 disabled:bg-slate-100" />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="col-span-2">
                                            <label className="block text-xs text-slate-500 mb-1">Straße</label>
                                            <input disabled={!isEditMode} value={selectedCustomer.street} onChange={e => setSelectedCustomer({...selectedCustomer, street: e.target.value})} className="w-full p-2 border rounded bg-slate-50 disabled:bg-slate-100" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-500 mb-1">Nr.</label>
                                            <input disabled={!isEditMode} value={selectedCustomer.nr} onChange={e => setSelectedCustomer({...selectedCustomer, nr: e.target.value})} className="w-full p-2 border rounded bg-slate-50 disabled:bg-slate-100" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="block text-xs text-slate-500 mb-1">PLZ</label>
                                            <input disabled={!isEditMode} value={selectedCustomer.zip} onChange={e => setSelectedCustomer({...selectedCustomer, zip: e.target.value})} className="w-full p-2 border rounded bg-slate-50 disabled:bg-slate-100" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs text-slate-500 mb-1">Ort</label>
                                            <input disabled={!isEditMode} value={selectedCustomer.city} onChange={e => setSelectedCustomer({...selectedCustomer, city: e.target.value})} className="w-full p-2 border rounded bg-slate-50 disabled:bg-slate-100" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Land</label>
                                        <input disabled={!isEditMode} value={selectedCustomer.country} onChange={e => setSelectedCustomer({...selectedCustomer, country: e.target.value})} className="w-full p-2 border rounded bg-slate-50 disabled:bg-slate-100" />
                                    </div>
                                </div>
                             </div>
                             <div>
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Abo & Finanzen</h3>
                                <div className="space-y-4">
                                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                         <div className="flex justify-between items-center mb-2">
                                             <span className="text-sm font-medium">Status</span>
                                             <span className={`px-2 py-0.5 rounded text-xs font-bold ${selectedCustomer.status === 'Aktiv' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{selectedCustomer.status}</span>
                                         </div>
                                         <div className="flex justify-between items-center mb-2">
                                             <span className="text-sm font-medium">Plan</span>
                                             <span>{selectedCustomer.plan}</span>
                                         </div>
                                         <div className="flex justify-between items-center mb-2">
                                             <span className="text-sm font-medium">Seit</span>
                                             <span>{selectedCustomer.since}</span>
                                         </div>
                                     </div>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
             )}
          </div>
        )}

        {/* FINANCE TAB - Identical to previous version */}
        {activeTab === 'finance' && (
            <div className="space-y-6 animate-in fade-in">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-900">Finanzen & Auszahlungen</h1>
                    <Button onClick={handleExportPayPalCSV} variant="outline" size="sm">
                        <FileSpreadsheet size={16} className="mr-2" />
                        PayPal CSV Export
                    </Button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {isLoadingPayouts ? (
                        <div className="p-12 text-center">
                            <Loader2 className="w-8 h-8 text-slate-400 animate-spin mx-auto mb-2" />
                            <p className="text-slate-500">Lade Anträge...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-sm">
                                <tr>
                                    <th className="px-6 py-4">Datum</th>
                                    <th className="px-6 py-4">Partner</th>
                                    <th className="px-6 py-4">PayPal Email</th>
                                    <th className="px-6 py-4">Betrag</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Aktion</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {payouts.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">Keine offenen Auszahlungsanträge.</td>
                                    </tr>
                                ) : (
                                    payouts.map((payout) => (
                                        <tr key={payout.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 text-sm">{new Date(payout.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-sm font-medium">
                                                {payout.profiles?.first_name} {payout.profiles?.last_name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">{payout.paypal_email}</td>
                                            <td className="px-6 py-4 font-bold">{Number(payout.amount).toFixed(2)} €</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                    payout.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {payout.status === 'paid' ? 'Bezahlt' : 'Offen'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {payout.status === 'pending' && (
                                                    <Button onClick={() => handleMarkPaid(payout.id)} variant="primary" size="sm" className="bg-green-600 hover:bg-green-700">
                                                        <CheckCircle size={14} className="mr-1" /> Als bezahlt markieren
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        )}

        {/* PARTNERS TAB - Keep Config */}
        {activeTab === 'partners' && (
          <div className="space-y-6 animate-in fade-in">
            <h1 className="text-2xl font-bold text-slate-900">Partnerprogramm</h1>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold mb-4">Globale Konfiguration</h3>
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Provision (%)</label>
                  <input 
                    type="number" 
                    value={commissionRate}
                    onChange={(e) => onUpdateCommission(Number(e.target.value))}
                    className="w-24 px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1 text-sm text-slate-500 pt-6">
                  Änderungen wirken sich sofort auf alle Berechnungsbeispiele aus.
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* EMAIL MANAGEMENT - Using the new DEFAULT_TEMPLATES */}
        {activeTab === 'emails' && (
            <div className="space-y-6 animate-in fade-in">
                <h1 className="text-2xl font-bold text-slate-900">E-Mail Management</h1>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                        {/* List */}
                        <div className="col-span-1 p-4 bg-slate-50 max-h-[600px] overflow-y-auto">
                            <h3 className="font-bold text-slate-700 mb-4 px-2">Vorlagen</h3>
                            <div className="space-y-2">
                                {templates.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setEditingTemplate(t)}
                                        className={`w-full text-left p-3 rounded-lg transition-all ${editingTemplate?.id === t.id ? 'bg-white shadow-sm ring-1 ring-blue-500' : 'hover:bg-slate-200/50'}`}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-semibold text-slate-900 text-sm">{t.name}</span>
                                            <span className={`w-2 h-2 rounded-full ${t.isEnabled ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                                        </div>
                                        <p className="text-xs text-slate-500 truncate">{t.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Editor */}
                        <div className="col-span-2 p-6">
                            {editingTemplate ? (
                                <div className="space-y-4 h-full flex flex-col">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-lg">Bearbeiten: {editingTemplate.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm font-medium text-slate-600 flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={editingTemplate.isEnabled}
                                                    onChange={(e) => setEditingTemplate({...editingTemplate, isEnabled: e.target.checked})}
                                                    className="rounded text-blue-600 focus:ring-blue-500"
                                                />
                                                Aktiv
                                            </label>
                                            <Button size="sm" onClick={() => {
                                                setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? editingTemplate : t));
                                                alert("Vorlage gespeichert (Simuliert)");
                                            }}>
                                                <Save size={16} className="mr-2" /> Speichern
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Betreff</label>
                                        <input 
                                            type="text" 
                                            value={editingTemplate.subject}
                                            onChange={(e) => setEditingTemplate({...editingTemplate, subject: e.target.value})}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">HTML Inhalt</label>
                                        <textarea 
                                            value={editingTemplate.body}
                                            onChange={(e) => setEditingTemplate({...editingTemplate, body: e.target.value})}
                                            className="w-full h-64 px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                        />
                                    </div>

                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                                        <span className="font-bold text-slate-600 block mb-1">Verfügbare Platzhalter:</span>
                                        <div className="flex flex-wrap gap-2">
                                            {editingTemplate.variables.map(v => (
                                                <code key={v} className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-700 select-all">{v}</code>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-100 pt-4 flex items-center gap-3">
                                        <input 
                                            type="email" 
                                            value={testEmail}
                                            onChange={(e) => setTestEmail(e.target.value)}
                                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                            placeholder="Test Empfänger E-Mail"
                                        />
                                        <Button variant="secondary" size="sm" onClick={handleSendTestEmail} disabled={isSendingTest}>
                                            <Send size={16} className="mr-2" /> {isSendingTest ? 'Sende...' : 'Vorschau senden'}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400">
                                    <p>Wähle eine Vorlage aus, um sie zu bearbeiten.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
             <div className="space-y-8 animate-in fade-in">
                 <h1 className="text-2xl font-bold text-slate-900">System Einstellungen</h1>
                 
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                     <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                         <Shield className="text-blue-600" size={20} />
                         Admin Sicherheit & Login
                     </h3>
                     <div className="grid md:grid-cols-2 gap-8">
                         <div className="space-y-4">
                             <h4 className="text-sm font-semibold text-slate-700">Admin E-Mail Adresse</h4>
                             <div className="flex gap-2 mb-2">
                                 <input 
                                     type="email" 
                                     value={adminEmail} 
                                     readOnly 
                                     className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-500" 
                                 />
                                 <div className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-bold flex items-center">
                                     <CheckCircle size={14} className="mr-1"/> Aktiv
                                 </div>
                             </div>
                             
                             <div className="border-t border-slate-100 pt-4 mt-4">
                                 <label className="block text-sm font-medium text-slate-700 mb-1">E-Mail ändern</label>
                                 <input type="email" placeholder="Neue E-Mail Adresse" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-2" />
                                 <input type="password" placeholder="Aktuelles Passwort zur Bestätigung" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-2" />
                                 <Button size="sm" variant="outline" className="w-full" onClick={() => alert("E-Mail Änderung erfordert Backend-Bestätigung (Simuliert)")}>Änderung anfordern</Button>
                             </div>
                         </div>
                         
                         <div className="space-y-4">
                             <h4 className="text-sm font-semibold text-slate-700">Passwort ändern</h4>
                             <input type="password" placeholder="Aktuelles Passwort" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                             <input type="password" placeholder="Neues Passwort" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                             <input type="password" placeholder="Neues Passwort wiederholen" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                             <Button size="sm" variant="secondary" className="w-full bg-[#00305e] text-white" onClick={() => alert("Passwort geändert (Simuliert)")}>Passwort speichern</Button>
                         </div>
                     </div>
                 </div>

                 {/* Shop Links */}
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Link className="text-blue-600" size={20} />
                        Europa-Park Shop Links
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">Diese Links werden in E-Mails und im Dashboard verwendet.</p>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">ResortPass Gold URL</label>
                            <input 
                                type="text" 
                                value={productUrls.gold} 
                                onChange={e => onUpdateProductUrls({...productUrls, gold: e.target.value})}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">ResortPass Silver URL</label>
                            <input 
                                type="text" 
                                value={productUrls.silver} 
                                onChange={e => onUpdateProductUrls({...productUrls, silver: e.target.value})}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            />
                        </div>
                    </div>
                 </div>

                 {/* External Services Guide */}
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Key className="text-blue-600" size={20} />
                        Externe Dienste (Vercel Configuration)
                    </h3>
                    
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8">
                        <h4 className="text-amber-800 font-bold flex items-center gap-2">
                            <Lock size={16}/> Sicherheits-Hinweis
                        </h4>
                        <p className="text-sm text-amber-700 mt-1">
                            API Schlüssel dürfen niemals im Code oder hier im Dashboard gespeichert werden. 
                            Bitte trage diese Werte ausschließlich in deinem Vercel Dashboard unter 
                            <strong> Settings &rarr; Environment Variables</strong> ein.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="border-b border-slate-100 pb-6">
                            <h4 className="font-bold text-slate-900 mb-2 flex items-center justify-between">
                                <span>Browse.ai (Web Scraping)</span>
                                <Button size="sm" variant="outline" onClick={() => handleTestConnection('browse')}>
                                    <Wifi size={14} className="mr-1"/> Verbindung testen
                                </Button>
                            </h4>
                            <p className="text-sm text-slate-500 mb-3">Benötigt für die Überwachung der Ticket-Seite.</p>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                                    <span className="text-xs font-bold text-slate-500 block">KEY NAME</span>
                                    <code className="text-sm text-blue-600">BROWSE_AI_API_KEY</code>
                                </div>
                                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                                    <span className="text-xs font-bold text-slate-500 block">KEY NAME</span>
                                    <code className="text-sm text-blue-600">BROWSE_AI_ROBOT_ID</code>
                                </div>
                            </div>
                        </div>

                        <div className="border-b border-slate-100 pb-6">
                            <h4 className="font-bold text-slate-900 mb-2 flex items-center justify-between">
                                <span>Google Gemini (KI)</span>
                                <Button size="sm" variant="outline" onClick={() => handleTestConnection('gemini')}>
                                    <Sparkles size={14} className="mr-1"/> Verbindung testen
                                </Button>
                            </h4>
                            <p className="text-sm text-slate-500 mb-3">Benötigt für Marketing-Texte und Admin Insights.</p>
                            <div className="bg-slate-50 p-3 rounded border border-slate-200">
                                <span className="text-xs font-bold text-slate-500 block">KEY NAME</span>
                                <code className="text-sm text-blue-600">API_KEY</code>
                            </div>
                        </div>

                        <div className="border-b border-slate-100 pb-6">
                            <h4 className="font-bold text-slate-900 mb-2">Stripe (Zahlungen)</h4>
                            <p className="text-sm text-slate-500 mb-3">Benötigt für Abo-Abwicklung.</p>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                                    <span className="text-xs font-bold text-slate-500 block">KEY NAME</span>
                                    <code className="text-sm text-blue-600">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>
                                </div>
                                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                                    <span className="text-xs font-bold text-slate-500 block">KEY NAME</span>
                                    <code className="text-sm text-blue-600">STRIPE_SECRET_KEY</code>
                                </div>
                                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                                    <span className="text-xs font-bold text-slate-500 block">KEY NAME</span>
                                    <code className="text-sm text-blue-600">STRIPE_WEBHOOK_SECRET</code>
                                </div>
                            </div>
                        </div>

                        <div className="border-b border-slate-100 pb-6">
                            <h4 className="font-bold text-slate-900 mb-2">Resend (E-Mails)</h4>
                            <p className="text-sm text-slate-500 mb-3">Benötigt für den Versand von Alarmen.</p>
                            <div className="bg-slate-50 p-3 rounded border border-slate-200">
                                <span className="text-xs font-bold text-slate-500 block">KEY NAME</span>
                                <code className="text-sm text-blue-600">RESEND_API_KEY</code>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 mb-2">Twilio (SMS)</h4>
                            <p className="text-sm text-slate-500 mb-3">Benötigt für SMS Benachrichtigungen.</p>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                                    <span className="text-xs font-bold text-slate-500 block">KEY NAME</span>
                                    <code className="text-sm text-blue-600">TWILIO_ACCOUNT_SID</code>
                                </div>
                                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                                    <span className="text-xs font-bold text-slate-500 block">KEY NAME</span>
                                    <code className="text-sm text-blue-600">TWILIO_AUTH_TOKEN</code>
                                </div>
                                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                                    <span className="text-xs font-bold text-slate-500 block">KEY NAME</span>
                                    <code className="text-sm text-blue-600">TWILIO_PHONE_NUMBER</code>
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>
             </div>
        )}
      </div>
    </div>
  );
};