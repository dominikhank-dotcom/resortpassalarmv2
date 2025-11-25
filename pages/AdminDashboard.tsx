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
import { sendTestAlarm, sendTemplateTest, testBrowseAiConnection, testGeminiConnection, fetchAdminPayouts, markPayoutPaid } from '../services/backendService';
import { EmailTemplate } from '../types';

// Mock Data for Charts
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
  { id: 'KD-1001', name: 'Max Mustermann', email: 'max@example.com', status: 'Aktiv', plan: 'Premium', since: '12.04.2024', referrer: 'TikTok-Thomas', street: 'Musterweg', nr: '1', zip: '12345', city: 'Berlin', country: 'Deutschland', payments: 3, total: 5.97, isFree: false },
  { id: 'KD-1002', name: 'Lisa Müller', email: 'lisa@test.de', status: 'Inaktiv', plan: '-', since: '15.04.2024', referrer: 'Direct', street: 'Nebenstraße', nr: '5a', zip: '54321', city: 'München', country: 'Deutschland', payments: 1, total: 1.99, isFree: false },
  { id: 'KD-1003', name: 'Jan Schmidt', email: 'jan@web.de', status: 'Aktiv', plan: 'Premium', since: '18.04.2024', referrer: 'ResortPassGuide', street: 'Hauptstr.', nr: '99', zip: '20095', city: 'Hamburg', country: 'Deutschland', payments: 2, total: 3.98, isFree: false },
];

const PARTNER_DATA = [
  { name: 'TikTok-Thomas', revenue: 1240, commission: 620, clicks: 4500, conversions: 62 },
  { name: 'ResortPassGuide', revenue: 890, commission: 445, clicks: 3200, conversions: 45 },
  { name: 'CoasterFriends', revenue: 450, commission: 225, clicks: 1800, conversions: 22 },
];

// Email Templates
const DEFAULT_TEMPLATES: EmailTemplate[] = [
    {
        id: '1',
        name: 'Kunde: Willkommen',
        description: 'Nach der Registrierung',
        category: 'CUSTOMER',
        subject: 'Willkommen beim ResortPass Wächter',
        body: '<p>Hallo {firstName},</p><p>Willkommen an Bord! Dein Account wurde erstellt.</p><p><a href="{loginLink}">Jetzt einloggen</a></p>',
        variables: ['{firstName}', '{loginLink}'],
        isEnabled: true
    },
    {
        id: '2',
        name: 'Kunde: Alarm',
        description: 'Wenn Tickets verfügbar sind',
        category: 'CUSTOMER',
        subject: '🚨 ALARM: {productName} verfügbar!',
        body: '<h1>Schnell sein!</h1><p>{productName} ist jetzt verfügbar.</p><p><a href="{shopLink}">Zum Shop</a></p>',
        variables: ['{productName}', '{shopLink}'],
        isEnabled: true
    },
    {
        id: '3',
        name: 'Partner: Provision',
        description: 'Benachrichtigung über Auszahlung',
        category: 'PARTNER',
        subject: 'Deine Provision wurde ausgezahlt',
        body: '<p>Gute Nachrichten! Wir haben {commission} € an dich überwiesen.</p>',
        variables: ['{commission}', '{month}'],
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
  
  // AI States
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Email States
  const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_TEMPLATES);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [testEmail, setTestEmail] = useState("dominikhank@gmail.com");
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Customer Detail View State
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Admin Account Settings
  const [adminEmail, setAdminEmail] = useState("admin@resortpassalarm.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Payouts State (Finance Tab)
  const [payouts, setPayouts] = useState<any[]>([]);
  const [isLoadingPayouts, setIsLoadingPayouts] = useState(false);

  useEffect(() => {
    if (activeTab === 'finance') {
        loadPayouts();
    }
  }, [activeTab]);

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

  const handleGenerateInsights = async () => {
    setIsAnalyzing(true);
    setAiAnalysis("Analysiere Daten...");
    try {
      const text = await generateAdminInsights(PARTNER_DATA);
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
                  <p className="text-sm font-bold truncate">Admin User</p>
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
                    <p className="text-slate-500 text-sm">Monatlicher Umsatz</p>
                    <h3 className="text-2xl font-bold text-slate-900">4.200 €</h3>
                  </div>
                  <div className="bg-green-50 p-2 rounded-lg text-green-600"><DollarSign size={20} /></div>
                </div>
                <div className="mt-4 flex items-center text-sm text-green-600">
                  <TrendingUp size={16} className="mr-1" /> +12% vs. Vormonat
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 text-sm">Aktive Kunden</p>
                    <h3 className="text-2xl font-bold text-slate-900">1.850</h3>
                  </div>
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Users size={20} /></div>
                </div>
                <div className="mt-4 flex items-center text-sm text-green-600">
                  <TrendingUp size={16} className="mr-1" /> +45 Neue diese Woche
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 text-sm">Partner Provisionen</p>
                    <h3 className="text-2xl font-bold text-slate-900">980 €</h3>
                  </div>
                  <div className="bg-purple-50 p-2 rounded-lg text-purple-600"><Briefcase size={20} /></div>
                </div>
                <div className="mt-4 text-sm text-slate-400">Ausstehend: 240 €</div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 text-sm">API Calls (Heute)</p>
                    <h3 className="text-2xl font-bold text-slate-900">14.5k</h3>
                  </div>
                  <div className="bg-orange-50 p-2 rounded-lg text-orange-600"><Activity size={20} /></div>
                </div>
                <div className="mt-4 text-sm text-slate-400">100% Uptime</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[400px]">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Wachstum & Umsatz</h3>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DASHBOARD_DATA}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00305e" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#00305e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#00305e" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
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
                        <input type="text" placeholder="Suchen..." className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <Button variant="outline"><Download size={20} /> Export</Button>
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-sm">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Plan</th>
                            <th className="px-6 py-4">Seit</th>
                            <th className="px-6 py-4">Geworben von</th>
                            <th className="px-6 py-4 text-right">Aktion</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {CUSTOMERS_LIST.map((customer) => (
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
                            <td className="px-6 py-4 text-sm">
                                {customer.referrer !== '-' ? <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold">{customer.referrer}</span> : '-'}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <Button variant="secondary" size="sm" onClick={() => setSelectedCustomer(customer)}>Details</Button>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
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
                                    onClick={() => {
                                        const newVal = !selectedCustomer.isFree;
                                        setSelectedCustomer({...selectedCustomer, isFree: newVal, plan: newVal ? 'Manuell (Gratis)' : '-', status: newVal ? 'Aktiv' : 'Inaktiv'});
                                        alert(newVal ? "Kostenloses Abo aktiviert!" : "Kostenloses Abo deaktiviert.");
                                    }}
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
                                        <select disabled={!isEditMode} value={selectedCustomer.country} onChange={e => setSelectedCustomer({...selectedCustomer, country: e.target.value})} className="w-full p-2 border rounded bg-slate-50 disabled:bg-slate-100">
                                            <option>Deutschland</option>
                                            <option>Österreich</option>
                                            <option>Schweiz</option>
                                            <option>Frankreich</option>
                                        </select>
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
                                         <div className="flex justify-between items-center">
                                             <span className="text-sm font-medium">Werber</span>
                                             <span className="bg-blue-100 text-blue-700 px-2 rounded text-xs">{selectedCustomer.referrer}</span>
                                         </div>
                                     </div>
                                     
                                     <div>
                                         <h4 className="text-xs font-bold text-slate-500 mb-2">Transaktionen</h4>
                                         <div className="space-y-2">
                                             {[...Array(selectedCustomer.payments)].map((_, i) => (
                                                 <div key={i} className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-100 text-sm">
                                                     <span>Zahlung #{1000+i}</span>
                                                     <div className="flex items-center gap-2">
                                                         <span className="font-mono">1.99 €</span>
                                                         <button onClick={() => alert("Erstattung eingeleitet")} className="text-xs text-red-500 hover:underline">Erstatten</button>
                                                     </div>
                                                 </div>
                                             ))}
                                         </div>
                                     </div>

                                     <div className="pt-4 border-t border-slate-100">
                                         <Button variant="outline" size="sm" className="w-full text-red-500 border-red-200 hover:bg-red-50">
                                             <RotateCcw size={14} className="mr-2" />
                                             Alle Zahlungen erstatten
                                         </Button>
                                     </div>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
             )}
          </div>
        )}

        {/* FINANCE TAB (NEW) */}
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

        {/* PARTNERS TAB */}
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
                  Änderungen wirken sich sofort auf alle Berechnungsbeispiele und die nächste Provisionsabrechnung aus.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold mb-6">Top Partner (Umsatz)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={PARTNER_DATA} layout="vertical">
                     <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                     <XAxis type="number" hide />
                     <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                     <Tooltip />
                     <Bar dataKey="revenue" fill="#00305e" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold flex items-center gap-2">
                       <Sparkles className="text-yellow-500" size={18} /> KI Insights
                    </h3>
                    <Button size="sm" variant="outline" onClick={handleGenerateInsights} disabled={isAnalyzing}>
                       {isAnalyzing ? "Analysiere..." : "Neu generieren"}
                    </Button>
                 </div>
                 <div className="flex-1 bg-slate-50 rounded-xl p-4 text-sm text-slate-600 leading-relaxed border border-slate-100">
                    {aiAnalysis ? (
                        <div className="whitespace-pre-line">{aiAnalysis}</div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <Sparkles size={32} className="mb-2 opacity-50" />
                            <p>Klicke auf Generieren für eine Analyse.</p>
                        </div>
                    )}
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* EMAIL MANAGEMENT TAB */}
        {activeTab === 'emails' && (
            <div className="space-y-6 animate-in fade-in">
                <h1 className="text-2xl font-bold text-slate-900">E-Mail Management</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                    {/* List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-y-auto">
                        <div className="p-4 border-b border-slate-100 font-bold text-slate-700">Vorlagen</div>
                        {templates.map(t => (
                            <div 
                                key={t.id} 
                                onClick={() => setEditingTemplate(t)}
                                className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition ${editingTemplate?.id === t.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}
                            >
                                <div className="flex justify-between mb-1">
                                    <span className="font-bold text-slate-800 text-sm">{t.name}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded ${t.category === 'CUSTOMER' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>{t.category}</span>
                                </div>
                                <p className="text-xs text-slate-500 truncate">{t.subject}</p>
                            </div>
                        ))}
                    </div>

                    {/* Editor */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                        {editingTemplate ? (
                            <>
                                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                    <span className="font-bold text-slate-700">Editor: {editingTemplate.name}</span>
                                    <div className="flex gap-2">
                                        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                            <input type="checkbox" checked={editingTemplate.isEnabled} onChange={e => setEditingTemplate({...editingTemplate, isEnabled: e.target.checked})} />
                                            Aktiv
                                        </label>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Betreff</label>
                                        <input 
                                            className="w-full p-2 border border-slate-300 rounded font-medium" 
                                            value={editingTemplate.subject} 
                                            onChange={e => setEditingTemplate({...editingTemplate, subject: e.target.value})}
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">HTML Inhalt</label>
                                        <textarea 
                                            className="w-full flex-1 p-3 border border-slate-300 rounded font-mono text-sm min-h-[200px]" 
                                            value={editingTemplate.body} 
                                            onChange={e => setEditingTemplate({...editingTemplate, body: e.target.value})}
                                        />
                                    </div>
                                    <div className="bg-blue-50 p-3 rounded text-xs text-blue-700">
                                        <strong>Verfügbare Variablen:</strong> {editingTemplate.variables.join(', ')}
                                    </div>
                                </div>
                                <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50">
                                     <div className="flex items-center gap-2">
                                         <input 
                                            type="email" 
                                            value={testEmail} 
                                            onChange={e => setTestEmail(e.target.value)}
                                            className="text-sm p-1.5 border rounded w-48"
                                         />
                                         <Button size="sm" variant="outline" onClick={handleSendTestEmail} disabled={isSendingTest}>
                                             {isSendingTest ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} className="mr-1"/>} Testen
                                         </Button>
                                     </div>
                                     <Button size="sm" onClick={() => {
                                         setTemplates(templates.map(t => t.id === editingTemplate.id ? editingTemplate : t));
                                         alert("Vorlage gespeichert (Lokal)");
                                     }}>
                                         <Save size={16} className="mr-2" /> Speichern
                                     </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-slate-400">
                                Wähle eine Vorlage aus.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-8 animate-in fade-in">
             <div className="flex justify-between items-center">
                 <h1 className="text-2xl font-bold text-slate-900">System Einstellungen</h1>
             </div>
             
             {/* Admin Account Settings */}
             <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-[#00305e] text-white">
                    <h3 className="font-bold flex items-center gap-2">
                        <Key size={18} /> Admin Sicherheit & Login
                    </h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 mb-4">E-Mail ändern</h4>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Aktuelle E-Mail</label>
                                <input type="text" value={adminEmail} disabled className="w-full p-2 bg-slate-100 border rounded text-slate-600" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Neue E-Mail</label>
                                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full p-2 border rounded" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Aktuelles Passwort (zur Bestätigung)</label>
                                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full p-2 border rounded" />
                            </div>
                            <Button size="sm" onClick={() => alert("Bestätigungs-Link an neue E-Mail gesendet.")}>E-Mail ändern</Button>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 mb-4">Passwort ändern</h4>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Aktuelles Passwort</label>
                                <input type="password" className="w-full p-2 border rounded" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Neues Passwort</label>
                                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-2 border rounded" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Wiederholen</label>
                                <input type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} className="w-full p-2 border rounded" />
                            </div>
                            <Button size="sm" onClick={() => alert("Passwort erfolgreich geändert.")}>Passwort speichern</Button>
                        </div>
                    </div>
                </div>
             </section>

             <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2">
                        <Link size={18} className="text-blue-600"/> Produkt Links
                    </h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ResortPass Gold URL</label>
                        <input 
                            type="text" 
                            value={productUrls.gold} 
                            onChange={(e) => onUpdateProductUrls({...productUrls, gold: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ResortPass Silver URL</label>
                        <input 
                            type="text" 
                            value={productUrls.silver} 
                            onChange={(e) => onUpdateProductUrls({...productUrls, silver: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
             </section>
             
             <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-sm text-amber-800">
                <AlertCircle className="shrink-0" />
                <div>
                    <strong>Wichtig für Vercel:</strong> Die folgenden API-Schlüssel müssen in Vercel unter "Environment Variables" eingetragen werden. 
                    Aus Sicherheitsgründen (Browser-Sicherheit) können diese hier nicht bearbeitet werden.
                    <br/><br/>
                    Bitte nutze das Präfix <code>VITE_</code> für Keys, die im Frontend sichtbar sein müssen (z.B. Supabase URL).
                </div>
             </div>

             {/* Config Guides */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold flex items-center gap-2"><Globe size={18} className="text-blue-500"/> Browse.ai (Crawler)</h3>
                        <Button size="sm" variant="outline" onClick={() => handleTestConnection('browse')}>Verbindung testen</Button>
                    </div>
                    <code className="block bg-slate-900 text-slate-200 p-3 rounded text-xs mb-2">BROWSE_AI_API_KEY</code>
                    <code className="block bg-slate-900 text-slate-200 p-3 rounded text-xs">BROWSE_AI_ROBOT_ID</code>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold flex items-center gap-2"><CreditCard size={18} className="text-indigo-500"/> Stripe (Payments)</h3>
                        <Button size="sm" variant="outline" onClick={() => handleTestConnection('stripe')}>Verbindung testen</Button>
                    </div>
                    <code className="block bg-slate-900 text-slate-200 p-3 rounded text-xs mb-2">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>
                    <code className="block bg-slate-900 text-slate-200 p-3 rounded text-xs mb-2">STRIPE_SECRET_KEY</code>
                    <code className="block bg-slate-900 text-slate-200 p-3 rounded text-xs">STRIPE_WEBHOOK_SECRET</code>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold flex items-center gap-2"><Mail size={18} className="text-green-500"/> Resend (E-Mails)</h3>
                        <Button size="sm" variant="outline" onClick={() => handleTestConnection('resend')}>Verbindung testen</Button>
                    </div>
                    <code className="block bg-slate-900 text-slate-200 p-3 rounded text-xs">RESEND_API_KEY</code>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold flex items-center gap-2"><MessageSquare size={18} className="text-red-500"/> Twilio (SMS)</h3>
                        <Button size="sm" variant="outline" onClick={() => handleTestConnection('twilio')}>Verbindung testen</Button>
                    </div>
                    <code className="block bg-slate-900 text-slate-200 p-3 rounded text-xs mb-2">TWILIO_ACCOUNT_SID</code>
                    <code className="block bg-slate-900 text-slate-200 p-3 rounded text-xs mb-2">TWILIO_AUTH_TOKEN</code>
                    <code className="block bg-slate-900 text-slate-200 p-3 rounded text-xs">TWILIO_PHONE_NUMBER</code>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold flex items-center gap-2"><Sparkles size={18} className="text-purple-500"/> Google Gemini (KI)</h3>
                        <Button size="sm" variant="outline" onClick={() => handleTestConnection('gemini')}>Verbindung testen</Button>
                    </div>
                    <code className="block bg-slate-900 text-slate-200 p-3 rounded text-xs">API_KEY</code>
                </div>

                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold flex items-center gap-2"><Database size={18} className="text-teal-500"/> Supabase (DB)</h3>
                        {/* No test button, connection is checked on app load */}
                    </div>
                    <code className="block bg-slate-900 text-slate-200 p-3 rounded text-xs mb-2">VITE_SUPABASE_URL</code>
                    <code className="block bg-slate-900 text-slate-200 p-3 rounded text-xs">VITE_SUPABASE_ANON_KEY</code>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};