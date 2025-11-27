import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Copy, TrendingUp, Users, DollarSign, Sparkles, LayoutDashboard, Settings, CreditCard, Save, AlertCircle, Lock, User, Globe, Hash, Check } from 'lucide-react';
import { AffiliateStats } from '../types';
import { Button } from '../components/Button';
import { generateMarketingCopy } from '../services/geminiService';
import { supabase, getEnv } from '../lib/supabase';
import { updateAffiliateProfile } from '../services/backendService';

// Mock Stats (Revenue history would come from commissions table in real DB)
const INITIAL_STATS: AffiliateStats = {
  clicks: 0,
  conversions: 0,
  earnings: 0.00,
  history: []
};

interface AffiliateDashboardProps {
  commissionRate: number;
}

export const AffiliateDashboard: React.FC<AffiliateDashboardProps> = ({ commissionRate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');
  const [stats, setStats] = useState<AffiliateStats>(INITIAL_STATS);
  const [refLink, setRefLink] = useState("Lade...");
  const [aiText, setAiText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [platform, setPlatform] = useState<'twitter' | 'email' | 'instagram'>('twitter');

  // Settings Form State
  const [settings, setSettings] = useState({
    firstName: '',
    lastName: '',
    email: '',
    website: '', // New field
    referralCode: '', // New field
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
                    company: '', // Add columns if needed in DB
                    vatId: '',
                    paypalEmail: profile.paypal_email || '',
                    currentPassword: '',
                    newPassword: '',
                    confirmNewPassword: ''
                });

                // Generate Referral Link based on Code or ID
                updateRefLinkDisplay(loadedCode);
            }

            // Fetch Commissions Stats
            const { data: commissions } = await supabase
                .from('commissions')
                .select('amount, status')
                .eq('partner_id', user.id);
            
            if (commissions) {
                const totalEarnings = commissions.reduce((sum, c) => sum + Number(c.amount), 0);
                const conversionCount = commissions.length;
                setStats(prev => ({
                    ...prev,
                    conversions: conversionCount,
                    earnings: totalEarnings,
                    clicks: conversionCount * 12 // Fake clicks based on conversions for demo
                }));
            }
        }
    };
    loadProfile();
  }, []);

  const updateRefLinkDisplay = (code: string) => {
      const siteUrl = getEnv('VITE_SITE_URL') ?? window.location.origin;
      // Remove trailing slash if present
      const cleanUrl = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;
      setRefLink(`${cleanUrl}?ref=${code}`);
  }

  // Handle immediate visual update when typing
  const handleCodeChange = (val: string) => {
      setSettings(prev => ({...prev, referralCode: val}));
      updateRefLinkDisplay(val);
  };


  // Check if mandatory fields are filled
  const areSettingsComplete = 
    settings.firstName.trim() !== '' &&
    settings.lastName.trim() !== '' &&
    settings.email.trim() !== '' &&
    settings.street.trim() !== '' &&
    settings.houseNumber.trim() !== '' &&
    settings.zip.trim() !== '' &&
    settings.city.trim() !== '' &&
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

  const handlePayout = () => {
    // Double check logic, though button should be disabled
    if (stats.earnings < 20) {
      alert("Auszahlung erst ab 20,00 € möglich.");
      return;
    }
    if (!areSettingsComplete) {
      alert("Bitte vervollständige deine Stammdaten in den Einstellungen.");
      setActiveTab('settings');
      return;
    }
    alert("Auszahlung angefordert! Das Geld ist in 1-3 Werktagen auf deinem PayPal Konto.");
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
          // Update only profile data relevant to saving
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
        // Clear password fields after save
        setSettings(prev => ({...prev, currentPassword: '', newPassword: '', confirmNewPassword: ''}));
    } catch (error: any) {
        if (error.message && error.message.includes('unique_referral_code')) {
            alert("Dieser Partner Code ist leider schon vergeben. Bitte wähle einen anderen.");
        } else {
            alert("Fehler beim Speichern: " + error.message);
        }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Tabs */}
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Partner Dashboard</h1>
            <p className="text-slate-500">Verdiene {commissionRate}% Provision für jeden vermittelten ResortPass-Jäger.</p>
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
                <p className="text-slate-500 text-sm">Klicks (Est.)</p>
                <p className="text-2xl font-bold text-slate-900">{stats.clicks}</p>
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
                </div>
              </div>
              <div>
                <Button 
                  onClick={handlePayout} 
                  size="sm" 
                  variant="outline" 
                  className="w-full text-green-700 border-green-200 hover:bg-green-50"
                  disabled={stats.earnings < 20 || !areSettingsComplete}
                >
                  <CreditCard size={16} /> Auszahlen
                </Button>
                {!areSettingsComplete && (
                  <p className="text-xs text-red-500 mt-2 text-center font-medium">Pflichtangaben unvollständig</p>
                )}
              </div>
            </div>
          </div>

          {/* Link Section */}
          <div className="bg-indigo-900 rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
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

          {/* Chart Placeholder */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[300px] flex items-center justify-center">
            <p className="text-slate-400">Diagramm wird angezeigt, sobald genügend historische Daten vorhanden sind.</p>
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

              {/* Partner Code Section (New) */}
              <section className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                 <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Hash size={16} /> Partner Code (Ref-ID)
                 </h3>
                 <p className="text-sm text-indigo-700 mb-3">
                    Definiere hier deinen persönlichen Code, der am Ende deines Links steht. Mache ihn kurz und merkbar.
                 </p>
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
              <section>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Auszahlungsmethode</h3>
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                   <div className="flex flex-col md:flex-row gap-6 md:items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-bold text-blue-900 mb-2">PayPal E-Mail Adresse <span className="text-red-500">*</span></label>
                        <input 
                          type="email" 
                          required
                          value={settings.paypalEmail}
                          onChange={(e) => setSettings({...settings, paypalEmail: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none" 
                          placeholder="deine-email@paypal.com"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-blue-700 text-sm bg-blue-100/50 px-4 py-2 rounded-lg h-fit mb-1">
                        <AlertCircle size={16} />
                        Auszahlung kann manuell angefordert werden, sobald das Guthaben 20,00 € erreicht.
                      </div>
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