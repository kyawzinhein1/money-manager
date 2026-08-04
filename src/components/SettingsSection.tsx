import React, { useState, useMemo } from 'react';
import {
  Globe,
  FolderKanban,
  Database,
  RefreshCw,
  Mail,
  Smartphone,
  ChevronRight,
  ChevronLeft,
  UserCheck,
  Coins,
  Download,
  SlidersHorizontal,
  Search,
  X,
  Sparkles
} from 'lucide-react';
import {
  BalanceMethod,
  Language,
  Settings,
  UserProfile,
  Transaction,
  Budget,
  Currency,
  NavbarSettings
} from '../types';
import { APP_VERSION } from '../version';
import { ManageCategoriesView } from './settings/ManageCategoriesView';
import { DatabaseConsoleView } from './settings/DatabaseConsoleView';
import { GeneralPreferencesView } from './settings/GeneralPreferencesView';
import { CurrencySettingsView } from './settings/CurrencySettingsView';
import { ExportDataView } from './settings/ExportDataView';
import { CheckUpdatesView } from './settings/CheckUpdatesView';
import { BottomNavCustomizerView } from './settings/BottomNavCustomizerView';

interface SettingsSectionProps {
  t: (key: string) => string;
  settings: Settings;
  profile: UserProfile;
  transactions: Transaction[];
  budgets: Budget[];
  incomeCategories: string[];
  expenseCategories: string[];
  inactiveIncomeCategories?: string[];
  inactiveExpenseCategories?: string[];
  categoryColors?: Record<string, string>;
  categoryIcons?: Record<string, string>;
  readAlertIds: string[];
  onUpdateLanguage: (lang: Language) => void;
  onUpdateCurrency: (code: string, symbol: string, name: string) => void;
  onUpdateTheme: (theme: 'light' | 'dark') => void;
  onUpdateBalanceMethod?: (method: BalanceMethod) => void;
  onUpdateNavbarSettings?: (navbarSettings: NavbarSettings) => void;
  onAddCategory: (type: 'expense' | 'income', category: string, color?: string, icon?: string) => void;
  onDeactivateCategory?: (type: 'expense' | 'income', category: string) => void;
  onReactivateCategory?: (type: 'expense' | 'income', category: string) => void;
  onDeleteCategoryPermanently?: (type: 'expense' | 'income', category: string) => void;
  onUpdateCategoryColor?: (category: string, color: string) => void;
  onUpdateCategoryIcon?: (category: string, iconName: string) => void;
  onDeleteCategory: (type: 'expense' | 'income', category: string) => void;
  onEditProfileClick: () => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
  onLoadDemoData: () => void;
  onClearAllData: () => void;
  onResetSettings?: () => void;
  onRestoreBackup: (backupData: any) => boolean;
  onUpdateRawKey?: (key: string, value: any) => void;
  onOpenPWAInstallGuide?: () => void;
}

interface SettingItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  title: string;
  ariaLabel?: string;
  subtitle: string;
  action: () => void;
  keywords: string;
}

interface SettingGroup {
  title: string;
  items: SettingItem[];
}

const PRESET_CURRENCIES: Currency[] = [
  { code: 'MMK', symbol: 'Ks', name: 'Myanmar Kyat' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' }
];

type SubViewType = 'general' | 'currency' | 'categories' | 'navbar' | 'export' | 'database' | 'updates' | null;

export const SettingsSection: React.FC<SettingsSectionProps> = React.memo(({
  t,
  settings,
  profile,
  transactions,
  budgets,
  incomeCategories,
  expenseCategories,
  inactiveIncomeCategories = [],
  inactiveExpenseCategories = [],
  categoryColors = {},
  categoryIcons = {},
  readAlertIds,
  onUpdateLanguage,
  onUpdateCurrency,
  onUpdateTheme,
  onUpdateBalanceMethod,
  onUpdateNavbarSettings = () => {},
  onAddCategory,
  onDeactivateCategory,
  onReactivateCategory,
  onDeleteCategoryPermanently,
  onUpdateCategoryColor,
  onUpdateCategoryIcon,
  onDeleteCategory,
  onEditProfileClick,
  onExportCSV,
  onExportPDF,
  onLoadDemoData,
  onClearAllData,
  onResetSettings,
  onRestoreBackup,
  onOpenPWAInstallGuide
}) => {
  const [activeSubView, setActiveSubView] = useState<SubViewType>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('mm_open_updates_on_load') === 'true') {
      localStorage.removeItem('mm_open_updates_on_load');
      return 'updates';
    }
    return null;
  });

  const [searchQuery, setSearchQuery] = useState('');

  const customCurrency: Currency = useMemo(() => ({
    code: settings.currency || 'MMK',
    symbol: PRESET_CURRENCIES.find((c) => c.code === settings.currency)?.symbol || 'Ks',
    name: PRESET_CURRENCIES.find((c) => c.code === settings.currency)?.name || 'Local Currency'
  }), [settings.currency]);

  const totalCategoriesCount = useMemo(() => 
    incomeCategories.length + expenseCategories.length,
    [incomeCategories.length, expenseCategories.length]
  );

  const isMy = settings.language === 'my';

  const navigateTo = (view: SubViewType) => {
    setActiveSubView(view);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Sub-view renderers
  if (activeSubView === 'categories') {
    return (
      <ManageCategoriesView
        t={t}
        settings={settings}
        incomeCategories={incomeCategories}
        expenseCategories={expenseCategories}
        inactiveIncomeCategories={inactiveIncomeCategories}
        inactiveExpenseCategories={inactiveExpenseCategories}
        categoryColors={categoryColors}
        categoryIcons={categoryIcons}
        onAddCategory={onAddCategory}
        onDeactivateCategory={onDeactivateCategory}
        onReactivateCategory={onReactivateCategory}
        onDeleteCategoryPermanently={onDeleteCategoryPermanently}
        onUpdateCategoryColor={onUpdateCategoryColor}
        onUpdateCategoryIcon={onUpdateCategoryIcon}
        onDeleteCategory={onDeleteCategory}
        onClose={() => navigateTo(null)}
      />
    );
  }

  if (activeSubView === 'updates') {
    return (
      <CheckUpdatesView
        t={t}
        settings={settings}
        onClose={() => navigateTo(null)}
      />
    );
  }

  if (activeSubView === 'database') {
    return (
      <DatabaseConsoleView
        t={t}
        settings={settings}
        profile={profile}
        transactions={transactions}
        budgets={budgets}
        incomeCategories={incomeCategories}
        expenseCategories={expenseCategories}
        readAlertIds={readAlertIds}
        onClose={() => navigateTo(null)}
        onLoadDemoData={onLoadDemoData}
        onClearAllData={onClearAllData}
        onResetSettings={onResetSettings}
        onRestoreBackup={onRestoreBackup}
      />
    );
  }

  if (activeSubView === 'navbar') {
    return (
      <BottomNavCustomizerView
        t={t}
        settings={settings}
        onUpdateNavbarSettings={onUpdateNavbarSettings}
        onClose={() => navigateTo(null)}
      />
    );
  }

  // Drill-down wrapper for standalone subviews
  const renderSubViewHeader = (title: string, icon?: React.ReactNode, description?: string) => (
    <div className="flex items-center justify-between pb-4 mb-5 border-b border-black/5 dark:border-white/10 gap-3">
      <div>
        <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </h2>
        {description && (
          <p className="text-xs text-[#8e8e93] mt-0.5">
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => navigateTo(null)}
        aria-label={isMy ? 'ပိတ်ရန်' : 'Close'}
        className="p-2.5 rounded-full bg-black/[0.05] dark:bg-white/[0.08] text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white hover:bg-black/[0.08] dark:hover:bg-white/[0.12] transition-all cursor-pointer border-0 shrink-0"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );

  if (activeSubView === 'general') {
    return (
      <div className="space-y-4">
        {renderSubViewHeader(
          isMy ? 'အထွေထွေ ပုံစံနှင့် ဘာသာစကား' : 'General Preferences & Theme',
          <Globe className="w-5 h-5 text-[#007aff]" />,
          isMy ? 'ဘာသာစကား၊ အပြင်အဆင်နှင့် လက်ကျန်ငွေ တွက်ချက်ပုံ သတ်မှတ်ပါ' : 'Configure app language, color themes, and balance calculations'
        )}
        <GeneralPreferencesView
          t={t}
          settings={settings}
          onUpdateLanguage={onUpdateLanguage}
          onUpdateTheme={onUpdateTheme}
          onUpdateBalanceMethod={onUpdateBalanceMethod}
          onResetSettings={onResetSettings}
          onOpenPWAInstallGuide={onOpenPWAInstallGuide}
        />
      </div>
    );
  }

  if (activeSubView === 'currency') {
    return (
      <div className="space-y-4">
        {renderSubViewHeader(
          isMy ? 'ငွေကြေးနှင့် ပုံစံ သတ်မှတ်ချက်များ' : 'Currency & Format Settings',
          <Coins className="w-5 h-5 text-[#34c759]" />,
          isMy ? 'အသုံးပြုမည့် ငွေကြေး သင်္ကေတနှင့် ပုံစံများကို ရွေးချယ်ပါ' : 'Select currency codes, symbols, and formatting options'
        )}
        <CurrencySettingsView
          t={t}
          settings={settings}
          customCurrency={customCurrency}
          presetCurrencies={PRESET_CURRENCIES}
          onUpdateCurrency={onUpdateCurrency}
        />
      </div>
    );
  }

  if (activeSubView === 'export') {
    return (
      <div className="space-y-4">
        {renderSubViewHeader(
          isMy ? 'အစီရင်ခံစာနှင့် စာရင်း ထုတ်ယူရန်' : 'Export Financial Reports',
          <Download className="w-5 h-5 text-[#ff2d55]" />,
          isMy ? 'Excel CSV နှင့် PDF အစီရင်ခံစာများ ထုတ်ယူပါ' : 'Download CSV spreadsheets and formatted PDF statements'
        )}
        <ExportDataView
          t={t}
          onExportCSV={onExportCSV}
          onExportPDF={onExportPDF}
        />
      </div>
    );
  }

  // Root Menu Item Data Structure for iOS Drill-Down List
  const settingGroups: SettingGroup[] = [
    {
      title: isMy ? 'အထွေထွေ နှင့် အပြင်အဆင်' : 'Preferences & Appearance',
      items: [
        {
          id: 'general-settings-item',
          icon: Globe,
          iconBg: 'bg-[#007aff]',
          title: isMy ? 'အထွေထွေ သတ်မှတ်ချက်များ' : 'General Preferences',
          subtitle: isMy 
            ? `ဘာသာစကား: ${settings.language === 'my' ? 'မြန်မာ' : 'English'} • အပြင်အဆင်: ${settings.theme === 'dark' ? 'Dark' : 'Light'}` 
            : `Language: ${settings.language.toUpperCase()} • Theme: ${settings.theme}`,
          action: () => navigateTo('general'),
          keywords: 'language theme balance dark light english myanmar'
        },
        {
          id: 'currency-settings-item',
          icon: Coins,
          iconBg: 'bg-[#34c759]',
          title: isMy ? 'ငွေကြေး အမျိုးအစား' : 'Currency & Formatting',
          subtitle: `${customCurrency.code} (${customCurrency.symbol}) - ${customCurrency.name}`,
          action: () => navigateTo('currency'),
          keywords: 'currency mmk usd symbol ks dollar format'
        },
        {
          id: 'open-customize-navbar-btn',
          icon: Smartphone,
          iconBg: 'bg-[#5856d6]',
          title: isMy ? 'မိုဘိုင်း Navigation ပြင်ဆင်ရန်' : 'Customize Navigation Bar',
          subtitle: isMy ? 'အောက်ခြေဘား အရောင်၊ အိုင်ကွန်နှင့် ပုံစံများ' : 'Bottom bar colors, blur effects & icons',
          action: () => navigateTo('navbar'),
          keywords: 'navbar bottom navigation icons mobile theme customization'
        }
      ]
    },
    {
      title: isMy ? 'ဘဏ္ဍာရေး ကဏ္ဍများ' : 'Categories & Structure',
      items: [
        {
          id: 'open-manage-categories-btn',
          icon: FolderKanban,
          iconBg: 'bg-[#ff9500]',
          title: t('manageCategories'),
          ariaLabel: t('openManageCategories'),
          subtitle: isMy ? `${totalCategoriesCount} ခုမြောက် ဝင်ငွေ/ထွက်ငွေ ကဏ္ဍများ` : `${totalCategoriesCount} Active Income & Expense Categories`,
          action: () => navigateTo('categories'),
          keywords: 'categories income expense manage icons colors'
        }
      ]
    },
    {
      title: isMy ? 'ဒေတာ နှင့် အစီရင်ခံစာများ' : 'Data & Financial Ledger',
      items: [
        {
          id: 'export-data-item',
          icon: Download,
          iconBg: 'bg-[#ff2d55]',
          title: isMy ? 'အစီရင်ခံစာ ထုတ်ယူရန် (CSV / PDF)' : 'Export Financial Reports',
          subtitle: isMy ? 'Excel စာရင်းဇယားနှင့် PDF အစီရင်ခံစာများ ထုတ်ယူမည်' : 'Download CSV spreadsheets and PDF statements',
          action: () => navigateTo('export'),
          keywords: 'export csv pdf download reports statements excel'
        },
        {
          id: 'open-database-console-btn',
          icon: Database,
          iconBg: 'bg-[#af52de]',
          title: isMy ? 'ဒေတာဘေ့စ်နှင့် အရန်သိမ်းမှု ကွန်ဆိုးလ်' : 'Database & Backup Console',
          subtitle: isMy ? 'JSON လိုင်းမဲ့ဒေတာ၊ အရန်သိမ်းခြင်းနှင့် အစမှ ပြန်စခြင်း' : 'Inspect raw JSON ledger, restore backups & reset',
          action: () => navigateTo('database'),
          keywords: 'database backup restore json reset clear data demo'
        }
      ]
    },
    {
      title: isMy ? 'အက်ပ် ဗားရှင်း နှင့် အချက်အလက်' : 'Application & Updates',
      items: [
        {
          id: 'open-check-updates-btn',
          icon: RefreshCw,
          iconBg: 'bg-[#007aff]',
          title: isMy ? 'ဗားရှင်းနှင့် အပ်ဒိတ် စစ်ဆေးရန်' : 'Check Updates & Release Notes',
          subtitle: isMy ? `လက်ရှိ သုံးစွဲနေသော ဗားရှင်း (${APP_VERSION})` : `Running app version (${APP_VERSION})`,
          action: () => navigateTo('updates'),
          keywords: 'update version release notes app changelog'
        }
      ]
    }
  ];

  // Filter items if searching
  const filteredGroups = settingGroups.map(group => ({
    ...group,
    items: group.items.filter(item => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.keywords.toLowerCase().includes(q)
      );
    })
  })).filter(group => group.items.length > 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto" id="settings-section">
      {/* Root Settings Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black tracking-tight text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#007aff]" />
            {t('settings')}
          </h2>
          <p className="text-xs text-[#8e8e93]">
            {isMy
              ? 'အက်ပ်၏ လုပ်ဆောင်ချက်များကို သန့်ရှင်းသော မိုဘိုင်း iOS ပုံစံဖြင့် စီမံပါ'
              : 'Streamlined iOS-style settings list & system preferences'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#007aff]/10 text-[#007aff] text-xs font-black font-mono">
            {APP_VERSION}
          </span>
        </div>
      </div>

      {/* iOS Style Profile Hero Card */}
      <div 
        onClick={onEditProfileClick}
        className="p-4 sm:p-5 ios-glass rounded-[2rem] flex items-center justify-between gap-3 shadow-xs cursor-pointer hover:border-[#007aff]/30 transition-all border border-black/5 dark:border-white/5 group"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative shrink-0">
            <img
              src={profile.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={profile.name}
              referrerPolicy="no-referrer"
              className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl object-cover border-2 border-white dark:border-[#2c2c2e] shadow-sm bg-slate-100 group-hover:scale-105 transition-transform"
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#34c759] border-2 border-white dark:border-[#1c1c1e] flex items-center justify-center text-white">
              <UserCheck className="w-2.5 h-2.5" />
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-[#1c1c1e] dark:text-white group-hover:text-[#007aff] transition-colors truncate">
                {profile.name}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-[#8e8e93] shrink-0">
                {profile.incomeSource || 'Personal'}
              </span>
            </div>
            <p className="text-xs text-[#8e8e93] font-medium mt-0.5 truncate">
              {profile.savingsGoal ? profile.savingsGoal : (isMy ? 'ကိုယ်ပိုင် ဘဏ္ဍာရေး စီမံခန့်ခွဲမှု' : 'Personal Finance Ledger')}
            </p>
          </div>
        </div>
        <button
          id="settings-edit-profile-btn"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEditProfileClick();
          }}
          className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 bg-[#007aff]/10 hover:bg-[#007aff]/15 text-[#007aff] rounded-xl text-xs font-bold transition-all cursor-pointer border-0"
        >
          {t('viewProfile')}
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* iOS Settings Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#8e8e93] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isMy ? 'ဆက်တင်များကို ရှာဖွေပါ...' : 'Search settings options...'}
          className="w-full pl-10 pr-9 py-2.5 bg-black/5 dark:bg-white/10 rounded-2xl text-xs font-medium text-[#1c1c1e] dark:text-[#f2f2f7] placeholder-[#8e8e93] focus:outline-none focus:ring-2 focus:ring-[#007aff]/40 transition-all border-0"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* iOS Grouped Inset Settings List */}
      <div className="space-y-6">
        {filteredGroups.length === 0 ? (
          <div className="p-8 text-center ios-glass rounded-[2rem] space-y-2">
            <SlidersHorizontal className="w-8 h-8 text-[#8e8e93] mx-auto opacity-50" />
            <p className="text-xs font-bold text-[#8e8e93]">
              {isMy ? 'ရှာဖွေမှုနှင့် ကိုက်ညီသော ဆက်တင် မတွေ့ရှိပါ' : 'No settings found matching your search'}
            </p>
          </div>
        ) : (
          filteredGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#8e8e93] px-3">
                {group.title}
              </h3>
              <div className="ios-glass rounded-[1.5rem] border border-black/5 dark:border-white/5 overflow-hidden divide-y divide-black/5 dark:divide-white/5 shadow-xs">
                {group.items.map((item) => {
                  const IconComp = item.icon;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      id={item.id}
                      onClick={item.action}
                      aria-label={item.ariaLabel || item.title}
                      className="w-full text-left p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group border-0 bg-transparent font-normal"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${item.iconBg} text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform`}>
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-[#1c1c1e] dark:text-[#f2f2f7] group-hover:text-[#007aff] transition-colors truncate">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-[#8e8e93] font-medium truncate mt-0.5">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#8e8e93] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {/* Compact Developer Footer Card */}
        <div className="p-4 ios-glass rounded-[1.5rem] border border-black/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#007aff]/10 text-[#007aff] flex items-center justify-center shrink-0 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1c1c1e] dark:text-white">
                Developed by <span className="text-[#007aff]">Kyaw Zin Hein</span>
              </p>
              <a
                href="mailto:kyawzinhein.developer@gmail.com"
                className="text-[11px] text-[#8e8e93] hover:text-[#007aff] transition-colors font-mono"
              >
                kyawzinhein.developer@gmail.com
              </a>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#8e8e93] bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-lg self-start sm:self-auto">
            © {new Date().getFullYear()} Money Manager {APP_VERSION}
          </span>
        </div>
      </div>
    </div>
  );
});
