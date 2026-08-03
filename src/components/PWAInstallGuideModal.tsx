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
  ExternalLink
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

    // Check if Safari on iOS
    if (iosDevice) {
      const isSafariBrowser =
        /Safari/i.test(ua) &&
        !/CriOS|FxiOS|OPiOS|EdgiOS|FBAN|FBAV|Instagram|Telegram|Line|MicroMessenger/i.test(ua);
      setIsSafari(isSafariBrowser);
    }

    // Capture Android / Chrome beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1c1c1e] rounded-3xl border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden z-10 my-auto p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#007aff]/10 flex items-center justify-center text-[#007aff]">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#1c1c1e] dark:text-white">
                {language === 'my' ? 'PWA အော့ဖ်လိုင်း အက်ပ် ထည့်သွင်းနည်း' : 'Install Standalone App'}
              </h3>
              <p className="text-xs text-[#8e8e93]">
                {language === 'my' ? 'iPhone / iOS နှင့် Android အတွက် သီးသန့်' : 'For iPhone (iOS) & Android'}
              </p>
            </div>
          </div>

          <button
            id="close-pwa-guide-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white transition-colors cursor-pointer border-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current App State Notice */}
        {isStandalone ? (
          <div className="p-4 rounded-2xl bg-[#34c759]/10 border border-[#34c759]/20 text-[#34c759] flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-sm">
                {language === 'my' ? 'Standalone အက်ပ် အဖြစ် ပွင့်နေပါသည်' : 'Running as Standalone App'}
              </p>
              <p className="mt-0.5 opacity-90">
                {language === 'my'
                  ? 'သင်သည် ပင်မစာမျက်နှာ App အဖြစ် သီးသန့် အသုံးပြုနေပါသည်။ အော့ဖ်လိုင်း အပြည့်အဝ သုံးနိုင်ပါသည်။'
                  : 'You are using Personal Money Manager in full standalone PWA app mode.'}
              </p>
            </div>
          </div>
        ) : isInstalled ? (
          <div className="p-4 rounded-2xl bg-[#34c759]/10 border border-[#34c759]/20 text-[#34c759] flex items-center gap-3">
            <Check className="w-6 h-6 shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-sm">
                {language === 'my' ? 'အက်ပ် ထည့်သွင်းပြီးပါပြီ' : 'App Installed Successfully'}
              </p>
              <p className="mt-0.5 opacity-90">
                {language === 'my'
                  ? 'သင့် ဖုန်း ပင်မစာမျက်နှာရှိ App Icon မှ ဖွင့်၍ သုံးနိုင်ပါပြီ။'
                  : 'Open the app icon on your home screen to launch in standalone mode.'}
              </p>
            </div>
          </div>
        ) : null}

        {/* Native Android Prompt Button if available */}
        {deferredPrompt && (
          <div className="p-4 rounded-2xl bg-[#007aff]/10 border border-[#007aff]/20 space-y-3">
            <div className="flex items-center gap-3 text-[#007aff]">
              <Download className="w-6 h-6 shrink-0" />
              <div>
                <p className="font-bold text-sm">
                  {language === 'my' ? 'တစ်ချက်နှိပ်ရုံဖြင့် အက်ပ်ထည့်သွင်းမည်' : 'One-Tap Install Available'}
                </p>
                <p className="text-xs text-[#8e8e93] mt-0.5">
                  {language === 'my' ? 'သင့် ဖုန်းထဲသို့ တိုက်ရိုက် အက်ပ်အဖြစ် ထည့်သွင်းပါ' : 'Install directly to your device'}
                </p>
              </div>
            </div>
            <button
              id="pwa-native-install-btn"
              onClick={handleInstallClick}
              className="w-full py-3 px-4 rounded-xl bg-[#007aff] hover:bg-[#007aff]/90 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border-0 shadow-sm active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              <span>{language === 'my' ? 'ယခု အက်ပ် ထည့်သွင်းမည်' : 'Install App Now'}</span>
            </button>
          </div>
        )}

        {/* iOS Step-by-Step Instructions (iPhone 17 Pro Max / All iOS) */}
        {isIOS && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8e8e93] flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#007aff]" />
                {language === 'my' ? 'iOS (iPhone / iPad) ထည့်သွင်းနည်း လမ်းညွှန်' : 'iOS Standalone Setup Instructions'}
              </span>
              {!isSafari && (
                <span className="text-[10px] font-bold text-[#ff9500] bg-[#ff9500]/10 px-2 py-0.5 rounded-full border border-[#ff9500]/20">
                  {language === 'my' ? 'Safari ဖြင့် ဖွင့်ပါ' : 'Use Safari'}
                </span>
              )}
            </div>

            {!isSafari && (
              <div className="p-3 rounded-xl bg-[#ff9500]/10 border border-[#ff9500]/20 text-[#ff9500] text-xs flex items-start gap-2.5">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">
                    {language === 'my' ? 'Safari Browser ဖြင့် ဖွင့်ရန် လိုအပ်ပါသည်' : 'Open Link in Safari Browser'}
                  </p>
                  <p className="text-[11px] opacity-90 mt-0.5">
                    {language === 'my'
                      ? 'iOS တွင် Chrome သို့မဟုတ် In-App Browser ဖြင့် Standalone App မထည့်နိုင်ပါ။ လင့်ခ်ကို ကူးယူ၍ Safari Browser တွင် ဖွင့်ပါ:'
                      : 'iOS requires Apple Safari browser to install Standalone PWA apps. Please open this link in Safari:'}
                  </p>
                  <code className="block mt-1.5 p-1.5 rounded-lg bg-black/5 dark:bg-white/10 text-[11px] font-mono break-all text-[#1c1c1e] dark:text-white">
                    {window.location.href}
                  </code>
                </div>
              </div>
            )}

            <div className="space-y-2.5">
              {/* Step 1 */}
              <div className="p-3.5 rounded-2xl bg-[#f2f2f7] dark:bg-[#2c2c2e] flex items-center gap-3.5 border border-black/5 dark:border-white/5">
                <div className="w-7 h-7 rounded-full bg-[#007aff] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="text-xs flex-1">
                  <p className="font-bold text-[#1c1c1e] dark:text-white flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-[#007aff]" />
                    {language === 'my' ? 'Safari Browser တွင် ဖွင့်ပါ' : 'Open in Safari Browser'}
                  </p>
                  <p className="text-[#8e8e93] text-[11px] mt-0.5">
                    {language === 'my'
                      ? 'iPhone ၏ Safari Browser တွင် ဤဝဘ်ဆိုက်ကို ဖွင့်ထားပါ'
                      : 'Ensure you are viewing this site directly in iOS Safari browser.'}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-2xl bg-[#f2f2f7] dark:bg-[#2c2c2e] flex items-center gap-3.5 border border-black/5 dark:border-white/5">
                <div className="w-7 h-7 rounded-full bg-[#007aff] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="text-xs flex-1">
                  <p className="font-bold text-[#1c1c1e] dark:text-white flex items-center gap-1.5">
                    <Share className="w-4 h-4 text-[#007aff]" />
                    {language === 'my' ? 'Share (မျှဝေရန်) ခလုတ်ကို နှိပ်ပါ' : 'Tap the Share Button [↑]'}
                  </p>
                  <p className="text-[#8e8e93] text-[11px] mt-0.5">
                    {language === 'my'
                      ? 'Safari ၏ အောက်ခြေ Toolbar တွင်ရှိသော Share (မျှဝေရန်) အိုင်ကွန် [↑] ကို နှိပ်ပါ'
                      : 'Tap the Share icon at the bottom toolbar of Safari.'}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-2xl bg-[#f2f2f7] dark:bg-[#2c2c2e] flex items-center gap-3.5 border border-black/5 dark:border-white/5">
                <div className="w-7 h-7 rounded-full bg-[#007aff] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="text-xs flex-1">
                  <p className="font-bold text-[#1c1c1e] dark:text-white flex items-center gap-1.5">
                    <PlusSquare className="w-4 h-4 text-[#34c759]" />
                    {language === 'my' ? '"ပင်မစာမျက်နှာသို့ ထည့်မည်" ကို ရွေးပါ' : 'Select "Add to Home Screen" [+]'}
                  </p>
                  <p className="text-[#8e8e93] text-[11px] mt-0.5">
                    {language === 'my'
                      ? 'အောက်သို့ ပွတ်ဆွဲ၍ "Add to Home Screen" (ပင်မစာမျက်နှာသို့ ထည့်မည်) ကို နှိပ်ပါ'
                      : 'Scroll down the menu sheet and select "Add to Home Screen".'}
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-3.5 rounded-2xl bg-[#f2f2f7] dark:bg-[#2c2c2e] flex items-center gap-3.5 border border-black/5 dark:border-white/5">
                <div className="w-7 h-7 rounded-full bg-[#007aff] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                  4
                </div>
                <div className="text-xs flex-1">
                  <p className="font-bold text-[#1c1c1e] dark:text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#34c759]" />
                    {language === 'my' ? 'ညာဘက်အပေါ်ထောင့်မှ "Add" ကို နှိပ်ပါ' : 'Tap "Add" at Top Right'}
                  </p>
                  <p className="text-[#8e8e93] text-[11px] mt-0.5">
                    {language === 'my'
                      ? 'ထို့နောက် iPhone Home Screen တွင် အက်ပ် အိုင်ကွန် အဖြစ် Standalone ပေါ်လာပါမည်။'
                      : 'The Personal Money app icon will appear on your iPhone home screen!'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* General Android Instructions if not iOS */}
        {!isIOS && !deferredPrompt && (
          <div className="p-4 rounded-2xl bg-[#f2f2f7] dark:bg-[#2c2c2e] border border-black/5 dark:border-white/5 space-y-2 text-xs">
            <p className="font-bold text-[#1c1c1e] dark:text-white flex items-center gap-1.5">
              <Download className="w-4 h-4 text-[#007aff]" />
              {language === 'my' ? 'Android Chrome တွင် ထည့်သွင်းနည်း' : 'Android Chrome Installation'}
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[#8e8e93] text-[11px]">
              <li>
                {language === 'my'
                  ? 'Chrome Browser ၏ ညာဘက်အပေါ်ထောင့် [⋮] မီနူးကို နှိပ်ပါ'
                  : 'Tap the 3 dots menu [⋮] at top right of Chrome'}
              </li>
              <li>
                {language === 'my'
                  ? '"Install app" သို့မဟုတ် "Add to Home screen" ကို နှိပ်ပါ'
                  : 'Select "Install app" or "Add to Home screen"'}
              </li>
              <li>
                {language === 'my'
                  ? 'အော့ဖ်လိုင်း Standalone အက်ပ် အဖြစ် စတင်အသုံးပြုနိုင်ပါပြီ'
                  : 'Launch directly from your app drawer with full offline access!'}
              </li>
            </ol>
          </div>
        )}

        {/* Footer Button */}
        <div className="pt-2">
          <button
            id="close-pwa-guide-btn"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[#1c1c1e] dark:text-white font-bold text-xs transition-colors cursor-pointer border-0"
          >
            {language === 'my' ? 'နားလည်ပါပြီ' : 'Got It'}
          </button>
        </div>
      </div>
    </div>
  );
};
