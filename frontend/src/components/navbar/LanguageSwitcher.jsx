import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import useClickOutside from '../../hooks/useClickOutside';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'fr', label: 'Français (OTP)', flag: '🇫🇷' },
];

const EMPTY_OTP = { open: false, code: '', error: '', loading: false };

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [otp, setOtp] = useState(EMPTY_OTP); // French ke liye OTP popup ki state

  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  // Language save karna (sirf tab jab user login ho)
  const saveLanguage = async (code) => {
    i18n.changeLanguage(code);
    if (!user) return;
    try {
      await api.patch('/auth/update-language', { language: code });
    } catch (e) {
      console.error('Language save nahi hui:', e);
    }
  };

  const handleSelect = async (code) => {
    setOpen(false);

    // Rule: French ke liye pehle email OTP verify karna padta hai
    if (code === 'fr') {
      setOtp({ ...EMPTY_OTP, open: true });
      try {
        await api.post('/otp/send', { purpose: 'language_change_fr' });
      } catch (err) {
        setOtp({
          ...EMPTY_OTP,
          open: true,
          error: err.response?.data?.message || 'OTP bhejne me dikkat aayi.',
        });
      }
      return;
    }

    // Baaki languages seedha badal jaati hain
    saveLanguage(code);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.code.trim();
    if (code.length !== 6) {
      setOtp({ ...otp, error: 'Please enter a valid 6-digit OTP code.' });
      return;
    }

    setOtp({ ...otp, loading: true, error: '' });
    try {
      await api.post('/otp/verify', { code, purpose: 'language_change_fr' });
      await saveLanguage('fr');
      setOtp(EMPTY_OTP);
    } catch (err) {
      setOtp({
        ...otp,
        loading: false,
        error: err.response?.data?.message || 'French OTP verification failed.',
      });
    }
  };

  return (
    <>
      {/* Language button + dropdown */}
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 rounded-md border border-gray-300 px-2.5 py-1.5 text-xs font-semibold uppercase text-gray-700 hover:bg-gray-50"
          title="Select language"
        >
          <Languages className="h-4 w-4 text-primary" />
          {(i18n.language || 'en').slice(0, 2)}
        </button>

        {open && (
          <div className="absolute right-0 z-50 mt-2 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                  i18n.language?.startsWith(lang.code)
                    ? 'font-semibold text-primary'
                    : 'text-gray-700'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* French OTP popup */}
      {otp.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm space-y-4 rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Activer le français</h3>
              <button onClick={() => setOtp(EMPTY_OTP)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Un code OTP à 6 chiffres a été envoyé à votre adresse e-mail pour activer la langue française.
            </p>
            {otp.error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">{otp.error}</div>
            )}
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                type="text"
                maxLength={6}
                value={otp.code}
                onChange={(e) => setOtp({ ...otp, code: e.target.value })}
                placeholder="123456"
                className="w-full rounded-md border border-gray-300 px-4 py-3 text-center font-mono text-lg tracking-widest"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOtp(EMPTY_OTP)}
                  className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-md"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={otp.loading}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
                >
                  {otp.loading ? 'Vérification...' : 'Vérifier et activer le français'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
