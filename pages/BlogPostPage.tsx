
import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Calendar, Share2, ChevronRight, Check, Zap, Bell, Clock, Info, ShieldCheck, AlertTriangle, Star, DollarSign, Target, Calculator, AlertCircle, X, HelpCircle, CheckCircle, Ticket, ShoppingBag, UserCheck, Timer, MousePointer2, Map, Bed, Users, TrendingUp, Loader2, BookOpen } from 'lucide-react';
import { Button } from '../components/Button';
import { Footer } from '../components/Footer';

interface BlogPostPageProps {
  slug: string;
  navigate: (page: string) => void;
}

const IconMap: Record<string, React.ReactNode> = {
  'BookOpen': <BookOpen size={24} />,
  'Star': <Star size={24} />,
  'Target': <Target size={24} />,
  'Calculator': <Calculator size={24} />,
  'FileText': <Users size={24} />,
  'ShoppingBag': <ShoppingBag size={24} />,
  'AlertCircle': <AlertCircle size={24} />,
  'Users': <Users size={24} />,
  'DollarSign': <DollarSign size={24} />,
  'Shield': <ShieldCheck size={24} />,
  'Ticket': <Ticket size={24} />,
  'Map': <Map size={24} />
};

export const BlogPostPage: React.FC<BlogPostPageProps> = ({ slug, navigate }) => {
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [others, setOthers] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/blog-posts?slug=${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.id) setPost(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    fetch('/api/blog-posts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOthers(data.filter(p => p.slug !== slug).slice(0, 2));
      })
      .catch(console.error);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-slate-500">Lade Artikel...</p>
      </div>
    );
  }
  
  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Beitrag nicht gefunden</h2>
        <Button onClick={() => navigate('blog')}>Zum Blog zurück</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-lato">
      <style>{`
        .blog-styled-content {
          color: #2d3748;
          line-height: 1.8;
        }
        .blog-styled-content h2 {
          font-family: 'Archivo', sans-serif;
          font-size: 2rem;
          color: #16423c;
          margin: 3rem 0 1.5rem 0;
          font-weight: 800;
        }
        .blog-styled-content h3 {
          font-family: 'Archivo', sans-serif;
          font-size: 1.5rem;
          color: #6a9c89;
          margin: 2rem 0 1rem 0;
          font-weight: 700;
        }
        .blog-styled-content p { margin-bottom: 1.5rem; font-size: 1.1rem; }
        
        .tldr {
          background: linear-gradient(135deg, #c4dad2 0%, #e9efec 100%);
          padding: 2.5rem;
          border-radius: 20px;
          margin: 3rem 0;
          border-left: 8px solid #6a9c89;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }
        .tldr h2 { margin-top: 0; font-size: 1.6rem; color: #16423c; }
        .tldr-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-top: 1.5rem; }
        .tldr-item { background: white; padding: 1.2rem; border-radius: 12px; text-align: center; font-weight: bold; color: #16423c; border: 1px solid rgba(0,0,0,0.05); }

        .calculator-box {
          background: white;
          padding: 2.5rem;
          border-radius: 20px;
          box-shadow: 0 15px 40px rgba(0,0,0,0.08);
          margin: 3rem 0;
          border-top: 5px solid #6a9c89;
        }
        .calculation-row { display: flex; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid #e2e8f0; font-size: 1.1rem; }
        .calculation-row .value { font-weight: 800; color: #16423c; font-family: 'Archivo', sans-serif; }
        .result-highlight { background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 2rem; border-radius: 15px; text-align: center; margin-top: 2rem; }
        .result-highlight .big-number { font-size: 3.5rem; font-weight: 900; font-family: 'Archivo', sans-serif; display: block; line-height: 1; margin: 0.5rem 0; }

        .comparison-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 3rem 0; }
        .comparison-card { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.07); transition: transform 0.3s ease; border: 1px solid #f1f5f9; }
        .comparison-card:hover { transform: translateY(-8px); }
        .card-header { padding: 1.5rem; text-align: center; color: white; }
        .card-header.silver { background: linear-gradient(135deg, #718096 0%, #4a5568 100%); }
        .card-header.gold { background: linear-gradient(135deg, #d4af37 0%, #c19a2e 100%); }
        .card-header h4 { font-family: 'Archivo', sans-serif; font-size: 1.8rem; font-weight: 800; }
        .card-body { padding: 2rem; }
        .card-body ul { list-style: none; padding: 0; }
        .card-body li { padding: 0.8rem 0; padding-left: 2rem; position: relative; border-bottom: 1px solid #f1f5f9; }
        .card-body li::before { content: '✓'; position: absolute; left: 0; color: #48bb78; font-weight: bold; }

        .info-banner { background: #bee3f8; padding: 1.5rem; border-radius: 12px; margin: 2rem 0; border-left: 5px solid #3182ce; color: #2c5282; }
        .tip-banner { background: #c6f6d5; padding: 1.5rem; border-radius: 12px; margin: 2rem 0; border-left: 5px solid #38a169; color: #22543d; }
        .warning-banner { background: #feebc8; padding: 1.5rem; border-radius: 12px; margin: 2rem 0; border-left: 5px solid #dd6b20; color: #7c2d12; }

        .scenario-card { background: white; padding: 2rem; border-radius: 15px; border-left: 6px solid #6a9c89; box-shadow: 0 8px 20px rgba(0,0,0,0.05); margin: 2rem 0; }
        .scenario-verdict { background: #e9efec; padding: 1rem; border-radius: 10px; margin-top: 1.5rem; font-weight: 700; color: #16423c; }

        @media (max-width: 768px) {
          .comparison-cards { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* NEW HERO */}
      <div className="bg-gradient-to-br from-[#16423c] to-[#0f2e2a] text-white pt-24 pb-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
            <span className="text-[40rem] font-black font-archivo">€</span>
        </div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
            <button 
              onClick={() => navigate('blog')}
              className="inline-flex items-center text-emerald-200/60 hover:text-white mb-8 transition-colors group"
            >
              <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Zurück zur Übersicht
            </button>
            <div className="flex justify-center gap-4 mb-6">
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                    {post.category}
                </span>
                <span className="text-emerald-200/50 text-xs flex items-center gap-1 font-bold">
                    <Calendar size={12} /> {post.date}
                </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-archivo font-extrabold leading-tight mb-8">
              {post.title}
            </h1>
            <p className="text-xl text-emerald-100/80 max-w-2xl mx-auto leading-relaxed">
              {post.excerpt}
            </p>
        </div>
      </div>

      <div className="flex-grow py-12 px-4 sm:px-6 lg:px-8 -mt-20">
        <div className="max-w-4xl mx-auto bg-white rounded-[40px] shadow-2xl p-8 md:p-16 border border-slate-100">
          
          {/* Content Area */}
          <div className="blog-styled-content mb-16">
            <div dangerouslySetInnerHTML={{ __html: post.content }}></div>
          </div>

          {/* CTA Box */}
          <div className="my-16 bg-[#001529] rounded-[30px] p-10 text-white shadow-2xl relative overflow-hidden not-prose border-l-[10px] border-[#ffcc00]">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500 rounded-full blur-[100px] opacity-10 -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6 text-[#ffcc00] font-bold uppercase tracking-widest text-sm">
                <Zap size={20} fill="currentColor" /> Der entscheidende Zeitvorteil
                </div>
                <h3 className="text-3xl font-archivo font-extrabold mb-6 text-white">ResortPass ausverkauft?</h3>
                <p className="text-blue-100 mb-10 text-lg leading-relaxed max-w-2xl">
                Verliere keine Zeit mit manuellem Suchen. Unser Wächter überwacht die Server 24/7 für dich und schickt dir sofort eine <strong>SMS & E-Mail</strong>, wenn neue Kontingente frei werden.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={() => navigate('user-signup')} className="bg-[#5046e5] hover:bg-indigo-700 text-white border-0 px-10 py-5 font-bold text-xl shadow-lg shadow-indigo-500/20">
                        Jetzt Alarm aktivieren <ArrowRight size={20} className="ml-2" />
                    </Button>
                    <div className="flex items-center gap-4 px-4">
                         <div className="flex -space-x-2">
                             {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-[#001529] bg-slate-400"></div>)}
                         </div>
                         <span className="text-xs text-blue-300 font-medium">Bereits 4.000+ Nutzer</span>
                    </div>
                </div>
            </div>
          </div>

          {/* Share & Info */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-10 border-y border-slate-100">
             <div className="flex items-center gap-4">
                 <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                   {IconMap[post.icon_name] || <BookOpen />}
                 </div>
                 <div>
                    <p className="text-sm font-bold text-slate-900">ResortPass Experten-Team</p>
                    <p className="text-xs text-slate-400">Exklusiver Guide für die Saison 2026</p>
                 </div>
             </div>
             <button 
                onClick={() => {
                   if (navigator.share) {
                     navigator.share({ title: post.title, url: window.location.href });
                   } else {
                     navigator.clipboard.writeText(window.location.href);
                     alert("Link kopiert!");
                   }
                }}
                className="flex items-center gap-2 px-6 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 font-bold transition-all border border-slate-200"
             >
                <Share2 size={18} /> Diesen Guide teilen
             </button>
          </div>

          {/* Legal Disclaimer */}
          <div className="mt-12 p-8 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-start gap-4">
                <AlertTriangle className="text-amber-500 shrink-0 mt-1" size={24} />
                <div>
                    <strong className="block mb-2 text-slate-900 font-archivo uppercase tracking-wide text-sm">Wichtiger Hinweis</strong>
                    <p className="text-sm text-slate-500 m-0 leading-relaxed">
                    Dieser Artikel wurde redaktionell erstellt und basiert auf öffentlich zugänglichen Informationen. ResortPassAlarm steht in keiner offiziellen Verbindung zur Europa-Park GmbH & Co Mack KG. Alle Preisangaben ohne Gewähr.
                    </p>
                </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="mt-20 pt-16 border-t border-slate-100">
             <h3 className="text-2xl font-archivo font-extrabold text-[#16423c] mb-10 text-center">Weitere hilfreiche Ratgeber</h3>
             <div className="grid md:grid-cols-2 gap-8">
                {others.map(p => (
                  <div 
                    key={p.id} 
                    className="flex flex-col gap-4 cursor-pointer group bg-slate-50 p-6 rounded-3xl border border-transparent hover:border-emerald-200 hover:bg-emerald-50 transition-all"
                    onClick={() => { navigate(`blog-post:${p.slug}`); window.scrollTo(0,0); }}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0 text-[#16423c]">
                      {IconMap[p.icon_name] || <BookOpen size={20}/>}
                    </div>
                    <div>
                      <h4 className="font-archivo font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2 text-lg">{p.title}</h4>
                      <p className="text-xs text-emerald-600 mt-3 flex items-center gap-1 font-bold uppercase tracking-wider">Weiterlesen <ArrowRight size={14}/></p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
      <Footer navigate={navigate} />
    </div>
  );
};
