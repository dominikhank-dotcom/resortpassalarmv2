import React, { useState } from 'react';
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

// Simple mock Login screen with Forgot Password flow
const LoginScreen: React.FC<{ role: UserRole; onLogin: () => void; onCancel: () => void; onRegisterClick?: () => void }> = ({ role, onLogin, onCancel, onRegisterClick }) => {
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');

  const handleResetPassword = () => {
    if (!email) {
      alert("Bitte gib deine E-Mail Adresse ein.");
      return;
    }
    alert(`Ein Link zum Zurücksetzen des Passworts wurde an ${email} gesendet.`);
    setView('login');
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
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" 
              />
              <input 
                type="password" 
                placeholder="Passwort" 
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
                onClick={onLogin}
                className="w-full bg-[#00305e] text-white py-3 rounded-lg font-semibold hover:bg-blue-900 transition mt-2"
              >
                Anmelden
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
            
            <div className="mt-6 pt-6 border-t border-slate-100 text-xs text-slate-400">
              (Demo Modus: Klicke einfach auf "Anmelden")
            </div>
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