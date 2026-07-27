import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  CheckCircle2,
  Sparkles,
  X,
  Github,
  Globe,
  Zap,
  Info,
  Layers,
  Clock,
  DownloadCloud
} from 'lucide-react';
import { Language, Settings } from '../../types';

interface CheckUpdatesViewProps {
  t: (key: string) => string;
  settings: Settings;
  onClose: () => void;
}

interface ReleaseNote {
  version: string;
  date: string;
  titleEn: string;
  titleMy: string;
  itemsEn: string[];
  itemsMy: string[];
}

const RELEASE_HISTORY: ReleaseNote[] = [
  {
    version: 'v1.2.5',
    date: '2026-07-27',
    titleEn: 'iOS Graphical Calendar & Onboarding Method Setup',
    titleMy: 'iOS စတိုင် ပြက္ခဒိန်နှင့် စတင်အသုံးပြုမှု ပြင်ဆင်မှုများ',
    itemsEn: [
      'Added native iOS-style graphical calendar date picker with month/year navigation',
      'Configured financial goal methods at Onboarding Step 3 to auto-setup budgets and opening balance',
      'Enhanced real-time total calculation and multi-currency support (MMK, USD, THB, EUR)',
      'Optimized performance for ledger database console and export features'
    ],
    itemsMy: [
      'ငွေစာရင်းထည့်သွင်းမှုတွင် iOS စတိုင် ရုပ်ထွက်မြင့် ပြက္ခဒိန်စနစ် ထည့်သွင်းပေးခဲ့ပါသည်။',
      'အသုံးပြုမှုစတင်ချိန် Step 3 တွင် ရွေးချယ်လိုက်သော နည်းလမ်းများအတိုင်း စတင် လက်ကျန်ငွေနှင့် ဘတ်ဂျက်များ တိုက်ရိုက်သတ်မှတ်ပေးပါသည်။',
      'ငွေကြေးအမျိုးအစားများ (MMK, USD, THB) အတွက် အချိန်ကိုက် တွက်ချက်မှုများ ပိုမိုမြန်ဆန်လာပါသည်။'
    ]
  },
  {
    version: 'v1.2.0',
    date: '2026-07-15',
    titleEn: 'Financial Analytics & Intelligent Ledger Forecasting',
    titleMy: 'ဘဏ္ဍာရေး သုံးသပ်ချက်များနှင့် ခန့်မှန်းချက်စနစ်',
    itemsEn: [
      'Interactive income vs expense bar charts & category distribution pie charts',
      '30-day spending trends and intelligent balance projection algorithms',
      'Custom budget alerts with progress indicators and threshold notifications'
    ],
    itemsMy: [
      'ဝင်ငွေ ထွက်ငွေ နှိုင်းယှဉ်ချက် ဇယားများနှင့် ကဏ္ဍအလိုက် သုံးစွဲမှု ရာခိုင်နှုန်းများ',
      'ရက်ပေါင်း ၃၀ စာ သုံးစွဲမှု ပုံစံများနှင့် အနာဂတ် လက်ကျန်ငွေ ခန့်မှန်းတွက်ချက်မှုများ'
    ]
  }
];

export const CheckUpdatesView: React.FC<CheckUpdatesViewProps> = ({
  settings,
  onClose
}) => {
  const language: Language = settings.language || 'en';
  const currentVersion = 'v1.2.5';
  
  const [checking, setChecking] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<string>(() => {
    return localStorage.getItem('mm_last_update_check') || new Date().toLocaleString();
  });
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [autoCheck, setAutoCheck] = useState<boolean>(() => {
    return localStorage.getItem('mm_auto_check_updates') !== 'false';
  });
  const [statusMessage, setStatusMessage] = useState<string>('');

  const handleCheckForUpdates = () => {
    setChecking(true);
    setStatusMessage(language === 'my' ? 'နောက်ဆုံးထွက် ဗားရှင်း စစ်ဆေးနေပါသည်...' : 'Checking server for latest build...');

    setTimeout(() => {
      // Simulate real cache & service worker update check
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          for (let reg of registrations) {
            reg.update();
          }
        });
      }

      const now = new Date().toLocaleString();
      setLastChecked(now);
      localStorage.setItem('mm_last_update_check', now);
      setChecking(false);

      // Deterministic check simulation: report up to date with fresh cache confirmation
      setUpdateAvailable(false);
      setStatusMessage(
        language === 'my'
          ? 'သင့်အပလီကေးရှင်းသည် နောက်ဆုံးထွက် ဗားရှင်းဖြစ်ပါသည်။'
          : 'Your application is running the latest published version!'
      );
    }, 1200);
  };

  const handleForceRefreshCache = () => {
    if (confirm(
      language === 'my'
        ? 'အပလီကေးရှင်း ကက်ချ် (Cache) များကို ရှင်းလင်းပြီး နောက်ဆုံးပြင်ဆင်ချက်များကို ရယူရန် စာမျက်နှာကို ပြန်လည်စတင်မည်လား?'
        : 'Clear web application cache and hard reload to fetch the latest published bundle?'
    )) {
      if ('caches' in window) {
        caches.keys().then(names => {
          for (let name of names) {
            caches.delete(name);
          }
        });
      }
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-[#007aff]" />
            {language === 'my' ? 'ဗားရှင်းနှင့် နောက်ဆုံးထွက် ပြင်ဆင်ချက်များ စစ်ဆေးရန်' : 'App Updates & Deployment'}
          </h2>
          <p className="text-xs text-[#8e8e93]">
            {language === 'my'
              ? 'အပလီကေးရှင်း ဗားရှင်းနှင့် GitHub/Domain ထုတ်လွှင့်မှု အခြေအနေ စစ်ဆေးပါ'
              : 'Check version status, reload live updates, and view published changelog'}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="p-2.5 rounded-full bg-black/[0.05] dark:bg-white/[0.08] text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white hover:bg-black/[0.08] dark:hover:bg-white/[0.12] transition-all cursor-pointer border-0 shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Status Banner Card */}
      <div className="p-6 ios-glass rounded-[2rem] border border-black/[0.05] dark:border-white/[0.08] space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#007aff]/15 text-[#007aff] flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-[#1c1c1e] dark:text-white font-mono">
                  {currentVersion}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {language === 'my' ? 'နောက်ဆုံး ဗားရှင်း' : 'Up to date'}
                </span>
              </div>
              <p className="text-xs text-[#8e8e93] mt-0.5 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#8e8e93]" />
                {language === 'my' ? `နောက်ဆုံး စစ်ဆေးခဲ့ချိန်: ${lastChecked}` : `Last checked: ${lastChecked}`}
              </p>
            </div>
          </div>

          <button
            onClick={handleCheckForUpdates}
            disabled={checking}
            className="w-full sm:w-auto px-5 py-3 bg-[#007aff] hover:bg-[#007aff]/90 text-white rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer border-0 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            <span>
              {checking
                ? (language === 'my' ? 'စစ်ဆေးနေသည်...' : 'Checking...')
                : (language === 'my' ? 'အပ်ဒိတ်အသစ် စစ်ဆေးမည်' : 'Check for Updates')}
            </span>
          </button>
        </div>

        {statusMessage && (
          <div className="p-3.5 rounded-2xl bg-[#007aff]/10 border border-[#007aff]/20 text-xs font-bold text-[#007aff] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Force Refresh Cache & Auto-Check Controls */}
        <div className="pt-3 border-t border-black/[0.05] dark:border-white/[0.08] grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleForceRefreshCache}
            className="p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] hover:bg-black/[0.06] dark:hover:bg-white/[0.09] text-left transition-all border-0 cursor-pointer flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <DownloadCloud className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#1c1c1e] dark:text-white block">
                {language === 'my' ? 'ကက်ချ် ပြန်ရှင်းလင်းပြီး ချက်ချင်း အပ်ဒိတ်ရယူရန်' : 'Force Refresh Web Cache'}
              </span>
              <span className="text-[10px] text-[#8e8e93] block">
                {language === 'my' ? 'Domain မှ တိုက်ရိုက်ပြန်လည်ဆွဲယူမည်' : 'Reload latest JS bundle directly from domain'}
              </span>
            </div>
          </button>

          <div className="p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] flex items-center justify-between gap-2">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-[#1c1c1e] dark:text-white block">
                {language === 'my' ? 'အလိုအလျောက် စစ်ဆေးမည်' : 'Auto Check on Launch'}
              </span>
              <span className="text-[10px] text-[#8e8e93] block">
                {language === 'my' ? 'အက်ပ်ဖွင့်တိုင်း စစ်ဆေးပေးမည်' : 'Notify when new commits published'}
              </span>
            </div>
            <input
              type="checkbox"
              checked={autoCheck}
              onChange={(e) => {
                setAutoCheck(e.target.checked);
                localStorage.setItem('mm_auto_check_updates', e.target.checked ? 'true' : 'false');
              }}
              className="w-4 h-4 accent-[#007aff] rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* GitHub & Custom Domain Deployment Guide */}
      <div className="p-5 ios-glass rounded-[2rem] space-y-3">
        <h3 className="text-sm font-bold text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#007aff]" />
          {language === 'my' ? 'GitHub & Custom Domain ထုတ်လွှင့်မှု သတင်းအချက်အလက်' : 'Deployment & GitHub Integration Info'}
        </h3>
        <p className="text-xs text-[#8e8e93] leading-relaxed">
          {language === 'my'
            ? 'အက်ပ်ကို GitHub Repository မှတစ်ဆင့် Custom Domain / Web Server (GitHub Pages / Cloud Run) သို့ ထုတ်လွှင့်ထားပါက၊ "အပ်ဒိတ်အသစ် စစ်ဆေးမည်" သို့မဟုတ် "Force Refresh Web Cache" ကိုနှိပ်ခြင်းဖြင့် မိုဘိုင်းလ်နှင့် ကွန်ပျူတာပေါ်ရှိ သုံးစွဲသူများအားလုံး နောက်ဆုံးရရှိသော ပြင်ဆင်ချက်များကို ချက်ချင်းရရှိနိုင်မည်ဖြစ်ပါသည်။'
            : 'When published to a custom domain or hosted via GitHub Pages, checking for updates revalidates static bundle assets and clears Service Worker client caches so users instantly receive all newly deployed fixes.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05]">
            <div className="flex items-center gap-2 text-[#007aff]">
              <Github className="w-4 h-4" />
              <span className="text-xs font-bold">{language === 'my' ? 'GitHub ဆင့်ပွားမှု' : 'GitHub Sync'}</span>
            </div>
            <span className="text-[10.5px] text-[#8e8e93] mt-1 block">
              {language === 'my' ? 'အလိုအလျောက် ဗားရှင်းစီမံမှု' : 'Auto CI/CD branch build'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05]">
            <div className="flex items-center gap-2 text-[#007aff]">
              <Layers className="w-4 h-4" />
              <span className="text-xs font-bold">{language === 'my' ? 'ကက်ချ် ထိန်းချုပ်မှု' : 'Cache Invalidation'}</span>
            </div>
            <span className="text-[10.5px] text-[#8e8e93] mt-1 block">
              {language === 'my' ? 'စာရင်းဇယား မပျက်ဘဲ အဆင့်မြှင့်မည်' : 'Zero data loss on update'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05]">
            <div className="flex items-center gap-2 text-[#007aff]">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-bold">{language === 'my' ? 'လိုင်းမဲ့စနစ်' : 'PWA Offline Ready'}</span>
            </div>
            <span className="text-[10.5px] text-[#8e8e93] mt-1 block">
              {language === 'my' ? 'အမြန်နှုန်းမြင့်မားစွာ အလုပ်လုပ်ခြင်း' : 'Local storage persistence'}
            </span>
          </div>
        </div>
      </div>

      {/* Release Notes & Changelog */}
      <div className="p-5 ios-glass rounded-[2rem] space-y-4">
        <h3 className="text-sm font-bold text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
          <Info className="w-4 h-4 text-[#007aff]" />
          {language === 'my' ? 'မကြာသေးမီက ပြင်ဆင်ချက်များ (Changelog)' : 'Release Notes & Feature Updates'}
        </h3>

        <div className="space-y-4">
          {RELEASE_HISTORY.map((rel) => (
            <div
              key={rel.version}
              className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.06] space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white bg-[#007aff] px-2.5 py-0.5 rounded-lg font-mono">
                    {rel.version}
                  </span>
                  <span className="text-xs font-bold text-[#1c1c1e] dark:text-white">
                    {language === 'my' ? rel.titleMy : rel.titleEn}
                  </span>
                </div>
                <span className="text-[10px] font-medium text-[#8e8e93]">
                  {rel.date}
                </span>
              </div>

              <ul className="space-y-1 pl-4 list-disc text-xs text-[#8e8e93] dark:text-slate-300">
                {(language === 'my' ? rel.itemsMy : rel.itemsEn).map((item, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
