
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
  'Ticket': <Ticket size={24} />
};

export const BlogPostPage: React.FC<BlogPostPageProps> = ({ slug, navigate }) => {
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [others, setOthers] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    // Load current post
    fetch(`/api/blog-posts?slug=${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.id) setPost(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    // Load recommendations
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

  // Common CTA component for insertion within blog posts
  const BlogInjectedCTA = ({ variant = 1 }: { variant?: 1 | 2 }) => {
    if (variant === 1) {
      return (
        <div className="my-12 bg-[#001529] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden not-prose border-l-8 border-[#ffcc00]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4 text-[#ffcc00] font-bold uppercase tracking-widest text-sm">
              <Zap size={18} fill="currentColor" /> Der entscheidende Zeitvorteil
            </div>
            <h3 className="text-2xl font-extrabold mb-4 text-white">ResortPass ausverkauft?</h3>
            <p className="text-blue-100 mb-8 text-lg leading-relaxed">
              Verliere keine Zeit mit manuellem Suchen. Unser Wächter überwacht die Server 24/7 für dich und schickt dir sofort eine <strong>E-Mail & SMS</strong>, wenn neue Kontingente frei werden.
            </p>
            <Button onClick={() => navigate('landing')} className="bg-[#5046e5] hover:bg-indigo-700 text-white border-0 px-8 py-4 font-bold text-lg w-full sm:w-auto shadow-lg shadow-indigo-500/20">
              Jetzt Alarm aktivieren <ArrowRight size={20} className="ml-2" />
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div className="my-12 bg-white rounded-3xl p-8 shadow-xl border border-indigo-100 flex flex-col md:flex-row items-center gap-8 not-prose">
        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
          <Bell size={32} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="text-xl font-bold text-slate-900 mb-1">Erhöhe deine Chancen massiv!</h4>
          <p className="text-slate-600 text-sm">Unser System benachrichtigt dich in Echtzeit über neue Verfügbarkeiten – oft Stunden bevor andere es merken.</p>
        </div>
        <Button onClick={() => navigate('landing')} variant="outline" className="whitespace-nowrap border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-bold">
          Mehr erfahren
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <button 
              onClick={() => navigate('blog')}
              className="flex items-center text-slate-500 hover:text-indigo-600 font-medium transition-colors mb-6 group"
            >
              <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Zurück zum Blog
            </button>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-indigo-100 text-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded-full">
                {post.category}
              </span>
              <span className="text-slate-400 text-sm flex items-center gap-1">
                <Calendar size={14} /> {post.date}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight mb-8">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 py-6 border-y border-slate-100">
               <div className="w-12 h-12 bg-[#00305e] rounded-full flex items-center justify-center text-[#ffcc00]">
                 {IconMap[post.icon_name] || <BookOpen size={24}/>}
               </div>
               <div>
                  <p className="text-sm font-bold text-slate-900">ResortPass-Experten</p>
                  <p className="text-xs text-slate-400">Aktualisiert für die Saison 2026</p>
               </div>
               <div className="ml-auto flex gap-2">
                 <button className="p-2 text-slate-400 hover:text-indigo-500 transition" onClick={() => {
                   navigator.share({ title: post.title, url: window.location.href }).catch(() => {
                     navigator.clipboard.writeText(window.location.href);
                     alert("Link kopiert!");
                   });
                 }}><Share2 size={20} /></button>
               </div>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-slate prose-lg max-w-none prose-headings:text-[#00305e] prose-headings:font-bold prose-a:text-indigo-600 prose-strong:text-slate-900 leading-relaxed mb-16">
            <div dangerouslySetInnerHTML={{ __html: post.content }}></div>
          </div>

          <BlogInjectedCTA variant={1} />

          {/* Footer Info */}
          <div className="mt-16 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-start gap-4">
                <AlertTriangle className="text-amber-500 shrink-0 mt-1" size={24} />
                <div>
                    <strong className="block mb-2 text-slate-900">Transparenz-Hinweis</strong>
                    <p className="text-sm text-slate-500 m-0 leading-relaxed">
                    Dieser Artikel wurde mit Unterstützung von KI-Technologie erstellt und redaktionell geprüft. Er fasst öffentlich verfügbare Informationen zusammen. ResortPassAlarm ist ein unabhängiger Service.
                    </p>
                </div>
            </div>
          </div>

          {/* More Posts */}
          <div className="mt-16 pt-16 border-t border-slate-200">
             <h3 className="text-2xl font-bold text-[#00305e] mb-8">Das könnte dich auch interessieren</h3>
             <div className="grid md:grid-cols-2 gap-8">
                {others.map(p => (
                  <div 
                    key={p.id} 
                    className="flex gap-4 cursor-pointer group bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-all"
                    onClick={() => { navigate(`blog-post:${p.slug}`); window.scrollTo(0,0); }}
                  >
                    <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-[#00305e]">
                      {IconMap[p.icon_name] || <BookOpen size={20}/>}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">{p.title}</h4>
                      <p className="text-xs text-slate-400 mt-2 flex items-center gap-1 font-bold uppercase tracking-wider">Guide lesen <ChevronRight size={12}/></p>
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
