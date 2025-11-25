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
import { UserRole } from './types';
import { supabase } from './lib/supabase';
import { Loader2 } from 'lucide-react';

// Login Screen with Supabase Integration
const LoginScreen: React.FC<{ role: UserRole; onLogin: () => void; onCancel: () => void; onRegisterClick?: () => void }> = ({ role, onLogin, onCancel, onRegisterClick }) => {
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Bitte E-Mail und Passwort eingeben.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (data.user) {
        onLogin();
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.message || "Anmeldung fehlgeschlagen.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      alert("Bitte gib deine E-Mail Adresse ein.");
      return;
    }
    setIsLoading(true);
    try {
      await supabase.auth.resetPasswordForEmail(email, {
         redirectTo: window.location.origin + '/reset-password',
      });
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
               <div className="bg-red-50 text-red-600 text-sm p-3 rounded mb-4 border border-red-200">
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

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.GUEST);
  const [currentPage, setCurrentPage] = useState('landing');
  
  // Global Commission State
  const [globalCommissionRate, setGlobalCommissionRate] = useState(50);

  // Global Product URLs State
  const [productUrls, setProductUrls] = useState({
    gold: "https://tickets.mackinternational.de/de/ticket/resortpass-gold",
    silver: "https://tickets.mackinternational.de/de/ticket/resortpass-silver"
  });

  // Track Referral Link (30 Days Validity)
  useEffect(() => {
    // 1. Check if an existing code has expired
    const storedData = localStorage.getItem('resortpass_ref_data');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        if (Date.now() > parsed.expiry) {
          console.log("Referral Code expired, removing.");
          localStorage.removeItem('resortpass_ref_data');
        }
      } catch (e) {
        // Fallback for old format or errors
        localStorage.removeItem('resortpass_ref_data');
      }
    }

    // 2. Check for NEW code in URL
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    
    if (refCode) {
      console.log("New Partner Tracking active:", refCode);
      const expiry = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 Days
      const data = { code: refCode, expiry };
      localStorage.setItem('resortpass_ref_data', JSON.stringify(data));
      
      // Legacy cleanup if exists
      localStorage.removeItem('resortpass_referral'); 
    }
  }, []);

  // Check Auth State on Load
  useEffect(() => {
    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            // Ideally fetch user role from profile here
            // For MVP, we assume user stays on the role they last navigated to, 
            // or we could fetch the role from 'profiles' table.
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
        return <AffiliateSignupPage onLoginClick={() => navigate('affiliate-login')} onRegister={() => { setRole(UserRole.AFFILIATE); navigate('affiliate'); }} />;
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
      {!currentPage.includes('login') && !currentPage.includes('signup') && (
        <Navbar role={role} setRole={handleSetRole} navigate={navigate} currentPage={currentPage} />
      )}
      <main>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;