import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Building2, GraduationCap, Briefcase, CheckCircle2, User, Mail, Lock,
  ArrowRight, Sparkles, Award, ExternalLink, HelpCircle, X
} from 'lucide-react';
import elevanceLogo from '../assets/elevanceskills_logo.png';

const AuthPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register, verifyRegisterOtp, resendRegisterOtp, setUser } = useAuth();

  const slides = [
    {
      id: 1,
      title: t('authPage.slide1Title'),
      subtitle: t('authPage.slide1Sub'),
      desc: t('authPage.slide1Desc'),
      stats: [
        { label: t('authPage.companiesLabel'), value: "250+" },
        { label: t('authPage.startupsLabel'), value: "50+" },
        { label: t('authPage.mncsLabel'), value: "20+" }
      ],
      icon: Building2,
      gradient: "from-sky-600 to-cyan-500"
    },
    {
      id: 2,
      title: t('authPage.slide2Title'),
      subtitle: t('authPage.slide2Sub'),
      desc: t('authPage.slide2Desc'),
      stats: [
        { label: t('authPage.placedLabel'), value: "5000+" },
        { label: t('authPage.citiesLabel'), value: "40+" },
        { label: t('authPage.stipendsLabel'), value: t('authPage.stipendsVal') }
      ],
      icon: GraduationCap,
      gradient: "from-cyan-600 to-blue-600"
    },
    {
      id: 3,
      title: t('authPage.slide3Title'),
      subtitle: t('authPage.slide3Sub'),
      desc: t('authPage.slide3Desc'),
      stats: [
        { label: t('authPage.recruitersLabel'), value: t('authPage.verifiedVal') },
        { label: t('authPage.responseLabel'), value: "< 48 hrs" },
        { label: t('authPage.hiringLabel'), value: t('authPage.liveVal') }
      ],
      icon: Briefcase,
      gradient: "from-indigo-600 to-sky-600"
    },
    {
      id: 4,
      title: t('authPage.slide4Title'),
      subtitle: t('authPage.slide4Sub'),
      desc: t('authPage.slide4Desc'),
      stats: [
        { label: t('authPage.kanbanLabel'), value: t('authPage.interactiveVal') },
        { label: t('authPage.resumesLabel'), value: t('authPage.pdfReadyVal') },
        { label: t('authPage.realtimeLabel'), value: "Socket.IO" }
      ],
      icon: Sparkles,
      gradient: "from-purple-600 to-sky-500"
    }
  ];

  // Active tab state ('login' vs 'signup')
  const initialTab = searchParams.get('tab') === 'signup' ? 'signup' : 'login';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Signup step state ('select-role' vs 'form')
  const [signupRole, setSignupRole] = useState(searchParams.get('role') || ''); // 'student' or 'recruiter'

  // Slide Carousel index state
  const [currentSlide, setCurrentSlide] = useState(0);

  // Form states (preserved on failure)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-play slide carousel every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Reset errors when tab switches
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrorMessage('');
    if (tab === 'signup' && !signupRole) {
      setSignupRole('');
    }
  };

  // Chrome Login OTP modal state
  const [chromeOtpModal, setChromeOtpModal] = useState({ open: false, tempToken: '', code: '' });
  const [verifyingLoginOtp, setVerifyingLoginOtp] = useState(false);

  // Registration OTP modal state
  const [registerOtpModal, setRegisterOtpModal] = useState({
    open: false,
    tempToken: '',
    code: '',
    email: '',
    role: '',
    resending: false,
    resendStatus: ''
  });
  const [verifyingRegisterOtp, setVerifyingRegisterOtp] = useState(false);

  // Lock body scroll when OTP modals are open
  useEffect(() => {
    if (chromeOtpModal.open || registerOtpModal.open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [chromeOtpModal.open, registerOtpModal.open]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    try {
      const res = await login(email, password);

      if (res.otpRequired) {
        setChromeOtpModal({ open: true, tempToken: res.tempLoginToken, code: '' });
        setSubmitting(false);
        return;
      }

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

  const handleVerifyLoginOtpSubmit = async (e) => {
    e.preventDefault();
    const rawCode = chromeOtpModal.code || '';
    const trimmedCode = rawCode.trim();

    if (!trimmedCode || trimmedCode.length !== 6) {
      setErrorMessage('Please enter a valid 6-digit OTP code.');
      return;
    }

    setVerifyingLoginOtp(true);
    setErrorMessage('');
    try {
      const res = await api.post('/auth/verify-login-otp', {
        tempLoginToken: chromeOtpModal.tempToken,
        code: trimmedCode
      });

      const { accessToken, user: userData } = res.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setChromeOtpModal({ open: false, tempToken: '', code: '' });
      setEmail('');
      setPassword('');

      if (userData.role === 'recruiter') {
        navigate('/recruiter-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to verify login OTP.');
    } finally {
      setVerifyingLoginOtp(false);
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

      if (res.otpRequired) {
        setRegisterOtpModal({
          open: true,
          tempToken: res.tempRegistrationToken,
          code: '',
          email: email,
          role: targetRole,
          resending: false,
          resendStatus: ''
        });
        setSubmitting(false);
        return;
      }

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

  const handleVerifyRegisterOtpSubmit = async (e) => {
    e.preventDefault();
    const rawCode = registerOtpModal.code || '';
    const trimmedCode = rawCode.trim();

    if (!trimmedCode || trimmedCode.length !== 6) {
      setErrorMessage('Please enter a valid 6-digit OTP code.');
      return;
    }

    setVerifyingRegisterOtp(true);
    setErrorMessage('');
    try {
      const res = await verifyRegisterOtp(registerOtpModal.tempToken, trimmedCode);

      if (res.success) {
        setRegisterOtpModal({
          open: false,
          tempToken: '',
          code: '',
          email: '',
          role: '',
          resending: false,
          resendStatus: ''
        });
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
        setErrorMessage(res.message || 'Invalid OTP code. Please check and try again.');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to verify OTP.');
    } finally {
      setVerifyingRegisterOtp(false);
    }
  };

  const handleResendRegisterOtp = async () => {
    if (!registerOtpModal.tempToken) return;
    setRegisterOtpModal(prev => ({ ...prev, resending: true, resendStatus: '' }));
    try {
      const res = await resendRegisterOtp(registerOtpModal.tempToken);
      setRegisterOtpModal(prev => ({
        ...prev,
        resending: false,
        resendStatus: res.message || 'A fresh OTP has been sent to your email.'
      }));
    } catch (err) {
      setRegisterOtpModal(prev => ({
        ...prev,
        resending: false,
        resendStatus: 'Failed to resend OTP. Please try again.'
      }));
    }
  };

  const SlideIcon = slides[currentSlide].icon;

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 fade-in text-left">

      {/* Outer Auth Container (45% Left / 55% Right) */}
      <div className="w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl flex flex-col lg:flex-row min-h-[640px]">

        {/* LEFT PANEL (45%) */}
        <div className="relative w-full lg:w-[45%] bg-slate-900 text-white p-8 sm:p-10 flex flex-col justify-between overflow-hidden">
          <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />

          <div className="relative z-10 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-600 text-white shadow-md">
              <Briefcase className="h-4.5 w-4.5" />
            </div>
            <span className="font-sans text-lg font-extrabold tracking-tight text-white">
              Intern<span className="text-sky-400">Connect</span>
            </span>
          </div>

          <div className="relative z-10 my-10 flex-1 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={slides[currentSlide].id}
                initial={{ opacity: 0, y: 15, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.96 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="space-y-6"
              >
                <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-tr ${slides[currentSlide].gradient} shadow-lg text-white`}>
                  <SlideIcon className="h-7 w-7" />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                    {slides[currentSlide].subtitle}
                  </span>
                  <h2 className="font-sans text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                    {slides[currentSlide].title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm">
                    {slides[currentSlide].desc}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                  {slides[currentSlide].stats.map((st, idx) => (
                    <div key={idx} className="bg-slate-800/60 backdrop-blur-xs rounded-xl p-2.5 text-center border border-slate-700/50">
                      <p className="text-sm font-extrabold text-white">{st.value}</p>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">{st.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex gap-2 mt-8">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${index === currentSlide ? 'w-8 bg-sky-400' : 'w-2 bg-slate-700 hover:bg-slate-600'
                    }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="relative z-10 pt-6 border-t border-slate-800 flex items-center justify-between gap-4 text-xs text-slate-400">
            <div className="space-y-0.5">
              <p className="font-bold text-slate-200">{t('authPage.developedBy')}</p>
              <a href="mailto:manishkumardudy2621@gmail.com" className="text-[11px] text-sky-400 hover:underline">
                manishkumardudy2621@gmail.com
              </a>
            </div>

            <div className="flex items-center gap-2 bg-slate-800/80 p-2 rounded-xl border border-slate-700/60 shrink-0">
              <img
                src={elevanceLogo}
                alt="ElevanceSkills Logo"
                className="h-7 w-7 object-contain rounded"
              />
              <span className="text-[10px] font-bold text-slate-300">ElevanceSkills</span>
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
                      placeholder="••••••••"
                      className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 pl-9 pr-3 py-3 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
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
                          placeholder="••••••••"
                          className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-3 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
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

      {/* Registration OTP Verification Modal */}
      {registerOtpModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-5 border border-slate-200 dark:border-slate-800 text-left max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                  {registerOtpModal.role === 'recruiter' ? <Building2 className="h-6 w-6" /> : <GraduationCap className="h-6 w-6" />}
                </div>
                <div>
                  <h3 className="font-sans text-base sm:text-lg font-bold text-slate-850 dark:text-white">
                    {registerOtpModal.role === 'recruiter' ? 'Recruiter Account Verification' : 'Candidate Account Verification'}
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">
                    Enter the OTP code to activate your account
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRegisterOtpModal({ open: false, tempToken: '', code: '', email: '', role: '', resending: false, resendStatus: '' })}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-750 text-xs text-slate-600 dark:text-slate-300">
              <p>
                We sent a 6-digit one-time password to:
              </p>
              <p className="font-bold text-sky-600 dark:text-sky-400 mt-0.5 break-all">
                {registerOtpModal.email}
              </p>
            </div>

            {errorMessage && (
              <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 p-3 text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                {errorMessage}
              </div>
            )}

            {registerOtpModal.resendStatus && (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {registerOtpModal.resendStatus}
              </div>
            )}

            <form onSubmit={handleVerifyRegisterOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  {t('authPage.enterOtpLabel')}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  value={registerOtpModal.code}
                  onChange={(e) => setRegisterOtpModal({ ...registerOtpModal, code: e.target.value.replace(/[^0-9]/g, '') })}
                  placeholder="••••••"
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3.5 text-center font-mono text-2xl font-bold tracking-widest text-slate-850 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
                <p className="mt-1.5 text-[11px] text-slate-400 text-center">
                  OTP expires in 10 minutes
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={handleResendRegisterOtp}
                  disabled={registerOtpModal.resending}
                  className="font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer disabled:opacity-50"
                >
                  {registerOtpModal.resending ? 'Sending...' : "Didn't receive code? Resend"}
                </button>

                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setRegisterOtpModal({ open: false, tempToken: '', code: '', email: '', role: '', resending: false, resendStatus: '' })}
                    className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    {t('authPage.cancelBtn')}
                  </button>
                  <button
                    type="submit"
                    disabled={verifyingRegisterOtp || registerOtpModal.code.length !== 6}
                    className="btn-animate inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-sky-500 disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {verifyingRegisterOtp ? t('authPage.verifying') : 'Verify & Activate'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chrome Browser OTP Verification Modal */}
      {chromeOtpModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800 text-left max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-sans text-base font-bold text-slate-850 dark:text-white">
                {t('authPage.chromeSecurityTitle')}
              </h3>
              <button onClick={() => setChromeOtpModal({ open: false, tempToken: '', code: '' })} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              {t('authPage.chromeSecurityNotice')}
            </p>

            {errorMessage && (
              <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 p-3 text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleVerifyLoginOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {t('authPage.enterOtpLabel')}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={chromeOtpModal.code}
                  onChange={(e) => setChromeOtpModal({ ...chromeOtpModal, code: e.target.value })}
                  placeholder="123456"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-center font-mono text-lg font-bold tracking-widest text-slate-850 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setChromeOtpModal({ open: false, tempToken: '', code: '' })}
                  className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t('authPage.cancelBtn')}
                </button>
                <button
                  type="submit"
                  disabled={verifyingLoginOtp}
                  className="btn-animate inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-sky-500 disabled:opacity-50"
                >
                  {verifyingLoginOtp ? t('authPage.verifying') : t('authPage.verifyOtpBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;
