import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Settings, 
  TrendingUp, DollarSign, Activity, Mail, 
  Sparkles, Gift, RefreshCw, Check, Save, UserX, XCircle, Search, CheckCircle, Handshake, CreditCard, Sliders, AlertCircle, Send, Link, Link2, Calendar, Edit2, X, AlertTriangle
} from 'lucide-react';
import { Button } from '../components/Button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateAdminInsights } from '../services/geminiService';
import { 
  sendTemplateTest, 
  testBrowseAiConnection, 
  testGeminiConnection, 
  manageSubscription, 
  getCustomerDetails, 
  updateSystemSettings, 
  updateSystemStatus, 
  getSystemSettings, 
  getEmailTemplates, 
  saveEmailTemplate,
  adminUpdateCustomer
} from '../services/backendService';
import { EmailTemplate } from '../types';

interface AdminDashboardProps {
  commissionRate: number;
  onUpdateCommission: (rate: number) => void;
  prices: { new: number, existing: number };
  onUpdatePrices: (prices: { new: number, existing: number }) => void;
  productUrls: { gold: string, silver: string };
  onUpdateProductUrls: (urls: { gold: string, silver: string }) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  commissionRate, onUpdateCommission, prices, onUpdatePrices, productUrls, onUpdateProductUrls 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'partners' | 'emails' | 'settings'>('overview');
  
  // Date Picker State
  const [dateRange, setDateRange] = useState({
      start: new Date(new Date().setDate(new Date().getDate() - 28)).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
  });

  const [stats, setStats] = useState<any>({
    activeUsers: 0,
    revenue: 0,
    profit: 0,
    newCustomers: 0,
    history: []
  });
  
  const [loading, setLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState("");

  // System Status State
  const [sysStatus, setSysStatus] = useState({ gold: 'sold_out', silver: 'sold_out', lastChecked: '...' });

  // Email Templates State
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [testEmailAddr, setTestEmailAddr] = useState("");

  // Users Management State
  const [userList, setUserList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Customer Detail Modal State
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [editCustomerMode, setEditCustomerMode] = useState(false);
  const [customerForm, setCustomerForm] = useState<any>({});

  // Partners State
  const [partnerList, setPartnerList] = useState<any[]>([]);
  const [partnerSettings, setPartnerSettings] = useState({ newRate: commissionRate, oldRate: commissionRate }); // oldRate is visual for now

  useEffect(() => {
    loadStats();
    loadSystemSettings();
  }, [dateRange]); // Reload stats when date changes

  useEffect(() => {
    if (activeTab === 'customers') loadAllUsers();
    if (activeTab === 'partners') loadAllUsers(); // Partners are also in profiles
    if (activeTab === 'emails') loadTemplates();
  }, [activeTab]);

  const loadStats = async () => {
    try {
        const query = `?startDate=${dateRange.start}&endDate=${dateRange.end}`;
        const response = await fetch(`/api/admin-stats${query}`);
        const data = await response.json();
        if (data && !data.error) setStats(data);
    } catch (e) {
        console.error("Stats load failed", e);
    }
  };

  const loadSystemSettings = async () => {
      const s = await getSystemSettings();
      if (s) {
          setSysStatus({
              gold: s.status_gold || 'sold_out',
              silver: s.status_silver || 'sold_out',
              lastChecked: s.last_checked || '...'
          });
          // Load Partner Settings
          if (s.global_commission_rate) {
              const rate = Number(s.global_commission_rate);
              setPartnerSettings({ newRate: rate, oldRate: rate });
              onUpdateCommission(rate);
          }
      }
  };

  const loadAllUsers = async () => {
    try {
        const res = await fetch('/api/debug-users');
        const data = await res.json();
        if (data.users) {
            setUserList(data.users);
            // Filter partners
            const partners = data.users.filter((u: any) => u.role === 'AFFILIATE' || u.ref_code); // Assuming role check logic in backend or added here
            // Since debug-users might not return role explicitly if not updated, let's rely on role field if present
            setPartnerList(data.users.filter((u: any) => u.role === 'AFFILIATE')); 
        }
    } catch (e) { console.error("Load Users Error", e); }
  };

  const loadTemplates = async () => {
      const t = await getEmailTemplates();
      if (t) setTemplates(t);
  };

  const handleUpdateStatus = async (type: 'gold' | 'silver', status: 'available' | 'sold_out') => {
      if (!confirm(`Bist du sicher? Dies sendet Alarme für ${type.toUpperCase()} wenn 'available'!`)) return;
      try {
          await updateSystemStatus(type, status);
          alert(`Status für ${type} auf ${status} gesetzt.`);
          loadSystemSettings();
      } catch (e: any) {
          alert("Fehler: " + e.message);
      }
  };

  const handleOpenCustomerDetail = async (userId: string) => {
      setIsDetailLoading(true);
      setSelectedCustomer(null);
      try {
          const data = await getCustomerDetails(userId);
          if (data.success) {
              setSelectedCustomer({ profile: data.profile, subscription: data.subscription });
              setCustomerForm({
                  firstName: data.profile.first_name || '',
                  lastName: data.profile.last_name || '',
                  email: data.profile.email || '',
                  street: data.profile.street || '',
                  houseNumber: data.profile.house_number || '',
                  zip: data.profile.zip || '',
                  city: data.profile.city || '',
                  country: data.profile.country || 'Deutschland'
              });
          }
      } catch (e: any) { alert(e.message); }
      finally { setIsDetailLoading(false); }
  };

  const handleSaveCustomer = async () => {
      if (!selectedCustomer) return;
      try {
          await adminUpdateCustomer({
              targetUserId: selectedCustomer.profile.id,
              email: customerForm.email,
              firstName: customerForm.firstName,
              lastName: customerForm.lastName,
              address: {
                  street: customerForm.street,
                  houseNumber: customerForm.houseNumber,
                  zip: customerForm.zip,
                  city: customerForm.city,
                  country: customerForm.country
              }
          });
          alert("Kunde gespeichert!");
          setEditCustomerMode(false);
          handleOpenCustomerDetail(selectedCustomer.profile.id); // Refresh
      } catch (e: any) { alert("Fehler: " + e.message); }
  };

  const handleManageSub = async (action: 'grant_free' | 'revoke_free' | 'cancel_sub') => {
      if (!selectedCustomer) return;
      if (!confirm("Bist du sicher?")) return;
      try {
          await manageSubscription(selectedCustomer.profile.id, action);
          handleOpenCustomerDetail(selectedCustomer.profile.id);
          alert("Status aktualisiert.");
      } catch (e: any) { alert(e.message); }
  };

  const handleSavePartnerSettings = async () => {
      try {
          await updateSystemSettings('global_commission_rate', partnerSettings.newRate.toString());
          onUpdateCommission(partnerSettings.newRate);
          alert("Partner Provision gespeichert! Neue Partner erhalten nun " + partnerSettings.newRate + "%.");
      } catch (e: any) { alert(e.message); }
  };

  const handleSavePrices = async () => {
    try {
      await updateSystemSettings('price_new_customers', prices.new.toString());
      await updateSystemSettings('price_existing_customers', prices.existing.toString());
      alert("Preise gespeichert!");
    } catch(e: any) { alert("Fehler: " + e.message); }
  };
  
  const handleSaveUrls = async () => {
      try {
        await updateSystemSettings('url_gold', productUrls.gold);
        await updateSystemSettings('url_silver', productUrls.silver);
        alert("URLs gespeichert!");
      } catch(e:any) { alert(e.message); }
  }

  const handleSaveTemplate = async () => {
      if (!selectedTemplate) return;
      try {
          await saveEmailTemplate(selectedTemplate);
          alert("Template gespeichert!");
          loadTemplates();
      } catch (e: any) { alert("Fehler: " + e.message); }
  };

  const filteredUsers = userList.filter(u => 
    (u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id?.includes(searchTerm)) && u.role === 'CUSTOMER'
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-[#001529] text-white py-4 px-6 shadow-md sticky top-0 z-40">
         <div className="max-w-7xl mx-auto flex flex-col xl:flex-row justify-between items-center gap-4">
             <h1 className="text-xl font-bold flex items-center gap-2"><LayoutDashboard className="text-blue-400"/> Admin Konsole</h1>
             <div className="flex gap-1 bg-slate-800 p-1 rounded-lg overflow-x-auto max-w-full no-scrollbar">
                 {[
                   { id: 'overview', label: 'Übersicht', icon: LayoutDashboard },
                   { id: 'customers', label: 'Kunden', icon: Users },
                   { id: 'partners', label: 'Partner', icon: Handshake },
                   { id: 'emails', label: 'E-Mails', icon: Mail },
                   { id: 'settings', label: 'Einstellungen', icon: Sliders }
                 ].map(tab => (
                     <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)} 
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                     >
                        <tab.icon size={16} />
                        {tab.label}
                     </button>
                 ))}
             </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in">
                  
                  {/* Date Filter */}
                  <div className="flex justify-end mb-4">
                      <div className="bg-white p-2 rounded-lg border border-slate-200 flex items-center gap-2 shadow-sm">
                          <Calendar size={16} className="text-slate-500" />
                          <input 
                              type="date" 
                              value={dateRange.start}
                              onChange={e => setDateRange({...dateRange, start: e.target.value})}
                              className="text-sm outline-none bg-transparent"
                          />
                          <span className="text-slate-400">-</span>
                          <input 
                              type="date" 
                              value={dateRange.end}
                              onChange={e => setDateRange({...dateRange, end: e.target.value})}
                              className="text-sm outline-none bg-transparent"
                          />
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                          <p className="text-slate-500 text-xs uppercase font-bold">Aktive Abos</p>
                          <p className="text-2xl font-bold text-slate-900">{stats.activeUsers}</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                          <p className="text-slate-500 text-xs uppercase font-bold">Umsatz (MRR)</p>
                          <p className="text-2xl font-bold text-green-600">{stats.revenue.toFixed(2)} €</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                          <p className="text-slate-500 text-xs uppercase font-bold">Gewinn (Est.)</p>
                          <p className="text-2xl font-bold text-blue-600">{stats.profit.toFixed(2)} €</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 bg-indigo-50 border-indigo-100">
                          <p className="text-indigo-800 text-xs uppercase font-bold">Neue Kunden</p>
                          <p className="text-2xl font-bold text-indigo-700">+{stats.newCustomers}</p>
                          <p className="text-[10px] text-indigo-400">im gewählten Zeitraum</p>
                      </div>
                  </div>

                  {/* Chart */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                      <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2"><TrendingUp size={18} /> Entwicklung</h3>
                      <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={stats.history}>
                                  <defs>
                                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
                                          <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                                      </linearGradient>
                                  </defs>
                                  <XAxis dataKey="date" tick={{fontSize: 12}} />
                                  <YAxis tick={{fontSize: 12}} />
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                  <Tooltip />
                                  <Area type="monotone" dataKey="revenue" stroke="#4F46E5" fillOpacity={1} fill="url(#colorRevenue)" name="Est. Revenue Increase" />
                                  <Area type="monotone" dataKey="newSubs" stroke="#10b981" fill="none" name="New Subs" />
                              </AreaChart>
                          </ResponsiveContainer>
                      </div>
                  </div>
              </div>
          )}

          {/* CUSTOMERS TAB */}
          {activeTab === 'customers' && (
              <div className="space-y-6 animate-in fade-in">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2"><Users size={18} /> Kunden ({filteredUsers.length})</h3>
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Suchen..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64"
                            />
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                              <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                                  <tr>
                                      <th className="px-4 py-3">Kunde</th>
                                      <th className="px-4 py-3">Status</th>
                                      <th className="px-4 py-3">Partner-Code</th>
                                      <th className="px-4 py-3 text-right">Aktion</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                  {filteredUsers.slice(0, 50).map((u: any) => (
                                      <tr key={u.id} className="hover:bg-slate-50">
                                          <td className="px-4 py-3">
                                              <div className="font-bold text-slate-900">{u.name}</div>
                                              <div className="text-slate-500 text-xs">{u.email}</div>
                                          </td>
                                          <td className="px-4 py-3">
                                              {u.sub_status === 'active' || u.sub_status === 'trialing' ? 
                                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">Aktiv</span> : 
                                                (u.sub_status === 'canceled' ? <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs">Gekündigt</span> : <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-xs">Inaktiv</span>)
                                              }
                                              <div className="text-[10px] text-slate-400 mt-0.5">{u.plan}</div>
                                          </td>
                                          <td className="px-4 py-3">
                                              {/* Note: debug-users needs to return referred_by. Assuming update in backend if needed, or fetch details. 
                                                  For list view, if not present, we skip. */}
                                              {u.referred_by ? <span className="font-mono bg-indigo-50 text-indigo-600 px-1 rounded">{u.referred_by}</span> : <span className="text-slate-300">-</span>}
                                          </td>
                                          <td className="px-4 py-3 text-right">
                                              <Button size="sm" variant="outline" onClick={() => handleOpenCustomerDetail(u.id)}>Details</Button>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>
          )}

          {/* PARTNERS TAB */}
          {activeTab === 'partners' && (
              <div className="space-y-6 animate-in fade-in">
                  
                  {/* Commission Settings */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Handshake size={18} /> Partner Provisionen</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Provision für NEUE Partner (%)</label>
                              <div className="flex gap-2">
                                  <input 
                                      type="number" 
                                      value={partnerSettings.newRate}
                                      onChange={e => setPartnerSettings({...partnerSettings, newRate: Number(e.target.value)})}
                                      className="border rounded px-3 py-2 w-24 font-bold text-lg"
                                  />
                                  <Button onClick={handleSavePartnerSettings}>Speichern</Button>
                              </div>
                              <p className="text-xs text-slate-500 mt-2">Ändert die Anzeige auf der Landingpage & die Default-Rate für neue Registrierungen.</p>
                          </div>
                          <div className="opacity-70 pointer-events-none grayscale">
                              <label className="block text-sm font-medium text-slate-700 mb-1">Provision für ALT-Partner (%)</label>
                              <input 
                                  type="number" 
                                  value={partnerSettings.oldRate}
                                  readOnly
                                  className="border rounded px-3 py-2 w-24 font-bold text-lg bg-slate-50"
                              />
                              <p className="text-xs text-slate-500 mt-2">Aktuell global gesteuert. Manuelle Overrides demnächst verfügbar.</p>
                          </div>
                      </div>
                  </div>

                  {/* Partner List */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                      <h3 className="font-bold text-slate-900 mb-4">Partner Liste</h3>
                      <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                              <tr>
                                  <th className="px-4 py-3">Partner</th>
                                  <th className="px-4 py-3">Affiliate Code</th>
                                  <th className="px-4 py-3">Webseite</th>
                                  <th className="px-4 py-3">Status</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                              {partnerList.map((p: any) => (
                                  <tr key={p.id}>
                                      <td className="px-4 py-3">
                                          <div className="font-bold text-slate-900">{p.name}</div>
                                          <div className="text-xs text-slate-500">{p.email}</div>
                                      </td>
                                      <td className="px-4 py-3">
                                          <span className="font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded font-bold border border-blue-100">
                                            {p.ref_code || 'pending'}
                                          </span>
                                      </td>
                                      <td className="px-4 py-3 text-slate-500">{p.website || '-'}</td>
                                      <td className="px-4 py-3"><span className="text-green-600 text-xs font-bold uppercase">Aktiv</span></td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          )}

          {/* EMAILS TAB */}
          {activeTab === 'emails' && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)] animate-in fade-in">
                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                     <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-700 flex justify-between items-center">
                        <span>Templates</span>
                        <Button size="sm" variant="secondary" onClick={loadTemplates}><RefreshCw size={14}/></Button>
                     </div>
                     <div className="overflow-y-auto flex-1 p-2 space-y-2">
                         {templates.map(t => (
                             <div 
                                key={t.id} 
                                onClick={() => setSelectedTemplate(t)}
                                className={`p-3 rounded-lg cursor-pointer border transition-all ${selectedTemplate?.id === t.id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'border-transparent hover:bg-slate-50'}`}
                             >
                                 <div className="font-bold text-slate-900 text-sm">{t.name}</div>
                                 <div className="text-xs text-slate-500 truncate">{t.subject || 'SMS Template'}</div>
                                 <div className="mt-1 flex gap-2">
                                     <span className="text-[10px] uppercase bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{t.category}</span>
                                     {t.id.includes('sms') && <span className="text-[10px] uppercase bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">SMS</span>}
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>

                 <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                     {selectedTemplate ? (
                         <>
                             <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                 <div>
                                     <h3 className="font-bold text-slate-900">{selectedTemplate.name}</h3>
                                     <p className="text-xs text-slate-500">{selectedTemplate.description}</p>
                                 </div>
                                 <Button size="sm" onClick={handleSaveTemplate}><Save size={14} className="mr-2"/> Speichern</Button>
                             </div>
                             <div className="p-6 flex-1 overflow-y-auto space-y-4">
                                 {!selectedTemplate.id.includes('sms') && (
                                     <div>
                                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Betreff</label>
                                         <input 
                                            type="text" 
                                            value={selectedTemplate.subject} 
                                            onChange={e => setSelectedTemplate({...selectedTemplate, subject: e.target.value})}
                                            className="w-full p-2 border rounded font-medium"
                                         />
                                     </div>
                                 )}
                                 <div className="flex-1 flex flex-col h-full">
                                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Inhalt {selectedTemplate.id.includes('sms') ? '(Plain Text)' : '(HTML)'}</label>
                                     <textarea 
                                        value={selectedTemplate.body} 
                                        onChange={e => setSelectedTemplate({...selectedTemplate, body: e.target.value})}
                                        className="w-full flex-1 p-2 border rounded font-mono text-sm min-h-[300px]"
                                     />
                                 </div>
                             </div>
                         </>
                     ) : (
                         <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                             <Mail size={48} className="mb-4 opacity-20"/>
                             <p>Wähle ein Template aus der Liste.</p>
                         </div>
                     )}
                 </div>
             </div>
          )}

          {/* SETTINGS TAB (formerly System) */}
          {activeTab === 'settings' && (
              <div className="space-y-6 animate-in fade-in">
                  
                  {/* Prices */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><CreditCard size={18} /> Abo Preise</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Preis für Neukunden (€)</label>
                              <input 
                                  type="number" 
                                  step="0.01" 
                                  value={prices.new}
                                  onChange={e => onUpdatePrices({...prices, new: Number(e.target.value)})}
                                  className="w-full p-2 border rounded"
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Preis für Bestandskunden (Anzeige)</label>
                              <input 
                                  type="number" 
                                  step="0.01" 
                                  value={prices.existing}
                                  onChange={e => onUpdatePrices({...prices, existing: Number(e.target.value)})}
                                  className="w-full p-2 border rounded"
                              />
                          </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                          <Button size="sm" onClick={handleSavePrices}>Preise Speichern</Button>
                      </div>
                  </div>

                  {/* System Status (Legacy System Tab Logic) */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Activity size={18} /> System Status Override</h3>
                      <div className="space-y-4">
                          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                              <span className="font-medium text-slate-700">Gold Status</span>
                              <div className="flex gap-2">
                                  <Button size="sm" variant={sysStatus.gold === 'available' ? 'primary' : 'outline'} onClick={() => handleUpdateStatus('gold', 'available')}>Available</Button>
                                  <Button size="sm" variant={sysStatus.gold === 'sold_out' ? 'danger' : 'outline'} onClick={() => handleUpdateStatus('gold', 'sold_out')}>Sold Out</Button>
                              </div>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                              <span className="font-medium text-slate-700">Silver Status</span>
                              <div className="flex gap-2">
                                  <Button size="sm" variant={sysStatus.silver === 'available' ? 'primary' : 'outline'} onClick={() => handleUpdateStatus('silver', 'available')}>Available</Button>
                                  <Button size="sm" variant={sysStatus.silver === 'sold_out' ? 'danger' : 'outline'} onClick={() => handleUpdateStatus('silver', 'sold_out')}>Sold Out</Button>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* URLs */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Link2 size={18} /> Ticket URLs</h3>
                      <div className="space-y-4">
                          <div>
                              <label className="text-xs font-bold text-slate-500 uppercase">ResortPass Gold URL</label>
                              <input 
                                  type="text" 
                                  value={productUrls.gold} 
                                  onChange={e => onUpdateProductUrls({...productUrls, gold: e.target.value})} 
                                  className="w-full p-2 border rounded text-sm mt-1" 
                              />
                          </div>
                          <div>
                              <label className="text-xs font-bold text-slate-500 uppercase">ResortPass Silver URL</label>
                              <input 
                                  type="text" 
                                  value={productUrls.silver} 
                                  onChange={e => onUpdateProductUrls({...productUrls, silver: e.target.value})} 
                                  className="w-full p-2 border rounded text-sm mt-1" 
                              />
                          </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                          <Button size="sm" onClick={handleSaveUrls}>URLs Speichern</Button>
                      </div>
                  </div>
              </div>
          )}

      </div>

      {/* CUSTOMER DETAIL MODAL */}
      {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                      <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                          <Users className="text-blue-600" />
                          Kundendetails
                      </h2>
                      <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
                  </div>
                  
                  <div className="p-6 space-y-6">
                      {/* Subscription Info */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <h3 className="font-bold text-slate-700 mb-2 text-sm uppercase">Abo Status</h3>
                          <div className="flex justify-between items-center">
                              <div>
                                  <p className="text-lg font-bold">
                                    {selectedCustomer.subscription?.status === 'active' ? <span className="text-green-600">Aktiv</span> : <span className="text-slate-500">Inaktiv / Gekündigt</span>}
                                  </p>
                                  <p className="text-sm text-slate-500">Plan: {selectedCustomer.subscription?.plan_type || 'None'}</p>
                              </div>
                              <div className="flex flex-col gap-2">
                                  {selectedCustomer.subscription?.plan_type !== 'Manuell (Gratis)' && (
                                    <Button size="sm" variant="outline" onClick={() => handleManageSub('grant_free')}><Gift size={14} className="mr-2"/> Gratis Abo aktivieren</Button>
                                  )}
                                  {selectedCustomer.subscription?.plan_type === 'Manuell (Gratis)' && (
                                    <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => handleManageSub('revoke_free')}><UserX size={14} className="mr-2"/> Gratis entfernen</Button>
                                  )}
                                  {selectedCustomer.subscription?.status === 'active' && selectedCustomer.subscription?.stripe_subscription_id && (
                                    <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => handleManageSub('cancel_sub')}><XCircle size={14} className="mr-2"/> Stripe Kündigen</Button>
                                  )}
                              </div>
                          </div>
                      </div>

                      {/* Partner Info */}
                      <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                          <h3 className="font-bold text-indigo-800 mb-2 text-sm uppercase">Geworben von</h3>
                          <div className="flex items-center gap-2">
                              <Handshake size={20} className="text-indigo-500" />
                              {selectedCustomer.profile.referred_by ? (
                                  <span className="font-mono text-lg font-bold text-indigo-700">{selectedCustomer.profile.referred_by}</span>
                              ) : (
                                  <span className="text-slate-400 italic">Kein Partner (Organisch)</span>
                              )}
                          </div>
                      </div>

                      {/* Personal Data Form */}
                      <div>
                          <div className="flex justify-between items-center mb-4">
                              <h3 className="font-bold text-slate-900">Stammdaten</h3>
                              {!editCustomerMode ? (
                                  <Button size="sm" variant="outline" onClick={() => setEditCustomerMode(true)}><Edit2 size={14} className="mr-2"/> Bearbeiten</Button>
                              ) : (
                                  <div className="flex gap-2">
                                      <Button size="sm" onClick={handleSaveCustomer}><Save size={14} className="mr-2"/> Speichern</Button>
                                      <Button size="sm" variant="outline" onClick={() => setEditCustomerMode(false)}>Abbrechen</Button>
                                  </div>
                              )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vorname</label>
                                  <input type="text" disabled={!editCustomerMode} value={customerForm.firstName} onChange={e => setCustomerForm({...customerForm, firstName: e.target.value})} className="w-full p-2 border rounded disabled:bg-slate-50" />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nachname</label>
                                  <input type="text" disabled={!editCustomerMode} value={customerForm.lastName} onChange={e => setCustomerForm({...customerForm, lastName: e.target.value})} className="w-full p-2 border rounded disabled:bg-slate-50" />
                              </div>
                              <div className="col-span-2">
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                                  <input type="email" disabled={!editCustomerMode} value={customerForm.email} onChange={e => setCustomerForm({...customerForm, email: e.target.value})} className="w-full p-2 border rounded disabled:bg-slate-50" />
                              </div>
                              <div className="col-span-2">
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Straße & Nr.</label>
                                  <div className="flex gap-2">
                                      <input type="text" disabled={!editCustomerMode} value={customerForm.street} onChange={e => setCustomerForm({...customerForm, street: e.target.value})} className="flex-1 p-2 border rounded disabled:bg-slate-50" placeholder="Straße" />
                                      <input type="text" disabled={!editCustomerMode} value={customerForm.houseNumber} onChange={e => setCustomerForm({...customerForm, houseNumber: e.target.value})} className="w-20 p-2 border rounded disabled:bg-slate-50" placeholder="Nr" />
                                  </div>
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">PLZ</label>
                                  <input type="text" disabled={!editCustomerMode} value={customerForm.zip} onChange={e => setCustomerForm({...customerForm, zip: e.target.value})} className="w-full p-2 border rounded disabled:bg-slate-50" />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Stadt</label>
                                  <input type="text" disabled={!editCustomerMode} value={customerForm.city} onChange={e => setCustomerForm({...customerForm, city: e.target.value})} className="w-full p-2 border rounded disabled:bg-slate-50" />
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};