import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  PiggyBank,
  FileDown,
  AlertTriangle,
  CheckCircle2,
  History,
  Eye,
  EyeOff,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowRight,
  SlidersHorizontal,
  Wallet,
  Sparkles
} from 'lucide-react';
import { Transaction, Budget, Settings } from '../types';
import { getCategoryStyle, CategoryStyle } from '../utils/categoryStyle';
import { getCategoryIcon } from '../utils/categoryIcon';
import { findActiveBudget } from '../utils/budgetUtils';
import { getLocalMonthStr } from '../utils/dateUtils';
import { DateFilterSwitcher } from './DateFilterSwitcher';

interface DashboardOverviewProps {
  t: (key: string) => string;
  tc: (key: string) => string;
  settings: Settings;
  dateFilterMode: 'monthYear' | 'dateRange';
  setDateFilterMode: (mode: 'monthYear' | 'dateRange') => void;
  selectedMonth: string;
  selectedYear: string;
  setSelectedMonth: (m: string) => void;
  setSelectedYear: (y: string) => void;
  startDate: string;
  setStartDate: (d: string) => void;
  endDate: string;
  setEndDate: (d: string) => void;
  monthOptions: Array<{ value: string; label: string }>;
  availableYears: string[];
  showMonthMenu: boolean;
  setShowMonthMenu: (show: boolean) => void;
  showYearMenu: boolean;
  setShowYearMenu: (show: boolean) => void;
  totals: {
    income: number;
    expense: number;
    balance: number;
  };
  formatAmount: (amount: number) => string;
  formatDateDMY: (date: string) => string;
  budgets: Budget[];
  dashboardFilteredTransactions: Transaction[];
  onSelectTab: (tab: any) => void;
  onExportPDF: () => void;
  setEditingTxInAddPage: (tx: Transaction | null) => void;
  categoryColors?: Record<string, string>;
  categoryIcons?: Record<string, string>;
}

interface DashboardRecentTxItemProps {
  tx: Transaction;
  style: CategoryStyle;
  translatedCategory: string;
  formattedDate: string;
  formattedAmount: string;
  categoryIcons?: Record<string, string>;
  onClick: () => void;
}

const DashboardRecentTxItem: React.FC<DashboardRecentTxItemProps> = React.memo(({
  tx,
  style,
  translatedCategory,
  formattedDate,
  formattedAmount,
  categoryIcons,
  onClick
}) => {
  const CategoryIcon = getCategoryIcon(tx.category, categoryIcons);

  return (
    <div
      onClick={onClick}
      className="group flex items-center justify-between p-3.5 rounded-2xl bg-white/50 dark:bg-white/[0.03] hover:bg-black/5 dark:hover:bg-white/10 border border-black/[0.04] dark:border-white/[0.06] transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs hover:translate-x-0.5"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-xs transition-transform duration-200 group-hover:scale-105 ${style.bg} ${style.text} ${style.border}`}
          style={style.style}
        >
          <CategoryIcon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-[#1c1c1e] dark:text-[#f2f2f7] truncate leading-tight group-hover:text-[#007aff] transition-colors">
            {tx.description}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-[#8e8e93] font-mono uppercase font-extrabold tracking-wider truncate">
              {translatedCategory}
            </span>
            <span className="text-[10px] text-[#8e8e93]/60">•</span>
            <span className="text-[10px] text-[#8e8e93] font-mono">
              {formattedDate}
            </span>
          </div>
        </div>
      </div>
      <div className="text-right shrink-0 pl-3">
        <span
          className={`text-sm md:text-base font-black font-mono whitespace-nowrap leading-none block ${
            tx.type === 'income' ? 'text-[#34c759]' : 'text-[#ff3b30]'
          }`}
        >
          {tx.type === 'income' ? '+' : '-'}{formattedAmount}
        </span>
      </div>
    </div>
  );
});

export const DashboardOverview: React.FC<DashboardOverviewProps> = React.memo(({
  t,
  tc,
  settings,
  dateFilterMode,
  setDateFilterMode,
  selectedMonth,
  selectedYear,
  setSelectedMonth,
  setSelectedYear,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  monthOptions,
  availableYears,
  showMonthMenu,
  setShowMonthMenu,
  showYearMenu,
  setShowYearMenu,
  totals,
  formatAmount,
  formatDateDMY,
  budgets,
  dashboardFilteredTransactions,
  onSelectTab,
  onExportPDF,
  setEditingTxInAddPage,
  categoryColors = {},
  categoryIcons = {},
}) => {
  const monthMenuRef = React.useRef<HTMLDivElement>(null);
  const yearMenuRef = React.useRef<HTMLDivElement>(null);

  const [showBalance, setShowBalance] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mm_show_balance') !== 'false';
    }
    return true;
  });

  const toggleShowBalance = () => {
    setShowBalance((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('mm_show_balance', String(next));
      }
      return next;
    });
  };

  React.useLayoutEffect(() => {
    if (showMonthMenu && monthMenuRef.current) {
      const currentMonthVal = getLocalMonthStr();
      const targetVal = selectedMonth !== 'all' ? selectedMonth : currentMonthVal;
      const targetBtn = monthMenuRef.current.querySelector(`[data-value="${targetVal}"]`) as HTMLElement;
      if (targetBtn) {
        monthMenuRef.current.scrollTop = targetBtn.offsetTop - 6;
      }
    }
  }, [showMonthMenu, selectedMonth]);

  React.useLayoutEffect(() => {
    if (showYearMenu && yearMenuRef.current) {
      const currentYearVal = new Date().getFullYear().toString();
      const targetVal = selectedYear !== 'all' ? selectedYear : currentYearVal;
      const targetBtn = yearMenuRef.current.querySelector(`[data-value="${targetVal}"]`) as HTMLElement;
      if (targetBtn) {
        yearMenuRef.current.scrollTop = targetBtn.offsetTop - 6;
      }
    }
  }, [showYearMenu, selectedYear]);

  // Financial Metrics Calculations
  const metrics = useMemo(() => {
    const expenses = dashboardFilteredTransactions.filter((tx) => tx.type === 'expense');
    const totalExp = totals.expense;
    const totalInc = totals.income;

    // Calculate Daily Average
    let daysInPeriod = 30;
    const today = new Date();
    if (selectedMonth !== 'all' && selectedYear !== 'all') {
      const yearNum = parseInt(selectedYear, 10);
      const monthNum = parseInt(selectedMonth, 10);
      if (!isNaN(yearNum) && !isNaN(monthNum)) {
        const totalDaysInMonth = new Date(yearNum, monthNum, 0).getDate();
        if (today.getFullYear() === yearNum && today.getMonth() + 1 === monthNum) {
          daysInPeriod = Math.max(1, today.getDate());
        } else {
          daysInPeriod = totalDaysInMonth;
        }
      }
    }
    const dailyAvg = totalExp > 0 ? totalExp / daysInPeriod : 0;

    // Savings Ratio
    const savingsRatio = totalInc > 0 ? Math.max(0, ((totalInc - totalExp) / totalInc) * 100) : 0;

    // Top Expense Category
    const catMap: Record<string, number> = {};
    expenses.forEach((tx) => {
      catMap[tx.category] = (catMap[tx.category] || 0) + tx.amount;
    });

    let topCategory = '';
    let topCategoryAmount = 0;
    Object.entries(catMap).forEach(([cat, amt]) => {
      if (amt > topCategoryAmount) {
        topCategoryAmount = amt;
        topCategory = cat;
      }
    });

    const topCategoryPercent = totalExp > 0 ? (topCategoryAmount / totalExp) * 100 : 0;

    // Income vs Expense Percentage Ratio for Meter Bar
    const sumFlow = totalInc + totalExp;
    const incomePercent = sumFlow > 0 ? (totalInc / sumFlow) * 100 : 50;
    const expensePercent = sumFlow > 0 ? (totalExp / sumFlow) * 100 : 50;

    return {
      dailyAvg,
      savingsRatio,
      topCategory,
      topCategoryAmount,
      topCategoryPercent,
      incomePercent,
      expensePercent,
    };
  }, [dashboardFilteredTransactions, totals, selectedMonth, selectedYear]);

  const activeBudget = findActiveBudget(budgets, selectedMonth, selectedYear);

  return (
    <div className="space-y-6" id="view-dashboard">
      {/* Date Filter Switcher */}
      <DateFilterSwitcher
        t={t}
        settings={settings}
        dateFilterMode={dateFilterMode}
        setDateFilterMode={setDateFilterMode}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        monthOptions={monthOptions}
        availableYears={availableYears}
        showMonthMenu={showMonthMenu}
        setShowMonthMenu={setShowMonthMenu}
        showYearMenu={showYearMenu}
        setShowYearMenu={setShowYearMenu}
        monthMenuRef={monthMenuRef}
        yearMenuRef={yearMenuRef}
      />

      {/* Hero Financial Balance Card (Seamless Apple Card Style) */}
      <div className="ios-glass text-[#1c1c1e] dark:text-[#f2f2f7] rounded-[2.25rem] p-6 sm:p-7 relative overflow-hidden transition-all duration-300 border border-white/70 dark:border-white/10 shadow-xl shadow-black/[0.04]">
        {/* Ambient lighting backdrop glows */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#007aff]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#34c759]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Top Header Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#007aff]/10 text-[#007aff] flex items-center justify-center shrink-0 border border-[#007aff]/20">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[#8e8e93] text-[10px] font-black uppercase tracking-widest block leading-none">
                  {t('totalBalance')}
                </span>
                <span className="text-[10px] text-[#1c1c1e]/70 dark:text-[#f2f2f7]/70 font-bold block mt-0.5">
                  {(dateFilterMode === 'dateRange' || startDate || endDate)
                    ? (startDate || endDate ? `${startDate || '...'} → ${endDate || '...'}` : t('allTime'))
                    : `${selectedMonth === 'all' ? t('allMonths') : selectedMonth}/${selectedYear === 'all' ? t('allYears') : selectedYear}`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border flex items-center gap-1.5 shadow-2xs ${
                totals.balance >= 0 
                  ? 'bg-[#34c759]/10 text-[#34c759] border-[#34c759]/20' 
                  : 'bg-[#ff3b30]/10 text-[#ff3b30] border-[#ff3b30]/20'
              }`}>
                {totals.balance >= 0 ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{settings.language === 'my' ? 'လက်ကျန် ပုံမှန်' : 'Healthy'}</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3" />
                    <span>{settings.language === 'my' ? 'အသုံးလွန်' : 'Overdraft'}</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Main Balance Row */}
          <div className="flex items-baseline justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1c1c1e] dark:text-white font-sans tracking-tight leading-none">
                {showBalance ? formatAmount(totals.balance) : '••••••••'}
              </h2>
              <button
                type="button"
                onClick={toggleShowBalance}
                className="p-2 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white transition-all cursor-pointer border-0 flex items-center justify-center shrink-0 shadow-2xs"
                title={showBalance ? 'Hide Balance' : 'Show Balance'}
                aria-label={showBalance ? 'Hide Balance' : 'Show Balance'}
              >
                {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {totals.income > 0 && (
              <span className="text-xs font-black px-3 py-1 rounded-full bg-[#007aff]/10 text-[#007aff] border border-[#007aff]/20 font-mono">
                {metrics.savingsRatio.toFixed(0)}% {settings.language === 'my' ? 'စုဆောင်းငွေ' : 'Saved'}
              </span>
            )}
          </div>

          {/* Minimalist Cashflow Summary Strip (Replaces separate bulky income/expense cards) */}
          <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] space-y-3">
            <div className="grid grid-cols-2 gap-4 divide-x divide-black/10 dark:divide-white/10">
              {/* Income Line */}
              <div className="flex items-center justify-between pr-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#34c759]/15 text-[#34c759] flex items-center justify-center shrink-0">
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8e8e93] uppercase font-extrabold tracking-wider block leading-none">{t('income')}</span>
                    <span className="text-xs sm:text-sm font-black text-[#34c759] font-mono block mt-0.5">
                      {showBalance ? formatAmount(totals.income) : '••••••••'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#34c759] font-mono hidden sm:inline">
                  {metrics.incomePercent.toFixed(0)}%
                </span>
              </div>

              {/* Expense Line */}
              <div className="flex items-center justify-between pl-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#ff3b30]/15 text-[#ff3b30] flex items-center justify-center shrink-0">
                    <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8e8e93] uppercase font-extrabold tracking-wider block leading-none">{t('expense')}</span>
                    <span className="text-xs sm:text-sm font-black text-[#ff3b30] font-mono block mt-0.5">
                      {showBalance ? formatAmount(totals.expense) : '••••••••'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#ff3b30] font-mono hidden sm:inline">
                  {metrics.expensePercent.toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Cashflow Proportion Bar */}
            {(totals.income > 0 || totals.expense > 0) && (
              <div className="w-full h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-[#34c759] rounded-l-full transition-all duration-500"
                  style={{ width: `${metrics.incomePercent}%` }}
                />
                <div
                  className="h-full bg-[#ff3b30] rounded-r-full transition-all duration-500"
                  style={{ width: `${metrics.expensePercent}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Add Action Bar */}
      <div className="no-print">
        <button
          id="quick-add-tx"
          onClick={() => {
            setEditingTxInAddPage(null);
            onSelectTab('add-transaction');
          }}
          className="w-full flex items-center justify-between p-4 sm:p-4.5 rounded-[1.75rem] ios-glass bg-white/80 dark:bg-[#1c1c1e]/80 hover:bg-white dark:hover:bg-[#2c2c2e] text-[#1c1c1e] dark:text-white border border-black/5 dark:border-white/10 shadow-xs hover:shadow-md active:scale-[0.98] transition-all duration-200 cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#007aff] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#007aff]/20 group-hover:scale-105 transition-transform">
              <Plus className="w-6 h-6 stroke-[3]" />
            </div>
            <div className="text-left">
              <span className="text-base font-black tracking-tight block leading-tight text-[#1c1c1e] dark:text-white">
                {t('quickAdd')}
              </span>
              <span className="text-xs font-medium text-[#8e8e93] block mt-0.5">
                {settings.language === 'my' ? 'ဝင်ငွေ / ထွက်ငွေ အသစ်ထည့်သွင်းရန်' : 'Record new income or expense'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pl-3">
            <span className="text-xs font-bold bg-[#007aff]/10 text-[#007aff] px-3 py-1.5 rounded-full border border-[#007aff]/20 hidden sm:inline-block">
              + {settings.language === 'my' ? 'မှတ်တမ်း' : 'Entry'}
            </span>
            <div className="w-8 h-8 rounded-full bg-[#007aff]/10 text-[#007aff] flex items-center justify-center shrink-0 group-hover:bg-[#007aff] group-hover:text-white group-hover:translate-x-0.5 transition-all shadow-2xs">
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
        </button>
      </div>

      {/* Financial Health Insights Grid (3-Metric Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Metric 1: Daily Average Spend */}
        <div className="p-4 ios-glass rounded-[1.8rem] border border-black/5 dark:border-white/5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#8e8e93]">
            <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#007aff]" />
              {settings.language === 'my' ? 'တစ်နေ့ပျမ်းမျှ သုံးစွဲမှု' : 'Daily Avg Spend'}
            </span>
          </div>
          <p className="text-base font-black font-mono text-[#1c1c1e] dark:text-white">
            {formatAmount(metrics.dailyAvg)}
          </p>
          <p className="text-[10px] text-[#8e8e93]">
            {settings.language === 'my' ? 'ရက်အလိုက် ပျမ်းမျှကုန်ကျစရိတ်' : 'Average pace for selected period'}
          </p>
        </div>

        {/* Metric 2: Top Expense Category */}
        <div className="p-4 ios-glass rounded-[1.8rem] border border-black/5 dark:border-white/5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#8e8e93]">
            <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-[#ff3b30]" />
              {settings.language === 'my' ? 'အများဆုံး သုံးစွဲသည့် ကဏ္ဍ' : 'Top Category'}
            </span>
            {metrics.topCategoryPercent > 0 && (
              <span className="text-[10px] font-bold text-[#ff3b30] bg-[#ff3b30]/10 px-1.5 py-0.5 rounded-md">
                {metrics.topCategoryPercent.toFixed(0)}%
              </span>
            )}
          </div>
          <p className="text-base font-black text-[#1c1c1e] dark:text-white truncate">
            {metrics.topCategory ? tc(metrics.topCategory) : '-'}
          </p>
          <p className="text-[10px] text-[#8e8e93] font-mono">
            {metrics.topCategoryAmount > 0 ? formatAmount(metrics.topCategoryAmount) : (settings.language === 'my' ? 'မှတ်တမ်းမရှိပါ' : 'No records')}
          </p>
        </div>

        {/* Metric 3: Savings Rate */}
        <div className="p-4 ios-glass rounded-[1.8rem] border border-black/5 dark:border-white/5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#8e8e93]">
            <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#34c759]" />
              {settings.language === 'my' ? 'စုဆောင်းငွေ အချိုး' : 'Savings Rate'}
            </span>
          </div>
          <p className="text-base font-black font-mono text-[#34c759]">
            {metrics.savingsRatio.toFixed(1)}%
          </p>
          <p className="text-[10px] text-[#8e8e93]">
            {settings.language === 'my' ? 'ဝင်ငွေအပေါ် စုဆောင်းနိုင်မှု ရာခိုင်နှုန်း' : 'Income retained after expenses'}
          </p>
        </div>
      </div>

      {/* Budgets & Spending Health Mini Card */}
      <div className="p-6 ios-glass rounded-[2rem] border border-black/5 dark:border-white/5 space-y-5 shadow-xs">
        {(() => {
          if (!activeBudget) {
            const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
            const mIdx = parseInt(selectedMonth) - 1;
            const mName = isNaN(mIdx) ? selectedMonth : t(monthNames[mIdx]);
            const monthLabel = `${mName} ${selectedYear}`;

            return (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#34c759]/10 text-[#34c759] flex items-center justify-center mx-auto">
                  <PiggyBank className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1c1c1e] dark:text-white">
                    {t('noBudgetConfigured')} ({monthLabel})
                  </p>
                  <p className="text-[11px] text-[#8e8e93] mt-1 max-w-sm mx-auto">
                    {settings.language === 'my' 
                      ? 'ဘတ်ဂျက် သတ်မှတ်ထားခြင်းဖြင့် လစဉ် အသုံးစရိတ်များကို ပိုမိုစနစ်တကျ ထိန်းချုပ်နိုင်ပါသည်။' 
                      : 'Set a monthly limit to track spending health and avoid overspending.'}
                  </p>
                </div>
                <button
                  id="set-initial-budget"
                  onClick={() => onSelectTab('budgets')}
                  className="h-10 px-5 inline-flex items-center justify-center bg-[#34c759] hover:bg-[#30d158] text-white rounded-full text-xs font-extrabold transition-all shadow-sm hover:scale-[1.02] cursor-pointer border-0"
                >
                  {settings.language === 'my' ? `ဘတ်ဂျက် သတ်မှတ်ရန် (${monthLabel})` : `Set Budget Limit (${monthLabel})`}
                </button>
              </div>
            );
          }

          const spent = dashboardFilteredTransactions
            .filter((tx) => tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amount, 0);
          const percent = activeBudget.limit > 0 ? (spent / activeBudget.limit) * 100 : 0;
          const isExceeded = spent > activeBudget.limit;
          const remainingAmount = activeBudget.limit - spent;

          return (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-[#f2f2f7] dark:border-[#2c2c2e] pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#34c759]/10 text-[#34c759] flex items-center justify-center shrink-0 border border-[#34c759]/20">
                    <PiggyBank className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#1c1c1e] dark:text-white leading-none">
                      {t('budgetStatus')}
                    </h3>
                    <span className="text-[10px] text-[#8e8e93] font-bold uppercase tracking-wider block mt-1">
                      {settings.language === 'my' ? 'လစဉ်သုံးစွဲမှုအခြေအနေ' : 'MONTHLY SPENDING HEALTH'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isExceeded ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff3b30]/10 text-[#ff3b30] text-[10px] font-extrabold border border-[#ff3b30]/20 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30] animate-pulse" />
                      {t('overBudget') || 'Over Budget!'}
                    </span>
                  ) : percent >= 75 ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff9500]/10 text-[#ff9500] text-[10px] font-extrabold border border-[#ff9500]/20 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff9500] animate-pulse" />
                      {settings.language === 'my' ? 'သတိပြုစရာ' : 'Near Limit'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#34c759]/10 text-[#34c759] text-[10px] font-extrabold border border-[#34c759]/20 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#34c759] animate-pulse" />
                      {settings.language === 'my' ? 'အခြေအနေကောင်း' : 'On Track'}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar & Amount Summary */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs font-bold font-mono">
                  <span className="text-[#8e8e93]">
                    {settings.language === 'my' ? 'သုံးစွဲပြီး:' : 'Spent:'} <span className="text-[#1c1c1e] dark:text-white">{formatAmount(spent)}</span>
                  </span>
                  <span className="text-[#8e8e93]">
                    {settings.language === 'my' ? 'ကန့်သတ်ချက်:' : 'Limit:'} <span className="text-[#1c1c1e] dark:text-white">{formatAmount(activeBudget.limit)}</span>
                  </span>
                </div>

                <div className="w-full h-3.5 bg-[#f2f2f7] dark:bg-white/10 rounded-full overflow-hidden p-[2px] border border-[#e5e5ea] dark:border-white/5 shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      isExceeded
                        ? 'bg-gradient-to-r from-[#ff3b30] to-[#ff453a] shadow-[0_0_10px_rgba(255,59,48,0.4)]'
                        : percent >= 75
                          ? 'bg-gradient-to-r from-[#ff9500] to-[#ffaa00] shadow-[0_0_10px_rgba(255,149,0,0.4)]'
                          : 'bg-gradient-to-r from-[#34c759] to-[#30d158] shadow-[0_0_10px_rgba(52,199,89,0.4)]'
                    }`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-semibold text-[#8e8e93]">
                  <span className="font-mono">
                    {percent.toFixed(1)}% {settings.language === 'my' ? 'ဘတ်ဂျက်သုံးစွဲပြီး' : 'budget spent'}
                  </span>
                  <span className={`font-mono font-bold ${isExceeded ? 'text-[#ff3b30]' : 'text-[#34c759]'}`}>
                    {isExceeded 
                      ? `${settings.language === 'my' ? 'ကျော်လွန်:' : 'Over:'} +${formatAmount(Math.abs(remainingAmount))}`
                      : `${settings.language === 'my' ? 'ကျန်ရှိ:' : 'Remaining:'} ${formatAmount(remainingAmount)}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#f2f2f7] dark:border-[#2c2c2e]">
                <span className="text-[10px] text-[#8e8e93] font-bold tracking-wider uppercase">
                  {settings.language === 'my' ? 'ဘတ်ဂျက်ပြင်ဆင်ရန် နှိပ်ပါ' : 'ADJUST YOUR PARAMETERS'}
                </span>
                <button
                  id="adjust-overall-budget"
                  onClick={() => onSelectTab('budgets')}
                  className="text-xs font-extrabold text-[#007aff] hover:bg-[#007aff]/10 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all duration-200 cursor-pointer border-0 shrink-0"
                >
                  <span>{t('edit')}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Recent Activities Panel */}
      <div className="p-6 ios-glass rounded-[2rem] border border-black/5 dark:border-white/5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#f2f2f7] dark:border-[#2c2c2e] pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#007aff]/10 text-[#007aff] flex items-center justify-center shrink-0 border border-[#007aff]/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#1c1c1e] dark:text-white leading-none">
                {t('recentTransactions')}
              </h3>
              <span className="text-[10px] text-[#8e8e93] font-bold uppercase tracking-wider block mt-1">
                {settings.language === 'my' ? 'လတ်တလော ဝင်/ထွက်မှတ်တမ်းများ' : 'LATEST LEDGER ACTIVITIES'}
              </span>
            </div>
          </div>
          
          <button
            id="view-all-tx"
            onClick={() => onSelectTab('transactions')}
            className="text-xs font-extrabold text-[#007aff] hover:underline bg-[#007aff]/10 hover:bg-[#007aff]/20 px-3.5 py-1.5 rounded-full transition-all cursor-pointer border-0 flex items-center gap-1"
          >
            <span>{t('all')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {dashboardFilteredTransactions.slice(0, 5).map((tx) => (
            <DashboardRecentTxItem
              key={tx.id}
              tx={tx}
              style={getCategoryStyle(tx.category, categoryColors)}
              translatedCategory={tc(tx.category)}
              formattedDate={formatDateDMY(tx.date)}
              formattedAmount={formatAmount(tx.amount)}
              categoryIcons={categoryIcons}
              onClick={() => {
                setEditingTxInAddPage(tx);
                onSelectTab('add-transaction');
              }}
            />
          ))}

          {dashboardFilteredTransactions.length === 0 && (
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 text-[#8e8e93] flex items-center justify-center mx-auto">
                <History className="w-6 h-6 opacity-40" />
              </div>
              <p className="text-xs text-[#8e8e93]">
                {t('noTransactions')}
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditingTxInAddPage(null);
                  onSelectTab('add-transaction');
                }}
                className="h-8 px-4 inline-flex items-center justify-center bg-[#007aff] text-white rounded-full text-xs font-bold hover:bg-[#007aff]/90 transition-all cursor-pointer border-0"
              >
                + {t('quickAdd')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
