import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Share, Plus, Smartphone } from 'lucide-react';
import { Language } from '../types';

interface IOSInstallPromptProps {
  showPrompt: boolean;
  onDismiss: () => void;
  language?: Language;
}

export const IOSInstallPrompt: React.FC<IOSInstallPromptProps> = React.memo(({ showPrompt, onDismiss, language = 'en' }) => {
  if (!showPrompt) return null;

  const isMy = language === 'my';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 p-5 ios-glass rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.3)] border border-white/20 dark:border-white/10 no-print"
      >
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#007aff] to-[#5856d6] flex items-center justify-center text-white shadow-md shadow-[#007aff]/10 shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#1c1c1e] dark:text-[#f2f2f7]">
                {isMy ? 'iPhone / iOS တွင် အက်ပ်သွင်းရန်' : 'Install Money Manager'}
              </h4>
              <p className="text-[10px] text-[#007aff] font-bold uppercase tracking-wider">
                {isMy ? 'စက်ထဲတွင် အော့ဖ်လိုင်း တိုက်ရိုက်အသုံးပြုပါ' : 'Native iOS Offline Experience'}
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-[#f2f2f7] transition-colors cursor-pointer border-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#1c1c1e]/80 dark:text-[#f2f2f7]/80 leading-relaxed mb-4">
          {isMy
            ? 'အင်တာနက်မလိုဘဲ Android PWA ကဲ့သို့ ဖုန်း၏ Home Screen တွင် စက်တွင်း အော့ဖ်လိုင်းအက်ပ်အဖြစ် ထည့်သွင်း အသုံးပြုနိုင်ပါသည်။'
            : 'Install this app on your iPhone home screen for seamless fullscreen execution, instant offline launch, and native iOS app functionality.'}
        </p>

        <div className="space-y-3 bg-black/[0.03] dark:bg-white/[0.03] p-3.5 rounded-2xl">
          <div className="flex items-center gap-3 text-xs">
            <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#1c1c1e] flex items-center justify-center text-[#007aff] shadow-xs shrink-0">
              <Share className="w-4 h-4" />
            </div>
            <p className="text-[#1c1c1e] dark:text-[#f2f2f7] font-semibold">
              {isMy ? (
                <>1. Safari ၏ အောက်ဘက် <span className="font-bold text-[#007aff]">Share</span> ခလုတ်ကို နှိပ်ပါ</>
              ) : (
                <>1. Tap the <span className="font-bold text-[#007aff]">Share</span> button in Safari</>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#1c1c1e] flex items-center justify-center text-[#007aff] shadow-xs shrink-0">
              <Plus className="w-4 h-4" />
            </div>
            <p className="text-[#1c1c1e] dark:text-[#f2f2f7] font-semibold">
              {isMy ? (
                <>2. အောက်သို့ဆွဲပြီး <span className="font-bold text-[#007aff]">Add to Home Screen</span> ကို ရွေးပါ</>
              ) : (
                <>2. Scroll down and choose <span className="font-bold text-[#007aff]">Add to Home Screen</span></>
              )}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});
