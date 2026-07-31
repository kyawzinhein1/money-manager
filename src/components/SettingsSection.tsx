import React, { useState, useMemo } from 'react';
import {
  Globe,
  FolderKanban,
  Database,
  RefreshCw,
  Mail,
  Smartphone,
  ChevronRight,
  UserCheck
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
  readAlertIds: string[];
  onUpdateLanguage: (lang: Language) => void;
  onUpdateCurrency: (code: string, symbol: string, name: string) => void;
  onUpdateTheme: (theme: 'light' | 'dark') => void;
  onUpdateBalanceMethod?: (method: BalanceMethod) => void;
  onUpdateNavbarSettings?: (navbarSettings: NavbarSettings) => void;
  onAddCategory: (type: 'expense' | 'income', category: string, color?: string) => void;
  onDeactivateCategory?: (type: 'expense' | 'income', category: string) => void;
  onReactivateCategory?: (type: 'expense' | 'income', category: string) => void;
  onDeleteCategoryPermanently?: (type: 'expense' | 'income', category: string) => void;
  onUpdateCategoryColor?: (category: string, color: string) => void;
  onDeleteCategory: (type: 'expense' | 'income', category: string) => void;
  onEditProfileClick: () => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
  onLoadDemoData: () => void;
  onClearAllData: () => void;
  onResetSettings?: () => void;
  onRestoreBackup: (backupData: any) => boolean;
  onUpdateRawKey?: (key: string, value: any) => void;
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

type SettingTab = 'all' | 'general' | 'customize' | 'data' | 'about';

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
  onDeleteCategory,
  onEditProfileClick,
  onExportCSV,
  onExportPDF,
  onLoadDemoData,
  onClearAllData,
  onResetSettings,
  onRestoreBackup
}) => {
  const [showManageCategories, setShowManageCategories] = useState(false);
  const [showDatabaseConsole, setShowDatabaseConsole] = useState(false);
  const [showCustomizerNav, setShowCustomizerNav] = useState(false);
  const [showCheckUpdates, setShowCheckUpdates] = useState(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('mm_open_updates_on_load') === 'true') {
      localStorage.removeItem('mm_open_updates_on_load');
      return true;
    }
    return false;
  });

  const customCurrency: Currency = useMemo(() => ({
    code: settings.currency || 'MMK',
    symbol: PRESET_CURRENCIES.find((c) => c.code === settings.currency)?.symbol || 'Ks',
    name: PRESET_CURRENCIES.find((c) => c.code === settings.currency)?.name || 'Local Currency'
  }), [settings.currency]);

  const totalCategoriesCount = useMemo(() => 
    incomeCategories.length + expenseCategories.length,
    [incomeCategories.length, expenseCategories.length]
  );

  // Sub-view: Manage Categories
  if (showManageCategories) {
    return (
      <ManageCategoriesView
        t={t}
        settings={settings}
        incomeCategories={incomeCategories}
        expenseCategories={expenseCategories}
        inactiveIncomeCategories={inactiveIncomeCategories}
        inactiveExpenseCategories={inactiveExpenseCategories}
        categoryColors={categoryColors}
        onAddCategory={onAddCategory}
        onDeactivateCategory={onDeactivateCategory}
        onReactivateCategory={onReactivateCategory}
        onDeleteCategoryPermanently={onDeleteCategoryPermanently}
        onUpdateCategoryColor={onUpdateCategoryColor}
        onDeleteCategory={onDeleteCategory}
        onClose={() => {
          setShowManageCategories(false);
          window.scrollTo({ top: 0, behavior: 'instant' });
        }}
      />
    );
  }

  // Sub-view: Check Updates
  if (showCheckUpdates) {
    return (
      <CheckUpdatesView
        t={t}
        settings={settings}
        onClose={() => {
          setShowCheckUpdates(false);
          window.scrollTo({ top: 0, behavior: 'instant' });
        }}
      />
    );
  }

  // Sub-view: Database Console
  if (showDatabaseConsole) {
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
        onClose={() => {
          setShowDatabaseConsole(false);
          window.scrollTo({ top: 0, behavior: 'instant' });
        }}
        onLoadDemoData={onLoadDemoData}
        onClearAllData={onClearAllData}
        onResetSettings={onResetSettings}
        onRestoreBackup={onRestoreBackup}
      />
    );
  }

  // Sub-view: Customize Bottom Navbar
  if (showCustomizerNav) {
    return (
      <BottomNavCustomizerView
        t={t}
        settings={settings}
        onUpdateNavbarSettings={onUpdateNavbarSettings}
        onClose={() => {
          setShowCustomizerNav(false);
          window.scrollTo({ top: 0, behavior: 'instant' });
        }}
      />
    );
  }

  const isMy = settings.language === 'my';

  return (
    <div className="space-y-6" id="settings-section">
      {/* Settings Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black tracking-tight text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#007aff]" />
            {t('settings')}
          </h2>
          <p className="text-xs text-[#8e8e93]">
            {isMy
              ? 'အက်ပ်၏ လုပ်ဆောင်ချက်များ၊ ငွေကြေးအမျိုးအစား၊ ကဏ္ဍများနှင့် ဒေတာများကို စိတ်ကြိုက် ပြင်ဆင်ပါ'
              : 'Preferences, language, currency, categories, customization, and data backup'}
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
        className="p-5 ios-glass rounded-[2rem] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs cursor-pointer hover:border-[#007aff]/30 transition-all border border-black/5 dark:border-white/5 group"
      >
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <img
              src={profile.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={profile.name}
              referrerPolicy="no-referrer"
              className="w-13 h-13 rounded-2xl object-cover border-2 border-white dark:border-[#2c2c2e] shadow-sm bg-slate-100 group-hover:scale-105 transition-transform"
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#34c759] border-2 border-white dark:border-[#1c1c1e] flex items-center justify-center text-white">
              <UserCheck className="w-2.5 h-2.5" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-[#1c1c1e] dark:text-white group-hover:text-[#007aff] transition-colors">
                {profile.name}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-[#8e8e93]">
                {profile.incomeSource || 'Personal Finance'}
              </span>
            </div>
            <p className="text-xs text-[#8e8e93] font-medium mt-0.5">
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
          className="self-start sm:self-auto shrink-0 whitespace-nowrap flex items-center gap-1.5 px-4 py-2 bg-[#007aff]/10 hover:bg-[#007aff]/15 text-[#007aff] rounded-xl text-xs font-bold transition-all cursor-pointer border-0"
        >
          {t('editProfile')}
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Setting Sections */}
      <div className="space-y-6">
        {/* SECTION 1: General Preferences & Currency */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#8e8e93] px-1">
            <Globe className="w-3.5 h-3.5 text-[#007aff]" />
            <span>{isMy ? 'အထွေထွေ ပုံစံနှင့် ငွေကြေး သတ်မှတ်ချက်များ' : 'General Preferences & Currency'}</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GeneralPreferencesView
              t={t}
              settings={settings}
              onUpdateLanguage={onUpdateLanguage}
              onUpdateTheme={onUpdateTheme}
              onUpdateBalanceMethod={onUpdateBalanceMethod}
              onResetSettings={onResetSettings}
            />

            <CurrencySettingsView
              t={t}
              settings={settings}
              customCurrency={customCurrency}
              presetCurrencies={PRESET_CURRENCIES}
              onUpdateCurrency={onUpdateCurrency}
            />
          </div>
        </div>

        {/* SECTION 2: Customization & Navigation */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#8e8e93] px-1 pt-2">
            <Smartphone className="w-3.5 h-3.5 text-[#007aff]" />
            <span>{isMy ? 'ကဏ္ဍနှင့် မိုဘိုင်း အလှဆင် ပြင်ဆင်မှုများ' : 'Categories & Mobile Navigation'}</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Management Tile */}
            <div className="p-5 ios-glass rounded-[2rem] space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
                    <FolderKanban className="w-4 h-4 text-[#007aff]" />
                    {t('manageCategories')}
                  </h3>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#007aff]/10 text-[#007aff]">
                    {totalCategoriesCount} {isMy ? 'ကဏ္ဍ' : 'Categories'}
                  </span>
                </div>
                <p className="text-xs text-[#8e8e93] mt-2 leading-relaxed">
                  {t('manageCategoriesDesc')}
                </p>
              </div>
              <button
                id="open-manage-categories-btn"
                type="button"
                onClick={() => {
                  setShowManageCategories(true);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#007aff]/10 hover:bg-[#007aff]/15 text-[#007aff] rounded-2xl text-xs font-bold transition-all cursor-pointer border-0 mt-2"
              >
                <FolderKanban className="w-4 h-4" />
                {t('openManageCategories')}
              </button>
            </div>

            {/* Mobile Bottom Navbar Customizer Card */}
            <div className="p-5 ios-glass rounded-[2rem] space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#007aff]" />
                    {isMy ? 'မိုဘိုင်း Bottom Navbar ပြင်ဆင်ရန်' : 'Customize Mobile Navigation'}
                  </h3>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#007aff]/10 text-[#007aff] uppercase">
                    {isMy ? 'မိုဘိုင်း' : 'Mobile'}
                  </span>
                </div>
                <p className="text-xs text-[#8e8e93] mt-2 leading-relaxed">
                  {isMy
                    ? 'မိုဘိုင်းဖုန်းစခရင်တွင် ပြသမည့် Bottom Navigation Bar ၏ အရောင်၊ ကြည်လင်မှု၊ အိုင်ကွန်များနှင့် ပုံစံများ စိတ်ကြိုက် ပြင်ဆင်ပါ။'
                    : 'Customize bottom navigation bar colors, transparency, blur, active icons, shapes, and borders for mobile screens.'}
                </p>
              </div>
              <button
                id="open-customize-navbar-btn"
                type="button"
                onClick={() => {
                  setShowCustomizerNav(true);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#007aff]/10 hover:bg-[#007aff]/15 text-[#007aff] rounded-2xl text-xs font-bold transition-all cursor-pointer border-0 mt-2"
              >
                <Smartphone className="w-4 h-4" />
                {isMy ? 'Navbar စိတ်ကြိုက် ပြင်ဆင်ရန်' : 'Customize Mobile Navbar'}
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 3: Data, Export & Ledger Database */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#8e8e93] px-1 pt-2">
            <Database className="w-3.5 h-3.5 text-[#007aff]" />
            <span>{isMy ? 'ဒေတာ ထုတ်ယူမှုနှင့် ဒေတာဘေ့စ် စီမံခန့်ခွဲမှု' : 'Data Export & Database Ledger'}</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExportDataView
              t={t}
              onExportCSV={onExportCSV}
              onExportPDF={onExportPDF}
            />

            {/* Database & Console Card */}
            <div className="p-5 ios-glass rounded-[2rem] space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#007aff]" />
                    {isMy ? 'ဒေတာဘေ့စ်နှင့် စာရင်းထိန်းသိမ်းမှု' : 'Database & Ledger Console'}
                  </h3>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#34c759]/10 text-[#34c759]">
                    JSON Ledger
                  </span>
                </div>
                <p className="text-xs text-[#8e8e93] mt-2 leading-relaxed">
                  {isMy
                    ? 'လိုင်းမဲ့ဒေတာများကို တိုက်ရိုက်ပြင်ဆင်ရန်၊ အရန်သင့်သိမ်းဆည်းရန်နှင့် စမ်းသပ်ဒေတာများ ထည့်သွင်းရန် ဤနေရာကိုနှိပ်ပါ။'
                    : 'Inspect and edit raw offline JSON data tables, download backups, import ledger files, or reset app datasets.'}
                </p>
              </div>
              <button
                id="open-database-console-btn"
                type="button"
                onClick={() => {
                  setShowDatabaseConsole(true);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#007aff]/10 hover:bg-[#007aff]/15 text-[#007aff] rounded-2xl text-xs font-bold transition-all cursor-pointer border-0 mt-2"
              >
                <Database className="w-4 h-4" />
                {isMy ? 'ဒေတာဘေ့စ် ကွန်ဆိုးလ် ဖွင့်ရန်' : 'Open Database & Ledger Console'}
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 4: Application Version & Developer Info */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#8e8e93] px-1 pt-2">
            <RefreshCw className="w-3.5 h-3.5 text-[#007aff]" />
            <span>{isMy ? 'အက်ပ် အချက်အလက်နှင့် ဖန်တီးသူ မူပိုင်ခွင့်' : 'App Information & Developer Info'}</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* App Updates Tile */}
            <div className="p-5 ios-glass rounded-[2rem] space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-[#007aff]" />
                    {isMy ? 'ဗားရှင်းနှင့် အပ်ဒိတ် စစ်ဆေးရန်' : 'App Updates & Version Info'}
                  </h3>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#007aff]/10 text-[#007aff] font-mono">
                    {APP_VERSION}
                  </span>
                </div>
                <p className="text-xs text-[#8e8e93] mt-2 leading-relaxed">
                  {isMy
                    ? 'အက်ပ်၏ နောက်ဆုံးထွက် ဗားရှင်းနှင့် ပြင်ဆင်ချက်များ၊ လုပ်ဆောင်ချက်အသစ်များကို စစ်ဆေးရန် ဤနေရာတွင် နှိပ်ပါ။'
                    : 'Check for the latest application version, new features, and recent release notes.'}
                </p>
              </div>
              <button
                id="open-check-updates-btn"
                type="button"
                onClick={() => {
                  setShowCheckUpdates(true);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#007aff]/10 hover:bg-[#007aff]/15 text-[#007aff] rounded-2xl text-xs font-bold transition-all cursor-pointer border-0 mt-2"
              >
                <RefreshCw className="w-4 h-4" />
                {isMy ? 'အပ်ဒိတ်များ စစ်ဆေးမည်' : 'Check for Updates & Release Notes'}
              </button>
            </div>

            {/* Developer & Copyright Card */}
            <div className="p-5 ios-glass rounded-[2rem] space-y-3 border border-black/5 dark:border-white/5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-[#8e8e93]">
                    {isMy ? 'ဖန်တီးသူ မူပိုင်ခွင့်' : 'Developer & Rights'}
                  </h4>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#007aff]/10 text-[#007aff] font-mono whitespace-nowrap">
                    All Rights Reserved
                  </span>
                </div>
                <p className="text-sm font-bold text-[#1c1c1e] dark:text-white mt-1">
                  Developed by <span className="text-[#007aff]">Kyaw Zin Hein</span>
                </p>
                <a
                  href="mailto:kyawzinhein.developer@gmail.com"
                  className="inline-flex items-center gap-1.5 text-xs text-[#8e8e93] hover:text-[#007aff] transition-colors mt-1.5 font-mono"
                >
                  <Mail className="w-3.5 h-3.5" />
                  kyawzinhein.developer@gmail.com
                </a>
              </div>
              <p className="text-[11px] text-[#8e8e93] border-t border-black/5 dark:border-white/5 pt-2.5 mt-2 font-medium">
                © {new Date().getFullYear()} Money Manager. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
