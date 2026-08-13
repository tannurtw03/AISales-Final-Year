import React from 'react';
import { useSocket } from '../../context/SocketContext';
import { ShoppingCart, AlertTriangle, TrendingUp, Target, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useSocket();

  if (!toasts || toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'sale':
        return <ShoppingCart className="w-5 h-5 text-emerald-600" />;
      case 'stock':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'prediction':
        return <TrendingUp className="w-5 h-5 text-purple-600" />;
      case 'target':
        return <Target className="w-5 h-5 text-blue-600" />;
      default:
        return <ShoppingCart className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start justify-between gap-3 p-4 rounded-xl bg-white/95 border border-slate-200 shadow-2xl backdrop-blur-lg transform transition-all duration-300 animate-slide-in"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 shrink-0">
              {getIcon(toast.type)}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">{toast.title}</h4>
              <p className="text-xs text-slate-600 mt-1 leading-snug">{toast.message}</p>
            </div>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
