import React from 'react';
import { ToastMessage } from '../types';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-lg border text-sm transition-all duration-300 transform translate-y-0 ${
            toast.type === 'success'
              ? 'bg-[#ffffff] border-[#68dba9] text-[#0b1c30]'
              : toast.type === 'error'
              ? 'bg-[#ffffff] border-[#ba1a1a] text-[#ba1a1a]'
              : 'bg-[#ffffff] border-[#c7c3fe] text-[#0b1c30]'
          }`}
        >
          {toast.type === 'success' && (
            <CheckCircle2 className="w-5 h-5 text-[#006e4c] shrink-0 mt-0.5" />
          )}
          {toast.type === 'error' && (
            <AlertTriangle className="w-5 h-5 text-[#ba1a1a] shrink-0 mt-0.5" />
          )}
          {toast.type === 'info' && (
            <Info className="w-5 h-5 text-[#3525cd] shrink-0 mt-0.5" />
          )}

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-xs uppercase tracking-wider mb-0.5">
              {toast.title}
            </h4>
            <p className="text-xs text-[#464555] break-words">{toast.message}</p>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="p-1 rounded-lg text-[#777587] hover:text-[#0b1c30] hover:bg-[#eff4ff] transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
