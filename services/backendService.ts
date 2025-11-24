import { EmailTemplate } from '../types';

export const sendTestAlarm = async (email: string, phone: string, sendEmail: boolean, sendSms: boolean) => {
  try {
    const response = await fetch('/api/send-test-alarm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, phone, sendEmail, sendSms })
    });

    if (!response.ok) {
      throw new Error('Netzwerkfehler beim Senden des Alarms');
    }

    return await response.json();
  } catch (error) {
    console.error("Backend Service Error:", error);
    throw error;
  }
};

export const createCheckoutSession = async (email: string) => {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    
    if (data.url) {
      window.location.href = data.url; // Redirect to Stripe
    } else {
      throw new Error("Keine Checkout URL erhalten");
    }
  } catch (error) {
    console.error("Checkout Error:", error);
    alert("Fehler beim Starten des Bezahlvorgangs. Bitte versuche es später.");
  }
};

// Simulate sending a template-based email (In real app, this hits an API endpoint)
export const sendTemplateTest = async (template: EmailTemplate) => {
  console.log("Sending Template Test:", template);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  return true;
};

// Real connection test for Browse.AI
export const testBrowseAiConnection = async () => {
  try {
    const response = await fetch('/api/test-browse-ai');
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Verbindung fehlgeschlagen');
    }
    
    return data;
  } catch (error) {
    console.error("Browse.ai Test Error:", error);
    throw error;
  }
};