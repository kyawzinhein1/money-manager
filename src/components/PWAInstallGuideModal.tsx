import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Share,
  PlusSquare,
  CheckCircle2,
  X,
  Compass,
  Download,
  Check,
  Info,
  Monitor,
  Star,
  Copy,
  Image as ImageIcon,
  ShieldCheck,
  Zap,
  ChevronRight,
  Globe
} from 'lucide-react';
import { Language } from '../types';

interface PWAInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const PWAInstallGuideModal: React.FC<PWAInstallGuideModalProps> = ({
  isOpen,
  onClose,
  language
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isSafari, setIsSafari] = useState<boolean>(true);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showDetailedGuide, setShowDetailedGuide] = useState<boolean>(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'ios' | 'android' | 'desktop'>('android');
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  useEffect(() => {
    // Check if running in Standalone PWA mode
    const standalone =
      (window.navigator as any).standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Detect iOS
    const ua = window.navigator.userAgent;
    const iosDevice =
      /iPad|iPhone|iPod/.test(ua) ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    setIsIOS(iosDevice);

    if (iosDevice) {
      setSelectedPlatform('ios');
      const isSafariBrowser =
        /Safari/i.test(ua) &&
        !/CriOS|FxiOS|OPiOS|EdgiOS|FBAN|FBAV|Instagram|Telegram|Line|MicroMessenger/i.test(ua);
      setIsSafari(isSafariBrowser);
    } else {
      setSelectedPlatform('android');
    }

    if ((window as any).deferredPwaPrompt) {
      setDeferredPrompt((window as any).deferredPwaPrompt);
    }

    // Capture Android / Chrome beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPwaPrompt = e;
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      (window as any).deferredPwaPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Reset modal state every time isOpen changes to true
  useEffect(() => {
    if (isOpen) {
      setShowDetailedGuide(false);
      setCopiedUrl(false);

      const standalone =
        (window.navigator as any).standalone === true ||
        window.matchMedia('(display-mode: standalone)').matches;
      setIsStandalone(standalone);

      if ((window as any).deferredPwaPrompt) {
        setDeferredPrompt((window as any).deferredPwaPrompt);
      }
    }
  }, [isOpen]);

  const handleInstallClick = async () => {
    const activePrompt = deferredPrompt || (window as any).deferredPwaPrompt;
    if (activePrompt) {
      try {
        await activePrompt.prompt();
        const choice = await activePrompt.userChoice;
        if (choice && choice.outcome === 'accepted') {
          setIsInstalled(true);
        }
      } catch (err) {
        console.warn('PWA install prompt error:', err);
      }
      setDeferredPrompt(null);
      (window as any).deferredPwaPrompt = null;
    } else {
      // If native prompt was already consumed or unavailable, show detailed step by step guide
      setShowDetailedGuide(true);
    }
  };

  const handleCreateShortcutClick = async () => {
    const activePrompt = deferredPrompt || (window as any).deferredPwaPrompt;
    if (activePrompt) {
      try {
        await activePrompt.prompt();
        const choice = await activePrompt.userChoice;
        if (choice && choice.outcome === 'accepted') {
          setIsInstalled(true);
        }
      } catch (err) {
        console.warn('PWA shortcut prompt error:', err);
      }
      setDeferredPrompt(null);
      (window as any).deferredPwaPrompt = null;
    } else {
      setShowDetailedGuide(true);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end items-center sm:justify-center p-0 sm:p-4">
      {/* Dark Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* PWA "Add to Home Screen" Bottom Sheet Card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1c1c1e] rounded-t-[32px] sm:rounded-[32px] border-t sm:border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden z-10 flex flex-col transition-all duration-300 animate-in slide-in-from-bottom duration-300">
        
        {/* Top Drag Handle / Sheet Indicator */}
        <div className="w-full flex items-center justify-center pt-3 pb-2 shrink-0">
          <div className="w-12 h-1.5 bg-black/15 dark:bg-white/20 rounded-full" />
        </div>

        {/* Modal Header Title */}
        <div className="px-6 pt-2 pb-4 text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-[#1c1c1e] dark:text-white tracking-tight">
            {language === 'my' ? 'ပင်မစာမျက်နှာသို့ ထည့်သွင်းရန်' : 'Add to home screen'}
          </h2>
        </div>

        {/* Option Selection Group Cards (Exact match to system bottom sheet) */}
        <div className="px-5 pb-6 space-y-3">
          <div className="bg-[#f2f2f7] dark:bg-[#2c2c2e] rounded-2xl overflow-hidden divide-y divide-black/5 dark:divide-white/5 border border-black/5 dark:border-white/5">
            
            {/* Option 1: Install (Full Standalone App) */}
            <button
              type="button"
              id="pwa-option-install-btn"
              onClick={handleInstallClick}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer border-0 active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* App Icon with Download Badge */}
                <div className="relative w-12 h-12 rounded-2xl bg-[#007aff] flex items-center justify-center text-white shrink-0 shadow-sm overflow-hidden">
                  <img
                    src="/icon-192.png"
                    alt="App Icon"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 right-0 w-5 h-5 bg-black/70 backdrop-blur-xs rounded-tl-lg flex items-center justify-center text-white border-t border-l border-white/20">
                    <Download className="w-3 h-3" />
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="text-base font-semibold text-[#1c1c1e] dark:text-white truncate">
                    {language === 'my' ? 'ထည့်သွင်းမည် (Install)' : 'Install'}
                  </p>
                  <p className="text-xs text-[#8e8e93] truncate">
                    {language === 'my' ? 'အော့ဖ်လိုင်း သီးသန့် အက်ပ်အဖြစ် သုံးရန်' : 'Standalone app experience'}
                  </p>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-[#8e8e93] shrink-0" />
            </button>

            {/* Option 2: Create Shortcut (Shortcut opens in browser) */}
            <button
              type="button"
              id="pwa-option-shortcut-btn"
              onClick={handleCreateShortcutClick}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer border-0 active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* App Icon with Chrome Badge */}
                <div className="relative w-12 h-12 rounded-2xl bg-[#34c759] flex items-center justify-center text-white shrink-0 shadow-sm overflow-hidden">
                  <img
                    src="/icon-192.png"
                    alt="App Icon"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#007aff] rounded-tl-lg flex items-center justify-center text-white border-t border-l border-white/20">
                    <Globe className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="text-base font-semibold text-[#1c1c1e] dark:text-white truncate">
                    {language === 'my' ? 'ဖြတ်လမ်းလင့်ခ် ပြုလုပ်မည်' : 'Create shortcut'}
                  </p>
                  <p className="text-xs text-[#8e8e93] truncate">
                    {language === 'my'
                      ? 'Chrome / Browser တွင် ချက်ချင်း ဖွင့်ရန်'
                      : isIOS
                      ? 'Shortcuts open in Safari'
                      : 'Shortcuts open in Chrome'}
                  </p>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-[#8e8e93] shrink-0" />
            </button>
          </div>

          {/* Detailed step-by-step instructions accordion toggle */}
          {showDetailedGuide ? (
            <div className="pt-2 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pt-2 border-t border-black/10 dark:border-white/10">
                <span className="text-xs font-bold text-[#8e8e93] uppercase tracking-wider">
                  {language === 'my' ? 'လမ်းညွှန်ချက်များ' : 'Installation Guide'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowDetailedGuide(false)}
                  className="text-xs font-bold text-[#007aff] hover:underline border-0 bg-transparent cursor-pointer"
                >
                  {language === 'my' ? 'ပြန်ပိတ်မည်' : 'Hide details'}
                </button>
              </div>

              {/* Platform Selector */}
              <div className="grid grid-cols-3 gap-2 bg-black/5 dark:bg-white/5 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setSelectedPlatform('ios')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer ${
                    selectedPlatform === 'ios'
                      ? 'bg-white dark:bg-[#2c2c2e] text-[#007aff] shadow-xs'
                      : 'text-[#8e8e93]'
                  }`}
                >
                  iOS Safari
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPlatform('android')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer ${
                    selectedPlatform === 'android'
                      ? 'bg-white dark:bg-[#2c2c2e] text-[#34c759] shadow-xs'
                      : 'text-[#8e8e93]'
                  }`}
                >
                  Android
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPlatform('desktop')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer ${
                    selectedPlatform === 'desktop'
                      ? 'bg-white dark:bg-[#2c2c2e] text-[#af52de] shadow-xs'
                      : 'text-[#8e8e93]'
                  }`}
                >
                  Desktop
                </button>
              </div>

              {/* Step cards */}
              {selectedPlatform === 'ios' && (
                <div className="space-y-2 text-xs text-left">
                  <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#007aff] text-white font-bold flex items-center justify-center shrink-0">1</span>
                    <p className="text-[#1c1c1e] dark:text-white">Safari Browser တွင် Share အိုင်ကွန် [↑] ကို နှိပ်ပါ</p>
                  </div>
                  <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#007aff] text-white font-bold flex items-center justify-center shrink-0">2</span>
                    <p className="text-[#1c1c1e] dark:text-white">"Add to Home Screen" ကို ရွေးချယ်ပါ</p>
                  </div>
                </div>
              )}

              {selectedPlatform === 'android' && (
                <div className="space-y-2 text-xs text-left">
                  <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#34c759] text-white font-bold flex items-center justify-center shrink-0">1</span>
                    <p className="text-[#1c1c1e] dark:text-white">Chrome ညာဘက်အပေါ် [⋮] မီနူးကို နှိပ်ပါ</p>
                  </div>
                  <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#34c759] text-white font-bold flex items-center justify-center shrink-0">2</span>
                    <p className="text-[#1c1c1e] dark:text-white">"Install app" သို့မဟုတ် "Add to Home screen" ကို နှိပ်ပါ</p>
                  </div>
                </div>
              )}

              {selectedPlatform === 'desktop' && (
                <div className="space-y-2 text-xs text-left">
                  <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#af52de] text-white font-bold flex items-center justify-center shrink-0">1</span>
                    <p className="text-[#1c1c1e] dark:text-white">Browser လိပ်စာတန်း ညာဘက်မှ [⊕] Install အိုင်ကွန်ကို နှိပ်ပါ</p>
                  </div>
                </div>
              )}
              {/* Copy URL & Share Action */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="w-full py-2.5 px-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#007aff] font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border-0"
                >
                  {copiedUrl ? (
                    <>
                      <Check className="w-4 h-4 text-[#34c759]" />
                      <span>{language === 'my' ? 'လင့်ခ် ကူးယူပြီးပါပြီ!' : 'URL Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{language === 'my' ? 'အက်ပ် လင့်ခ် ကူးယူမည်' : 'Copy App Link'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={handleCopyUrl}
                className="text-xs font-semibold text-[#007aff] hover:underline flex items-center gap-1.5 border-0 bg-transparent cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedUrl ? (language === 'my' ? 'ကူးယူပြီးပါပြီ' : 'Copied!') : (language === 'my' ? 'လင့်ခ် ကူးယူမည်' : 'Copy link')}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDetailedGuide(true)}
                className="text-xs font-semibold text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white transition-colors border-0 bg-transparent cursor-pointer underline"
              >
                {language === 'my' ? 'အသေးစိတ် ထည့်သွင်းနည်း' : 'How to install manually?'}
              </button>
            </div>
          )}

          {/* Close Button */}
          <div className="pt-2">
            <button
              id="pwa-sheet-close-btn"
              type="button"
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[#1c1c1e] dark:text-white font-bold text-sm transition-colors cursor-pointer border-0"
            >
              {language === 'my' ? 'မလုပ်ဆောင်တော့ပါ' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
