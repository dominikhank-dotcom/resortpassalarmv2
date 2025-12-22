
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Settings, X, ChevronRight, Check, Info } from 'lucide-react';
import { Button } from './Button';

interface CookieSettings {
  essential: true;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export const CookieBanner: React.FC<{ navigate: (page: string) => void }> = ({ navigate }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<CookieSettings>({
    essential: true,
    functional: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (newSettings: CookieSettings) => {
    localStorage.setItem('cookie-consent', JSON.stringify(newSettings));
    setIsVisible(false);
    // Here you would normally initialize tracking scripts based on newSettings
  };

  const handleAcceptAll = () => {
    const allOn: CookieSettings = { essential: true, functional: true, analytics: true, marketing: true };
    setSettings(allOn);
    saveConsent(allOn);
  };

  const handleRejectAll = () => {
    const allOff: CookieSettings = { essential: true, functional: false, analytics: false, marketing: false };
    setSettings(allOff);
    saveConsent(allOff);
  };

  const handleSaveCustom = () => {
    saveConsent(settings);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-[100] p-4 md:p-6 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {!showSettings ? (
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="bg-blue-50 p-3 rounded-xl text-[#00305e] shrink-0">
                <ShieldCheck size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Privatsphäre-Einstellungen</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Wir verwenden Cookies, um die Funktionalität unserer Website zu gewährleisten und um zu verstehen, wie du unseren Service nutzt. Einige sind technisch notwendig, andere helfen uns, dein Erlebnis zu verbessern. Weitere Informationen findest du in unserer <button onClick={() => navigate('privacy')} className="text-[#00305e] underline font-medium hover:text-blue-700">Datenschutzerklärung</button>.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleAcceptAll} className="bg-[#00305e] text-white hover:bg-blue-900 px-6">
                    Alle akzeptieren
                  </Button>
                  <Button onClick={handleRejectAll} variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 px-6">
                    Nur Essenzielle
                  </Button>
                  <button 
                    onClick={() => setShowSettings(true)}
                    className="text-slate-500 text-sm font-medium hover:text-[#00305e] flex items-center gap-1 transition px-2"
                  >
                    <Settings size={14} /> Einstellungen
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full max-h-[80vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Settings size={18} className="text-slate-500" />
                Detaillierte Cookie-Einstellungen
              </h3>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4">
              {/* Essential */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="mt-1"><Check size={18} className="text-green-600" /></div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-900">Technisch notwendig</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">Immer aktiv</span>
                  </div>
                  <p className="text-xs text-slate-500">Diese Cookies sind für den Betrieb der Seite und Funktionen wie den Login oder die Zahlungsabwicklung (Stripe) zwingend erforderlich.</p>
                </div>
              </div>

              {/* Functional */}
              <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                <label className="relative inline-flex items-center cursor-pointer mt-1">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.functional}
                    onChange={e => setSettings({...settings, functional: e.target.checked})}
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <div className="flex-1">
                  <span className="font-bold text-slate-900 block mb-1">Funktional</span>
                  <p className="text-xs text-slate-500">Ermöglicht erweiterte Funktionen wie die Speicherung von Sprachpräferenzen oder Support-Chats.</p>
                </div>
              </div>

              {/* Analytics */}
              <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                <label className="relative inline-flex items-center cursor-pointer mt-1">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.analytics}
                    onChange={e => setSettings({...settings, analytics: e.target.checked})}
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <div className="flex-1">
                  <span className="font-bold text-slate-900 block mb-1">Analyse & Statistik</span>
                  <p className="text-xs text-slate-500">Wir nutzen anonymisierte Daten, um zu verstehen, wie Besucher unsere Website nutzen, und um Fehler schneller zu beheben.</p>
                </div>
              </div>

              {/* Marketing */}
              <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                <label className="relative inline-flex items-center cursor-pointer mt-1">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.marketing}
                    onChange={e => setSettings({...settings, marketing: e.target.checked})}
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <div className="flex-1">
                  <span className="font-bold text-slate-900 block mb-1">Marketing</span>
                  <p className="text-xs text-slate-500">Hilft uns, Partner-Provisionen korrekt zuzuordnen und relevante Anzeigen auf sozialen Medien zu schalten.</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
              <button 
                onClick={() => setShowSettings(false)}
                className="text-slate-500 text-sm font-medium hover:text-slate-800 flex items-center gap-1"
              >
                Zurück
              </button>
              <div className="flex gap-3">
                <Button onClick={handleRejectAll} variant="outline" size="sm" className="border-slate-300">
                  Alle ablehnen
                </Button>
                <Button onClick={handleSaveCustom} size="sm" className="bg-[#00305e] text-white px-8">
                  Auswahl speichern
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
