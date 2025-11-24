export default async function handler(req, res) {
  // Set JSON content type explicitly
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const apiKey = process.env.BROWSE_AI_API_KEY;
  const robotId = process.env.BROWSE_AI_ROBOT_ID;

  if (!apiKey || !robotId) {
    return res.status(400).json({ 
      success: false, 
      message: 'API Key oder Robot ID fehlen in den Environment Variables.' 
    });
  }

  try {
    const response = await fetch(`https://api.browse.ai/v2/robots/${robotId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return res.status(200).json({ 
        success: true, 
        message: 'Verbindung erfolgreich!', 
        robotName: data.robot?.name || 'Unbekannt' 
      });
    } else {
      // Try to parse error details, fallback to status text
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Response was not JSON
      }
      
      return res.status(response.status).json({ 
        success: false, 
        message: `Browse.ai Fehler: ${errorMessage}` 
      });
    }

  } catch (error) {
    console.error("Browse.ai Test Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: `Server-Fehler: ${error.message}` 
    });
  }
}