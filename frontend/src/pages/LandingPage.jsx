import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api, { getMediaUrl } from '../services/api';
import AutocompleteInput from '../components/AutocompleteInput';
import ExploreOpportunities from '../components/ExploreOpportunities';
import DeveloperCredit from '../components/DeveloperCredit';
import { ListingCardSkeleton } from '../components/SkeletonLoader';
import { Search, MapPin, DollarSign, Calendar, ArrowRight, Star, Code, PenTool, BarChart, Settings, Compass, Sparkles, Building2 } from 'lucide-react';

const LandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/listings?limit=6');
        const sorted = (res.data.listings || [])
          .sort((a, b) => b.stipendMax - a.stipendMax)
          .slice(0, 3);
        setFeatured(sorted);
      } catch (err) {
        console.error('Error fetching featured listings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/browse');
    }
  };

  const handleAutocompleteSelect = (selectedText) => {
    setSearchQuery(selectedText);
    navigate(`/browse?q=${encodeURIComponent(selectedText)}`);
  };

  const categories = [
    { name: t('landing.catSoftware'), icon: <Code className="h-5 w-5 text-sky-600 dark:text-sky-400" />, q: 'Software' },
    { name: t('landing.catReact'), icon: <Sparkles className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />, q: 'React' },
    { name: t('landing.catAi'), icon: <BarChart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />, q: 'Data Science' },
    { name: t('landing.catDesign'), icon: <PenTool className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />, q: 'UI UX' },
  ];

  return (
    <div className="w-full fade-in">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/75 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 py-20 lg:py-28 transition-colors duration-300">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 dark:bg-sky-950/60 px-3.5 py-1.5 text-xs font-bold text-sky-700 dark:text-sky-400 ring-1 ring-sky-200/50 dark:ring-sky-800 animate-float">
            <Star className="h-3.5 w-3.5 fill-sky-700 dark:fill-sky-400 text-sky-700 dark:text-sky-400" />
            {t('landing.heroBadge')}
          </span>

          <h1 className="mx-auto mt-6 max-w-4xl font-sans text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl leading-[1.15]">
            {t('landing.heroTitle')} <span className="bg-gradient-to-r from-sky-600 via-cyan-500 to-sky-400 bg-clip-text text-transparent">{t('landing.heroHighlight')}</span>
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
            {t('landing.heroSubtitle')}
          </p>

          {/* Autocomplete Search Bar */}
          <form onSubmit={handleSearch} className="mx-auto mt-10 max-w-2xl">
            <div className="flex flex-col sm:flex-row gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-2xl ring-4 ring-slate-100/60 dark:ring-slate-900/40">
              <div className="flex-1">
                <AutocompleteInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSelect={handleAutocompleteSelect}
                  type="all"
                  placeholder={t('landing.searchPlaceholder')}
                  icon={Search}
                  className="border-none py-3 shadow-none focus:ring-0 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="btn-animate rounded-xl bg-sky-600 py-3.5 px-7 text-sm font-bold text-white shadow-md hover:bg-sky-500 cursor-pointer shrink-0"
              >
                {t('landing.searchBtn')}
              </button>
            </div>
          </form>

          {/* Popular Categories */}
          <div className="mx-auto mt-10 flex flex-wrap justify-center items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2">{t('landing.popularSearches')}</span>
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => navigate(`/browse?q=${encodeURIComponent(cat.q)}`)}
                className="btn-animate flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-sky-300 dark:hover:border-sky-600 hover:bg-sky-50/30 dark:hover:bg-slate-850 cursor-pointer shadow-xs"
              >
                {cat.icon}
                {cat.name}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* Featured Internships */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10">
          <div className="text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{t('landing.featuredHeading')}</h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">{t('landing.featuredSubtitle')}</p>
          </div>
          <Link
            to="/browse"
            className="mt-4 sm:mt-0 flex items-center gap-1 text-sm font-bold text-sky-600 dark:text-sky-400 hover:underline group"
          >
            {t('landing.exploreListings')}
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <ListingCardSkeleton count={3} />
        ) : featured.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 py-16 text-center text-slate-400">
            <Compass className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700" />
            <p className="mt-4 text-sm font-medium">{t('landing.noActiveListings')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 text-left">
            {featured.map((listing) => (
              <div
                key={listing._id}
                onClick={() => navigate(`/listings/${listing._id}`)}
                className="card-hover group cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <img
                      src={getMediaUrl(listing.companyId?.logoUrl) || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150'}
                      alt={listing.companyId?.companyName}
                      className="h-12 w-12 rounded-xl object-contain ring-1 ring-slate-100 dark:ring-slate-800 bg-white dark:bg-slate-950 p-1 group-hover:scale-105 transition-transform"
                    />
                    <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider border border-emerald-100 dark:border-emerald-800">
                      {listing.type}
                    </span>
                  </div>
                  
                  <h3 className="mt-4 font-sans text-base font-bold text-slate-850 dark:text-white line-clamp-1 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    {listing.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    {listing.companyId?.companyName || t('landing.verifiedRecruiter')}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-y-3 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">{listing.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {listing.stipendMax > 0 ? `₹${listing.stipendMin.toLocaleString()}-${listing.stipendMax.toLocaleString()}/mo` : t('landing.unpaid')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{listing.durationMonths} {t('landing.months')}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                  <span className="text-[11px] text-slate-400 font-semibold">
                    {t('landing.postedOn', { date: new Date(listing.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) })}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400 group-hover:translate-x-1 transition-transform">
                    {t('landing.applyNow')}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="bg-slate-100/50 dark:bg-slate-900/50 border-y border-slate-200/60 dark:border-slate-800 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{t('landing.howItWorksHeading')}</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">{t('landing.howItWorksSubtitle')}</p>
          
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3 text-left">
            {[
              {
                step: '01',
                title: t('landing.step1Title'),
                desc: t('landing.step1Desc')
              },
              {
                step: '02',
                title: t('landing.step2Title'),
                desc: t('landing.step2Desc')
              },
              {
                step: '03',
                title: t('landing.step3Title'),
                desc: t('landing.step3Desc')
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm relative card-hover">
                <span className="absolute -top-5 right-6 font-sans text-5xl font-extrabold text-sky-500/10 dark:text-sky-400/10">
                  {item.step}
                </span>
                <h3 className="font-sans text-lg font-bold text-slate-800 dark:text-white">{item.title}</h3>
                <p className="mt-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Explore Opportunities Directory Section */}
      <ExploreOpportunities />

      {/* Developer Credit Section (Requirement 1) */}
      <DeveloperCredit />

      {/* Dual CTA Section */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          
          {/* Student CTA */}
          <div className="rounded-3xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-600 p-8 sm:p-10 text-white shadow-xl flex flex-col justify-between text-left card-hover">
            <div>
              <h3 className="font-sans text-2xl font-extrabold">{t('landing.ctaCandidateTitle')}</h3>
              <p className="mt-3 text-sky-100 text-sm leading-relaxed max-w-sm">
                {t('landing.ctaCandidateDesc')}
              </p>
            </div>
            <Link
              to="/login?tab=signup&role=student"
              className="btn-animate mt-8 self-start inline-flex items-center gap-1.5 rounded-xl bg-white px-6 py-3.5 text-xs font-bold text-sky-600 shadow-md hover:bg-sky-50 cursor-pointer"
            >
              {t('landing.ctaCandidateBtn')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Recruiter CTA */}
          <div className="rounded-3xl bg-slate-900 dark:bg-slate-950 p-8 sm:p-10 text-white shadow-xl flex flex-col justify-between text-left card-hover border border-slate-800">
            <div>
              <h3 className="font-sans text-2xl font-extrabold">{t('landing.ctaRecruiterTitle')}</h3>
              <p className="mt-3 text-slate-400 text-sm leading-relaxed max-w-sm">
                {t('landing.ctaRecruiterDesc')}
              </p>
            </div>
            <Link
              to="/login?tab=signup&role=recruiter"
              className="btn-animate mt-8 self-start inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-6 py-3.5 text-xs font-bold text-white shadow-md hover:bg-sky-500 cursor-pointer"
            >
              {t('landing.ctaRecruiterBtn')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
};

export default LandingPage;
