import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Mail, Lock, User, UserPlus, LogIn, ArrowRight } from 'lucide-react';

const LoginRegister = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, user } = useAuth();

  // Determine active tab and default role from URL queries
  const isRegisterPage = location.pathname === '/register';
  const queryParams = new URLSearchParams(location.search);
  const initialRole = queryParams.get('role') === 'recruiter' ? 'recruiter' : 'student';

  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      const redirectPath = user.role === 'recruiter' ? '/recruiter-dashboard' : '/student-dashboard';
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (isRegisterPage) {
      if (!name || !email || !password || !confirmPassword) {
        return setErrorMsg(t('loginRegister.fillAllFields'));
      }
      if (password !== confirmPassword) {
        return setErrorMsg(t('loginRegister.passwordsMismatch'));
      }
      if (password.length < 6) {
        return setErrorMsg(t('loginRegister.passwordLength'));
      }

      setLoading(true);
      const res = await register(name, email, password, role);
      setLoading(false);
      
      if (!res.success) {
        setErrorMsg(res.message);
      }
    } else {
      if (!email || !password) {
        return setErrorMsg(t('loginRegister.fillAllFields'));
      }

      setLoading(true);
      const res = await login(email, password);
      setLoading(false);
      
      if (!res.success) {
        setErrorMsg(res.message);
      }
    }
  };

  // Mock social logins for easy workspace demo evaluations
  const handleSocialLogin = async (selectedRole) => {
    setLoading(true);
    const demoEmail = selectedRole === 'student' ? 'student@college.edu' : 'recruiter@techcorp.com';
    // Seeder sets password to password123
    const res = await login(demoEmail, 'password123');
    setLoading(false);
    
    if (!res.success) {
      setErrorMsg(res.message || t('loginRegister.socialFailed'));
    }
  };

  return (
    <div className="flex min-h-[calc(h-screen-4rem)] items-center justify-center bg-gradient-to-b from-sky-50/20 via-slate-50 to-slate-50 px-4 py-12 sm:px-6 lg:px-8 fade-in">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl relative">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-md">
            <Briefcase className="h-6 w-6" />
          </div>
          <h2 className="mt-6 font-sans text-2xl font-extrabold text-slate-800 tracking-tight">
            {isRegisterPage ? t('loginRegister.createAccountTitle') : t('loginRegister.signInTitle')}
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            {isRegisterPage ? (
              <>
                {t('loginRegister.alreadyHaveAccount')}{' '}
                <Link to="/login" className="font-semibold text-sky-600 hover:text-sky-500">
                  {t('loginRegister.signInLink')}
                </Link>
              </>
            ) : (
              <>
                {t('loginRegister.newToPlatform')}{' '}
                <Link to="/register" className="font-semibold text-sky-600 hover:text-sky-500">
                  {t('loginRegister.registerNowLink')}
                </Link>
              </>
            )}
          </p>
        </div>

        {/* Tab Selection */}
        {isRegisterPage && (
          <div className="mt-6 flex rounded-2xl bg-slate-100 p-1">
            <button
              onClick={() => setRole('student')}
              className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all duration-200 ${
                role === 'student' ? 'bg-white text-slate-850 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t('loginRegister.asStudent')}
            </button>
            <button
              onClick={() => setRole('recruiter')}
              className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all duration-200 ${
                role === 'recruiter' ? 'bg-white text-slate-850 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t('loginRegister.asRecruiter')}
            </button>
          </div>
        )}

        {/* Form Error Alert */}
        {errorMsg && (
          <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-100 text-left">
            {errorMsg}
          </div>
        )}

        {/* Main Form */}
        <form className="mt-6 space-y-4 text-left" onSubmit={handleSubmit}>
          
          {isRegisterPage && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">{t('loginRegister.fullName')}</label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  placeholder={t('loginRegister.namePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 pl-10 pr-3 py-3 text-sm placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">{t('loginRegister.emailLabel')}</label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="email"
                required
                placeholder={t('loginRegister.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 pl-10 pr-3 py-3 text-sm placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">{t('loginRegister.passwordLabel')}</label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 pl-10 pr-3 py-3 text-sm placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          {isRegisterPage && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">{t('loginRegister.confirmPasswordLabel')}</label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 pl-10 pr-3 py-3 text-sm placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-sky-600 py-3 text-sm font-bold text-white shadow-md hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 cursor-pointer"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : isRegisterPage ? (
              <>
                <UserPlus className="h-4 w-4" />
                {t('loginRegister.signUpBtn')}
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                {t('loginRegister.signInBtn')}
              </>
            )}
          </button>
        </form>

        {/* Social Authentication Block */}
        <div className="mt-6 border-t border-slate-100 pt-6">
          <p className="text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-4">
            {t('loginRegister.orSignInstantly')}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSocialLogin('student')}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {t('loginRegister.asStudent')}
            </button>
            <button
              onClick={() => handleSocialLogin('recruiter')}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {t('loginRegister.asRecruiter')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginRegister;
