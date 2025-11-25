import { Resend } from 'resend';
import twilio from 'twilio';
import { getServiceSupabase } from './_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data } = req.body;
    
    // 1. Produkt erkennen anhand der URL (Gold oder Silver)
    const originUrl = data?.inputParameters?.originUrl || '';
    let productUrl = originUrl;
    let productName = 'ResortPass';
    
    if (originUrl.toLowerCase().includes('gold')) {
        productName = 'ResortPass Gold';
    } else if (originUrl.toLowerCase().includes('silver')) {
        productName = 'ResortPass Silver';
    }

    // 2. Verfügbarkeit prüfen (Universelle Textsuche)
    // Wir wandeln alle gescrapten Daten in einen Text um und suchen nach negativen Keywords.
    // Wenn KEIN negatives Keyword gefunden wird, nehmen wir an, es ist verfügbar.
    const capturedLists = data?.capturedLists || {};
    const textDump = JSON.stringify(capturedLists).toLowerCase();
    
    const negativeKeywords = [
        'ausverkauft', 
        'nicht verfügbar', 
        'derzeit nicht verfügbar', 
        'sold out', 
        'leider ist dieses produkt',
        'momentan nicht verfügbar'
    ];
    
    const isSoldOut = negativeKeywords.some(kw => textDump.includes(kw));
    
    if (isSoldOut) {
        // Loggen für Debugging, aber kein Alarm
        console.log(`Check ${productName}: Weiterhin ausverkauft.`);
        return res.status(200).json({ message: `Checked ${productName}: Still sold out.`, status: 'sold_out' });
    }

    // WENN WIR HIER SIND -> ALARM! VERFÜGBAR!
    console.log(`🚨 ALARM TRIGGERED FOR ${productName}`);

    // 3. Echte Abonnenten aus der Datenbank laden
    // Lazy Load Services (nur initialisieren wenn Keys da sind)
    const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
    const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) 
        ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) 
        : null;

    const supabase = getServiceSupabase();
    
    // Wir holen alle Profile, die ein aktives Abonnement haben
    const { data: subs, error } = await supabase
        .from('subscriptions')
        .select(`
            user_id,
            profiles (email) 
        `)
        .eq('status', 'active');

    if (error) {
        console.error("DB Error:", error);
        return res.status(500).json({ error: 'Database error fetching subscribers' });
    }

    let sentCount = 0;

    // 4. Benachrichtigungen versenden
    for (const sub of subs || []) {
        const email = sub.profiles?.email;
        if (!email) continue;

        // E-Mail Senden
        if (resend) {
            try {
                await resend.emails.send({
                    from: 'ResortPass Alarm <alarm@resortpassalarm.com>',
                    to: email,
                    subject: `🚨 ${productName.toUpperCase()} VERFÜGBAR!`,
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: 0 auto;">
                            <h1 style="color: #d32f2f; margin-bottom: 10px;">Schnell sein!</h1>
                            <p style="font-size: 16px; color: #333;">Der <strong>${productName}</strong> scheint wieder verfügbar zu sein.</p>
                            <p>Warte nicht lange, die Kontingente sind oft winzig.</p>
                            
                            <a href="${productUrl}" style="background-color: #00305e; color: #ffcc00; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; display: inline-block; margin: 20px 0;">
                                Direkt zum Shop
                            </a>
                            
                            <p style="font-size: 12px; color: #888; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
                                Dies ist eine automatische Nachricht von deinem ResortPassWächter.<br/>
                                <a href="https://resortpassalarm.com/dashboard" style="color: #888;">Einstellungen ändern</a>
                            </p>
                        </div>
                    `
                });
                sentCount++;
            } catch(e) { console.error(`Failed to email ${email}`, e); }
        }
        
        // SMS Logik hier, falls Telefonnummern in DB gespeichert werden
        // if (twilioClient && sub.profiles.phone) { ... }
    }

    return res.status(200).json({ success: true, sent: sentCount, product: productName });

  } catch (error) {
     console.error("Webhook Error:", error);
     return res.status(500).json({ error: error.message });
  }
}