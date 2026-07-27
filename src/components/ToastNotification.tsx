import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export interface ToastState {
  message: string;
  type: 'success' | 'info' | 'error';
}

interface ToastNotificationProps {
  toast: ToastState | null;
}

export const ToastNotification: React.FC<ToastNotificationProps> = React.memo(({ toast }) => {
  if (!toast) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="fixed top-5 left-1/2 -translate-x-1/2 z-[10000] no-print"
      >
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl backdrop-blur-2xl border text-xs font-bold ${
            toast.type === 'error'
              ? 'bg-red-500/90 text-white border-red-400/30'
              : toast.type === 'success'
              ? 'bg-[#34c759]/90 text-white border-emerald-400/30'
              : 'bg-black/80 dark:bg-white/90 text-white dark:text-black border-white/20'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <Info className="w-4 h-4 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});
