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
import { supabase, getEnv } from './lib/supabase';
import { CheckCircle } from 'lucide-react';
import { getSystemSettings } from './services/backendService';

// Simple mock Login screen with Forgot Password flow
const LoginScreen: React.FC<{ 
  role: UserRole; // The context we are logging into (e.g. ADMIN)
  setRole?: (role: UserRole) => void; // Function to update global app state
  onLogin: (detectedRole?: UserRole) => void; 
  onCancel: () => void; 
  onRegisterClick?: () => void;
  notification?: string | null;
}> = ({ role, setRole, onLogin, onCancel, onRegisterClick, notification }) => {
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);

  // Helper to get site URL
  const getSiteUrl = () => {
      return getEnv('VITE_SITE_URL') ?? window.location.origin;
  }

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    setShowResend(false);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check role in profiles
      if (data.user) {
         const { data: profile } = await supabase
           .from('profiles')
           .select('role')
           .eq('id', data.user.id)
           .single();
         
         if (profile) {
            const userRole = profile.role as UserRole;

            // PERMISSION CHECK for ADMIN only
            // For Customer/Affiliate mix-ups, we will handle redirection in onLogin
            if (role === UserRole.ADMIN && userRole !== UserRole.ADMIN) {
                await supabase.auth.signOut(); // Logout immediately
                throw new Error("Keine Berechtigung für diesen Bereich.");
            }

            // Update global state
            if (setRole) {
                setRole(userRole);
            }

            // Trigger parent navigation, passing the detected role
            onLogin(userRole); 
         } else {
             // Fallback if profile missing
             if (setRole) setRole(UserRole.CUSTOMER);
             onLogin(UserRole.CUSTOMER);
         }
      }
    } catch (err: any) {
      console.error("Login Error:", err.message);
      
      // Error Translation & Handling
      if (err.message.includes("Email not confirmed")) {
        setError("E-Mail Adresse ist noch nicht bestätigt.");
        setShowResend(true);
      } else if (err.message.includes("Invalid login credentials")) {
        setError("E-Mail Adresse oder Passwort falsch.");
      } else {
        setError(err.message || "Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${getSiteUrl()}/login`
        }
      });
      
      if (error) throw error;
      alert(`Bestätigungs-Link wurde erneut an ${email} gesendet. Bitte prüfe auch deinen Spam-Ordner.`);
      setShowResend(false);
      setError(null);
    } catch (err: any) {
      alert("Fehler beim Senden: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = () => {
    if (!email) {
      alert("Bitte gib deine E-Mail Adresse ein.");
      return;
    }
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getSiteUrl()}/update-password`,
    }).then(({ error }) => {
      if (error) alert(error.message);
      else alert(`Ein Link zum Zurücksetzen des Passworts wurde an ${email} gesendet.`);
      setView('login');
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border-t-4 border-[#00305e]">
        
        {view === 'login' ? (
          <>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              {role === UserRole.AFFILIATE ? 'Partner Login' : role === UserRole.ADMIN ? 'Admin Login' : 'Kunden Login'}
            </h2>
            
            {notification && (
              <div className="bg-green-50 text-green-700 p-3 rounded-lg border border-green-200 mb-4 flex items-center gap-2 text-sm text-left">
                 <CheckCircle size={16} className="shrink-0" />
                 {notification}
              </div>
            )}

            <p className="text-slate-500 mb-8">Bitte melde dich an, um fortzufahren.</p>
            
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
              
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 mt-2">
                  {error}
                </div>
              )}

              {showResend && (
                <button 
                  onClick={handleResendConfirmation}
                  className="bg-red-100 text-red-700 font-bold border border-red-200 rounded-lg p-3 text-sm hover:bg-red-200 block w-full transition-colors"
                >
                  Bestätigungs-Mail erneut senden
                </button>
              )}

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
                className="w-full bg-[#00305e] text-white py-3 rounded-lg font-semibold hover:bg-blue-900 transition mt-2 disabled:opacity-50"
              >
                {isLoading ? 'Lade...' : 'Anmelden'}
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
              Kein Problem. Gib deine E-Mail Adresse ein und wir senden dir einen Link, um dein Passwort zurückzusetzen.
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
                className="w-full bg-[#00305e] text-white py-3 rounded-lg font-semibold hover:bg-blue-900 transition"
              >
                Link zum Zurücksetzen senden
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
  const [userName, setUserName] = useState<string>(''); // Added state for User Name
  const [currentPage, setCurrentPage] = useState('landing');
  const [loginNotification, setLoginNotification] = useState<string | null>(null);
  
  // Global Commission & Price State
  const [globalCommissionRate, setGlobalCommissionRate] = useState(50);
  const [prices, setPrices] = useState({ new: 1.99, existing: 1.99 });

  // Global Product URLs State
  const [productUrls, setProductUrls] = useState({
    gold: "https://tickets.mackinternational.de/de/ticket/resortpass-gold",
    silver: "https://tickets.mackinternational.de/de/ticket/resortpass-silver"
  });

  // Load System Settings on Mount
  useEffect(() => {
    const loadSettings = async () => {
       const settings = await getSystemSettings();
       if (settings) {
          if (settings.global_commission_rate) {
             setGlobalCommissionRate(Number(settings.global_commission_rate));
          }
          if (settings.price_new_customers) {
             setPrices(p => ({...p, new: Number(settings.price_new_customers)}));
          }
          if (settings.price_existing_customers) {
             setPrices(p => ({...p, existing: Number(settings.price_existing_customers)}));
          }
       }
    };
    loadSettings();
  }, []);

  // Track Referral Link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      console.log("Partner Tracking active:", refCode);
      localStorage.setItem('resortpass_referral', refCode);
    }
  }, []);

  // INITIAL AUTH & ROUTING CHECK
  useEffect(() => {
    // 1. Check for Hash (Email Confirmation / Password Reset)
    const hash = window.location.hash;
    const pathname = window.location.pathname;

    if (hash && (hash.includes('access_token') || hash.includes('type=recovery') || hash.includes('type=signup'))) {
        console.log("Auth redirect detected.");
        if (hash.includes('type=signup') || hash.includes('access_token')) {
            setLoginNotification("E-Mail erfolgreich bestätigt! Du kannst dich jetzt einloggen.");
        }
        setCurrentPage('login');
    } else if (pathname === '/login') {
        setCurrentPage('login');
    }

    // 2. Check Session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Fetch role AND Name
        const { data: profile } = await supabase.from('profiles').select('role, first_name, last_name, welcome_mail_sent').eq('id', session.user.id).single();
        
        if (profile) {
            if (profile.role) setRole(profile.role as UserRole);
            if (profile.first_name && profile.last_name) setUserName(`${profile.first_name} ${profile.last_name}`);
            
            // CHECK WELCOME MAIL: Send if not sent yet
            if (profile.welcome_mail_sent === false && profile.role === 'CUSTOMER') {
               console.log("Welcome mail not sent yet. Triggering...");
               try {
                  fetch('/api/trigger-welcome', {
                      method: 'POST',
                      headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify({ userId: session.user.id, email: session.user.email, firstName: profile.first_name })
                  });
               } catch (e) { console.error(e); }
            }

            // Only redirect if we are not already on a specific intended page
            if (currentPage === 'landing' || currentPage === 'login' || currentPage === 'affiliate-login' || currentPage === 'admin-login') {
                if (profile.role === 'ADMIN') setCurrentPage('admin-dashboard');
                else if (profile.role === 'AFFILIATE') setCurrentPage('affiliate');
                else if (profile.role === 'CUSTOMER') setCurrentPage('dashboard');
            }
        } else {
             // Fallback if profile missing
             setRole(UserRole.CUSTOMER);
        }
      }
    };
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
            setRole(UserRole.GUEST);
            setUserName('');
            setCurrentPage('landing');
        } else if (event === 'SIGNED_IN' && session) {
            // Re-fetch logic (same as above for robustness)
             supabase.from('profiles').select('role, first_name, last_name, welcome_mail_sent').eq('id', session.user.id).single()
             .then(({ data }) => {
                if (data) {
                    if (data.role) setRole(data.role as UserRole);
                    if (data.first_name && data.last_name) setUserName(`${data.first_name} ${data.last_name}`);
                    
                    // Welcome Mail Check on fresh login
                    if (data.welcome_mail_sent === false && data.role === 'CUSTOMER') {
                       fetch('/api/trigger-welcome', {
                          method: 'POST',
                          headers: {'Content-Type': 'application/json'},
                          body: JSON.stringify({ userId: session.user.id, email: session.user.email, firstName: data.first_name })
                       });
                    }

                    if (data.role === 'ADMIN') setCurrentPage('admin-dashboard');
                    else if (data.role === 'AFFILIATE') setCurrentPage('affiliate');
                    else if (data.role === 'CUSTOMER') setCurrentPage('dashboard');
                }
             });
        }
    });

    return () => subscription.unsubscribe();
  }, []);

  const navigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
    // Clear notification when navigating away
    if (page !== 'login') setLoginNotification(null);
  };

  const handleSetRole = (newRole: UserRole) => {
    setRole(newRole);
  };

  // Smart Navigation after Login: Redirects based on actual role, not just the login page
  const handlePostLogin = (detectedRole?: UserRole) => {
      // Use the detected role from LoginScreen if available, otherwise fallback to state
      const targetRole = detectedRole || role;

      if (targetRole === UserRole.ADMIN) navigate('admin-dashboard');
      else if (targetRole === UserRole.AFFILIATE) navigate('affiliate');
      else navigate('dashboard');
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
            price={prices.new}
            navigate={navigate}
          />
        );
      case 'affiliate-signup':
        return <AffiliateSignupPage onLoginClick={() => navigate('affiliate-login')} onRegister={() => { /* Wait for auth listener */ }} onNavigate={navigate} />;
      case 'affiliate-login':
        return <LoginScreen role={UserRole.AFFILIATE} setRole={handleSetRole} onLogin={handlePostLogin} onCancel={() => navigate('landing')} onRegisterClick={() => navigate('affiliate-signup')} notification={loginNotification} />;
      case 'user-signup':
        return <UserSignupPage onLoginClick={() => navigate('login')} onRegister={() => { /* Wait for auth listener */ }} onNavigate={navigate} />;
      case 'admin-login':
        return <LoginScreen role={UserRole.ADMIN} setRole={handleSetRole} onLogin={handlePostLogin} onCancel={() => navigate('landing')} notification={loginNotification} />;
      case 'admin-dashboard':
         return role === UserRole.ADMIN 
          ? <AdminDashboard 
              commissionRate={globalCommissionRate} 
              onUpdateCommission={setGlobalCommissionRate}
              prices={prices}
              onUpdatePrices={setPrices}
              productUrls={productUrls}
              onUpdateProductUrls={setProductUrls}
            /> 
          : <LoginScreen role={UserRole.ADMIN} setRole={handleSetRole} onLogin={handlePostLogin} onCancel={() => navigate('landing')} notification={loginNotification} />;
      
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
        if (role === UserRole.CUSTOMER) return <UserDashboard navigate={navigate} productUrls={productUrls} prices={prices} />;
        return <LoginScreen role={UserRole.CUSTOMER} setRole={handleSetRole} onLogin={handlePostLogin} onCancel={() => navigate('landing')} onRegisterClick={() => navigate('user-signup')} notification={loginNotification} />;
      
      case 'affiliate':
        if (role === UserRole.AFFILIATE) return <AffiliateDashboard commissionRate={globalCommissionRate} price={prices.new} />;
        return <LoginScreen role={UserRole.AFFILIATE} setRole={handleSetRole} onLogin={handlePostLogin} onCancel={() => navigate('landing')} onRegisterClick={() => navigate('affiliate-signup')} notification={loginNotification} />;
      
      case 'login':
         return <LoginScreen role={UserRole.CUSTOMER} setRole={handleSetRole} onLogin={handlePostLogin} onCancel={() => navigate('landing')} onRegisterClick={() => navigate('user-signup')} notification={loginNotification} />;

      default: // 'landing'
        return <LandingPage onSignup={() => navigate('user-signup')} onAffiliate={() => navigate('affiliate-login')} onAffiliateInfo={() => navigate('affiliate-info')} navigate={navigate} price={prices.new} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {!currentPage.includes('login') && !currentPage.includes('signup') && (
        <Navbar role={role} setRole={handleSetRole} navigate={navigate} currentPage={currentPage} userName={userName} />
      )}
      <main>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;