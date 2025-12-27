
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { title, wordCount, adminId, existingId } = req.body;

  try {
    // Admin Check
    const { data: admin } = await supabase.from('profiles').select('role').eq('id', adminId).single();
    if (!admin || admin.role !== 'ADMIN') return res.status(403).json({ error: 'Unauthorized' });

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Complex text task -> Gemini 3 Pro
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Du bist ein erfahrener Content-Creator für 'ResortPassAlarm.com', eine Seite, die Europa-Park Fans hilft, Jahreskarten zu ergattern.
      
      AUFGABE:
      Schreibe einen fesselnden, hilfreichen Blog-Artikel.
      Titel: ${title}
      Länge: ca. ${wordCount} Wörter.
      Sprache: Deutsch (Du-Form, enthusiastisch aber seriös).

      STRUKTUR & STIL:
      1. Nutze ausschließlich HTML-Tags für die Formatierung (<h2>, <h3>, <p>, <ul>, <li>, <strong>). Keine Markdowns.
      2. Der Artikel muss 2-3 natürliche Empfehlungen für den 'ResortPassAlarm' enthalten. Erkläre, dass unser Tool die Verfügbarkeit 24/7 prüft und sofort per SMS/E-Mail alarmiert, wenn Pässe wieder da sind.
      3. Erstelle eine passende Kategorie (Ratgeber, Wissen, News, Strategie oder Finanzen).
      4. Wähle einen passenden Lucide-Icon Namen (z.B. Ticket, Star, Users, Calculator, Shield, Map).
      5. Erstelle ein prägnantes Excerpt (max. 160 Zeichen).
      6. Erzeuge einen URL-Slug.

      ANTWORTE NUR IM JSON-FORMAT.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            content: { type: Type.STRING },
            excerpt: { type: Type.STRING },
            category: { type: Type.STRING },
            icon: { type: Type.STRING },
            slug: { type: Type.STRING }
          },
          required: ["content", "excerpt", "category", "icon", "slug"]
        }
      }
    });

    const blogData = JSON.parse(response.text);

    const postToSave = {
      title,
      slug: blogData.slug,
      content: blogData.content,
      excerpt: blogData.excerpt,
      category: blogData.category,
      icon_name: blogData.icon,
      date: new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' }),
      word_count_target: wordCount,
      updated_at: new Date().toISOString()
    };

    if (existingId) {
      const { error } = await supabase.from('blog_posts').update(postToSave).eq('id', existingId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('blog_posts').insert(postToSave);
      if (error) throw error;
    }

    return res.status(200).json({ success: true, slug: blogData.slug });

  } catch (error: any) {
    console.error("Blog Gen Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
