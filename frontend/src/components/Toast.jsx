import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { X, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const Toast = () => {
  const { toast, clearToast } = useSocket();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      setVisible(true);
      const timer = setTimeout(() => {
        handleClose();
      }, 5000); // 5 seconds
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleClose = () => {
    setVisible(false);
    // Wait for fadeout animation
    setTimeout(() => {
      clearToast();
    }, 300);
  };

  if (!toast) return null;

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-600 animate-bounce" />,
    info: <Info className="h-5 w-5 text-sky-600 animate-pulse" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-600" />
  };

  const bgColors = {
    success: 'bg-white border-emerald-100 shadow-emerald-100/50',
    info: 'bg-white border-sky-100 shadow-sky-100/50',
    warning: 'bg-white border-amber-100 shadow-amber-100/50'
  };

  return (
    <div
      className={`fixed top-20 right-4 z-50 flex max-w-sm items-start gap-3 rounded-xl border p-4 shadow-xl transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-2 opacity-0 scale-95 pointer-events-none'
      } ${bgColors[toast.type] || bgColors.info}`}
    >
      <div className="mt-0.5">{icons[toast.type] || icons.info}</div>
      <div className="flex-1 text-left">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Notification Alert
        </h4>
        <p className="mt-1 text-sm font-medium text-slate-800 leading-relaxed">
          {toast.message}
        </p>
      </div>
      <button
        onClick={handleClose}
        className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;
