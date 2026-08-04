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
  const [selectedPlatform, setSelectedPlatform] = useState<'ios' | 'android' | 'desktop'>('ios');
  const [selectedScreenshot, setSelectedScreenshot] = useState<'narrow' | 'wide'>('narrow');
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [previewZoomImage, setPreviewZoomImage] = useState<string | null>(null);

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

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center items-center">
      {/* Dark Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* PWA Installation Bottom Sheet Card */}
      <div className="relative w-full max-w-xl bg-white dark:bg-[#1c1c1e] rounded-t-[32px] sm:rounded-[32px] border-t sm:border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col transition-all duration-300 transform translate-y-0">
        
        {/* Top Drag Handle / Sheet Handle */}
        <div className="w-full flex items-center justify-center pt-3 pb-1 shrink-0">
          <div className="w-12 h-1.5 bg-black/20 dark:bg-white/20 rounded-full" />
        </div>

        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-black/5 dark:border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#007aff]/10 flex items-center justify-center text-[#007aff] shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#1c1c1e] dark:text-white flex items-center gap-2">
                <span>{language === 'my' ? 'PWA အပလီကေးရှင်း ထည့်သွင်းရန်' : 'PWA Standalone App Store'}</span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-[#007aff]/10 text-[#007aff] px-2 py-0.5 rounded-full border border-[#007aff]/20">
                  v2.0
                </span>
              </h3>
              <p className="text-xs text-[#8e8e93]">
                {language === 'my' ? 'iOS နှင့် Android အတွက် သီးသန့် အော့ဖ်လိုင်း အက်ပ်' : 'Install directly to home screen for offline use'}
              </p>
            </div>
          </div>

          <button
            id="close-pwa-guide-modal"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white transition-colors cursor-pointer border-0 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto p-5 space-y-5 flex-1 pr-4">
          {/* App Store Product Card Header */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#007aff]/5 via-purple-500/5 to-pink-500/5 border border-[#007aff]/15 relative overflow-hidden">
            <div className="flex items-start gap-4">
              <img
                src="/icon-192.png"
                alt="Personal Money Manager App Icon"
                className="w-16 h-16 rounded-2xl shadow-md border border-black/10 dark:border-white/10 shrink-0 object-cover"
              />
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-base font-black text-[#1c1c1e] dark:text-white truncate">
                    Personal Money Manager
                  </h4>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full shrink-0">
                    <Star className="w-3 h-3 fill-amber-500" /> 4.9
                  </span>
                </div>
                <p className="text-xs text-[#8e8e93] truncate">
                  {language === 'my' ? 'ဘဏ္ဍာရေးနှင့် သုံးစွဲမှု မှတ်တမ်းအက်ပ်' : 'Finance & Expense Tracker • Liquid Glass'}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[10px] font-bold bg-[#34c759]/10 text-[#34c759] px-2 py-0.5 rounded-md flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    {language === 'my' ? '၁၀၀% အော့ဖ်လိုင်း' : '100% Offline'}
                  </span>
                  <span className="text-[10px] font-bold bg-[#af52de]/10 text-[#af52de] px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {language === 'my' ? 'မြန်ဆန်သွက်လက်' : 'Instant Load'}
                  </span>
                </div>
              </div>
            </div>
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

          {/* Platform Selection Tabs (iOS, Android, Desktop) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#8e8e93]">
                {language === 'my' ? 'စက်ပစ္စည်းအလိုက် ထည့်သွင်းနည်း ရွေးချယ်ရန်' : 'Select Platform Instructions'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-black/5 dark:bg-white/5 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setSelectedPlatform('ios')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border-0 ${
                  selectedPlatform === 'ios'
                    ? 'bg-white dark:bg-[#2c2c2e] text-[#007aff] shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                    : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>iOS (iPhone)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlatform('android')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border-0 ${
                  selectedPlatform === 'android'
                    ? 'bg-white dark:bg-[#2c2c2e] text-[#34c759] shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                    : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Android</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlatform('desktop')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border-0 ${
                  selectedPlatform === 'desktop'
                    ? 'bg-white dark:bg-[#2c2c2e] text-[#af52de] shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                    : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>Desktop</span>
              </button>
            </div>
          </div>

          {/* Platform Specific Step Instructions */}
          {selectedPlatform === 'ios' && (
            <div className="space-y-3">
              {!isSafari && (
                <div className="p-3.5 rounded-2xl bg-[#ff9500]/10 border border-[#ff9500]/20 text-[#ff9500] text-xs flex items-start gap-2.5">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-1.5 flex-1">
                    <p className="font-bold">
                      {language === 'my' ? 'Safari Browser ဖြင့် ဖွင့်ရန် လိုအပ်ပါသည်' : 'Open Link in Apple Safari'}
                    </p>
                    <p className="text-[11px] opacity-90">
                      {language === 'my'
                        ? 'iOS တွင် Chrome သို့မဟုတ် In-App Browser ဖြင့် Standalone App မထည့်နိုင်ပါ။ လင့်ခ်ကို ကူးယူ၍ Safari Browser တွင် ဖွင့်ပါ:'
                        : 'iOS requires Apple Safari browser to install Standalone PWA apps. Please copy and open in Safari:'}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <code className="flex-1 p-2 rounded-xl bg-black/5 dark:bg-white/10 text-[10px] font-mono break-all text-[#1c1c1e] dark:text-white">
                        {window.location.href}
                      </code>
                      <button
                        type="button"
                        onClick={handleCopyUrl}
                        className="px-3 py-2 rounded-xl bg-[#ff9500] text-white font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer border-0"
                      >
                        {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedUrl ? (language === 'my' ? 'ကူးယူပြီး' : 'Copied') : (language === 'my' ? 'ကူးယူမည်' : 'Copy')}</span>
                      </button>
                    </div>
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
                        ? 'အောက်သို့ ပွတ်ဆွဲ၍ "Add to Home Screen" ကို နှိပ်ပါ'
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

          {selectedPlatform === 'android' && (
            <div className="space-y-2.5">
              <div className="p-3.5 rounded-2xl bg-[#f2f2f7] dark:bg-[#2c2c2e] flex items-center gap-3.5 border border-black/5 dark:border-white/5">
                <div className="w-7 h-7 rounded-full bg-[#34c759] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="text-xs flex-1">
                  <p className="font-bold text-[#1c1c1e] dark:text-white flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-[#34c759]" />
                    {language === 'my' ? 'Google Chrome ဖြင့် ဖွင့်ပါ' : 'Open in Google Chrome'}
                  </p>
                  <p className="text-[#8e8e93] text-[11px] mt-0.5">
                    {language === 'my' ? 'Android ဖုန်း၏ Chrome Browser တွင် ဝဘ်ဆိုက်ကို ဖွင့်ပါ' : 'Open this site in Chrome on your Android device.'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#f2f2f7] dark:bg-[#2c2c2e] flex items-center gap-3.5 border border-black/5 dark:border-white/5">
                <div className="w-7 h-7 rounded-full bg-[#34c759] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="text-xs flex-1">
                  <p className="font-bold text-[#1c1c1e] dark:text-white flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-[#34c759]" />
                    {language === 'my' ? 'ညာဘက်အပေါ်ထောင့် [⋮] မီနူး သို့မဟုတ် "Install App" ကို နှိပ်ပါ' : 'Tap 3 Dots Menu [⋮] & "Install App"'}
                  </p>
                  <p className="text-[#8e8e93] text-[11px] mt-0.5">
                    {language === 'my'
                      ? 'Chrome မီနူးမှ "Install app" သို့မဟုတ် "Add to Home screen" ကို ရွေးချယ်ပါ'
                      : 'Select "Install App" or "Add to Home Screen" from Chrome options.'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#f2f2f7] dark:bg-[#2c2c2e] flex items-center gap-3.5 border border-black/5 dark:border-white/5">
                <div className="w-7 h-7 rounded-full bg-[#34c759] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="text-xs flex-1">
                  <p className="font-bold text-[#1c1c1e] dark:text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#34c759]" />
                    {language === 'my' ? 'အော့ဖ်လိုင်း Standalone အက်ပ်အဖြစ် သုံးနိုင်ပါပြီ' : 'Launch Standalone App'}
                  </p>
                  <p className="text-[#8e8e93] text-[11px] mt-0.5">
                    {language === 'my' ? 'သင့် ဖုန်းထဲတွင် သီးသန့် အက်ပ် အဖြစ် အော့ဖ်လိုင်း အပြည့်အဝ သုံးနိုင်ပါပြီ။' : 'Open the app icon from your home screen with offline database support!'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedPlatform === 'desktop' && (
            <div className="space-y-2.5">
              <div className="p-3.5 rounded-2xl bg-[#f2f2f7] dark:bg-[#2c2c2e] flex items-center gap-3.5 border border-black/5 dark:border-white/5">
                <div className="w-7 h-7 rounded-full bg-[#af52de] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="text-xs flex-1">
                  <p className="font-bold text-[#1c1c1e] dark:text-white flex items-center gap-1.5">
                    <Monitor className="w-4 h-4 text-[#af52de]" />
                    {language === 'my' ? 'Chrome, Edge သို့မဟုတ် Brave Browser တွင် ဖွင့်ပါ' : 'Open in Chrome / Edge Browser'}
                  </p>
                  <p className="text-[#8e8e93] text-[11px] mt-0.5">
                    {language === 'my' ? 'ကွန်ပျူတာ သို့မဟုတ် မက်ဘွတ်တွင် Chrome / Edge ဖြင့် ဖွင့်ပါ' : 'Open this site in Chrome, Edge, or Brave on PC or Mac.'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#f2f2f7] dark:bg-[#2c2c2e] flex items-center gap-3.5 border border-black/5 dark:border-white/5">
                <div className="w-7 h-7 rounded-full bg-[#af52de] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="text-xs flex-1">
                  <p className="font-bold text-[#1c1c1e] dark:text-white flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-[#af52de]" />
                    {language === 'my' ? 'Address Bar (လိပ်စာတန်း) ရှိ Install Icon [⊕] ကို နှိပ်ပါ' : 'Click Address Bar Install Icon [⊕]'}
                  </p>
                  <p className="text-[#8e8e93] text-[11px] mt-0.5">
                    {language === 'my'
                      ? 'ဝဘ်လိပ်စာတန်း၏ ညာဘက်အစွန်ရှိ အက်ပ်ထည့်သွင်းရန် အိုင်ကွန် [⊕] ကို နှိပ်ပါ'
                      : 'Click the install icon [⊕] on the far right of the browser address bar.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* App Screenshots Preview Gallery */}
          <div className="space-y-3 pt-2 border-t border-black/5 dark:border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-[#8e8e93] flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#007aff]" />
                <span>{language === 'my' ? 'အက်ပ် မြင်ကွင်း နမူနာ (App Screenshots)' : 'App Interface Screenshots'}</span>
              </label>
              <div className="flex items-center gap-1 bg-black/5 dark:bg-white/10 p-0.5 rounded-lg text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setSelectedScreenshot('narrow')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer border-0 ${
                    selectedScreenshot === 'narrow'
                      ? 'bg-white dark:bg-[#2c2c2e] text-[#007aff] shadow-xs'
                      : 'text-[#8e8e93]'
                  }`}
                >
                  {language === 'my' ? 'မိုဘိုင်း' : 'Mobile'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedScreenshot('wide')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer border-0 ${
                    selectedScreenshot === 'wide'
                      ? 'bg-white dark:bg-[#2c2c2e] text-[#007aff] shadow-xs'
                      : 'text-[#8e8e93]'
                  }`}
                >
                  {language === 'my' ? 'ဒက်စတော့' : 'Desktop'}
                </button>
              </div>
            </div>

            {/* Gallery Image Display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setPreviewZoomImage('/screenshot-narrow.jpg')}
                className={`relative rounded-2xl overflow-hidden border transition-all cursor-pointer group bg-black/5 dark:bg-white/5 ${
                  selectedScreenshot === 'narrow'
                    ? 'border-[#007aff] ring-2 ring-[#007aff]/20'
                    : 'border-black/10 dark:border-white/10 hover:border-[#007aff]/50'
                }`}
              >
                <img
                  src="/screenshot-narrow.jpg"
                  alt="Mobile Overview Screenshot"
                  className="w-full h-40 object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                  <div className="text-white text-xs">
                    <p className="font-bold">{language === 'my' ? 'မိုဘိုင်း သုံးစွဲမှု မြင်ကွင်း' : 'Mobile Overview'}</p>
                    <p className="text-[10px] opacity-80">{language === 'my' ? 'iPhone & Android Mobile UI' : 'Optimized for Mobile Devices'}</p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => setPreviewZoomImage('/screenshot-wide.jpg')}
                className={`relative rounded-2xl overflow-hidden border transition-all cursor-pointer group bg-black/5 dark:bg-white/5 ${
                  selectedScreenshot === 'wide'
                    ? 'border-[#007aff] ring-2 ring-[#007aff]/20'
                    : 'border-black/10 dark:border-white/10 hover:border-[#007aff]/50'
                }`}
              >
                <img
                  src="/screenshot-wide.jpg"
                  alt="Analytics Dashboard Screenshot"
                  className="w-full h-40 object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                  <div className="text-white text-xs">
                    <p className="font-bold">{language === 'my' ? 'ဘဏ္ဍာရေး သုံးသပ်ချက် Dashboard' : 'Analytics & Ledger'}</p>
                    <p className="text-[10px] opacity-80">{language === 'my' ? 'တက်ဘလက်နှင့် ဒက်စတော့ မြင်ကွင်း' : 'Tablet & Desktop Analytics'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Checkout Sticky Action Bar */}
        <div className="p-4 border-t border-black/5 dark:border-white/5 bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-md shrink-0 flex items-center gap-3">
          {deferredPrompt ? (
            <button
              id="pwa-bottom-checkout-install-btn"
              onClick={handleInstallClick}
              className="flex-1 h-12 rounded-2xl bg-[#007aff] hover:bg-[#007aff]/90 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border-0 shadow-md active:scale-[0.98]"
            >
              <Download className="w-5 h-5" />
              <span>{language === 'my' ? 'ယခု အက်ပ် ထည့်သွင်းမည် (Install Now)' : 'Install Standalone App Now'}</span>
            </button>
          ) : selectedPlatform === 'ios' ? (
            <button
              id="pwa-bottom-checkout-ios-btn"
              onClick={handleCopyUrl}
              className="flex-1 h-12 rounded-2xl bg-[#007aff] hover:bg-[#007aff]/90 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border-0 shadow-md active:scale-[0.98]"
            >
              <Share className="w-4 h-4" />
              <span>
                {copiedUrl
                  ? (language === 'my' ? ' Safari လင့်ခ် ကူးယူပြီးပါပြီ' : 'Safari Link Copied!')
                  : (language === 'my' ? ' Safari တွင်ဖွင့်ရန် လင့်ခ် ကူးယူမည်' : 'Copy Link for Safari')}
              </span>
            </button>
          ) : (
            <button
              id="pwa-bottom-checkout-gotit-btn"
              onClick={onClose}
              className="flex-1 h-12 rounded-2xl bg-[#007aff] hover:bg-[#007aff]/90 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border-0 shadow-md active:scale-[0.98]"
            >
              <Check className="w-5 h-5" />
              <span>{language === 'my' ? 'ထည့်သွင်းနည်း နားလည်ပါပြီ' : 'Got It, Close Guide'}</span>
            </button>
          )}

          <button
            id="close-pwa-checkout-sheet"
            onClick={onClose}
            className="h-12 px-5 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[#1c1c1e] dark:text-white font-bold text-xs transition-colors cursor-pointer border-0 shrink-0"
          >
            {language === 'my' ? 'ပိတ်မည်' : 'Close'}
          </button>
        </div>
      </div>

      {/* Enlarged Screenshot Zoom Modal */}
      {previewZoomImage && (
        <div
          className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewZoomImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center">
            <button
              onClick={() => setPreviewZoomImage(null)}
              className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer border-0"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewZoomImage}
              alt="Zoomed App Screenshot"
              className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain border border-white/20"
            />
          </div>
        </div>
      )}
    </div>
  );
};
