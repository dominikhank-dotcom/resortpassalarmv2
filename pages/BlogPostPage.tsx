
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
        <Loader2 className="animate-spin text-[#16423c] mb-4" size={48} />
        <p className="text-slate-500 font-lato">Lade Experten-Guide...</p>
      </div>
    );
  }
  
  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50 font-lato">
        <h2 className="text-2xl font-archivo font-bold text-slate-900 mb-4">Beitrag nicht gefunden</h2>
        <Button onClick={() => navigate('blog')}>Zum Blog zurück</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7fafc] flex flex-col font-lato">
      <style>{`
        .blog-content {
          color: #2d3748;
          line-height: 1.8;
          font-size: 1.1rem;
        }
        .blog-content h2 {
          font-family: 'Archivo', sans-serif;
          font-size: 2.25rem;
          color: #16423c;
          margin: 3.5rem 0 1.5rem 0;
          font-weight: 800;
          line-height: 1.2;
        }
        .blog-content h3 {
          font-family: 'Archivo', sans-serif;
          font-size: 1.75rem;
          color: #6a9c89;
          margin: 2.5rem 0 1.2rem 0;
          font-weight: 700;
        }
        .blog-content p { margin-bottom: 1.8rem; }
        .blog-content strong { color: #16423c; font-weight: 700; }
        
        .tldr {
          background: linear-gradient(135deg, #c4dad2 0%, #e9efec 100%);
          padding: 2.5rem;
          border-radius: 16px;
          margin: 3rem 0;
          border-left: 6px solid #6a9c89;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .tldr h2 { margin-top: 0 !important; font-size: 1.6rem !important; color: #16423c !important; margin-bottom: 1.5rem !important; }
        .tldr-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1.5rem; }
        .tldr-item { background: white; padding: 1.2rem; border-radius: 10px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
        .tldr-item strong { display: block; color: #16423c; font-size: 0.95rem; }

        .calculator-box {
          background: white;
          padding: 2.5rem;
          border-radius: 16px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.1);
          margin: 3rem 0;
          border-top: 4px solid #6a9c89;
        }
        .calculator-box h3 { margin-top: 0 !important; text-align: center; color: #16423c !important; }
        .calculation-row { display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; padding: 1.2rem 0; border-bottom: 1px solid #e2e8f0; align-items: center; }
        .calculation-label { font-weight: 500; }
        .calculation-value { text-align: right; font-weight: 700; font-size: 1.2rem; color: #16423c; font-family: 'Archivo', sans-serif; }
        .result-highlight { background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 1.5rem; border-radius: 12px; text-align: center; margin-top: 1.5rem; }
        .result-highlight .big-number { font-size: 3rem; font-weight: 800; font-family: 'Archivo', sans-serif; display: block; margin: 0.5rem 0; }

        .comparison-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 3rem 0; }
        .comparison-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); transition: transform 0.3s ease; }
        .comparison-card:hover { transform: translateY(-5px); }
        .card-header { padding: 1.5rem; text-align: center; color: white; }
        .card-header.silver { background: linear-gradient(135deg, #718096 0%, #4a5568 100%); }
        .card-header.gold { background: linear-gradient(135deg, #d4af37 0%, #c19a2e 100%); }
        .card-header h4 { font-family: 'Archivo', sans-serif; font-size: 1.5rem; margin-bottom: 0.5rem; font-weight: 800; }
        .card-price { font-size: 2.5rem; font-weight: 800; font-family: 'Archivo', sans-serif; }
        .card-body { padding: 2rem; }
        .card-body ul { list-style: none !important; padding: 0 !important; margin: 0 !important; }
        .card-body li { padding: 0.7rem 0; padding-left: 1.8rem; position: relative; border-bottom: 1px solid #e2e8f0; }
        .card-body li::before { content: '✓'; position: absolute; left: 0; color: #48bb78; font-weight: bold; font-size: 1.2rem; }

        .info-banner { background: linear-gradient(135deg, #bee3f8 0%, #90cdf4 100%); padding: 2rem; border-radius: 12px; margin: 2rem 0; border-left: 5px solid #3182ce; color: #2c5282; }
        .tip-banner { background: linear-gradient(135deg, #c6f6d5 0%, #9ae6b4 100%); padding: 2rem; border-radius: 12px; margin: 2rem 0; border-left: 5px solid #38a169; color: #22543d; }
        .warning-banner { background: linear-gradient(135deg, #feebc8 0%, #fbd38d 100%); padding: 2rem; border-radius: 12px; margin: 2rem 0; border-left: 5px solid #dd6b20; color: #7c2d12; }

        .scenario-card { background: white; padding: 2rem; border-radius: 12px; border-left: 5px solid #6a9c89; box-shadow: 0 4px 15px rgba(0,0,0,0.08); margin: 2rem 0; }
        .scenario-card h4 { font-family: 'Archivo', sans-serif; color: #16423c; margin-bottom: 1rem; font-size: 1.3rem; font-weight: 700; }
        .scenario-verdict { background: #e9efec; padding: 1rem; border-radius: 8px; margin-top: 1rem; font-weight: 600; color: #16423c; }

        .blog-content ul:not(.card-body ul) { margin: 1.5rem 0; padding-left: 2rem; list-style-type: disc; }
        .blog-content li:not(.card-body li) { margin-bottom: 0.8rem; }

        @media (max-width: 768px) {
          .comparison-cards { grid-template-columns: 1fr; }
          .calculation-row { grid-template-columns: 1fr; gap: 0.3rem; }
          .calculation-value { text-align: left; }
          .blog-content h2 { font-size: 1.75rem; }
        }
      `}</style>

      {/* NEW HERO DESIGN */}
      <div className="bg-gradient-to-br from-[#16423c] to-[#0f2e2a] text-white pt-24 pb-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
            <span className="text-[40rem] font-black font-archivo">€</span>
        </div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
            <button 
              onClick={() => navigate('blog')}
              className="inline-flex items-center text-emerald-200/60 hover:text-white mb-10 transition-colors group font-bold"
            >
              <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Zurück zum Blog
            </button>
            <h1 className="text-4xl md:text-6xl font-archivo font-extrabold leading-tight mb-8">
              {post.title}
            </h1>
            <p className="text-xl md:text-2xl text-emerald-100/90 max-w-3xl mx-auto leading-relaxed font-lato">
              Die ehrliche Antwort mit konkreten Zahlen, Rechnungen und echten Erfahrungen
            </p>
        </div>
      </div>

      <div className="flex-grow py-12 px-4 sm:px-6 lg:px-8 -mt-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-16 border border-slate-100">
            
            {/* Meta Info Bar */}
            <div className="flex flex-wrap items-center gap-6 mb-12 pb-8 border-b border-slate-100 text-sm font-bold uppercase tracking-widest text-slate-400">
                <span className="text-[#16423c] bg-emerald-50 px-4 py-1 rounded-full">{post.category}</span>
                <span className="flex items-center gap-2"><Calendar size={16} /> {post.date}</span>
                <span className="hidden sm:inline">Lesezeit: ca. 6 Min.</span>
            </div>

            {/* Content Area */}
            <div className="blog-content mb-16">
              <div dangerouslySetInnerHTML={{ __html: post.content }}></div>
            </div>

            {/* Re-designed CTA Box */}
            <div className="my-16 bg-[#001529] rounded-[32px] p-10 text-white shadow-2xl relative overflow-hidden not-prose border-l-[12px] border-[#ffcc00]">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-[120px] opacity-10 -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-6 text-[#ffcc00] font-archivo font-black uppercase tracking-widest text-sm">
                    <Zap size={20} fill="currentColor" /> Der entscheidende Zeitvorteil
                  </div>
                  <h3 className="text-3xl md:text-4xl font-archivo font-black mb-6 text-white leading-tight">
                    ResortPass ausverkauft? <br/>Lass uns für dich suchen!
                  </h3>
                  <p className="text-blue-100 mb-10 text-lg leading-relaxed max-w-2xl font-lato">
                    Verliere keine Zeit mit manuellem Suchen. Unser Wächter überwacht die Server 24/7 und schickt dir sofort eine <strong>SMS & E-Mail</strong>, sobald neue ResortPässe <u>zum Kauf</u> freigeschaltet werden.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-6 items-center">
                      <Button onClick={() => navigate('user-signup')} className="bg-[#5046e5] hover:bg-indigo-700 text-white border-0 px-10 py-5 font-archivo font-black text-xl shadow-xl shadow-indigo-500/20 w-full sm:w-auto transform hover:scale-105 transition-all">
                          JETZT ALARM AKTIVIEREN <ArrowRight size={22} className="ml-2" />
                      </Button>
                      <div className="flex items-center gap-4">
                           <div className="flex -space-x-3">
                               {[1,2,3].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-[#001529] bg-slate-400"></div>)}
                           </div>
                           <span className="text-sm text-blue-300 font-bold">Bereits 4.000+ Glückliche Nutzer</span>
                      </div>
                  </div>
              </div>
            </div>

            {/* Share Section */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-12 border-y border-slate-100">
               <div className="flex items-center gap-5">
                   <div className="w-16 h-16 bg-[#16423c] rounded-2xl flex items-center justify-center text-[#ffcc00] shadow-lg">
                     {IconMap[post.icon_name] || <BookOpen size={32}/>}
                   </div>
                   <div>
                      <p className="text-lg font-archivo font-bold text-slate-900">ResortPass Experten-Team</p>
                      <p className="text-sm text-slate-500 font-medium italic">Aktualisiert für die Saison 2026</p>
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
                  className="flex items-center gap-3 px-8 py-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-700 font-archivo font-bold transition-all border border-slate-200"
               >
                  <Share2 size={20} /> Guide teilen
               </button>
            </div>

            {/* Legal / Transparency */}
            <div className="mt-12 p-8 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-start gap-4">
                  <AlertTriangle className="text-amber-500 shrink-0 mt-1" size={24} />
                  <div>
                      <strong className="block mb-2 text-slate-900 font-archivo uppercase tracking-wide text-sm">Transparenz-Hinweis</strong>
                      <p className="text-sm text-slate-500 m-0 leading-relaxed font-lato">
                      Dieser Artikel wurde redaktionell erstellt und basiert auf öffentlich zugänglichen Informationen. ResortPassAlarm steht in keiner offiziellen Verbindung zur Europa-Park GmbH & Co Mack KG. Alle Preisangaben ohne Gewähr. Unser Service informiert ausschließlich über die Verfügbarkeit zum Neukauf von Pässen.
                      </p>
                  </div>
              </div>
            </div>
          </div>

          {/* Recommendations Section */}
          <div className="mt-20">
             <h3 className="text-3xl font-archivo font-extrabold text-[#16423c] mb-10 text-center uppercase tracking-tight">Weitere hilfreiche Ratgeber</h3>
             <div className="grid md:grid-cols-2 gap-8">
                {others.map(p => (
                  <div 
                    key={p.id} 
                    className="flex flex-col gap-6 cursor-pointer group bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-xl hover:border-emerald-200 transition-all duration-300"
                    onClick={() => { navigate(`blog-post:${p.slug}`); window.scrollTo(0,0); }}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 text-[#16423c] group-hover:bg-[#16423c] group-hover:text-[#ffcc00] transition-colors shadow-sm">
                      {IconMap[p.icon_name] || <BookOpen size={24}/>}
                    </div>
                    <div>
                      <h4 className="font-archivo font-bold text-slate-900 leading-snug group-hover:text-emerald-800 transition-colors text-xl">{p.title}</h4>
                      <p className="text-sm text-emerald-600 mt-4 flex items-center gap-1 font-archivo font-black uppercase tracking-widest">
                        Guide lesen <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </p>
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
