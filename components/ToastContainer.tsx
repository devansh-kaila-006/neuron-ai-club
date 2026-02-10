
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useToast } from '../context/ToastContext.tsx';

const ToastContainer: React.FC = () => {
  // Fix: Cast motion to any to resolve property missing errors in strict environments
  const m = motion as any;
  const { toasts, remove } = useToast();

  const icons = {
    success: <CheckCircle2 className="text-emerald-500" size={18} />,
    error: <AlertCircle className="text-rose-500" size={18} />,
    info: <Info className="text-indigo-500" size={18} />,
  };

  const borderColors = {
    success: 'border-emerald-500/30',
    error: 'border-rose-500/30',
    info: 'border-indigo-500/30',
  };

  return (
    <div className="fixed top-6 right-6 z-[2000] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          /* Fix: Using casted motion component to resolve type mismatch */
          <m.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className={`pointer-events-auto glass flex items-center gap-4 px-6 py-4 rounded-2xl min-w-[280px] max-w-sm border ${borderColors[toast.type]} shadow-2xl`}
          >
            <div className="shrink-0">{icons[toast.type]}</div>
            <p className="flex-1 text-xs font-medium text-white/90 leading-tight">
              {toast.message}
            </p>
            <button
              onClick={() => remove(toast.id)}
              className="shrink-0 text-white/20 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </m.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
