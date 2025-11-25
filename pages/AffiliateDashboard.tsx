import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Copy, TrendingUp, Users, DollarSign, Sparkles, LayoutDashboard, Settings, CreditCard, Save, AlertCircle, Lock, User, Loader2, CheckCircle, Clock } from 'lucide-react';
import { AffiliateStats } from '../types';
import { Button } from '../components/Button';
import { generateMarketingCopy } from '../services/geminiService';
import { supabase } from '../lib/supabase';
import { requestPayout } from '../services/backendService';

export const AffiliateDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');
  
  // Real Data States
  const [isLoading, setIsLoading] = useState(true);
  const [refLink, setRefLink] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  
  const [stats, setStats] = useState<AffiliateStats>({
    clicks: 0, 
    conversions: 0,
    earnings: 0,
    history: []
  });

  // AI States
  const [aiText, setAiText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [platform, setPlatform] = useState<'twitter' | 'email' | 'instagram'>('twitter');

  // Settings Form State
  const [settings, setSettings] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    houseNumber: '',
    zip: '',
    city: '',
    country: 'Deutschland',
    company: '',
    vatId: '',
    paypalEmail: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  useEffect(() => {
    fetchAffiliateData();
  }, []);

  const fetchAffiliateData = async () => {
    setIsLoading(true);
    try {
      // 1. Get Current User
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // 2. Get Profile (for Ref Code & Personal Data)
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        // Set Ref Link
        const origin = window.location.origin;
        setRefLink(`${origin}?ref=${profile.referral_code}`);

        // Pre-fill settings
        setSettings(prev => ({
            ...prev,
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            email: profile.email || user.email || '',
        }));
      }

      // 3. Get Commissions (Real Earnings)
      // Only 'pending' commissions count towards available balance for payout
      const { data: pendingCommissions } = await supabase
        .from('commissions')
        .select('amount')
        .eq('partner_id', user.id)
        .eq('status', 'pending');
        
      const { data: allCommissions } = await supabase
        .from('commissions')
        .select('created_at')
        .eq('partner_id', user.id);

      // 4. Get Payout History
      const { data: myPayouts } = await supabase
        .from('payouts')
        .select('*')
        .eq('partner_id', user.id)
        .order('created_at', { ascending: false });
        
      setPayouts(myPayouts || []);

      if (pendingCommissions) {
        const currentBalance = pendingCommissions.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        const totalConversions = allCommissions?.length || 0;

        // Mock History for visual chart
        const mockHistory = [
             { date: 'Start', clicks: 0, conversions: 0 },
             { date: 'Heute', clicks: totalConversions * 5, conversions: totalConversions } 
        ];

        setStats({
            clicks: totalConversions * 12 + 4, 
            conversions: totalConversions,
            earnings: currentBalance, // Only pending balance available for payout
            history: mockHistory
        });
      }

    } catch (error) {
      console.error("Error fetching affiliate data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if mandatory fields are filled
  const areSettingsComplete = 
    settings.firstName.trim() !== '' &&
    settings.lastName.trim() !== '' &&
    settings.email.trim() !== '' &&
    settings.paypalEmail.trim() !== '';

  const handleCopy = () => {
    navigator.clipboard.writeText(refLink);
    alert("Link kopiert!");
  };

  const handleGenerateCopy = async () => {
    setIsGenerating(true);
    setAiText("KI denkt nach...");
    try {
      const text = await generateMarketingCopy(platform);
      setAiText(text);
    } catch (e) {
      setAiText("Fehler bei der Generierung.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePayout = async () => {
    if (stats.earnings < 20) {
      alert("Auszahlung erst ab 20,00 € möglich.");
      return;
    }
    if (!areSettingsComplete) {
      alert("Bitte vervollständige deine Stammdaten in den Einstellungen (inkl. PayPal).");
      setActiveTab('settings');
      return;
    }
    
    if (!userId) return;

    if (confirm(`Auszahlung von ${stats.earnings.toFixed(2)} € jetzt anfordern?`)) {
        try {
            await requestPayout(userId, settings.paypalEmail);
            alert("Auszahlung erfolgreich beantragt!");
            fetchAffiliateData(); // Refresh data
        } catch (e: any) {
            alert("Fehler: " + e.message);
        }
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    // In a real app, update profile table
    alert("Daten gespeichert (Simuliert). PayPal Adresse wird für Auszahlung verwendet.");
  };

  if (isLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <div className="text-center">
                  <Loader2 className="w-10 h-10 text-[#00305e] animate-spin mx-auto mb-4" />
                  <p className="text-slate-500">Lade Partner-Daten...</p>
              </div>
          </div>
      );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Tabs */}
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Partner Dashboard</h1>
            <p className="text-slate-500">Verdiene 50% Provision für jeden vermittelten ResortPass-Jäger.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-1 flex items-center gap-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'overview' 
                ? 'border-[#00305e] text-[#00305e]' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <LayoutDashboard size={18} />
            Übersicht
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-4 px-1 flex items-center gap-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'settings' 
                ? 'border-[#00305e] text-[#00305e]' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Settings size={18} />
            Einstellungen & Auszahlung
          </button>
        </div>
      </div>

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Users size={24} /></div>
              <div>
                <p className="text-slate-500 text-sm">Klicks (Geschätzt)</p>
                <p className="text-2xl font-bold text-slate-900">{stats.clicks}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="bg-purple-50 p-3 rounded-xl text-purple-600"><TrendingUp size={24} /></div>
              <div>
                <p className="text-slate-500 text-sm">Verkäufe (Gesamt)</p>
                <p className="text-2xl font-bold text-slate-900">{stats.conversions}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-green-50 p-3 rounded-xl text-green-600"><DollarSign size={24} /></div>
                <div>
                  <p className="text-slate-500 text-sm">Verdienst (Verfügbar)</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.earnings.toFixed(2)} €</p>
                </div>
              </div>
              <div>
                <Button 
                  onClick={handlePayout} 
                  size="sm" 
                  variant="outline" 
                  className="w-full text-green-700 border-green-200 hover:bg-green-50"
                  disabled={stats.earnings < 20}
                >
                  <CreditCard size={16} /> Auszahlen
                </Button>
                {!areSettingsComplete && (
                  <p className="text-xs text-red-500 mt-2 text-center font-medium">Pflichtangaben unvollständig</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Payout History Table */}
          {payouts.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900">Auszahlungshistorie</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Datum</th>
                                <th className="px-6 py-4">Betrag</th>
                                <th className="px-6 py-4">PayPal Konto</th>
                                <th className="px-6 py-4 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {payouts.map((payout) => (
                                <tr key={payout.id}>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {new Date(payout.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-900">
                                        {Number(payout.amount).toFixed(2)} €
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {payout.paypal_email}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium gap-1 ${
                                            payout.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                                        }`}>
                                            {payout.status === 'paid' ? <CheckCircle size={12}/> : <Clock size={12} />}
                                            {payout.status === 'paid' ? 'Bezahlt' : 'Bearbeitung'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          )}

          {/* Link Section */}
          <div className="bg-indigo-900 rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
            {/* ... link content (same as before) ... */}
            <div className="w-full md:w-1/2">
              <h3 className="text-lg font-semibold mb-2">Dein Affiliate Link</h3>
              <p className="text-indigo-200 text-sm mb-4">Teile diesen Link auf Social Media, deiner Webseite oder in Newslettern.</p>
              <div className="flex bg-indigo-800/50 p-1 rounded-lg border border-indigo-700">
                <input 
                  type="text" 
                  value={refLink} 
                  readOnly 
                  className="bg-transparent flex-1 px-3 py-2 text-sm text-white outline-none font-mono"
                />
                <button onClick={handleCopy} className="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2">
                  <Copy size={16} /> Kopieren
                </button>
              </div>
            </div>
            <div className="hidden md:block w-px h-24 bg-indigo-700/50"></div>
            <div className="w-full md:w-1/2">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Sparkles size={18} className="text-yellow-400" /> KI Marketing Assistent</h3>
              <p className="text-indigo-200 text-sm mb-4">Lass unsere KI den perfekten Werbetext für dich schreiben.</p>
              <div className="flex gap-2">
                <select 
                    value={platform} 
                    onChange={(e) => setPlatform(e.target.value as any)}
                    className="bg-indigo-800 border border-indigo-700 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                  >
                    <option value="twitter">X (Twitter)</option>
                    <option value="instagram">Instagram Caption</option>
                    <option value="email">Newsletter Intro</option>
                </select>
                <Button 
                    onClick={handleGenerateCopy} 
                    disabled={isGenerating}
                    variant="secondary" 
                    size="sm"
                    className="whitespace-nowrap"
                >
                  {isGenerating ? 'Generiere...' : 'Text erstellen'}
                </Button>
              </div>
            </div>
          </div>

          {/* AI Result Display */}
          {aiText && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 animate-in fade-in slide-in-from-top-4">
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">KI Vorschlag ({platform})</h4>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-slate-800 whitespace-pre-wrap">{aiText}</p>
              </div>
              <div className="mt-4 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(aiText)}>
                  <Copy size={16} className="mr-2" /> Text kopieren
                </Button>
              </div>
            </div>
          )}

          {/* Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[400px]">
            <h3 className="text-lg font-semibold mb-6">Performance Übersicht</h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.history}>
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                />
                <Area type="monotone" dataKey="clicks" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" />
                <Area type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={3} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB: SETTINGS & PAYOUT */}
      {activeTab === 'settings' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-6 md:p-8 space-y-8">
               <section>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <User size={16} /> Persönliche Daten
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Vorname</label>
                      <input type="text" value={settings.firstName} onChange={e => setSettings({...settings, firstName: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nachname</label>
                      <input type="text" value={settings.lastName} onChange={e => setSettings({...settings, lastName: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none" />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">E-Mail</label>
                    <input type="email" value={settings.email} readOnly className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-slate-100 outline-none" />
                  </div>
               </section>
               
               <div className="border-t border-slate-100 pt-8">
                   <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                       <CreditCard size={16} /> Auszahlung (PayPal)
                   </h3>
                   <p className="text-sm text-slate-500 mb-4">
                       Bitte gib deine PayPal-E-Mail-Adresse an, damit wir deine Provisionen auszahlen können.
                   </p>
                   <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">PayPal E-Mail Adresse <span className="text-red-500">*</span></label>
                        <input 
                            type="email" 
                            required
                            value={settings.paypalEmail} 
                            onChange={e => setSettings({...settings, paypalEmail: e.target.value})} 
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500" 
                            placeholder="name@example.com"
                        />
                   </div>
               </div>

               <div className="flex justify-end pt-4">
                  <Button type="submit" variant="primary" size="lg" className="bg-[#00305e]">
                    <Save size={18} /> Einstellungen speichern
                  </Button>
               </div>
             </div>
          </form>
        </div>
      )}
    </div>
  );
};