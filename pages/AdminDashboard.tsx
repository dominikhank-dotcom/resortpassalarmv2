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
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'system' | 'finance' | 'emails'>('overview');
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

  // Users Management State
  const [searchUserId, setSearchUserId] = useState("");
  const [foundUser, setFoundUser] = useState<any>(null);

  useEffect(() => {
    loadStats();
    loadSystemSettings();
  }, []);

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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-[#001529] text-white py-4 px-6 shadow-md">
         <div className="max-w-7xl mx-auto flex justify-between items-center">
             <h1 className="text-xl font-bold flex items-center gap-2"><LayoutDashboard className="text-blue-400"/> Admin Konsole</h1>
             <div className="flex gap-4 text-sm">
                 <button onClick={() => setActiveTab('overview')} className={`${activeTab === 'overview' ? 'text-white font-bold' : 'text-slate-400'}`}>Übersicht</button>
                 <button onClick={() => setActiveTab('users')} className={`${activeTab === 'users' ? 'text-white font-bold' : 'text-slate-400'}`}>Kunden</button>
                 <button onClick={() => setActiveTab('system')} className={`${activeTab === 'system' ? 'text-white font-bold' : 'text-slate-400'}`}>System</button>
                 <button onClick={() => setActiveTab('finance')} className={`${activeTab === 'finance' ? 'text-white font-bold' : 'text-slate-400'}`}>Finanzen</button>
                 <button onClick={() => setActiveTab('emails')} className={`${activeTab === 'emails' ? 'text-white font-bold' : 'text-slate-400'}`}>Emails</button>
             </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
          {activeTab === 'overview' && (
              <div className="space-y-6">
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

          {activeTab === 'system' && (
              <div className="space-y-6">
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
                          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Link size={18} /> Produkt URLs</h3>
                          <div className="space-y-4">
                              <div>
                                  <label className="text-xs font-bold text-slate-500 uppercase">Gold URL</label>
                                  <input type="text" value={productUrls.gold} onChange={e => onUpdateProductUrls({...productUrls, gold: e.target.value})} className="w-full p-2 border rounded text-sm mt-1" />
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-slate-500 uppercase">Silver URL</label>
                                  <input type="text" value={productUrls.silver} onChange={e => onUpdateProductUrls({...productUrls, silver: e.target.value})} className="w-full p-2 border rounded text-sm mt-1" />
                              </div>
                              <Button size="sm" onClick={() => {
                                  updateSystemSettings('url_gold', productUrls.gold);
                                  updateSystemSettings('url_silver', productUrls.silver);
                                  alert("URLs gespeichert");
                              }}>Speichern</Button>
                          </div>
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
          )}

          {activeTab === 'users' && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><UserSearch size={18} /> Kundensuche</h3>
                  <div className="flex gap-2 mb-6">
                      <input type="text" placeholder="User UUID eingeben..." value={searchUserId} onChange={(e) => setSearchUserId(e.target.value)} className="flex-1 p-2 border rounded" />
                      <Button onClick={handleUserSearch}><Search size={16} /> Suchen</Button>
                  </div>
                  
                  {foundUser && (
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                          <div className="flex justify-between">
                              <h4 className="font-bold">{foundUser.profile?.first_name} {foundUser.profile?.last_name}</h4>
                              <span className="text-xs font-mono text-slate-500">{foundUser.profile?.id}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                              <div><span className="font-bold">Email:</span> {foundUser.profile?.email}</div>
                              <div><span className="font-bold">Rolle:</span> {foundUser.profile?.role}</div>
                              <div><span className="font-bold">Abo Status:</span> {foundUser.subscription?.status || 'Kein Abo'}</div>
                              <div><span className="font-bold">Plan:</span> {foundUser.subscription?.plan_type || '-'}</div>
                          </div>
                          <div className="flex gap-2 pt-2 border-t border-slate-200">
                              <Button size="sm" variant="outline" onClick={() => manageSubscription(foundUser.profile.id, 'grant_free').then(() => handleUserSearch())}>Gratis Abo geben</Button>
                              <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => manageSubscription(foundUser.profile.id, 'revoke_free').then(() => handleUserSearch())}>Gratis Abo entziehen</Button>
                              <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => manageSubscription(foundUser.profile.id, 'cancel_sub').then(() => handleUserSearch())}>Stripe Abo kündigen</Button>
                          </div>
                      </div>
                  )}
              </div>
          )}

          {activeTab === 'emails' && (
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center text-slate-500">
                 <Mail size={48} className="mx-auto mb-2 opacity-20" />
                 <p>Email Template Management hier verfügbar.</p>
                 <Button variant="outline" className="mt-4" onClick={async () => {
                     const t = await getEmailTemplates();
                     if (t) setTemplates(t);
                     alert(`Geladen: ${t?.length || 0} Templates`);
                 }}>Templates laden</Button>
             </div>
          )}
      </div>
    </div>
  );
};

const UserSearch = ({ size }: { size: number }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="10" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><path d="M10 14a4 4 0 0 0-4-4"/></svg>;
