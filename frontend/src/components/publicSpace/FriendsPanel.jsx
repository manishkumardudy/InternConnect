import { useTranslation } from 'react-i18next';
import { UserPlus, Users } from 'lucide-react';

export default function FriendsPanel({ friendsList = [], stats, onOpenFriends }) {
  const { t } = useTranslation();
  const topFriends = friendsList.slice(0, 8);
  const friendCount = stats?.friendCount ?? friendsList.length;

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 p-5 space-y-4">
      {/* Header with Lime Badge */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
          <Users className="h-4 w-4 text-sky-500" />
          {t('publicSpace.yourFriends')}
        </h3>
        <span className="bg-lime-400 text-slate-900 font-extrabold text-xs px-2 py-0.5 rounded-full shadow-xs">
          {friendCount}
        </span>
      </div>

      {/* Friends List or Empty State */}
      {topFriends.length === 0 ? (
        <div className="text-center py-6 px-3 bg-gray-50 dark:bg-slate-800/50 rounded-2xl space-y-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {t('publicSpace.addFriendsToUnlock')}
          </p>
          <button
            type="button"
            onClick={onOpenFriends}
            className="rounded-full bg-sky-600 hover:bg-sky-500 text-white px-4 py-1.5 text-xs font-bold transition shadow-sm cursor-pointer"
          >
            {t('publicSpace.findPeople')}
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {topFriends.map((item) => {
            const initial = item.user?.name ? item.user.name.charAt(0).toUpperCase() : 'U';
            return (
              <div
                key={item.friendshipId || item._id}
                className="flex items-center gap-3 p-2 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800/60 transition"
              >
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {item.user?.name}
                  </div>
                  <div className="text-[11px] text-slate-400 capitalize truncate">
                    {item.user?.role || 'student'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manage Friends Button */}
      <button
        type="button"
        onClick={onOpenFriends}
        className="w-full rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 text-xs font-bold text-center transition flex items-center justify-center gap-2 cursor-pointer"
      >
        <UserPlus className="h-3.5 w-3.5 text-sky-500" />
        {t('publicSpace.manageFriends', { count: friendCount })}
      </button>
    </div>
  );
}
