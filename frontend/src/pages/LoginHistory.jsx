import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import {
  History, Monitor, Smartphone, Laptop, CheckCircle, ShieldAlert,
  Clock, AlertTriangle, Loader2
} from 'lucide-react';

const LoginHistory = () => {
  const { t } = useTranslation();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await api.get('/login-history');
        setHistory(res.data.history || []);
      } catch (err) {
        console.error('Error fetching login history:', err);
        setError('Failed to load login history.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getDeviceIcon = (deviceType) => {
    if (deviceType === 'mobile') return <Smartphone className="h-4 w-4 text-sky-500" />;
    if (deviceType === 'laptop') return <Laptop className="h-4 w-4 text-indigo-500" />;
    return <Monitor className="h-4 w-4 text-slate-500" />;
  };

  const getOutcomeBadge = (outcome) => {
    switch (outcome) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle className="h-3 w-3" /> Successful
          </span>
        );
      case 'blocked_mobile_window':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-950/50 px-2.5 py-0.5 text-[11px] font-bold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            <ShieldAlert className="h-3 w-3" /> Blocked (Outside 10 AM-1 PM)
          </span>
        );
      case 'otp_verified':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            <CheckCircle className="h-3 w-3" /> Chrome OTP Verified
          </span>
        );
      case 'otp_pending':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/50 px-2.5 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <Clock className="h-3 w-3" /> OTP Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
            {outcome}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 fade-in text-left">
      
      {/* Title Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-md">
          <History className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-sans text-2xl font-extrabold text-slate-850 dark:text-white">
            {t('nav.loginHistory')}
          </h1>
          <p className="text-xs text-slate-400">
            Audit log of all your recent login attempts, devices, and security verifications.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 p-4 text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* History Table */}
      <div className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs overflow-hidden">
        {history.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 font-semibold italic">
            No login history records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-slate-600 dark:text-slate-300">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Device & Type</th>
                  <th className="py-3 px-3">Browser</th>
                  <th className="py-3 px-3">OS</th>
                  <th className="py-3 px-3">IP Address</th>
                  <th className="py-3 px-3 text-right">Outcome Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {history.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-3 font-bold text-slate-850 dark:text-slate-100 whitespace-nowrap">
                      {new Date(item.loginAt).toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </td>
                    <td className="py-4 px-3 capitalize flex items-center gap-2">
                      {getDeviceIcon(item.deviceType)}
                      <span>{item.deviceType || 'Desktop'}</span>
                    </td>
                    <td className="py-4 px-3 font-medium text-slate-700 dark:text-slate-200">
                      {item.browser}
                    </td>
                    <td className="py-4 px-3 text-slate-500">
                      {item.os}
                    </td>
                    <td className="py-4 px-3 font-mono text-[11px] text-slate-400">
                      {item.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="py-4 px-3 text-right whitespace-nowrap">
                      {getOutcomeBadge(item.outcome)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default LoginHistory;
