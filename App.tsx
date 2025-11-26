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

// Simple mock Login screen with Forgot Password flow
const LoginScreen: React.FC<{ role: UserRole; onLogin: () => void; onCancel: () => void; onRegisterClick?: () => void }> = ({ role, onLogin, onCancel, onRegisterClick }) => {
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);

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
            // In a real app we might want to check if role matches requested role context
            onLogin(); 
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
        setError("Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
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
          emailRedirectTo: `${window.location.origin}/login`
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
      redirectTo: `${window.location.origin}/update-password`,
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
                  className="text-sm text-[#00305e] font-bold underline hover:text-blue-700 block w-full py-2"
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
  const [currentPage, setCurrentPage] = useState('landing');
  
  // Global Commission State to sync between Admin and Affiliate Page
  const [globalCommissionRate, setGlobalCommissionRate] = useState(50);

  // Global Product URLs State
  const [productUrls, setProductUrls] = useState({
    gold: "https://tickets.mackinternational.de/de/ticket/resortpass-gold",
    silver: "https://tickets.mackinternational.de/de/ticket/resortpass-silver"
  });

  // Track Referral Link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      console.log("Partner Tracking active:", refCode);
      localStorage.setItem('resortpass_referral', refCode);
    }
  }, []);

  // Check auth session on load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Fetch role
        supabase.from('profiles').select('role').eq('id', session.user.id).single()
          .then(({ data }) => {
            if (data?.role) {
                setRole(data.role as UserRole);
                if (data.role === 'ADMIN') setCurrentPage('admin-dashboard');
                else if (data.role === 'AFFILIATE') setCurrentPage('affiliate');
                else if (data.role === 'CUSTOMER') setCurrentPage('dashboard');
            }
          });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) {
            setRole(UserRole.GUEST);
            setCurrentPage('landing');
        }
    });

    return () => subscription.unsubscribe();
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
        return <AffiliateSignupPage onLoginClick={() => navigate('affiliate-login')} onRegister={() => { /* Wait for auth listener */ }} />;
      case 'affiliate-login':
        return <LoginScreen role={UserRole.AFFILIATE} onLogin={() => { /* Handled by internal login logic */ }} onCancel={() => navigate('landing')} onRegisterClick={() => navigate('affiliate-signup')} />;
      case 'user-signup':
        return <UserSignupPage onLoginClick={() => navigate('login')} onRegister={() => { /* Wait for auth listener */ }} onNavigate={navigate} />;
      case 'admin-login':
        return <LoginScreen role={UserRole.ADMIN} onLogin={() => { /* Handled by internal login logic */ }} onCancel={() => navigate('landing')} />;
      case 'admin-dashboard':
         return role === UserRole.ADMIN 
          ? <AdminDashboard 
              commissionRate={globalCommissionRate} 
              onUpdateCommission={setGlobalCommissionRate} 
              productUrls={productUrls}
              onUpdateProductUrls={setProductUrls}
            /> 
          : <LoginScreen role={UserRole.ADMIN} onLogin={() => { /* Handled by internal login logic */ }} onCancel={() => navigate('landing')} />;
      
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
        return <LoginScreen role={UserRole.CUSTOMER} onLogin={() => { /* Handled by internal login logic */ }} onCancel={() => navigate('landing')} onRegisterClick={() => navigate('user-signup')} />;
      
      case 'affiliate':
        if (role === UserRole.AFFILIATE) return <AffiliateDashboard />;
        return <LoginScreen role={UserRole.AFFILIATE} onLogin={() => { /* Handled by internal login logic */ }} onCancel={() => navigate('landing')} onRegisterClick={() => navigate('affiliate-signup')} />;
      
      case 'login':
         return <LoginScreen role={UserRole.CUSTOMER} onLogin={() => { /* Handled by internal login logic */ }} onCancel={() => navigate('landing')} onRegisterClick={() => navigate('user-signup')} />;

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