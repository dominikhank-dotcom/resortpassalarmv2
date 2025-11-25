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
    let referralCode = null;
    
    // Check new JSON format
    const storedData = localStorage.getItem('resortpass_ref_data');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        if (Date.now() <= parsed.expiry) {
          referralCode = parsed.code;
        } else {
          localStorage.removeItem('resortpass_ref_data'); // Expired
        }
      } catch (e) {
        // Ignored
      }
    }
    
    // Fallback Legacy
    if (!referralCode) {
       referralCode = localStorage.getItem('resortpass_referral');
    }

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

// --- PAYOUT SERVICES ---

export const requestPayout = async (partnerId: string, paypalEmail: string) => {
  try {
    const response = await fetch('/api/request-payout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partnerId, paypalEmail })
    });
    return await handleResponse(response);
  } catch (error: any) {
    console.error("Payout Request Error:", error);
    throw error;
  }
};

export const fetchAdminPayouts = async () => {
  try {
     const response = await fetch('/api/admin-payouts');
     return await handleResponse(response);
  } catch (error: any) {
     console.error("Fetch Payouts Error:", error);
     throw error;
  }
};

export const markPayoutPaid = async (payoutId: string) => {
  try {
    const response = await fetch('/api/admin-payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutId })
    });
    return await handleResponse(response);
  } catch (error: any) {
      console.error("Mark Paid Error:", error);
      throw error;
  }
};

// --- CUSTOMER MANAGEMENT ---

export const toggleFreeSubscription = async (userId: string, isFree: boolean) => {
    // Note: Since we don't have a secure Admin Backend API for this specific task yet,
    // and we are using client-side Supabase for Admin Dashboard (which is fine for MVP if RLS allows it),
    // we perform this operation directly here.
    // Ideally, this should be an API route to verify Admin status securely on server.
    
    if (isFree) {
        // Activate Free Sub
        const { error } = await supabase
            .from('subscriptions')
            .upsert({ 
                user_id: userId,
                status: 'active',
                plan: 'free_admin',
                current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
            }, { onConflict: 'user_id' });
        
        if (error) throw new Error(error.message);
    } else {
        // Cancel Sub
        const { error } = await supabase
            .from('subscriptions')
            .update({ status: 'cancelled', plan: 'cancelled' })
            .eq('user_id', userId);
            
        if (error) throw new Error(error.message);
    }
};