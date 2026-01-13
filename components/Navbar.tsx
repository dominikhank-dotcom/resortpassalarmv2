
import React from 'react';
import { Ticket, User, LogOut, Menu, X, BookOpen } from 'lucide-react';
import { UserRole } from '../types';
import { supabase } from '../lib/supabase';

interface NavbarProps {
  role: UserRole;
  setRole: (role: UserRole) => void;
  navigate: (page: string) => void;
  currentPage: string;
  userName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ role, setRole, navigate, currentPage, userName }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleNav = (page: string) => {
    navigate(page);
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setRole(UserRole.GUEST);
    handleNav('landing');
  };

  return (
    <nav className="bg-[#00305e] border-b border-blue-900 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => handleNav('landing')}>
            <div className="bg-white/10 p-2 rounded-lg mr-3 backdrop-blur-sm">
              <Ticket className="h-6 w-6 text-[#ffcc00]" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">
              ResortPass<span className="text-[#ffcc00]">Alarm</span>
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={() => handleNav('blog')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium ${currentPage.includes('blog') ? 'text-[#ffcc00]' : 'text-blue-100 hover:text-white'}`}
            >
              <BookOpen size={18} />
              Blog
            </button>

            {role === UserRole.GUEST ? (
              <>
                {currentPage !== 'affiliate-info' && (
                  <>
                    <button 
                      onClick={() => handleNav('login')}
                      className="text-white hover:text-white/80 font-medium transition px-4"
                    >
                      Login
                    </button>
                    <button 
                      onClick={() => handleNav('user-signup')}
                      className="bg-[#ffcc00] text-[#00305e] px-4 py-2 rounded-lg hover:bg-yellow-400 font-bold transition shadow-sm"
                    >
                      Jetzt Starten
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <button 
                  onClick={() => handleNav(role === UserRole.AFFILIATE ? 'affiliate' : 'dashboard')} 
                  className={`font-medium ${currentPage !== 'landing' && !currentPage.includes('blog') ? 'text-[#ffcc00]' : 'text-blue-200'}`}
                >
                  Dashboard
                </button>
                <div className="h-6 w-px bg-blue-800 mx-2"></div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-blue-200 border border-blue-700">
                    <User size={16} />
                  </div>
                  <span className="text-sm font-medium text-blue-100">
                    {userName || (role === UserRole.AFFILIATE ? 'Partner Account' : 'Kunde')}
                  </span>
                </div>
                <button onClick={handleLogout} className="text-blue-300 hover:text-red-400 p-2">
                  <LogOut size={20} />
                </button>
              </>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-blue-200 hover:text-white">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-[#00305e] border-t border-blue-800 py-4 px-4 space-y-3 shadow-lg">
          <button onClick={() => handleNav('blog')} className="block w-full text-left py-2 text-blue-100">Blog</button>
          {role === UserRole.GUEST ? (
            <>
              <button onClick={() => handleNav('landing')} className="block w-full text-left py-2 text-blue-100">Home</button>
              <button onClick={() => handleNav('login')} className="block w-full text-center py-2 mt-2 bg-[#ffcc00] text-[#00305e] font-bold rounded-lg">Anmelden</button>
            </>
          ) : (
            <>
              <button onClick={() => handleNav(role === UserRole.AFFILIATE ? 'affiliate' : 'dashboard')} className="block w-full text-left py-2 font-bold text-[#ffcc00]">Dashboard</button>
              <button onClick={handleLogout} className="block w-full text-left py-2 text-red-400">Abmelden</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
