import React, { useState } from 'react';

export default function StudentDashboardLive({
  userName = "Manish",
  profileCompletion = 75,
  initialStats = { applied: 4, shortlisted: 2, hired: 1, saved: 12 },
  onExplore = () => {},
  onAction = () => {},
  applications = [],
  recommended = []
}) {
  const [stats, setStats] = useState(initialStats);
  const [activeTab, setActiveTab] = useState('overview');

  // Keep stats in sync if initialStats updates from API
  React.useEffect(() => {
    if (initialStats) {
      setStats(initialStats);
    }
  }, [initialStats.applied, initialStats.shortlisted, initialStats.hired, initialStats.saved]);

  const bentoMetrics = [
    {
      label: 'Submitted Applications',
      value: stats.applied,
      trend: '+2 this week',
      actionKey: 'view-applications',
      icon: (
        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      bgGlow: 'from-indigo-500/10 to-transparent',
      borderColor: 'group-hover:border-indigo-500/40',
    },
    {
      label: 'Shortlisted Rounds',
      value: stats.shortlisted,
      trend: 'Action Required',
      trendAlert: true,
      actionKey: 'view-shortlisted',
      icon: (
        <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgGlow: 'from-amber-500/10 to-transparent',
      borderColor: 'group-hover:border-amber-500/40',
    },
    {
      label: 'Selected & Offers',
      value: stats.hired,
      trend: 'Direct Selection',
      actionKey: 'view-hired',
      icon: (
        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgGlow: 'from-emerald-500/10 to-transparent',
      borderColor: 'group-hover:border-emerald-500/40',
    },
    {
      label: 'Saved Opportunities',
      value: stats.saved,
      trend: 'Expiring soon',
      actionKey: 'view-saved',
      icon: (
        <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      ),
      bgGlow: 'from-rose-500/10 to-transparent',
      borderColor: 'group-hover:border-rose-500/40',
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#070b14] text-slate-100 overflow-hidden selection:bg-indigo-500 selection:text-white font-sans">
      
      {/* 1. Ambient Background Mesh Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-tr from-indigo-600/20 via-sky-500/10 to-transparent blur-[130px] rounded-full" />
      <div className="pointer-events-none absolute top-[30rem] -right-40 w-[600px] h-[350px] bg-purple-600/15 blur-[120px] rounded-full" />

      {/* 2. Sleek Floating Header */}
      <nav className="sticky top-4 z-40 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-5 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
          <div 
            onClick={() => onAction('home')} 
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.5)]">
              IC
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white">
                Intern<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-sky-400">Connect</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onAction('resume-builder')}
              className="relative inline-flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/80 px-4 py-2 text-xs font-semibold text-slate-200 transition-all duration-300 hover:border-slate-500 hover:bg-slate-800 hover:shadow-lg active:scale-95 cursor-pointer"
            >
              <span>📄 Resume Builder</span>
              <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] text-indigo-300 border border-indigo-500/30">Pro</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onExplore();
                onAction('explore');
              }}
              className="relative inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-[0_0_25px_rgba(79,70,229,0.35)] transition-all duration-300 hover:bg-indigo-500 hover:shadow-[0_0_30px_rgba(79,70,229,0.55)] active:scale-95 cursor-pointer"
            >
              <span>Explore Roles</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* 3. Main Dashboard Layout */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Animated Hero Bento Header */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/90 via-slate-900/50 to-slate-950/80 p-6 sm:p-10 backdrop-blur-md shadow-2xl mb-8">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                Verified Candidate Portal
              </div>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-white">{userName}!</span>
              </h1>
              <p className="mt-2 text-sm text-slate-400 max-w-xl leading-relaxed">
                Track your applications in real-time, get fast-tracked by verified recruiters, and expand your portfolio.
              </p>
            </div>

            {/* Profile Progress Widget */}
            <div className="min-w-[260px] rounded-2xl border border-white/10 bg-slate-950/60 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-300">Profile Strength</span>
                <span className="text-indigo-400">{profileCompletion}%</span>
              </div>
              <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-all duration-1000 ease-out"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Complete tasks to boost rank</span>
                <button
                  type="button"
                  onClick={() => onAction('complete-profile')}
                  className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  Boost Now →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Live Bento Metric Grid */}
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          {bentoMetrics.map((item, index) => (
            <div
              key={index}
              onClick={() => onAction(item.actionKey)}
              className={`group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-700 hover:bg-slate-900/80 hover:shadow-[0_12px_24px_-10px_rgba(0,0,0,0.5)] cursor-pointer ${item.borderColor}`}
            >
              {/* Internal Accent Glow */}
              <div className={`pointer-events-none absolute -top-12 -right-12 h-28 w-28 rounded-full bg-gradient-to-br ${item.bgGlow} blur-2xl group-hover:scale-150 transition-all duration-500`} />

              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-slate-950/80 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    item.trendAlert
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                      : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                  }`}
                >
                  {item.trend}
                </span>
              </div>

              <div className="mt-4">
                <div className="text-3xl font-black tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                  {item.value}
                </div>
                <div className="mt-1 text-xs font-medium text-slate-400">{item.label}</div>
              </div>
            </div>
          ))}
        </section>

        {/* Quick Actions & Live Stream Section */}
        <section className="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-6 backdrop-blur-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white tracking-wide">Recommended Actions for You</h2>
            <span className="text-xs text-slate-500">Live AI matching</span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {recommended.length >= 2 ? (
              <>
                <div className="flex flex-col justify-between rounded-xl border border-white/5 bg-slate-950/40 p-4 hover:border-slate-700 transition">
                  <div>
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Skill Match: 95%</span>
                    <h3 className="mt-1 text-sm font-semibold text-white">{recommended[0]?.title}</h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {recommended[0]?.companyId?.companyName || 'Verified Company'} • {recommended[0]?.location || 'Remote'} • {recommended[0]?.stipendMax > 0 ? `₹${recommended[0]?.stipendMin?.toLocaleString()}/mo` : 'Stipend Available'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onAction(`apply-${recommended[0]?._id}`)}
                    className="mt-4 w-full rounded-lg bg-indigo-600/20 py-2 text-xs font-bold text-indigo-300 hover:bg-indigo-600 hover:text-white transition cursor-pointer"
                  >
                    1-Click Quick Apply
                  </button>
                </div>

                <div className="flex flex-col justify-between rounded-xl border border-white/5 bg-slate-950/40 p-4 hover:border-slate-700 transition">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Skill Match: 88%</span>
                    <h3 className="mt-1 text-sm font-semibold text-white">{recommended[1]?.title}</h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {recommended[1]?.companyId?.companyName || 'Verified Company'} • {recommended[1]?.location || 'Hybrid'} • {recommended[1]?.stipendMax > 0 ? `₹${recommended[1]?.stipendMin?.toLocaleString()}/mo` : 'Competitive'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onAction(`apply-${recommended[1]?._id}`)}
                    className="mt-4 w-full rounded-lg bg-slate-800 py-2 text-xs font-bold text-slate-300 hover:bg-indigo-600 hover:text-white transition cursor-pointer"
                  >
                    Review Opportunity
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col justify-between rounded-xl border border-white/5 bg-slate-950/40 p-4 hover:border-slate-700 transition">
                  <div>
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Skill Match: 95%</span>
                    <h3 className="mt-1 text-sm font-semibold text-white">Full Stack React & Node Developer</h3>
                    <p className="mt-1 text-xs text-slate-400">ElevanceSkills • Remote • ₹3,000/mo</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onAction('quick-apply-1')}
                    className="mt-4 w-full rounded-lg bg-indigo-600/20 py-2 text-xs font-bold text-indigo-300 hover:bg-indigo-600 hover:text-white transition cursor-pointer"
                  >
                    1-Click Quick Apply
                  </button>
                </div>

                <div className="flex flex-col justify-between rounded-xl border border-white/5 bg-slate-950/40 p-4 hover:border-slate-700 transition">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Skill Match: 88%</span>
                    <h3 className="mt-1 text-sm font-semibold text-white">Applied AI & ML Intern</h3>
                    <p className="mt-1 text-xs text-slate-400">DataCorp • Jaipur (Hybrid) • ₹5,000/mo</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onAction('quick-apply-2')}
                    className="mt-4 w-full rounded-lg bg-slate-800 py-2 text-xs font-bold text-slate-300 hover:bg-indigo-600 hover:text-white transition cursor-pointer"
                  >
                    Review Opportunity
                  </button>
                </div>
              </>
            )}

            <div className="flex flex-col justify-between rounded-xl border border-dashed border-slate-700 bg-slate-950/20 p-4 text-center">
              <div className="my-auto">
                <span className="text-2xl">✨</span>
                <h3 className="mt-2 text-sm font-semibold text-white">Generate Custom Resume</h3>
                <p className="mt-1 text-xs text-slate-500">Auto-tailor ATS score for target job</p>
              </div>
              <button
                type="button"
                onClick={() => onAction('tailor-resume')}
                className="mt-4 w-full rounded-lg border border-slate-700 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
              >
                Launch Tailor Tool
              </button>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
