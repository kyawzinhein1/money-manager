import React, { useState } from 'react';
import {
  Globe,
  FolderKanban,
  Database,
  RefreshCw,
  Mail,
  Smartphone
} from 'lucide-react';
import {
  Language,
  Settings,
  UserProfile,
  Transaction,
  Budget,
  Currency,
  NavbarSettings
} from '../types';
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

  const customCurrency: Currency = {
    code: settings.currency || 'MMK',
    symbol: PRESET_CURRENCIES.find((c) => c.code === settings.currency)?.symbol || 'Ks',
    name: PRESET_CURRENCIES.find((c) => c.code === settings.currency)?.name || 'Local Currency'
  };

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

  return (
    <div className="space-y-6" id="settings-section">
      {/* Settings Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#007aff]" />
          {t('settings')}
        </h2>
        <p className="text-xs text-[#8e8e93]">
          Preferences, language, currency, categories and data export
        </p>
      </div>

      {/* iOS Style Profile Card */}
      <div 
        onClick={onEditProfileClick}
        className="p-5 ios-glass rounded-[2rem] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs cursor-pointer hover:border-[#007aff]/30 transition-all border border-black/5 dark:border-white/5 group"
      >
        <div className="flex items-center gap-3.5">
          <img
            src={profile.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={profile.name}
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-2xl object-cover border-2 border-white dark:border-[#2c2c2e] shadow-sm bg-slate-100 group-hover:scale-105 transition-transform"
          />
          <div>
            <h3 className="text-sm font-bold text-[#1c1c1e] dark:text-white group-hover:text-[#007aff] transition-colors">
              {profile.name}
            </h3>
            <p className="text-xs text-[#8e8e93] font-medium">
              {profile.incomeSource || 'Personal Finance'} {profile.savingsGoal ? `• ${profile.savingsGoal}` : ''}
            </p>
          </div>
        </div>
        <button
          id="settings-edit-profile-btn"
          onClick={(e) => {
            e.stopPropagation();
            onEditProfileClick();
          }}
          className="self-start sm:self-auto shrink-0 whitespace-nowrap flex items-center gap-1 px-3.5 py-1.5 bg-[#007aff]/10 hover:bg-[#007aff]/15 text-[#007aff] rounded-xl text-xs font-bold transition-all cursor-pointer border-0"
        >
          {t('editProfile')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Preferences & Categories */}
        <div className="space-y-6">
          <GeneralPreferencesView
            t={t}
            settings={settings}
            onUpdateLanguage={onUpdateLanguage}
            onUpdateTheme={onUpdateTheme}
          />

          <CurrencySettingsView
            t={t}
            settings={settings}
            customCurrency={customCurrency}
            presetCurrencies={PRESET_CURRENCIES}
            onUpdateCurrency={onUpdateCurrency}
          />

          {/* Mobile Bottom Navbar Customizer Card */}
          <div className="p-5 ios-glass rounded-[2rem] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#007aff]" />
                {settings.language === 'my' ? 'မိုဘိုင်း Bottom Navbar ပြင်ဆင်ရန်' : 'Customize Bottom Navigation'}
              </h3>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#007aff]/10 text-[#007aff] uppercase">
                {settings.language === 'my' ? 'မိုဘိုင်း' : 'Mobile'}
              </span>
            </div>
            <p className="text-xs text-[#8e8e93] leading-relaxed">
              {settings.language === 'my'
                ? 'မိုဘိုင်းဖုန်းစခရင်တွင် ပြသမည့် Bottom Navigation Bar ၏ အရောင်၊ ကြည်လင်မှု၊ အိုင်ကွန်များနှင့် ပုံစံများ စိတ်ကြိုက် ပြင်ဆင်ပါ။ (PC စခရင်တွင် ပိတ်ထားပါသည်)'
                : 'Customize bottom navigation bar colors, transparency, blur, active icons, shapes, and borders for mobile screens (Disabled on PC screens).'}
            </p>
            <button
              id="open-customize-navbar-btn"
              onClick={() => {
                setShowCustomizerNav(true);
                window.scrollTo({ top: 0, behavior: 'instant' });
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#007aff]/10 hover:bg-[#007aff]/15 text-[#007aff] rounded-2xl text-xs font-bold transition-all cursor-pointer border-0"
            >
              <Smartphone className="w-4 h-4" />
              {settings.language === 'my' ? 'Navbar စိတ်ကြိုက် ပြင်ဆင်ရန်' : 'Customize Mobile Navbar'}
            </button>
          </div>

          {/* Manage Categories Tile */}
          <div className="p-5 ios-glass rounded-[2rem] space-y-4">
            <h3 className="text-sm font-bold text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-[#007aff]" />
              {t('manageCategories')}
            </h3>
            <p className="text-xs text-[#8e8e93]">
              {t('manageCategoriesDesc')}
            </p>
            <button
              id="open-manage-categories-btn"
              onClick={() => {
                setShowManageCategories(true);
                window.scrollTo({ top: 0, behavior: 'instant' });
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#007aff]/10 hover:bg-[#007aff]/15 text-[#007aff] rounded-2xl text-xs font-bold transition-all cursor-pointer border-0"
            >
              <FolderKanban className="w-4 h-4" />
              {t('openManageCategories')}
            </button>
          </div>
        </div>

        {/* Right Column: Export & Database Ledger */}
        <div className="space-y-6">
          <ExportDataView
            t={t}
            onExportCSV={onExportCSV}
            onExportPDF={onExportPDF}
          />

          {/* Database & Console Card */}
          <div className="p-5 ios-glass rounded-[2rem] space-y-4">
            <h3 className="text-sm font-bold text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
              <Database className="w-4 h-4 text-[#007aff]" />
              {settings.language === 'my' ? 'ဒေတာဘေ့စ်နှင့် စာရင်းထိန်းသိမ်းမှု' : 'Database & Ledger Console'}
            </h3>
            <p className="text-xs text-[#8e8e93] leading-relaxed">
              {settings.language === 'my'
                ? 'လိုင်းမဲ့ဒေတာများကို တိုက်ရိုက်ပြင်ဆင်ရန်၊ အရန်သင့်သိမ်းဆည်းရန်နှင့် စမ်းသပ်ဒေတာများ ထည့်သွင်းရန် ဤနေရာကိုနှိပ်ပါ။'
                : 'Inspect and edit raw offline JSON data tables, download backups, import ledger files, or reset app datasets.'}
            </p>
            <button
              id="open-database-console-btn"
              onClick={() => {
                setShowDatabaseConsole(true);
                window.scrollTo({ top: 0, behavior: 'instant' });
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#007aff]/10 hover:bg-[#007aff]/15 text-[#007aff] rounded-2xl text-xs font-bold transition-all cursor-pointer border-0 mt-2"
            >
              <Database className="w-4 h-4" />
              {settings.language === 'my' ? 'ဒေတာဘေ့စ် ကွန်ဆိုးလ် ဖွင့်ရန်' : 'Open Database & Ledger Console'}
            </button>
          </div>

          {/* App Updates & GitHub Deployment Tile */}
          <div className="p-5 ios-glass rounded-[2rem] space-y-4">
            <h3 className="text-sm font-bold text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#007aff]" />
              {settings.language === 'my' ? 'ဗားရှင်းနှင့် အပ်ဒိတ် စစ်ဆေးရန်' : 'App Updates & Deployment'}
            </h3>
            <p className="text-xs text-[#8e8e93] leading-relaxed">
              {settings.language === 'my'
                ? 'GitHub မှတစ်ဆင့် Domain တွင် ထုတ်လွှင့်ပြီးနောက် နောက်ဆုံးထွက် ပြင်ဆင်ချက်များနှင့် လုပ်ဆောင်ချက်အသစ်များကို ရယူရန် ဤနေရာတွင် စစ်ဆေးပါ။'
                : 'Check for newly published features, revalidate web bundle cache, and view release notes after deploying from GitHub.'}
            </p>
            <button
              id="open-check-updates-btn"
              onClick={() => {
                setShowCheckUpdates(true);
                window.scrollTo({ top: 0, behavior: 'instant' });
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#007aff]/10 hover:bg-[#007aff]/15 text-[#007aff] rounded-2xl text-xs font-bold transition-all cursor-pointer border-0 mt-2"
            >
              <RefreshCw className="w-4 h-4" />
              {settings.language === 'my' ? 'အပ်ဒိတ်များ စစ်ဆေးမည်' : 'Check for Updates & Release Notes'}
            </button>
          </div>

          {/* Developer & Copyright Card */}
          <div className="p-5 ios-glass rounded-[2rem] space-y-3 border border-black/5 dark:border-white/5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-wider text-[#8e8e93]">
                  {settings.language === 'my' ? 'ဖန်တီးသူ မူပိုင်ခွင့်' : 'Developer & Rights'}
                </h4>
                <p className="text-sm font-bold text-[#1c1c1e] dark:text-white mt-0.5">
                  Developed by <span className="text-[#007aff]">Kyaw Zin Hein</span>
                </p>
                <a
                  href="mailto:kyawzinhein.developer@gmail.com"
                  className="inline-flex items-center gap-1.5 text-xs text-[#8e8e93] hover:text-[#007aff] transition-colors mt-1 font-mono"
                >
                  <Mail className="w-3.5 h-3.5" />
                  kyawzinhein.developer@gmail.com
                </a>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#007aff]/10 text-[#007aff] font-mono whitespace-nowrap self-start sm:self-auto">
                All Rights Reserved
              </span>
            </div>
            <p className="text-[11px] text-[#8e8e93] border-t border-black/5 dark:border-white/5 pt-2.5 mt-1 font-medium">
              © {new Date().getFullYear()} Money Manager. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});
