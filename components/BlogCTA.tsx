
import React from 'react';
import { Bell, Zap, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from './Button';

export const BlogCTA: React.FC<{ onSignup: () => void }> = ({ onSignup }) => {
  return (
    <div className="my-12 bg-[#00305e] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden not-prose">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4 text-[#ffcc00] font-bold uppercase tracking-wider text-sm">
          <Zap size={18} /> Der entscheidende Zeitvorteil
        </div>
        
        <h3 className="text-2xl md:text-3xl font-bold mb-6">Keine Lust auf ständiges Neuladen?</h3>
        
        <p className="text-blue-100 mb-8 text-lg leading-relaxed">
          Während du diesen Artikel liest, könnten bereits neue ResortPässe freigeschaltet worden sein. 
          Unser Wächter prüft die Verfügbarkeit für dich – rund um die Uhr.
        </p>
        
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {[
            { icon: <Clock size={16}/>, text: "24/7 Live-Überwachung" },
            { icon: <Bell size={16}/>, text: "Sofort-Alarm per E-Mail & SMS" },
            { icon: <CheckCircle size={16}/>, text: "Direktlink zum Shop" },
            { icon: <Zap size={16}/>, text: "Keine Chance mehr verpassen" }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-sm font-medium bg-white/10 p-3 rounded-xl border border-white/10">
              <span className="text-[#ffcc00]">{item.icon}</span>
              {item.text}
            </div>
          ))}
        </div>
        
        <Button onClick={onSignup} size="lg" className="bg-[#ffcc00] text-[#00305e] hover:bg-yellow-400 font-bold border-0 shadow-lg w-full sm:w-auto">
          Jetzt Überwachung starten
          <ArrowRight size={20} />
        </Button>
      </div>
    </div>
  );
};
