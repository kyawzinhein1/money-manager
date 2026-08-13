import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Check,
  AlertCircle,
  Clock,
  Sliders
} from 'lucide-react';
import { Budget, Language } from '../types';
import { TRANSLATIONS } from '../translations';
import { IOSDateRangePicker } from './IOSDateRangePicker';
import { getLocalDateStr } from '../utils/dateUtils';

interface EditBudgetSectionProps {
  language: Language;
  currencySymbol: string;
  currencyCode: string;
  expenseCategories?: string[];
  categoryColors?: Record<string, string>;
  categoryIcons?: Record<string, string>;
  selectedMonth: string;
  selectedYear: string;
  activeBudget?: Budget | null;
  onSaveBudget: (category: string, limit: number, monthKey?: string, startDate?: string, endDate?: string) => void;
  onCancel: () => void;
  formatAmount: (amount: number) => string;
}

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_NAMES_MY = [
  'ဇန်နဝါရီ', 'ဖေဖော်ဝါရီ', 'မတ်', 'ဧပြီ', 'မေ', 'ဇွန်',
  'ဇူလိုင်', 'သြဂုတ်', 'စက်တင်ဘာ', 'အောက်တိုဘာ', 'နိုဝင်ဘာ', 'ဒီဇင်ဘာ'
];

export const EditBudgetSection: React.FC<EditBudgetSectionProps> = React.memo(({
  language,
  currencySymbol,
  currencyCode,
  selectedMonth,
  selectedYear,
  activeBudget = null,
  onSaveBudget,
  onCancel,
}) => {
  const t = (key: string) => TRANSLATIONS[language][key] || key;

  // Form State
  const [periodType, setPeriodType] = useState<'monthly' | 'custom_range'>(
    activeBudget?.startDate && activeBudget?.endDate ? 'custom_range' : 'monthly'
  );

  const [amount, setAmount] = useState<string>(
    activeBudget ? activeBudget.limit.toString() : ''
  );

  const category = activeBudget ? activeBudget.category : 'Total';

  // Date states for custom range
  const todayStr = getLocalDateStr();
  const nextMonthStr = getLocalDateStr(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

  const [startDate, setStartDate] = useState<string>(
    activeBudget?.startDate || todayStr
  );
  const [endDate, setEndDate] = useState<string>(
    activeBudget?.endDate || nextMonthStr
  );

  // Validation errors
  const [errors, setErrors] = useState<{ amount?: string }>({});

  // Sync state if activeBudget prop changes
  useEffect(() => {
    if (activeBudget) {
      setAmount(activeBudget.limit.toString());
      if (activeBudget.startDate && activeBudget.endDate) {
        setPeriodType('custom_range');
        setStartDate(activeBudget.startDate);
        setEndDate(activeBudget.endDate);
      } else {
        setPeriodType('monthly');
      }
    }
  }, [activeBudget]);

  const handleClearAmount = () => {
    setAmount('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { amount?: string } = {};

    if (!amount.trim()) {
      newErrors.amount = t('validationAmountRequired');
    } else {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        newErrors.amount = t('validationAmountPositive');
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const finalAmount = parseFloat(amount);
    const monthKey = `${selectedYear}-${selectedMonth.padStart(2, '0')}`;

    if (periodType === 'monthly') {
      onSaveBudget(category, finalAmount, monthKey);
    } else {
      onSaveBudget(category, finalAmount, monthKey, startDate, endDate);
    }

    onCancel();
  };

  // Calculate days in period
  const getDaysInPeriod = () => {
    if (periodType === 'monthly') {
      const year = parseInt(selectedYear) || new Date().getFullYear();
      const month = parseInt(selectedMonth) || (new Date().getMonth() + 1);
      return new Date(year, month, 0).getDate();
    } else if (startDate && endDate) {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      const diffDays = Math.ceil((end - start) / (1000 * 3600 * 24)) + 1;
      return diffDays > 0 ? diffDays : 30;
    }
    return 30;
  };

  const daysInPeriod = getDaysInPeriod();

  const currentMonthIndex = parseInt(selectedMonth, 10) - 1;
  const monthName = language === 'my'
    ? (MONTH_NAMES_MY[currentMonthIndex] || selectedMonth)
    : (MONTH_NAMES_EN[currentMonthIndex] || selectedMonth);

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12 animate-in fade-in-50 slide-in-from-bottom-5 duration-300" id="edit-budget-section">
      
      {/* Header Panel */}
      <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.05] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2.5 font-sans">
            <div className="w-8 h-8 rounded-xl bg-[#007aff]/10 text-[#007aff] flex items-center justify-center shrink-0 border border-[#007aff]/20">
              <Sliders className="w-4.5 h-4.5" />
            </div>
            {activeBudget
              ? (language === 'my' ? 'ဘတ်ဂျက် ကန့်သတ်ချက် ပြင်ဆင်ရန်' : 'Edit Budget Limit')
              : (language === 'my' ? 'ဘတ်ဂျက် ကန့်သတ်ချက် သတ်မှတ်ရန်' : 'Set Budget Limit')}
          </h2>
          <p className="text-[11px] text-[#8e8e93] font-medium mt-0.5">
            {language === 'my'
              ? 'လစဉ် သို့မဟုတ် သီးသန့်ရက်စွဲအလိုက် အသုံးပြုနိုင်မည့် ပမာဏ ကန့်သတ်ချက် သတ်မှတ်ပါ'
              : 'Define target spending limits for monthly or custom date ranges'}
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="w-10 h-10 flex items-center justify-center bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white rounded-full transition-all cursor-pointer border-0 shrink-0"
          title="Close"
          id="close-budget-form-btn"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        
        {/* Period Segmented Toggle + Hero Budget Amount Card */}
        <div className="ios-glass p-6 sm:p-8 rounded-[2.25rem] border border-black/[0.04] dark:border-white/[0.08] shadow-lg shadow-black/[0.02] space-y-6 text-center">
          
          {/* iOS Master Segmented Control (Monthly vs Custom Range) */}
          <div className="max-w-sm mx-auto p-1.5 bg-black/[0.04] dark:bg-white/[0.06] rounded-2xl border border-black/[0.03] dark:border-white/[0.04] grid grid-cols-2 gap-1.5 shadow-inner">
            <button
              type="button"
              onClick={() => setPeriodType('monthly')}
              className={`py-2.5 px-4 text-xs font-black rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 border-0 ${
                periodType === 'monthly'
                  ? 'bg-white dark:bg-[#2c2c2e] text-[#007aff] shadow-md shadow-black/5 scale-[1.02]'
                  : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-[#f2f2f7] bg-transparent'
              }`}
            >
              <Calendar className="w-4 h-4 stroke-[2.5]" />
              {language === 'my' ? 'လစဉ် ဘတ်ဂျက်' : 'Monthly Budget'}
            </button>
            <button
              type="button"
              onClick={() => setPeriodType('custom_range')}
              className={`py-2.5 px-4 text-xs font-black rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 border-0 ${
                periodType === 'custom_range'
                  ? 'bg-white dark:bg-[#2c2c2e] text-[#007aff] shadow-md shadow-black/5 scale-[1.02]'
                  : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-[#f2f2f7] bg-transparent'
              }`}
            >
              <Clock className="w-4 h-4 stroke-[2.5]" />
              {language === 'my' ? 'ရက်စွဲအပိုင်းအခြား' : 'Custom Range'}
            </button>
          </div>

          {/* Large Hero Budget Limit Input */}
          <div className="space-y-3 py-2">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#8e8e93] block">
              {language === 'my' ? 'ဘတ်ဂျက် ကန့်သတ်ပမာဏ' : 'BUDGET LIMIT AMOUNT'}
            </span>

            <div className="relative flex items-center justify-center max-w-md mx-auto">
              <span className="text-2xl sm:text-3xl font-extrabold font-sans mr-2 text-[#007aff] select-none">
                {currencySymbol || currencyCode}
              </span>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) {
                    setErrors(prev => ({ ...prev, amount: undefined }));
                  }
                }}
                className="w-auto min-w-[120px] max-w-full text-4xl sm:text-5xl md:text-6xl font-sans font-extrabold text-center bg-transparent border-0 focus:outline-none focus:ring-0 p-0 caret-[#007aff] tracking-tight text-[#1c1c1e] dark:text-white"
                style={{ width: `${Math.max(amount.length * 28 + 40, 140)}px` }}
              />
              {amount && (
                <button
                  type="button"
                  onClick={handleClearAmount}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/15 dark:bg-white/10 dark:hover:bg-white/20 text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white transition-all cursor-pointer border-0 text-xs ml-2 shrink-0 shadow-2xs"
                  title="Clear Amount"
                >
                  ✕
                </button>
              )}
            </div>

            {errors.amount && (
              <div className="text-xs text-[#ff3b30] font-extrabold flex items-center justify-center gap-1.5 animate-bounce pt-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.amount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Period & Date Selector Card */}
        <div className="ios-glass p-6 rounded-[2.25rem] border border-black/[0.04] dark:border-white/[0.08] space-y-4 shadow-lg shadow-black/[0.02]">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#8e8e93] flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#007aff]" />
              {language === 'my' ? 'သက်ရောက်မည့် ကာလ' : 'Target Time Period'}
            </h3>
            <span className="text-[10px] font-extrabold text-[#8e8e93] font-sans">
              {periodType === 'monthly' ? `${monthName} ${selectedYear}` : `${startDate} ~ ${endDate}`}
            </span>
          </div>

          {periodType === 'monthly' ? (
            <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#007aff]/10 text-[#007aff] flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-black text-[#1c1c1e] dark:text-[#f2f2f7]">
                    {monthName} {selectedYear}
                  </div>
                  <div className="text-[11px] text-[#8e8e93] font-medium">
                    {language === 'my' ? `ဤလအပြည့် (${daysInPeriod} ရက်) အတွက် အကျုံးဝင်ပါသည်` : `Applies to entire month (${daysInPeriod} days)`}
                  </div>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#007aff]/15 text-[#007aff]">
                {language === 'my' ? 'လစဉ်' : 'Monthly'}
              </span>
            </div>
          ) : (
            <IOSDateRangePicker
              startDate={startDate}
              endDate={endDate}
              onChange={(start, end) => {
                setStartDate(start);
                setEndDate(end);
              }}
              language={language}
            />
          )}
        </div>

        {/* Action Buttons (Save & Cancel) */}
        <div className="pt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-1/3 h-13 flex items-center justify-center bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15 text-[#1c1c1e] dark:text-[#f2f2f7] rounded-2xl text-sm font-bold transition-all cursor-pointer border-0 active:scale-[0.98]"
          >
            {language === 'my' ? 'မလုပ်တော့ပါ' : 'Cancel'}
          </button>
          
          <button
            type="submit"
            className="w-2/3 h-13 flex items-center justify-center gap-2 rounded-2xl text-sm font-black text-white bg-[#007aff] hover:bg-[#0062cc] shadow-lg shadow-[#007aff]/25 transition-all cursor-pointer border-0 active:scale-[0.98]"
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>
              {activeBudget
                ? (language === 'my' ? 'ပြင်ဆင်ချက် သိမ်းမည်' : 'Save Changes')
                : (language === 'my' ? 'ဘတ်ဂျက် သတ်မှတ်မည်' : 'Save Budget')}
            </span>
          </button>
        </div>

      </form>

    </div>
  );
});
