import { EmailTemplate } from '../types';

// Helper to safely handle responses that might not be JSON (e.g. 404/500 HTML pages)
const handleResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || `Server Fehler (${response.status})`);
    }
    return data;
  } else {
    // If not JSON, read text to show the actual server error (likely HTML or plain text)
    const text = await response.text();
    console.error("Non-JSON Response:", text);
    throw new Error(`Server antwortete nicht mit JSON (Status ${response.status}). Prüfe die Vercel Logs.`);
  }
};

export const sendTestAlarm = async (email: string, phone: string, sendEmail: boolean, sendSms: boolean) => {
  try {
    const response = await fetch('/api/send-test-alarm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, phone, sendEmail, sendSms })
    });
    return await handleResponse(response);
  } catch (error: any) {
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

    const data = await handleResponse(response);
    
    if (data.url) {
      window.location.href = data.url; // Redirect to Stripe
    } else {
      throw new Error("Keine Checkout URL erhalten");
    }
  } catch (error: any) {
    console.error("Checkout Error:", error);
    alert(`Fehler beim Starten des Bezahlvorgangs: ${error.message}`);
  }
};

export const sendTemplateTest = async (template: EmailTemplate, toEmail: string) => {
  try {
    const response = await fetch('/api/send-template-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template, toEmail })
    });
    return await handleResponse(response);
  } catch (error: any) {
    console.error("Template Test Error:", error);
    throw error;
  }
};

// Real connection test for Browse.AI
export const testBrowseAiConnection = async () => {
  try {
    const response = await fetch('/api/test-browse-ai');
    return await handleResponse(response);
  } catch (error: any) {
    console.error("Browse.ai Test Error:", error);
    throw error;
  }
};

// Real connection test for Gemini
export const testGeminiConnection = async () => {
  try {
    const response = await fetch('/api/test-gemini');
    return await handleResponse(response);
  } catch (error: any) {
    console.error("Gemini Test Error:", error);
    throw error;
  }
};