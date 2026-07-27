import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel?: () => void;
  isDestructive?: boolean;
}

interface ConfirmModalProps {
  dialog: ConfirmDialogState | null;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = React.memo(({ dialog, onClose }) => {
  if (!dialog?.isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/45 backdrop-blur-xs"
        />

        {/* Modal Content - iOS Pop-up style */}
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 10 }}
          className="relative w-full max-w-sm p-6 bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-3xl rounded-3xl border border-white/50 dark:border-white/12 shadow-2xl space-y-4 text-center z-10"
        >
          <div
            className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
              dialog.isDestructive
                ? 'bg-red-500/10 text-red-500'
                : 'bg-[#5856d6]/10 text-[#5856d6]'
            }`}
          >
            {dialog.isDestructive ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <RefreshCw className="w-6 h-6" />
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#1c1c1e] dark:text-white">
              {dialog.title}
            </h3>
            <p className="text-xs text-[#8e8e93] leading-relaxed px-2">
              {dialog.message}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                if (dialog.onCancel) {
                  dialog.onCancel();
                } else {
                  onClose();
                }
              }}
              className="h-11 rounded-2xl flex items-center justify-center text-xs font-bold text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white bg-[#f2f2f7] dark:bg-[#2c2c2e] hover:bg-[#e5e5ea] dark:hover:bg-[#3a3a3c] transition-all cursor-pointer border-0"
            >
              {dialog.cancelText}
            </button>
            <button
              type="button"
              onClick={dialog.onConfirm}
              className={`h-11 rounded-2xl text-xs font-bold text-white transition-all cursor-pointer border-0 ${
                dialog.isDestructive
                  ? 'bg-[#ff3b30] hover:bg-[#e03026]'
                  : 'bg-[#5856d6] hover:bg-[#4b49be]'
              }`}
            >
              {dialog.confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
});
