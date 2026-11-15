import { useRef } from 'react';
import {
  PenSquare,
  Image as ImageIcon,
  Video as VideoIcon,
  BarChart2,
  Search,
  UserPlus,
  UserCheck,
  UserX,
  Clock,
  X,
  Loader2,
  Sparkles,
  Users
} from 'lucide-react';

export default function YourSpaceSidebar({
  user,
  onTriggerCreatePost,
  onFileSelect,
  searchQuery,
  setSearchQuery,
  searchUsers = [],
  loadingFriends,
  onSendFriendRequest,
  onRespondFriendRequest,
  friendActionMsg,
  friendsList = [],
  setUnfriendConfirm
}) {
  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const graphInputRef = useRef(null);

  const handlePhotoClick = () => {
    photoInputRef.current?.click();
  };

  const handleVideoClick = () => {
    videoInputRef.current?.click();
  };

  const handleGraphClick = () => {
    graphInputRef.current?.click();
  };

  const onPhotoChosen = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file, 'image');
      e.target.value = '';
    }
  };

  const onVideoChosen = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file, 'video');
      e.target.value = '';
    }
  };

  const onGraphChosen = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file, 'image', '#ProjectMetrics #CareerProgress 📈');
      e.target.value = '';
    }
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-4 space-y-5 transition-all">
      {/* Hidden file inputs for sidebar triggers */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        onChange={onPhotoChosen}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={onVideoChosen}
        className="hidden"
      />
      <input
        ref={graphInputRef}
        type="file"
        accept="image/*"
        onChange={onGraphChosen}
        className="hidden"
      />

      {/* Heading: Your Space */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-[#008BDC] flex items-center justify-center font-bold text-xs">
            {userInitial}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Your Space
            </h2>
            <p className="text-[11px] text-slate-400 truncate max-w-[150px]">
              {user?.name || 'Candidate Space'}
            </p>
          </div>
        </div>
      </div>

      {/* The 4 Post-Related Actions (ONLY in this sidebar) */}
      <div className="space-y-2">
        {/* Prominent Create Post Button */}
        <button
          type="button"
          onClick={onTriggerCreatePost}
          className="w-full bg-[#008BDC] hover:bg-[#0070b0] text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
        >
          <PenSquare className="h-4 w-4" />
          <span>Create Post</span>
        </button>

        {/* Share Photo Button */}
        <button
          type="button"
          onClick={handlePhotoClick}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-[#008BDC] dark:hover:text-[#008BDC] hover:bg-sky-50/70 dark:hover:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 transition duration-150 cursor-pointer text-left"
        >
          <div className="h-6 w-6 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-[#008BDC] flex items-center justify-center shrink-0">
            <ImageIcon className="h-3.5 w-3.5" />
          </div>
          <span>Share Photo</span>
        </button>

        {/* Share Video Button */}
        <button
          type="button"
          onClick={handleVideoClick}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-[#008BDC] dark:hover:text-[#008BDC] hover:bg-sky-50/70 dark:hover:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 transition duration-150 cursor-pointer text-left"
        >
          <div className="h-6 w-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <VideoIcon className="h-3.5 w-3.5" />
          </div>
          <span>Share Video</span>
        </button>

        {/* Share Graph Button */}
        <button
          type="button"
          onClick={handleGraphClick}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-[#008BDC] dark:hover:text-[#008BDC] hover:bg-sky-50/70 dark:hover:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 transition duration-150 cursor-pointer text-left"
        >
          <div className="h-6 w-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <BarChart2 className="h-3.5 w-3.5" />
          </div>
          <span>Share Graph</span>
        </button>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100 dark:border-slate-800/80 pt-1" />

      {/* Find Friends Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-[#008BDC]" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Find Friends
            </h3>
          </div>
          {searchUsers.length > 0 && (
            <span className="text-[10px] font-semibold text-slate-400">
              {searchUsers.length} found
            </span>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search people by name..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 pl-8 pr-7 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-[#008BDC] focus:ring-2 focus:ring-[#008BDC]/20 transition-all duration-150"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Feedback message if any */}
        {friendActionMsg && (
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-sky-50 dark:bg-sky-950/50 border border-sky-100 dark:border-sky-800 text-[11px] font-medium text-sky-800 dark:text-sky-300 animate-fadeIn">
            <Sparkles className="h-3 w-3 text-[#008BDC] shrink-0" />
            <span className="truncate">{friendActionMsg}</span>
          </div>
        )}

        {/* Results List */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {loadingFriends ? (
            <div className="flex items-center justify-center py-6 text-slate-400 gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-[#008BDC]" />
              <span className="text-xs">Searching people...</span>
            </div>
          ) : searchUsers.length === 0 ? (
            <div className="text-center py-5 px-2 bg-slate-50/60 dark:bg-slate-800/40 rounded-xl">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {searchQuery ? 'No matching people found' : 'Type a name to discover peers'}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Connect with students & recruiters
              </p>
            </div>
          ) : (
            searchUsers.map((u) => {
              const initial = u.name ? u.name.charAt(0).toUpperCase() : 'U';
              const isFriend = u.friendStatus === 'accepted';
              const isSent = u.friendStatus === 'pending_sent';
              const isReceived = u.friendStatus === 'pending_received';

              return (
                <div
                  key={u._id}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition duration-150 border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-xs">
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-white text-xs truncate">
                        {u.name}
                      </div>
                      <div className="text-[10px] text-slate-400 capitalize truncate">
                        {u.role || 'student'}
                      </div>
                    </div>
                  </div>

                  {/* Status / Add Friend Button */}
                  <div className="shrink-0">
                    {isFriend ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60">
                        <UserCheck className="h-2.5 w-2.5" /> Friends
                      </span>
                    ) : isSent ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200/60">
                        <Clock className="h-2.5 w-2.5" /> Sent
                      </span>
                    ) : isReceived ? (
                      <button
                        type="button"
                        onClick={() => onRespondFriendRequest(u.requestId, 'accept')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg transition cursor-pointer"
                      >
                        Accept
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSendFriendRequest(u._id)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#008BDC] hover:text-white bg-sky-50 dark:bg-sky-950/60 hover:bg-[#008BDC] dark:hover:bg-[#008BDC] px-2.5 py-1 rounded-lg transition duration-150 cursor-pointer"
                        title="Add Friend"
                      >
                        <UserPlus className="h-3 w-3" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100 dark:border-slate-800/80 pt-1" />

      {/* Connected Friends Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Connected Friends
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            {friendsList.length}
          </span>
        </div>

        {friendsList.length === 0 ? (
          <div className="text-center py-4 px-2 bg-slate-50/60 dark:bg-slate-800/40 rounded-xl">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              No connections yet
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Use Find Friends above to connect
            </p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {friendsList.map((item) => {
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
    </div>
  );
}
