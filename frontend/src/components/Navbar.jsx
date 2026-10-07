import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Briefcase, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './navbar/LanguageSwitcher';
import NotificationBell from './navbar/NotificationBell';
import ProfileMenu from './navbar/ProfileMenu';
import { getMainLinks, getMenuLinks } from './navbar/navLinks';

// Desktop link ka style: active page par primary color + neeche line
const desktopLinkClass = ({ isActive }) =>
  `border-b-2 px-1 py-5 text-sm font-medium transition-colors ${
    isActive
      ? 'border-primary text-primary'
      : 'border-transparent text-gray-600 hover:text-primary'
  }`;

export default function Navbar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Page badalte hi mobile menu band kar do
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Student dashboard ka apna alag header hai, wahan ye navbar nahi dikhana
  if (location.pathname === '/student-dashboard') return null;

  const mainLinks = getMainLinks(user, t);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-white">
            <Briefcase className="h-4 w-4" />
          </span>
          <span className="text-xl font-bold text-gray-900">
            Intern<span className="text-primary">Connect</span>
          </span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden items-center gap-6 md:flex">
          {mainLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={desktopLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right side: language, bell, profile / login */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          {user ? (
            <>
              <NotificationBell />
              <ProfileMenu />
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                to="/login"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary"
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/login?tab=signup"
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                {t('nav.register')}
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-md p-2 text-gray-600 hover:bg-gray-100 md:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-2 md:hidden">
          {[...mainLinks, ...getMenuLinks(user, t)].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="block py-2.5 text-sm text-gray-700"
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <button
              onClick={handleLogout}
              className="block w-full py-2.5 text-left text-sm text-red-600"
            >
              {t('nav.logout')}
            </button>
          ) : (
            <>
              <Link to="/login" className="block py-2.5 text-sm text-gray-700">
                {t('nav.login')}
              </Link>
              <Link
                to="/login?tab=signup"
                className="block py-2.5 text-sm font-semibold text-primary"
              >
                {t('nav.register')}
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
