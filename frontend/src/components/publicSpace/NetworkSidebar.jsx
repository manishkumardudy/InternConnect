import { UserCheck, UserX, Users, ShieldCheck, Sparkles } from 'lucide-react';

export default function NetworkSidebar({
  friendsList = [],
  pendingRequests = [],
  handleRespondRequest,
  setUnfriendConfirm
}) {
  const topRequests = pendingRequests.slice(0, 4);
  const activeFriends = friendsList.slice(0, 6);

  return (
    <div className="space-y-4">
      {/* 1. Pending Friend Requests Card (ONLY if requests exist) */}
      {pendingRequests.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-4 space-y-3 transition-all">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-[#008BDC]" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Friend Requests
              </h3>
            </div>
            <span className="bg-[#008BDC] text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
              {pendingRequests.length}
            </span>
          </div>

          <div className="space-y-2">
            {topRequests.map((req) => {
              const initial = req.requester?.name ? req.requester.name.charAt(0).toUpperCase() : 'U';
              return (
                <div
                  key={req._id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-white text-xs truncate">
                        {req.requester?.name || 'User'}
                      </div>
                      <div className="text-[10px] text-slate-400 capitalize truncate">
                        {req.requester?.role || 'student'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleRespondRequest(req._id, 'accept')}
                      className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition duration-150 cursor-pointer shadow-xs"
                      title="Accept request"
                    >
                      <UserCheck className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRespondRequest(req._id, 'reject')}
                      className="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition duration-150 cursor-pointer shadow-xs"
                      title="Decline request"
                    >
                      <UserX className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Connected Friends Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-4 space-y-3 transition-all">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-[#008BDC]" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Connected Friends
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            {friendsList.length}
          </span>
        </div>

        {activeFriends.length === 0 ? (
          <div className="text-center py-4 px-2 bg-slate-50/60 dark:bg-slate-800/40 rounded-xl">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              No connections yet
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Use "Find Friends" in Your Space to connect
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeFriends.map((item) => {
              const friendUser = item.user;
              const initial = friendUser?.name ? friendUser.name.charAt(0).toUpperCase() : 'U';
              return (
                <div
                  key={item.friendshipId || item._id}
                  className="group flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition duration-150"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="relative shrink-0">
                      <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                        {initial}
                      </div>
                      <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {friendUser?.name}
                      </div>
                      <div className="text-[10px] text-slate-400 capitalize truncate">
                        {friendUser?.role || 'student'}
                      </div>
                    </div>
                  </div>

                  {setUnfriendConfirm && (
                    <button
                      type="button"
                      onClick={() =>
                        setUnfriendConfirm({
                          isOpen: true,
                          friendUserId: friendUser?._id,
                          friendName: friendUser?.name || 'this user'
                        })
                      }
                      title="Remove connection"
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 rounded-md transition duration-150 cursor-pointer shrink-0"
                    >
                      <UserX className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Community Guidelines Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-4 space-y-2.5 transition-all">
        <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800/80 pb-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Community Space
          </h3>
        </div>

        <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 pt-1">
          <li className="flex items-start gap-2">
            <span className="text-[#008BDC] font-bold">•</span>
            <span>Share authentic internship experiences and career milestones.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-500 font-bold">•</span>
            <span>Post code snippets, design charts, and tech projects.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 font-bold">•</span>
            <span>Support fellow students and build genuine professional networks.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
