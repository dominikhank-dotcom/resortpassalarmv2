import React from 'react';

interface FooterProps {
  navigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="bg-[#001529] text-blue-200 py-12 border-t border-blue-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-center md:text-left">
          <h3 className="text-white font-bold text-lg mb-2">ResortPass<span className="text-[#ffcc00]">Alarm</span></h3>
          <p className="text-sm text-blue-300 max-w-xs">
            Überwachung für Europa-Park ResortPass Gold & Silver.
          </p>
          <p className="text-xs text-blue-400 mt-2">
            support@resortpassalarm.com
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 text-sm font-medium">
          <button onClick={() => navigate('imprint')} className="hover:text-white transition">Impressum</button>
          <button onClick={() => navigate('privacy')} className="hover:text-white transition">Datenschutz</button>
          <button onClick={() => navigate('terms')} className="hover:text-white transition">AGB</button>
          <button onClick={() => navigate('revocation')} className="hover:text-white transition">Widerrufsrecht</button>
          <button onClick={() => navigate('affiliate-info')} className="hover:text-white transition">Partnerprogramm Infos</button>
          <button onClick={() => navigate('affiliate-login')} className="hover:text-white transition">Partner Login</button>
          <button onClick={() => navigate('admin-login')} className="text-[#002a52] hover:text-blue-500 transition text-xs">Admin Login</button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 text-center mt-12 pt-8 border-t border-blue-800/50">
         <p className="text-xs text-blue-400">
          Keine offizielle Seite des Europa-Park Resorts.
         </p>
      </div>
    </footer>
  );
};