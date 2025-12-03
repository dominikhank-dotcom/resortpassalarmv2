import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return res.status(400).json({ 
      success: false, 
      message: 'API_KEY fehlt in den Environment Variables.' 
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Simple test prompt using the efficient flash model
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Antworte nur mit dem Wort: 'Erfolg'",
    });

    const text = response.text;

    if (text) {
      return res.status(200).json({ 
        success: true, 
        message: `Verbindung erfolgreich! Antwort: ${text}` 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Keine Antwort von Gemini erhalten.' 
      });
    }

  } catch (error) {
    console.error("Gemini Test Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: `Gemini Fehler: ${error.message}` 
    });
  }
}