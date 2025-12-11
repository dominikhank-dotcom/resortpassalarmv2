
export default async function handler(req, res) {
  // Set JSON content type explicitly
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const apiKey = process.env.BROWSE_AI_API_KEY;
  const robotIdGold = process.env.BROWSE_AI_ROBOT_ID_GOLD;
  const robotIdSilver = process.env.BROWSE_AI_ROBOT_ID_SILVER;

  if (!apiKey) {
    return res.status(400).json({ 
      success: false, 
      message: 'BROWSE_AI_API_KEY fehlt in den Environment Variables.' 
    });
  }

  if (!robotIdGold || !robotIdSilver) {
    return res.status(400).json({ 
      success: false, 
      message: 'Es fehlen Robot IDs. Bitte setze BROWSE_AI_ROBOT_ID_GOLD und BROWSE_AI_ROBOT_ID_SILVER in Vercel.' 
    });
  }

  try {
    // Check both robots in parallel
    const [goldRes, silverRes] = await Promise.all([
        fetch(`https://api.browse.ai/v2/robots/${robotIdGold}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${apiKey}` }
        }),
        fetch(`https://api.browse.ai/v2/robots/${robotIdSilver}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${apiKey}` }
        })
    ]);

    const goldData = await goldRes.json();
    const silverData = await silverRes.json();

    if (goldRes.ok && silverRes.ok) {
      return res.status(200).json({ 
        success: true, 
        message: 'Verbindung erfolgreich!', 
        robotName: `Gold: ${goldData.robot?.name || 'OK'} | Silver: ${silverData.robot?.name || 'OK'}` 
      });
    } else {
      let errorMessage = "Fehler bei: ";
      if (!goldRes.ok) errorMessage += `Gold (${goldData.message || goldRes.statusText}) `;
      if (!silverRes.ok) errorMessage += `Silver (${silverData.message || silverRes.statusText})`;
      
      return res.status(400).json({ 
        success: false, 
        message: `Browse.ai API Fehler: ${errorMessage}` 
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
