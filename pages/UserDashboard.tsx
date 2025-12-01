import React, { useState, useEffect } from 'react';
import { Bell, RefreshCw, CheckCircle, ExternalLink, Settings, Mail, MessageSquare, Shield, Send, Ticket, XCircle, Pencil, Save, X, AlertOctagon, CreditCard, AlertTriangle, User, History, FileText, Gift } from 'lucide-react';
import { MonitorStatus, NotificationConfig } from '../types';
import { Button } from '../components/Button';
import { Footer } from '../components/Footer';
import { sendTestAlarm, createCheckoutSession, getSystemSettings, createPortalSession, syncSubscription } from '../services/backendService';
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
  // Simulation State
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>('NONE');
  const [subscriptionDetails, setSubscriptionDetails] = useState<{ endDate: string | null, price: number | null }>({ endDate: null, price: null });
  const [isChecking, setIsChecking] = useState<string | null>(null); 
  const [isSendingAlarm, setIsSendingAlarm] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [monitorGold, setMonitorGold] = useState<MonitorStatus>({
    isActive: true,
    lastChecked: "Lade...",
    isAvailable: false,
    url: productUrls.gold
  });

  const [monitorSilver, setMonitorSilver] = useState<MonitorStatus>({
    isActive: true,
    lastChecked: "Lade...",
    isAvailable: false,
    url: productUrls.silver
  });
  
  // Update monitors when props change
  useEffect(() => {
    setMonitorGold(prev => ({...prev, url: productUrls.gold}));
    setMonitorSilver(prev => ({...prev, url: productUrls.silver}));
  }, [productUrls]);

  // Notification State - Init empty
  const [notifications, setNotifications] = useState<NotificationConfig>({
    email: "",
    sms: "",
    emailEnabled: true,
    smsEnabled: true
  });

  // Independent Edit States for Notification Card
  const [editMode, setEditMode] = useState({ email: false, sms: false });
  const [tempData, setTempData] = useState({ email: "", sms: "" });
  const [errors, setErrors] = useState({ email: '', sms: '' });

  // Personal Data State - Init empty
  const [personalData, setPersonalData] = useState({
    firstName: '',
    lastName: '',
    street: '',
    houseNumber: '',
    zip: '',
    city: '',
    country: 'Deutschland',
    email: ""
  });

  // Alarm History State
  const [alarmHistory, setAlarmHistory] = useState<LogEntry[]>([]);

  // Derived state for easy checking
  const hasActiveSubscription = subscriptionStatus !== 'NONE';

  const fetchProfileAndSub = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        
        if (profile) {
            // Populate Personal Data
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

            // Populate Notifications
            setNotifications({
                email: profile.notification_email || profile.email || user.email || '',
                sms: profile.phone || "", 
                emailEnabled: profile.email_enabled !== false, // Default to true if null
                smsEnabled: profile.sms_enabled === true
            });

            // Init temp data for editing
            setTempData({
                email: profile.notification_email || profile.email || user.email || '',
                sms: profile.phone || ""
            });
        }

        // Fetch Subscription Status
        const { data: sub } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .single();
        
        if (sub) {
            if (sub.plan_type === 'premium') setSubscriptionStatus('PAID');
            else if (sub.plan_type === 'Manuell (Gratis)') setSubscriptionStatus('FREE');
            else setSubscriptionStatus('PAID');

            // Set real details
            setSubscriptionDetails({
                endDate: sub.current_period_end,
                // If no price stored in sub yet, fallback to existing prop
                price: prices.existing 
            });
        }
    }
  };

  // Load Real User Data on Mount
  useEffect(() => {
    fetchProfileAndSub();
  }, [prices.existing]);

  // Fetch REAL System Status (Sync with Admin/LandingPage)
  const fetchSystemStatus = async () => {
      try {
          const settings = await getSystemSettings();
          if (settings) {
              const lastCheckedTime = settings.last_checked 
                  ? new Date(settings.last_checked).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
                  : "Warte auf Daten...";

              setMonitorGold(prev => ({
                  ...prev,
                  isAvailable: settings.status_gold === 'available',
                  lastChecked: lastCheckedTime
              }));
              setMonitorSilver(prev => ({
                  ...prev,
                  isAvailable: settings.status_silver === 'available',
                  lastChecked: lastCheckedTime
              }));
          }
      } catch (e) {
          console.error("Failed to sync status", e);
      }
  };

  // Poll for status updates
  useEffect(() => {
    fetchSystemStatus(); // Initial fetch
    const interval = setInterval(fetchSystemStatus, 60000); // Check every minute

    // Check for payment success query param
    const query = new URLSearchParams(window.location.search);
    if (query.get('payment_success')) {
      // FORCE SYNC with Stripe
      setIsSyncing(true);
      syncSubscription().then(() => {
          fetchProfileAndSub(); // Reload local state
          setIsSyncing(false);
          setSubscriptionStatus('PAID');
          alert("Zahlung erfolgreich! Dein Abo ist jetzt aktiv.");
      }).catch(() => {
          setIsSyncing(false);
      });
      
      // Clear URL param
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    return () => clearInterval(interval);
  }, []);

  // --- DB Update Helpers ---
  const updateProfileColumn = async (column: string, value: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase.from('profiles').update({ [column]: value }).eq('id', user.id);
      if (error) console.error(`Error updating ${column}:`, error);
  };

  const handleToggleEmail = (enabled: boolean) => {
      setNotifications(prev => ({...prev, emailEnabled: enabled}));
      updateProfileColumn('email_enabled', enabled);
  };

  const handleToggleSms = (enabled: boolean) => {
      setNotifications(prev => ({...prev, smsEnabled: enabled}));
      updateProfileColumn('sms_enabled', enabled);
  };

  const handleSavePersonalData = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { error } = await supabase.from('profiles').update({
            street: personalData.street,
            house_number: personalData.houseNumber,
            zip: personalData.zip,
            city: personalData.city,
            country: personalData.country,
            email: personalData.email
        }).eq('id', user.id);

        if (error) {
            alert("Fehler beim Speichern: " + error.message);
        } else {
            alert("Persönliche Daten erfolgreich gespeichert.");
        }
    }
  };

  const handleManualCheck = (type: 'gold' | 'silver') => {
    setIsChecking(type);
    fetchSystemStatus().then(() => {
        setTimeout(() => setIsChecking(null), 800); 
    });
  };

  const handleManualSync = async () => {
      setIsSyncing(true);
      try {
          const result = await syncSubscription();
          if (result.found) {
              await fetchProfileAndSub();
              alert("Abo erfolgreich synchronisiert! Dein Status ist jetzt aktiv.");
          } else {
              alert("Kein aktives Abo bei Stripe gefunden.");
          }
      } catch (e: any) {
          alert("Fehler beim Synchronisieren: " + e.message);
      } finally {
          setIsSyncing(false);
      }
  }

  // -- Email Handling --
  const startEditEmail = () => {
    setTempData(prev => ({ ...prev, email: notifications.email }));
    setEditMode(prev => ({ ...prev, email: true }));
    setErrors(prev => ({ ...prev, email: '' }));
  };

  const saveEmail = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(tempData.email)) {
      setErrors(prev => ({ ...prev, email: "Bitte eine gültige E-Mail Adresse eingeben." }));
      return;
    }
    setNotifications(prev => ({ ...prev, email: tempData.email }));
    await updateProfileColumn('notification_email', tempData.email);
    setEditMode(prev => ({ ...prev, email: false }));
    setErrors(prev => ({ ...prev, email: '' }));
  };

  const cancelEditEmail = () => {
    setEditMode(prev => ({ ...prev, email: false }));
    setErrors(prev => ({ ...prev, email: '' }));
  };

  // -- SMS Handling --
  const startEditSms = () => {
    setTempData(prev => ({ ...prev, sms: notifications.sms }));
    setEditMode(prev => ({ ...prev, sms: true }));
    setErrors(prev => ({ ...prev, sms: '' }));
  };

  const saveSms = async () => {
    if (!tempData.sms.startsWith('+') || tempData.sms.length < 9) {
      setErrors(prev => ({ ...prev, sms: "Format ungültig. Bitte mit Landesvorwahl angeben (z.B. +49...)." }));
      return;
    }
    if (!/^\+[\d\s-]+$/.test(tempData.sms)) {
        setErrors(prev => ({ ...prev, sms: "Bitte nur Ziffern, Leerzeichen und das + verwenden." }));
        return;
    }

    setNotifications(prev => ({ ...prev, sms: tempData.sms }));
    await updateProfileColumn('phone', tempData.sms);
    setEditMode(prev => ({ ...prev, sms: false }));
    setErrors(prev => ({ ...prev, sms: '' }));
  };

  const cancelEditSms = () => {
    setEditMode(prev => ({ ...prev, sms: false }));
    setErrors(prev => ({ ...prev, sms: '' }));
  };

  // --- ACTIONS ---
  const handleTestAlarm = async () => {
    const activeMethods = [];
    if (notifications.emailEnabled) activeMethods.push("E-Mail");
    if (notifications.smsEnabled) activeMethods.push("SMS");

    if (activeMethods.length === 0) {
      alert("Bitte aktiviere mindestens eine Benachrichtigungsmethode.");
      return;
    }

    setIsSendingAlarm(true);
    try {
      await sendTestAlarm(notifications.email, notifications.sms, notifications.emailEnabled, notifications.smsEnabled);
      const newEntry: LogEntry = {
          id: Math.random().toString(36).substr(2, 9),
          date: new Date().toLocaleString(),
          type: notifications.emailEnabled ? 'EMAIL' : 'SMS',
          message: 'Test-Alarm erfolgreich gesendet'
      };
      setAlarmHistory(prev => [newEntry, ...prev]);
      alert("Test-Nachricht wurde verschickt!");
    } catch (error) {
      alert("Fehler beim Senden: " + error);
    } finally {
      setIsSendingAlarm(false);
    }
  };

  const handleSubscribe = async () => {
    await createCheckoutSession(personalData.email);
  };

  const handleManageBilling = async () => {
      await createPortalSession();
  }

  const StatusCard = ({ title, type, monitor }: { title: string, type: 'gold' | 'silver', monitor: MonitorStatus }) => {
    const isLoading = isChecking === type;

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
           <div className="flex items-center gap-2">
              <Ticket className={type === 'gold' ? 'text-yellow-500' : 'text-slate-400'} fill="currentColor" size={20} />
              <h2 className="font-bold text-slate-900">{title}</h2>
           </div>
           <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
              {isLoading ? "Prüfe..." : monitor.lastChecked}
           </div>
        </div>
        
        <div className={`flex-1 p-6 flex flex-col items-center justify-center text-center transition-all duration-500 ${
            monitor.isAvailable ? 'bg-green-50/50' : 'bg-white'
        }`}>
          {monitor.isAvailable ? (
            <div className="space-y-4 animate-in fade-in zoom-in w-full">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <CheckCircle size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-800">VERFÜGBAR!</h3>
                <p className="text-green-700 text-sm">Schnell sein!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 w-full">
              <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 bg-red-100 rounded-full opacity-50 animate-pulse"></div>
                <div className="relative bg-red-50 w-full h-full rounded-full flex items-center justify-center text-red-500 z-10 border border-red-100">
                  <XCircle size={32} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-600">Ausverkauft</h3>
                <p className="text-slate-500 text-sm">Momentan keine Kontingente.</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col items-center">
            <Button 
              onClick={() => handleManualCheck(type)} 
              variant="secondary" 
              size="sm" 
              className="w-full justify-center bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 mb-3"
              disabled={isLoading}
            >
               <RefreshCw size={14} className={isLoading ? "animate-spin mr-2" : "mr-2"} />
               {isLoading ? "Wird geprüft..." : "Manuell Prüfen"}
            </Button>
            
            <a 
              href={monitor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-[#00305e] hover:underline transition-colors"
            >
              <ExternalLink size={12} />
              Zum Europa-Park Shop
            </a>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-grow w-full">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mein Überwachungs-Dashboard</h1>
            <p className="text-slate-500">
              {hasActiveSubscription 
                ? 'ResortPass Alarm ist aktiv. Lehn dich zurück.' 
                : 'Dein Abo ist inaktiv. Aktiviere es, um Alarme zu erhalten.'}
            </p>
          </div>
          
          {hasActiveSubscription ? (
            <div className="flex items-center gap-2 bg-[#00305e] text-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium animate-in fade-in">
              <Shield size={16} className="text-[#ffcc00]" />
              Premium Schutz Aktiv
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-md text-sm font-bold animate-pulse">
              <AlertOctagon size={18} />
              WARNUNG: SCHUTZ INAKTIV
            </div>
          )}
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${!hasActiveSubscription ? 'opacity-50 grayscale pointer-events-none select-none' : ''}`}>
          <StatusCard title="ResortPass Silver" type="silver" monitor={monitorSilver} />
          <StatusCard title="ResortPass Gold" type="gold" monitor={monitorGold} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Notification Settings */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Bell size={20} /></div>
                <h3 className="font-semibold text-slate-900">Benachrichtigungen</h3>
              </div>
            </div>

            {(!notifications.emailEnabled || !notifications.smsEnabled) && (
              <div className="bg-amber-50 border-b border-amber-100 p-3 flex items-start gap-3">
                  <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    <span className="font-bold">Empfehlung:</span> Aktiviere beide Kanäle! E-Mails können im Spam landen, SMS kommen immer an. Verpasse keine Chance.
                  </p>
              </div>
            )}
            
            <div className="p-6 space-y-4 flex-1">
              {/* Email & SMS Settings UI ... (Same as before) */}
              
              {/* Email Settings */}
              <div className="flex flex-col p-4 border border-slate-100 rounded-xl hover:border-indigo-100 transition-colors">
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="flex items-center gap-3">
                    <Mail className={notifications.emailEnabled ? "text-blue-600" : "text-slate-300"} size={20} />
                    <p className="font-medium text-slate-900">Email Alarm</p>
                  </div>
                  <div className="flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={notifications.emailEnabled} onChange={(e) => handleToggleEmail(e.target.checked)} />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                      {!editMode.email ? ( <button onClick={startEditEmail} className="text-slate-400 hover:text-blue-600 p-1"><Pencil size={16} /></button> ) : ( <div className="flex gap-1"><button onClick={saveEmail} className="text-green-600 hover:text-green-700 p-1"><Save size={16} /></button><button onClick={cancelEditEmail} className="text-red-400 hover:text-red-600 p-1"><X size={16} /></button></div> )}
                  </div>
                </div>
                <div className="ml-8">
                  {editMode.email ? ( <div className="space-y-1"><input type="email" value={tempData.email} onChange={(e) => setTempData({...tempData, email: e.target.value})} className={`w-full text-sm p-2 border rounded focus:ring-1 focus:ring-blue-500 outline-none ${errors.email ? 'border-red-300 bg-red-50' : 'border-blue-300'}`} />{errors.email && <p className="text-xs text-red-500 font-medium">{errors.email}</p>}</div> ) : ( <p className="text-sm text-slate-500 truncate">{notifications.email || 'Nicht konfiguriert'}</p> )}
                </div>
              </div>

              {/* SMS Settings */}
              <div className="flex flex-col p-4 border border-slate-100 rounded-xl hover:border-indigo-100 transition-colors">
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="flex items-center gap-3">
                    <MessageSquare className={notifications.smsEnabled ? "text-blue-600" : "text-slate-300"} size={20} />
                    <p className="font-medium text-slate-900">SMS Alarm</p>
                  </div>
                  <div className="flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={notifications.smsEnabled} onChange={(e) => handleToggleSms(e.target.checked)} />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                      {!editMode.sms ? ( <button onClick={startEditSms} className="text-slate-400 hover:text-blue-600 p-1"><Pencil size={16} /></button> ) : ( <div className="flex gap-1"><button onClick={saveSms} className="text-green-600 hover:text-green-700 p-1"><Save size={16} /></button><button onClick={cancelEditSms} className="text-red-400 hover:text-red-600 p-1"><X size={16} /></button></div> )}
                  </div>
                </div>
                <div className="ml-8">
                  {editMode.sms ? ( <div className="space-y-1"><input type="tel" value={tempData.sms} onChange={(e) => setTempData({...tempData, sms: e.target.value})} placeholder="+49 170 123456" className={`w-full text-sm p-2 border rounded focus:ring-1 focus:ring-blue-500 outline-none ${errors.sms ? 'border-red-300 bg-red-50' : 'border-blue-300'}`} />{errors.sms ? ( <p className="text-xs text-red-500 font-medium">{errors.sms}</p> ) : ( <p className="text-xs text-slate-400">Bitte mit Landesvorwahl (z.B. +49)</p> )}</div> ) : ( <p className="text-sm text-slate-500 truncate">{notifications.sms || 'Nicht konfiguriert'}</p> )}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                      Der Testalarm geht einmalig an deine E-Mail und/oder als SMS an deine Handynummer. Stelle sicher, dass beides stimmt um keinen Alarm zu verpassen!
                  </p>
                  <Button onClick={handleTestAlarm} disabled={isSendingAlarm} variant="secondary" size="sm" className="w-full justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-sm">
                    <Send size={14} className="mr-1" />
                    {isSendingAlarm ? "Sende..." : "Test-Alarm senden"}
                  </Button>
              </div>
            </div>
          </div>

          {/* Subscription Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
            <div className="p-6 flex items-center gap-3 mb-0 border-b border-slate-100">
              <div className="bg-purple-50 p-2 rounded-lg text-purple-600"><Settings size={20} /></div>
              <h3 className="font-semibold text-slate-900">Dein Abo</h3>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              {hasActiveSubscription ? (
                <div className="flex-1">
                  
                  {subscriptionStatus === 'FREE' ? (
                     <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-purple-700 font-medium flex items-center gap-2">
                                <Gift size={16} /> Geschenk / Admin
                            </span>
                            <span className="bg-purple-200 text-purple-800 text-xs px-2 py-1 rounded font-bold uppercase">Aktiv</span>
                        </div>
                        <div className="text-xl font-bold text-slate-900 mb-1">Kostenlos</div>
                        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                            Dein Account wurde manuell für alle Premium-Funktionen freigeschaltet.
                        </p>
                     </div>
                  ) : (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-4">
                        <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-600 font-medium flex items-center gap-2">
                            <CreditCard size={14} /> Stripe Checkout
                        </span>
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-bold uppercase">Aktiv</span>
                        </div>
                        <div className="text-3xl font-bold text-slate-900 mb-1">{subscriptionDetails.price ? subscriptionDetails.price.toFixed(2).replace('.', ',') : prices.existing.toFixed(2).replace('.', ',')} € <span className="text-sm font-normal text-slate-500">/ Monat</span></div>
                        <p className="text-sm text-slate-500">
                            Nächste Abrechnung: {subscriptionDetails.endDate ? new Date(subscriptionDetails.endDate).toLocaleDateString('de-DE') : 'Lade...'}
                        </p>
                    </div>
                  )}

                  
                  <div className="space-y-2 mt-auto">
                    {subscriptionStatus === 'PAID' && (
                        <>
                            <Button onClick={handleManageBilling} variant="outline" size="sm" className="w-full justify-between group">
                            Zahlungsmethode bearbeiten
                            <ExternalLink size={14} className="text-slate-400 group-hover:text-indigo-600" />
                            </Button>
                            <Button onClick={handleManageBilling} variant="outline" size="sm" className="w-full justify-between group">
                            Rechnungen anzeigen
                            <ExternalLink size={14} className="text-slate-400 group-hover:text-indigo-600" />
                            </Button>
                            <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full justify-center text-red-600 border-red-100 hover:bg-red-50 hover:border-red-200"
                            onClick={handleManageBilling}
                            >
                            Abo kündigen
                            </Button>
                        </>
                    )}
                    {subscriptionStatus === 'FREE' && (
                        <p className="text-xs text-center text-purple-400">Dieser Status ist dauerhaft aktiv.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-3">
                      <AlertTriangle size={24} />
                    </div>
                    <h4 className="font-bold text-slate-900">Abo inaktiv</h4>
                    <p className="text-sm text-slate-500 mb-6 max-w-[200px]">
                      Aktiviere dein Abo, um wieder Alarme zu erhalten.
                    </p>
                    <Button 
                      onClick={handleSubscribe} 
                      className="w-full bg-[#00305e] text-white hover:bg-[#002040]"
                    >
                      Jetzt aktivieren ({prices.new.toFixed(2).replace('.', ',')} €)
                    </Button>
                    
                    <div className="mt-6 border-t border-slate-100 pt-4 w-full text-center">
                         <p className="text-xs text-slate-400 mb-2">Bereits bezahlt?</p>
                         <button onClick={handleManualSync} disabled={isSyncing} className="text-xs text-blue-600 underline font-medium hover:text-blue-800">
                              {isSyncing ? "Prüfe..." : "Status aktualisieren / Käufe wiederherstellen"}
                         </button>
                    </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ... Personal Data & History Sections ... */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
              <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                      <div className="bg-slate-100 p-2 rounded-lg text-slate-600"><User size={20} /></div>
                      <h3 className="font-semibold text-slate-900">Persönliche Angaben</h3>
                  </div>
              </div>
              <div className="p-6">
                  <form onSubmit={handleSavePersonalData} className="space-y-4">
                      {/* ... Personal Data Inputs ... */}
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Vorname</label>
                              <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 focus:outline-none" value={personalData.firstName} readOnly />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Nachname</label>
                              <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 focus:outline-none" value={personalData.lastName} readOnly />
                          </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2 flex gap-4">
                              <div className="flex-1">
                                  <label className="block text-sm font-medium text-slate-700 mb-1">Straße</label>
                                  <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" value={personalData.street} onChange={(e) => setPersonalData({...personalData, street: e.target.value})} />
                              </div>
                              <div className="w-20">
                                  <label className="block text-sm font-medium text-slate-700 mb-1">Nr.</label>
                                  <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" value={personalData.houseNumber} onChange={(e) => setPersonalData({...personalData, houseNumber: e.target.value})} />
                              </div>
                          </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="col-span-1">
                              <label className="block text-sm font-medium text-slate-700 mb-1">PLZ</label>
                              <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" value={personalData.zip} onChange={(e) => setPersonalData({...personalData, zip: e.target.value})} />
                          </div>
                          <div className="col-span-1 md:col-span-2">
                              <label className="block text-sm font-medium text-slate-700 mb-1">Ort</label>
                              <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" value={personalData.city} onChange={(e) => setPersonalData({...personalData, city: e.target.value})} />
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Land</label>
                          <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white" value={personalData.country} onChange={(e) => setPersonalData({...personalData, country: e.target.value})}>
                              <option>Deutschland</option>
                              <option>Österreich</option>
                              <option>Schweiz</option>
                              <option>Frankreich</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">E-Mail Adresse</label>
                          <input type="email" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" value={personalData.email} onChange={(e) => setPersonalData({...personalData, email: e.target.value})} />
                      </div>
                      <div className="pt-2 flex justify-end">
                          <Button type="submit" size="sm"><Save size={16} /> Daten speichern</Button>
                      </div>
                  </form>
              </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full">
              <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                      <div className="bg-orange-50 p-2 rounded-lg text-orange-600"><History size={20} /></div>
                      <h3 className="font-semibold text-slate-900">Versand-Protokoll</h3>
                  </div>
              </div>
              <div className="p-6 flex-1">
                  {alarmHistory.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                              <FileText size={24} />
                          </div>
                          <p className="text-sm">Noch keine Alarme versendet.</p>
                      </div>
                  ) : (
                      <div className="space-y-4">
                          {alarmHistory.map(entry => (
                              <div key={entry.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                  <div className={`p-2 rounded-full shrink-0 ${entry.type === 'EMAIL' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                      {entry.type === 'EMAIL' ? <Mail size={14} /> : <MessageSquare size={14} />}
                                  </div>
                                  <div>
                                      <p className="text-sm font-medium text-slate-900">{entry.message}</p>
                                      <p className="text-xs text-slate-500 mt-0.5">{entry.date}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          </div>
        </div>
      </div>
      <Footer navigate={navigate} />
    </div>
  );
};