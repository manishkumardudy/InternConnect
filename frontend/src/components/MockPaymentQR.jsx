import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Check } from 'lucide-react';

const MockPaymentQR = ({ upiId = 'internconnect@okhdfcbank' }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-2xl border border-sky-200 dark:border-sky-800/60 bg-sky-50/70 dark:bg-slate-800/80 p-4 text-center space-y-3 shadow-xs">
      {/* Fake QR Code Container */}
      <div className="flex justify-center">
        <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-200/80">
          <svg viewBox="0 0 100 100" className="w-32 h-32 text-slate-900 fill-current">
            {/* Background */}
            <rect x="0" y="0" width="100" height="100" fill="#ffffff" rx="6" />

            {/* Top-Left Position Pattern */}
            <rect x="6" y="6" width="28" height="28" fill="none" stroke="#0f172a" strokeWidth="4" rx="3" />
            <rect x="12" y="12" width="16" height="16" fill="#0f172a" rx="1.5" />

            {/* Top-Right Position Pattern */}
            <rect x="66" y="6" width="28" height="28" fill="none" stroke="#0f172a" strokeWidth="4" rx="3" />
            <rect x="72" y="12" width="16" height="16" fill="#0f172a" rx="1.5" />

            {/* Bottom-Left Position Pattern */}
            <rect x="6" y="66" width="28" height="28" fill="none" stroke="#0f172a" strokeWidth="4" rx="3" />
            <rect x="12" y="72" width="16" height="16" fill="#0f172a" rx="1.5" />

            {/* Timing / Alignment Dots & Data Matrix Grid */}
            <rect x="42" y="10" width="6" height="6" fill="#0f172a" rx="1" />
            <rect x="52" y="10" width="6" height="6" fill="#0f172a" rx="1" />
            <rect x="10" y="42" width="6" height="6" fill="#0f172a" rx="1" />
            <rect x="10" y="52" width="6" height="6" fill="#0f172a" rx="1" />

            {/* Center & Right Matrix Patterns */}
            <rect x="40" y="40" width="6" height="6" fill="#0f172a" rx="1" />
            <rect x="48" y="40" width="6" height="6" fill="#0f172a" rx="1" />
            <rect x="56" y="40" width="6" height="6" fill="#0f172a" rx="1" />
            <rect x="64" y="40" width="6" height="6" fill="#0f172a" rx="1" />
            <rect x="72" y="40" width="6" height="6" fill="#0f172a" rx="1" />
            <rect x="80" y="40" width="6" height="6" fill="#0f172a" rx="1" />

            <rect x="40" y="48" width="6" height="6" fill="#0f172a" rx="1" />
            <rect x="56" y="48" width="6" height="6" fill="#0f172a" rx="1" />
            <rect x="72" y="48" width="6" height="6" fill="#0f172a" rx="1" />
            <rect x="80" y="48" width="6" height="6" fill="#0f172a" rx="1" />

            <rect x="48" y="56" width="6" height="6" fill="#0f172a" rx="1" />
            <rect x="64" y="56" width="6" height="6" fill="#0f172a" rx="1" />
            <rect x="80" y="56" width="6" height="6" fill="#0f172a" rx="1" />
            <rect x="88" y="56" width="6" height="6" fill="#0f172a" rx="1" />

            <rect x="40" y="64" width="6" height="6" fill="#0f172a" rx="1" />
            <rect x="56" y="64" width="6" height="6" fill="#0f172a" rx="1" />
            <rect x="72" y="64" width="6" height="6" fill="#0f172a" rx="1" />

            <rect x="48" y="72" width="6" height="6" fill="#0f172a" rx="1" />
            <rect x="64" y="72" width="6" height="6" fill="#0f172a" rx="1" />
            <rect x="80" y="72" width="6" height="6" fill="#0f172a" rx="1" />
            <rect x="88" y="72" width="6" height="6" fill="#0f172a" rx="1" />

            <rect x="40" y="80" width="6" height="6" fill="#0f172a" rx="1" />
            <rect x="56" y="80" width="6" height="6" fill="#0f172a" rx="1" />
            <rect x="72" y="80" width="6" height="6" fill="#0f172a" rx="1" />

            <rect x="48" y="88" width="6" height="6" fill="#0f172a" rx="1" />
            <rect x="64" y="88" width="6" height="6" fill="#0f172a" rx="1" />
            <rect x="80" y="88" width="6" height="6" fill="#0f172a" rx="1" />
          </svg>
        </div>
      </div>

      {/* Copyable UPI ID Box */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg shadow-xs break-all max-w-full">
          {upiId}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="btn-animate inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-sky-50 dark:hover:bg-slate-800 px-2.5 py-1.5 rounded-lg shadow-xs cursor-pointer transition shrink-0"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">{t('mockPaymentQR.copied')}</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>{t('mockPaymentQR.copy')}</span>
            </>
          )}
        </button>
      </div>

      {/* Helper Note */}
      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
        {t('mockPaymentQR.instruction')}
      </p>
    </div>
  );
};

export default MockPaymentQR;
