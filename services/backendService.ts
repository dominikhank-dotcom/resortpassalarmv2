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
    // Check for referral code in local storage
    const referralCode = localStorage.getItem('resortpass_referral');

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, referralCode })
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

export const sendTemplateTest = async (template: EmailTemplate, toEmail: string, urls?: { gold: string, silver: string }) => {
  try {
    const response = await fetch('/api/send-template-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template, toEmail, urls })
    });
    return await handleResponse(response);
  } catch (error: any) {
    console.error("Send Template Error:", error);
    throw error;
  }
};

export const testBrowseAiConnection = async () => {
  try {
    const response = await fetch('/api/test-browse-ai', {
      method: 'GET',
    });
    return await handleResponse(response);
  } catch (error: any) {
    console.error("Browse AI Test Error:", error);
    throw error;
  }
};

export const testGeminiConnection = async () => {
  try {
    const response = await fetch('/api/test-gemini', {
      method: 'GET',
    });
    return await handleResponse(response);
  } catch (error: any) {
    console.error("Gemini Test Error:", error);
    throw error;
  }
};

export const manageSubscription = async (userId: string, action: 'grant_free' | 'revoke_free') => {
  try {
    const response = await fetch('/api/manage-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action })
    });
    return await handleResponse(response);
  } catch (error: any) {
      console.error("Manage Subscription Error:", error);
      throw error;
  }
};