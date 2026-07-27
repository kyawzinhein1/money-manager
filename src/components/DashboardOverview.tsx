import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  ChevronDown,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  PiggyBank,
  FileDown,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  History
} from 'lucide-react';
import { Transaction, Budget, Settings } from '../types';
import { getCategoryStyle } from '../utils/categoryStyle';

interface DashboardOverviewProps {
  t: (key: string) => string;
  tc: (key: string) => string;
  settings: Settings;
  selectedMonth: string;
  selectedYear: string;
  setSelectedMonth: (m: string) => void;
  setSelectedYear: (y: string) => void;
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
}

interface DashboardRecentTxItemProps {
  tx: Transaction;
  style: { bg: string; text: string; border: string };
  translatedCategory: string;
  formattedDate: string;
  formattedAmount: string;
}

const DashboardRecentTxItem: React.FC<DashboardRecentTxItemProps> = React.memo(({
  tx,
  style,
  translatedCategory,
  formattedDate,
  formattedAmount
}) => {
  return (
    <div
      className="group flex items-center justify-between p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 fast-render-row"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${style.bg} ${style.text} ${style.border}`}
        >
          {tx.type === 'income' ? (
            <ArrowUpRight className="w-5 h-5" />
          ) : (
            <ArrowDownLeft className="w-5 h-5" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-[#1c1c1e] dark:text-[#f2f2f7] truncate leading-tight">
            {tx.description}
          </p>
          <span className="text-[10px] text-[#8e8e93] font-mono block mt-1 uppercase font-bold tracking-wider">
            {translatedCategory} | {formattedDate}
          </span>
        </div>
      </div>
      <span
        className={`text-sm md:text-base font-extrabold font-mono whitespace-nowrap leading-none ${
          tx.type === 'income' ? 'text-[#34c759]' : 'text-[#ff3b30]'
        }`}
      >
        {tx.type === 'income' ? '+' : '-'}{formattedAmount}
      </span>
    </div>
  );
});

export const DashboardOverview: React.FC<DashboardOverviewProps> = React.memo(({
  t,
  tc,
  settings,
  selectedMonth,
  selectedYear,
  setSelectedMonth,
  setSelectedYear,
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
}) => {
  return (
    <div className="space-y-6" id="view-dashboard">
      {/* Global Date Range Switcher */}
      <div className="relative z-40 p-4 ios-glass rounded-[2rem] flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#007aff]/10 dark:bg-[#007aff]/15 rounded-full flex items-center justify-center text-[#007aff] shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-[#8e8e93] uppercase tracking-wider font-sans">
            Filter Range
          </span>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
          {/* Month Dropdown Menu */}
          <div className={`relative font-sans flex-1 sm:flex-initial w-full sm:w-[100px] ${showMonthMenu ? 'z-50' : 'z-10'}`} id="month-dropdown-container">
            <button
              id="month-dropdown-btn"
              onClick={() => {
                setShowMonthMenu(!showMonthMenu);
                setShowYearMenu(false);
              }}
              className="w-full flex items-center justify-between gap-1.5 h-8 px-2 bg-[#f2f2f7] dark:bg-[#2c2c2e] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-[#1c1c1e] dark:text-[#f2f2f7] rounded-full text-xs font-bold transition-all cursor-pointer border-0"
            >
              <span className="truncate">{monthOptions.find(m => m.value === selectedMonth)?.label || selectedMonth}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#8e8e93] shrink-0" />
            </button>

            <AnimatePresence>
              {showMonthMenu && (
                <>
                  <div
                    className="fixed inset-0 z-30 bg-transparent"
                    onClick={() => setShowMonthMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-1 w-full min-w-[100px] max-h-48 overflow-y-auto rounded-2xl bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-3xl border border-white/50 dark:border-white/12 shadow-2xl z-50 p-1.5 space-y-0.5 scrollbar-thin gpu-layer"
                  >
                    {monthOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setSelectedMonth(opt.value);
                          setShowMonthMenu(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer ${
                          selectedMonth === opt.value
                            ? 'bg-[#007aff] text-white'
                            : 'bg-transparent text-[#1c1c1e] dark:text-[#f2f2f7] hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Year Dropdown Menu */}
          <div className={`relative font-sans flex-1 sm:flex-initial w-full sm:w-[90px] ${showYearMenu ? 'z-50' : 'z-10'}`} id="year-dropdown-container">
            <button
              id="year-dropdown-btn"
              onClick={() => {
                setShowYearMenu(!showYearMenu);
                setShowMonthMenu(false);
              }}
              className="w-full flex items-center justify-between gap-1.5 h-8 px-2 bg-[#f2f2f7] dark:bg-[#2c2c2e] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-[#1c1c1e] dark:text-[#f2f2f7] rounded-full text-xs font-bold transition-all cursor-pointer border-0"
            >
              <span className="truncate">{selectedYear === 'all' ? (settings.language === 'my' ? 'နှစ်အားလုံး' : 'All Years') : selectedYear}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#8e8e93] shrink-0" />
            </button>

            <AnimatePresence>
              {showYearMenu && (
                <>
                  <div
                    className="fixed inset-0 z-30 bg-transparent"
                    onClick={() => setShowYearMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-1 w-full min-w-[90px] max-h-48 overflow-y-auto rounded-2xl bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-3xl border border-white/50 dark:border-white/12 shadow-2xl z-50 p-1.5 space-y-0.5 scrollbar-thin gpu-layer"
                  >
                    {availableYears.map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => {
                          setSelectedYear(yr);
                          setShowYearMenu(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer ${
                          selectedYear === yr
                            ? 'bg-[#007aff] text-white'
                            : 'bg-transparent text-[#1c1c1e] dark:text-[#f2f2f7] hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
                        }`}
                      >
                        {yr}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedYear('all');
                        setShowYearMenu(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer ${
                        selectedYear === 'all'
                          ? 'bg-[#007aff] text-white'
                          : 'bg-transparent text-[#1c1c1e] dark:text-[#f2f2f7] hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
                      }`}
                    >
                      {settings.language === 'my' ? 'နှစ်အားလုံး' : 'All Years'}
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Reset Button */}
          <button
            id="dashboard-date-reset-btn"
            onClick={() => {
              setSelectedMonth(new Date().toISOString().substring(5, 7));
              setSelectedYear(new Date().toISOString().substring(0, 4));
            }}
            className="flex-1 sm:flex-initial h-8 px-4 flex items-center justify-center bg-[#007aff]/10 hover:bg-[#007aff]/20 text-[#007aff] rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-w-[80px]"
            title="Reset to current month"
          >
            <span className="truncate">{t('thisMonth')}</span>
          </button>
        </div>
      </div>

      {/* Welcome Grid - Apple Card Style with Gradient Accent */}
      <div className="ios-glass text-[#1c1c1e] dark:text-[#f2f2f7] rounded-[2.25rem] p-6 relative overflow-hidden transition-all duration-300 border border-white/60 dark:border-white/10 shadow-lg shadow-black/[0.03]">
        {/* Ambient lighting backdrop blob */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#007aff]/10 dark:bg-[#007aff]/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left side: Balance */}
          <div className="md:col-span-7 space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-[#34c759] animate-pulse shadow-xs shadow-[#34c759]" />
              <span className="text-[#8e8e93] text-[10px] md:text-xs font-black uppercase tracking-widest font-sans">
                {t('totalBalance')}
              </span>
              <span className="text-[10px] px-3 py-0.5 rounded-full bg-[#f2f2f7] dark:bg-[#2c2c2e] text-[#1c1c1e] dark:text-[#f2f2f7] font-extrabold border border-black/5 dark:border-white/5">
                {selectedMonth === 'all' ? t('allMonths') : selectedMonth}/{selectedYear === 'all' ? t('allYears') : selectedYear}
              </span>
            </div>
            <div className="flex items-baseline gap-2.5 flex-wrap">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#1c1c1e] dark:text-white font-sans tracking-tight leading-none">
                {formatAmount(totals.balance)}
              </h2>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                totals.balance >= 0 
                  ? 'bg-[#34c759]/10 text-[#34c759] border-[#34c759]/20' 
                  : 'bg-[#ff3b30]/10 text-[#ff3b30] border-[#ff3b30]/20'
              }`}>
                {totals.balance >= 0 ? '✓ Healthy' : '⚠ Overdraft'}
              </span>
            </div>
          </div>

          {/* Right side: Income/Expense Side-by-Side */}
          <div className="md:col-span-5 grid grid-cols-2 gap-3">
            {/* Income Mini Card */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-br from-[#34c759]/10 to-[#34c759]/5 border border-[#34c759]/20 shadow-xs hover:scale-[1.02] transition-transform">
              <div className="w-9 h-9 rounded-2xl bg-[#34c759] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#34c759]/30">
                <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <span className="text-[#8e8e93] text-[9px] uppercase font-black block tracking-wider">{t('income')}</span>
                <span className="font-black text-xs md:text-sm text-[#34c759] font-mono truncate block mt-0.5">
                  {formatAmount(totals.income)}
                </span>
              </div>
            </div>

            {/* Expense Mini Card */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-br from-[#ff3b30]/10 to-[#ff3b30]/5 border border-[#ff3b30]/20 shadow-xs hover:scale-[1.02] transition-transform">
              <div className="w-9 h-9 rounded-2xl bg-[#ff3b30] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#ff3b30]/30">
                <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <span className="text-[#8e8e93] text-[9px] uppercase font-black block tracking-wider">{t('expense')}</span>
                <span className="font-black text-xs md:text-sm text-[#ff3b30] font-mono truncate block mt-0.5">
                  {formatAmount(totals.expense)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Shortcuts Bar */}
      <div className="p-2 bg-white/40 dark:bg-black/20 rounded-2xl flex items-center justify-between gap-1 no-print border border-white/20 dark:border-white/5 shadow-xs">
        <button
          id="quick-add-tx"
          onClick={() => {
            setEditingTxInAddPage(null);
            onSelectTab('add-transaction');
          }}
          className="flex-1 h-11 flex items-center justify-center gap-2 px-3 rounded-xl hover:bg-[#007aff]/10 dark:hover:bg-[#007aff]/15 text-[#007aff] transition-all duration-200 cursor-pointer group border-0"
        >
          <div className="w-6 h-6 rounded-full bg-[#007aff]/10 flex items-center justify-center text-[#007aff] shrink-0 group-hover:scale-105 transition-transform">
            <Plus className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold leading-none">{t('quickAdd')}</span>
        </button>

        <div className="w-[1px] h-5 bg-[#e5e5ea] dark:bg-white/10 shrink-0" />

        <button
          id="quick-set-budget"
          onClick={() => onSelectTab('budgets')}
          className="flex-1 h-11 flex items-center justify-center gap-2 px-3 rounded-xl hover:bg-[#34c759]/10 dark:hover:bg-[#34c759]/15 text-[#34c759] transition-all duration-200 cursor-pointer group border-0"
        >
          <div className="w-6 h-6 rounded-full bg-[#34c759]/10 flex items-center justify-center text-[#34c759] shrink-0 group-hover:scale-105 transition-transform">
            <PiggyBank className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold leading-none">{t('quickBudget')}</span>
        </button>

        <div className="w-[1px] h-5 bg-[#e5e5ea] dark:bg-white/10 shrink-0" />

        <button
          id="quick-export-pdf"
          onClick={onExportPDF}
          className="flex-1 h-11 flex items-center justify-center gap-2 px-3 rounded-xl hover:bg-[#af52de]/10 dark:hover:bg-[#af52de]/15 text-[#af52de] transition-all duration-200 cursor-pointer group border-0"
        >
          <div className="w-6 h-6 rounded-full bg-[#af52de]/10 flex items-center justify-center text-[#af52de] shrink-0 group-hover:scale-105 transition-transform">
            <FileDown className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold leading-none">{t('quickPDF')}</span>
        </button>
      </div>

      {/* Mini Ledger and Analytics Grid */}
      <div className="space-y-6">
        {/* Budgets Summary Mini Card */}
        <div className="p-6 ios-glass rounded-[2rem] border border-black/5 dark:border-white/5 space-y-5 shadow-xs">
          {(() => {
            const activeBudget = budgets[0];
            if (!activeBudget) {
              return (
                <div className="text-center py-8">
                  <p className="text-xs text-[#8e8e93] mb-2">{t('noBudgetsSet')}</p>
                  <button
                    id="set-initial-budget"
                    onClick={() => onSelectTab('budgets')}
                    className="h-9 px-4 inline-flex items-center justify-center bg-[#34c759] text-white rounded-full text-xs font-bold transition-all hover:opacity-90 shadow-xs cursor-pointer border-0"
                  >
                    {settings.language === 'my' ? "ဘတ်ဂျက်သတ်မှတ်ရန်" : "Set Budget Limit"}
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
            const overspentAmount = Math.abs(remainingAmount);

            return (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-[#f2f2f7] dark:border-[#2c2c2e] pb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#34c759]/10 text-[#34c759] flex items-center justify-center shrink-0">
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
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff3b30]/10 text-[#ff3b30] text-[10px] font-extrabold border border-[#ff3b30]/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30] animate-pulse" />
                        {t('overBudget') || 'Over Budget!'}
                      </span>
                    ) : percent >= 75 ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff9500]/10 text-[#ff9500] text-[10px] font-extrabold border border-[#ff9500]/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ff9500] animate-pulse" />
                        {settings.language === 'my' ? 'သတိပြုစရာ' : 'Near Limit'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#34c759]/10 text-[#34c759] text-[10px] font-extrabold border border-[#34c759]/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#34c759] animate-pulse" />
                        {settings.language === 'my' ? 'အခြေအနေကောင်း' : 'On Track'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Executive 3-Column Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
                  <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.03] dark:border-white/[0.03] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#007aff]/10 text-[#007aff] flex items-center justify-center shrink-0">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-[#8e8e93] font-bold uppercase tracking-wider block">
                        {t('overallMonthlyBudget') || 'Monthly Budget'}
                      </span>
                      <span className="font-extrabold text-xs md:text-sm text-[#1c1c1e] dark:text-white font-mono block mt-0.5 truncate">
                        {formatAmount(activeBudget.limit)}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.03] dark:border-white/[0.03] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#ff9500]/10 text-[#ff9500] flex items-center justify-center shrink-0">
                      <ArrowDownLeft className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-[#8e8e93] font-bold uppercase tracking-wider block">
                        {t('totalExpenseSpent') || 'Spent'}
                      </span>
                      <span className="font-extrabold text-xs md:text-sm text-[#ff3b30] font-mono block mt-0.5 truncate">
                        {formatAmount(spent)}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.03] dark:border-white/[0.03] flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isExceeded ? 'bg-[#ff3b30]/10 text-[#ff3b30]' : 'bg-[#34c759]/10 text-[#34c759]'}`}>
                      {isExceeded ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-[#8e8e93] font-bold uppercase tracking-wider block">
                        {isExceeded ? (t('overBudgetLimit') || 'Over Budget') : (t('availableRemainingSpend') || 'Remaining')}
                      </span>
                      <span className={`font-extrabold text-xs md:text-sm font-mono block mt-0.5 truncate ${isExceeded ? 'text-[#ff3b30]' : 'text-[#34c759]'}`}>
                        {isExceeded ? formatAmount(overspentAmount) : formatAmount(remainingAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 pt-1">
                  <div className="w-full h-3 bg-[#f2f2f7] dark:bg-white/10 rounded-full overflow-hidden p-[2px] border border-[#e5e5ea] dark:border-white/5 shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out ${
                        isExceeded
                          ? 'bg-gradient-to-r from-[#ff3b30] to-[#ff453a] shadow-[0_0_8px_rgba(255,59,48,0.3)]'
                          : percent >= 75
                            ? 'bg-gradient-to-r from-[#ff9500] to-[#ffaa00] shadow-[0_0_8px_rgba(255,149,0,0.3)]'
                            : 'bg-gradient-to-r from-[#34c759] to-[#30d158] shadow-[0_0_8px_rgba(52,199,89,0.3)]'
                      }`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#8e8e93]">
                    <span className="font-mono">
                      {percent.toFixed(1)}% {settings.language === 'my' ? 'ဘတ်ဂျက်သုံးစွဲပြီး' : 'budget spent'}
                    </span>
                    <span className="italic block max-w-[70%] text-right truncate">
                      {isExceeded
                        ? (settings.language === 'my' ? "သတိပေးချက် - လစဉ်ဘတ်ဂျက် ကန့်သတ်ချက်ကျော်လွန်သွားပါပြီ။" : "Alert: Monthly budget limit exceeded!")
                        : percent >= 75
                          ? (settings.language === 'my' ? "သတိပြုရန် - ဘတ်ဂျက်ကုန်ခါနီး ဖြစ်နေပါပြီ။" : "Caution: You have used over 75% of your budget.")
                          : (settings.language === 'my' ? "သုံးစွဲမှုအခြေအနေ စိတ်ချရပါသည်" : "Excellent control! Your monthly budget is safe.")
                      }
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
                    className="text-xs font-bold text-[#007aff] hover:bg-[#007aff]/5 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all duration-200 cursor-pointer border-0 shrink-0"
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
              <div className="w-10 h-10 rounded-2xl bg-[#007aff]/10 text-[#007aff] flex items-center justify-center shrink-0">
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
              className="text-xs font-extrabold text-[#007aff] hover:underline bg-[#007aff]/5 hover:bg-[#007aff]/10 px-3 py-1.5 rounded-full transition-all cursor-pointer border-0"
            >
              {t('all')}
            </button>
          </div>

          <div className="space-y-2.5">
            {dashboardFilteredTransactions.slice(0, 5).map((tx) => (
              <DashboardRecentTxItem
                key={tx.id}
                tx={tx}
                style={getCategoryStyle(tx.category)}
                translatedCategory={tc(tx.category)}
                formattedDate={formatDateDMY(tx.date)}
                formattedAmount={formatAmount(tx.amount)}
              />
            ))}
            {dashboardFilteredTransactions.length === 0 && (
              <div className="text-center py-10">
                <p className="text-xs text-[#8e8e93]">
                  {t('noTransactions')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
