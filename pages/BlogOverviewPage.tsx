
import React from 'react';
import { Calendar, ChevronRight, ArrowLeft, BookOpen, Star, Target, Calculator, FileText, ShoppingBag, AlertCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { Footer } from '../components/Footer';

export const BLOG_POSTS = [
  {
    slug: 'resortpass-ausverkauft-was-jetzt',
    title: 'ResortPass ausverkauft - was jetzt? Alternativen und Warteliste-Tipps',
    excerpt: 'Die rote "Ausverkauft"-Meldung ist der Albtraum jedes Fans. Wir zeigen dir, wie du die offizielle Warteliste umgehst und welche Alternativen es gibt.',
    date: '22. Mai 2024',
    category: 'Strategie',
    icon: <AlertCircle size={24} />
  },
  {
    slug: 'resortpass-kaufen-tipps',
    title: 'ResortPass kaufen: So sicherst du dir deine Jahreskarte (inkl. Tipps bei Ausverkauf)',
    excerpt: 'Du willst eine Europa-Park Jahreskarte kaufen, aber alles ist weg? Erfahre hier die besten Strategien, um doch noch an einen ResortPass zu kommen.',
    date: '22. Mai 2024',
    category: 'Tipps',
    icon: <ShoppingBag size={24} />
  },
  {
    slug: 'resortpass-guide-2026',
    title: 'Europa-Park ResortPass erklärt: Der ultimative Guide für Einsteiger 2026',
    excerpt: 'Der komplette Guide für 2026: Alles über die Jahreskarte, Vorteile, Reservierung und Nutzung. Perfekt für Einsteiger erklärt!',
    date: '15. Januar 2026',
    category: 'Wissen',
    icon: <BookOpen size={24} />
  },
  {
    slug: 'silver-vs-gold-vergleich',
    title: 'Silver vs. Gold: Welcher ResortPass passt zu dir?',
    excerpt: 'Wir zeigen dir die Unterschiede, Vor- und Nachteile und für wen sich welche Variante wirklich lohnt. Entscheidungshilfe für deine Jahreskarte.',
    date: '12. Januar 2026',
    category: 'Vergleich',
    icon: <Target size={24} />
  },
  {
    slug: 'resortpass-preise-2026',
    title: 'Was kostet der Europa-Park ResortPass 2026? Alle Preise im Überblick',
    excerpt: 'Alle aktuellen Preise für Silver und Gold, Kinderpreise, ParkingPass und Ermäßigungen im Überblick.',
    date: '10. Januar 2026',
    category: 'Finanzen',
    icon: <FileText size={24} />
  },
  {
    slug: 'resortpass-amortisation-rechner',
    title: 'Lohnt sich der ResortPass? So rechnest du es dir aus',
    excerpt: 'Wann amortisiert sich Silver vs. Gold? Mit unserem Rechner und Erfahrungen findest du heraus, ob sich der Pass für dich lohnt.',
    date: '08. Januar 2026',
    category: 'Ratgeber',
    icon: <Calculator size={24} />
  }
];

export const BlogOverviewPage: React.FC<{ navigate: (page: string) => void }> = ({ navigate }) => {
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {BLOG_POSTS.map((post) => (
              <article 
                key={post.slug} 
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => navigate(`blog-post:${post.slug}`)}
              >
                <div className="h-48 bg-[#00305e] flex items-center justify-center relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500 rounded-full blur-2xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                   <div className="text-[#ffcc00] transform group-hover:scale-110 transition-transform duration-500">
                     {post.icon}
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
          </div>
        </div>
      </div>
      <Footer navigate={navigate} />
    </div>
  );
};
