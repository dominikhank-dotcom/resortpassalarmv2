// This service now calls our backend API to keep the Key secure
export const generateMarketingCopy = async (platform: 'twitter' | 'email' | 'instagram'): Promise<string> => {
  try {
    const response = await fetch('/api/generate-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        type: 'marketing_copy',
        stats: { platform } 
      })
    });

    if (!response.ok) {
       const err = await response.json();
       throw new Error(err.message || 'Server Error');
    }

    const data = await response.json();
    return data.text || "Keine Antwort erhalten.";

  } catch (error) {
    console.error("Gemini generation error:", error);
    return "Fehler bei der Generierung. Bitte prüfe die API Keys in Vercel.";
  }
};

export const generateAdminInsights = async (stats: any): Promise<string> => {
  try {
    const response = await fetch('/api/generate-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        type: 'admin_insights',
        stats 
      })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Server Error');
    }

    const data = await response.json();
    return data.text || "Keine Insights verfügbar.";

  } catch (error) {
    console.error("Gemini insight error:", error);
    return "Fehler bei der KI-Analyse. Ist der API Key in Vercel gesetzt?";
  }
};