import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  AlertCircle, 
  CheckCircle, 
  ShieldAlert, 
  PiggyBank, 
  Landmark, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Info,
  Clock,
  ArrowUpRight,
  Flame,
  Target,
  Zap,
  BarChart3,
  PieChart as PieIcon,
  X,
  Copy,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Budget, Transaction, Language } from '../types';
import { TRANSLATIONS, CATEGORY_TRANSLATIONS } from '../translations';
import { generateForecastReport } from '../utils/forecasting';
import { IOSDateRangePicker } from './IOSDateRangePicker';
import { findActiveBudget } from '../utils/budgetUtils';
import { getCategoryIcon } from '../utils/categoryIcon';
import { getCategoryStyle } from '../utils/categoryStyle';
import {
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Line,
  LineChart,
  XAxis,
  YAxis
} from 'recharts';

interface BudgetSectionProps {
  budgets: Budget[];
  transactions: Transaction[];
  currencySymbol: string;
  language: Language;
  onSaveBudget: (category: string, limit: number, monthKey?: string, startDate?: string, endDate?: string) => void;
  onDeleteBudget: (category: string, monthKey?: string) => void;
  formatAmount: (amount: number) => string;
  selectedMonth: string;
  selectedYear: string;
  categoryColors?: Record<string, string>;
  categoryIcons?: Record<string, string>;
  onEditBudgetTrigger?: (budgetToEdit?: Budget | null) => void;
}

export const BudgetSection: React.FC<BudgetSectionProps> = React.memo(({
  budgets,
  transactions,
  currencySymbol,
  language,
  onSaveBudget,
  onDeleteBudget,
  formatAmount,
  selectedMonth,
  selectedYear,
  categoryColors = {},
  categoryIcons = {},
  onEditBudgetTrigger,
}) => {
  const t = (key: string) => TRANSLATIONS[language][key] || key;
  const tc = (cat: string) => CATEGORY_TRANSLATIONS[language][cat] || cat;

  const currentMonthKey = `${selectedYear}-${selectedMonth.padStart(2, '0')}`;

  const activeBudget = React.useMemo(() => {
    return findActiveBudget(budgets, selectedMonth, selectedYear);
  }, [budgets, selectedMonth, selectedYear]);

  // Find previous month budget if available for 1-click copying
  const previousMonthBudget = React.useMemo(() => {
    if (activeBudget && activeBudget.month === currentMonthKey) return null;
    const monthBudgets = budgets.filter(b => b.month && b.month !== currentMonthKey);
    if (monthBudgets.length > 0) {
      return monthBudgets[monthBudgets.length - 1];
    }
    return budgets.find(b => !b.month) || null;
  }, [budgets, activeBudget, currentMonthKey]);

  const [budgetLimit, setBudgetLimit] = useState<string>(activeBudget ? activeBudget.limit.toString() : '');
  const [budgetType, setBudgetType] = useState<'monthly' | 'custom'>(
    activeBudget?.startDate && activeBudget?.endDate ? 'custom' : 'monthly'
  );
  const [customStartDate, setCustomStartDate] = useState<string>(
    activeBudget?.startDate || `${selectedYear}-${selectedMonth.padStart(2, '0')}-01`
  );
  const [customEndDate, setCustomEndDate] = useState<string>(
    activeBudget?.endDate || `${selectedYear}-${selectedMonth.padStart(2, '0')}-28`
  );
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [bentoTab, setBentoTab] = useState<'burn' | 'projection' | 'categories'>('burn');

  // Sync input when month selection or active budget changes
  React.useEffect(() => {
    if (!isEditing) {
      setBudgetLimit(activeBudget ? activeBudget.limit.toString() : '');
      setBudgetType(activeBudget?.startDate && activeBudget?.endDate ? 'custom' : 'monthly');
      if (activeBudget?.startDate && activeBudget?.endDate) {
        setCustomStartDate(activeBudget.startDate);
        setCustomEndDate(activeBudget.endDate);
      } else {
        const mNum = parseInt(selectedMonth, 10);
        const yNum = parseInt(selectedYear, 10);
        if (!isNaN(mNum) && !isNaN(yNum)) {
          const defaultStart = `${yNum}-${String(mNum).padStart(2, '0')}-01`;
          const lastDay = new Date(yNum, mNum, 0).getDate();
          const defaultEnd = `${yNum}-${String(mNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
          setCustomStartDate(defaultStart);
          setCustomEndDate(defaultEnd);
        }
      }
    }
  }, [activeBudget, isEditing, currentMonthKey, selectedMonth, selectedYear]);

  const forecast = React.useMemo(() => {
    return generateForecastReport(
      transactions,
      budgets,
      selectedMonth,
      selectedYear,
      formatAmount
    );
  }, [transactions, budgets, selectedMonth, selectedYear, formatAmount]);

  // Total expenses in the active range (only expense type)
  const totalSpent = React.useMemo(() => {
    return transactions
      .filter(tx => tx.type === 'expense')
      .filter(tx => {
        if (activeBudget?.startDate && activeBudget?.endDate) {
          return tx.date >= activeBudget.startDate && tx.date <= activeBudget.endDate;
        }
        return true;
      })
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions, activeBudget]);

  const getRangeLabel = () => {
    if (activeBudget?.startDate && activeBudget?.endDate) {
      return `${activeBudget.startDate} ~ ${activeBudget.endDate}`;
    }
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const mIdx = parseInt(selectedMonth) - 1;
    const mName = isNaN(mIdx) ? selectedMonth : t(monthNames[mIdx]);
    return `${mName} ${selectedYear}`;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetLimit.trim()) {
      setError(t('validationBudgetRequired'));
      return;
    }
    const limit = parseFloat(budgetLimit);
    if (isNaN(limit) || limit <= 0) {
      setError(t('validationBudgetPositive'));
      return;
    }
    if (budgetType === 'custom' && (!customStartDate || !customEndDate)) {
      setError(language === 'my' ? 'ရက်စွဲ ပမာဏ အပြည့်အစုံ ရွေးချယ်ပါ' : 'Please select both start and end dates');
      return;
    }
    setError(undefined);
    if (budgetType === 'custom') {
      onSaveBudget('Total', limit, currentMonthKey, customStartDate, customEndDate);
    } else {
      onSaveBudget('Total', limit, currentMonthKey, undefined, undefined);
    }
    setIsEditing(false);
  };

  const handleEditClick = () => {
    if (onEditBudgetTrigger) {
      onEditBudgetTrigger(activeBudget);
      return;
    }
    if (activeBudget) {
      setBudgetLimit(activeBudget.limit.toString());
    } else {
      setBudgetLimit('');
    }
    setError(undefined);
    setIsEditing(true);
  };

  // Get dynamic custom suggestions based on symbol
  const getSuggestedBudgets = () => {
    if (currencySymbol === 'K' || currencySymbol === 'Ks' || currencySymbol === 'MMK') {
      return [500000, 1000000, 2000000, 5000000];
    }
    if (currencySymbol === '฿') {
      return [10000, 25000, 50000, 100000];
    }
    return [500, 1000, 2500, 5000]; // USD, EUR, SGD etc.
  };

  // Category breakdown of the spent amount
  const { categorySpentList } = React.useMemo(() => {
    const spentMap: Record<string, number> = {};
    transactions
      .filter(tx => tx.type === 'expense')
      .forEach(tx => {
        spentMap[tx.category] = (spentMap[tx.category] || 0) + tx.amount;
      });

    const spentList = Object.entries(spentMap)
      .map(([category, spent]) => ({ category, spent }))
      .sort((a, b) => b.spent - a.spent);

    return { categorySpentList: spentList };
  }, [transactions]);

  const percent = React.useMemo(() => {
    return activeBudget && activeBudget.limit > 0 ? (totalSpent / activeBudget.limit) * 100 : 0;
  }, [activeBudget, totalSpent]);

  const isExceeded = React.useMemo(() => {
    return activeBudget ? totalSpent > activeBudget.limit : false;
  }, [activeBudget, totalSpent]);

  const remaining = React.useMemo(() => {
    return activeBudget ? activeBudget.limit - totalSpent : 0;
  }, [activeBudget, totalSpent]);

  // Days remaining & time offsets
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const currentYearInt = parseInt(selectedYear) || new Date().getFullYear();
  const currentMonthInt = parseInt(selectedMonth) || (new Date().getMonth() + 1);
  const totalDays = getDaysInMonth(currentYearInt, currentMonthInt);

  const today = new Date();
  const realYearStr = today.getFullYear().toString();
  const realMonthStr = (today.getMonth() + 1).toString().padStart(2, '0');
  const isCurrentSelected = selectedYear === realYearStr && selectedMonth === realMonthStr;

  let daysRemaining = totalDays;
  let currentDayOffset = today.getDate();

  if (isCurrentSelected) {
    daysRemaining = Math.max(1, totalDays - currentDayOffset + 1);
  } else {
    const isPast = currentYearInt < today.getFullYear() || 
      (currentYearInt === today.getFullYear() && currentMonthInt < (today.getMonth() + 1));
    daysRemaining = isPast ? 0 : totalDays;
    currentDayOffset = isPast ? totalDays : 1;
  }

  // Daily limits & current averages
  const dailyLimitAllowed = activeBudget ? activeBudget.limit / totalDays : 0;
  const dailyAllowanceRemaining = remaining > 0 && daysRemaining > 0 ? remaining / daysRemaining : 0;
  const currentDailyAvgSpent = totalSpent / Math.max(1, currentDayOffset);

  // Smart recommendations content builder
  const getSmartRecommendation = () => {
    if (!activeBudget) return null;

    if (isExceeded) {
      return {
        type: 'error',
        en: `You have exceeded your overall budget limit by ${formatAmount(Math.abs(remaining))}. We highly recommend freezing discretionary expenses immediately to re-balance.`,
        my: `သင်သည် သတ်မှတ်ဘတ်ဂျက်ထက် ${formatAmount(Math.abs(remaining))} ပိုမိုသုံးစွဲမိသွားပါပြီ။ ငွေရေးကြေးရေး ထိန်းညှိနိုင်ရန် မလိုအပ်သော ဝယ်ယူမှုများကို ခေတ္တရပ်ဆိုင်းထားရန် အကြံပြုအပ်ပါသည်။`
      };
    }

    if (percent > 85) {
      return {
        type: 'warning',
        en: `Critical Alert: You've utilized ${percent.toFixed(0)}% of your allowance with ${daysRemaining} days left. Limit non-essential purchases to ${formatAmount(dailyAllowanceRemaining)} per day to survive the month.`,
        my: `အရေးကြီး သတိပေးချက် - လကုန်ရန် ${daysRemaining} ရက်အလိုတွင် ဘတ်ဂျက်၏ ${percent.toFixed(0)}% အထိ သုံးစွဲပြီးပါပြီ။ လကုန်အထိ ရပ်တည်နိုင်ရန် တစ်နေ့လျှင် ${formatAmount(dailyAllowanceRemaining)} ထက် မပိုစေဘဲ ထိန်းသိမ်းသုံးစွဲပါ။`
      };
    }

    if (currentDailyAvgSpent > dailyLimitAllowed) {
      return {
        type: 'warning',
        en: `Your daily burn rate (${formatAmount(currentDailyAvgSpent)}/day) is pacing higher than your initial daily allowance (${formatAmount(dailyLimitAllowed)}/day). Try scaling back to ${formatAmount(dailyAllowanceRemaining)}/day.`,
        my: `သင့်နေ့စဉ်ပျမ်းမျှသုံးစွဲမှု (${formatAmount(currentDailyAvgSpent)}/ရက်) သည် သတ်မှတ်ထားသောစံနှုန်း (${formatAmount(dailyLimitAllowed)}/ရက်) ထက် ပိုမိုမြင့်မားနေပါသည်။ ကျန်ရက်များအတွက် တစ်နေ့လျှင် ${formatAmount(dailyAllowanceRemaining)} ဝန်းကျင်သာ သုံးစွဲပါ။`
      };
    }

    return {
      type: 'success',
      en: `Fantastic financial discipline! Your daily burn rate (${formatAmount(currentDailyAvgSpent)}/day) is well under control. You can safely spend up to ${formatAmount(dailyAllowanceRemaining)}/day.`,
      my: `အသုံးစရိတ် စည်းကမ်းကောင်းမွန်မှု အလွန်ထူးချွန်ပါသည်။ သင့်နေ့စဉ်ပျမ်းမျှသုံးစွဲမှု (${formatAmount(currentDailyAvgSpent)}/ရက်) သည် အကောင်းဆုံးအခြေအနေတွင် ရှိပြီး တစ်နေ့လျှင် ${formatAmount(dailyAllowanceRemaining)} အထိ အန္တရာယ်ကင်းစွာ သုံးစွဲနိုင်ပါသည်။`
    };
  };

  const advice = getSmartRecommendation();

  return (
    <div className="space-y-6" id="budget-section">
      {/* Dynamic Professional Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-black/5 dark:border-white/5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2.5 font-sans">
                <div className="w-8 h-8 rounded-xl bg-[#007aff]/10 text-[#007aff] flex items-center justify-center shrink-0 border border-[#007aff]/20">
                  <Landmark className="w-4.5 h-4.5" />
                </div>
                {t('budgets')}
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#007aff]/10 text-[#007aff] border border-[#007aff]/20">
                  <Calendar className="w-3 h-3" />
                  {getRangeLabel()}
                </span>
              </h2>
              <p className="text-xs text-[#8e8e93] font-medium">
                {language === 'my' ? 'လစဉ် သုံးစွဲမှု ကန့်သတ်ချက်နှင့် အသုံးစရိတ် ထိန်းချုပ်မှု' : 'Smart spending limits & daily financial velocity tracking'}
              </p>
            </div>
          </div>
        </div>

        {/* Primary Action Control */}
        {!activeBudget && (
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              id="set-budget-header-btn"
              type="button"
              onClick={handleEditClick}
              className="flex items-center justify-center gap-2 h-10 px-5 bg-[#007aff] hover:bg-[#007aff]/90 text-white rounded-full text-xs font-bold shadow-md shadow-[#007aff]/20 transition-all cursor-pointer active:scale-95 border-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{t('setBudget')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Set/Edit Budget Modal / Slide-down */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-white dark:bg-[#1c1c1e] rounded-[2.5rem] shadow-2xl p-6 sm:p-7 border border-white/20 dark:border-white/10 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Title */}
              <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#007aff]/10 text-[#007aff] rounded-2xl">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#1c1c1e] dark:text-white">
                      {activeBudget ? t('updateBudget') : t('setOverallBudget')}
                    </h3>
                    <p className="text-xs text-[#8e8e93] font-medium">
                      {getRangeLabel()}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white flex items-center justify-center transition-all cursor-pointer border-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form id="budget-form" onSubmit={handleFormSubmit} noValidate className="space-y-5">
                {/* Immersive Amount Section */}
                <div className="p-6 rounded-[2rem] bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 text-center space-y-3">
                  <span className="text-[10px] uppercase tracking-wider font-black text-[#8e8e93] block">
                    {language === 'my' ? 'သတ်မှတ် ဘတ်ဂျက် ပမာဏ' : 'TOTAL SPENDING LIMIT'}
                  </span>

                  <div className="relative flex items-center justify-center max-w-xs mx-auto">
                    <input
                      id="budget-amount-input"
                      type="number"
                      min="1"
                      step="any"
                      required
                      placeholder="0"
                      value={budgetLimit}
                      onChange={(e) => {
                        setBudgetLimit(e.target.value);
                        if (error) setError(undefined);
                      }}
                      className="w-full text-4xl sm:text-5xl font-sans font-black text-center text-[#1c1c1e] dark:text-white bg-transparent border-0 focus:outline-none focus:ring-0 p-0 caret-[#007aff]"
                      style={{ width: `${Math.max(budgetLimit.length * 24 + 40, 120)}px`, maxWidth: '100%' }}
                    />
                    {budgetLimit && (
                      <button
                        type="button"
                        onClick={() => {
                          setBudgetLimit('');
                          setError(undefined);
                        }}
                        className="w-6 h-6 flex items-center justify-center rounded-full bg-black/10 dark:bg-white/20 text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white transition-all cursor-pointer border-0 text-[10px] ml-1 shrink-0"
                        title="Clear Amount"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[11px] text-[#ff3b30] font-extrabold flex items-center justify-center gap-1.5 pt-1"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </div>

                {/* Quick Selection Presets */}
                <div className="space-y-1.5">
                  <span className="block text-[10px] text-[#8e8e93] font-black uppercase tracking-wider">
                    {language === 'en' ? 'Quick preset suggestions' : 'အကြံပြုချက် ပမာဏများ'}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {getSuggestedBudgets().map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => {
                          setBudgetLimit(amount.toString());
                          setError(undefined);
                        }}
                        className={`py-2.5 px-3 rounded-2xl text-xs font-black transition-all border cursor-pointer active:scale-95 ${
                          budgetLimit === amount.toString()
                            ? 'bg-[#007aff] text-white border-transparent shadow-sm'
                            : 'bg-black/5 dark:bg-white/5 text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white border-transparent hover:bg-black/10'
                        }`}
                      >
                        {amount.toLocaleString()} {currencySymbol}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget Period Selection */}
                <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] space-y-3 border border-black/5 dark:border-white/5">
                  <span className="block text-[10px] text-[#8e8e93] font-black uppercase tracking-wider">
                    {t('budgetPeriod')}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBudgetType('monthly')}
                      className={`p-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                        budgetType === 'monthly'
                          ? 'bg-[#007aff] text-white border-transparent shadow-xs'
                          : 'bg-black/5 dark:bg-white/5 text-[#8e8e93] border-transparent hover:text-[#1c1c1e] dark:hover:text-white'
                      }`}
                    >
                      {t('budgetMonthly')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBudgetType('custom')}
                      className={`p-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                        budgetType === 'custom'
                          ? 'bg-[#007aff] text-white border-transparent shadow-xs'
                          : 'bg-black/5 dark:bg-white/5 text-[#8e8e93] border-transparent hover:text-[#1c1c1e] dark:hover:text-white'
                      }`}
                    >
                      {t('budgetCustomRange')}
                    </button>
                  </div>

                  {budgetType === 'custom' && (
                    <div className="pt-2">
                      <IOSDateRangePicker
                        startDate={customStartDate}
                        endDate={customEndDate}
                        onChange={(s, e) => {
                          setCustomStartDate(s);
                          setCustomEndDate(e);
                        }}
                        language={language}
                      />
                    </div>
                  )}
                </div>

                {/* Submit Controls */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/5 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 bg-black/5 dark:bg-white/10 hover:bg-black/10 text-[#1c1c1e] dark:text-white rounded-xl text-xs font-bold transition-all cursor-pointer border-0"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#007aff] hover:bg-[#007aff]/90 text-white rounded-xl text-xs font-bold shadow-md shadow-[#007aff]/20 transition-all cursor-pointer border-0 active:scale-95"
                  >
                    {activeBudget ? t('save') : (language === 'my' ? 'ဘတ်ဂျက် သတ်မှတ်မည်' : 'Set Budget Limit')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Budget Section Body */}
      {!activeBudget ? (
        /* Empty State Card - Professional Vault Invitation */
        <div className="p-8 sm:p-12 text-center ios-glass rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#007aff]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-lg mx-auto space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-[#007aff]/10 text-[#007aff] flex items-center justify-center mx-auto shadow-inner">
              <PiggyBank className="w-10 h-10 stroke-[1.8]" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#007aff]/10 text-[#007aff] inline-block mb-2">
                {language === 'my' ? 'ဘတ်ဂျက် ကန့်သတ်ချက် မရှိသေးပါ' : 'No Limit Set'}
              </span>
              <h3 className="text-xl font-black text-[#1c1c1e] dark:text-[#f2f2f7]">
                {t('noBudgetConfigured')} ({getRangeLabel()})
              </h3>
              <p className="text-xs text-[#8e8e93] leading-relaxed mt-1">
                {t('keepFinancesInCheck')}
              </p>
            </div>

            {/* Benefit Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left py-2">
              <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
                <Flame className="w-4 h-4 text-[#ff9500] mb-1" />
                <h4 className="text-[11px] font-bold text-[#1c1c1e] dark:text-white">{language === 'my' ? 'နေ့စဉ် သုံးနှုန်းစံနှုန်း' : 'Daily Burn Rate'}</h4>
                <p className="text-[10px] text-[#8e8e93]">{language === 'my' ? 'တစ်နေ့လျှင် အန္တရာယ်ကင်းစွာ သုံးစွဲနိုင်သော ပမာဏ' : 'Safe spend target per day'}</p>
              </div>
              <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
                <Target className="w-4 h-4 text-[#007aff] mb-1" />
                <h4 className="text-[11px] font-bold text-[#1c1c1e] dark:text-white">{language === 'my' ? 'စမတ် သတိပေးချက်' : 'Smart Alerts'}</h4>
                <p className="text-[10px] text-[#8e8e93]">{language === 'my' ? 'ဘတ်ဂျက်၈၅% ရောက်လျှင် သတိပေးချက်' : 'Early warnings before limit'}</p>
              </div>
              <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
                <BarChart3 className="w-4 h-4 text-[#34c759] mb-1" />
                <h4 className="text-[11px] font-bold text-[#1c1c1e] dark:text-white">{language === 'my' ? 'လကုန် ခန့်မှန်းချက်' : 'End-of-Month Forecast'}</h4>
                <p className="text-[10px] text-[#8e8e93]">{language === 'my' ? 'လက်ရှိနှုန်းဖြင့် လကုန်သုံးစွဲမှု ခန့်မှန်း' : 'AI spending trajectory'}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                id="set-budget-empty-btn"
                type="button"
                onClick={handleEditClick}
                className="w-full sm:w-auto px-7 py-3 bg-[#007aff] hover:bg-[#007aff]/90 text-white rounded-full text-xs font-bold transition-all cursor-pointer shadow-md shadow-[#007aff]/20 flex items-center justify-center gap-2 active:scale-95 border-0"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{t('setBudgetLimitNow')} ({getRangeLabel()})</span>
              </button>

              {previousMonthBudget && (
                <button
                  id="copy-previous-budget-btn"
                  type="button"
                  onClick={() => {
                    onSaveBudget('Total', previousMonthBudget.limit, currentMonthKey);
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-[#007aff]/10 hover:bg-[#007aff]/20 text-[#007aff] rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border border-[#007aff]/20 active:scale-95"
                >
                  <Copy className="w-4 h-4" />
                  <span>{t('copyPreviousBudget')} ({formatAmount(previousMonthBudget.limit)})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Active Dashboard Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Primary Overall Vault Status (7 Cols) */}
          <div className="lg:col-span-7 ios-glass rounded-[2.5rem] p-6 sm:p-7 shadow-sm border border-black/5 dark:border-white/5 flex flex-col justify-between relative overflow-hidden space-y-6">
            {/* Ambient blur sphere */}
            <div className={`absolute top-0 right-0 w-60 h-60 rounded-full filter blur-[80px] opacity-10 pointer-events-none -mr-20 -mt-20 transition-colors duration-500 ${
              isExceeded ? 'bg-[#ff3b30]' : percent > 85 ? 'bg-[#ff9500]' : 'bg-[#34c759]'
            }`} />

            {/* Header Status Bar */}
            <div className="relative z-10 flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
              <div className="flex items-center gap-2">
                {isExceeded ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-[#ff3b30]/15 text-[#ff3b30] border border-[#ff3b30]/20 uppercase tracking-wider">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {t('overBudget')}
                  </span>
                ) : percent > 85 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-[#ff9500]/15 text-[#ff9500] border border-[#ff9500]/20 uppercase tracking-wider">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {language === 'my' ? 'ဘတ်ဂျက် ၈၅% ကျော်လွန်ပြီ' : 'Near Budget Limit'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-[#34c759]/15 text-[#34c759] border border-[#34c759]/20 uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {t('budgetSpendingIsSafe')}
                  </span>
                )}

                <span className="text-[10px] text-[#8e8e93] font-bold font-sans">
                  {daysRemaining} {language === 'my' ? 'ရက်ကျန်' : 'days left'}
                </span>
              </div>

              {/* Edit/Delete Actions */}
              <div className="flex items-center gap-1">
                <button
                  id="edit-overall-budget"
                  type="button"
                  onClick={handleEditClick}
                  className="w-8 h-8 flex items-center justify-center text-[#8e8e93] hover:text-[#007aff] hover:bg-[#007aff]/10 rounded-full transition-all cursor-pointer border-0"
                  title={t('edit')}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  id="delete-overall-budget"
                  type="button"
                  onClick={() => onDeleteBudget('Total', currentMonthKey)}
                  className="w-8 h-8 flex items-center justify-center text-[#8e8e93] hover:text-[#ff3b30] hover:bg-[#ff3b30]/10 rounded-full transition-all cursor-pointer border-0"
                  title={t('delete')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Limit Hero & Percentage Badge */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 my-2">
              <div className="text-center sm:text-left space-y-1">
                <span className="text-[10px] font-black text-[#8e8e93] uppercase tracking-wider block">
                  {t('overallMonthlyBudget')}
                </span>
                <div className="text-3xl sm:text-4xl font-black text-[#1c1c1e] dark:text-white font-sans tracking-tight">
                  {formatAmount(activeBudget.limit)}
                </div>
                <div className="text-xs text-[#8e8e93] font-medium flex items-center justify-center sm:justify-start gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#007aff]" />
                  <span>{getRangeLabel()}</span>
                </div>
              </div>

              {/* Percentage Spent Stat Badge */}
              <div className="flex flex-col items-center sm:items-end justify-center px-5 py-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/5 shrink-0">
                <span className={`text-2xl sm:text-3xl font-black font-sans tracking-tight leading-none ${
                  isExceeded ? 'text-[#ff3b30]' : percent > 85 ? 'text-[#ff9500]' : 'text-[#1c1c1e] dark:text-white'
                }`}>
                  {percent.toFixed(0)}%
                </span>
                <span className="text-[10px] text-[#8e8e93] font-black uppercase tracking-wider mt-1">
                  {t('spent')} ({formatAmount(totalSpent)})
                </span>
              </div>
            </div>

            {/* Linear Milestone Progress Bar */}
            <div className="relative z-10 space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold text-[#8e8e93]">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
              <div className="w-full h-2.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden p-0.5 border border-black/5 dark:border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(percent, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    isExceeded
                      ? 'bg-[#ff3b30]'
                      : percent > 85
                      ? 'bg-[#ff9500]'
                      : 'bg-[#34c759]'
                  }`}
                />
              </div>
            </div>

            {/* Financial Health 4 KPI Micro Cards */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-1">
                <span className="text-[9px] text-[#8e8e93] font-black uppercase tracking-wider block">
                  {t('spent')}
                </span>
                <span className="text-xs font-black text-[#1c1c1e] dark:text-white font-sans block truncate">
                  {formatAmount(totalSpent)}
                </span>
                <span className="text-[9px] text-[#8e8e93] font-bold block">
                  {percent.toFixed(1)}% of limit
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-1">
                <span className="text-[9px] text-[#8e8e93] font-black uppercase tracking-wider block">
                  {isExceeded ? t('overBudget') : t('remaining')}
                </span>
                <span className={`text-xs font-black font-sans block truncate ${isExceeded ? 'text-[#ff3b30]' : 'text-[#34c759]'}`}>
                  {isExceeded ? '-' : ''}{formatAmount(Math.abs(remaining))}
                </span>
                <span className="text-[9px] text-[#8e8e93] font-bold block">
                  {isExceeded ? 'Exceeded' : 'Available'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-1">
                <span className="text-[9px] text-[#8e8e93] font-black uppercase tracking-wider block">
                  {language === 'my' ? 'နေ့စဉ် သုံးငွေ' : 'Daily Safe'}
                </span>
                <span className="text-xs font-black text-[#007aff] font-sans block truncate">
                  {formatAmount(dailyAllowanceRemaining)}
                </span>
                <span className="text-[9px] text-[#8e8e93] font-bold block">
                  / day left
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-1">
                <span className="text-[9px] text-[#8e8e93] font-black uppercase tracking-wider block">
                  {language === 'my' ? 'နေ့စဉ် ပျမ်းမျှ' : 'Daily Burn'}
                </span>
                <span className="text-xs font-black text-[#1c1c1e] dark:text-white font-sans block truncate flex items-center gap-1">
                  {formatAmount(currentDailyAvgSpent)}
                  {currentDailyAvgSpent > dailyLimitAllowed ? (
                    <TrendingUp className="w-3 h-3 text-[#ff3b30] shrink-0" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-[#34c759] shrink-0" />
                  )}
                </span>
                <span className="text-[9px] text-[#8e8e93] font-bold block">
                  / day actual
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Smart Analytics Bento Box (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="ios-glass rounded-[2.5rem] p-6 shadow-sm border border-black/5 dark:border-white/5 space-y-4 flex-1 flex flex-col justify-between">
              {/* Bento Navigation Bar */}
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#8e8e93] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#007aff]" />
                  {language === 'my' ? 'ဘတ်ဂျက် သုံးသပ်ချက်' : 'Budget Analytics'}
                </h4>

                {/* Segment Switcher */}
                <div className="flex bg-black/5 dark:bg-white/10 p-0.5 rounded-full">
                  <button
                    type="button"
                    onClick={() => setBentoTab('burn')}
                    className={`px-3 py-1 rounded-full text-[10px] font-black transition-all cursor-pointer border-0 ${
                      bentoTab === 'burn'
                        ? 'bg-white dark:bg-[#2c2c2e] text-[#007aff] shadow-xs'
                        : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white'
                    }`}
                  >
                    {language === 'my' ? 'နှုန်း' : 'Pace'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBentoTab('projection')}
                    className={`px-3 py-1 rounded-full text-[10px] font-black transition-all cursor-pointer border-0 ${
                      bentoTab === 'projection'
                        ? 'bg-white dark:bg-[#2c2c2e] text-[#007aff] shadow-xs'
                        : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white'
                    }`}
                  >
                    {language === 'my' ? 'ခန့်မှန်း' : 'Forecast'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBentoTab('categories')}
                    className={`px-3 py-1 rounded-full text-[10px] font-black transition-all cursor-pointer border-0 ${
                      bentoTab === 'categories'
                        ? 'bg-white dark:bg-[#2c2c2e] text-[#007aff] shadow-xs'
                        : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white'
                    }`}
                  >
                    {language === 'my' ? 'ကဏ္ဍ' : 'Categories'}
                  </button>
                </div>
              </div>

              {/* Bento Content */}
              <AnimatePresence mode="wait">
                {bentoTab === 'burn' && (
                  <motion.div
                    key="burn-tab"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-4 flex-1 flex flex-col justify-between"
                  >
                    {/* Burn Pace Comparison */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-1">
                        <span className="block text-[9px] text-[#8e8e93] font-black uppercase tracking-wider">
                          {language === 'my' ? 'ခွင့်ပြု ပရိမာဏ/ရက်' : 'Target Daily Cap'}
                        </span>
                        <span className="block text-sm font-black text-[#1c1c1e] dark:text-white font-sans">
                          {formatAmount(dailyLimitAllowed)}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-1">
                        <span className="block text-[9px] text-[#8e8e93] font-black uppercase tracking-wider">
                          {language === 'my' ? 'လက်ရှိ သုံးနှုန်း/ရက်' : 'Actual Daily Burn'}
                        </span>
                        <span className={`block text-sm font-black font-sans flex items-center gap-1 ${
                          currentDailyAvgSpent > dailyLimitAllowed ? 'text-[#ff3b30]' : 'text-[#34c759]'
                        }`}>
                          {formatAmount(currentDailyAvgSpent)}
                          {currentDailyAvgSpent > dailyLimitAllowed ? (
                            <TrendingUp className="w-3.5 h-3.5 text-[#ff3b30]" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5 text-[#34c759]" />
                          )}
                        </span>
                      </div>
                    </div>

                    {/* AI Advisor Bubble */}
                    {advice && (
                      <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs leading-relaxed transition-all ${
                        advice.type === 'error'
                          ? 'bg-[#ff3b30]/5 border-[#ff3b30]/15 text-[#ff3b30]'
                          : advice.type === 'warning'
                          ? 'bg-[#ff9500]/5 border-[#ff9500]/15 text-[#ff9500]'
                          : 'bg-[#34c759]/5 border-[#34c759]/15 text-[#34c759]'
                      }`}>
                        <Info className="w-4 h-4 shrink-0 mt-0.5" />
                        <p className="font-medium text-[#1c1c1e] dark:text-[#f2f2f7]">
                          {language === 'en' ? advice.en : advice.my}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {bentoTab === 'projection' && (
                  <motion.div
                    key="projection-tab"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-4 flex-1"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 bg-[#007aff]/10 border border-[#007aff]/20 rounded-2xl space-y-1">
                        <span className="block text-[9px] text-[#007aff] font-black uppercase tracking-wider">
                          {language === 'my' ? 'နေ့စဉ် သုံးရန် အကြံပြုချက်' : 'Target Daily'}
                        </span>
                        <span className="block text-sm font-black font-sans text-[#007aff]">
                          {formatAmount(dailyAllowanceRemaining)}
                        </span>
                      </div>

                      <div className="p-3.5 bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-2xl space-y-1">
                        <span className="block text-[9px] text-[#8e8e93] font-black uppercase tracking-wider">
                          {language === 'my' ? 'လကုန် သုံးစွဲမှု ခန့်မှန်း' : 'Projected EOM'}
                        </span>
                        <span className={`block text-sm font-black font-sans ${forecast.projectedSpent > activeBudget.limit ? 'text-[#ff3b30]' : 'text-[#34c759]'}`}>
                          {formatAmount(forecast.projectedSpent)}
                        </span>
                      </div>
                    </div>

                    {/* Chart Trajectory */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-[#8e8e93] font-bold">
                        <span>{language === 'my' ? 'သုံးစွဲမှု လမ်းကြောင်း' : 'MONTHLY PACING TRAJECTORY'}</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#007aff]/10 text-[#007aff]">
                          {formatAmount(dailyAllowanceRemaining)} / day
                        </span>
                      </div>

                      <div className="h-32 w-full pt-1.5 rounded-2xl bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 overflow-hidden">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={forecast.dailyPacingPoints} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5ea" opacity={0.1} />
                            <XAxis dataKey="day" stroke="#8e8e93" fontSize={9} tickLine={false} />
                            <YAxis stroke="#8e8e93" fontSize={9} tickLine={false} />
                            <Tooltip 
                              content={({ active, payload }: any) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="p-2 bg-white dark:bg-[#1c1c1e] border border-black/10 dark:border-white/10 rounded-xl shadow-md text-[9px] space-y-0.5 leading-none">
                                      <p className="font-extrabold text-[#1c1c1e] dark:text-white">Day {data.day}</p>
                                      {data.actual !== null && (
                                        <p className="text-[#007aff] font-bold">Act: {formatAmount(data.actual)}</p>
                                      )}
                                      <p className="text-[#af52de] font-bold">Proj: {formatAmount(data.projected)}</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            {activeBudget.limit > 0 && (
                              <ReferenceLine y={activeBudget.limit} stroke="#ff3b30" strokeDasharray="3 3" strokeOpacity={0.6} />
                            )}
                            <Line type="monotone" dataKey="actual" stroke="#007aff" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} connectNulls isAnimationActive={false} />
                            <Line type="monotone" dataKey="projected" stroke="#af52de" strokeWidth={1.5} strokeDasharray="3 3" dot={false} isAnimationActive={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </motion.div>
                )}

                {bentoTab === 'categories' && (
                  <motion.div
                    key="categories-tab"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-3 flex-1 flex flex-col"
                  >
                    <div className="flex-1 overflow-y-auto max-h-[220px] pr-1 space-y-3">
                      {categorySpentList.length === 0 ? (
                        <div className="text-center py-8 text-xs text-[#8e8e93]">
                          {t('noExpenseDataFound')} {getRangeLabel()}
                        </div>
                      ) : (
                        categorySpentList.map(({ category, spent }) => {
                          const relativePercent = activeBudget.limit > 0 ? (spent / activeBudget.limit) * 100 : 0;
                          const catStyle = getCategoryStyle(category, categoryColors);
                          const CatIcon = getCategoryIcon(category, categoryIcons);
                          const isHigh = relativePercent > 20;

                          return (
                            <div key={category} className="space-y-1.5">
                              <div className="flex justify-between items-center text-xs">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`p-1.5 rounded-lg border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                                    style={catStyle.style}
                                  >
                                    <CatIcon className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="font-bold text-[#1c1c1e] dark:text-[#f2f2f7]">{tc(category)}</span>
                                </div>
                                <div className="flex items-center gap-2 font-sans">
                                  <span className="font-extrabold text-[#1c1c1e] dark:text-[#f2f2f7]">
                                    {formatAmount(spent)}
                                  </span>
                                  <span className="text-[10px] text-[#8e8e93] font-bold">
                                    {relativePercent.toFixed(0)}%
                                  </span>
                                  {isHigh && (
                                    <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-[#ff3b30]/10 text-[#ff3b30]">
                                      High
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="w-full h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-[#007aff]"
                                  style={{
                                    width: `${Math.min((spent / (totalSpent || 1)) * 100, 100)}%`,
                                    ...(catStyle.hex ? { backgroundColor: catStyle.hex } : {})
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
