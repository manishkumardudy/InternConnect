import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, ExternalLink, Code2, Award, Sparkles, Github, Linkedin } from 'lucide-react';
import elevanceLogo from '../assets/elevanceskills_logo.png';

const DeveloperCredit = () => {
  const { t } = useTranslation();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 fade-in text-left">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-8 sm:p-12 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:shadow-sky-500/10">
        
        {/* Ambient Gradient Orbs */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-sky-500/15 dark:bg-sky-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cyan-500/15 dark:bg-cyan-500/10 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Left Column: Developer Info & Badge */}
          <div className="space-y-4 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 dark:bg-sky-950/60 px-3.5 py-1.5 text-xs font-bold text-sky-700 dark:text-sky-400 ring-1 ring-sky-200/60 dark:ring-sky-800">
              <Award className="h-4 w-4" />
              {t('developerCredit.badge')}
            </span>

            <h2 className="font-sans text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              {t('developerCredit.title', { name: '' })}<span className="bg-gradient-to-r from-sky-600 via-cyan-500 to-sky-400 bg-clip-text text-transparent">Manish Kumar</span>
            </h2>

            <p className="text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Code2 className="h-4.5 w-4.5 text-sky-600 dark:text-sky-400" />
              {t('developerCredit.role')}
            </p>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('developerCredit.sub')}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="mailto:manishkumardudy2621@gmail.com"
                className="btn-animate inline-flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 border border-slate-200 dark:border-slate-700"
              >
                <Mail className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                manishkumardudy2621@gmail.com
              </a>

              <a
                href="https://github.com/manishkumardudy"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-animate inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 border border-slate-200 dark:border-slate-700"
                aria-label="GitHub Profile"
              >
                <Github className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                GitHub
              </a>

              <a
                href="https://www.linkedin.com/in/manishkumardudy/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-animate inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 border border-slate-200 dark:border-slate-700"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                LinkedIn
              </a>
            </div>
          </div>

          {/* Right Column: ElevanceSkills Partner Card & CTA */}
          <div className="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row lg:flex-col items-center gap-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 p-6 sm:p-8 text-white shadow-xl ring-1 ring-white/10">
            <div className="flex items-center gap-4">
              <img
                src={elevanceLogo}
                alt="ElevanceSkills Logo"
                className="h-14 w-14 object-contain rounded-xl bg-slate-950 p-1.5 shadow-md ring-1 ring-sky-500/40"
              />
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400 block">{t('developerCredit.partnerTitle')}</span>
                <h3 className="font-sans text-lg font-extrabold text-white">ElevanceSkills</h3>
                <p className="text-[11px] text-slate-400">{t('developerCredit.partnerSub')}</p>
              </div>
            </div>

            <a
              href="https://elevanceskills.com"
              target="_blank"
              rel="noreferrer"
              className="btn-animate w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-6 py-3 text-xs font-bold text-white shadow-lg hover:from-sky-500 hover:to-cyan-400 cursor-pointer"
            >
              {t('developerCredit.visitPartner')}
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

        </div>

      </div>
    </section>
  );
};

export default DeveloperCredit;
