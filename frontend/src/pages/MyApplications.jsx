import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api, { getMediaUrl } from '../services/api';
import { FileText, Building2, MapPin, DollarSign, Calendar, AlertCircle, ArrowRight } from 'lucide-react';

const MyApplications = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const res = await api.get('/students/me/applications');
        setApplications(res.data.applications || []);
      } catch (err) {
        console.error('Error loading candidate applications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 fade-in text-left">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="font-sans text-2xl font-extrabold text-slate-850 dark:text-white">{t('myApplications.title')}</h1>
          <p className="text-xs text-slate-400 mt-1">{t('myApplications.subtitle')}</p>
        </div>

        <Link
          to="/browse"
          className="btn-animate rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-sky-500 shrink-0"
        >
          {t('myApplications.browseBtn')}
        </Link>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400 font-semibold animate-pulse">
          {t('myApplications.loading')}
        </div>
      ) : applications.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-16 text-center text-slate-400">
          <FileText className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700" />
          <p className="mt-4 text-sm font-semibold">{t('myApplications.noApplications')}</p>
          <Link
            to="/browse"
            className="btn-animate mt-4 inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-sky-500"
          >
            {t('myApplications.exploreListings')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {applications.map((app) => (
            <div
              key={app._id}
              onClick={() => navigate(`/listings/${app.listingId?._id}`)}
              className="card-hover cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <img
                  src={getMediaUrl(app.listingId?.companyId?.logoUrl) || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150'}
                  alt={app.listingId?.title}
                  className="h-12 w-12 rounded-xl object-contain ring-1 ring-slate-100 dark:ring-slate-800 bg-white dark:bg-slate-950 p-1 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[9px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      {app.listingId?.type}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">• {t('myApplications.appliedOn', { date: new Date(app.createdAt).toLocaleDateString() })}</span>
                  </div>

                  <h3 className="font-sans text-base font-bold text-slate-850 dark:text-white mt-1 hover:text-sky-600">
                    {app.listingId?.title}
                  </h3>

                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    {app.listingId?.companyId?.companyName}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex flex-col sm:items-end gap-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">{t('myApplications.applicationStatus')}</span>
                <span className={`rounded-full px-3.5 py-1 text-xs font-bold tracking-wide flex items-center gap-1.5 ${
                  app.status === 'hired' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                  app.status === 'shortlisted' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                  app.status === 'rejected' ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800' :
                  'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                }`}>
                  {app.status === 'hired' ? t('myApplications.statusHired') :
                   app.status === 'shortlisted' ? t('myApplications.statusShortlisted') :
                   app.status === 'rejected' ? t('myApplications.statusRejected') :
                   t('myApplications.statusPending')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default MyApplications;
