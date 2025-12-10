import React, { useState } from 'react';
import { Check, Star, TrendingUp, MousePointer, Clock, ArrowRight, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { supabase, getEnv } from '../lib/supabase';

interface AffiliateSignupProps {
  onLoginClick: () => void;
  onRegister: () => void;
  onNavigate: (page: string) => void;
  commissionRate: number;
}

export const AffiliateSignupPage: React.FC<AffiliateSignupProps> = ({ onLoginClick, onRegister, onNavigate, commissionRate }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    website: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Das Passwort muss mindestens 6 Zeichen lang sein.");
      return;
    }

    setIsLoading(true);

    try {
      // Determine the redirect URL (Production vs Local)
      const siteUrl = getEnv('VITE_SITE_URL') ?? window.location.origin;
      // Redirect to affiliate login page after confirmation
      // Remove trailing slash if present to avoid double slash issues
      const cleanSiteUrl = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;
      const redirectUrl = `${cleanSiteUrl}/affiliate-login`; 

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: 'AFFILIATE', // CRITICAL: Sets the correct role via DB trigger
            website: formData.website
          }
        }
      });

      if (signUpError) throw signUpError;

      setIsSuccess(true);
      // Optional: call parent prop if needed, but we show local success state
      // onRegister(); 

    } catch (err: any) {
      console.error("Affiliate Signup Error:", err);
      setError(err.message || "Ein Fehler ist aufgetreten.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
           <div className="bg-white py-12 px-6 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-200 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 animate-in zoom-in duration-300">
                <CheckCircle size={40} />
              </div>
              <h2 className="text-2xl font-bold text-[#00305e] mb-4">Willkommen im Team!</h2>
              <p className="text-slate-600 mb-6">
                Dein Partner-Account wurde erstellt. Wir haben eine Bestätigungs-E-Mail an <strong>{formData.email}</strong> gesendet.
              </p>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8 text-sm text-blue-800 text-left">
                <strong>Wichtig:</strong> Bitte klicke auf den Link in der E-Mail, um deinen Account zu aktivieren. Du wirst anschließend zum Partner-Login weitergeleitet.
              </div>
              
              <Button onClick={onLoginClick} className="w-full justify-center bg-[#00305e]">
                Zum Partner Login
              </Button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left Side: Form */}
      <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Werde ResortPassAlarm Partner</h1>
          <p className="text-slate-500 mb-8">Registriere dich jetzt und starte in weniger als 3 Minuten.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vorname</label>
                <input 
                  required 
                  type="text" 
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nachname</label>
                <input 
                  required 
                  type="text" 
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Adresse</label>
              <input 
                required 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Deine Webseite / Kanal <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input 
                type="text" 
                placeholder="z.B. Instagram, TikTok, Blog..." 
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Passwort erstellen</label>
                <input 
                  required 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Passwort wiederholen</label>
                <input 
                  required 
                  type="password" 
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                />
              </div>
            </div>

            <div className="flex items-center gap-3 py-2">
              <input required type="checkbox" id="terms" className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
              <label htmlFor="terms" className="text-sm text-slate-600">
                Ich stimme den <button type="button" onClick={() => onNavigate('terms')} className="text-blue-600 hover:underline">Partnerbedingungen</button> zu.
              </label>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4 border border-red-200 flex gap-3">
                 <AlertCircle className="text-red-500 shrink-0" size={20} />
                 <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button type="submit" size="lg" disabled={isLoading} className="w-full bg-[#00305e] text-white hover:bg-[#002040]">
              {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Registriere...
                  </>
              ) : (
                  <>
                    Kostenlos registrieren
                    <ArrowRight size={18} />
                  </>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-600 text-sm">
              Oder
            </p>
            <button onClick={onLoginClick} className="mt-2 text-[#00305e] font-semibold hover:underline">
              Bereits einen Account? Hier einloggen
            </button>
          </div>
        </div>
      </div>

      {/* Right Side: Benefits */}
      <div className="w-full md:w-1/2 bg-[#00305e] text-white p-8 md:p-12 lg:p-16 flex flex-col justify-center relative overflow-hidden">
        {/* Background Texture */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20"></div>

        <div className="relative z-10 max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-[#ffcc00]">Deine Vorteile als Partner</h2>

          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="bg-white/10 p-3 rounded-xl h-fit">
                <TrendingUp className="text-[#ffcc00]" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Hohe Provision</h3>
                <p className="text-blue-200 text-sm leading-relaxed">
                  {commissionRate}% Lifetime auf alle Umsätze. Verdiene dauerhaft an jedem vermittelten Abo.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-white/10 p-3 rounded-xl h-fit">
                <MousePointer className="text-[#ffcc00]" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Einfaches Tracking</h3>
                <p className="text-blue-200 text-sm leading-relaxed">
                  Erhalte einen individuellen Link. Wir tracken jeden Klick und jeden Kauf automatisch.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-white/10 p-3 rounded-xl h-fit">
                <Clock className="text-[#ffcc00]" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Schnelle Auszahlung</h3>
                <p className="text-blue-200 text-sm leading-relaxed">
                  Direkte Auszahlung auf dein Konto!
                </p>
              </div>
            </div>
          </div>

          {/* Testimonial Card */}
          <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex gap-1 text-[#ffcc00] mb-3">
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
            </div>
            <p className="italic text-blue-100 mb-4 font-medium leading-relaxed">
              "Seit ich ResortPassAlarm empfehle, finanziere ich mir meine eigenen Parkbesuche komplett durch die Provisionen."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">
                TM
              </div>
              <div>
                <p className="font-bold text-sm">Thomas M.</p>
                <p className="text-xs text-blue-300">TikTok-Influencer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};