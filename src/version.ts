export interface ReleaseNote {
  version: string;
  date: string;
  titleEn: string;
  titleMy: string;
  itemsEn: string[];
  itemsMy: string[];
}

export interface AppVersionInfo {
  version: string;
  buildHash: string;
  buildTime: string;
  titleEn: string;
  titleMy: string;
  changelogEn: string[];
  changelogMy: string[];
  releaseHistory?: ReleaseNote[];
}

export const APP_VERSION = 'v2.1.2';
export const BUILD_HASH = 'v2.1.2-20260805';

export const LOCAL_VERSION_INFO: AppVersionInfo = {
  version: 'v2.1.2',
  buildHash: 'v2.1.2-20260805',
  buildTime: '2026-08-05 18:00:00',
  titleEn: 'Release v2.1.2: Bulletproof PWA Offline Capability & Zero White Screen Fix',
  titleMy: 'ဗားရှင်းအသစ် v2.1.2: အော့ဖ်လိုင်းစနစ် အကြွင်းမဲ့ အဆင်ပြေစေရေးနှင့် စခရင်အဖြူပေါ်မှု အပြီးတိုင် ပြင်ဆင်ချက်',
  changelogEn: [
    'Fixed uncloned response stream bug in Service Worker cache storage strategy',
    'Ensured robust offline fallback for index.html navigation and static JS/CSS bundles',
    'Added real-time network status indicator banner for seamless offline financial management'
  ],
  changelogMy: [
    'Service Worker ၏ ကက်ချ် အချက်အလက် သိမ်းဆည်းသည့် စနစ်အတွင်းမှ Stream error ကို အပြီးတိုင် ပြင်ဆင်ခဲ့ပါသည်',
    'အင်တာနက် လိုင်းမရှိဘဲ အက်ပ်ဖွင့်ပါက စခရင်အဖြူပေါ်သည့် ပြဿနာကို ဖြေရှင်းခဲ့ပြီး အော့ဖ်လိုင်း လုံးဝ အလုပ်လုပ်စေပါသည်',
    'အင်တာနက် ချိတ်ဆက်မှု မရှိသည့် အချိန်များတွင် အော့ဖ်လိုင်း သတိပေး ဘန်နာ ထည့်သွင်းပေးထားပါသည်'
  ],
  releaseHistory: [
    {
      version: 'v2.1.2',
      date: '2026-08-05',
      titleEn: 'Release v2.1.2: Bulletproof PWA Offline Capability & Zero White Screen Fix',
      titleMy: 'ဗားရှင်းအသစ် v2.1.2: အော့ဖ်လိုင်းစနစ် အကြွင်းမဲ့ အဆင်ပြေစေရေးနှင့် စခရင်အဖြူပေါ်မှု အပြီးတိုင် ပြင်ဆင်ချက်',
      itemsEn: [
        'Fixed uncloned response stream bug in Service Worker cache storage strategy',
        'Ensured robust offline fallback for index.html navigation and static JS/CSS bundles',
        'Added real-time network status indicator banner for seamless offline financial management'
      ],
      itemsMy: [
        'Service Worker ၏ ကက်ချ် အချက်အလက် သိမ်းဆည်းသည့် စနစ်အတွင်းမှ Stream error ကို အပြီးတိုင် ပြင်ဆင်ခဲ့ပါသည်',
        'အင်တာနက် လိုင်းမရှိဘဲ အက်ပ်ဖွင့်ပါက စခရင်အဖြူပေါ်သည့် ပြဿနာကို ဖြေရှင်းခဲ့ပြီး အော့ဖ်လိုင်း လုံးဝ အလုပ်လုပ်စေပါသည်',
        'အင်တာနက် ချိတ်ဆက်မှု မရှိသည့် အချိန်များတွင် အော့ဖ်လိုင်း သတိပေး ဘန်နာ ထည့်သွင်းပေးထားပါသည်'
      ]
    },
    {
      version: 'v2.1.1',
      date: '2026-08-04',
      titleEn: 'Release v2.1.1: iOS Safe Area Top Inset & Interactive PWA Install Prompt',
      titleMy: 'ဗားရှင်းအသစ် v2.1.1: iPhone Notch အမိုးနှင့် PWA တပ်ဆင်မှု ပြင်ဆင်ချက်များ',
      itemsEn: [
        'Optimized iOS safe area inset top/bottom paddings for iPhone notch and Home Indicator',
        'Refined PWA install guide modal reset behavior and added direct copy link action',
        'Enhanced theme color meta synchronization for dark mode and light mode status bar styling'
      ],
      itemsMy: [
        'iPhone ဖုန်းများတွင် Top Notch မိုးမိခြင်းမရှိစေရန် Safe Area Safe Padding စနစ် ထည့်သွင်းပေးခဲ့ပါသည်',
        'PWA အော့ဖ်လိုင်း တပ်ဆင်မှုစခရင်နှင့် အက်ပ်လင့်ခ် ကူးယူသည့် စနစ်များကို မြှင့်တင်ခဲ့ပါသည်',
        'Dark Mode နှင့် Light Mode အကူးအပြောင်းတွင် iOS Status Bar အရောင် တိုက်ရိုက်ပြောင်းလဲပေးပါသည်'
      ]
    },
    {
      version: 'v2.1.0',
      date: '2026-08-04',
      titleEn: 'Release v2.1.0: Add to Home Screen PWA Modal & Native High-Res Screenshots',
      titleMy: 'ဗားရှင်းအသစ် v2.1.0: ပင်မစာမျက်နှာသို့ ထည့်သွင်းရန် PWA စနစ်နှင့် စခရင်ရှော့များ',
      itemsEn: [
        'Added native Chrome/Safari style "Add to home screen" bottom sheet modal triggered on user action',
        'Generated valid 192px/512px PWA PNG icons, maskable icon, and rich mobile/desktop preview screenshots',
        'Updated manifest.json and Service Worker caching for seamless offline app experience'
      ],
      itemsMy: [
        'Chrome နှင့် Safari ဘရောက်ဇာများတွင် Add to home screen နှိပ်ပါက ပေါ်လာမည့် PWA ပြသမှုစနစ်',
        'အက်ပ်၏ PWA အိုင်ကွန်များနှင့် စခရင်ရှော့ရုပ်ပုံများကို အရည်အသွေးမြင့်မားစွာ ထည့်သွင်းပေးခဲ့ပါသည်',
        'Service Worker အော့ဖ်လိုင်း စနစ်နှင့် manifest.json ဖိုင်ကို ပိုမိုပြည့်စုံအောင် ပြင်ဆင်ထားပါသည်'
      ]
    },
    {
      version: 'v2.0.0',
      date: '2026-08-03',
      titleEn: 'Major Release v2.0.0: Profile Navigation, Settings UX, PWA Store Preview & Engine Optimization',
      titleMy: 'ဗားရှင်းအသစ် v2.0.0: ပရိုဖိုင် စခရင် ပြောင်းလဲမှု၊ ဆက်တင် ရုပ်ထွက်၊ PWA စခရင်ရှော့များနှင့် စွမ်းဆောင်ရည် မြှင့်တင်မှု',
      itemsEn: [
        'Combined View Profile navigation directly to Profile overview page in Settings tab',
        'Streamlined drill-down headers across Settings views with intuitive close actions',
        'Added mobile and desktop PWA screenshots in manifest.json for store-style install prompt preview',
        'Integrated complete automated Vitest unit testing suite with 100% green verification',
        'Optimized dynamic category styling, icon mapping, and ledger calculation response times'
      ],
      itemsMy: [
        'ဆက်တင်စခရင်ရှိ ပရိုဖိုင်ကြည့်ရန် ခလုတ်ကို ပရိုဖိုင် ပင်မစခရင်သို့ တိုက်ရိုက် ရောက်ရှိအောင် ပြင်ဆင်ပေးခဲ့ပါသည်',
        'ဆက်တင် အသေးစိတ်စခရင်များ၏ ခေါင်းစဉ်နှင့် ပိတ်ရန်ခလုတ်များကို ပိုမိုသပ်ရပ်ရှင်းလင်းအောင် ပြုလုပ်ခဲ့ပါသည်',
        'PWA တပ်ဆင်မှုစခရင်တွင် ထင်ရှားစွာမြင်တွေ့နိုင်ရန် မိုဘိုင်းနှင့် ဒက်စတော့ စခရင်ရှော့များ ထည့်သွင်းပေးခဲ့ပါသည်',
        'အက်ပ်၏ စွမ်းဆောင်ရည်နှင့် တည်ငြိမ်မှုကို ယူနစ်တက်စ် (Unit Tests) များဖြင့် အပြည့်အဝ စစ်ဆေးမြှင့်တင်ခဲ့ပါသည်',
        'ကဏ္ဍအလိုက် အိုင်ကွန်နှင့် အရောင်များ တွက်ချက်ပြသမှုကို ပိုမိုမြန်ဆန်အောင် ပြင်ဆင်ထားပါသည်'
      ]
    },
    {
      version: 'v1.2.8',
      date: '2026-08-01',
      titleEn: '6-Month Analytics & iOS Offline PWA Enhancements',
      titleMy: '၆ လစာ ဘဏ္ဍာရေး သုံးသပ်ချက် ဇယားနှင့် iOS အော့ဖ်လိုင်း PWA စနစ် မြှင့်တင်မှု',
      itemsEn: [
        'Expanded Income vs Expense chart on Stats tab to show 6 months history',
        'Enhanced iOS PWA installation guidance overlay & offline Service Worker cache support',
        'Added dynamic date range labels to PDF financial statement exports',
        'Optimized PWA meta tags and offline standalone execution for iOS devices'
      ],
      itemsMy: [
        'ဘဏ္ဍာရေး သုံးသပ်ချက်စခရင်တွင် ဝင်ငွေ/ထွက်ငွေ ဇယားအား နောက်ဆုံး ၆ လစာအထိ တိုးမြှင့်ပြသပေးခဲ့ပါသည်',
        'iOS (iPhone) ဖုန်းများတွင် အပလီကေးရှင်းအား အော့ဖ်လိုင်း သွင်းယူအသုံးပြုနိုင်ရန် PWA စနစ်ကို ပိုမိုကောင်းမွန်အောင် ပြုလုပ်ခဲ့ပါသည်',
        'PDF အစီရင်ခံစာ ထုတ်ယူမှုတွင် သက်ဆိုင်ရာ ရက်စွဲအပိုင်းအခြား ထည့်သွင်းပေးခဲ့ပါသည်',
        'အော့ဖ်လိုင်း အသုံးပြုနိုင်ရေး Service Worker နှင့် အက်ပ်စွမ်းဆောင်ရည်များကို မြှင့်တင်ထားပါသည်'
      ]
    },
    {
      version: 'v1.2.7',
      date: '2026-07-30',
      titleEn: 'Structured Settings UX & Calendar Optimization',
      titleMy: 'ပြင်ဆင်ပြီး ဆက်တင် စနစ်နှင့် ရုပ်ထွက်မြင့် ပြက္ခဒိန် မြှင့်တင်မှု',
      itemsEn: [
        'Reorganized Settings interface into grouped categories with quick navigation filter tabs',
        'Added Reset Application Settings action while preserving offline transaction ledgers',
        'Optimized calendar cell aspect-ratio sizing and streamlined day transaction detail popups',
        'Performance and render optimizations across settings views'
      ],
      itemsMy: [
        'ဆက်တင်စနစ်၏ ရုပ်ထွက်နှင့် ခွဲခြားအသုံးပြုမှုကို စနစ်တကျ ကဏ္ဍအလိုက် ပြန်လည်ပြင်ဆင်ခဲ့ပါသည်',
        'ဝင်ငွေ/ထွက်ငွေ မှတ်တမ်းများမပျက်စေဘဲ အက်ပ် ဆက်တင်များကို သီးသန့် မူလအတိုင်း ပြန်လည်သတ်မှတ်နိုင်သည့် စနစ် ထည့်သွင်းပေးခဲ့ပါသည်',
        'ပြက္ခဒိန် အကွက် အရွယ်အစားနှင့် သီးသန့် အသေးစိတ်ကြည့်ရှုသည့် စခရင်ကို ပိုမိုရှင်းလင်းအောင် ပြင်ဆင်ခဲ့ပါသည်',
        'အက်ပ်၏ မြန်နှုန်းနှင့် စွမ်းဆောင်ရည်ကို ပိုမိုကောင်းမွန်အောင် မြှင့်တင်ထားပါသည်'
      ]
    },
    {
      version: 'v1.2.6',
      date: '2026-07-28',
      titleEn: 'Dynamic Server Updates & Multi-Month Budget Control',
      titleMy: 'အလိုအလျောက် ဗားရှင်းစစ်ဆေးမှုနှင့် လအလိုက် ဘတ်ဂျက်စနစ်',
      itemsEn: [
        'Dynamic server build version detection & automatic Service Worker cache bypass',
        'One-click application update button with instant cache invalidation',
        'Dedicated monthly budget limits with automatic previous month budget copying'
      ],
      itemsMy: [
        'ဆာဗာရှိ နောက်ဆုံးထွက် ဗားရှင်းအသစ်ကို အလိုအလျောက် စစ်ဆေးပြီး Cache ကျော်လွန် ရယူနိုင်ခြင်း',
        'ကလစ်တစ်ချက်နှိပ်ရုံဖြင့် အက်ပ်အား ဗားရှင်းအသစ်သို့ ချက်ချင်း အဆင့်မြှင့်တင်နိုင်ခြင်း',
        'လအလိုက် ဘတ်ဂျက်ကန့်သတ်ချက် သတ်မှတ်နိုင်ခြင်းနှင့် လွန်ခဲ့သောလမှ ဘတ်ဂျက် ကူးယူနိုင်ခြင်း'
      ]
    },
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
  ]
};

/**
 * Fetch latest version metadata from server directly with cache-busting
 */
export async function fetchServerVersionInfo(): Promise<AppVersionInfo | null> {
  try {
    let requestUrl = `/version.json?t=${Date.now()}`;
    if (typeof window !== 'undefined' && window.location) {
      const base = window.location.origin && window.location.origin !== 'null'
        ? window.location.origin
        : (window.location.href || 'http://localhost:3000');
      requestUrl = new URL(`/version.json?t=${Date.now()}`, base).toString();
    }
    const res = await fetch(requestUrl, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data as AppVersionInfo;
  } catch (err) {
    console.warn('Failed to fetch server version info:', err);
    return null;
  }
}

/**
 * Force clear all web caches and Service Workers then reload
 */
export async function forceApplyAppUpdate(): Promise<void> {
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        if (reg.active) {
          reg.active.postMessage({ type: 'SKIP_WAITING' });
          reg.active.postMessage({ type: 'CLEAR_CACHE' });
        }
        await reg.unregister();
      }
    }
    if ('caches' in window) {
      const names = await caches.keys();
      await Promise.all(names.map(name => caches.delete(name)));
    }
  } catch (err) {
    console.error('Error clearing caches during update:', err);
  }

  // Reload page bypassing cache
  window.location.href = window.location.pathname + '?v=' + Date.now();
}
