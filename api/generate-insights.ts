import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server Konfiguration fehlt (API_KEY)' });
  }

  try {
    const { stats, type } = req.body; // type can be 'admin_insights' or 'marketing_copy'
    const ai = new GoogleGenAI({ apiKey });

    let prompt = "";
    // Use a more capable model for complex tasks like creative writing or analysis
    const model = 'gemini-3-pro-preview'; 

    if (type === 'marketing_copy') {
        const { platform } = stats;
        prompt = `
          Schreibe einen kurzen, überzeugenden Marketing-Text auf Deutsch für ein Partnerprogramm.
          Das Produkt ist ein Tool namens "ResortPass Wächter".
          Es überwacht die Europa Park Webseite und benachrichtigt Nutzer sofort, wenn der "ResortPass Gold" wieder verfügbar ist.
          
          Zielplattform: ${platform}
          Zielgruppe: Europa Park Fans, Freizeitpark-Enthusiasten.
          Tonfall: Begeisternd, dringend, hilfreich.
          
          Der Text sollte einen Platzhalter für den Affiliate-Link enthalten: [DEIN_LINK].
          Verwende keine Hashtags für Email, aber nutze sie für Social Media.
        `;
    } else {
        // Admin Insights
        prompt = `
          Du bist ein Business-Analyst für ein SaaS-Tool. Analysiere die folgenden Partner-Daten und gib mir 3 kurze, prägnante Insights oder Handlungsempfehlungen auf Deutsch.
          Daten: ${JSON.stringify(stats)}
          
          Format:
          1. [Insight/Empfehlung]
          2. [Insight/Empfehlung]
          3. [Insight/Empfehlung]
        `;
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return res.status(200).json({ text: response.text });

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return res.status(500).json({ error: error.message });
  }
}