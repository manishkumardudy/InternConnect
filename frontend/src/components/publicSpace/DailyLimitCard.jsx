import { useTranslation } from 'react-i18next';
import { Sparkles, UserPlus, UserCheck, UserX } from 'lucide-react';

export default function DailyLimitCard({
  stats,
  pendingRequests = [],
  onOpenFriends,
  handleRespondRequest
}) {
  const { t } = useTranslation();

  const postsToday = stats?.postsToday || 0;
  const isUnlimited = stats?.maxPostsAllowed === 'unlimited';
  const maxPosts = typeof stats?.maxPostsAllowed === 'number' ? stats.maxPostsAllowed : 0;
  const isLocked = stats?.friendCount === 0;

  // Percentage for progress bar
  let progressPercent = 0;
  if (isUnlimited) {
    progressPercent = 100;
  } else if (!isLocked && maxPosts > 0) {
    progressPercent = Math.min(100, Math.round((postsToday / maxPosts) * 100));
  }

  const topRequests = pendingRequests.slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Daily Post Limit Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-sky-500" />
            {t('publicSpace.dailyPostLimit')}
          </h3>
        </div>

        {/* Big numbers display */}
        <div className="pt-1">
          {isLocked ? (
            <div className="text-3xl font-extrabold text-amber-500 tracking-tight">
              0 / 0
            </div>
          ) : isUnlimited ? (
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {postsToday} / {t('publicSpace.unlimited')}
            </div>
          ) : (
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {postsToday} <span className="text-slate-400 text-xl font-normal">/ {maxPosts}</span>
            </div>
          )}

          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                isUnlimited
                  ? 'bg-emerald-500'
                  : progressPercent >= 100
                  ? 'bg-rose-500'
                  : 'bg-sky-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* 3 Rules list */}
        <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 pt-1">
          <li className="flex items-start gap-2">
            <span className="text-rose-500 font-bold leading-none">•</span>
            <span>{t('publicSpace.rule1')}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 font-bold leading-none">•</span>
            <span>{t('publicSpace.rule2')}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 font-bold leading-none">•</span>
            <span>{t('publicSpace.rule3')}</span>
          </li>
        </ul>

        {/* Manage friends button */}
        <button
          type="button"
          onClick={onOpenFriends}
          className="w-full rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 text-xs font-bold text-center transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <UserPlus className="h-3.5 w-3.5 text-sky-500" />
          {t('publicSpace.manageFriends', { count: stats?.friendCount || 0 })}
        </button>
      </div>

      {/* Pending Requests Card (ONLY if pendingRequests.length > 0) */}
      {pendingRequests.length > 0 && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-sky-500" />
              {t('publicSpace.pendingRequestsHeading')}
            </h3>
            <span className="bg-lime-400 text-slate-900 font-extrabold text-xs px-2 py-0.5 rounded-full shadow-xs">
              {pendingRequests.length}
            </span>
          </div>

          <div className="space-y-2">
            {topRequests.map((req) => (
              <div
                key={req._id}
                className="flex items-center justify-between text-xs bg-gray-50 dark:bg-slate-800/60 p-2.5 rounded-2xl"
              >
                <div className="min-w-0 pr-2">
                  <div className="font-bold text-slate-900 dark:text-white truncate">
                    {req.requester?.name || 'User'}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize truncate">
                    {req.requester?.role || 'student'}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleRespondRequest(req._id, 'accept')}
                    className="p-1.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition cursor-pointer"
                    title={t('publicSpace.acceptBtn')}
                  >
                    <UserCheck className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRespondRequest(req._id, 'reject')}
                    className="p-1.5 bg-rose-600 text-white rounded-xl hover:bg-rose-500 transition cursor-pointer"
                    title={t('publicSpace.rejectBtn')}
                  >
                    <UserX className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
