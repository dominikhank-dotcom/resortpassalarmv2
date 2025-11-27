import { EmailTemplate } from '../types';
import { supabase } from '../lib/supabase';

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

export const getCustomerDetails = async (userId: string) => {
  try {
      const response = await fetch('/api/get-customer-details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
      });
      return await handleResponse(response);
  } catch (error: any) {
      console.error("Get Customer Details Error:", error);
      throw error;
  }
};

export const updateAffiliateProfile = async (settings: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Nicht eingeloggt");

    const { error } = await supabase.from('profiles').update({
        first_name: settings.firstName,
        last_name: settings.lastName,
        website: settings.website,
        referral_code: settings.referralCode,
        street: settings.street,
        house_number: settings.houseNumber,
        zip: settings.zip,
        city: settings.city,
        country: settings.country,
        paypal_email: settings.paypalEmail
    }).eq('id', user.id);

    if (error) throw error;
};

// --- SYSTEM SETTINGS ---

export const getSystemSettings = async () => {
  try {
    const response = await fetch('/api/system-settings', {
      method: 'GET'
    });
    if (response.status === 404) {
      // API not available yet (maybe due to build error), fail gracefully
      console.warn("System Settings API not found (404). Using defaults.");
      return null;
    }
    return await handleResponse(response);
  } catch (error: any) {
    console.error("Get Settings Error:", error);
    return null;
  }
};

export const updateSystemSettings = async (key: string, value: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Nicht eingeloggt");

    try {
        const response = await fetch('/api/system-settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, value, userId: user.id })
        });
        return await handleResponse(response);
    } catch (error: any) {
        console.error("Update Settings Error:", error);
        throw error;
    }
};