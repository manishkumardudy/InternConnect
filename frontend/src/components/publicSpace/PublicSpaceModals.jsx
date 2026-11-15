import { UserX, Trash2 } from 'lucide-react';

export function UnfriendModal({ unfriendConfirm, setUnfriendConfirm, handleUnfriend }) {
  if (!unfriendConfirm.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2.5 text-rose-600">
          <UserX className="h-5 w-5" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Unfriend Confirmation</h3>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Are you sure you want to unfriend <span className="font-bold">{unfriendConfirm.friendName}</span>?
        </p>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => setUnfriendConfirm({ isOpen: false, friendUserId: null, friendName: '' })}
            className="rounded-full px-4 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              const targetId = unfriendConfirm.friendUserId;
              setUnfriendConfirm({ isOpen: false, friendUserId: null, friendName: '' });
              if (targetId) handleUnfriend(targetId);
            }}
            className="rounded-full bg-rose-600 hover:bg-rose-500 text-white px-4 py-1.5 text-xs font-bold transition shadow-sm cursor-pointer"
          >
            Unfriend
          </button>
        </div>
      </div>
    </div>
  );
}

export function DeleteCommentModal({ deleteCommentConfirm, setDeleteCommentConfirm, handleDeleteComment }) {
  if (!deleteCommentConfirm.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2.5 text-rose-600">
          <Trash2 className="h-5 w-5" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Comment?</h3>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Are you sure you want to delete this comment?
        </p>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => setDeleteCommentConfirm({ isOpen: false, postId: null, commentId: null })}
            className="rounded-full px-4 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              const { postId, commentId } = deleteCommentConfirm;
              setDeleteCommentConfirm({ isOpen: false, postId: null, commentId: null });
              if (postId && commentId) handleDeleteComment(postId, commentId);
            }}
            className="rounded-full bg-rose-600 hover:bg-rose-500 text-white px-4 py-1.5 text-xs font-bold transition shadow-sm cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export function DeletePostModal({ deletePostConfirm, setDeletePostConfirm, handleDeletePost }) {
  if (!deletePostConfirm.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2.5 text-rose-600">
          <Trash2 className="h-5 w-5" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete this post?</h3>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Are you sure you want to delete this post? This action cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => setDeletePostConfirm({ isOpen: false, postId: null })}
            className="rounded-full px-4 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              const { postId } = deletePostConfirm;
              setDeletePostConfirm({ isOpen: false, postId: null });
              if (postId) handleDeletePost(postId);
            }}
            className="rounded-full bg-rose-600 hover:bg-rose-500 text-white px-4 py-1.5 text-xs font-bold transition shadow-sm cursor-pointer"
          >
            Delete Post
          </button>
        </div>
      </div>
    </div>
  );
}
