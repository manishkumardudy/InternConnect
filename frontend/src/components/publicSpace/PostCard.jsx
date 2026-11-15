import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getMediaUrl } from '../../services/api';
import { timeAgo } from '../../utils/listingFormat';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Trash2
} from 'lucide-react';
import SharePopover from './SharePopover';
import PostComments from './PostComments';

export default function PostCard({
  post,
  currentUser,
  handleLikeToggle,
  openCommentSections,
  setOpenCommentSections,
  commentInputs,
  setCommentInputs,
  submittingComments,
  handleAddComment,
  handlePinComment,
  setDeleteCommentConfirm,
  openShareMenuId,
  setOpenShareMenuId,
  handleSharePlatform,
  setDeletePostConfirm
}) {
  const { t } = useTranslation();
  const [mediaError, setMediaError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const menuRef = useRef(null);

  const authorName = post.author?.name || 'InternConnect User';
  const authorRole = post.author?.role || 'student';
  const authorInitial = authorName ? authorName.charAt(0).toUpperCase() : 'U';

  const isCommentsOpen = !!openCommentSections[post._id];
  const isShareOpen = openShareMenuId === post._id;

  const currentUserId = String(currentUser?._id || currentUser?.id || currentUser?.userId || '');
  const postOwnerId = String(post.author?._id || post.author?.id || post.userId || '');

  // Close three-dot menu on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [menuOpen]);

  const handleCopyLink = async () => {
    setCopiedLink(true);
    await handleSharePlatform(post, 'copy');
    setTimeout(() => {
      setCopiedLink(false);
      setMenuOpen(false);
    }, 1500);
  };

  const hasMedia = Boolean(post.mediaUrl && !mediaError);

  return (
    <article
      id={`post-${post._id}`}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-sm transition-all duration-200 p-4 sm:p-5 space-y-3.5"
    >
      {/* Header: Author info + Timestamp + Three-dot Menu */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0">
            {authorInitial}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                {authorName}
              </span>
              <span
                className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                  authorRole === 'recruiter'
                    ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/50'
                    : 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200/50'
                }`}
              >
                {authorRole}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              {timeAgo(post.createdAt, t)}
            </span>
          </div>
        </div>

        {/* Three-dot Action Menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition duration-150 cursor-pointer"
            aria-label="Post actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 z-30 w-44 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg py-1.5 text-xs text-slate-700 dark:text-slate-200 animate-fadeIn">
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-left cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-400" />
                    <span>Copy Post Link</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  handleSharePlatform(post, 'whatsapp');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-left cursor-pointer"
              >
                <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
                <span>Share via WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  handleSharePlatform(post, 'linkedin');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-left cursor-pointer"
              >
                <ExternalLink className="h-3.5 w-3.5 text-blue-600" />
                <span>Share on LinkedIn</span>
              </button>

              {/* Delete Post — only for post owner */}
              {currentUserId && postOwnerId && currentUserId === postOwnerId && (
                <>
                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setDeletePostConfirm({ isOpen: true, postId: post._id });
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 transition text-left cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="font-semibold">Delete Post</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Caption Content */}
      {post.caption && (
        <p className="text-slate-800 dark:text-slate-200 text-xs sm:text-sm whitespace-pre-line leading-relaxed">
          {post.caption}
        </p>
      )}

      {/* Media: Image or Video */}
      {/* Critical: Hide empty media containers instead of displaying a large placeholder when no media exists */}
      {hasMedia && (
        <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-center">
          {post.mediaType === 'video' ? (
            <video
              src={getMediaUrl(post.mediaUrl)}
              controls
              onError={() => setMediaError(true)}
              className="w-full max-h-[30rem] object-contain rounded-xl"
            />
          ) : (
            <img
              src={getMediaUrl(post.mediaUrl)}
              alt="Post content"
              onError={() => setMediaError(true)}
              loading="lazy"
              className="w-full max-h-[30rem] object-cover rounded-xl"
            />
          )}
        </div>
      )}

      {/* Action Row: Like, Comments, Share */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          {/* Like Button */}
          <button
            type="button"
            onClick={() => handleLikeToggle(post._id)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
              post.isLiked
                ? 'text-rose-600 bg-rose-50/70 dark:bg-rose-950/40'
                : 'text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50/50'
            }`}
          >
            <Heart
              className={`h-4 w-4 transition-transform duration-200 ${
                post.isLiked ? 'fill-rose-600 text-rose-600 scale-110' : ''
              }`}
            />
            <span>{post.likesCount || 0}</span>
          </button>

          {/* Comment Drawer Toggle Button */}
          <button
            type="button"
            onClick={() =>
              setOpenCommentSections(prev => ({
                ...prev,
                [post._id]: !prev[post._id]
              }))
            }
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
              isCommentsOpen
                ? 'text-[#008BDC] bg-sky-50 dark:bg-sky-950/40'
                : 'text-slate-500 dark:text-slate-400 hover:text-[#008BDC] hover:bg-sky-50/50'
            }`}
          >
            <MessageCircle className="h-4 w-4" />
            <span>{post.comments ? post.comments.length : 0}</span>
          </button>
        </div>

        {/* Share Button & Popover */}
        <div className="relative share-menu-container">
          <button
            type="button"
            onClick={() => setOpenShareMenuId(prev => (prev === post._id ? null : post._id))}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
              isShareOpen
                ? 'text-[#008BDC] bg-sky-50 dark:bg-sky-950/40'
                : 'text-slate-500 dark:text-slate-400 hover:text-[#008BDC] hover:bg-sky-50/50'
            }`}
          >
            <Share2 className="h-4 w-4" />
            <span>{post.shareCount || 0}</span>
          </button>

          {isShareOpen && (
            <SharePopover post={post} onSharePlatform={handleSharePlatform} />
          )}
        </div>
      </div>

      {/* Expandable Comments Drawer */}
      {isCommentsOpen && (
        <PostComments
          post={post}
          currentUserId={currentUserId}
          postOwnerId={postOwnerId}
          commentInputs={commentInputs}
          setCommentInputs={setCommentInputs}
          submittingComments={submittingComments}
          handleAddComment={handleAddComment}
          handlePinComment={handlePinComment}
          setDeleteCommentConfirm={setDeleteCommentConfirm}
        />
      )}
    </article>
  );
}
