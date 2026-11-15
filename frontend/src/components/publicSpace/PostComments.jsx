import { useTranslation } from 'react-i18next';
import { Pin, Trash2, Send } from 'lucide-react';

export default function PostComments({
  post,
  currentUserId,
  postOwnerId,
  commentInputs,
  setCommentInputs,
  submittingComments,
  handleAddComment,
  handlePinComment,
  setDeleteCommentConfirm
}) {
  const { t } = useTranslation();

  return (
    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
      {/* Comments Bubble List */}
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {post.comments && post.comments.length > 0 ? (
          post.comments.map((comment, idx) => {
            const commentAuthorId = String(comment.user?._id || comment.user?.id || comment.userId || '');
            const isCommentAuthor = Boolean(currentUserId && commentAuthorId && currentUserId === commentAuthorId);
            const isPostOwner = Boolean(currentUserId && postOwnerId && currentUserId === postOwnerId);
            const canDelete = isCommentAuthor || isPostOwner;
            const canPin = isPostOwner;

            return (
              <div
                key={comment._id || idx}
                className={`flex items-start justify-between gap-2 text-xs p-3 rounded-2xl ${
                  comment.pinned
                    ? 'bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60'
                    : 'bg-gray-50 dark:bg-slate-800/80'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {comment.user?.name || t('publicSpace.deletedUser')}
                    </span>
                    {comment.pinned && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 px-1.5 py-0.2 text-[9px] font-bold">
                        <Pin className="h-2 w-2 fill-current" /> Pinned
                      </span>
                    )}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed break-words">
                    {comment.text}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {canPin && (
                    <button
                      type="button"
                      onClick={() => handlePinComment(post._id, comment._id)}
                      title={comment.pinned ? 'Unpin' : 'Pin'}
                      className="p-1 rounded text-slate-400 hover:text-amber-600 transition cursor-pointer"
                    >
                      <Pin className={`h-3 w-3 ${comment.pinned ? 'fill-current text-amber-600' : ''}`} />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => setDeleteCommentConfirm({ isOpen: true, postId: post._id, commentId: comment._id })}
                      title="Delete"
                      className="p-1 rounded text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-slate-400 text-center py-2">
            {t('publicSpace.noCommentsYet')}
          </p>
        )}
      </div>

      {/* Comment Input */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={commentInputs[post._id] || ''}
          disabled={!!submittingComments[post._id]}
          onChange={(e) =>
            setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))
          }
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (!submittingComments[post._id]) handleAddComment(post._id);
            }
          }}
          placeholder={t('publicSpace.commentPlaceholder', 'Write a thoughtful comment...')}
          className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-[#008BDC] focus:ring-2 focus:ring-[#008BDC]/20 transition"
        />
        <button
          type="button"
          onClick={() => handleAddComment(post._id)}
          disabled={!!submittingComments[post._id] || !commentInputs[post._id]?.trim()}
          className="rounded-xl bg-[#008BDC] hover:bg-[#0070b0] text-white p-2 text-xs font-semibold transition disabled:opacity-40 cursor-pointer shadow-xs"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
