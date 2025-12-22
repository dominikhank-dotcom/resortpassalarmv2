
import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { UserDashboard } from './pages/UserDashboard';
import { AffiliateDashboard } from './pages/AffiliateDashboard';
import { AffiliateInfoPage } from './pages/AffiliateInfoPage';
import { AffiliateSignupPage } from './pages/AffiliateSignupPage';
import { UserSignupPage } from './pages/UserSignupPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { ImprintPage, PrivacyPage, TermsPage, RevocationPage } from './pages/LegalPages';
import { BlogOverviewPage } from './pages/BlogOverviewPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { UserRole } from './types';
import { supabase, getEnv } from './lib/supabase';
import { CheckCircle, Loader2 } from 'lucide-react';
import { getSystemSettings } from './services/backendService';
import { CookieBanner } from './components/CookieBanner';

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

            // --- STRICT ROLE SEPARATION CHECK ---
            if (role !== UserRole.GUEST && userRole !== role) {
                const roleNames: Record<string, string> = {
                    [UserRole.ADMIN]: 'Admin',
                    [UserRole.AFFILIATE]: 'Partner',
                    [UserRole.CUSTOMER]: 'Kunde'
                };
                
                const expected = roleNames[role] || role;
                const actual = roleNames[userRole] || userRole;

                // LOGOUT IMMEDIATELY
                await supabase.auth.signOut();
                
                throw new Error(`Falscher Bereich. Du hast versucht dich mit einem ${actual}-Konto im ${expected}-Login anzumelden.`);
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
              <button onClick={onCancel} className="text-slate-400 text-sm hover:text-slate-600 block w-full py-2 hover:underline">
                Zur Startseite
              </button>
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
  
  // LAZY INITIALIZATION of Current Page
  const [currentPage, setCurrentPage] = useState(() => {
     const path = window.location.pathname.replace(/\/$/, ""); 
     
     if (path === '/dashboard') return 'dashboard';
     if (path === '/affiliate') return 'affiliate';
     if (path === '/affiliate-login') return 'affiliate-login';
     if (path === '/admin-dashboard') return 'admin-dashboard';
     if (path === '/user-signup') return 'user-signup';
     if (path === '/affiliate-info') return 'affiliate-info';
     if (path === '/blog') return 'blog';
     if (path.startsWith('/blog/')) return `blog-post:${path.split('/blog/')[1]}`;
     
     // Legal Pages
     if (path === '/imprint') return 'imprint';
     if (path === '/privacy') return 'privacy';
     if (path === '/terms') return 'terms';
     if (path === '/revocation') return 'revocation';

     return 'landing';
  });
  
  const [loginNotification, setLoginNotification] = useState<string | null>(null);
  const [isAppInitializing, setIsAppInitializing] = useState(true); // Global Loading State
  
  // Use ref to access current page inside closures/effects if needed
  const currentPageRef = useRef(currentPage);
  useEffect(() => { currentPageRef.current = currentPage; }, [currentPage]);
  
  // Global Commission & Price State
  const [globalCommissionRate, setGlobalCommissionRate] = useState(50);
  const [prices, setPrices] = useState({ new: 1.99, existing: 1.99 });

  // Global Product URLs State
  const [productUrls, setProductUrls] = useState({
    gold: "https://tickets.mackinternational.de/de/ticket/resortpass-gold",
    silver: "https://tickets.mackinternational.de/de/ticket/resortpass-silver"
  });

  // Handle Browser Back/Forward Buttons
  useEffect(() => {
      const handlePopState = () => {
          const path = window.location.pathname.replace(/\/$/, "");
          if (path === '/dashboard') setCurrentPage('dashboard');
          else if (path === '/affiliate') setCurrentPage('affiliate');
          else if (path === '/affiliate-login') setCurrentPage('affiliate-login');
          else if (path === '/user-signup') setCurrentPage('user-signup');
          else if (path === '/affiliate-info') setCurrentPage('affiliate-info');
          else if (path === '/blog') setCurrentPage('blog');
          else if (path.startsWith('/blog/')) setCurrentPage(`blog-post:${path.split('/blog/')[1]}`);
          else if (path === '/imprint') setCurrentPage('imprint');
          else if (path === '/privacy') setCurrentPage('privacy');
          else if (path === '/terms') setCurrentPage('terms');
          else if (path === '/revocation') setCurrentPage('revocation');
          else setCurrentPage('landing');
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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
    const hash = window.location.hash;
    const pathname = window.location.pathname;

    if (hash && (hash.includes('access_token') || hash.includes('type=recovery') || hash.includes('type=signup'))) {
        if (hash.includes('type=signup') || hash.includes('access_token')) {
            setLoginNotification("E-Mail erfolgreich bestätigt! Du kannst dich jetzt einloggen.");
        }
        if (pathname === '/affiliate-login') {
            setCurrentPage('affiliate-login');
        } else {
            setCurrentPage('login');
        }
    } else if (pathname === '/login') {
        setCurrentPage('login');
    } else if (pathname === '/affiliate-login') {
        setCurrentPage('affiliate-login');
    }

    const checkSession = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const isStripeReturn = urlParams.get('payment_success') || urlParams.get('portal_return');

      let maxAttempts = isStripeReturn ? 15 : 3; 
      let attempts = 0;
      let sessionData = null;

      while (attempts < maxAttempts) {
          try {
            const { data } = await supabase.auth.getSession();
            if (data.session) {
                sessionData = data;
                break;
            }
          } catch (e) { console.error("Session check error", e); }
          
          if (isStripeReturn) {
              await new Promise(resolve => setTimeout(resolve, 1500)); 
          } else {
              await new Promise(resolve => setTimeout(resolve, 100)); 
          }
          attempts++;
      }

      if (sessionData && sessionData.session) {
          const user = sessionData.session.user;
          const { data: profile } = await supabase.from('profiles').select('role, first_name, last_name').eq('id', user.id).single();
          
          if (profile) {
              if (profile.role) setRole(profile.role as UserRole);
              if (profile.first_name && profile.last_name) setUserName(`${profile.first_name} ${profile.last_name}`);
              
              if (currentPage === 'landing' || currentPage === 'login' || currentPage === 'affiliate-login' || currentPage === 'admin-login') {
                  if (profile.role === 'ADMIN') setCurrentPage('admin-dashboard');
                  else if (profile.role === 'AFFILIATE') setCurrentPage('affiliate');
                  else if (profile.role === 'CUSTOMER') setCurrentPage('dashboard');
              }

              if (profile.role === 'CUSTOMER') {
                  const storageKey = `welcome_triggered_${user.id}`;
                  const hasTriggered = localStorage.getItem(storageKey);

                  if (!hasTriggered) {
                      localStorage.setItem(storageKey, 'true'); 
                      fetch('/api/trigger-welcome', {
                          method: 'POST',
                          headers: {'Content-Type': 'application/json'},
                          body: JSON.stringify({ 
                              userId: user.id, 
                              email: user.email, 
                              firstName: profile.first_name || user.user_metadata?.first_name 
                          })
                      }).catch(err => console.error("Welcome trigger failed", err));
                  }
              }
          } 
      } else {
          if (isStripeReturn && urlParams.get('portal_return')) {
              setLoginNotification("Willkommen zurück! Bitte logge dich kurz ein, um die Synchronisierung abzuschließen.");
          }
      }
      setIsAppInitializing(false);
    };
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
            setRole(UserRole.GUEST);
            setUserName('');
            const page = currentPageRef.current;
            const protectedPages = ['dashboard', 'affiliate', 'admin-dashboard'];
            const loginPages = ['login', 'affiliate-login', 'admin-login'];
            if (!protectedPages.includes(page) && !loginPages.includes(page)) {
                setCurrentPage('landing');
            }
        } else if (event === 'SIGNED_IN' && session) {
             supabase.from('profiles').select('role, first_name, last_name').eq('id', session.user.id).single()
             .then(({ data }) => {
                if (data) {
                    if (data.role) setRole(data.role as UserRole);
                    if (data.first_name && data.last_name) setUserName(`${data.first_name} ${data.last_name}`);
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
    if (page !== 'login' && page !== 'affiliate-login') setLoginNotification(null);
    
    let path = '/';
    if (page === 'landing') path = '/';
    else if (page.startsWith('blog-post:')) path = `/blog/${page.split(':')[1]}`;
    else path = `/${page}`;
    
    if (window.location.pathname !== path) {
        window.history.pushState(null, '', path);
    }
  };

  const handleSetRole = (newRole: UserRole) => {
    setRole(newRole);
  };

  const handlePostLogin = (detectedRole?: UserRole) => {
      const targetRole = detectedRole || role;
      if (targetRole === UserRole.ADMIN) navigate('admin-dashboard');
      else if (targetRole === UserRole.AFFILIATE) navigate('affiliate');
      else navigate('dashboard');
  };

  const renderContent = () => {
    if (currentPage === 'blog') return <BlogOverviewPage navigate={navigate} />;
    if (currentPage.startsWith('blog-post:')) return <BlogPostPage slug={currentPage.split(':')[1]} navigate={navigate} />;

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
        return <AffiliateSignupPage onLoginClick={() => navigate('affiliate-login')} onRegister={() => {}} onNavigate={navigate} commissionRate={globalCommissionRate} />;
      case 'affiliate-login':
        return <LoginScreen role={UserRole.AFFILIATE} setRole={handleSetRole} onLogin={handlePostLogin} onCancel={() => navigate('landing')} onRegisterClick={() => navigate('affiliate-signup')} notification={loginNotification} />;
      case 'user-signup':
        return <UserSignupPage onLoginClick={() => navigate('login')} onRegister={() => {}} onNavigate={navigate} />;
      case 'admin-login':
        return <LoginScreen role={UserRole.ADMIN} setRole={handleSetRole} onLogin={handlePostLogin} onCancel={() => navigate('landing')} notification={loginNotification} />;
      case 'admin-dashboard':
         return role === UserRole.ADMIN 
          ? <AdminDashboard commissionRate={globalCommissionRate} onUpdateCommission={setGlobalCommissionRate} prices={prices} onUpdatePrices={setPrices} productUrls={productUrls} onUpdateProductUrls={setProductUrls} /> 
          : <LoginScreen role={UserRole.ADMIN} setRole={handleSetRole} onLogin={handlePostLogin} onCancel={() => navigate('landing')} notification={loginNotification} />;
      case 'imprint': return <ImprintPage onBack={() => navigate('landing')} />;
      case 'privacy': return <PrivacyPage onBack={() => navigate('landing')} />;
      case 'terms': return <TermsPage onBack={() => navigate('landing')} />;
      case 'revocation': return <RevocationPage onBack={() => navigate('landing')} />;
      case 'dashboard':
        if (role === UserRole.CUSTOMER) return <UserDashboard navigate={navigate} productUrls={productUrls} prices={prices} />;
        return <LoginScreen role={UserRole.CUSTOMER} setRole={handleSetRole} onLogin={handlePostLogin} onCancel={() => navigate('landing')} onRegisterClick={() => navigate('user-signup')} notification={loginNotification} />;
      case 'affiliate':
        if (role === UserRole.AFFILIATE) return <AffiliateDashboard commissionRate={globalCommissionRate} price={prices.new} />;
        return <LoginScreen role={UserRole.AFFILIATE} setRole={handleSetRole} onLogin={handlePostLogin} onCancel={() => navigate('landing')} onRegisterClick={() => navigate('affiliate-signup')} notification={loginNotification} />;
      case 'login':
         return <LoginScreen role={UserRole.CUSTOMER} setRole={handleSetRole} onLogin={handlePostLogin} onCancel={() => navigate('landing')} onRegisterClick={() => navigate('user-signup')} notification={loginNotification} />;
      default: 
        return <LandingPage onSignup={() => navigate('user-signup')} onAffiliate={() => navigate('affiliate-login')} onAffiliateInfo={() => navigate('affiliate-info')} navigate={navigate} price={prices.new} />;
    }
  };

  if (isAppInitializing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
         <div className="text-center">
             <Loader2 size={48} className="animate-spin text-[#00305e] mx-auto mb-4" />
             <h2 className="text-slate-900 font-bold text-lg">Lade System...</h2>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {!currentPage.includes('login') && !currentPage.includes('signup') && (
        <Navbar role={role} setRole={handleSetRole} navigate={navigate} currentPage={currentPage} userName={userName} />
      )}
      <main>
        {renderContent()}
      </main>
      <CookieBanner navigate={navigate} />
    </div>
  );
};

export default App;
