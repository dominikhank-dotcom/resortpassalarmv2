
import React, { useState, useEffect } from 'react';
import { Calendar, ChevronRight, ArrowLeft, BookOpen, Star, Target, Calculator, FileText, ShoppingBag, AlertCircle, Users, DollarSign, Loader2 } from 'lucide-react';
import { Button } from '../components/Button';
import { Footer } from '../components/Footer';

// Dynamic Icon Mapping
const IconMap: Record<string, React.ReactNode> = {
  'BookOpen': <BookOpen size={24} />,
  'Star': <Star size={24} />,
  'Target': <Target size={24} />,
  'Calculator': <Calculator size={24} />,
  'FileText': <FileText size={24} />,
  'ShoppingBag': <ShoppingBag size={24} />,
  'AlertCircle': <AlertCircle size={24} />,
  'Users': <Users size={24} />,
  'DollarSign': <DollarSign size={24} />,
  'Shield': <AlertCircle size={24} />,
  'Ticket': <ShoppingBag size={24} />
};

export const BlogOverviewPage: React.FC<{ navigate: (page: string) => void }> = ({ navigate }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blog-posts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPosts(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <Button variant="outline" size="sm" onClick={() => navigate('landing')} className="mb-6">
              <ArrowLeft size={16} className="mr-2" /> Zurück zur Startseite
            </Button>
            <h1 className="text-4xl font-bold text-[#00305e] mb-4">ResortPass Blog 2026</h1>
            <p className="text-lg text-slate-600 max-w-2xl">
              Alles Wissenswerte rund um den Europa-Park ResortPass. Aktuelle Guides, Preisübersichten und Tipps für die neue Saison.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
              <p className="text-slate-500 font-medium">Lade Blogbeiträge...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {posts.map((post) => (
                <article 
                  key={post.id} 
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => navigate(`blog-post:${post.slug}`)}
                >
                  <div className="h-48 bg-[#00305e] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500 rounded-full blur-2xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                    <div className="text-[#ffcc00] transform group-hover:scale-110 transition-transform duration-500">
                      {IconMap[post.icon_name] || <FileText size={24} />}
                    </div>
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-4 uppercase font-bold tracking-wider">
                      <span className="text-indigo-600">{post.category}</span>
                      <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors leading-tight">
                      {post.title}
                    </h2>
                    <p className="text-slate-500 mb-6 flex-1 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center text-indigo-600 font-bold">
                      Guide lesen <ChevronRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </article>
              ))}
              {posts.length === 0 && (
                <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                  <p className="text-slate-400">Aktuell sind keine Blogbeiträge verfügbar.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer navigate={navigate} />
    </div>
  );
};
