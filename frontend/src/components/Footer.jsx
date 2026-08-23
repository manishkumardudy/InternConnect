import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Briefcase, Github, Linkedin, Mail, Heart, Sparkles, MapPin, Building2 } from 'lucide-react';
import elevanceLogo from '../assets/elevanceskills_logo.png';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-left transition-colors duration-300">
      
      {/* Top Footer Section */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white shadow-md">
                <Briefcase className="h-5 w-5" />
              </div>
              <span className="font-sans text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Intern<span className="text-sky-600 dark:text-sky-400">Connect</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              {t('footer.brandTagline')}
            </p>

            {/* ElevanceSkills Partner Badge */}
            <div className="pt-2 flex items-center gap-3">
              <img
                src={elevanceLogo}
                alt="ElevanceSkills Logo"
                className="h-8 w-8 object-contain rounded-lg bg-slate-900 p-1 shadow-sm ring-1 ring-sky-500/30"
              />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 block">{t('footer.partnerTitle')}</span>
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{t('footer.partnerSub')}</span>
              </div>
            </div>
          </div>

          {/* Directory Links 1 */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-850 dark:text-slate-200">
              {t('footer.forCandidates')}
            </h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link to="/browse?type=internship" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  {t('footer.topInternships')}
                </Link>
              </li>
              <li>
                <Link to="/browse?type=job" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  {t('footer.fullTimeJobs')}
                </Link>
              </li>
              <li>
                <Link to="/browse?workMode=remote" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  {t('footer.workFromHome')}
                </Link>
              </li>
              <li>
                <Link to="/browse?location=Bangalore" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  {t('footer.bangaloreInternships')}
                </Link>
              </li>
              <li>
                <Link to="/login?tab=signup&role=student" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  {t('footer.createCandidateAcc')}
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors font-bold text-sky-600 dark:text-sky-400">
                  {t('nav.help')} Center & FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Directory Links 2 */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-850 dark:text-slate-200">
              {t('footer.forEmployers')}
            </h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link to="/login?tab=signup&role=recruiter" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  {t('footer.postOpportunity')}
                </Link>
              </li>
              <li>
                <Link to="/login?role=recruiter" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  {t('footer.recruiterSignIn')}
                </Link>
              </li>
              <li>
                <Link to="/browse" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  {t('footer.searchTalent')}
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  {t('footer.kanbanHiringSuite')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Developer & Social Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-850 dark:text-slate-200">
              {t('footer.developerInfo')}
            </h4>
            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <p className="font-bold text-slate-800 dark:text-slate-200">Manish Kumar</p>
              <p className="text-[11px]">{t('footer.devTitle')}</p>
              <a href="mailto:manishkumardudy2621@gmail.com" className="text-sky-600 dark:text-sky-400 hover:underline block pt-1">
                manishkumardudy2621@gmail.com
              </a>
            </div>

            {/* Social Icons with exact user links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com/manishkumardudy"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-animate rounded-xl bg-slate-100 dark:bg-slate-800 p-2.5 text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400"
                aria-label="GitHub Profile"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/manishkumardudy/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-animate rounded-xl bg-slate-100 dark:bg-slate-800 p-2.5 text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="mailto:manishkumardudy2621@gmail.com"
                className="btn-animate rounded-xl bg-slate-100 dark:bg-slate-800 p-2.5 text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400"
                aria-label="Email Manish Kumar"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-400">
          <p>
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
          <div className="flex items-center gap-1">
            <span>{t('footer.designedBy')}</span>
            <strong className="text-slate-700 dark:text-slate-300">Manish Kumar</strong>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
