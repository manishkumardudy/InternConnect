import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api, { getMediaUrl } from '../services/api';
import { Building2, Globe, MapPin, Users, Save, AlertCircle, Image as ImageIcon } from 'lucide-react';

const CompanyProfile = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [company, setCompany] = useState({
    companyName: '',
    logoUrl: '',
    website: '',
    industry: '',
    companySize: '50-200',
    description: '',
    location: ''
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await api.get('/companies/me');
        if (res.data.company) {
          setCompany(res.data.company);
        }
      } catch (err) {
        console.error('Error fetching company profile:', err);
      }
    };

    fetchCompany();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.put('/companies/me', company);
      setCompany(res.data.company);
      setMessage({ type: 'success', text: t('companyProfile.successSaved') });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || t('companyProfile.failedSaved') });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 fade-in text-left">
      
      <div className="flex items-center gap-3 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-md shrink-0">
          {company.logoUrl && !logoError ? (
            <img
              src={getMediaUrl(company.logoUrl)}
              alt="Logo"
              onError={() => setLogoError(true)}
              className="h-10 w-10 rounded-xl object-contain bg-white p-0.5"
            />
          ) : (
            <Building2 className="h-6 w-6" />
          )}
        </div>
        <div>
          <h1 className="font-sans text-2xl font-extrabold text-slate-850 dark:text-white">{t('companyProfile.title')}</h1>
          <p className="text-xs text-slate-400">{t('companyProfile.subtitle')}</p>
        </div>
      </div>

      {message.text && (
        <div className={`mt-6 rounded-xl p-4 text-xs font-bold border ${
          message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-5">
        
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{t('companyProfile.companyName')}</label>
          <input
            type="text"
            required
            value={company.companyName}
            onChange={(e) => setCompany({ ...company, companyName: e.target.value })}
            placeholder="e.g. Razorpay Technologies"
            className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{t('companyProfile.logoUrl')}</label>
          <div className="flex gap-3 items-center">
            <input
              type="text"
              value={company.logoUrl}
              onChange={(e) => {
                setLogoError(false);
                setCompany({ ...company, logoUrl: e.target.value });
              }}
              placeholder="https://example.com/logo.png"
              className="block flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
            />
            {company.logoUrl ? (
              <div className="h-11 w-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-xs">
                <img
                  src={getMediaUrl(company.logoUrl)}
                  alt="Preview"
                  onError={() => setLogoError(true)}
                  className="h-full w-full object-contain"
                />
              </div>
            ) : null}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Accepts absolute URLs (e.g., https://example.com/logo.png) or local image paths.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{t('companyProfile.websiteUrl')}</label>
            <input
              type="url"
              value={company.website}
              onChange={(e) => setCompany({ ...company, website: e.target.value })}
              placeholder="https://company.com"
              className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{t('companyProfile.industry')}</label>
            <input
              type="text"
              value={company.industry}
              onChange={(e) => setCompany({ ...company, industry: e.target.value })}
              placeholder="e.g. Fintech & Payments"
              className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{t('companyProfile.hqLocation')}</label>
            <input
              type="text"
              value={company.location}
              onChange={(e) => setCompany({ ...company, location: e.target.value })}
              placeholder="e.g. Bangalore, India"
              className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{t('companyProfile.companySize')}</label>
            <input
              type="text"
              value={company.companySize}
              onChange={(e) => setCompany({ ...company, companySize: e.target.value })}
              placeholder="e.g. 1000-5000 employees"
              className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{t('companyProfile.descLabel')}</label>
          <textarea
            rows="4"
            value={company.description}
            onChange={(e) => setCompany({ ...company, description: e.target.value })}
            placeholder={t('companyProfile.descPlaceholder')}
            className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-animate w-full rounded-xl bg-sky-600 py-3.5 text-xs font-bold text-white shadow-md hover:bg-sky-500 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          <Save className="h-4 w-4" />
          {saving ? t('companyProfile.saving') : t('companyProfile.saveBtn')}
        </button>

      </form>

    </div>
  );
};

export default CompanyProfile;
