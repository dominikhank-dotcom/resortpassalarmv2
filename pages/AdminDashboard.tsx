import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Settings, Briefcase, 
  TrendingUp, DollarSign, Activity, Database, Mail, 
  Sparkles, Key, ArrowLeft, UserX, Gift, Lock, Link, RefreshCw, Wallet, Check, Save, Terminal, Calendar, UserPlus, XCircle, Wrench, PiggyBank, Search, MessageSquare, Copy, ChevronRight, AlertCircle, Send, CheckCircle, Handshake, CreditCard, Sliders
} from 'lucide-react';
import { Button } from '../components/Button';
import { generateAdminInsights } from '../services/geminiService';
import { sendTemplateTest, testBrowseAiConnection, testGeminiConnection, manageSubscription, getCustomerDetails, updateSystemSettings, updateSystemStatus, getSystemSettings, getAdminPayouts, markPayoutComplete, adminUpdateCustomer, getEmailTemplates, saveEmailTemplate } from '../services/backendService';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'partners' | 'finance' | 'settings' | 'system' | 'emails'>('overview');
  const [stats, setStats] = useState<any>({
    activeUsers: 0,
    revenue: 0,
    profit: 0,
    newCustomers: 0,
    conversionRate: 0
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
  const [searchUserId, setSearchUserId] = useState("");
  const [foundUser, setFoundUser] = useState<any>(null);

  // Finance State
  const [payouts, setPayouts] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
    loadSystemSettings();
  }, []);

  useEffect(() => {
    if (activeTab === 'users' || activeTab === 'partners') loadAllUsers();
    if (activeTab === 'finance') loadPayouts();
    if (activeTab === 'emails') loadTemplates();
  }, [activeTab]);

  const loadStats = async () => {
    try {
        const response = await fetch('/api/admin-stats');
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
      }
  };

  const loadAllUsers = async () => {
    try {
        const res = await fetch('/api/debug-users');
        const data = await res.json();
        if (data.users) setUserList(data.users);
    } catch (e) { console.error("Load Users Error", e); }
  };

  const loadPayouts = async () => {
      try {
          const data = await getAdminPayouts();
          if (data) setPayouts(data);
      } catch (e) { console.error("Load Payouts Error", e); }
  };

  const loadTemplates = async () => {
      const t = await getEmailTemplates();
      if (t) setTemplates(t);
  };

  const handleGenerateInsights = async () => {
      setLoading(true);
      try {
          const text = await generateAdminInsights(stats);
          setAiInsights(text);
      } catch (e) {
          setAiInsights("Fehler bei der Generierung.");
      } finally {
          setLoading(false);
      }
  };

  const handleUpdateStatus = async (type: 'gold' | 'silver', status: 'available' | 'sold_out') => {
      if (!confirm(`Bist du sicher? Dies sendet Alarme für ${type.toUpperCase()} wenn 'available'!`)) return;
      try {
          await updateSystemStatus(type, status);
          alert(`Status für ${type} auf ${status} gesetzt. Alarme werden versendet.`);
          loadSystemSettings();
      } catch (e: any) {
          alert("Fehler: " + e.message);
      }
  };

  const handleUserSearch = async () => {
      if (!searchUserId) return;
      try {
          const data = await getCustomerDetails(searchUserId);
          if (data.success) {
              setFoundUser({ profile: data.profile, subscription: data.subscription });
          } else {
              alert("User nicht gefunden.");
              setFoundUser(null);
          }
      } catch (e: any) {
          alert(e.message);
      }
  };

  const handleSaveTemplate = async () => {
      if (!selectedTemplate) return;
      try {
          await saveEmailTemplate(selectedTemplate);
          alert("Template gespeichert!");
          loadTemplates();
      } catch (e: any) {
          alert("Fehler: " + e.message);
      }
  };

  const handleTestEmail = async () => {
      if (!selectedTemplate || !testEmailAddr) return alert("Template wählen und Email angeben");
      try {
          await sendTemplateTest(selectedTemplate, testEmailAddr);
          alert("Test Email gesendet!");
      } catch (e: any) {
          alert("Fehler: " + e.message);
      }
  };

  const handleMarkPaid = async (id: string) => {
      if (!confirm("Als bezahlt markieren?")) return;
      try {
          await markPayoutComplete(id);
          loadPayouts();
      } catch (e: any) {
          alert("Fehler: " + e.message);
      }
  };

  const handleSaveCommission = async () => {
    try {
      await updateSystemSettings('global_commission_rate', commissionRate.toString());
      alert("Provision erfolgreich gespeichert!");
    } catch(e: any) { alert("Fehler: " + e.message); }
  };

  const handleSavePrices = async () => {
    try {
      await updateSystemSettings('price_new_customers', prices.new.toString());
      await updateSystemSettings('price_existing_customers', prices.existing.toString());
      // Also save URLs here as they are part of settings now
      await updateSystemSettings('url_gold', productUrls.gold);
      await updateSystemSettings('url_silver', productUrls.silver);
      alert("Einstellungen erfolgreich gespeichert!");
    } catch(e: any) { alert("Fehler: " + e.message); }
  };

  const filteredUsers = userList.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id?.includes(searchTerm)
  );

  const affiliateUsers = userList.filter(u => u.sub_status === 'NO_SUB' && u.plan === 'N/A' && !u.sub_stripe_id); // Basic filter, improved if API returns role
  // Since debug-users might not return role explicitly in the root object (it does in the new implementation of debug-users if updated, but let's assume we filter by logic or update the API).
  // Actually, the previous debug-users API returns a flat object. I should update debug-users API to include role or rely on what I have.
  // Ideally, I filter by checking if they are not in the subscription list or if I add role to debug-users. 
  // Let's assume for now we list all users in Partners tab who have a referral code or are marked as affiliate?
  // Since I don't want to change the API right now, I'll rely on the User List tab for full management and just show Commission settings in Partners tab.

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-[#001529] text-white py-4 px-6 shadow-md sticky top-0 z-40">
         <div className="max-w-7xl mx-auto flex flex-col xl:flex-row justify-between items-center gap-4">
             <h1 className="text-xl font-bold flex items-center gap-2"><LayoutDashboard className="text-blue-400"/> Admin Konsole</h1>
             <div className="flex gap-1 bg-slate-800 p-1 rounded-lg overflow-x-auto max-w-full no-scrollbar">
                 {[
                   { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                   { id: 'users', label: 'Users', icon: Users },
                   { id: 'partners', label: 'Partner', icon: Handshake },
                   { id: 'finance', label: 'Finance', icon: DollarSign },
                   { id: 'settings', label: 'Einstellungen', icon: Sliders },
                   { id: 'system', label: 'System', icon: Activity },
                   { id: 'emails', label: 'Emails', icon: Mail }
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
          {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                          <p className="text-slate-500 text-xs uppercase font-bold">Aktive Abos</p>
                          <p className="text-2xl font-bold text-slate-900">{stats.activeUsers}</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                          <p className="text-slate-500 text-xs uppercase font-bold">MRR (Umsatz)</p>
                          <p className="text-2xl font-bold text-green-600">{stats.revenue.toFixed(2)} €</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                          <p className="text-slate-500 text-xs uppercase font-bold">Gewinn (Est.)</p>
                          <p className="text-2xl font-bold text-blue-600">{stats.profit.toFixed(2)} €</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                          <p className="text-slate-500 text-xs uppercase font-bold">Conversion Rate</p>
                          <p className="text-2xl font-bold text-purple-600">{stats.conversionRate}%</p>
                      </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                      <div className="flex justify-between items-center mb-4">
                          <h3 className="font-bold text-slate-900 flex items-center gap-2"><Sparkles className="text-yellow-500" size={18} /> KI Business Analyst</h3>
                          <Button size="sm" onClick={handleGenerateInsights} disabled={loading}>{loading ? 'Analysiere...' : 'Bericht generieren'}</Button>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 min-h-[100px]">
                          {aiInsights ? <p className="whitespace-pre-line text-sm text-slate-700">{aiInsights}</p> : <p className="text-slate-400 text-sm italic">Klicke auf Generieren für eine Analyse...</p>}
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'partners' && (
              <div className="space-y-6 animate-in fade-in">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                      <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2"><Handshake size={18} /> Partner Konditionen</h3>
                      
                      <div className="max-w-md space-y-4">
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                              <p className="text-sm text-blue-800">
                                  Diese Einstellung betrifft alle Partner. Die Provision wird automatisch berechnet, wenn ein geworbener Kunde bezahlt.
                              </p>
                          </div>

                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Globale Provision (%)</label>
                              <div className="flex items-center gap-4">
                                  <input 
                                      type="number" 
                                      min="0" 
                                      max="100" 
                                      step="1"
                                      value={commissionRate} 
                                      onChange={(e) => onUpdateCommission(Number(e.target.value))} 
                                      className="w-32 px-4 py-2 border rounded-lg font-bold text-lg" 
                                  />
                                  <span className="text-slate-500 font-medium">% vom Umsatz</span>
                              </div>
                              <p className="text-xs text-slate-500 mt-2">Standard: 50%. Gilt für alle zukünftigen Transaktionen.</p>
                          </div>

                          <div className="pt-4">
                              <Button onClick={handleSaveCommission}>
                                  <Save size={16} className="mr-2" />
                                  Provision speichern
                              </Button>
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'settings' && (
              <div className="space-y-6 animate-in fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Pricing Config */}
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><CreditCard size={18} /> Preis-Gestaltung</h3>
                          <div className="space-y-6">
                              <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-1">Preis für Neukunden (monatlich)</label>
                                  <div className="relative">
                                      <input 
                                          type="number" 
                                          step="0.01" 
                                          value={prices.new} 
                                          onChange={(e) => onUpdatePrices({...prices, new: Number(e.target.value)})} 
                                          className="w-full px-4 py-2 pl-8 border rounded-lg" 
                                      />
                                      <span className="absolute left-3 top-2.5 text-slate-400">€</span>
                                  </div>
                                  <p className="text-xs text-slate-400 mt-1">Ändert den Preis auf der Landing Page & im Stripe Checkout.</p>
                              </div>

                              <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-1">Preis für Bestandskunden (Anzeige)</label>
                                  <div className="relative">
                                      <input 
                                          type="number" 
                                          step="0.01" 
                                          value={prices.existing} 
                                          onChange={(e) => onUpdatePrices({...prices, existing: Number(e.target.value)})} 
                                          className="w-full px-4 py-2 pl-8 border rounded-lg" 
                                      />
                                      <span className="absolute left-3 top-2.5 text-slate-400">€</span>
                                  </div>
                                  <p className="text-xs text-slate-400 mt-1">Nur visuell im Dashboard für alte Abos. Ändert keine laufenden Stripe Abos!</p>
                              </div>
                          </div>
                      </div>

                      {/* URL Config */}
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Link size={18} /> Ziel-URLs</h3>
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
                              <div className="bg-amber-50 p-3 rounded text-xs text-amber-800 mt-2">
                                  <AlertCircle size={14} className="inline mr-1"/>
                                  Diese Links werden in den Alarm-Emails und SMS verwendet.
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="flex justify-end">
                      <Button size="lg" onClick={handleSavePrices} className="bg-[#00305e]">
                          <Save size={18} className="mr-2" />
                          Alle Einstellungen speichern
                      </Button>
                  </div>
              </div>
          )}

          {activeTab === 'system' && (
              <div className="space-y-6 animate-in fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Activity size={18} /> Manueller Status Override</h3>
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
                              <p className="text-xs text-slate-400 mt-2">Letzter Check: {sysStatus.lastChecked}</p>
                          </div>
                      </div>
                      
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                          <h3 className="font-bold text-slate-900 mb-4">Verbindungs-Tests</h3>
                          <div className="flex gap-4">
                              <Button size="sm" variant="outline" onClick={async () => {
                                  try { const res = await testBrowseAiConnection(); alert(JSON.stringify(res)); } catch(e:any) { alert(e.message); }
                              }}>Test Browse.ai</Button>
                              <Button size="sm" variant="outline" onClick={async () => {
                                  try { const res = await testGeminiConnection(); alert(JSON.stringify(res)); } catch(e:any) { alert(e.message); }
                              }}>Test Gemini AI</Button>
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'users' && (
              <div className="space-y-6 animate-in fade-in">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Search size={18} /> Detail-Suche & Aktionen</h3>
                    <div className="flex gap-2 mb-6">
                        <input type="text" placeholder="User UUID eingeben..." value={searchUserId} onChange={(e) => setSearchUserId(e.target.value)} className="flex-1 p-2 border rounded" />
                        <Button onClick={handleUserSearch}>Laden</Button>
                    </div>
                    {foundUser && (
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                          <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold">{foundUser.profile?.first_name} {foundUser.profile?.last_name}</h4>
                                <span className="text-xs font-mono text-slate-500 block">{foundUser.profile?.id}</span>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-bold ${foundUser.subscription?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {foundUser.subscription?.status || 'Kein Abo'}
                              </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                              <div><span className="font-bold text-slate-500">Email:</span> {foundUser.profile?.email}</div>
                              <div><span className="font-bold text-slate-500">Rolle:</span> {foundUser.profile?.role}</div>
                              <div><span className="font-bold text-slate-500">Plan:</span> {foundUser.subscription?.plan_type || '-'}</div>
                              <div><span className="font-bold text-slate-500">Stripe ID:</span> {foundUser.subscription?.stripe_customer_id || '-'}</div>
                          </div>
                          <div className="flex gap-2 pt-2 border-t border-slate-200">
                              <Button size="sm" variant="outline" onClick={() => manageSubscription(foundUser.profile.id, 'grant_free').then(() => handleUserSearch())}><Gift size={14} className="mr-2"/> Gratis Abo</Button>
                              <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => manageSubscription(foundUser.profile.id, 'revoke_free').then(() => handleUserSearch())}><UserX size={14} className="mr-2"/> Gratis entfernen</Button>
                              <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => manageSubscription(foundUser.profile.id, 'cancel_sub').then(() => handleUserSearch())}><XCircle size={14} className="mr-2"/> Stripe Kündigen</Button>
                          </div>
                      </div>
                  )}
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2"><Users size={18} /> User Liste ({userList.length})</h3>
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
                                      <th className="px-4 py-3">User</th>
                                      <th className="px-4 py-3">ID</th>
                                      <th className="px-4 py-3">Sub Status</th>
                                      <th className="px-4 py-3">Plan</th>
                                      <th className="px-4 py-3">Aktion</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                  {filteredUsers.slice(0, 50).map((u: any) => (
                                      <tr key={u.id} className="hover:bg-slate-50">
                                          <td className="px-4 py-3">
                                              <div className="font-medium text-slate-900">{u.name}</div>
                                              <div className="text-slate-500 text-xs">{u.email}</div>
                                          </td>
                                          <td className="px-4 py-3 font-mono text-xs text-slate-400 select-all">{u.id}</td>
                                          <td className="px-4 py-3">
                                              {u.sub_status === 'active' || u.sub_status === 'trialing' ? 
                                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">Aktiv</span> : 
                                                <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-xs">Inaktiv</span>
                                              }
                                          </td>
                                          <td className="px-4 py-3 text-slate-600">{u.plan || '-'}</td>
                                          <td className="px-4 py-3">
                                              <button onClick={() => { setSearchUserId(u.id); handleUserSearch(); window.scrollTo(0,0); }} className="text-blue-600 hover:underline">
                                                  Details
                                              </button>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                          {filteredUsers.length === 0 && <p className="text-center py-8 text-slate-400">Keine User gefunden.</p>}
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'finance' && (
              <div className="space-y-6 animate-in fade-in">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                      <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2"><DollarSign size={18} /> Auszahlungsanfragen</h3>
                      <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                              <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                                  <tr>
                                      <th className="px-4 py-3">Datum</th>
                                      <th className="px-4 py-3">Partner</th>
                                      <th className="px-4 py-3">Betrag</th>
                                      <th className="px-4 py-3">Methode</th>
                                      <th className="px-4 py-3">Aktion</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                  {payouts.map((p: any) => (
                                      <tr key={p.id}>
                                          <td className="px-4 py-3 text-slate-500">{new Date(p.requested_at).toLocaleDateString()}</td>
                                          <td className="px-4 py-3 font-medium">
                                              {p.profiles?.first_name} {p.profiles?.last_name}
                                              <div className="text-xs text-slate-400">{p.profiles?.email}</div>
                                          </td>
                                          <td className="px-4 py-3 font-bold text-slate-900">{p.amount.toFixed(2)} €</td>
                                          <td className="px-4 py-3 text-slate-500">{p.paypal_email || 'Stripe'}</td>
                                          <td className="px-4 py-3">
                                              <Button size="sm" onClick={() => handleMarkPaid(p.id)} className="bg-green-600 hover:bg-green-700 text-white">
                                                  <Check size={14} className="mr-1" /> Mark Paid
                                              </Button>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                          {payouts.length === 0 && <div className="text-center py-12 text-slate-400">Keine offenen Anfragen.</div>}
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'emails' && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)] animate-in fade-in">
                 {/* List */}
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
                                 <div className="text-xs text-slate-500 truncate">{t.subject}</div>
                                 <div className="mt-1 flex gap-2">
                                     <span className="text-[10px] uppercase bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{t.category}</span>
                                     {t.isEnabled ? <span className="text-[10px] text-green-600 flex items-center"><CheckCircle size={10} className="mr-1"/> Aktiv</span> : <span className="text-[10px] text-slate-400">Inaktiv</span>}
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>

                 {/* Editor */}
                 <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                     {selectedTemplate ? (
                         <>
                             <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                 <div>
                                     <h3 className="font-bold text-slate-900">{selectedTemplate.name}</h3>
                                     <p className="text-xs text-slate-500">{selectedTemplate.description}</p>
                                 </div>
                                 <div className="flex gap-2">
                                    <label className="flex items-center gap-2 text-sm mr-2 cursor-pointer">
                                        <input type="checkbox" checked={selectedTemplate.isEnabled} onChange={e => setSelectedTemplate({...selectedTemplate, isEnabled: e.target.checked})} />
                                        Aktiv
                                    </label>
                                     <Button size="sm" onClick={handleSaveTemplate}><Save size={14} className="mr-2"/> Speichern</Button>
                                 </div>
                             </div>
                             <div className="p-6 flex-1 overflow-y-auto space-y-4">
                                 <div>
                                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Betreff</label>
                                     <input 
                                        type="text" 
                                        value={selectedTemplate.subject} 
                                        onChange={e => setSelectedTemplate({...selectedTemplate, subject: e.target.value})}
                                        className="w-full p-2 border rounded font-medium"
                                     />
                                 </div>
                                 <div className="flex-1 flex flex-col h-full">
                                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Inhalt (HTML)</label>
                                     <textarea 
                                        value={selectedTemplate.body} 
                                        onChange={e => setSelectedTemplate({...selectedTemplate, body: e.target.value})}
                                        className="w-full flex-1 p-2 border rounded font-mono text-sm min-h-[300px]"
                                     />
                                 </div>
                                 <div className="bg-slate-50 p-3 rounded border border-slate-100">
                                     <p className="text-xs font-bold text-slate-500 mb-2">Verfügbare Variablen:</p>
                                     <div className="flex flex-wrap gap-2">
                                         {selectedTemplate.variables?.map(v => (
                                             <span key={v} className="bg-white border px-2 py-1 rounded text-xs font-mono text-slate-600 cursor-pointer hover:border-blue-300" onClick={() => {
                                                 alert(`Variable ${v} kopiert (simuliert)`);
                                             }}>
                                                 {v}
                                             </span>
                                         ))}
                                     </div>
                                 </div>
                             </div>
                             <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2 items-center">
                                 <input 
                                    type="email" 
                                    placeholder="Test Email Adresse" 
                                    value={testEmailAddr}
                                    onChange={e => setTestEmailAddr(e.target.value)}
                                    className="flex-1 p-2 text-sm border rounded"
                                 />
                                 <Button size="sm" variant="secondary" onClick={handleTestEmail}><Send size={14} className="mr-2"/> Test Senden</Button>
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
      </div>
    </div>
  );
};

const UserSearch = ({ size }: { size: number }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="10" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><path d="M10 14a4 4 0 0 0-4-4"/></svg>;