
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    /* Initialize with direct process.env.API_KEY as per guidelines */
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    /* Use gemini-3-flash-preview for basic text tasks */
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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

  } catch (error: any) {
    console.error("Gemini Test Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: `Gemini Fehler: ${error.message}` 
    });
  }
}
