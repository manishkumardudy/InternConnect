import { X, CheckCircle2, AlertCircle, FileCheck, Loader2 } from 'lucide-react';

export default function PostComposer({
  user,
  caption,
  setCaption,
  selectedFile,
  previewUrl,
  previewType,
  onClearMedia,
  handleCreatePost,
  publishing,
  postError,
  postSuccess,
  stats,
  textareaRef
}) {
  const isLocked = stats.friendCount === 0;
  const isLimitReached = !isLocked && !stats.canPost && stats.maxPostsAllowed !== 'unlimited';
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-4 space-y-3.5 transition-all">
      {/* Informational banners if locked or daily limit reached */}
      {isLocked && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-medium border border-amber-200/70 dark:border-amber-800/60">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            Connect with at least 1 friend using <strong>Find Friends</strong> in the left sidebar to unlock posting.
          </span>
        </div>
      )}

      {isLimitReached && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs font-medium border border-rose-200/70 dark:border-rose-800/60">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>
            Daily post limit reached ({stats.postsToday}/{stats.maxPostsAllowed}). Add more friends to unlock higher limits!
          </span>
        </div>
      )}

      {postError && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-medium border border-rose-200 dark:border-rose-800 flex items-center justify-between gap-2">
          <span>{postError}</span>
        </div>
      )}

      {postSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{postSuccess}</span>
        </div>
      )}

      <form onSubmit={handleCreatePost} className="space-y-3">
        {/* Top: Current User Avatar + Textarea */}
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0">
            {userInitial}
          </div>
          <div className="w-full">
            <textarea
              ref={textareaRef}
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              disabled={!stats.canPost}
              placeholder="What's on your mind? Share your project or internship journey..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-[#008BDC] focus:ring-2 focus:ring-[#008BDC]/20 outline-none transition resize-none disabled:opacity-50 disabled:cursor-not-allowed leading-relaxed"
            />
          </div>
        </div>

        {/* Media Preview Card (when user chooses Photo / Video / Graph from sidebar) */}
        {previewUrl && (
          <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-200/80 dark:border-slate-800 max-h-64 flex items-center justify-center group">
            {previewType === 'video' ? (
              <video src={previewUrl} controls className="max-h-64 w-auto object-contain mx-auto" />
            ) : (
              <img
                src={previewUrl}
                alt="Selected media preview"
                className="max-h-64 w-auto object-contain mx-auto"
              />
            )}

            {/* Media Info Overlay */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-white text-[11px] font-medium">
              <FileCheck className="h-3 w-3 text-sky-400" />
              <span className="truncate max-w-[180px]">{selectedFile?.name}</span>
              {selectedFile?.size && (
                <span className="text-slate-400">({formatFileSize(selectedFile.size)})</span>
              )}
            </div>

            {/* Remove Media Button */}
            <button
              type="button"
              onClick={onClearMedia}
              title="Remove media"
              className="absolute top-2 right-2 rounded-full bg-black/70 text-white p-1.5 hover:bg-rose-600 transition duration-150 cursor-pointer shadow-sm"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Bottom Row: Publish Post Button (no duplicate action buttons) */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/60">
          <div className="text-[11px] text-slate-400 font-medium">
            {selectedFile ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                ✓ Media ready to publish
              </span>
            ) : (
              <span>Write something or add a photo/video from Your Space</span>
            )}
          </div>

          <button
            type="submit"
            disabled={!stats.canPost || publishing || (!selectedFile && !caption.trim())}
            className="publish-btn rounded-xl border border-[#008BDC] bg-white dark:bg-slate-900 text-[#008BDC] dark:text-[#008BDC] hover:bg-sky-50 dark:hover:bg-sky-950/40 px-5 py-2 text-xs font-semibold shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 transition-colors duration-150 active:scale-[0.98]"
          >
            {publishing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <span>Publish Post</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
