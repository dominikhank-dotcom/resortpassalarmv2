
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
    const { data: admin } = await supabase.from('profiles').select('role').eq('id', adminId).single();
    if (!admin || admin.role !== 'ADMIN') return res.status(403).json({ error: 'Unauthorized' });

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Du bist ein erfahrener Content-Creator für 'ResortPassAlarm.com'.
      
      AUFGABE: Schreibe einen fesselnden Artikel im "Ratgeber-Stil" (Beispiel: Wirtschaftlichkeitsrechnung).
      Titel: ${title}
      Länge: ca. ${wordCount} Wörter.
      Sprache: Deutsch (Du-Form, leidenschaftlich, seriös).

      WICHTIGSTE REGEL ZUM PRODUKT:
      ResortPassAlarm hilft Menschen, die NOCH KEINEN ResortPass haben. 
      Wir überwachen den Ticket-Shop und informieren Nutzer, sobald ResortPass Silver oder Gold wieder ZUM KAUF verfügbar sind.
      BEACHTE: Wir überwachen NICHT die Buchungsslots/Besuchstage für bestehende Inhaber. Schreib das niemals falsch!

      LINK-REGEL:
      Alle Buttons oder Handlungsaufforderungen (CTAs) zum Service müssen auf die STARTSEITE verlinken. 
      Nutze dafür keine festen URLs, sondern beschreibe in den Texten, dass der Nutzer auf die Startseite gehen soll, um den Alarm zu aktivieren.

      STRUKTUR-VORGABEN (NUTZE DIESE HTML-KLASSEN):
      1. Einleitungstext (<p>).
      2. TL;DR Bereich: <div class="tldr"><h2>TL;DR – Die Kurzfassung</h2><div class="tldr-grid"><div class="tldr-item"><strong>Punkt</strong></div></div></div>
      3. Kalkulations-Boxen: <div class="calculator-box"><h3>Titel</h3><div class="calculation-row"><div class="calculation-label">Text</div><div class="calculation-value">Betrag</div></div><div class="result-highlight"><div class="big-number">Ergebnis</div></div></div>
      4. Vergleichs-Karten: <div class="comparison-cards"><div class="comparison-card"><div class="card-header silver"><h4>Silver</h4><div class="card-price">295 €</div></div><div class="card-body">...</div></div></div>
      5. Banner: <div class="info-banner">...</div>, <div class="tip-banner">...</div>, <div class="warning-banner">...</div>
      6. Szenarien: <div class="scenario-card"><h4>Szenario</h4>...<div class="scenario-verdict">Fazit</div></div>

      WICHTIG: 
      - Nutze ausschließlich HTML-Tags.
      - Erzeuge ein passendes Excerpt (max 160 Zeichen).
      - Erzeuge einen Slug.`,
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
    return res.status(500).json({ error: error.message });
  }
}
