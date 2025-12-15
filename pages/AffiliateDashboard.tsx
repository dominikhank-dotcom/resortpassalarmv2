
import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Copy, TrendingUp, Users, DollarSign, Sparkles, LayoutDashboard, Settings, CreditCard, Save, AlertCircle, Lock, User, Globe, Hash, Check, AlertTriangle, ArrowRight, Wallet, Info, Calendar } from 'lucide-react';
import { AffiliateStats } from '../types';
import { Button } from '../components/Button';
import { generateMarketingCopy } from '../services/geminiService';
import { supabase, getEnv } from '../lib/supabase';
import { updateAffiliateProfile, connectStripe, requestStripePayout } from '../services/backendService';

// Mock Stats (Revenue history would come from commissions table in real DB)
const INITIAL_STATS: AffiliateStats = {
  clicks: 0,
  conversions: 0,
  earnings: 0.00,
  history: []
};

interface AffiliateDashboardProps {
  commissionRate: number;
  price: number;
}

export const AffiliateDashboard: React.FC<AffiliateDashboardProps> = ({ commissionRate, price }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');
  const [stats, setStats] = useState<AffiliateStats>(INITIAL_STATS);
  const [refLink, setRefLink] = useState("Lade...");
  const [aiText, setAiText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [platform, setPlatform] = useState<'twitter' | 'email' | 'instagram'>('twitter');
  const [stripeConnected, setStripeConnected] = useState(false);
  const [isPayoutLoading, setIsPayoutLoading] = useState(false);
  const [rawCommissions, setRawCommissions] = useState<any[]>([]);

  // Date Filter State
  const [dateRange, setDateRange] = useState({
      start: new Date(new Date().setDate(new Date().getDate() - 28)).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
  });
  const [datePreset, setDatePreset] = useState('last28');
  const [dailyStats, setDailyStats] = useState<any[]>([]);

  // Welcome Mail Ref
  const welcomeTriggeredRef = useRef(false);

  // Settings Form State
  const [settings, setSettings] = useState({
    firstName: '',
    lastName: '',
    email: '',
    website: '', 
    referralCode: '',
    street: '',
    houseNumber: '',
    zip: '',
    city: '',
    country: 'Deutschland',
    company: '',
    vatId: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  // Calculate earning per new sub
  const earningPerSub = (price * commissionRate / 100).toFixed(2);

  // Load Real Data
  useEffect(() => {
    const loadProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            
            if (profile) {
                // --- TRIGGER WELCOME MAIL (Partner) ---
                if (profile.partner_welcome_sent === false || profile.partner_welcome_sent === null) {
                    const sessionKey = `partner_welcome_sent_${user.id}`;
                    const alreadyTriggeredSession = sessionStorage.getItem(sessionKey);

                    if (!welcomeTriggeredRef.current && !alreadyTriggeredSession) {
                        welcomeTriggeredRef.current = true;
                        sessionStorage.setItem(sessionKey, 'true');
                        
                        console.log("AffiliateDashboard: Triggering welcome email for", user.email);

                        fetch('/api/trigger-partner-welcome', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({ 
                                userId: user.id, 
                                email: user.email, 
                                firstName: user.user_metadata?.first_name 
                            })
                        })
                        .then(async res => {
                            const json = await res.json();
                            console.log("AffiliateDashboard: Welcome API Response:", json);
                        })
                        .catch(e => console.error("Welcome trigger failed:", e));
                    }
                }

                const loadedCode = profile.referral_code || profile.id;
                setSettings({
                    firstName: profile.first_name || '',
                    lastName: profile.last_name || '',
                    email: profile.email || user.email || '',
                    website: profile.website || '',
                    referralCode: loadedCode, // Use custom code or fallback to ID
                    street: profile.street || '',
                    houseNumber: profile.house_number || '',
                    zip: profile.zip || '',
                    city: profile.city || '',
                    country: profile.country || 'Deutschland',
                    company: profile.company || '', 
                    vatId: profile.vat_id || '',
                    currentPassword: '',
                    newPassword: '',
                    confirmNewPassword: ''
                });

                if (profile.stripe_account_id) {
                    setStripeConnected(true);
                }

                // Generate Referral Link based on Code or ID
                updateRefLinkDisplay(loadedCode);
            }

            // Fetch Commissions Stats
            const { data: commissions } = await supabase
                .from('commissions')
                .select('id, amount, status, created_at')
                .eq('partner_id', user.id);
            
            if (commissions) {
                setRawCommissions(commissions);
                recalcStats(commissions, dateRange);
            }
        }
    };
    loadProfile();

    // Check for Stripe Connect Redirect
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('stripe_connected') === 'true') {
        alert("Stripe Account erfolgreich verknüpft!");
        setActiveTab('settings');
        // Clear param
        window.history.replaceState({}, document.title, window.location.pathname);
        setStripeConnected(true);
    }
  }, []);

  // Recalculate stats when date range or raw data changes
  useEffect(() => {
      if (rawCommissions.length > 0) {
          recalcStats(rawCommissions, dateRange);
      }
  }, [dateRange, rawCommissions]);

  const recalcStats = (commissions: any[], range: {start: string, end: string}) => {
      const start = new Date(range.start);
      start.setHours(0,0,0,0);
      const end = new Date(range.end);
      end.setHours(23,59,59,999);

      // Filter by date range
      const filtered = commissions.filter(c => {
          const d = new Date(c.created_at);
          return d >= start && d <= end;
      });

      // Calc Totals
      // Pending earnings are TOTAL pending (not just filtered range, usually you want to withdraw all pending)
      // But for "Stats" display (Earnings in period), we use filtered.
      const earningsInPeriod = filtered.reduce((sum, c) => sum + Number(c.amount), 0);
      
      // Total Pending (for Payout Button)
      const totalPending = commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + Number(c.amount), 0);

      const conversions = filtered.length;
      
      setStats({
          clicks: conversions * 12, // Still mock logic as requested kept (user wants "real" numbers but we only have convs)
          conversions: conversions,
          earnings: totalPending, // Use total pending for the "Open" card as that's what is payable
          history: [] // Chart data would go here
      });

      // Generate Daily List
      const dailyMap = new Map();
      // Initialize days in range
      const loop = new Date(start);
      while(loop <= end) {
          const ds = loop.toISOString().split('T')[0];
          dailyMap.set(ds, { date: ds, conversions: 0, earnings: 0 });
          loop.setDate(loop.getDate() + 1);
      }
      
      // Fill data
      filtered.forEach(c => {
          const ds = new Date(c.created_at).toISOString().split('T')[0];
          if (dailyMap.has(ds)) {
              const d = dailyMap.get(ds);
              d.conversions++;
              d.earnings += Number(c.amount);
          }
      });
      
      const sortedDaily = Array.from(dailyMap.values()).sort((a,b) => b.date.localeCompare(a.date));
      setDailyStats(sortedDaily);
  };

  const handleDatePresetChange = (preset: string) => {
    setDatePreset(preset);
    const end = new Date();
    let start = new Date();
    
    if (preset === 'last28') {
        start.setDate(end.getDate() - 28);
    } else if (preset === 'lastMonth') {
        start.setDate(1); 
        start.setMonth(start.getMonth() - 1);
        const lastDayPrevMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0);
        end.setTime(lastDayPrevMonth.getTime());
    } else if (preset === 'thisYear') {
        start = new Date(new Date().getFullYear(), 0, 1);
    } else if (preset === 'custom') {
        return; 
    }

    setDateRange({
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
    });
  };

  const updateRefLinkDisplay = (code: string) => {
      const siteUrl = getEnv('VITE_SITE_URL') ?? window.location.origin;
      const cleanUrl = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;
      setRefLink(`${cleanUrl}?ref=${code}`);
  }

  const handleCodeChange = (val: string) => {
      setSettings(prev => ({...prev, referralCode: val}));
      updateRefLinkDisplay(val);
  };

  const areSettingsComplete = 
    settings.firstName.trim() !== '' &&
    settings.lastName.trim() !== '' &&
    settings.email.trim() !== '' &&
    settings.street.trim() !== '' &&
    settings.houseNumber.trim() !== '' &&
    settings.zip.trim() !== '' &&
    settings.city.trim() !== '' &&
    stripeConnected;

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

  const handlePayoutStripe = async () => {
      if (stats.earnings < 20) {
          alert("Auszahlung erst ab 20,00 € möglich.");
          return;
      }
      if (!stripeConnected) {
          alert("Bitte verbinde erst dein Stripe Konto in den Einstellungen.");
          setActiveTab('settings');
          return;
      }
      
      setIsPayoutLoading(true);
      try {
          await requestStripePayout();
          alert("Auszahlung erfolgreich! Das Geld ist auf dem Weg zu deinem Bankkonto.");
          setStats(prev => ({ ...prev, earnings: 0 })); // Reset pending earnings UI
      } catch (error: any) {
          alert("Fehler bei der Auszahlung: " + error.message);
      } finally {
          setIsPayoutLoading(false);
      }
  };
  
  const handleScrollToPayout = () => {
      setActiveTab('settings');
      setTimeout(() => document.getElementById('payout-method')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const validateReferralCode = (code: string) => {
      if (!code) return false;
      return /^[a-zA-Z0-9-_]+$/.test(code);
  }

  const handleSaveReferralCode = async (e: React.MouseEvent) => {
      e.preventDefault();
      if (!validateReferralCode(settings.referralCode)) {
          alert("Der Partner Code darf nur Buchstaben, Zahlen und Bindestriche enthalten.");
          return;
      }

      try {
          await updateAffiliateProfile(settings);
          alert("Partner Code erfolgreich gesichert!");
      } catch (error: any) {
          if (error.message && error.message.includes('unique_referral_code')) {
              alert("Dieser Code ist leider schon vergeben. Bitte wähle einen anderen.");
          } else {
              alert("Fehler beim Speichern: " + error.message);
          }
      }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (settings.newPassword && settings.newPassword !== settings.confirmNewPassword) {
      alert("Die neuen Passwörter stimmen nicht überein.");
      return;
    }

    if (settings.referralCode && !validateReferralCode(settings.referralCode)) {
        alert("Der Partner Code darf nur Buchstaben, Zahlen und Bindestriche enthalten.");
        return;
    }

    try {
        await updateAffiliateProfile(settings);
        alert("Daten erfolgreich gespeichert.");
        setSettings(prev => ({...prev, currentPassword: '', newPassword: '', confirmNewPassword: ''}));
    } catch (error: any) {
        if (error.message && error.message.includes('unique_referral_code')) {
            alert("Dieser Partner Code ist leider schon vergeben. Bitte wähle einen anderen.");
        } else {
            alert("Fehler beim Speichern: " + error.message);
        }
    }
  };

  const handleConnectStripe = async () => {
      try {
          await connectStripe();
      } catch (error: any) {
          alert("Fehler beim Verbinden mit Stripe: " + error.message);
      }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Tabs */}
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Partner Dashboard</h1>
            <p className="text-slate-500">
                Deine Provision: <span className="text-[#00305e] font-bold">{commissionRate}%</span> = <span className="text-[#00305e] font-bold">{earningPerSub} €</span> pro neuem Abo. Jeden Monat!
            </p>
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
          
           {/* Date Filter */}
           <div className="flex justify-end">
              <div className="bg-white p-2 rounded-lg border border-slate-200 flex items-center gap-2 shadow-sm">
                  <div className="border-r border-slate-200 pr-2 mr-2">
                      <select 
                        value={datePreset} 
                        onChange={(e) => handleDatePresetChange(e.target.value)}
                        className="bg-transparent text-sm outline-none font-medium text-slate-700 cursor-pointer"
                      >
                          <option value="last28">Letzte 28 Tage</option>
                          <option value="lastMonth">Letzter Monat</option>
                          <option value="thisYear">Dieses Jahr</option>
                          <option value="custom">Benutzerdefiniert</option>
                      </select>
                  </div>

                  <Calendar size={16} className="text-slate-500" />
                  <input 
                      type="date" 
                      value={dateRange.start}
                      onChange={e => { setDateRange({...dateRange, start: e.target.value}); setDatePreset('custom'); }}
                      className="text-sm outline-none bg-transparent cursor-pointer"
                  />
                  <span className="text-slate-400">-</span>
                  <input 
                      type="date" 
                      value={dateRange.end}
                      onChange={e => { setDateRange({...dateRange, end: e.target.value}); setDatePreset('custom'); }}
                      className="text-sm outline-none bg-transparent cursor-pointer"
                  />
              </div>
           </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Users size={24} /></div>
              <div>
                <p className="text-slate-500 text-sm">Klicks (Geschätzt)</p>
                <p className="text-2xl font-bold text-slate-900">{stats.clicks}</p>
                <p className="text-xs text-slate-400 mt-1">Basiert auf Conversions</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="bg-purple-50 p-3 rounded-xl text-purple-600"><TrendingUp size={24} /></div>
              <div>
                <p className="text-slate-500 text-sm">Conversions</p>
                <p className="text-2xl font-bold text-slate-900">{stats.conversions}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-green-50 p-3 rounded-xl text-green-600"><DollarSign size={24} /></div>
                <div>
                  <p className="text-slate-500 text-sm">Verdienst (Offen)</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.earnings.toFixed(2)} €</p>
                  <p className="text-[10px] text-slate-400">Auszahlung ab 20 Euro Guthaben</p>
                </div>
              </div>
              <div>
                {stripeConnected ? (
                    <Button 
                        onClick={handlePayoutStripe} 
                        size="sm" 
                        disabled={stats.earnings < 20 || isPayoutLoading}
                        className="w-full bg-slate-800 text-white hover:bg-slate-900"
                    >
                        <CreditCard size={16} /> 
                        {isPayoutLoading ? 'Verarbeite...' : 'Auszahlen via Stripe'}
                    </Button>
                ) : (
                    <Button 
                        onClick={handleScrollToPayout}
                        size="sm" 
                        variant="primary" 
                        className="w-full bg-[#635BFF] hover:bg-[#5851E3] text-white"
                    >
                        <CreditCard size={16} /> 
                        Auszahlungskonto verbinden
                    </Button>
                )}
                {(!areSettingsComplete || (stats.earnings >= 20 && !stripeConnected)) && (
                  <p className="text-xs text-red-500 mt-2 text-center font-medium">Bitte Auszahlungsdaten (Stripe) vervollständigen</p>
                )}
              </div>
            </div>
          </div>

          {/* Link Section */}
          <div className="bg-indigo-900 rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start justify-between gap-6 shadow-lg">
            <div className="w-full md:w-1/2">
              <h3 className="text-lg font-semibold mb-2">Dein Affiliate Link</h3>
              <p className="text-indigo-200 text-sm mb-4">Teile diesen Link auf Social Media, deiner Webseite oder in Newslettern.</p>
              <div className="flex bg-indigo-800/50 p-1 rounded-lg border border-indigo-700 mb-2">
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
              <div className="text-right">
                  <button onClick={() => setActiveTab('settings')} className="text-xs text-indigo-300 hover:text-white underline flex items-center gap-1 ml-auto">
                      ID ändern <ArrowRight size={10} />
                  </button>
              </div>
            </div>
            <div className="hidden md:block w-px h-24 bg-indigo-700/50 self-center"></div>
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

          {/* Daily Table */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Calendar size={18} /> Tägliche Statistik</h3>
             <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                     <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                         <tr>
                             <th className="px-4 py-3">Datum</th>
                             <th className="px-4 py-3">Conversions (Abos)</th>
                             <th className="px-4 py-3">Verdienst</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                         {dailyStats.length > 0 ? dailyStats.map(d => (
                             <tr key={d.date} className="hover:bg-slate-50">
                                 <td className="px-4 py-3 text-slate-700 font-medium">
                                     {new Date(d.date).toLocaleDateString('de-DE', { weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit' })}
                                 </td>
                                 <td className="px-4 py-3">
                                     {d.conversions > 0 ? (
                                         <span className="text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded">{d.conversions}</span>
                                     ) : <span className="text-slate-400">0</span>}
                                 </td>
                                 <td className="px-4 py-3 font-bold text-slate-900">
                                     {d.earnings.toFixed(2)} €
                                 </td>
                             </tr>
                         )) : (
                             <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400">Keine Daten für diesen Zeitraum.</td></tr>
                         )}
                     </tbody>
                 </table>
             </div>
          </div>
        </div>
      )}

      {/* TAB: SETTINGS & PAYOUT */}
      {activeTab === 'settings' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 md:p-8 border-b border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                 <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Settings size={20} /></div>
                 <h2 className="text-xl font-bold text-slate-900">Stammdaten & Auszahlung</h2>
              </div>
              <p className="text-slate-500 max-w-2xl">
                Diese Daten sind notwendig, um deine Provisionen steuerrechtlich korrekt auszuzahlen.
              </p>
            </div>

            <div className="p-6 md:p-8 space-y-8">
              
              {/* Personal Info Section */}
              <section>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <User size={16} /> Persönliche Daten
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Vorname <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={settings.firstName}
                      onChange={(e) => setSettings({...settings, firstName: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nachname <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={settings.lastName}
                      onChange={(e) => setSettings({...settings, lastName: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">E-Mail Adresse <span className="text-red-500">*</span></label>
                  <input 
                    type="email" 
                    required
                    value={settings.email}
                    onChange={(e) => setSettings({...settings, email: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                     <Globe size={16} /> Webseite / Kanal
                  </label>
                  <input 
                    type="text" 
                    value={settings.website}
                    onChange={(e) => setSettings({...settings, website: e.target.value})}
                    placeholder="z.B. https://instagram.com/mein_kanal"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
              </section>

              <hr className="border-slate-100" />

              {/* Partner Code Section */}
              <section className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                 <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Hash size={16} /> Partner Code (Ref-ID)
                 </h3>
                 <p className="text-sm text-indigo-700 mb-3">
                    Definiere hier deinen persönlichen Code, der am Ende deines Links steht. Mache ihn kurz und merkbar.
                 </p>
                 
                 <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row gap-2 items-start md:items-center">
                        <div className="flex items-center gap-2 w-full md:w-auto flex-1">
                            <span className="text-slate-500 text-sm font-mono whitespace-nowrap hidden md:block">
                                resortpassalarm.com?ref=
                            </span>
                            <input 
                                type="text" 
                                value={settings.referralCode}
                                onChange={(e) => handleCodeChange(e.target.value)}
                                className="w-full md:flex-1 px-4 py-2 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-900" 
                                placeholder="dein-name"
                            />
                        </div>
                        <Button onClick={handleSaveReferralCode} size="sm" variant="primary" className="bg-indigo-600 hover:bg-indigo-700 whitespace-nowrap">
                            <Check size={16} className="mr-1" /> Code sichern
                        </Button>
                    </div>
                    
                    <div className="flex items-start gap-3 bg-indigo-100/50 p-3 rounded-lg border border-indigo-200">
                        <AlertTriangle className="text-indigo-500 shrink-0 mt-0.5" size={16} />
                        <div className="text-xs text-indigo-800">
                            <strong>Wichtig:</strong> Wenn du deine ID änderst, funktionieren alte Links, die du bereits geteilt hast, <u>nicht mehr</u> für neue Besucher. Deine bisherigen Provisionen bleiben sicher erhalten.
                        </div>
                    </div>
                 </div>
                 
                 <p className="text-xs text-indigo-400 mt-2">Erlaubt: Buchstaben, Zahlen, Bindestrich. Keine Leerzeichen.</p>
              </section>

              <hr className="border-slate-100" />

              {/* Address Section */}
              <section>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Anschrift</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                   <div className="col-span-1 md:col-span-2 flex gap-4">
                     <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Straße <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          required
                          value={settings.street}
                          onChange={(e) => setSettings({...settings, street: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" 
                          placeholder="Musterstraße"
                        />
                     </div>
                     <div className="w-24">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nr. <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          required
                          value={settings.houseNumber}
                          onChange={(e) => setSettings({...settings, houseNumber: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" 
                          placeholder="123"
                        />
                     </div>
                   </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">PLZ <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        required
                        value={settings.zip}
                        onChange={(e) => setSettings({...settings, zip: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" 
                        placeholder="12345"
                      />
                   </div>
                   <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Ort <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        required
                        value={settings.city}
                        onChange={(e) => setSettings({...settings, city: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" 
                        placeholder="Musterstadt"
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Land <span className="text-red-500">*</span></label>
                      <select 
                        value={settings.country}
                        onChange={(e) => setSettings({...settings, country: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      >
                        <option>Deutschland</option>
                        <option>Österreich</option>
                        <option>Schweiz</option>
                      </select>
                   </div>
                </div>
              </section>

              <hr className="border-slate-100" />

              {/* Commercial Section */}
              <section>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Gewerbliche Angaben <span className="text-slate-400 font-normal normal-case">(Optional)</span></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Firma / Unternehmensname</label>
                    <input 
                      type="text" 
                      value={settings.company}
                      onChange={(e) => setSettings({...settings, company: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" 
                      placeholder=""
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">USt-ID (VAT ID)</label>
                    <input 
                      type="text" 
                      value={settings.vatId}
                      onChange={(e) => setSettings({...settings, vatId: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" 
                      placeholder="DE123456789"
                    />
                  </div>
                </div>
              </section>

              <hr className="border-slate-100" />

              {/* Payout Section */}
              <section id="payout-method">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Auszahlungsmethode</h3>
                
                <div className="grid grid-cols-1 gap-6">
                    {/* Stripe Option */}
                    <div className={`rounded-xl p-6 border ${stripeConnected ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                    <CreditCard size={18} className="text-slate-700" /> Stripe Connect (Erforderlich)
                                </h4>
                                <p className="text-sm text-slate-500 mt-1">
                                    Automatische Auszahlung direkt auf dein Bankkonto.
                                </p>
                            </div>
                            {stripeConnected ? (
                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-bold flex items-center gap-1">
                                    <Check size={12} /> Verbunden
                                </span>
                            ) : (
                                <span className="bg-slate-200 text-slate-600 text-xs px-2 py-1 rounded">Nicht verbunden</span>
                            )}
                        </div>
                        
                        {!stripeConnected ? (
                            <>
                                <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-100 flex items-start gap-2">
                                    <Info className="text-blue-500 mt-0.5 shrink-0" size={16} />
                                    <p className="text-sm text-blue-800">
                                        Wir nutzen Stripe Connect für sichere und schnelle Auszahlungen. Bitte verknüpfe dein Bankkonto, um Provisionen zu erhalten.
                                    </p>
                                </div>
                                <Button 
                                    type="button" 
                                    onClick={handleConnectStripe}
                                    className="bg-[#635BFF] hover:bg-[#5851E3] text-white w-full sm:w-auto"
                                >
                                    Mit Stripe verbinden
                                </Button>
                            </>
                        ) : (
                            <div className="text-sm text-green-700">
                                Dein Konto ist erfolgreich verknüpft. Du kannst Auszahlungen im Dashboard anfordern.
                            </div>
                        )}
                    </div>
                </div>
              </section>

              <hr className="border-slate-100" />

              {/* Security Section */}
              <section>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                   <Lock size={16} /> Sicherheit
                </h3>
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                   <p className="text-sm text-slate-500 mb-4">
                     Hier kannst du dein Passwort ändern. Lasse die Felder leer, wenn du es nicht ändern möchtest.
                   </p>
                   <div className="space-y-4 max-w-md">
                      <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Aktuelles Passwort</label>
                         <input 
                           type="password" 
                           value={settings.currentPassword}
                           onChange={(e) => setSettings({...settings, currentPassword: e.target.value})}
                           className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" 
                         />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Neues Passwort</label>
                         <input 
                           type="password" 
                           value={settings.newPassword}
                           onChange={(e) => setSettings({...settings, newPassword: e.target.value})}
                           className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" 
                         />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Neues Passwort wiederholen</label>
                         <input 
                           type="password" 
                           value={settings.confirmNewPassword}
                           onChange={(e) => setSettings({...settings, confirmNewPassword: e.target.value})}
                           className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" 
                         />
                      </div>
                   </div>
                </div>
              </section>

              <div className="flex justify-end pt-4">
                <Button type="submit" variant="primary" size="lg" className="bg-[#00305e] hover:bg-[#002040]">
                  <Save size={18} />
                  Einstellungen speichern
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
