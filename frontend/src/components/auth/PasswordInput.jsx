import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Lock } from 'lucide-react';

// Password input with visibility toggle button
export default function PasswordInput({ withLockIcon = false, ...inputProps }) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  const label = visible ? t('authPage.hidePassword') : t('authPage.showPassword');

  return (
    <div className="relative">
      {/* Optional leading lock icon */}
      {withLockIcon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Lock className="h-4 w-4 text-slate-400" />
        </div>
      )}

      <input
        {...inputProps}
        type={visible ? 'text' : 'password'}
        className={`block w-full rounded-xl border border-slate-200 bg-white pr-10 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:outline-none ${
          withLockIcon ? 'py-3 pl-9' : 'py-2.5 pl-3'
        }`}
      />

      {/* Visibility toggle button */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setVisible(!visible)}
        title={label}
        aria-label={label}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-sky-600"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
