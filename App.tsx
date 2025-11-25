import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { UserDashboard } from './pages/UserDashboard';
import { AffiliateDashboard } from './pages/AffiliateDashboard';
import { AffiliateInfoPage } from './pages/AffiliateInfoPage';
import { AffiliateSignupPage } from './pages/AffiliateSignupPage';
import { UserSignupPage } from './pages/UserSignupPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { ImprintPage, PrivacyPage, TermsPage, RevocationPage } from './pages/LegalPages';
import { PartnerTermsPage } from './pages/PartnerTermsPage';
import { UserRole } from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Loader2, AlertTriangle } from 'lucide-react';

// Login Screen with Supabase Integration
const LoginScreen: React.FC<{ role: UserRole; onLogin: () => void; onCancel: () => void; onRegisterClick?: () => void }> = ({ role, onLogin, onCancel, onRegisterClick }) => {
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSlowLoadingHint, setShowSlowLoadingHint] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    // 1. Immediate Config Check
    if (!isSupabaseConfigured) {
        setError("Konfigurationsfehler: Datenbank-Verbindung fehlt. Bitte Environment Variables in Vercel prüfen.");
        return;
    }

    if (!email || !password) {
      setError("Bitte E-Mail und Passwort eingeben.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setShowSlowLoadingHint(false);

    // Timer to show hint if it takes longer than 3 seconds (likely blocked)
    const slowTimer = setTimeout(() => setShowSlowLoadingHint(true), 3000);

    try {
      // 2. Connectivity Ping with short Timeout (5s)
      // If getSession hangs, it's likely an extension blocking the storage/network
      const pingPromise = supabase.auth.getSession();
      const pingTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("TIMEOUT_PING")), 5000)
      );

      try {
         await Promise.race([pingPromise, pingTimeout]);
      } catch(e: any) {
         if (e.message === 'TIMEOUT_PING') {
             throw new Error("Verbindung blockiert. Bitte AdBlocker/Erweiterungen deaktivieren oder Inkognito-Modus nutzen oder anderen Browser versuchen.");
         }
         throw e;
      }

      // 3. Login with Timeout (15s)
      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      const loginTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("TIMEOUT_LOGIN")), 15000)
      );

      // Race: Whichever finishes first wins
      const result = await Promise.race([loginPromise, loginTimeout]) as any;
      const { data, error } = result;

      if (error) throw error;
      if (data.user) {
        onLogin();
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      let msg = err.message || "Anmeldung fehlgeschlagen.";
      
      if (msg === 'TIMEOUT_LOGIN') msg = "Zeitüberschreitung. Der Server antwortet nicht.";
      if (msg === 'Failed to fetch') msg = "Netzwerkfehler. Bitte Internet prüfen.";
      
      setError(msg);
    } finally {
      clearTimeout(slowTimer);
      setIsLoading(false);
      setShowSlowLoadingHint(false);
    }
  };

  const handleResetPassword = async () => {
    if (!isSupabaseConfigured) {
        alert("Fehler: Datenbank nicht konfiguriert.");
        return;
    }
    if (!email) {
      alert("Bitte gib deine E-Mail Adresse ein.");
      return;
    }
    setIsLoading(true);
    try {
      // Use window.location.origin to ensure the link points to the deployed app, not localhost (unless running locally)
      const redirectUrl = window.location.origin;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
         redirectTo: redirectUrl,
      });
      
      if (error) throw error;
      
      alert(`Ein Link zum Zurücksetzen des Passworts wurde an ${email} gesendet.`);
      setView('login');
    } catch (e: any) {
      alert("Fehler: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border-t-4 border-[#00305e]">
        
        {view === 'login' ? (
          <>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              {role === UserRole.AFFILIATE ? 'Partner Login' : role === UserRole.ADMIN ? 'Admin Login' : 'Kunden Login'}
            </h2>
            <p className="text-slate-500 mb-8">Bitte melde dich an, um fortzufahren.</p>
            
            {error && (
               <div className="bg-red-50 text-red-600 text-sm p-3 rounded mb-4 border border-red-200 text-left">
                  <span className="font-bold block mb-1">Fehler:</span>
                  {error}
               </div>
            )}

            <div className="space-y-3">
              <input 
                type="email" 
                placeholder="Email Adresse" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" 
              />
              <input 
                type="password" 
                placeholder="Passwort" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" 
              />
              
              <div className="flex justify-end">
                <button 
                  onClick={() => setView('forgot')}
                  className="text-sm text-[#00305e] hover:underline font-medium"
                >
                  Passwort vergessen?
                </button>
              </div>

              <button 
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full bg-[#00305e] text-white py-3 rounded-lg font-semibold hover:bg-blue-900 transition mt-2 flex justify-center"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : 'Anmelden'}
              </button>
              
              {showSlowLoadingHint && (
                  <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100 flex items-center gap-2 text-left animate-in fade-in">
                      <AlertTriangle size={16} className="shrink-0" />
                      <span>Dauert es zu lange? Deaktiviere AdBlocker oder nutze den Inkognito-Modus.</span>
                  </div>
              )}

              <button onClick={onCancel} className="text-slate-400 text-sm hover:text-slate-600 block w-full py-2">Abbrechen</button>
            </div>
            
            {onRegisterClick && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-sm text-slate-500">
                  {role === UserRole.AFFILIATE ? 'Noch keinen Partner Account?' : 'Noch kein Konto?'}
                </p>
                <button onClick={onRegisterClick} className="text-[#00305e] font-semibold text-sm hover:underline mt-1">
                  Jetzt registrieren
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Passwort vergessen?
            </h2>
            <p className="text-slate-500 mb-8 text-sm">
              Kein Problem. Gib deine E-Mail Adresse ein und wir senden dir einen Link.
            </p>

            <div className="space-y-4">
              <input 
                type="email" 
                placeholder="Email Adresse" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" 
              />
              
              <button 
                onClick={handleResetPassword}
                disabled={isLoading}
                className="w-full bg-[#00305e] text-white py-3 rounded-lg font-semibold hover:bg-blue-900 transition flex justify-center"
              >
                 {isLoading ? <Loader2 className="animate-spin" /> : 'Link senden'}
              </button>
              
              <button 
                onClick={() => setView('login')} 
                className="text-slate-500 text-sm hover:text-slate-700 font-medium"
              >
                Zurück zum Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Screen to enter new password after clicking the recovery link
const UpdatePasswordScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpdate = async () => {
    if (!isSupabaseConfigured) {
        setMessage("Datenbank nicht konfiguriert.");
        return;
    }
    if (password !== confirm) {
      setMessage("Passwörter stimmen nicht überein.");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: password });
      if (error) throw error;
      alert("Passwort erfolgreich geändert! Du bist jetzt eingeloggt.");
      onComplete();
    } catch (e: any) {
      setMessage("Fehler: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
       <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border-t-4 border-green-500">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Neues Passwort festlegen</h2>
          {message && <p className="text-red-500 text-sm mb-4">{message}</p>}
          <div className="space-y-3">
             <input type="password" placeholder="Neues Passwort" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-slate-300" />
             <input type="password" placeholder="Wiederholen" value={confirm} onChange={e => setConfirm(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-slate-300" />
             <button onClick={handleUpdate} disabled={isLoading} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700">
                {isLoading ? 'Speichere...' : 'Passwort speichern'}
             </button>
          </div>
       </div>
    </div>
  );
};

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.GUEST);
  const [currentPage, setCurrentPage] = useState('landing');
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  
  // Global Commission State
  const [globalCommissionRate, setGlobalCommissionRate] = useState(50);

  // Global Product URLs State
  const [productUrls, setProductUrls] = useState({
    gold: "https://tickets.mackinternational.de/de/ticket/resortpass-gold",
    silver: "https://tickets.mackinternational.de/de/ticket/resortpass-silver"
  });

  // Track Referral Link
  useEffect(() => {
    const storedData = localStorage.getItem('resortpass_ref_data');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        if (Date.now() > parsed.expiry) {
          localStorage.removeItem('resortpass_ref_data');
        }
      } catch (e) {
        localStorage.removeItem('resortpass_ref_data');
      }
    }

    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    
    if (refCode) {
      const expiry = Date.now() + (30 * 24 * 60 * 60 * 1000); 
      const data = { code: refCode, expiry };
      localStorage.setItem('resortpass_ref_data', JSON.stringify(data));
      localStorage.removeItem('resortpass_referral'); 
    }
  }, []);

  // Auth State Listener
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
            setIsRecoveryMode(true);
        }

        if (session) {
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
            if (profile && profile.role) {
                setRole(profile.role as UserRole);
            }
        }
    });

    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
            if (profile && profile.role) {
                setRole(profile.role as UserRole);
            }
        }
    };
    checkSession();
  }, []);

  const navigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleSetRole = (newRole: UserRole) => {
    setRole(newRole);
  };

  // Render Password Reset Screen if triggered by email link
  if (isRecoveryMode) {
      return <UpdatePasswordScreen onComplete={() => { setIsRecoveryMode(false); navigate('dashboard'); }} />;
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'affiliate-info':
        return (
          <AffiliateInfoPage 
            onSignup={() => navigate('affiliate-signup')} 
            onBack={() => navigate('landing')} 
            onLogin={() => navigate('affiliate-login')}
            commissionRate={globalCommissionRate} 
            navigate={navigate}
          />
        );
      case 'affiliate-signup':
        return <AffiliateSignupPage onLoginClick={() => navigate('affiliate-login')} onRegister={() => { setRole(UserRole.AFFILIATE); navigate('affiliate'); }} onNavigate={navigate} />;
      case 'affiliate-login':
        return <LoginScreen role={UserRole.AFFILIATE} onLogin={() => { setRole(UserRole.AFFILIATE); navigate('affiliate'); }} onCancel={() => navigate('landing')} onRegisterClick={() => navigate('affiliate-signup')} />;
      case 'user-signup':
        return <UserSignupPage onLoginClick={() => navigate('login')} onRegister={() => { setRole(UserRole.CUSTOMER); navigate('dashboard'); }} onNavigate={navigate} />;
      case 'admin-login':
        return <LoginScreen role={UserRole.ADMIN} onLogin={() => { setRole(UserRole.ADMIN); navigate('admin-dashboard'); }} onCancel={() => navigate('landing')} />;
      case 'admin-dashboard':
         return role === UserRole.ADMIN 
          ? <AdminDashboard 
              commissionRate={globalCommissionRate} 
              onUpdateCommission={setGlobalCommissionRate} 
              productUrls={productUrls}
              onUpdateProductUrls={setProductUrls}
            /> 
          : <LoginScreen role={UserRole.ADMIN} onLogin={() => { setRole(UserRole.ADMIN); navigate('admin-dashboard'); }} onCancel={() => navigate('landing')} />;
      
      // Legal Pages
      case 'imprint':
        return <ImprintPage onBack={() => navigate('landing')} />;
      case 'privacy':
        return <PrivacyPage onBack={() => navigate('landing')} />;
      case 'terms':
        return <TermsPage onBack={() => navigate('landing')} />;
      case 'revocation':
        return <RevocationPage onBack={() => navigate('landing')} />;
      case 'partner-terms':
        return <PartnerTermsPage onBack={() => navigate('affiliate-signup')} />;

      case 'dashboard':
        if (role === UserRole.CUSTOMER) return <UserDashboard navigate={navigate} productUrls={productUrls} />;
        return <LoginScreen role={UserRole.CUSTOMER} onLogin={() => { setRole(UserRole.CUSTOMER); navigate('dashboard'); }} onCancel={() => navigate('landing')} onRegisterClick={() => navigate('user-signup')} />;
      
      case 'affiliate':
        if (role === UserRole.AFFILIATE) return <AffiliateDashboard />;
        return <LoginScreen role={UserRole.AFFILIATE} onLogin={() => { setRole(UserRole.AFFILIATE); navigate('affiliate'); }} onCancel={() => navigate('landing')} onRegisterClick={() => navigate('affiliate-signup')} />;
      
      case 'login':
         return <LoginScreen role={UserRole.CUSTOMER} onLogin={() => { setRole(UserRole.CUSTOMER); navigate('dashboard'); }} onCancel={() => navigate('landing')} onRegisterClick={() => navigate('user-signup')} />;

      default: // 'landing'
        return <LandingPage onSignup={() => navigate('user-signup')} onAffiliate={() => navigate('affiliate-login')} onAffiliateInfo={() => navigate('affiliate-info')} navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {!currentPage.includes('login') && !currentPage.includes('signup') && !isRecoveryMode && (
        <Navbar role={role} setRole={handleSetRole} navigate={navigate} currentPage={currentPage} />
      )}
      <main>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;