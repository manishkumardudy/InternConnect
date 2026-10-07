import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Mock data structure - backend se aane wale dynamic data ke sath seamlessly map hoga
const initialListings = [
  {
    id: 1,
    title: 'Full Stack Web Development Intern',
    organization: 'ElevanceSkills',
    category: 'Engineering',
    location: 'Remote',
    stipend: '₹3,000 / month',
    duration: '3 Months',
    postedDaysAgo: '2 days ago',
    applicantsCount: 42,
    skillsRequired: ['React.js', 'Node.js', 'MongoDB', 'Tailwind CSS'],
    isFeatured: true,
  },
  {
    id: 2,
    title: 'Data Science Intern',
    organization: 'Acmegrade Tech',
    category: 'Data & AI',
    location: 'Jaipur, RJ (Hybrid)',
    stipend: '₹5,000 / month',
    duration: '2 Months',
    postedDaysAgo: 'Just now',
    applicantsCount: 18,
    skillsRequired: ['Python', 'scikit-learn', 'Pandas', 'OpenCV'],
    isFeatured: false,
  },
  {
    id: 3,
    title: 'UI/UX & Product Design Intern',
    organization: 'Apex Studio',
    category: 'Design',
    location: 'Remote',
    stipend: '₹4,000 / month',
    duration: '3 Months',
    postedDaysAgo: '5 days ago',
    applicantsCount: 29,
    skillsRequired: ['Figma', 'Tailwind', 'Wireframing', 'Design Systems'],
    isFeatured: false,
  },
];

export default function InternConnectPortal({
  listings = initialListings,
  onApply,
  onPostJob,
}) {
  const navigate = useNavigate();

  const handleApply = (id) => {
    if (onApply) {
      onApply(id);
    } else {
      navigate(`/listings/${id}`);
    }
  };

  const handlePostJob = () => {
    if (onPostJob) {
      onPostJob();
    } else {
      navigate('/post-listing');
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [remoteOnly, setRemoteOnly] = useState(false);

  // Business logic preserved: Filtering based on active state
  const filteredListings = listings.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.skillsRequired.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesRemote = remoteOnly ? item.location.toLowerCase().includes('remote') : true;

    return matchesSearch && matchesCategory && matchesRemote;
  });

  const categories = ['All', 'Engineering', 'Data & AI', 'Design'];

  // Helper for company badge avatar initials
  const getInitials = (name = '') =>
    name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-slate-900 antialiased selection:bg-indigo-500 selection:text-white dark:bg-slate-950 dark:text-slate-100">
      {/* =========================================================================
          1. HEADER / GLOBAL NAVBAR (Glassmorphic, Sticky, Accessible)
         ========================================================================= */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md transition-all dark:border-slate-800/80 dark:bg-slate-900/85">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-blue-500 font-bold text-white shadow-md shadow-indigo-600/25 ring-1 ring-white/20">
              <span className="text-sm font-black tracking-tight">IC</span>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"></span>
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Intern<span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Connect</span>
                </span>
                <span className="rounded-full border border-indigo-100 bg-indigo-50/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/70 dark:text-indigo-300">
                  Portal
                </span>
              </div>
              <p className="hidden text-[11px] font-medium text-slate-500 dark:text-slate-400 sm:block">
                Curated opportunities for high-growth talent
              </p>
            </div>
          </div>

          {/* Action CTA */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePostJob}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-indigo-600/30 transition-all duration-200 hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-600/35 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
            >
              <svg
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-90"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Post Opportunity</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. MAIN CONTENT AREA
         ========================================================================= */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section with Ambient Slate Glow */}
        <section className="relative mb-8 overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 p-6 text-white shadow-2xl sm:p-10">
          {/* Subtle Ambient Radial Glow */}
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-emerald-600/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300 backdrop-blur-sm">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Verified Stipends &amp; Fast-Track Review
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Launch your career with <span className="bg-gradient-to-r from-indigo-300 via-indigo-200 to-sky-300 bg-clip-text text-transparent">curated internships</span>.
            </h1>

            <p className="mt-3 text-sm text-slate-300 sm:text-base leading-relaxed">
              Explore hands-on software engineering, design, and AI roles backed by verified mentors, transparent compensation, and high-impact teams.
            </p>
          </div>

          {/* Integrated Search & Filter Controls */}
          <div className="relative z-10 mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by role, company, or skills (e.g. React, Python, Figma)..."
                className="w-full rounded-2xl border border-slate-700/80 bg-slate-800/80 py-3.5 pl-11 pr-10 text-sm text-white placeholder-slate-400 shadow-inner backdrop-blur-md transition-all duration-200 focus:border-indigo-400 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400/20"
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 transition hover:text-slate-200"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Remote Only Toggle Pill */}
            <label className="flex cursor-pointer select-none items-center gap-3 rounded-2xl border border-slate-700/80 bg-slate-800/80 px-4 py-3.5 text-xs font-semibold text-slate-200 backdrop-blur-md transition-all duration-200 hover:border-slate-600 hover:bg-slate-700/60 sm:w-auto">
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-indigo-600 transition focus:ring-2 focus:ring-indigo-500 focus:ring-offset-slate-900"
              />
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <svg className="h-3.5 w-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
                </svg>
                Remote Only
              </span>
            </label>
          </div>
        </section>

        {/* =========================================================================
            3. CATEGORY FILTER TABS & METRIC BAR
           ========================================================================= */}
        <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`relative rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm shadow-slate-900/20 ring-1 ring-slate-900 dark:bg-indigo-600 dark:ring-indigo-500'
                      : 'border border-slate-200/90 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100/70 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-block h-2 w-2 rounded-full bg-indigo-600" />
            <span>
              Showing <strong className="font-bold text-slate-900 dark:text-white">{filteredListings.length}</strong>{' '}
              {filteredListings.length === 1 ? 'position' : 'positions'}
            </span>
          </div>
        </section>

        {/* =========================================================================
            4. LISTING CARDS GRID
           ========================================================================= */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredListings.length === 0 ? (
            /* Empty State */
            <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 ring-8 ring-slate-50 dark:bg-slate-800 dark:text-slate-500 dark:ring-slate-900/50">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">No opportunities match your search</h3>
              <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400 leading-normal">
                We couldn't find any listings matching your active filters. Try adjusting your search query or reset filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setActiveCategory('All');
                  setRemoteOnly(false);
                }}
                className="mt-6 inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700 transition-all hover:bg-indigo-100 hover:border-indigo-300 active:scale-95 dark:border-indigo-900/50 dark:bg-indigo-950/60 dark:text-indigo-300"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset all filters
              </button>
            </div>
          ) : (
            filteredListings.map((item) => (
              <article
                key={item.id}
                className={`group relative flex flex-col justify-between rounded-3xl border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-slate-900 ${
                  item.isFeatured
                    ? 'border-indigo-200/90 shadow-md shadow-indigo-100/50 ring-1 ring-indigo-50 dark:border-indigo-800/80 dark:ring-indigo-950'
                    : 'border-slate-200/80 shadow-sm hover:border-slate-300 dark:border-slate-800/80 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top Header Row: Company Logo Initials & Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200/80 text-xs font-black text-slate-700 ring-1 ring-slate-200/60 group-hover:from-indigo-50 group-hover:to-indigo-100/80 group-hover:text-indigo-700 dark:from-slate-800 dark:to-slate-700 dark:text-slate-200 transition-colors">
                        {getInitials(item.organization)}
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          {item.category}
                        </span>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{item.organization}</p>
                      </div>
                    </div>

                    {item.isFeatured && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/70 dark:text-indigo-300">
                        <svg className="h-3 w-3 fill-indigo-600 text-indigo-600 dark:fill-indigo-400 dark:text-indigo-400" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Role Title */}
                  <h2 className="mt-4 text-base font-bold text-slate-900 leading-snug transition-colors duration-150 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                    {item.title}
                  </h2>

                  {/* Core Metrics: Location, Duration & Stipend */}
                  <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-50/80 p-3 ring-1 ring-slate-100 dark:bg-slate-800/60 dark:ring-slate-800">
                    <div>
                      <span className="block text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Location
                      </span>
                      <span className="mt-0.5 flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200">
                        <svg className="h-3.5 w-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        <span className="truncate">{item.location}</span>
                      </span>
                    </div>

                    <div>
                      <span className="block text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Stipend
                      </span>
                      <span className="mt-0.5 inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-extrabold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950/50 dark:text-emerald-400 dark:ring-emerald-500/30">
                        {item.stipend}
                      </span>
                    </div>
                  </div>

                  {/* Skills Required Chips */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {item.skillsRequired.map((skill, index) => (
                      <span
                        key={index}
                        className="rounded-lg border border-slate-200/70 bg-slate-100/70 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-700 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer: Metadata & Action CTA */}
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                  <div className="flex flex-col text-[11px] text-slate-400 dark:text-slate-500">
                    <span className="font-medium text-slate-500 dark:text-slate-400">{item.postedDaysAgo}</span>
                    <span className="flex items-center gap-1">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                      </svg>
                      {item.applicantsCount} applied
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApply(item.id)}
                    className="group/btn relative inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:bg-indigo-600 hover:shadow-md hover:shadow-indigo-600/25 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 dark:bg-slate-800 dark:hover:bg-indigo-600"
                  >
                    <span>Apply Now</span>
                    <svg
                      className="h-3 w-3 transition-transform duration-200 group-hover/btn:translate-x-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
