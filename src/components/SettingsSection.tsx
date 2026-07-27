import React, { useState } from 'react';
import {
  Globe,
  FolderKanban,
  Database
} from 'lucide-react';
import {
  Language,
  Settings,
  UserProfile,
  Transaction,
  Budget,
  Currency
} from '../types';
import { ManageCategoriesView } from './settings/ManageCategoriesView';
import { DatabaseConsoleView } from './settings/DatabaseConsoleView';
import { GeneralPreferencesView } from './settings/GeneralPreferencesView';
import { CurrencySettingsView } from './settings/CurrencySettingsView';
import { ExportDataView } from './settings/ExportDataView';

interface SettingsSectionProps {
  t: (key: string) => string;
  settings: Settings;
  profile: UserProfile;
  transactions: Transaction[];
  budgets: Budget[];
  incomeCategories: string[];
  expenseCategories: string[];
  readAlertIds: string[];
  onUpdateLanguage: (lang: Language) => void;
  onUpdateCurrency: (code: string, symbol: string, name: string) => void;
  onUpdateTheme: (theme: 'light' | 'dark') => void;
  onUpdateReminder?: (enabled: boolean, time: string, message: string) => void;
  onTriggerTestReminder?: () => void;
  onAddCategory: (type: 'expense' | 'income', category: string) => void;
  onDeleteCategory: (type: 'expense' | 'income', category: string) => void;
  onEditProfileClick: () => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
  onLoadDemoData: () => void;
  onClearAllData: () => void;
  onRestoreBackup: (backupData: any) => boolean;
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
  readAlertIds,
  onUpdateLanguage,
  onUpdateCurrency,
  onUpdateTheme,
  onUpdateReminder,
  onTriggerTestReminder,
  onAddCategory,
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
        onAddCategory={onAddCategory}
        onDeleteCategory={onDeleteCategory}
        onClose={() => {
          setShowManageCategories(false);
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
      <div className="p-5 ios-glass rounded-[2rem] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <img
            src={profile.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={profile.name}
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-2xl object-cover border-2 border-white dark:border-[#2c2c2e] shadow-sm bg-slate-100"
          />
          <div>
            <h3 className="text-sm font-bold text-[#1c1c1e] dark:text-white">
              {profile.name}
            </h3>
            <p className="text-xs text-[#8e8e93] font-medium">
              {profile.email} {profile.occupation ? `• ${profile.occupation}` : ''}
            </p>
          </div>
        </div>
        <button
          id="settings-edit-profile-btn"
          onClick={onEditProfileClick}
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
            onUpdateReminder={onUpdateReminder}
            onTriggerTestReminder={onTriggerTestReminder}
          />

          <CurrencySettingsView
            t={t}
            settings={settings}
            customCurrency={customCurrency}
            presetCurrencies={PRESET_CURRENCIES}
            onUpdateCurrency={onUpdateCurrency}
          />

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
        </div>
      </div>
    </div>
  );
});
