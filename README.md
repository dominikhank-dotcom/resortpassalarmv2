
# ResortPassAlarm SQL Setup (Blog Erweiterung)

Führe diesen SQL-Code in Supabase aus, um die Blog-Funktion zu aktivieren.

```sql
-- 1. Tabelle für Blogbeiträge
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  excerpt text,
  category text,
  icon_name text DEFAULT 'BookOpen',
  date text,
  word_count_target integer DEFAULT 1000,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Initialdaten Seeding (Bisherige Artikel in die DB übertragen)
INSERT INTO public.blog_posts (title, slug, excerpt, content, category, icon_name, date)
VALUES 
('Europa-Park ResortPass vs. Einzeltickets: Ab wann sparst du wirklich Geld?', 'resortpass-vs-einzeltickets', 'Die große Wirtschaftlichkeits-Analyse: Lohnt sich die Jahreskarte für dich?', '<h2>Hier den Inhalt aus BlogPostPage.tsx einfügen...</h2>', 'Ratgeber', 'DollarSign', '23. Dezember 2025'),
('Europa-Park Jahreskarte für Familien: Kosten, Tipps & Erfahrungen', 'resortpass-familien-guide', 'Lohnt sich der ResortPass für die ganze Familie? Wir rechnen die Kosten für 2026 durch.', '<h2>Hier den Inhalt aus BlogPostPage.tsx einfügen...</h2>', 'Familie', 'Users', '23. Dezember 2025'),
('ResortPass ausverkauft - was jetzt? Alternativen und Warteliste-Tipps', 'resortpass-ausverkauft-was-jetzt', 'Die rote "Ausverkauft"-Meldung ist der Albtraum jedes Fans.', '<h2>Inhalt...</h2>', 'Strategie', 'AlertCircle', '22. Mai 2024');
```
