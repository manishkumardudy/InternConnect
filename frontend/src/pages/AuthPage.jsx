import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Building2, GraduationCap, User, Mail, Lock, ArrowRight } from 'lucide-react';
import elevanceLogo from '../assets/elevanceskills_logo.png';
import AuthCharacters from '../components/auth/AuthCharacters';

const AuthPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register } = useAuth();

  // Active tab state ('login' vs 'signup')
  const initialTab = searchParams.get('tab') === 'signup' ? 'signup' : 'login';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Signup step state ('select-role' vs 'form')
  const [signupRole, setSignupRole] = useState(searchParams.get('role') || ''); // 'student' or 'recruiter'

  // Form states (preserved on failure)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // ---------- Cartoon characters ka mood ----------
  const [passwordFocused, setPasswordFocused] = useState(false); // password box me cursor hai?
  const [buttonHover, setButtonHover] = useState(false); // submit button par mouse hai?

  // Priority: password type ho raha ho (sharmate hain) > error (udaas) > button/submit (khush) > normal
  // (button par mouse aate hi sharmana band, kyunki user ab submit karne wala hai)
  let mood = 'idle';
  if (passwordFocused && !buttonHover) mood = 'shy';
  else if (errorMessage) mood = 'sad';
  else if (buttonHover || submitting) mood = 'happy';

  // Reset errors when tab switches
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrorMessage('');
    if (tab === 'signup' && !signupRole) {
      setSignupRole('');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    try {
      const res = await login(email, password);

      if (res.success) {
        setEmail('');
        setPassword('');

        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (storedUser.role === 'recruiter') {
          navigate('/recruiter-dashboard');
        } else {
          navigate('/student-dashboard');
        }
      } else {
        setErrorMessage(res.message || 'Login failed.');
      }
    } catch (err) {
      const apiMsg = err.response?.data?.message || 'Invalid credentials. Please check your email and password.';
      setErrorMessage(apiMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter matching passwords.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);

    try {
      const targetRole = signupRole || 'student';
      const res = await register(
        name,
        email,
        password,
        targetRole
      );

      if (res.success) {
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');

        if (res.user?.role === 'recruiter') {
          navigate('/recruiter-dashboard');
        } else {
          navigate('/student-dashboard');
        }
      } else {
        setErrorMessage(res.message || 'Registration failed.');
      }
    } catch (err) {
      const apiMsg = err.response?.data?.message || 'Registration failed. Please try again.';
      setErrorMessage(apiMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 fade-in text-left">

      {/* Outer Auth Container (45% Left / 55% Right) */}
      <div className="w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl flex flex-col lg:flex-row min-h-[640px]">

        {/* LEFT PANEL: cartoon characters (sirf bade screen par dikhta hai) */}
        <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-gray-100 p-10">
          <div className="flex flex-1 items-center justify-center">
            {/* mood badalne par characters ka chehra badal jata hai */}
            <AuthCharacters mood={mood} />
          </div>

          {/* Developer credit */}
          <div className="flex items-center justify-between gap-4 border-t border-gray-200 pt-5 text-xs text-gray-500">
            <div className="space-y-0.5">
              <p className="font-semibold text-gray-700">{t('authPage.developedBy')}</p>
              <a href="mailto:manishkumardudy2621@gmail.com" className="text-primary hover:underline">
                manishkumardudy2621@gmail.com
              </a>
            </div>

            <div className="flex shrink-0 items-center gap-2 rounded-md border border-gray-200 bg-white p-2">
              <img
                src={elevanceLogo}
                alt="ElevanceSkills Logo"
                className="h-7 w-7 rounded object-contain"
              />
              <span className="text-[10px] font-semibold text-gray-600">ElevanceSkills</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL (55%) */}
        <div className="w-full lg:w-[55%] p-6 sm:p-10 flex flex-col justify-between bg-white dark:bg-slate-900 transition-colors">

          <div>
            <div className="flex justify-between items-center pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
                <button
                  type="button"
                  onClick={() => handleTabChange('login')}
                  className={`rounded-lg px-6 py-2 text-xs font-bold transition-all cursor-pointer ${activeTab === 'login'
                    ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                    }`}
                >
                  {t('authPage.logInTab')}
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('signup')}
                  className={`rounded-lg px-6 py-2 text-xs font-bold transition-all cursor-pointer ${activeTab === 'signup'
                    ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                    }`}
                >
                  {t('authPage.signUpTab')}
                </button>
              </div>

              <span className="text-xs font-semibold text-slate-400">
                {activeTab === 'login' ? t('authPage.welcomeBack') : t('authPage.createAccount')}
              </span>
            </div>

            {/* TAB 1: LOGIN FORM */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    {t('authPage.emailLabel')}
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('authPage.emailPlaceholder')}
                      className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 pl-9 pr-3 py-3 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {t('authPage.passwordLabel')}
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                    >
                      {t('authPage.forgotPasswordLink')}
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      placeholder="••••••••"
                      className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 pl-9 pr-3 py-3 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  onMouseEnter={() => setButtonHover(true)}
                  onMouseLeave={() => setButtonHover(false)}
                  className="btn-animate w-full rounded-xl bg-sky-600 py-3.5 text-xs font-bold text-white shadow-md hover:bg-sky-500 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {submitting ? t('authPage.signingIn') : t('authPage.signInBtn')}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}

            {/* TAB 2: SIGNUP FLOW */}
            {activeTab === 'signup' && (
              <div className="mt-6">
                {!signupRole ? (
                  <div className="space-y-4">
                    <div className="text-center py-2">
                      <h3 className="font-sans text-lg font-extrabold text-slate-800 dark:text-white">
                        {t('authPage.selectAccountType')}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {t('authPage.selectAccountSub')}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setSignupRole('student')}
                        className="card-hover p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 text-left cursor-pointer flex flex-col justify-between group hover:border-sky-500"
                      >
                        <div>
                          <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 inline-block">
                            <GraduationCap className="h-6 w-6" />
                          </div>
                          <h4 className="mt-3 text-sm font-bold text-slate-850 dark:text-white group-hover:text-sky-600">
                            {t('authPage.studentCandidate')}
                          </h4>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            {t('authPage.studentDesc')}
                          </p>
                        </div>
                        <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400">
                          {t('authPage.continueAsCandidate')}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSignupRole('recruiter')}
                        className="card-hover p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 text-left cursor-pointer flex flex-col justify-between group hover:border-cyan-500"
                      >
                        <div>
                          <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 inline-block">
                            <Building2 className="h-6 w-6" />
                          </div>
                          <h4 className="mt-3 text-sm font-bold text-slate-850 dark:text-white group-hover:text-cyan-600">
                            {t('authPage.recruiterEmployer')}
                          </h4>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            {t('authPage.recruiterDesc')}
                          </p>
                        </div>
                        <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-cyan-600 dark:text-cyan-400">
                          {t('authPage.continueAsRecruiter')}
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div className="flex justify-between items-center pb-2">
                      <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                        {t('authPage.roleLabel', { role: signupRole === 'student' ? 'Student Candidate' : 'Recruiter / Employer' })}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSignupRole('')}
                        className="text-xs text-slate-400 hover:text-slate-600 underline"
                      >
                        {t('authPage.changeRole')}
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                        {t('authPage.fullName')}
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <User className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={t('authPage.namePlaceholder')}
                          className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                        {t('authPage.emailLabel')}
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <Mail className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@company.com"
                          className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                          {t('authPage.passwordLabel')}
                        </label>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onFocus={() => setPasswordFocused(true)}
                          onBlur={() => setPasswordFocused(false)}
                          placeholder="••••••••"
                          className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-3 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                          {t('authPage.confirmPasswordLabel')}
                        </label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          onFocus={() => setPasswordFocused(true)}
                          onBlur={() => setPasswordFocused(false)}
                          placeholder="••••••••"
                          className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-3 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      onMouseEnter={() => setButtonHover(true)}
                      onMouseLeave={() => setButtonHover(false)}
                      className="btn-animate w-full rounded-xl bg-sky-600 py-3 text-xs font-bold text-white shadow-md hover:bg-sky-500 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {submitting ? t('authPage.creatingAccount') : t('authPage.completeRegBtn')}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mt-4 rounded-xl bg-red-50 dark:bg-red-950/40 p-3 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-left fade-in">
                {errorMessage}
              </div>
            )}

          </div>

          <div className="mt-6 pt-4 text-center text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800">
            {t('authPage.termsNotice')}
          </div>

        </div>

      </div>

    </div>
  );
};

export default AuthPage;
