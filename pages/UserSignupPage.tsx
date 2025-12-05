
import React, { useState } from 'react';
import { Lock, ShieldCheck, Mail, User, ArrowRight, AlertCircle, CheckCircle, Loader2, Ticket } from 'lucide-react';
import { Button } from '../components/Button';
import { supabase, getEnv } from '../lib/supabase';

interface UserSignupProps {
  onLoginClick: () => void;
  onRegister: () => void;
  onNavigate: (page: string) => void;
}

export const UserSignupPage: React.FC<UserSignupProps> = ({ onLoginClick, onRegister, onNavigate }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  // New: Preferences, default OFF
  const [preferences, setPreferences] = useState({
    gold: false,
    silver: false
  });

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError("Bitte fülle alle Pflichtfelder aus.");
      return;
    }
    if (!validateEmail(formData.email)) {
      setError("Bitte gib eine gültige E-Mail Adresse ein.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Das Passwort muss mindestens 6 Zeichen lang sein.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }
    // New Validation: At least one pass type selected
    if (!preferences.gold && !preferences.silver) {
      setError("Bitte wähle mindestens einen ResortPass aus, den du überwachen möchtest.");
      return;
    }

    setIsLoading(true);

    try {
      // Determine the redirect URL (Production vs Local)
      const siteUrl = getEnv('VITE_SITE_URL') ?? window.location.origin;
      // Force redirect to /login so App.tsx picks it up
      const redirectUrl = `${siteUrl}/login`;

      // 0. CHECK FOR REFERRAL CODE (Critical for tracking)
      const referralCode = localStorage.getItem('resortpass_referral');

      // 1. Sign up with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: 'CUSTOMER',
            // Save referral code directly to user metadata for robust tracking
            referred_by: referralCode || null,
            // Save notification preferences
            notify_gold: preferences.gold,
            notify_silver: preferences.silver
          }
        }
      });

      if (signUpError) throw signUpError;

      // Note: We do NOT send the welcome email here anymore. 
      // It is triggered in App.tsx only after the user has confirmed email & logged in.

      setIsSuccess(true);

    } catch (err: any) {
      console.error("Signup Error:", err);
      setError(err.message || "Ein Fehler ist aufgetreten. Bitte versuche es später erneut.");
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
              <h2 className="text-2xl font-bold text-[#00305e] mb-4">Fast geschafft!</h2>
              <p className="text-slate-600 mb-6">
                Wir haben eine Bestätigungs-E-Mail an <strong>{formData.email}</strong> gesendet.
              </p>
              
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8 text-sm text-blue-800 text-left">
                <strong>Wichtig:</strong> Bitte klicke auf den Link in der E-Mail, um deinen Account zu aktivieren. Erst danach ist der Login möglich.
              </div>
              
              <Button onClick={onLoginClick} className="w-full justify-center bg-[#00305e]">
                Zum Login
              </Button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-[#00305e]">
          Account erstellen
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Der erste Schritt zu deinem ResortPass.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-slate-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">
                  Vorname
                </label>
                <div className="mt-1 relative">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="block w-full appearance-none rounded-lg border border-slate-300 px-3 py-2 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">
                  Nachname
                </label>
                <div className="mt-1 relative">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="block w-full appearance-none rounded-lg border border-slate-300 px-3 py-2 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                E-Mail Adresse
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="block w-full appearance-none rounded-lg border border-slate-300 pl-10 px-3 py-2 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Pass Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Welchen Pass suchst du? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`relative flex flex-col items-center p-4 border rounded-xl cursor-pointer transition-all ${preferences.gold ? 'border-yellow-500 bg-yellow-50 ring-1 ring-yellow-500' : 'border-slate-200 hover:border-yellow-200'}`}>
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={preferences.gold} 
                    onChange={(e) => setPreferences({...preferences, gold: e.target.checked})} 
                  />
                  <div className={`p-2 rounded-full mb-2 ${preferences.gold ? 'bg-yellow-100 text-yellow-600' : 'bg-slate-100 text-slate-400'}`}>
                    <Ticket size={24} />
                  </div>
                  <span className={`font-bold ${preferences.gold ? 'text-slate-900' : 'text-slate-500'}`}>ResortPass Gold</span>
                </label>

                <label className={`relative flex flex-col items-center p-4 border rounded-xl cursor-pointer transition-all ${preferences.silver ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-200'}`}>
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={preferences.silver} 
                    onChange={(e) => setPreferences({...preferences, silver: e.target.checked})} 
                  />
                  <div className={`p-2 rounded-full mb-2 ${preferences.silver ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                    <Ticket size={24} />
                  </div>
                  <span className={`font-bold ${preferences.silver ? 'text-slate-900' : 'text-slate-500'}`}>ResortPass Silver</span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Passwort festlegen
              </label>
              <div className="mt-1 relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="block w-full appearance-none rounded-lg border border-slate-300 pl-10 px-3 py-2 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                Passwort wiederholen
              </label>
              <div className="mt-1 relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="block w-full appearance-none rounded-lg border border-slate-300 pl-10 px-3 py-2 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
            
            {error && (
              <div className="rounded-md bg-red-50 p-4 border border-red-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                className="w-full flex justify-center bg-[#00305e] text-white hover:bg-[#002040] shadow-md"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Wird erstellt...
                  </>
                ) : (
                  <>
                    Weiter zur Buchung
                    <ArrowRight size={18} />
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-slate-500">Bereits Kunde?</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <Button
                onClick={onLoginClick}
                variant="outline"
                className="w-full justify-center"
              >
                Hier einloggen
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center space-y-4">
           <div className="flex items-center justify-center gap-2 text-green-700 text-sm font-medium">
             <ShieldCheck size={16} />
             Sichere SSL-Verschlüsselung
           </div>
           <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
             Indem du fortfährst, stimmst du unseren <button onClick={() => onNavigate('terms')} className="underline hover:text-slate-600">Nutzungsbedingungen</button> und der <button onClick={() => onNavigate('privacy')} className="underline hover:text-slate-600">Datenschutzerklärung</button> zu.
           </p>
        </div>
      </div>
    </div>
  );
};
