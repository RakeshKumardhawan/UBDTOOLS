import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type, title, message, duration = 4500 }: Omit<ToastMessage, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastMessage = { id, type, title, message, duration };

      setToasts((prev) => [...prev.slice(-4), newToast]); // Keep max 5 toasts

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const showSuccess = useCallback((message: string, title?: string) => {
    addToast({ type: 'success', title: title || 'Success', message });
  }, [addToast]);

  const showError = useCallback((message: string, title?: string) => {
    addToast({ type: 'error', title: title || 'Error', message });
  }, [addToast]);

  const showInfo = useCallback((message: string, title?: string) => {
    addToast({ type: 'info', title: title || 'Information', message });
  }, [addToast]);

  const showWarning = useCallback((message: string, title?: string) => {
    addToast({ type: 'warning', title: title || 'Warning', message });
  }, [addToast]);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        showSuccess,
        showError,
        showInfo,
        showWarning,
      }}
    >
      {children}
      {/* Toast Notification Floating Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border transition-all transform translate-y-0 animate-in fade-in slide-in-from-bottom-3 duration-300 ${
              toast.type === 'success'
                ? 'bg-slate-900/95 border-emerald-500/50 text-white shadow-emerald-950/40'
                : toast.type === 'error'
                ? 'bg-slate-900/95 border-rose-500/50 text-white shadow-rose-950/40'
                : toast.type === 'warning'
                ? 'bg-slate-900/95 border-amber-500/50 text-white shadow-amber-950/40'
                : 'bg-slate-900/95 border-cyan-500/50 text-white shadow-cyan-950/40'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'error' && <XCircle className="w-5 h-5 text-rose-400" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-cyan-400" />}
            </div>

            <div className="flex-1 text-xs space-y-0.5 pr-1">
              {toast.title && (
                <div className="font-bold text-sm tracking-wide text-white flex items-center justify-between">
                  <span>{toast.title}</span>
                </div>
              )}
              <div className="text-slate-300 font-medium leading-relaxed">{toast.message}</div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
