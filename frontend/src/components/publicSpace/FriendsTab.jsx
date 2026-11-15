import { useTranslation } from 'react-i18next';
import { UserPlus, UserCheck, UserX, Search, Sparkles } from 'lucide-react';

export default function FriendsTab({
  friendsList = [],
  pendingRequests = [],
  searchUsers = [],
  searchQuery,
  setSearchQuery,
  loadingFriends,
  friendActionMsg,
  handleSendFriendRequest,
  handleRespondRequest,
  setUnfriendConfirm
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {friendActionMsg && (
        <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300 text-xs font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-sky-500" />
          <span>{friendActionMsg}</span>
        </div>
      )}

      {/* 1. Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-sky-500" />
              {t('publicSpace.incomingRequestsHeading', { count: pendingRequests.length })}
            </h2>
            <span className="bg-lime-400 text-slate-900 font-extrabold text-xs px-2.5 py-0.5 rounded-full shadow-xs">
              {pendingRequests.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingRequests.map((req) => (
              <div key={req._id} className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="min-w-0 pr-2">
                  <div className="font-bold text-slate-900 dark:text-white text-xs truncate">{req.requester?.name || 'User'}</div>
                  <div className="text-[10px] text-slate-400 capitalize">{req.requester?.role || 'student'}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button type="button" onClick={() => handleRespondRequest(req._id, 'accept')} className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 transition cursor-pointer">
                    <UserCheck className="h-3 w-3" /> {t('publicSpace.acceptBtn')}
                  </button>
                  <button type="button" onClick={() => handleRespondRequest(req._id, 'reject')} className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 transition cursor-pointer">
                    <UserX className="h-3 w-3" /> {t('publicSpace.rejectBtn')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Active Friends & Search People Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Friends (2 Columns) */}
        <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-emerald-500" />
              {t('publicSpace.myFriendsHeading', { count: friendsList.length })}
            </h2>
            <span className="bg-lime-400 text-slate-900 font-extrabold text-xs px-2.5 py-0.5 rounded-full shadow-xs">
              {friendsList.length}
            </span>
          </div>

          {friendsList.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">{t('publicSpace.noFriendsYet')}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {friendsList.map((item) => (
                <div key={item.friendshipId} className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className="h-8 w-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                      {item.user?.name ? item.user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 dark:text-white text-xs truncate">{item.user?.name}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{item.user?.role}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUnfriendConfirm({ isOpen: true, friendUserId: item.user?._id, friendName: item.user?.name || 'this user' })}
                    className="text-[11px] text-rose-500 hover:text-rose-700 font-semibold px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer shrink-0"
                  >
                    {t('publicSpace.unfriend')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search People (1 Column) */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Search className="h-4 w-4 text-sky-500" />
            {t('publicSpace.findPeople')}
          </h2>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('publicSpace.searchPlaceholder')}
              className="w-full rounded-full border border-slate-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/60 px-4 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-sky-500"
            />
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {loadingFriends ? (
              <p className="text-xs text-slate-400 text-center py-4">{t('publicSpace.loadingUsers')}</p>
            ) : searchUsers.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">{t('publicSpace.noUsersFound')}</p>
            ) : (
              searchUsers.map((u) => (
                <div key={u._id} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-slate-800/60 rounded-2xl text-xs border border-slate-100 dark:border-slate-800">
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-slate-900 dark:text-white truncate">{u.name}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{u.role}</div>
                  </div>
                  {u.friendStatus === 'accepted' ? (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full shrink-0">
                      {t('publicSpace.friendsBadge')}
                    </span>
                  ) : u.friendStatus === 'pending_sent' ? (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full shrink-0">
                      {t('publicSpace.pendingBadge')}
                    </span>
                  ) : u.friendStatus === 'pending_received' ? (
                    <button type="button" onClick={() => handleRespondRequest(u.requestId, 'accept')} className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold shrink-0 cursor-pointer">
                      {t('publicSpace.acceptBtn')}
                    </button>
                  ) : (
                    <button type="button" onClick={() => handleSendFriendRequest(u._id)} className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-full text-[10px] font-bold flex items-center gap-1 transition cursor-pointer shrink-0">
                      <UserPlus className="h-3 w-3" /> {t('publicSpace.addFriendBtn')}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
