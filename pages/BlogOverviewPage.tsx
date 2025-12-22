
import React from 'react';
import { Calendar, ChevronRight, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';
import { Footer } from '../components/Footer';

export const BLOG_POSTS = [
  {
    slug: 'resortpass-erfahrungen-1-jahr',
    title: 'ResortPass Erfahrungen: Mein Fazit nach 1 Jahr',
    excerpt: 'Wie fühlt sich der ResortPass im Alltag an? Ein ehrlicher Erfahrungsbericht mit Pro/Contra‑Liste, Kosten‑Check und Tipps.',
    date: '22. Dezember 2025',
    category: 'Erfahrungsberichte',
    image: 'https://images.unsplash.com/photo-1505144808419-1957a94ca61e?auto=format&fit=crop&q=80&w=800'
  },
  {
    slug: 'resortpass-faq-haeufige-fragen',
    title: 'ResortPass FAQ: Reservierung, Upgrade, Partner‑Parks',
    excerpt: 'Die wichtigsten Fragen zum Europa‑Park ResortPass kompakt beantwortet: Partner‑Parks, Rulantica (Gold), Karte/Print und mehr.',
    date: '22. Dezember 2025',
    category: 'Wissen',
    image: 'https://images.unsplash.com/photo-1513883049090-d0b7439799bf?auto=format&fit=crop&q=80&w=800'
  },
  {
    slug: 'resortpass-gold-vorteile-rulantica',
    title: 'ResortPass Gold Vorteile: Rulantica, Flexibilität & Extras',
    excerpt: 'Alle Vorteile des ResortPass Gold: Zutritt an allen Öffnungstagen, 2× Rulantica, Partner‑Parks und exklusive Aktionen.',
    date: '22. Dezember 2025',
    category: 'Vorteile',
    image: 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&q=80&w=800'
  },
  {
    slug: 'resortpass-kaufen-verfuegbarkeit-tipps',
    title: 'ResortPass kaufen: So erhöhst du deine Chance',
    excerpt: 'Tipps zu Verfügbarkeit, Kontingenten und Verkaufsstart. Wie du dich vorbereitest, um beim nächsten Fenster schnell genug zu sein.',
    date: '22. Dezember 2025',
    category: 'Ratgeber',
    image: 'https://images.unsplash.com/photo-1603533215707-e69c0993424d?auto=format&fit=crop&q=80&w=800'
  },
  {
    slug: 'resortpass-lohnt-sich-rechner',
    title: 'Lohnt sich der ResortPass? Rechner & Beispiele',
    excerpt: 'Ab wann lohnt sich die Jahreskarte? Rechenbeispiele für Familien, Paare und Solo‑Besucher im Vergleich Silver vs. Gold.',
    date: '22. Dezember 2025',
    category: 'Finanzen',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800'
  },
  {
    slug: 'resortpass-preise-bedingungen-rabatte',
    title: 'ResortPass Preise & Bedingungen (Stand 2025)',
    excerpt: 'Aktuelle ResortPass‑Preise für alle Altersgruppen, wichtige Bedingungen und typische Zusatzkosten kompakt zusammengefasst.',
    date: '22. Dezember 2025',
    category: 'Wissen',
    image: 'https://images.unsplash.com/photo-1518458028785-8fbcd101ebb9?auto=format&fit=crop&q=80&w=800'
  },
  {
    slug: 'resortpass-silver-oeffnungstage-sperrtage',
    title: 'ResortPass Silver: Öffnungstage & Sperrtage erklärt',
    excerpt: 'Welche Tage sind mit Silver gültig? So liest du den Kalender, planst Ferien und vermeidest typische Fehlannahmen.',
    date: '22. Dezember 2025',
    category: 'Planung',
    image: 'https://images.unsplash.com/photo-1506784919141-9358404bb0f5?auto=format&fit=crop&q=80&w=800'
  },
  {
    slug: 'resortpass-silver-vs-gold-unterschiede',
    title: 'ResortPass Silver vs. Gold: Welcher passt zu dir?',
    excerpt: 'Der große Vergleich der Europa‑Park ResortPass‑Modelle: Zutrittstage, Rulantica‑Tickets, Benefits und unsere Empfehlung.',
    date: '22. Dezember 2025',
    category: 'Vergleich',
    image: 'https://images.unsplash.com/photo-1533350082384-58b51cda163d?auto=format&fit=crop&q=80&w=800'
  },
  {
    slug: 'resortpass-tipps-tricks-vielbesucher',
    title: '15 Tipps & Tricks für ResortPass‑Besitzer',
    excerpt: 'Hol mehr aus deinem ResortPass raus: Strategien gegen Wartezeiten, App‑Tricks, Budget‑Tipps und optimale Besuchszeiten.',
    date: '22. Dezember 2025',
    category: 'Ratgeber',
    image: 'https://images.unsplash.com/photo-1544081691-383794348611?auto=format&fit=crop&q=80&w=800'
  },
  {
    slug: 'resortpass-was-ist-das',
    title: 'Europa‑Park ResortPass: Der ultimative Guide',
    excerpt: 'Was ist der ResortPass? Erklärung zu Silver & Gold, Laufzeit, Zutrittstage, Reservierung und den wichtigsten Regeln.',
    date: '22. Dezember 2025',
    category: 'Wissen',
    image: 'https://images.unsplash.com/photo-1545627255-08e75923b7e8?auto=format&fit=crop&q=80&w=800'
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
            <h1 className="text-4xl font-bold text-[#00305e] mb-4">ResortPass Blog</h1>
            <p className="text-lg text-slate-600 max-w-2xl">
              Alles Wissenswerte rund um den Europa-Park ResortPass, Tipps für Vielbesucher und aktuelle Informationen zur Verfügbarkeit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BLOG_POSTS.map((post) => (
              <article 
                key={post.slug} 
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => navigate(`blog/${post.slug}`)}
              >
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-[#00305e] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[#00305e] transition-colors leading-tight">
                    {post.title}
                  </h2>
                  <p className="text-slate-500 text-sm mb-6 flex-1 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center text-[#00305e] font-bold text-sm">
                    Weiterlesen <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
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
