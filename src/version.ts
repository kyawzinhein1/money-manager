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

export const APP_VERSION = 'v2.2.0';
export const BUILD_HASH = 'v2.2.0-20260820';

export const LOCAL_VERSION_INFO: AppVersionInfo = {
  version: 'v2.2.0',
  buildHash: 'v2.2.0-20260820',
  buildTime: '2026-08-20 20:15:00',
  titleEn: 'Release v2.2.0: Clean Visual Analytics & High-Definition PDF Reports',
  titleMy: 'ဗားရှင်းအသစ် v2.2.0: သပ်ရပ်ရှင်းလင်းသော သုံးသပ်ချက် ဇယားများနှင့် မြန်မာဘာသာ PDF အစီရင်ခံစာ ထုတ်ယူမှု မွမ်းမံချက်',
  changelogEn: [
    'Streamlined Analytics view with focused Day-by-Day Cash Flow trend and Category Expense Breakdown',
    'Integrated high-definition Plus Jakarta Sans typography into financial statement PDF exports',
    'Optimized layout spacing and mobile-friendly chart interactions'
  ],
  changelogMy: [
    'ပိုမိုရှင်းလင်းသပ်ရပ်သော နေ့စဉ် ငွေကြေးစီးဆင်းမှု မျဉ်းကွေးနှင့် သုံးစွဲမှု ကဏ္ဍခွဲခြမ်းစိတ်ဖြာချက် ဇယားများ',
    'တိကျကြည်လင်သော Plus Jakarta Sans ဖောင့်စနစ်ဖြင့် မြန်မာဘာသာ PDF အစီရင်ခံစာ ထုတ်ယူမှု အဆင့်မြှင့်တင်ခြင်း',
    'မိုဘိုင်းလ်စခရင်များတွင် ပိုမိုပေါ့ပါးမြန်ဆန်သော မျက်နှာပြင် စနစ်'
  ],
  releaseHistory: [
    {
      version: 'v2.2.0',
      date: '2026-08-20',
      titleEn: 'Release v2.2.0: Clean Visual Analytics & High-Definition PDF Reports',
      titleMy: 'ဗားရှင်းအသစ် v2.2.0: သပ်ရပ်ရှင်းလင်းသော သုံးသပ်ချက် ဇယားများနှင့် မြန်မာဘာသာ PDF အစီရင်ခံစာ ထုတ်ယူမှု မွမ်းမံချက်',
      itemsEn: [
        'Streamlined Analytics view with focused Day-by-Day Cash Flow trend and Category Expense Breakdown',
        'Integrated high-definition Plus Jakarta Sans typography into financial statement PDF exports',
        'Optimized layout spacing and mobile-friendly chart interactions'
      ],
      itemsMy: [
        'ပိုမိုရှင်းလင်းသပ်ရပ်သော နေ့စဉ် ငွေကြေးစီးဆင်းမှု မျဉ်းကွေးနှင့် သုံးစွဲမှု ကဏ္ဍခွဲခြမ်းစိတ်ဖြာချက် ဇယားများ',
        'တိကျကြည်လင်သော Plus Jakarta Sans ဖောင့်စနစ်ဖြင့် မြန်မာဘာသာ PDF အစီရင်ခံစာ ထုတ်ယူမှု အဆင့်မြှင့်တင်ခြင်း',
        'မိုဘိုင်းလ်စခရင်များတွင် ပိုမိုပေါ့ပါးမြန်ဆန်သော မျက်နှာပြင် စနစ်'
      ]
    },
    {
      version: 'v2.1.8',
      date: '2026-08-12',
      titleEn: 'Release v2.1.8: Dedicated Budget Edit View & Clean Plus Jakarta Sans Typography',
      titleMy: 'ဗားရှင်းအသစ် v2.1.8: ဘတ်ဂျက် ပြင်ဆင်မှု စခရင်သီးသန့်နှင့် ရှင်းလင်းသော ဖောင့်စနစ် မွမ်းမံချက်',
      itemsEn: [
        'Created dedicated full-page Budget Edit section with responsive monthly and custom date range controls',
        'Substituted all monospace typography across the application with clean Plus Jakarta Sans display font',
        'Streamlined input design and overall aesthetic consistency'
      ],
      itemsMy: [
        'ဘတ်ဂျက် ကန့်သတ်ချက် ပြင်ဆင်ရန် စခရင်ကို သီးသန့် စာမျက်နှာအဖြစ် ပြန်လည်မွမ်းမံ ပြင်ဆင်ခဲ့ပါသည်',
        'အက်ပ်တစ်ခုလုံးရှိ ကိန်းဂဏန်းနှင့် စာလုံးဒီဇိုင်းများအားလုံးကို သန့်ရှင်းသော Plus Jakarta Sans ဖောင့်သို့ ပြောင်းလဲခဲ့ပါသည်',
        'အသုံးစရိတ်နှင့် ဘတ်ဂျက် ဖြည့်သွင်းမှုပုံစံများကို ပိုမိုပြေပြစ်သပ်ရပ်အောင် မြှင့်တင်ပေးခဲ့ပါသည်'
      ]
    },
    {
      version: 'v2.1.7',
      date: '2026-08-10',
      titleEn: 'Release v2.1.7: Code Standardization & Reusable Component Optimization',
      titleMy: 'ဗားရှင်းအသစ် v2.1.7: ကုဒ်စနစ် ပြန်လည်သန့်ရှင်းပြုပြင်ခြင်းနှင့် ဘုံအသုံးပြုနိုင်သော ခလုတ်/ယူနစ်များ မြှင့်တင်ခြင်း',
      itemsEn: [
        'Extracted reusable `useIsMobile` viewport hook to eliminate code duplication across components',
        'Created modular `EmptyState` reusable component and `TransactionCardItem` sub-component for streamlined rendering',
        'Optimized overall bundle architecture and code quality standards'
      ],
      itemsMy: [
        'ကုဒ်ထပ်တလဲလဲ ဖြစ်ပေါ်မှုကို လျှော့ချရန် `useIsMobile` Hook ကို သီးခြားထုတ်ယူ ပြန်လည်အသုံးပြုခဲ့ပါသည်',
        'စာရင်းအချက်အလက် ကင်းမဲ့ချိန်ပြကွက် `EmptyState` နှင့် Transaction ကတ်ပြကွက်များကို Reusable Component အဖြစ် သီးခြားဖွဲ့စည်း ပြင်ဆင်ခဲ့ပါသည်',
        'အက်ပ်၏ ကုဒ်စနစ်သန့်ရှင်းမှုနှင့် စွမ်းဆောင်ရည်ကို ပိုမိုမြှင့်တင်ပေးခဲ့ပါသည်'
      ]
    },
    {
      version: 'v2.1.6',
      date: '2026-08-10',
      titleEn: 'Release v2.1.6: Currency & Format Settings Label Update & Financial Statement PDF Styling',
      titleMy: 'ဗားရှင်းအသစ် v2.1.6: ငွေကြေးနှင့် ပုံစံ သတ်မှတ်ချက် အမည်အသစ် ပြောင်းလဲခြင်းနှင့် ဘဏ္ဍာရေး အစီရင်ခံစာ PDF ရုပ်ထွက် မွမ်းမံချက်',
      itemsEn: [
        'Updated Settings navigation item label to "Currency & Format Settings" for enhanced clarity and precision',
        'Refined financial statement PDF generation styling, colors, and executive layout structure',
        'Updated application release version and update distribution metadata'
      ],
      itemsMy: [
        'ဆက်တင်စခရင်ရှိ ငွေကြေးသတ်မှတ်ချက် ခလုတ်အမည်အား ပိုမိုရှင်းလင်းထင်ရှားသော "ငွေကြေးနှင့် ပုံစံ သတ်မှတ်ချက်များ" ဟု ပြောင်းလဲခဲ့ပါသည်',
        'ဘဏ္ဍာရေး အစီရင်ခံစာ PDF ထုတ်ယူမှုဒီဇိုင်းနှင့် အရောင်အသွေးများကို ပိုမိုသပ်ရပ်လှပအောင် ပြန်လည်ပြင်ဆင်ခဲ့ပါသည်',
        'အက်ပ်၏ ဗားရှင်းအသစ် v2.1.6 ကို အဆင့်မြှင့်တင်ပေးခဲ့ပါသည်'
      ]
    },
    {
      version: 'v2.1.5',
      date: '2026-08-10',
      titleEn: 'Release v2.1.5: Clean Plus Jakarta Sans Typography & Unified Title Styling',
      titleMy: 'ဗားရှင်းအသစ် v2.1.5: Plus Jakarta Sans စာလုံးဒီဇိုင်းနှင့် ညီညာဆွဲဆောင်မှုရှိသော ခေါင်းစဉ်ဒီဇိုင်း',
      itemsEn: [
        'Upgraded global typography to Plus Jakarta Sans for a clean, modern, and beautiful UI aesthetic',
        'Standardized all page headers and title typography across all tabs, modals, and subviews with matching icon frames and font weights',
        'Ensured crisp rendering for Myanmar and numeric characters with optimized fallback font stacks'
      ],
      itemsMy: [
        'အက်ပ်တစ်ခုလုံး၏ စာလုံးဒီဇိုင်းကို ပိုမိုသန့်ရှင်းဆန်းသစ်သော Plus Jakarta Sans သို့ အဆင့်မြှင့်တင်ခဲ့ပါသည်',
        'စာမျက်နှာ ခေါင်းစဉ်များ၊ အိုင်ကွန်ကွက်များနှင့် စာလုံးဆိုဒ်များအားလုံးကို တညီတညွတ်တည်း ဖြစ်စေရန် ပြန်လည်စနစ်တကျ ပြင်ဆင်ခဲ့ပါသည်',
        'မြန်မာစာနှင့် ကိန်းဂဏန်းများ သန့်ရှင်းပြတ်သားစွာ ပေါ်လွင်စေရန် ဖောင့်စနစ်ကို မြှင့်တင်ထားပါသည်'
      ]
    },
    {
      version: 'v2.1.4',
      date: '2026-08-10',
      titleEn: 'Release v2.1.4: Native Apple iOS Typography & Simplified Home Layout',
      titleMy: 'ဗားရှင်းအသစ် v2.1.4: အမှန်တကယ် iOS ပုံစံ စာလုံးဒီဇိုင်းနှင့် ပိုမိုရှင်းလင်းသော ပင်မစာမျက်နှာ',
      itemsEn: [
        'Applied native Apple iOS System Typography (-apple-system, SF Pro Text / Display) across the entire application',
        'Streamlined Home Dashboard overview by removing daily avg spend, top category, and savings rate metrics',
        'Substituted Release Notes UI in Check Updates with real-time current release version information details'
      ],
      itemsMy: [
        'အက်ပ်တစ်ခုလုံးကို မူလ Apple iOS ပုံစံ စာလုံးဒီဇိုင်း (SF Pro System Font) သို့ အပြီးသတ် ပြောင်းလဲခဲ့ပါသည်',
        'ပင်မစာမျက်နှာကို ပိုမိုရှင်းလင်းစေရန် တစ်နေ့ပျမ်းမျှ အသုံးစရိတ်နှင့် စုဆောင်းငွေ အချိုး ကတ်များကို ဖယ်ရှားခဲ့ပါသည်',
        'ဗားရှင်း စစ်ဆေးသည့် စခရင်တွင် လက်ရှိ ထုတ်လုပ်ထားသော ဗားရှင်း သတင်းအချက်အလက်များကို တိုက်ရိုက် ဖော်ပြပေးထားပါသည်'
      ]
    },
    {
      version: 'v2.1.3',
      date: '2026-08-05',
      titleEn: 'Release v2.1.3: Instant Cold Launch & Zero White Screen PWA Offline Engine',
      titleMy: 'ဗားရှင်းအသစ် v2.1.3: အက်ပ် ပိတ်ပြီး ပြန်ဖွင့်ချိန် စခရင်အဖြူ လုံးဝ မပေါ်စေရန်နှင့် အော့ဖ်လိုင်း ချက်ချင်းပွင့်သည့် စနစ်',
      itemsEn: [
        'Implemented instant Cache-First navigation strategy with ignoreSearch matching for PWA shortcuts',
        'Auto-discovered and pre-cached bundled JS/CSS resources during Service Worker installation',
        'Added seamless native dark/light splash shell inside index.html for zero white screen startup'
      ],
      itemsMy: [
        'Recent Apps မှ အက်ပ်ကို ဖြုတ်ပြီး အော့ဖ်လိုင်း ပြန်ဖွင့်ချိန် ချက်ချင်းပွင့်စေရန် Cache-First စနစ် ပြောင်းလဲခဲ့ပါသည်',
        'Service Worker တပ်ဆင်ချိန်တွင် JavaScript နှင့် CSS ဖိုင်အားလုံးကို လိုအောက် ပရီးကက်ချ် ပြုလုပ်ထားပါသည်',
        'အက်ပ် စတင်ပွင့်ချိန် စခရင် အဖြူရောင် လုံးဝ မပေါ်စေရန် index.html တွင် Instant Splash Shell ထည့်သွင်းထားပါသည်'
      ]
    },
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
export function isVersionNewer(
  serverVersion?: string,
  localVersion?: string,
  serverHash?: string,
  localHash?: string
): boolean {
  if (!serverVersion || !localVersion) return false;

  const cleanS = serverVersion.replace(/^v/i, '').trim();
  const cleanL = localVersion.replace(/^v/i, '').trim();

  const sParts = cleanS.split('.').map((n) => parseInt(n, 10) || 0);
  const lParts = cleanL.split('.').map((n) => parseInt(n, 10) || 0);

  const maxLength = Math.max(sParts.length, lParts.length);
  for (let i = 0; i < maxLength; i++) {
    const s = sParts[i] || 0;
    const l = lParts[i] || 0;
    if (s > l) return true;
    if (s < l) return false;
  }

  // Same major.minor.patch versions -> check build hash if non-offline and different
  if (
    serverHash &&
    localHash &&
    serverHash !== localHash &&
    serverHash !== 'offline' &&
    localHash !== 'offline'
  ) {
    return serverHash > localHash;
  }

  return false;
}

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
        if (reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          reg.waiting.postMessage({ type: 'CLEAR_CACHE' });
        }
        if (reg.installing) {
          reg.installing.postMessage({ type: 'SKIP_WAITING' });
          reg.installing.postMessage({ type: 'CLEAR_CACHE' });
        }
        if (reg.active) {
          reg.active.postMessage({ type: 'SKIP_WAITING' });
          reg.active.postMessage({ type: 'CLEAR_CACHE' });
        }
        await reg.unregister();
      }
    }
    if ('caches' in window) {
      const names = await caches.keys();
      await Promise.all(names.map((name) => caches.delete(name)));
    }
  } catch (err) {
    console.error('Error clearing caches during update:', err);
  }

  // Reload page bypassing cache
  window.location.href = window.location.pathname + '?v=' + Date.now();
}
