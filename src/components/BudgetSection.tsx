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
  Utensils,
  Car,
  ShoppingBag,
  Film,
  Home as HomeIcon,
  Zap,
  HeartPulse,
  GraduationCap,
  HelpCircle,
  Clock
} from 'lucide-react';
import { Budget, Transaction, Language } from '../types';
import { TRANSLATIONS } from '../translations';
import { generateForecastReport } from '../utils/forecasting';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Line,
  LineChart
} from 'recharts';

interface BudgetSectionProps {
  budgets: Budget[];
  transactions: Transaction[];
  currencySymbol: string;
  language: Language;
  onSaveBudget: (category: string, limit: number) => void;
  onDeleteBudget: (category: string) => void;
  formatAmount: (amount: number) => string;
  selectedMonth: string;
  selectedYear: string;
}

// Category Icon Map for gorgeous visuals
const getCategoryIcon = (category: string) => {
  const norm = category.toLowerCase();
  if (norm.includes('food') || norm.includes('dining') || norm.includes('restaurant')) {
    return <Utensils className="w-4 h-4" />;
  }
  if (norm.includes('transport') || norm.includes('taxi') || norm.includes('bus') || norm.includes('fuel')) {
    return <Car className="w-4 h-4" />;
  }
  if (norm.includes('shop') || norm.includes('store') || norm.includes('clothes') || norm.includes('grocery')) {
    return <ShoppingBag className="w-4 h-4" />;
  }
  if (norm.includes('entertain') || norm.includes('movie') || norm.includes('show') || norm.includes('game')) {
    return <Film className="w-4 h-4" />;
  }
  if (norm.includes('house') || norm.includes('rent') || norm.includes('room')) {
    return <HomeIcon className="w-4 h-4" />;
  }
  if (norm.includes('util') || norm.includes('bill') || norm.includes('electric') || norm.includes('water')) {
    return <Zap className="w-4 h-4" />;
  }
  if (norm.includes('health') || norm.includes('medical') || norm.includes('pharmacy') || norm.includes('doctor')) {
    return <HeartPulse className="w-4 h-4" />;
  }
  if (norm.includes('educat') || norm.includes('school') || norm.includes('book') || norm.includes('course')) {
    return <GraduationCap className="w-4 h-4" />;
  }
  return <HelpCircle className="w-4 h-4" />;
};

// Custom accent colors for categories
const getCategoryColorClasses = (category: string) => {
  const norm = category.toLowerCase();
  if (norm.includes('food')) return { bg: 'bg-[#34c759]/10', text: 'text-[#34c759]', border: 'border-[#34c759]/20', fill: 'bg-[#34c759]' };
  if (norm.includes('transport')) return { bg: 'bg-[#007aff]/10', text: 'text-[#007aff]', border: 'border-[#007aff]/20', fill: 'bg-[#007aff]' };
  if (norm.includes('shop')) return { bg: 'bg-[#ff2d55]/10', text: 'text-[#ff2d55]', border: 'border-[#ff2d55]/20', fill: 'bg-[#ff2d55]' };
  if (norm.includes('entertain')) return { bg: 'bg-[#af52de]/10', text: 'text-[#af52de]', border: 'border-[#af52de]/20', fill: 'bg-[#af52de]' };
  if (norm.includes('house')) return { bg: 'bg-[#5856d6]/10', text: 'text-[#5856d6]', border: 'border-[#5856d6]/20', fill: 'bg-[#5856d6]' };
  if (norm.includes('util')) return { bg: 'bg-[#ff9500]/10', text: 'text-[#ff9500]', border: 'border-[#ff9500]/20', fill: 'bg-[#ff9500]' };
  if (norm.includes('health')) return { bg: 'bg-[#ff3b30]/10', text: 'text-[#ff3b30]', border: 'border-[#ff3b30]/20', fill: 'bg-[#ff3b30]' };
  if (norm.includes('educat')) return { bg: 'bg-[#1badf8]/10', text: 'text-[#1badf8]', border: 'border-[#1badf8]/20', fill: 'bg-[#1badf8]' };
  return { bg: 'bg-[#8e8e93]/10', text: 'text-[#8e8e93]', border: 'border-[#8e8e93]/20', fill: 'bg-[#8e8e93]' };
};

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
}) => {
  const t = (key: string) => TRANSLATIONS[language][key] || key;

  const activeBudget = budgets[0] || null;
  const [budgetLimit, setBudgetLimit] = useState<string>(activeBudget ? activeBudget.limit.toString() : '');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [bentoTab, setBentoTab] = useState<'burn' | 'projection'>('burn');

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
  const totalSpent = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const getRangeLabel = () => {
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
    setError(undefined);
    onSaveBudget('Total', limit);
    setIsEditing(false);
  };

  const handleEditClick = () => {
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
  const { categorySpentMap, categorySpentList } = React.useMemo(() => {
    const spentMap: Record<string, number> = {};
    transactions
      .filter(tx => tx.type === 'expense')
      .forEach(tx => {
        spentMap[tx.category] = (spentMap[tx.category] || 0) + tx.amount;
      });

    const spentList = Object.entries(spentMap)
      .map(([category, spent]) => ({ category, spent }))
      .sort((a, b) => b.spent - a.spent);

    return { categorySpentMap: spentMap, categorySpentList: spentList };
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

  // --- INTRODUCE BURN RATE & TIME CALCULATIONS ---
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
    // Check if future or past
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

  // Circular progress math configurations
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(percent, 100) / 100) * circumference;

  return (
    <div className="space-y-6" id="budget-section">
      {/* Dynamic Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-[#34c759]" />
            {t('budgets')} ({getRangeLabel()})
          </h2>
          <p className="text-xs text-[#8e8e93]">
            {t('budgetUsage')} • {t('calculatedDynamically')} {getRangeLabel()}
          </p>
        </div>
        {!activeBudget && (
          <button
            id="toggle-budget-form-btn"
            onClick={() => {
              setIsEditing(!isEditing);
              if (!isEditing) setBudgetLimit('');
            }}
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#007aff] hover:bg-[#007aff]/90 text-white rounded-full text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            {isEditing ? t('cancel') : t('setBudget')}
          </button>
        )}
      </div>

      {/* Set/Edit Budget Form */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <form
              id="budget-form"
              onSubmit={handleFormSubmit}
              noValidate
              className="p-6 ios-glass rounded-[2.2rem] space-y-5 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#007aff]/10 text-[#007aff] rounded-xl">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#1c1c1e] dark:text-white">
                  {activeBudget ? t('updateBudget') : t('setOverallBudget')}
                </h3>
              </div>

              <div className="space-y-4">
                {/* Centered Large Immersive Amount Section matching Edit Transaction UI */}
                <div className="ios-glass p-6 rounded-[2rem] border border-black/[0.03] dark:border-white/[0.03] shadow-xs text-center space-y-4">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#8e8e93] block">
                    {language === 'my' ? 'သတ်မှတ် ဘတ်ဂျက် ပမာဏ' : 'BUDGET LIMIT'}
                  </span>

                  <div className="relative flex items-center justify-center max-w-sm mx-auto">
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
                        if (error) {
                          setError(undefined);
                        }
                      }}
                      className="w-full text-4xl sm:text-5xl font-mono font-black text-center text-[#1c1c1e] dark:text-white bg-transparent border-0 focus:outline-none focus:ring-0 p-0 caret-[#007aff]"
                      style={{ width: `${Math.max(budgetLimit.length * 24 + 40, 120)}px`, maxWidth: '100%' }}
                    />
                    {budgetLimit && (
                      <button
                        type="button"
                        onClick={() => {
                          setBudgetLimit('');
                          setError(undefined);
                        }}
                        className="w-6 h-6 flex items-center justify-center rounded-full bg-black/[0.06] hover:bg-black/[0.1] dark:bg-white/[0.1] dark:hover:bg-white/[0.15] text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white transition-all cursor-pointer border-0 text-[10px] ml-1 shrink-0"
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
                      className="text-[11px] text-red-500 font-extrabold flex items-center justify-center gap-1.5 animate-bounce mt-1"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </div>

                {/* Quick Selection Presets */}
                <div className="space-y-1.5 pt-1">
                  <span className="block text-[10px] text-[#8e8e93] font-bold uppercase tracking-wider">
                    {language === 'en' ? 'Quick suggestions' : 'အကြံပြုချက်များ'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {getSuggestedBudgets().map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => {
                          setBudgetLimit(amount.toString());
                          setError(undefined);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer active:scale-95 ${
                          budgetLimit === amount.toString()
                            ? 'bg-[#007aff] text-white border-transparent shadow-xs'
                            : 'bg-transparent text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                      >
                        {amount.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-black/5 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 bg-[#f2f2f7] hover:bg-[#e5e5ea] dark:bg-[#2c2c2e] dark:hover:bg-[#38383a] text-[#1c1c1e] dark:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#007aff] hover:bg-[#007aff]/90 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Budget Dashboard Display */}
      <div className="grid grid-cols-1 gap-6">
        {!activeBudget ? (
          <div className="py-20 px-6 text-center ios-glass rounded-[2.5rem] shadow-2xs">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-[#1c1c1e] dark:text-[#f2f2f7] mb-1.5">{t('noBudgetConfigured')}</h3>
            <p className="text-xs text-[#8e8e93] max-w-sm mx-auto mb-6 leading-relaxed">
              {t('keepFinancesInCheck')}
            </p>
            <button
              id="set-budget-empty-btn"
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 bg-[#007aff] hover:bg-[#007aff]/90 text-white rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs hover:shadow-md inline-flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              {t('setBudgetLimitNow')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Primary overall status column (7 cols) */}
            {!isEditing && (
              <div className="lg:col-span-7 ios-glass rounded-[2.5rem] p-6 shadow-sm flex flex-col justify-between relative overflow-hidden min-h-[360px]">
                {/* Background ambient mesh */}
                <div className={`absolute top-0 right-0 w-44 h-44 rounded-full filter blur-[60px] opacity-[0.06] pointer-events-none -mr-16 -mt-16 transition-colors duration-300 ${
                  isExceeded ? 'bg-[#ff3b30]' : percent > 85 ? 'bg-amber-500' : 'bg-[#34c759]'
                }`} />

                <div>
                  {/* Vault Card Title Bar */}
                  <div className="relative z-10 flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/5 dark:bg-white/5 text-[#8e8e93]">
                        <Clock className="w-3 h-3" />
                        {getRangeLabel()}
                      </span>
                      <h4 className="text-xs font-bold text-[#8e8e93] pt-1">
                        {t('overallMonthlyBudget')}
                      </h4>
                    </div>
                    
                    {/* Action controls */}
                    <div className="flex items-center gap-1">
                      <button
                        id="edit-overall-budget"
                        onClick={handleEditClick}
                        className="w-9 h-9 flex items-center justify-center text-[#8e8e93] hover:text-[#007aff] hover:bg-[#007aff]/10 rounded-full transition-all cursor-pointer"
                        title={t('edit')}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        id="delete-overall-budget"
                        onClick={() => onDeleteBudget('Total')}
                        className="w-9 h-9 flex items-center justify-center text-[#8e8e93] hover:text-[#ff3b30] hover:bg-[#ff3b30]/10 rounded-full transition-all cursor-pointer"
                        title={t('delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Amount display and Ring Progress layout */}
                  <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 mt-4 mb-6">
                    <div className="text-center sm:text-left space-y-1">
                      <div className="text-4xl font-black text-[#1c1c1e] dark:text-white font-sans tracking-tight">
                        {formatAmount(activeBudget.limit)}
                      </div>
                      <div className="text-xs text-[#8e8e93] font-medium">
                        {language === 'en' ? 'Limit target setup' : 'သတ်မှတ်ဘတ်ဂျက် ပမာဏ'}
                      </div>
                    </div>

                    {/* Circular SVG Ring Gauge */}
                    <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        {/* Tracking loop */}
                        <circle
                          cx="56"
                          cy="56"
                          r={radius}
                          className="stroke-black/[0.06] dark:stroke-white/[0.06]"
                          strokeWidth="10"
                          fill="transparent"
                        />
                        {/* Active progress indicator */}
                        <motion.circle
                          cx="56"
                          cy="56"
                          r={radius}
                          className={`${
                            isExceeded
                              ? 'stroke-[#ff3b30]'
                              : percent > 85
                              ? 'stroke-amber-500'
                              : 'stroke-[#34c759]'
                          }`}
                          strokeWidth="10"
                          fill="transparent"
                          strokeDasharray={circumference}
                          initial={{ strokeDashoffset: circumference }}
                          animate={{ strokeDashoffset }}
                          transition={{ duration: 1.2, ease: 'easeOut' }}
                          strokeLinecap="round"
                        />
                      </svg>
                      {/* Ring interior label */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-black text-[#1c1c1e] dark:text-white font-mono">
                          {percent.toFixed(0)}%
                        </span>
                        <span className="text-[9px] text-[#8e8e93] font-bold uppercase tracking-wider">
                          {t('spent')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Linear tracking information */}
                  <div className="relative z-10 space-y-2 border-t border-black/5 dark:border-white/5 pt-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#8e8e93] font-medium">
                        {t('totalExpenseSpent')}
                      </span>
                      <span className="font-extrabold text-[#1c1c1e] dark:text-[#f2f2f7] font-mono">
                        {formatAmount(totalSpent)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#8e8e93] font-medium">
                        {isExceeded ? t('overBudgetLimit') : t('availableRemainingSpend')}
                      </span>
                      <span className={`font-black font-mono ${isExceeded ? 'text-[#ff3b30]' : 'text-[#34c759]'}`}>
                        {isExceeded ? '-' : ''}{formatAmount(Math.abs(remaining))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status bar block */}
                <div className="relative z-10 flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-4 mt-4">
                  <div className="flex items-center gap-1.5">
                    {isExceeded ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-[#ff3b30]/10 text-[#ff3b30] uppercase tracking-wider">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {t('overBudgetLimit')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-[#34c759]/10 text-[#34c759] uppercase tracking-wider">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {t('budgetSpendingIsSafe')}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#8e8e93] font-mono">
                    {daysRemaining} {language === 'en' ? 'days left' : 'ရက်ကျန်ရှိ'}
                  </div>
                </div>
              </div>
            )}

            {/* Smart Daily Allowance, Burn Rate & Projections (5 cols or 12 cols when editing) */}
            <div className={isEditing ? "lg:col-span-12 flex flex-col gap-6" : "lg:col-span-5 flex flex-col gap-6"}>
              {/* Burn Rate & Smart Projections Details Card */}
              <div className="ios-glass rounded-[2.5rem] p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#8e8e93] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#007aff]" />
                    {language === 'en' ? 'Smart Analytics & Forecast' : 'စမတ် သုံးသပ်ချက်နှင့် ခန့်မှန်းချက်'}
                  </h4>

                  {/* Segment controller */}
                  <div className="flex bg-black/5 dark:bg-white/5 p-0.5 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setBentoTab('burn')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all cursor-pointer border-none ${
                        bentoTab === 'burn'
                          ? 'bg-white dark:bg-[#2c2c2e] text-[#1c1c1e] dark:text-white shadow-xs'
                          : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white'
                      }`}
                    >
                      {language === 'en' ? 'Daily' : 'နေ့စဉ်စံနှုန်း'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBentoTab('projection')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all cursor-pointer border-none ${
                        bentoTab === 'projection'
                          ? 'bg-white dark:bg-[#2c2c2e] text-[#1c1c1e] dark:text-white shadow-xs'
                          : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white'
                      }`}
                    >
                      {language === 'en' ? 'Forecast' : 'ခန့်မှန်းချက်'}
                    </button>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {bentoTab === 'burn' ? (
                    <motion.div
                      key="burn-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        {/* Daily target allowance */}
                        <div className="p-3.5 bg-[#f2f2f7] dark:bg-[#2c2c2e] rounded-2xl space-y-1">
                          <span className="block text-[9px] text-[#8e8e93] font-black uppercase tracking-wider">
                            {language === 'en' ? 'Daily Allowance' : 'နေ့စဉ်သုံးငွေ'}
                          </span>
                          <span className="block text-sm font-black text-[#1c1c1e] dark:text-white font-mono">
                            {formatAmount(dailyAllowanceRemaining)}
                          </span>
                        </div>

                        {/* Burn rate speed */}
                        <div className="p-3.5 bg-[#f2f2f7] dark:bg-[#2c2c2e] rounded-2xl space-y-1">
                          <span className="block text-[9px] text-[#8e8e93] font-black uppercase tracking-wider">
                            {language === 'en' ? 'Average Spent' : 'နေ့စဉ်ပျမ်းမျှ'}
                          </span>
                          <span className="block text-sm font-black text-[#1c1c1e] dark:text-white font-mono flex items-center gap-1">
                            {formatAmount(currentDailyAvgSpent)}
                            {currentDailyAvgSpent > dailyLimitAllowed ? (
                              <TrendingUp className="w-3.5 h-3.5 text-[#ff3b30]" />
                            ) : (
                              <TrendingDown className="w-3.5 h-3.5 text-[#34c759]" />
                            )}
                          </span>
                        </div>
                      </div>

                      {/* AI / Coach Insight Bubble */}
                      {advice && (
                        <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs leading-relaxed transition-all ${
                          advice.type === 'error'
                            ? 'bg-[#ff3b30]/5 border-[#ff3b30]/10 text-[#ff3b30]'
                            : advice.type === 'warning'
                            ? 'bg-amber-500/5 border-amber-500/10 text-amber-500'
                            : 'bg-[#34c759]/5 border-[#34c759]/10 text-[#34c759]'
                        }`}>
                          <Info className="w-4 h-4 shrink-0 mt-0.5" />
                          <p className="font-medium text-black/80 dark:text-white/80">
                            {language === 'en' ? advice.en : advice.my}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="projection-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        {/* Projected Spent EOM */}
                        <div className="p-3.5 bg-[#f2f2f7] dark:bg-[#2c2c2e] rounded-2xl space-y-1">
                          <span className="block text-[9px] text-[#8e8e93] font-black uppercase tracking-wider">
                            {language === 'en' ? 'Projected EOM Spend' : 'လကုန်ခန့်မှန်းခြေ'}
                          </span>
                          <span className={`block text-sm font-black font-mono ${forecast.projectedSpent > activeBudget.limit ? 'text-[#ff3b30]' : 'text-[#34c759]'}`}>
                            {formatAmount(forecast.projectedSpent)}
                          </span>
                        </div>

                        {/* Projection Outcome status */}
                        <div className="p-3.5 bg-[#f2f2f7] dark:bg-[#2c2c2e] rounded-2xl space-y-1">
                          <span className="block text-[9px] text-[#8e8e93] font-black uppercase tracking-wider">
                            {language === 'en' ? 'Pacing Outcome' : 'ခန့်မှန်းရလဒ်'}
                          </span>
                          <span className={`block text-sm font-black font-mono ${forecast.projectedSpent > activeBudget.limit ? 'text-[#ff3b30]' : 'text-[#34c759]'}`}>
                            {forecast.projectedSpent > activeBudget.limit 
                              ? (language === 'en' ? 'Overspent' : 'ဘတ်ဂျက်ကျော်နိုင်') 
                              : (language === 'en' ? 'On Track' : 'ပုံမှန်အဆင့်ရှိ')
                            }
                          </span>
                        </div>
                      </div>

                      {/* Mini Trajectory Path Chart */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[10px] text-[#8e8e93] font-bold">
                          <span>{language === 'en' ? 'ACTUAL VS PROJECTED TRAJECTORY PATH' : 'လက်ရှိ နှင့် ခန့်မှန်းခြေ သုံးစွဲမှုလမ်းကြောင်း'}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-black tracking-wider ${
                            forecast.forecastAccuracy === 'high' 
                              ? 'bg-[#34c759]/10 text-[#34c759]' 
                              : forecast.forecastAccuracy === 'medium'
                              ? 'bg-amber-500/10 text-amber-500'
                              : 'bg-blue-500/10 text-blue-500'
                          }`}>
                            {language === 'en' ? `Accuracy: ${forecast.forecastAccuracy}` : `တိကျမှု: ${forecast.forecastAccuracy}`}
                          </span>
                        </div>

                        <div className="h-32 w-full pt-1.5 rounded-2xl bg-black/[0.01] dark:bg-white/[0.01] border border-black/[0.02] dark:border-white/[0.02] overflow-hidden">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={forecast.dailyPacingPoints} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5ea" opacity={0.06} />
                              <XAxis dataKey="day" stroke="#8e8e93" fontSize={9} tickLine={false} />
                              <YAxis stroke="#8e8e93" fontSize={9} tickLine={false} />
                              <Tooltip 
                                content={({ active, payload }: any) => {
                                  if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                      <div className="p-2 bg-white dark:bg-[#1c1c1e] border border-black/10 dark:border-white/10 rounded-xl shadow-sm text-[9px] space-y-0.5 leading-none">
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
                                <ReferenceLine y={activeBudget.limit} stroke="#ff3b30" strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: 'Ceiling', fill: '#ff3b30', fontSize: 8, position: 'insideTopLeft' }} />
                              )}
                              <Line type="monotone" dataKey="actual" stroke="#007aff" strokeWidth={2} dot={false} activeDot={{ r: 4 }} connectNulls style={{ outline: 'none' }} />
                              <Line type="monotone" dataKey="projected" stroke="#af52de" strokeWidth={1.5} strokeDasharray="3 3" dot={false} style={{ outline: 'none' }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Detail pacing message */}
                      <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.03] dark:border-white/[0.03] text-[11px] leading-relaxed">
                        {forecast.projectedSpent > activeBudget.limit ? (
                          <p className="text-red-500 font-bold flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              {language === 'en' 
                                ? `You are pacing to breach your budget on Day ${forecast.estimatedBreachDay}. Try saving ${formatAmount(forecast.projectedSpent - activeBudget.limit)} to stay safe.`
                                : `လက်ရှိအရှိန်အတိုင်းဆိုပါက ရက်စွဲ (${forecast.estimatedBreachDay}) ဝန်းကျင်တွင် ဘတ်ဂျက်ကျော်လွန်နိုင်ပါသည်။ ပုံမှန်အခြေအနေရောက်ရန် ${formatAmount(forecast.projectedSpent - activeBudget.limit)} လျှော့ချပါ။`
                              }
                            </span>
                          </p>
                        ) : (
                          <p className="text-[#34c759] font-bold flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              {language === 'en'
                                ? `You are pacing excellently! You are projected to finish the month with ${formatAmount(activeBudget.limit - forecast.projectedSpent)} remaining.`
                                : `စည်းကမ်းအလွန်ကောင်းမွန်ပါသည်။ လကုန်ပါက ဘတ်ဂျက်မှ ${formatAmount(activeBudget.limit - forecast.projectedSpent)} ပိုလျှံစုဆောင်းနိုင်မည်ဖြစ်သည်။`
                              }
                            </span>
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mini category distributions */}
              <div className="ios-glass rounded-[2.5rem] p-6 shadow-sm flex flex-col space-y-4 flex-1">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#8e8e93] flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#34c759]" />
                  {t('budgetExpenseDistribution')}
                </h4>

                <div className="flex-1 overflow-y-auto max-h-[170px] pr-1 space-y-4 scrollbar-thin">
                  {categorySpentList.length === 0 ? (
                    <div className="text-center py-8 text-xs text-[#8e8e93]">
                      {t('noExpenseDataFound')} {getRangeLabel()}
                    </div>
                  ) : (
                    categorySpentList.map(({ category, spent }) => {
                      const relativePercent = activeBudget.limit > 0 ? (spent / activeBudget.limit) * 100 : 0;
                      const catStyle = getCategoryColorClasses(category);
                      const isHighWarn = relativePercent > (100 / (categorySpentList.length || 1)) * 1.5;

                      return (
                        <div key={category} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2">
                              <div className={`p-1.5 rounded-lg ${catStyle.bg} ${catStyle.text} border ${catStyle.border}`}>
                                {getCategoryIcon(category)}
                              </div>
                              <span className="font-bold text-[#1c1c1e] dark:text-[#f2f2f7]">{category}</span>
                            </div>
                            <div className="flex items-center gap-2 font-mono">
                              <span className="font-extrabold text-[#1c1c1e] dark:text-[#f2f2f7]">
                                {formatAmount(spent)}
                              </span>
                              <span className="text-[10px] text-[#8e8e93] font-bold">
                                {relativePercent.toFixed(0)}%
                              </span>
                              {isHighWarn && spent > 0 && (
                                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase bg-red-500/10 text-red-500 tracking-wider">
                                  {language === 'en' ? 'High' : 'မြင့်'}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Polished progress tracking bar */}
                          <div className="w-full h-1.5 bg-[#f2f2f7] dark:bg-[#2c2c2e] rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min((spent / (totalSpent || 1)) * 100, 100)}%` }}
                              transition={{ duration: 0.6, ease: 'easeOut' }}
                              className={`h-full rounded-full ${catStyle.fill}`}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

