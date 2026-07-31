import React, { useState } from 'react';
import { Sun, Moon, Globe, ChevronDown, Check, Wallet, Info, SlidersHorizontal } from 'lucide-react';
import { BalanceMethod, Language, Settings } from '../../types';

interface GeneralPreferencesViewProps {
  t: (key: string) => string;
  settings: Settings;
  onUpdateLanguage: (lang: Language) => void;
  onUpdateTheme: (theme: 'light' | 'dark') => void;
  onUpdateBalanceMethod?: (method: BalanceMethod) => void;
  onResetSettings?: () => void;
}

export const GeneralPreferencesView: React.FC<GeneralPreferencesViewProps> = ({
  t,
  settings,
  onUpdateLanguage,
  onUpdateTheme,
  onUpdateBalanceMethod,
  onResetSettings,
}) => {
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const currentBalanceMethod: BalanceMethod = settings.balanceMethod || 'all_time';

  return (
    <div className={`p-5 ios-glass rounded-[2rem] space-y-5 relative transition-all duration-200 ${showLanguageMenu ? 'z-50' : 'z-10'}`}>
      <h3 className="text-sm font-bold text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
        <Sun className="w-4 h-4 text-[#ff9500]" />
        General Preferences
      </h3>

      {/* Balance Calculation Method */}
      <div className="space-y-2.5 pb-2 border-b border-black/[0.05] dark:border-white/[0.05]">
        <label className="text-xs font-bold text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
          <Wallet className="w-4 h-4 text-[#007aff]" />
          <span>{t('balanceMethod')}</span>
        </label>

        <p className="text-[11px] text-[#8e8e93] leading-relaxed">
          {t('balanceMethodDesc')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {/* Cumulative All-Time Option */}
          <button
            type="button"
            onClick={() => onUpdateBalanceMethod && onUpdateBalanceMethod('all_time')}
            className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
              currentBalanceMethod === 'all_time'
                ? 'bg-[#007aff]/10 border-[#007aff] text-[#007aff]'
                : 'bg-[#f2f2f7]/70 dark:bg-[#2c2c2e]/70 border-transparent text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between font-extrabold text-xs mb-1">
              <span>{t('balanceMethodCumulative')}</span>
              {currentBalanceMethod === 'all_time' && <Check className="w-4 h-4 shrink-0 text-[#007aff]" />}
            </div>
            <p className="text-[10px] text-[#8e8e93] leading-snug">
              {settings.language === 'my'
                ? 'လွန်ခဲ့သော လကုန်မှရရှိသော လစာ/ဝင်ငွေများပါဝင်သော စုစုပေါင်းလက်ကျန်'
                : 'Accumulates overall net cash from all records'}
            </p>
          </button>

          {/* Monthly Selected Option */}
          <button
            type="button"
            onClick={() => onUpdateBalanceMethod && onUpdateBalanceMethod('monthly')}
            className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
              currentBalanceMethod === 'monthly'
                ? 'bg-[#007aff]/10 border-[#007aff] text-[#007aff]'
                : 'bg-[#f2f2f7]/70 dark:bg-[#2c2c2e]/70 border-transparent text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between font-extrabold text-xs mb-1">
              <span>{t('balanceMethodMonthly')}</span>
              {currentBalanceMethod === 'monthly' && <Check className="w-4 h-4 shrink-0 text-[#007aff]" />}
            </div>
            <p className="text-[10px] text-[#8e8e93] leading-snug">
              {settings.language === 'my'
                ? 'ရွေးချယ်ထားသော လတစ်ခုတည်းအတွက်သာ သီးသန့်တွက်ချက်ပါသည်'
                : 'Strictly sums selected month income minus expense'}
            </p>
          </button>
        </div>
      </div>

      {/* Language Selection */}
      <div className="space-y-2 flex flex-col relative" id="language-dropdown-container">
        <label className="text-xs font-bold text-[#8e8e93]">
          {t('language')}
        </label>
        
        <button
          id="language-dropdown-btn"
          type="button"
          onClick={() => setShowLanguageMenu(!showLanguageMenu)}
          className="w-full h-11 px-4.5 bg-[#f2f2f7] dark:bg-[#2c2c2e] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] rounded-2xl flex items-center justify-between text-xs md:text-sm font-semibold text-[#1c1c1e] dark:text-[#f2f2f7] transition-all cursor-pointer border-0"
        >
          <div className="flex items-center gap-2.5">
            <Globe className="w-4 h-4 text-[#007aff]" />
            <span>
              {settings.language === 'en' ? 'English' : 'မြန်မာ (Myanmar)'}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-[#8e8e93] transition-transform duration-200 ${showLanguageMenu ? 'rotate-180' : ''}`} />
        </button>

        {showLanguageMenu && (
          <>
            {/* Invisible click backdrop to close */}
            <div
              className="fixed inset-0 z-30 bg-transparent"
              onClick={() => setShowLanguageMenu(false)}
            />

            {/* Dropdown Card */}
            <div
              className="absolute left-0 right-0 top-full mt-2 rounded-2xl bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-3xl border border-white/50 dark:border-white/12 shadow-2xl z-40 p-2 space-y-0.5"
            >
              <div className="px-3 py-1.5 text-[10px] font-extrabold text-[#8e8e93] uppercase tracking-wider">
                {settings.language === 'my' ? 'ဘာသာစကားရွေးချယ်ရန်' : 'Choose Language'}
              </div>

              {/* English Option */}
              <button
                id="lang-opt-en"
                type="button"
                onClick={() => {
                  onUpdateLanguage('en');
                  setShowLanguageMenu(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-all text-left cursor-pointer border-0 bg-transparent ${
                  settings.language === 'en' ? 'text-[#007aff]' : 'text-[#1c1c1e] dark:text-[#f2f2f7]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    settings.language === 'en' ? 'bg-[#007aff]/10 text-[#007aff]' : 'bg-black/[0.03] dark:bg-white/[0.05] text-[#8e8e93]'
                  }`}>
                    EN
                  </div>
                  <div>
                    <p className="text-xs font-extrabold leading-tight">English</p>
                    <p className="text-[10px] text-[#8e8e93] leading-none mt-1">United States / Global</p>
                  </div>
                </div>
                {settings.language === 'en' && <Check className="w-4 h-4 text-[#007aff] shrink-0" />}
              </button>

              {/* Myanmar Option */}
              <button
                id="lang-opt-my"
                type="button"
                onClick={() => {
                  onUpdateLanguage('my');
                  setShowLanguageMenu(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-all text-left cursor-pointer border-0 bg-transparent ${
                  settings.language === 'my' ? 'text-[#007aff]' : 'text-[#1c1c1e] dark:text-[#f2f2f7]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    settings.language === 'my' ? 'bg-[#007aff]/10 text-[#007aff]' : 'bg-black/[0.03] dark:bg-white/[0.05] text-[#8e8e93]'
                  }`}>
                    MY
                  </div>
                  <div>
                    <p className="text-xs font-extrabold leading-tight">မြန်မာ (Myanmar)</p>
                    <p className="text-[10px] text-[#8e8e93] leading-none mt-1">Burmese / Localized</p>
                  </div>
                </div>
                {settings.language === 'my' && <Check className="w-4 h-4 text-[#007aff] shrink-0" />}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Theme Selector */}
      <div className="pt-3 border-t border-black/[0.05] dark:border-white/[0.05] space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
            <Sun className="w-4 h-4 text-[#ff9500] dark:hidden" />
            <Moon className="w-4 h-4 text-[#007aff] hidden dark:block" />
            <span>{t('theme')}</span>
          </label>
          <span className="text-[10px] text-[#007aff] bg-[#007aff]/10 border border-[#007aff]/20 px-2.5 py-0.5 rounded-lg font-extrabold">
            {settings.theme === 'dark' ? t('darkMode') : t('lightMode')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Light Mode Card */}
          <button
            id="theme-toggle-light"
            type="button"
            onClick={() => onUpdateTheme('light')}
            className={`relative p-3.5 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer text-center border-2 ${
              settings.theme === 'light'
                ? 'bg-white dark:bg-[#2c2c2e] border-[#007aff] shadow-md scale-[1.02]'
                : 'bg-[#f2f2f7]/70 dark:bg-[#1c1c1e]/70 border-transparent hover:border-black/10 dark:hover:border-white/10 opacity-70 hover:opacity-100'
            }`}
          >
            {settings.theme === 'light' && (
              <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#007aff] text-white flex items-center justify-center shadow-xs">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            )}

            <div className="w-full h-12 rounded-xl bg-gradient-to-b from-[#ffffff] to-[#f2f2f7] border border-black/10 p-2 flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between">
                <div className="w-3.5 h-3.5 rounded-full bg-[#ff9500] flex items-center justify-center">
                  <Sun className="w-2.5 h-2.5 text-white" />
                </div>
                <div className="w-8 h-1.5 rounded-full bg-black/15" />
              </div>
              <div className="space-y-1">
                <div className="w-full h-1.5 rounded-full bg-black/20" />
                <div className="w-2/3 h-1.5 rounded-full bg-[#007aff]/50" />
              </div>
            </div>

            <p className={`text-xs font-black ${settings.theme === 'light' ? 'text-[#1c1c1e] dark:text-[#f2f2f7]' : 'text-[#8e8e93]'}`}>
              {t('lightMode')}
            </p>
          </button>

          {/* Dark Mode Card */}
          <button
            id="theme-toggle-dark"
            type="button"
            onClick={() => onUpdateTheme('dark')}
            className={`relative p-3.5 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer text-center border-2 ${
              settings.theme === 'dark'
                ? 'bg-[#2c2c2e] border-[#007aff] shadow-md scale-[1.02]'
                : 'bg-[#f2f2f7]/70 dark:bg-[#1c1c1e]/70 border-transparent hover:border-black/10 dark:hover:border-white/10 opacity-70 hover:opacity-100'
            }`}
          >
            {settings.theme === 'dark' && (
              <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#007aff] text-white flex items-center justify-center shadow-xs">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            )}

            <div className="w-full h-12 rounded-xl bg-gradient-to-b from-[#1c1c1e] to-[#121214] border border-white/10 p-2 flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between">
                <div className="w-3.5 h-3.5 rounded-full bg-[#007aff] flex items-center justify-center">
                  <Moon className="w-2.5 h-2.5 text-white" />
                </div>
                <div className="w-8 h-1.5 rounded-full bg-white/20" />
              </div>
              <div className="space-y-1">
                <div className="w-full h-1.5 rounded-full bg-white/20" />
                <div className="w-2/3 h-1.5 rounded-full bg-[#007aff]/60" />
              </div>
            </div>

            <p className={`text-xs font-black ${settings.theme === 'dark' ? 'text-[#f2f2f7]' : 'text-[#8e8e93]'}`}>
              {t('darkMode')}
            </p>
          </button>
        </div>
      </div>

      {/* Reset Application Settings Action */}
      {onResetSettings && (
        <div className="pt-3 border-t border-black/[0.05] dark:border-white/[0.05]">
          <button
            id="general-reset-settings-btn"
            type="button"
            onClick={onResetSettings}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#ff9500]/10 hover:bg-[#ff9500]/20 text-[#ff9500] rounded-2xl text-xs font-bold transition-all cursor-pointer border-0"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{t('resetAppSettings')}</span>
          </button>
        </div>
      )}
    </div>
  );
};
