
import React from 'react';
import { Calendar, ChevronRight, ArrowLeft, BookOpen, FileText, Info, HelpCircle, Star, Target, Calculator, Settings, Layers } from 'lucide-react';
import { Button } from '../components/Button';
import { Footer } from '../components/Footer';

export const BLOG_POSTS = [
  {
    slug: 'resortpass-erfahrungen-1-jahr',
    title: 'ResortPass Erfahrungen: mein Fazit nach 1 Jahr',
    excerpt: 'Wie fühlt sich der ResortPass im Alltag an? Erfahrungsbericht‑Vorlage mit ehrlicher Pro/Contra‑Liste, Kosten‑Check und Tipps.',
    date: '22. Dezember 2025',
    category: 'Erfahrungsberichte',
    icon: <Star size={24} />
  },
  {
    slug: 'resortpass-faq-haeufige-fragen',
    title: 'ResortPass FAQ: Reservierung, Upgrade, Karte, Partner‑Parks',
    excerpt: 'Die wichtigsten Fragen zum Europa‑Park ResortPass: Reservierung, Partner‑Parks, Rulantica (Gold), Karte/Print, Bedingungen und typische Probleme.',
    date: '22. Dezember 2025',
    category: 'Wissen',
    icon: <HelpCircle size={24} />
  },
  {
    slug: 'resortpass-gold-vorteile-rulantica',
    title: 'ResortPass Gold Vorteile: Rulantica‑Tickets, Flexibilität & Extras',
    excerpt: 'Alle Vorteile des Europa‑Park ResortPass Gold: Zutritt an allen Öffnungstagen, 2× Rulantica, Partner‑Parks, Aktionen – plus Tipps zur Nutzung.',
    date: '22. Dezember 2025',
    category: 'Vorteile',
    icon: <Star size={24} className="text-yellow-500" />
  },
  {
    slug: 'resortpass-kaufen-verfuegbarkeit-tipps',
    title: 'ResortPass kaufen: Verfügbarkeit, Verkaufsstart, Tipps',
    excerpt: 'Wie und wann kann man ResortPass Silver/Gold kaufen? Tipps zu Verfügbarkeit, Kontingenten, Verkaufsstart und Account‑Vorbereitung.',
    date: '22. Dezember 2025',
    category: 'Ratgeber',
    icon: <Target size={24} />
  },
  {
    slug: 'resortpass-lohnt-sich-rechner',
    title: 'Lohnt sich der Europa‑Park ResortPass? Rechner & Beispiele',
    excerpt: 'Ab wann lohnt sich der ResortPass? Rechenbeispiele für Familien, Paare und Solo‑Besucher: Silver vs. Gold, Break‑Even und Spartipps.',
    date: '22. Dezember 2025',
    category: 'Finanzen',
    icon: <Calculator size={24} />
  },
  {
    slug: 'resortpass-preise-bedingungen-rabatte',
    title: 'ResortPass Preise: Silver & Gold, Altersgruppen, Bedingungen',
    excerpt: 'Aktuelle ResortPass‑Preise für Kinder/Erwachsene/Senioren, wichtige Bedingungen und typische Zusatzkosten – kompakt für deine Entscheidung.',
    date: '22. Dezember 2025',
    category: 'Wissen',
    icon: <FileText size={24} />
  },
  {
    slug: 'resortpass-silver-oeffnungstage-sperrtage',
    title: 'ResortPass Silver: Öffnungstage & Sperrtage verstehen',
    excerpt: 'Welche Tage sind mit ResortPass Silver gültig? So liest du den Kalender, planst Ferien/Brückentage und vermeidest typische Fehlannahmen.',
    date: '22. Dezember 2025',
    category: 'Planung',
    icon: <Settings size={24} />
  },
  {
    slug: 'resortpass-silver-vs-gold-unterschiede',
    title: 'ResortPass Silver vs. Gold: Unterschiede, Vorteile, Empfehlung',
    excerpt: 'Silver oder Gold? Vergleich der Europa‑Park ResortPass‑Modelle: Zutrittstage, Rulantica‑Tickets, Benefits, Reservierung & Zielgruppen.',
    date: '22. Dezember 2025',
    category: 'Vergleich',
    icon: <Layers size={24} />
  },
  {
    slug: 'resortpass-tipps-tricks-vielbesucher',
    title: 'Europa‑Park Jahreskarte: 15 Tipps für ResortPass‑Besitzer',
    excerpt: 'Die besten Tipps für ResortPass‑Besitzer: Besuchszeiten, Wartezeit‑Strategien, App‑Nutzung, Event‑Tage, Essen und Rulantica‑Kombi.',
    date: '22. Dezember 2025',
    category: 'Ratgeber',
    icon: <Info size={24} />
  },
  {
    slug: 'resortpass-was-ist-das',
    title: 'Europa‑Park ResortPass erklärt: Silver, Gold, Vorteile & Regeln',
    excerpt: 'Was ist der Europa‑Park ResortPass? Erklärung zu Silver & Gold, Laufzeit, Zutrittstage, Reservierung und wichtigsten Vorteilen.',
    date: '22. Dezember 2025',
    category: 'Wissen',
    icon: <BookOpen size={24} />
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
                onClick={() => navigate(`blog-post:${post.slug}`)}
              >
                <div className="h-40 bg-[#00305e] flex items-center justify-center relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-2xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                   <div className="text-[#ffcc00] transform group-hover:scale-110 transition-transform duration-500">
                     {post.icon}
                   </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-3 uppercase font-bold tracking-wider">
                    <span className="text-[#00305e]">{post.category}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[#00305e] transition-colors leading-tight">
                    {post.title}
                  </h2>
                  <p className="text-slate-500 text-sm mb-6 flex-1 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center text-[#00305e] font-bold text-sm">
                    Beitrag lesen <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
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
