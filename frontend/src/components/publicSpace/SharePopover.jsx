import { MessageCircle, Mail, Copy } from 'lucide-react';

export default function SharePopover({ post, onSharePlatform }) {
  return (
    <div className="absolute right-0 bottom-full mb-2 w-48 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-30 space-y-1">
      <button
        type="button"
        onClick={() => onSharePlatform(post, 'whatsapp')}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 transition text-left cursor-pointer"
      >
        <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
          <MessageCircle className="w-2.5 h-2.5" />
        </div>
        WhatsApp
      </button>
      <button
        type="button"
        onClick={() => onSharePlatform(post, 'facebook')}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 transition text-left cursor-pointer"
      >
        <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
          f
        </div>
        Facebook
      </button>
      <button
        type="button"
        onClick={() => onSharePlatform(post, 'gmail')}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition text-left cursor-pointer"
      >
        <div className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px]">
          <Mail className="w-2.5 h-2.5" />
        </div>
        Gmail
      </button>
      <button
        type="button"
        onClick={() => onSharePlatform(post, 'twitter')}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left cursor-pointer"
      >
        <div className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[9px] font-bold">
          𝕏
        </div>
        Twitter / X
      </button>
      <button
        type="button"
        onClick={() => onSharePlatform(post, 'linkedin')}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:text-sky-600 transition text-left cursor-pointer"
      >
        <div className="w-4 h-4 rounded-full bg-sky-700 text-white flex items-center justify-center text-[10px] font-bold">
          in
        </div>
        LinkedIn
      </button>
      <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
      <button
        type="button"
        onClick={() => onSharePlatform(post, 'copy')}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:text-sky-600 transition text-left cursor-pointer"
      >
        <div className="w-4 h-4 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]">
          <Copy className="w-2.5 h-2.5" />
        </div>
        Copy Link
      </button>
    </div>
  );
}
