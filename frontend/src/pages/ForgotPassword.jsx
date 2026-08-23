import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { forgotPasswordApi } from '../services/api';
import { Mail, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [identifier, setIdentifier] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!identifier.trim()) {
      setErrorMessage(t('forgotPassword.enterIdentifierMsg'));
      return;
    }

    setSubmitting(true);

    try {
      const res = await forgotPasswordApi(identifier.trim());
      setSuccessMessage(res.data?.message || t('forgotPassword.resetSuccessMsg'));
      setIdentifier('');
    } catch (err) {
      const apiMsg = err.response?.data?.message || t('forgotPassword.resetFailedMsg');
      setErrorMessage(apiMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center transition-colors duration-300">
      <div className="max-w-md w-full space-y-6">
        
        {/* Card */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-inner">
              <KeyRound className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('forgotPassword.title')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('forgotPassword.sub')}
            </p>
          </div>

          {/* Alert Messages */}
          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" /> {t('forgotPassword.resetRequested')}
              </div>
              <p>{successMessage}</p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 font-bold text-sky-600 dark:text-sky-400 hover:underline"
                >
                  {t('forgotPassword.proceedToLogin')}
                </Link>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-medium flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          {!successMessage && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  {t('forgotPassword.identifierLabel')}
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={t('forgotPassword.identifierPlaceholder')}
                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 pl-10 pr-3 py-3 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-sky-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-animate w-full rounded-xl bg-sky-600 py-3.5 text-xs font-bold text-white shadow-md hover:bg-sky-500 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t('forgotPassword.resetting')}
                  </>
                ) : (
                  <>
                    {t('forgotPassword.resetBtn')} <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Back Link */}
          <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> {t('forgotPassword.backToLogin')}
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
