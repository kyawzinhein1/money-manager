import React, { useState } from 'react';
import { Coins, Sparkles, ChevronDown, Check } from 'lucide-react';
import { Currency, Settings } from '../../types';

interface CurrencySettingsViewProps {
  t: (key: string) => string;
  settings: Settings;
  customCurrency: Currency;
  presetCurrencies: Currency[];
  onUpdateCurrency: (code: string, symbol: string, name: string) => void;
}

export const CurrencySettingsView: React.FC<CurrencySettingsViewProps> = ({
  t,
  settings,
  customCurrency,
  presetCurrencies,
  onUpdateCurrency,
}) => {
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);

  return (
    <div className={`p-5 ios-glass rounded-[2rem] space-y-5 relative transition-all duration-200 ${showCurrencyMenu ? 'z-50' : 'z-10'}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
          <Coins className="w-4 h-4 text-[#007aff]" />
          {t('currency')}
        </h3>
        <span className="text-[10px] bg-[#007aff]/10 text-[#007aff] border border-[#007aff]/20 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5" />
          Flexible
        </span>
      </div>

      {/* Currency Selection Dropdown */}
      <div className="space-y-2 flex flex-col relative" id="currency-dropdown-container">
        <label className="text-xs font-bold text-[#8e8e93]">
          {settings.language === 'my' ? 'ငွေကြေးရွေးချယ်ရန်' : 'Select Preferred Currency'}
        </label>
        
        <button
          id="currency-dropdown-btn"
          type="button"
          onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
          className="w-full h-11 px-4.5 bg-[#f2f2f7] dark:bg-[#2c2c2e] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] rounded-2xl flex items-center justify-between text-xs md:text-sm font-semibold text-[#1c1c1e] dark:text-[#f2f2f7] transition-all cursor-pointer border-0"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-[#007aff]/10 text-[#007aff] flex items-center justify-center font-sans font-bold text-xs shrink-0">
              {customCurrency.symbol}
            </span>
            <span>
              {customCurrency.code} - {customCurrency.name}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-[#8e8e93] transition-transform duration-200 ${showCurrencyMenu ? 'rotate-180' : ''}`} />
        </button>

        {showCurrencyMenu && (
          <>
            <div
              className="fixed inset-0 z-30 bg-transparent"
              onClick={() => setShowCurrencyMenu(false)}
            />
            <div
              className="absolute left-0 right-0 top-full mt-2 rounded-2xl bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-3xl border border-white/50 dark:border-white/12 shadow-2xl z-40 p-2 space-y-0.5 max-h-60 overflow-y-auto scrollbar-thin"
            >
              <div className="px-3 py-1.5 text-[10px] font-extrabold text-[#8e8e93] uppercase tracking-wider">
                {settings.language === 'my' ? 'ငွေကြေးအမျိုးအစားရွေးချယ်ရန်' : 'Choose Currency'}
              </div>

              {presetCurrencies.map((curr) => {
                const isSelected = customCurrency.code === curr.code;
                return (
                  <button
                    key={curr.code}
                    id={`preset-curr-${curr.code}`}
                    type="button"
                    onClick={() => {
                      onUpdateCurrency(curr.code, curr.symbol, curr.name);
                      setShowCurrencyMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-all text-left cursor-pointer border-0 bg-transparent ${
                      isSelected ? 'text-[#007aff]' : 'text-[#1c1c1e] dark:text-[#f2f2f7]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-sans font-bold text-xs shrink-0 ${
                        isSelected ? 'bg-[#007aff]/10 text-[#007aff]' : 'bg-black/[0.03] dark:bg-white/[0.05] text-[#8e8e93]'
                      }`}>
                        {curr.symbol}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold leading-tight">{curr.code}</p>
                        <p className="text-[10px] text-[#8e8e93] leading-none mt-1 truncate">{curr.name}</p>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#007aff] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
