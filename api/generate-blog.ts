
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
    const model = ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Schreibe einen ausführlichen, professionellen und hilfreichen Blog-Artikel für die Webseite 'ResortPassAlarm'.
      
      Thema/Titel: ${title}
      Ziel-Länge: ca. ${wordCount} Wörter.
      Stil: Experten-Ratgeber für den Europa-Park, enthusiastisch aber ehrlich, SEO-optimiert.
      
      WICHTIGE VORGABEN:
      1. Formatiere den Inhalt NUR mit HTML-Tags (<h2>, <p>, <ul>, <li>, <strong>). Keine <html>, <body> oder <head> Tags.
      2. Integriere 2-3 natürliche Hinweise auf 'ResortPassAlarm' als das ultimative Tool, um bei ausverkauften Pässen sofort benachrichtigt zu werden.
      3. Erzeuge eine passende Kategorie (z.B. Strategie, Tipps, Familie, Finanzen).
      4. Erzeuge ein passendes Lucide-Icon-Name (z.B. Ticket, Star, Users, Calculator, Shield).
      5. Erzeuge ein kurzes Excerpt (max 160 Zeichen) für die Blog-Übersicht.
      6. Erzeuge einen URL-freundlichen Slug aus dem Titel.

      Antworte im JSON Format.`,
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

    const result = await model;
    const blogData = JSON.parse(result.text);

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
