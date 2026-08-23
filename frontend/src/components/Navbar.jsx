import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { Bell, User, LogOut, Menu, X, Briefcase, FileText, LayoutDashboard, PlusCircle, Building, Sun, Moon, Sparkles, Compass, Globe, Crown, History, Languages, LifeBuoy } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'fr', label: 'Français (OTP)', flag: '🇫🇷' }
];

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useSocket();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  // French OTP Modal state
  const [frOtpModal, setFrOtpModal] = useState({ open: false, code: '', error: '', loading: false });

  const notifRef = React.useRef(null);
  const profileRef = React.useRef(null);
  const langRef = React.useRef(null);

  // Close dropdowns automatically on route navigation
  React.useEffect(() => {
    setNotifDropdownOpen(false);
    setProfileDropdownOpen(false);
    setLangDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when French OTP modal is open
  React.useEffect(() => {
    if (frOtpModal.open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [frOtpModal.open]);

  const handleLanguageSelect = async (langCode) => {
    setLangDropdownOpen(false);

    if (langCode === 'fr') {
      // Special Rule for French: Require OTP verification
      try {
        setFrOtpModal({ open: true, code: '', error: '', loading: false });
        await api.post('/otp/send', { purpose: 'language_change_fr' });
      } catch (err) {
        setFrOtpModal({
          open: true,
          code: '',
          error: err.response?.data?.message || 'Failed to send OTP for French activation.',
          loading: false
        });
      }
    } else {
      // Direct language switch for EN, ES, HI, PT, ZH
      i18n.changeLanguage(langCode);
      if (user) {
        try {
          await api.patch('/auth/update-language', { language: langCode });
        } catch (e) {
          console.error('Failed to persist language preference:', e);
        }
      }
    }
  };

  const handleVerifyFrenchOtp = async (e) => {
    e.preventDefault();
    if (!frOtpModal.code || frOtpModal.code.trim().length !== 6) {
      setFrOtpModal(prev => ({ ...prev, error: 'Please enter a valid 6-digit OTP code.' }));
      return;
    }

    setFrOtpModal(prev => ({ ...prev, loading: true, error: '' }));
    try {
      await api.post('/otp/verify', { code: frOtpModal.code.trim(), purpose: 'language_change_fr' });
      i18n.changeLanguage('fr');
      if (user) {
        await api.patch('/auth/update-language', { language: 'fr' });
      }
      setFrOtpModal({ open: false, code: '', error: '', loading: false });
    } catch (err) {
      setFrOtpModal(prev => ({
        ...prev,
        loading: false,
        error: err.response?.data?.message || 'French OTP verification failed.'
      }));
    }
  };

  // Click outside to close & Escape key listener
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setNotifDropdownOpen(false);
        setProfileDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleNotificationClick = (notif) => {
    setNotifDropdownOpen(false);
    setProfileDropdownOpen(false);

    if (!notif.read && markAsRead) {
      markAsRead(notif._id);
    }

    if (notif.type === 'friend_request' || notif.type === 'friend_accepted') {
      navigate('/public-space?tab=friends');
    } else if (notif.type === 'new_application' || user?.role === 'recruiter') {
      const targetListingId = notif.listingId || notif.relatedId;
      if (targetListingId) {
        const query = notif.applicantUserId ? `?applicantId=${notif.applicantUserId}` : '';
        navigate(`/listing/${targetListingId}/applicants${query}`);
      } else {
        navigate('/recruiter-dashboard');
      }
    } else {
      navigate('/my-applications');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const handleThemeToggleClick = () => {
    console.log("Theme button clicked");
    toggleTheme();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white shadow-md group-hover:scale-105 transition-transform">
                <Briefcase className="h-5 w-5" />
              </div>
              <span className="font-sans text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Intern<span className="text-sky-600 dark:text-sky-400">Connect</span>
              </span>
            </Link>

            {/* Micro Badge */}
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-sky-50 dark:bg-sky-950/60 px-2.5 py-0.5 text-[10px] font-bold text-sky-700 dark:text-sky-400 ring-1 ring-sky-200/60 dark:ring-sky-800">
              <Sparkles className="h-3 w-3" />
              250+ Roles
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/browse"
              className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                isActive('/browse') ? 'nav-link-active' : 'nav-link'
              }`}
            >
              <Compass className="h-4 w-4" />
              {t('nav.browse')}
            </Link>

            {user && (
              <Link
                to="/public-space"
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                  isActive('/public-space') ? 'nav-link-active' : 'nav-link'
                }`}
              >
                <Globe className="h-4 w-4" />
                {t('nav.publicSpace')}
              </Link>
            )}

            {user?.role === 'student' && (
              <>
                <Link
                  to="/student-dashboard"
                  className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                    isActive('/student-dashboard') ? 'nav-link-active' : 'nav-link'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {t('nav.studentDashboard')}
                </Link>
                <Link
                  to="/subscription"
                  className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                    isActive('/subscription') ? 'nav-link-active' : 'nav-link'
                  }`}
                >
                  <Crown className="h-4 w-4 text-amber-500" />
                  {t('nav.subscription')}
                </Link>
                <Link
                  to="/resume-builder"
                  className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                    isActive('/resume-builder') ? 'nav-link-active' : 'nav-link'
                  }`}
                >
                  <Sparkles className="h-4 w-4 text-sky-500" />
                  {t('nav.resumeBuilder')}
                </Link>
                <Link
                  to="/my-applications"
                  className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                    isActive('/my-applications') ? 'nav-link-active' : 'nav-link'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  {t('nav.myApplications')}
                </Link>
              </>
            )}

            {user?.role === 'recruiter' && (
              <>
                <Link
                  to="/recruiter-dashboard"
                  className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                    isActive('/recruiter-dashboard') ? 'nav-link-active' : 'nav-link'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {t('nav.recruiterDashboard')}
                </Link>
                <Link
                  to="/post-listing"
                  className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                    isActive('/post-listing') ? 'nav-link-active' : 'nav-link'
                  }`}
                >
                  <PlusCircle className="h-4 w-4" />
                  {t('nav.postListing')}
                </Link>
              </>
            )}
          </div>

          {/* Action Buttons / Theme Switcher / Dropdowns */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Selector Dropdown */}
            <div ref={langRef} className="relative">
              <button
                onClick={() => {
                  setLangDropdownOpen(!langDropdownOpen);
                  setNotifDropdownOpen(false);
                  setProfileDropdownOpen(false);
                }}
                className="btn-animate flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer shadow-xs"
                title="Select Language"
              >
                <Languages className="h-4 w-4 text-sky-600" />
                <span className="uppercase">{i18n.language || 'en'}</span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-1 shadow-xl fade-in z-50">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Select Language</p>
                  </div>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageSelect(lang.code)}
                      className={`flex w-full items-center justify-between px-4 py-2 text-left text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 ${
                        i18n.language === lang.code ? 'text-sky-600 dark:text-sky-400 font-bold bg-sky-50/50 dark:bg-sky-950/40' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </span>
                      {i18n.language === lang.code && <Sparkles className="h-3 w-3 text-sky-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={handleThemeToggleClick}
              className="btn-animate rounded-full p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} theme`}
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5 text-amber-400" />
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-3 relative">
                
                {/* Notifications Bell */}
                <div ref={notifRef} className="relative">
                  <button
                    onClick={() => {
                      setNotifDropdownOpen(!notifDropdownOpen);
                      setProfileDropdownOpen(false);
                      setLangDropdownOpen(false);
                    }}
                    className="btn-animate relative rounded-full p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer"
                  >
                    <Bell className="h-5.5 w-5.5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown Panel */}
                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 shadow-2xl fade-in z-50 max-h-96 overflow-y-auto">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200">Notifications</span>
                        <span className="text-[11px] font-bold text-slate-400">{unreadCount} unread</span>
                      </div>
                      
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-xs text-slate-400 font-semibold">
                          No notifications yet.
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                          {notifications.map((notif) => (
                            <div
                              key={notif._id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer text-left ${
                                !notif.read ? 'bg-sky-50/50 dark:bg-sky-950/40' : ''
                              }`}
                            >
                              <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed font-medium">
                                {notif.message}
                              </p>
                              <span className="text-[9px] font-bold text-slate-400 mt-1 block">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(!profileDropdownOpen);
                      setNotifDropdownOpen(false);
                      setLangDropdownOpen(false);
                    }}
                    className="btn-animate flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1 px-3 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer shadow-xs"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-white text-xs font-bold uppercase shadow-xs">
                      {user.name.charAt(0)}
                    </div>
                    <span className="max-w-[90px] truncate">{user.name.split(' ')[0]}</span>
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-1 shadow-xl fade-in z-50">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Signed in as</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user.email}</p>
                      </div>
                      
                      {user.role === 'student' ? (
                        <Link
                          to="/profile"
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <User className="h-4 w-4 text-slate-400" />
                          My Profile & Resume
                        </Link>
                      ) : (
                        <Link
                          to="/company-profile"
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <Building className="h-4 w-4 text-slate-400" />
                          {t('nav.companyProfile')}
                        </Link>
                      )}

                      <Link
                        to="/login-history"
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <History className="h-4 w-4 text-slate-400" />
                        {t('nav.loginHistory')}
                      </Link>

                      <Link
                        to="/help"
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <LifeBuoy className="h-4 w-4 text-slate-400" />
                        {t('nav.help')}
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        {t('nav.logout')}
                      </button>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/login?tab=signup"
                  className="rounded-xl bg-sky-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-sky-500 shadow-sm transition"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={handleThemeToggleClick}
              className="rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5 text-amber-400" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 md:hidden fade-in space-y-1 text-left">
          <Link
            to="/browse"
            className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-sky-600"
            onClick={() => setMobileMenuOpen(false)}
          >
            {t('nav.browse')}
          </Link>

          {user && (
            <Link
              to="/public-space"
              className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-sky-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.publicSpace')}
            </Link>
          )}

          {user ? (
            <>
              {user.role === 'student' && (
                <>
                  <Link
                    to="/student-dashboard"
                    className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-sky-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.studentDashboard')}
                  </Link>
                  <Link
                    to="/subscription"
                    className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-sky-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.subscription')}
                  </Link>
                  <Link
                    to="/resume-builder"
                    className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-sky-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.resumeBuilder')}
                  </Link>
                  <Link
                    to="/my-applications"
                    className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-sky-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.myApplications')}
                  </Link>
                  <Link
                    to="/profile"
                    className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-sky-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Profile & Resume
                  </Link>
                </>
              )}

              {user.role === 'recruiter' && (
                <>
                  <Link
                    to="/recruiter-dashboard"
                    className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-sky-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.recruiterDashboard')}
                  </Link>
                  <Link
                    to="/post-listing"
                    className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-sky-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.postListing')}
                  </Link>
                  <Link
                    to="/company-profile"
                    className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-sky-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.companyProfile')}
                  </Link>
                </>
              )}

              <Link
                to="/help"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-sky-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LifeBuoy className="h-4 w-4 text-slate-400" />
                {t('nav.help')}
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left block rounded-lg px-3 py-2 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
              >
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1.5">
              <Link
                to="/help"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-sky-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LifeBuoy className="h-4 w-4 text-slate-400" />
                {t('nav.help')}
              </Link>
              <Link
                to="/login"
                className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/login?tab=signup"
                className="block rounded-lg px-3 py-2 text-sm font-bold text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.register')}
              </Link>
            </div>
          )}
        </div>
      )}
      {/* French Language Change OTP Verification Modal */}
      {frOtpModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800 text-left max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-sans text-base font-bold text-slate-850 dark:text-white">
                Vérification de sécurité (Français)
              </h3>
              <button onClick={() => setFrOtpModal({ open: false, code: '', error: '', loading: false })} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Un code OTP à 6 chiffres a été envoyé à votre adresse e-mail pour activer la langue française.
            </p>

            {frOtpModal.error && (
              <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 p-3 text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                {frOtpModal.error}
              </div>
            )}

            <form onSubmit={handleVerifyFrenchOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Entrez le code OTP à 6 chiffres
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={frOtpModal.code}
                  onChange={(e) => setFrOtpModal({ ...frOtpModal, code: e.target.value })}
                  placeholder="123456"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-center font-mono text-lg font-bold tracking-widest text-slate-850 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFrOtpModal({ open: false, code: '', error: '', loading: false })}
                  className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={frOtpModal.loading}
                  className="btn-animate inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-sky-500 disabled:opacity-50"
                >
                  {frOtpModal.loading ? 'Vérification...' : 'Vérifier et activer le français'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
