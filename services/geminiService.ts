import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateMarketingCopy = async (platform: 'twitter' | 'email' | 'instagram'): Promise<string> => {
  if (!apiKey) {
    return "API Key fehlt. Bitte konfiguriere den API Key, um KI-Texte zu generieren.";
  }

  try {
    const prompt = `
      Schreibe einen kurzen, überzeugenden Marketing-Text auf Deutsch für ein Partnerprogramm.
      Das Produkt ist ein Tool namens "ResortPass Wächter".
      Es überwacht die Europa Park Webseite und benachrichtigt Nutzer sofort, wenn der "ResortPass Gold" wieder verfügbar ist.
      
      Zielplattform: ${platform}
      Zielgruppe: Europa Park Fans, Freizeitpark-Enthusiasten.
      Tonfall: Begeisternd, dringend, hilfreich.
      
      Der Text sollte einen Platzhalter für den Affiliate-Link enthalten: [DEIN_LINK].
      Verwende keine Hashtags für Email, aber nutze sie für Social Media.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Konnte keinen Text generieren.";
  } catch (error) {
    console.error("Gemini generation error:", error);
    return "Fehler bei der Generierung des Marketing-Textes. Bitte versuche es später erneut.";
  }
};

export const generateAdminInsights = async (stats: any): Promise<string> => {
  if (!apiKey) {
    return "API Key fehlt. Konfiguriere den Key in den Einstellungen.";
  }

  try {
    const prompt = `
      Du bist ein Business-Analyst für ein SaaS-Tool. Analysiere die folgenden Partner-Daten und gib mir 3 kurze, prägnante Insights oder Handlungsempfehlungen auf Deutsch.
      Daten: ${JSON.stringify(stats)}
      
      Format:
      1. [Insight/Empfehlung]
      2. [Insight/Empfehlung]
      3. [Insight/Empfehlung]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Keine Insights verfügbar.";
  } catch (error) {
    console.error("Gemini insight error:", error);
    return "Fehler bei der KI-Analyse.";
  }
};