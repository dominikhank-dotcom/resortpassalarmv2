import React, { useState, useEffect, useRef } from 'react';
import { Bell, RefreshCw, CheckCircle, ExternalLink, Settings, Mail, MessageSquare, Shield, Send, Ticket, XCircle, Pencil, Save, X, AlertOctagon, CreditCard, AlertTriangle, User, History, FileText, Gift, RotateCcw } from 'lucide-react';
import { MonitorStatus, NotificationConfig } from '../types';
import { Button } from '../components/Button';
import { Footer } from '../components/Footer';
import { sendTestAlarm, createCheckoutSession, getSystemSettings, createPortalSession, syncSubscription, manageSubscription } from '../services/backendService';
import { supabase } from '../lib/supabase';

interface LogEntry {
  id: string;
  date: string;
  type: 'EMAIL' | 'SMS';
  message: string;
}

type SubscriptionStatus = 'NONE' | 'PAID' | 'FREE';

interface UserDashboardProps {
  navigate: (page: string) => void;
  productUrls: { gold: string, silver: string };
  prices: { new: number, existing: number };
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ navigate, productUrls, prices }) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>('NONE');
  const [subscriptionDetails, setSubscriptionDetails] = useState<{ 
      endDate: string | null, 
      price: number | null,
      isCanceled: boolean 
  }>({ endDate: null, price: null, isCanceled: false });
  
  const [isChecking, setIsChecking] = useState<string | null>(null); 
  const [isSendingAlarm, setIsSendingAlarm] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [testAlarmCount, setTestAlarmCount] = useState(0); // Track usage

  const [monitorGold, setMonitorGold] = useState<MonitorStatus>({
    isActive: true, lastChecked: "Lade...", isAvailable: false, url: productUrls.gold
  });
  const [monitorSilver, setMonitorSilver] = useState<MonitorStatus>({
    isActive: true, lastChecked: "Lade...", isAvailable: false, url: productUrls.silver
  });
  
  // New States for Preferences
  const [prefs, setPrefs] = useState({ gold: true, silver: true });
  
  useEffect(() => {
    setMonitorGold(prev => ({...prev, url: productUrls.gold}));
    setMonitorSilver(prev => ({...prev, url: productUrls.silver}));
  }, [productUrls]);

  const [notifications, setNotifications] = useState<NotificationConfig>({ email: "", sms: "", emailEnabled: true, smsEnabled: true });
  const [editMode, setEditMode] = useState({ email: false, sms: false });
  const [tempData, setTempData] = useState({ email: "", sms: "" });
  const [errors, setErrors] = useState({ email: '', sms: '' });
  const [personalData, setPersonalData] = useState({ firstName: '', lastName: '', street: '', houseNumber: '', zip: '', city: '', country: 'Deutschland', email: "" });
  const [alarmHistory, setAlarmHistory] = useState<LogEntry[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Prevent double firing of welcome mail in React lifecycle (per mount)
  const welcomeTriggeredRef = useRef(false);

  const hasActiveSubscription = subscriptionStatus !== 'NONE';

  const fetchProfileAndSub = async (retryCount = 0) => {
    const { data: { user } } = await supabase.auth.getUser();
    console.log("Dashboard: Auth User check:", user ? "Found" : "Not Found");

    if (user) {
        // --- FETCH PROFILE ---
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        console.log(`Dashboard: Profile fetch attempt ${retryCount + 1}/10. Result:`, profile ? "Found" : "Null");

        // RETRY LOGIC: Increased to 10 attempts for slow DB triggers
        if (!profile && retryCount < 10) {
            console.warn(`Dashboard: Profile missing, retrying in 1s (${retryCount + 1}/10)...`);
            setTimeout(() => fetchProfileAndSub(retryCount + 1), 1000);
            return;
        }

        if (profile) {
            setUserProfile(profile);
            setTestAlarmCount(profile.test_alarm_count || 0); // Load count
            setPersonalData({
                firstName: profile.first_name || '', 
                lastName: profile.last_name || '', 
                street: profile.street || '', 
                houseNumber: profile.house_number || '', 
                zip: profile.zip || '', 
                city: profile.city || '', 
                country: profile.country || 'Deutschland', 
                email: profile.email || user.email || ''
            });
            setNotifications({
                email: profile.notification_email || profile.email || user.email || '', sms: profile.phone || "", emailEnabled: profile.email_enabled !== false, smsEnabled: profile.sms_enabled === true
            });
            setTempData({ email: profile.notification_email || profile.email || user.email || '', sms: profile.phone || "" });
            
            // Set Gold/Silver Prefs
            setPrefs({
                gold: profile.notify_gold !== false, // default true if null
                silver: profile.notify_silver !== false
            });

            // --- WELCOME MAIL TRIGGER (Robust) ---
            // Removed frontend check for 'welcome_mail_sent' to prevent stale data issues.
            // We blindly fire the trigger once per mount, and let the backend handle the atomic lock.
            if (!welcomeTriggeredRef.current) {
                welcomeTriggeredRef.current = true;
                
                console.log("Dashboard: Triggering Welcome Mail API for:", user.email);
                
                fetch('/api/trigger-welcome', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ 
                        userId: user.id, 
                        email: user.email,
                        // Use profile first name which we just fetched, fallback to metadata
                        firstName: profile.first_name || user.user_metadata?.first_name 
                    })
                }).then(async res => {
                    const json = await res.json();
                    console.log("Dashboard: Welcome API Result:", json);
                }).catch(err => {
                    console.error("Dashboard: Welcome API Failed:", err);
                    // Do not reset ref, to avoid spamming on network error loop
                });
            }
        }

        const { data: logs } = await supabase.from('notification_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10);
        if (logs) {
            setAlarmHistory(logs.map(log => ({ id: log.id, date: new Date(log.created_at).toLocaleString(), type: log.type, message: log.message })));
        }

        const { data: sub } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .limit(1)
            .maybeSingle();
        
        if (sub) {
            if (sub.plan_type === 'premium') setSubscriptionStatus('PAID');
            else if (sub.plan_type === 'Manuell (Gratis)') setSubscriptionStatus('FREE');
            else setSubscriptionStatus('PAID');

            setSubscriptionDetails({
                endDate: sub.current_period_end,
                price: sub.subscription_price || prices.existing,
                isCanceled: sub.cancel_at_period_end === true
            });
        } else {
            setSubscriptionStatus('NONE');
        }
    }
  };

  useEffect(() => { fetchProfileAndSub(); }, [prices.existing]);

  const fetchSystemStatus = async () => {
      try {
          const settings = await getSystemSettings();
          if (settings) {
              const lastCheckedTime = settings.last_checked ? new Date(settings.last_checked).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Warte auf Daten...";
              setMonitorGold(prev => ({...prev, isAvailable: settings.status_gold === 'available', lastChecked: lastCheckedTime}));
              setMonitorSilver(prev => ({...prev, isAvailable: settings.status_silver === 'available', lastChecked: lastCheckedTime}));
          }
      } catch (e) { console.error("Failed to sync status", e); }
  };

  useEffect(() => {
    fetchSystemStatus(); 
    const interval = setInterval(fetchSystemStatus, 60000); 
    
    // Check for payment success or portal return
    const query = new URLSearchParams(window.location.search);
    if (query.get('payment_success') || query.get('portal_return')) {
      setIsSyncing(true);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      syncSubscription().then(() => {
          fetchProfileAndSub();
          setIsSyncing(false);
          if (query.get('payment_success')) {
              setSubscriptionStatus('PAID');
              alert("Zahlung erfolgreich! Dein Abo ist jetzt aktiv.");
          } else {
              // Just a sync without alert on portal return (cancellation etc)
          }
      }).catch(() => { setIsSyncing(false); });
    }
    
    return () => clearInterval(interval);
  }, []);

  const updateProfileColumn = async (column: string, value: any) => { const { data: { user } } = await supabase.auth.getUser(); if (!user) return; await supabase.from('profiles').update({ [column]: value }).eq('id', user.id); };
  
  const handleToggleEmail = (enabled: boolean) => { setNotifications(prev => ({...prev, emailEnabled: enabled})); updateProfileColumn('email_enabled', enabled); };
  const handleToggleSms = (enabled: boolean) => { setNotifications(prev => ({...prev, smsEnabled: enabled})); updateProfileColumn('sms_enabled', enabled); };
  
  const handleTogglePref = (type: 'gold' | 'silver', enabled: boolean) => {
      setPrefs(prev => ({ ...prev, [type]: enabled }));
      updateProfileColumn(type === 'gold' ? 'notify_gold' : 'notify_silver', enabled);
  }

  const handleSavePersonalData = async (e: React.FormEvent) => { e.preventDefault(); const { data: { user } } = await supabase.auth.getUser(); if (user) { const { error } = await supabase.from('profiles').update({ street: personalData.street, house_number: personalData.houseNumber, zip: personalData.zip, city: personalData.city, country: personalData.country, email: personalData.email }).eq('id', user.id); if (error) { alert("Fehler: " + error.message); } else { alert("Daten gespeichert."); } } };
  const handleManualCheck = (type: 'gold' | 'silver') => { setIsChecking(type); fetchSystemStatus().then(() => { setTimeout(() => setIsChecking(null), 800); }); };
  const handleManualSync = async () => { setIsSyncing(true); try { const result = await syncSubscription(); if (result.found) { await fetchProfileAndSub(); alert("Abo synchronisiert!"); } else { alert("Kein Abo gefunden."); } } catch (e: any) { alert("Fehler: " + e.message); } finally { setIsSyncing(false); } }
  
  const handleResumeSubscription = async () => {
      if (!confirm("Möchtest du deine Kündigung wirklich zurücknehmen und das Abo fortsetzen?")) return;
      setIsSyncing(true);
      try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          
          await manageSubscription(user.id, 'resume_sub');
          alert("Kündigung erfolgreich zurückgenommen! Dein Abo läuft weiter.");
          await fetchProfileAndSub();
      } catch (e: any) {
          alert("Fehler: " + e.message);
      } finally {
          setIsSyncing(false);
      }
  };

  const startEditEmail = () => { setTempData(prev => ({ ...prev, email: notifications.email })); setEditMode(prev => ({ ...prev, email: true })); setErrors(prev => ({ ...prev, email: '' })); };
  const saveEmail = async () => { const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; if (!emailRegex.test(tempData.email)) { setErrors(prev => ({ ...prev, email: "Ungültige E-Mail." })); return; } setNotifications(prev => ({ ...prev, email: tempData.email })); await updateProfileColumn('notification_email', tempData.email); setEditMode(prev => ({ ...prev, email: false })); setErrors(prev => ({ ...prev, email: '' })); };
  const cancelEditEmail = () => { setEditMode(prev => ({ ...prev, email: false })); setErrors(prev => ({ ...prev, email: '' })); };
  const startEditSms = () => { setTempData(prev => ({ ...prev, sms: notifications.sms })); setEditMode(prev => ({ ...prev, sms: true })); setErrors(prev => ({ ...prev, sms: '' })); };
  
  const saveSms = async () => { 
      // STRICT FORMAT CHECK: +4917012345678 (E.164 format)
      const phoneRegex = /^\+[1-9]\d{7,14}$/;
      if (!phoneRegex.test(tempData.sms)) {
           setErrors(prev => ({ ...prev, sms: "Ungültiges Format! Muss mit + (Ländercode) beginnen und nur Ziffern enthalten." })); 
           return; 
      } 
      setNotifications(prev => ({ ...prev, sms: tempData.sms })); 
      await updateProfileColumn('phone', tempData.sms); 
      setEditMode(prev => ({ ...prev, sms: false })); 
      setErrors(prev => ({ ...prev, sms: '' })); 
  };
  
  const cancelEditSms = () => { setEditMode(prev => ({ ...prev, sms: false })); setErrors(prev => ({ ...prev, sms: '' })); };

  const handleTestAlarm = async () => { 
      const activeMethods = []; 
      if (notifications.emailEnabled) activeMethods.push("E-Mail"); 
      if (notifications.smsEnabled) activeMethods.push("SMS"); 
      if (activeMethods.length === 0) { alert("Bitte Benachrichtigungsmethode aktivieren."); return; } 
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setIsSendingAlarm(true); 
      try { 
          const result = await sendTestAlarm(user.id, notifications.email, notifications.sms, notifications.emailEnabled, notifications.smsEnabled); 
          if (result.errors && result.errors.length > 0) {
              if (result.email === 'sent' || result.sms === 'sent') {
                  const msg = `Teil-Erfolg: ${result.email ? 'Email OK' : ''} ${result.sms ? 'SMS OK' : ''}`;
                  await supabase.from('notification_logs').insert({ user_id: user.id, type: 'EMAIL', message: msg });
                  fetchProfileAndSub();
              }
              alert(`Test teilweise gesendet oder blockiert.\n\nMeldung:\n${result.errors.join('\n')}`);
          } else {
              const msg = `Test erfolgreich: ${activeMethods.join(', ')}`;
              await supabase.from('notification_logs').insert({ user_id: user.id, type: 'EMAIL', message: msg });
              await fetchProfileAndSub();
              alert("Test erfolgreich verschickt!"); 
          }
      } catch (error: any) { alert("Fehler: " + error.message); } finally { setIsSendingAlarm(false); } 
  };

  const handleSubscribe = async () => { 
      const localReferral = localStorage.getItem('resortpass_referral');
      const dbReferral = userProfile?.referred_by;
      const referralCode = localReferral || dbReferral;
      await createCheckoutSession(personalData.email, referralCode); 
  };
  
  const handleManageBilling = async () => { await createPortalSession(); }

  const isDuplicateTest = () => {
      if (!userProfile?.last_test_config) return false;
      const last = userProfile.last_test_config;
      const currentEmail = notifications.email;
      const currentPhone = notifications.sms;
      
      let emailDuplicate = false;
      let smsDuplicate = false;
      if (notifications.emailEnabled && last.email === currentEmail) emailDuplicate = true;
      if (notifications.smsEnabled && last.phone === currentPhone) smsDuplicate = true;
      
      if (notifications.emailEnabled && notifications.smsEnabled) return emailDuplicate && smsDuplicate;
      if (notifications.emailEnabled) return emailDuplicate;
      if (notifications.smsEnabled) return smsDuplicate;
      return false;
  };
  
  const testLimitReached = testAlarmCount >= 5;
  const testButtonDisabled = !hasActiveSubscription || isDuplicateTest() || testLimitReached;
  
  let testButtonText = "Test-Alarm senden";
  if (!hasActiveSubscription) testButtonText = "Nur mit aktivem Abo";
  else if (testLimitReached) testButtonText = "Limit erreicht (5/5)";
  else if (isDuplicateTest()) testButtonText = "Bereits getestet";
  else if (isSendingAlarm) testButtonText = "Sende...";

  const StatusCard = ({ title, type, monitor, enabled, onToggle }: { title: string, type: 'gold' | 'silver', monitor: MonitorStatus, enabled: boolean, onToggle: (val: boolean) => void }) => { 
      const isLoading = isChecking === type; 
      return (
        <div className={`bg-white rounded-2xl shadow-sm border ${enabled ? 'border-slate-200' : 'border-slate-100 opacity-90'} overflow-hidden flex flex-col h-full`}>
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-2">
                    <Ticket className={type === 'gold' ? 'text-yellow-500' : 'text-slate-400'} fill="currentColor" size={20} />
                    <h2 className="font-bold text-slate-900">{title}</h2>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Alarm an/aus:</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={enabled} onChange={(e) => onToggle(e.target.checked)} />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                </div>
            </div>
            <div className={`flex-1 p-6 flex flex-col items-center justify-center text-center transition-all duration-500 ${!enabled ? 'bg-slate-50' : monitor.isAvailable ? 'bg-green-50/50' : 'bg-white'}`}>
                {!enabled ? (
                    <div className="text-slate-400 flex flex-col items-center animate-in fade-in">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2"><Bell size={20} /></div>
                        <p className="text-sm font-medium">Alarm deaktiviert</p>
                    </div>
                ) : monitor.isAvailable ? (
                    <div className="space-y-4 animate-in fade-in zoom-in w-full">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600"><CheckCircle size={32} /></div>
                        <div><h3 className="text-xl font-bold text-green-800">VERFÜGBAR!</h3><p className="text-green-700 text-sm">Schnell sein!</p></div>
                    </div>
                ) : (
                    <div className="space-y-4 w-full">
                        <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                            <div className="absolute inset-0 bg-red-100 rounded-full opacity-50 animate-pulse"></div>
                            <div className="relative bg-red-50 w-full h-full rounded-full flex items-center justify-center text-red-500 z-10 border border-red-100"><XCircle size={32} /></div>
                        </div>
                        <div><h3 className="text-lg font-bold text-red-600">Ausverkauft</h3><p className="text-slate-500 text-sm">Momentan keine Kontingente.</p></div>
                    </div>
                )}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col items-center">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mb-3"><RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />{isLoading ? "Prüfe..." : monitor.lastChecked}</div>
                <Button onClick={() => handleManualCheck(type)} variant="secondary" size="sm" className="w-full justify-center bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 mb-3" disabled={isLoading}><RefreshCw size={14} className={isLoading ? "animate-spin mr-2" : "mr-2"} />{isLoading ? "Wird geprüft..." : "Manuell Prüfen"}</Button>
                <a href={monitor.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-slate-400 hover:text-[#00305e] hover:underline transition-colors"><ExternalLink size={12} />Zum Europa-Park Shop</a>
            </div>
        </div>
      ); 
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-grow w-full">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div><h1 className="text-2xl font-bold text-slate-900">Mein Überwachungs-Dashboard</h1><p className="text-slate-500">{hasActiveSubscription ? 'ResortPass Alarm ist aktiv. Lehn dich zurück.' : 'Dein Abo ist inaktiv. Aktiviere es, um Alarme zu erhalten.'}</p></div>
          {hasActiveSubscription ? (<div className="flex items-center gap-2 bg-[#00305e] text-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium animate-in fade-in"><Shield size={16} className="text-[#ffcc00]" />Premium Schutz Aktiv</div>) : (<div className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-md text-sm font-bold animate-pulse"><AlertOctagon size={18} />WARNUNG: SCHUTZ INAKTIV</div>)}
        </div>

        {hasActiveSubscription && !prefs.gold && !prefs.silver && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3 animate-pulse">
                <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
                <div><h3 className="font-bold text-red-800">Keine Überwachung aktiv!</h3><p className="text-sm text-red-700">Du hast sowohl Gold als auch Silver Alarme deaktiviert.</p></div>
            </div>
        )}

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${!hasActiveSubscription ? 'opacity-50 grayscale pointer-events-none select-none' : ''}`}>
          <StatusCard title="ResortPass Silver" type="silver" monitor={monitorSilver} enabled={prefs.silver} onToggle={(val) => handleTogglePref('silver', val)} />
          <StatusCard title="ResortPass Gold" type="gold" monitor={monitorGold} enabled={prefs.gold} onToggle={(val) => handleTogglePref('gold', val)} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
            <div className="p-6 border-b border-slate-100"><div className="flex items-center gap-3"><div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Bell size={20} /></div><h3 className="font-semibold text-slate-900">Benachrichtigungen</h3></div></div>
            {(!notifications.emailEnabled || !notifications.smsEnabled) && (<div className="bg-amber-50 border-b border-amber-100 p-3 flex items-start gap-3"><AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={16} /><p className="text-xs text-amber-800">Empfehlung: Aktiviere beide Kanäle!</p></div>)}
            <div className="p-6 space-y-4 flex-1">
                <div className="flex flex-col p-4 border border-slate-100 rounded-xl hover:border-indigo-100 transition-colors">
                    <div className="flex items-center justify-between w-full mb-2">
                        <div className="flex items-center gap-3"><Mail className={notifications.emailEnabled ? "text-blue-600" : "text-slate-300"} size={20} /><p className="font-medium text-slate-900">Email Alarm</p></div>
                        <div className="flex items-center gap-3"><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" checked={notifications.emailEnabled} onChange={(e) => handleToggleEmail(e.target.checked)} /><div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div></label>{!editMode.email ? ( <button onClick={startEditEmail} className="text-slate-400 hover:text-blue-600 p-1"><Pencil size={16} /></button> ) : ( <div className="flex gap-1"><button onClick={saveEmail} className="text-green-600 hover:text-green-700 p-1"><Save size={16} /></button><button onClick={cancelEditEmail} className="text-red-400 hover:text-red-600 p-1"><X size={16} /></button></div> )}</div>
                    </div>
                    <div className="ml-8">{editMode.email ? ( <div className="space-y-1"><input type="email" value={tempData.email} onChange={(e) => setTempData({...tempData, email: e.target.value})} className="w-full text-sm p-2 border rounded" /></div> ) : ( <p className="text-sm text-slate-500 truncate">{notifications.email || 'Nicht konfiguriert'}</p> )}</div>
                </div>
                <div className="flex flex-col p-4 border border-slate-100 rounded-xl hover:border-indigo-100 transition-colors">
                    <div className="flex items-center justify-between w-full mb-2">
                        <div className="flex items-center gap-3"><MessageSquare className={notifications.smsEnabled ? "text-blue-600" : "text-slate-300"} size={20} /><p className="font-medium text-slate-900">SMS Alarm</p></div>
                        <div className="flex items-center gap-3"><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" checked={notifications.smsEnabled} onChange={(e) => handleToggleSms(e.target.checked)} /><div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div></label>{!editMode.sms ? ( <button onClick={startEditSms} className="text-slate-400 hover:text-blue-600 p-1"><Pencil size={16} /></button> ) : ( <div className="flex gap-1"><button onClick={saveSms} className="text-green-600 hover:text-green-700 p-1"><Save size={16} /></button><button onClick={cancelEditSms} className="text-red-400 hover:text-red-600 p-1"><X size={16} /></button></div> )}</div>
                    </div>
                    <div className="ml-8">{editMode.sms ? ( <div className="space-y-2"><input type="tel" value={tempData.sms} onChange={(e) => setTempData({...tempData, sms: e.target.value})} className="w-full text-sm p-2 border rounded" placeholder="+4917012345678" /><p className="text-xs text-slate-500">Format: +49... (Ländercode + Nummer ohne 0)</p>{errors.sms && <p className="text-xs text-red-500">{errors.sms}</p>}</div> ) : ( <p className="text-sm text-slate-500 truncate">{notifications.sms || 'Nicht konfiguriert'}</p> )}</div>
                </div>
                
                <div className="pt-4 mt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-2"><p className="text-xs text-slate-500">Testalarm prüfen!</p><span className="text-xs text-slate-400">{testAlarmCount} / 5 Tests genutzt</span></div>
                    <Button onClick={handleTestAlarm} disabled={testButtonDisabled || isSendingAlarm} variant="secondary" size="sm" className={`w-full justify-center ${testButtonDisabled ? 'opacity-50 cursor-not-allowed text-slate-500 border-slate-200 bg-slate-50' : ''}`}>{testButtonText}</Button>
                    {isDuplicateTest() && !testLimitReached && (<p className="text-xs text-amber-600 mt-2 text-center">Hinweis: Ändere deine E-Mail oder Handynummer, um einen erneuten Test durchzuführen.</p>)}
                    {testLimitReached && (<p className="text-xs text-red-500 mt-2 text-center">Du hast das Limit für Test-Alarme erreicht.</p>)}
                </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
            <div className="p-6 flex items-center gap-3 mb-0 border-b border-slate-100"><div className="bg-purple-50 p-2 rounded-lg text-purple-600"><Settings size={20} /></div><h3 className="font-semibold text-slate-900">Dein Abo</h3></div>
            <div className="p-6 flex-1 flex flex-col">
              {hasActiveSubscription ? (
                <div className="flex-1">
                  {subscriptionStatus === 'FREE' ? (
                     <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 mb-4"><div className="flex justify-between items-center mb-2"><span className="text-purple-700 font-medium flex items-center gap-2"><Gift size={16} /> Geschenk / Admin</span><span className="bg-purple-200 text-purple-800 text-xs px-2 py-1 rounded font-bold uppercase">Aktiv</span></div><div className="text-xl font-bold text-slate-900 mb-1">Kostenlos</div></div>
                  ) : (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-600 font-medium flex items-center gap-2"><CreditCard size={14} /> Stripe Checkout</span>
                            {/* UPDATED BADGE LOGIC */}
                            {subscriptionDetails.isCanceled ? (
                                <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded font-bold uppercase">Gekündigt</span>
                            ) : (
                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-bold uppercase">Aktiv</span>
                            )}
                        </div>
                        <div className="text-3xl font-bold text-slate-900 mb-1">{subscriptionDetails.price ? subscriptionDetails.price.toFixed(2).replace('.', ',') : prices.existing.toFixed(2).replace('.', ',')} € <span className="text-sm font-normal text-slate-500">/ Monat</span></div>
                        {subscriptionDetails.isCanceled ? (
                            <p className="text-sm text-amber-600 font-bold">
                                Gekündigt. Aktiv bis: {subscriptionDetails.endDate ? new Date(subscriptionDetails.endDate).toLocaleDateString('de-DE') : 'Lade...'}
                            </p>
                        ) : (
                            <p className="text-sm text-slate-500">
                                Nächste Abrechnung: {subscriptionDetails.endDate ? new Date(subscriptionDetails.endDate).toLocaleDateString('de-DE') : 'Lade...'}
                            </p>
                        )}
                    </div>
                  )}
                  <div className="space-y-2 mt-auto">
                    {subscriptionStatus === 'PAID' && (
                        <>
                            <Button onClick={handleManageBilling} variant="outline" size="sm" className="w-full justify-between group">Zahlungsmethode bearbeiten<ExternalLink size={14} className="text-slate-400 group-hover:text-indigo-600" /></Button>
                            <Button onClick={handleManageBilling} variant="outline" size="sm" className="w-full justify-between group">Rechnungen anzeigen<ExternalLink size={14} className="text-slate-400 group-hover:text-indigo-600" /></Button>
                            {!subscriptionDetails.isCanceled && (
                                <Button variant="outline" size="sm" className="w-full justify-center text-red-600 border-red-100 hover:bg-red-50 hover:border-red-200" onClick={handleManageBilling}>Abo kündigen</Button>
                            )}
                            {subscriptionDetails.isCanceled && (
                                <Button variant="secondary" size="sm" className="w-full justify-center bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200" onClick={handleResumeSubscription} disabled={isSyncing}>
                                    <RotateCcw size={16} className={isSyncing ? "animate-spin mr-2" : "mr-2"} />
                                    {isSyncing ? 'Reaktiviere...' : 'Kündigung zurücknehmen'}
                                </Button>
                            )}
                        </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-4"><div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-3"><AlertTriangle size={24} /></div><h4 className="font-bold text-slate-900">Abo inaktiv</h4><p className="text-sm text-slate-500 mb-6 max-w-[200px]">Aktiviere dein Abo, um wieder Alarme zu erhalten.</p><Button onClick={handleSubscribe} className="w-full bg-[#00305e] text-white hover:bg-[#002040]">Jetzt aktivieren ({prices.new.toFixed(2).replace('.', ',')} €)</Button><div className="mt-6 border-t border-slate-100 pt-4 w-full text-center"><p className="text-xs text-slate-400 mb-2">Bereits bezahlt?</p><button onClick={handleManualSync} disabled={isSyncing} className="text-xs text-blue-600 underline font-medium hover:text-blue-800">{isSyncing ? "Prüfe..." : "Status aktualisieren / Käufe wiederherstellen"}</button></div></div>
              )}
            </div>
          </div>
        </div>

        {/* ... Personal Data & History ... */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col"><div className="p-6 border-b border-slate-100"><div className="flex items-center gap-3"><div className="bg-slate-100 p-2 rounded-lg text-slate-600"><User size={20} /></div><h3 className="font-semibold text-slate-900">Persönliche Angaben</h3></div></div><div className="p-6"><form onSubmit={handleSavePersonalData} className="space-y-4"><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-slate-700 mb-1">Vorname</label><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 focus:outline-none" value={personalData.firstName} readOnly /></div><div><label className="block text-sm font-medium text-slate-700 mb-1">Nachname</label><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 focus:outline-none" value={personalData.lastName} readOnly /></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="md:col-span-2 flex gap-4"><div className="flex-1"><label className="block text-sm font-medium text-slate-700 mb-1">Straße</label><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" value={personalData.street} onChange={(e) => setPersonalData({...personalData, street: e.target.value})} /></div><div className="w-20"><label className="block text-sm font-medium text-slate-700 mb-1">Nr.</label><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" value={personalData.houseNumber} onChange={(e) => setPersonalData({...personalData, houseNumber: e.target.value})} /></div></div></div><div className="grid grid-cols-2 md:grid-cols-3 gap-4"><div className="col-span-1"><label className="block text-sm font-medium text-slate-700 mb-1">PLZ</label><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" value={personalData.zip} onChange={(e) => setPersonalData({...personalData, zip: e.target.value})} /></div><div className="col-span-1 md:col-span-2"><label className="block text-sm font-medium text-slate-700 mb-1">Ort</label><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" value={personalData.city} onChange={(e) => setPersonalData({...personalData, city: e.target.value})} /></div></div><div><label className="block text-sm font-medium text-slate-700 mb-1">Land</label><select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white" value={personalData.country} onChange={(e) => setPersonalData({...personalData, country: e.target.value})}><option>Deutschland</option><option>Österreich</option><option>Schweiz</option><option>Frankreich</option></select></div><div><label className="block text-sm font-medium text-slate-700 mb-1">E-Mail Adresse</label><input type="email" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" value={personalData.email} onChange={(e) => setPersonalData({...personalData, email: e.target.value})} /></div>
            
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Geworben von (Ref Code)</label>
                <div className="flex items-center gap-2">
                    {userProfile?.referred_by ? (
                        <span className="font-mono text-sm text-blue-600 bg-white px-2 py-1 rounded border border-slate-200">
                            {userProfile.referred_by}
                        </span>
                    ) : (
                        <span className="text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                            Nicht getrackt
                        </span>
                    )}
                    <span className="text-xs text-slate-400">(DB Status)</span>
                </div>
            </div>

            <div className="pt-2 flex justify-end"><Button type="submit" size="sm"><Save size={16} /> Daten speichern</Button></div></form></div></div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full"><div className="p-6 border-b border-slate-100"><div className="flex items-center gap-3"><div className="bg-orange-50 p-2 rounded-lg text-orange-600"><History size={20} /></div><h3 className="font-semibold text-slate-900">Versand-Protokoll</h3></div></div><div className="p-6 flex-1">{alarmHistory.length === 0 ? (<div className="h-full flex flex-col items-center justify-center text-slate-400 py-12"><div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3"><FileText size={24} /></div><p className="text-sm">Noch keine Alarme versendet.</p></div>) : (<div className="space-y-4">{alarmHistory.map(entry => (<div key={entry.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100"><div className={`p-2 rounded-full shrink-0 ${entry.type === 'EMAIL' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>{entry.type === 'EMAIL' ? <Mail size={14} /> : <MessageSquare size={14} />}</div><div><p className="text-sm font-medium text-slate-900">{entry.message}</p><p className="text-xs text-slate-500 mt-0.5">{entry.date}</p></div></div>))}</div>)}</div></div>
        </div>

      </div>
      <Footer navigate={navigate} />
    </div>
  );
};