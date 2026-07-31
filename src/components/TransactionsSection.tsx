import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useDebounce } from '../utils/useDebounce';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Filter,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  Download,
  TrendingUp,
  TrendingDown,
  Coins,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  List,
  XCircle,
  HelpCircle,
  FolderOpen
} from 'lucide-react';
import { Transaction, TransactionType, Language } from '../types';
import { TRANSLATIONS, CATEGORY_TRANSLATIONS } from '../translations';
import { generateLedgerPDF } from '../utils/pdfGenerator';
import { getCategoryStyle, CategoryStyle } from '../utils/categoryStyle';

interface TransactionsSectionProps {
  transactions: Transaction[];
  currencySymbol: string;
  language: Language;
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  formatAmount: (amount: number) => string;
  incomeCategories?: string[];
  expenseCategories?: string[];
  onAddTransactionTrigger?: () => void;
  onEditTransactionTrigger?: (tx: Transaction) => void;
  categoryColors?: Record<string, string>;
}

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Gift', 'Others'];
const EXPENSE_CATEGORIES = [
  'Food',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Housing',
  'Utilities',
  'Healthcare',
  'Education',
  'Others'
];

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return isMobile;
};

interface TransactionRowProps {
  tx: Transaction;
  formattedDate: string;
  categoryStyle: CategoryStyle;
  translatedCategory: string;
  formattedAmount: string;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

const DesktopTransactionRow: React.FC<TransactionRowProps> = React.memo(({
  tx,
  formattedDate,
  categoryStyle,
  translatedCategory,
  formattedAmount,
  onEdit,
  onDelete
}) => {
  return (
    <tr
      className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] text-sm fast-render-row"
    >
      <td className="p-4.5 font-mono text-xs text-[#8e8e93] font-extrabold">
        {formattedDate}
      </td>
      <td className="p-4.5 whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}
          style={categoryStyle.style}
        >
          {tx.type === 'income' ? (
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <ArrowDownLeft className="w-3.5 h-3.5 shrink-0" />
          )}
          {translatedCategory}
        </span>
      </td>
      <td className="p-4.5 text-[#1c1c1e] dark:text-[#f2f2f7] font-extrabold max-w-[240px] truncate">
        {tx.description}
      </td>
      <td
        className={`p-4.5 text-right font-black font-mono whitespace-nowrap text-base ${
          tx.type === 'income' ? 'text-[#34c759]' : 'text-[#ff3b30]'
        }`}
      >
        {tx.type === 'income' ? '+' : '-'}{formattedAmount}
      </td>
      <td className="p-4.5">
        <div className="flex items-center justify-center gap-1.5">
          <button
            id={`edit-tx-${tx.id}`}
            onClick={() => onEdit(tx)}
            className="w-10 h-10 flex items-center justify-center text-[#8e8e93] hover:text-[#007aff] hover:bg-[#007aff]/10 rounded-xl cursor-pointer border-0 bg-transparent"
            title="Edit Ledger Entry"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            id={`delete-tx-${tx.id}`}
            onClick={() => onDelete(tx.id)}
            className="w-10 h-10 flex items-center justify-center text-[#8e8e93] hover:text-[#ff3b30] hover:bg-[#ff3b30]/10 rounded-xl cursor-pointer border-0 bg-transparent"
            title="Remove ledger entry"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
});

const MobileTransactionCard: React.FC<TransactionRowProps> = React.memo(({
  tx,
  formattedDate,
  categoryStyle,
  translatedCategory,
  formattedAmount,
  onEdit,
  onDelete
}) => {
  return (
    <div
      className="p-4 space-y-3 hover:bg-black/5 dark:hover:bg-white/5 fast-render-row"
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}
          style={categoryStyle.style}
        >
          {tx.type === 'income' ? (
            <ArrowUpRight className="w-3 h-3 shrink-0" />
          ) : (
            <ArrowDownLeft className="w-3 h-3 shrink-0" />
          )}
          {translatedCategory}
        </span>
        <span
          className={`text-base font-black font-mono ${
            tx.type === 'income' ? 'text-[#34c759]' : 'text-[#ff3b30]'
          }`}
        >
          {tx.type === 'income' ? '+' : '-'}{formattedAmount}
        </span>
      </div>

      <div className="flex items-start justify-between gap-3 pt-0.5">
        <div className="space-y-1 min-w-0">
          <p className="text-sm font-extrabold text-[#1c1c1e] dark:text-[#f2f2f7] leading-snug truncate">
            {tx.description}
          </p>
          <p className="text-[11px] font-extrabold text-[#8e8e93] font-mono leading-none">
            {formattedDate}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 self-center">
          <button
            id={`edit-tx-mob-${tx.id}`}
            onClick={() => onEdit(tx)}
            className="w-9 h-9 flex items-center justify-center text-[#8e8e93] hover:text-[#007aff] hover:bg-[#007aff]/10 bg-black/[0.03] dark:bg-white/[0.05] border-0 rounded-xl cursor-pointer"
            title="Edit entry"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            id={`delete-tx-mob-${tx.id}`}
            onClick={() => onDelete(tx.id)}
            className="w-9 h-9 flex items-center justify-center text-[#8e8e93] hover:text-[#ff3b30] hover:bg-[#ff3b30]/10 bg-black/[0.03] dark:bg-white/[0.05] border-0 rounded-xl cursor-pointer"
            title="Delete entry"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
});

export const TransactionsSection: React.FC<TransactionsSectionProps> = React.memo(({
  transactions,
  currencySymbol,
  language,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  formatAmount,
  incomeCategories = INCOME_CATEGORIES,
  expenseCategories = EXPENSE_CATEGORIES,
  onAddTransactionTrigger,
  onEditTransactionTrigger,
  categoryColors = {},
}) => {
  const isMobile = useIsMobile();
  const t = useCallback((key: string) => TRANSLATIONS[language][key] || key, [language]);
  const tc = useCallback((cat: string) => CATEGORY_TRANSLATIONS[language][cat] || cat, [language]);

  const formatDateDMY = useCallback((dateString: string): string => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  }, []);

  // View Mode & Calendar State
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const todayObj = new Date();
  const [calendarYear, setCalendarYear] = useState<number>(todayObj.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState<number>(todayObj.getMonth() + 1); // 1-12
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Modal / Form State
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Form Fields
  const [formType, setFormType] = useState<TransactionType>('expense');
  const [formCategory, setFormCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().substring(0, 10));
  const [formDescription, setFormDescription] = useState('');

  // Validation Error State
  const [errors, setErrors] = useState<{ amount?: string; date?: string }>({});

  // Handle Type switch in Form
  const handleTypeChange = (type: TransactionType) => {
    setFormType(type);
    setFormCategory(type === 'income' ? incomeCategories[0] : expenseCategories[0]);
  };

  const handleOpenAdd = () => {
    if (onAddTransactionTrigger) {
      onAddTransactionTrigger();
      return;
    }
    setEditingTx(null);
    setFormType('expense');
    setFormCategory(expenseCategories[0]);
    setFormAmount('');
    setFormDate(new Date().toISOString().substring(0, 10));
    setFormDescription('');
    setErrors({});
    setIsOpenForm(true);
  };

  const handleOpenEdit = useCallback((tx: Transaction) => {
    if (onEditTransactionTrigger) {
      onEditTransactionTrigger(tx);
      return;
    }
    setEditingTx(tx);
    setFormType(tx.type);
    setFormCategory(tx.category);
    setFormAmount(tx.amount.toString());
    setFormDate(tx.date);
    setFormDescription(tx.description);
    setErrors({});
    setIsOpenForm(true);
  }, [onEditTransactionTrigger]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { amount?: string; date?: string } = {};

    // Validate formAmount
    if (!formAmount.trim()) {
      newErrors.amount = t('validationAmountRequired');
    } else {
      const amount = parseFloat(formAmount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = t('validationAmountPositive');
      }
    }

    // Validate formDate
    if (!formDate.trim()) {
      newErrors.date = t('validationDateRequired');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const amount = parseFloat(formAmount);

    const txData = {
      type: formType,
      category: formCategory,
      amount,
      date: formDate,
      description: formDescription.trim() || formCategory,
    };

    if (editingTx) {
      onEditTransaction({
        ...editingTx,
        ...txData,
      });
    } else {
      onAddTransaction(txData);
    }

    setIsOpenForm(false);
  };

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    const sTerm = debouncedSearchTerm.trim().toLowerCase();
    return transactions
      .filter((tx) => {
        const matchesSearch =
          !sTerm ||
          tx.description.toLowerCase().includes(sTerm) ||
          tx.category.toLowerCase().includes(sTerm);
        const matchesType = typeFilter === 'all' || tx.type === typeFilter;
        const matchesCategory = categoryFilter === 'All' || tx.category === categoryFilter;
        return matchesSearch && matchesType && matchesCategory;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, debouncedSearchTerm, typeFilter, categoryFilter]);

  // Pagination & High-Performance Scaling State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20);

  // Auto-reset page position on search query / filter criteria changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, categoryFilter, typeFilter, pageSize]);

  const totalPages = useMemo(() => {
    if (pageSize === 0) return 1;
    return Math.ceil(filteredTransactions.length / pageSize) || 1;
  }, [filteredTransactions.length, pageSize]);

  const paginatedTransactions = useMemo(() => {
    if (pageSize === 0) return filteredTransactions;
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  // Reset Filters trigger
  const hasActiveFilters = useMemo(() => searchTerm !== '' || categoryFilter !== 'All' || typeFilter !== 'all', [searchTerm, categoryFilter, typeFilter]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setCategoryFilter('All');
    setTypeFilter('all');
  }, []);

  // Real-Time summary metrics based on active filter criteria!
  const { filteredIncomeTotal, filteredExpenseTotal, filteredNetBalance } = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (let i = 0; i < filteredTransactions.length; i++) {
      const tx = filteredTransactions[i];
      if (tx.type === 'income') {
        income += tx.amount;
      } else {
        expense += tx.amount;
      }
    }
    return {
      filteredIncomeTotal: income,
      filteredExpenseTotal: expense,
      filteredNetBalance: income - expense,
    };
  }, [filteredTransactions]);

  // CSV Export action
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;
    setShowExportMenu(false);

    // Build human-friendly columns
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
    const rows = filteredTransactions.map((tx) => [
      tx.date,
      tx.type.toUpperCase(),
      tx.category,
      tx.description.replace(/"/g, '""'),
      tx.amount,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((val) => `"${val}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Ledger_Report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Export action
  const handleExportPDF = () => {
    if (filteredTransactions.length === 0) return;
    setShowExportMenu(false);
    generateLedgerPDF({
      transactions: filteredTransactions,
      incomeTotal: filteredIncomeTotal,
      expenseTotal: filteredExpenseTotal,
      netBalance: filteredNetBalance,
      currencySymbol,
      language,
      formatAmount
    });
  };

  return (
    <div className="space-y-6" id="transactions-section">
      {/* Premium Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
            <FileSpreadsheet className="w-5.5 h-5.5 text-[#007aff]" />
            {t('transactions')}
          </h2>
          <p className="text-xs text-[#8e8e93]">
            {language === 'my'
              ? 'သင့်ငွေဝင်/ငွေထွက်မှတ်တမ်းများကို စနစ်တကျရှာဖွေစီမံပါ'
              : 'Perform advanced queries, export reports, and balance your ledger'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Export Report Action */}
          <div className="relative font-sans animate-fade-in flex-1 sm:flex-none" id="export-menu-container">
            <button
              id="export-dropdown-btn"
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={filteredTransactions.length === 0}
              className="w-full sm:w-auto flex items-center justify-center gap-2 h-11 px-4 border border-black/10 dark:border-white/10 hover:bg-black/[0.03] dark:hover:bg-white/[0.05] text-[#1c1c1e] dark:text-[#f2f2f7] disabled:opacity-40 rounded-full text-xs font-bold transition-all cursor-pointer bg-transparent"
              title={language === 'my' ? 'ငွေစာရင်းအစီရင်ခံစာထုတ်ရန်' : 'Export Ledger Report'}
            >
              <Download className="w-4 h-4 text-[#007aff]" />
              <span>{language === 'my' ? 'ထုတ်ယူရန်' : 'Export'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#8e8e93]" />
            </button>

            <AnimatePresence>
              {showExportMenu && (
                <>
                  {/* Backdrop overlay */}
                  <div
                    className="fixed inset-0 z-30 bg-transparent"
                    onClick={() => setShowExportMenu(false)}
                  />
                  
                  {/* Dropdown Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-56 rounded-2xl bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-3xl border border-white/50 dark:border-white/12 shadow-2xl z-40 p-2 space-y-0.5"
                  >
                    <div className="px-3 py-1.5 text-[10px] font-extrabold text-[#8e8e93] uppercase tracking-wider">
                      {language === 'my' ? 'ဖိုင်အမျိုးအစားရွေးပါ' : 'Select Export Format'}
                    </div>

                    {/* CSV Option */}
                    <button
                      id="export-csv-opt"
                      type="button"
                      onClick={handleExportCSV}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.05] text-[#1c1c1e] dark:text-[#f2f2f7] transition-all text-left cursor-pointer border-0 bg-transparent"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold leading-tight">CSV Spreadsheet</p>
                        <p className="text-[10px] text-[#8e8e93] leading-none mt-1">For Excel / Sheets</p>
                      </div>
                    </button>

                    {/* PDF Option */}
                    <button
                      id="export-pdf-opt"
                      type="button"
                      onClick={handleExportPDF}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.05] text-[#1c1c1e] dark:text-[#f2f2f7] transition-all text-left cursor-pointer border-0 bg-transparent"
                    >
                      <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold leading-tight">PDF Document</p>
                        <p className="text-[10px] text-[#8e8e93] leading-none mt-1">For Printing / Sharing</p>
                      </div>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Primary Call to Action */}
          <button
            id="add-tx-btn"
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-11 px-5.5 bg-[#007aff] hover:bg-[#007aff]/90 text-white rounded-full text-xs font-bold shadow-sm transition-all duration-200 cursor-pointer border-0 active:scale-95 shrink-0"
          >
            <Plus className="w-4.5 h-4.5" />
            {t('addTransaction')}
          </button>
        </div>
      </div>

      {/* View Mode Segmented Control Bar */}
      <div className="flex justify-center sm:justify-start">
        <div className="inline-flex items-center bg-[#f2f2f7] dark:bg-[#2c2c2e] p-1 rounded-2xl border border-black/5 dark:border-white/5 w-full sm:w-auto">
          <button
            id="view-mode-list-btn"
            type="button"
            onClick={() => setViewMode('list')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white dark:bg-[#1c1c1e] text-[#007aff] shadow-sm'
                : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white'
            }`}
          >
            <List className="w-4 h-4" />
            <span>{t('listView')}</span>
          </button>
          <button
            id="view-mode-calendar-btn"
            type="button"
            onClick={() => setViewMode('calendar')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer ${
              viewMode === 'calendar'
                ? 'bg-white dark:bg-[#1c1c1e] text-[#007aff] shadow-sm'
                : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{t('calendarView')}</span>
          </button>
        </div>
      </div>

      {/* Render View depending on viewMode (list vs calendar) */}
      {viewMode === 'calendar' ? (
        <div className="space-y-6">
          {/* iOS Style Calendar Card */}
          <div className="p-3.5 sm:p-6 ios-glass rounded-[2rem] sm:rounded-[2.5rem] border border-black/5 dark:border-white/5 space-y-4 sm:space-y-5 shadow-xs">
            {/* Calendar Header with Month/Year Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-[#007aff]/10 text-[#007aff] rounded-2xl">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#1c1c1e] dark:text-[#f2f2f7]">
                    {new Date(calendarYear, calendarMonth - 1, 1).toLocaleString(language === 'my' ? 'my-MM' : 'en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <p className="text-[11px] text-[#8e8e93] font-medium">
                    {language === 'my' ? 'နေ့စဉ် ဝင်ငွေ/ထွက်ငွေ ပြက္ခဒိန်' : 'Daily Income and Expense overview'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    if (calendarMonth === 1) {
                      setCalendarMonth(12);
                      setCalendarYear(calendarYear - 1);
                    } else {
                      setCalendarMonth(calendarMonth - 1);
                    }
                  }}
                  className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center text-[#1c1c1e] dark:text-white transition-all cursor-pointer border-0"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    setCalendarYear(now.getFullYear());
                    setCalendarMonth(now.getMonth() + 1);
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-[#007aff]/10 hover:bg-[#007aff]/20 text-[#007aff] text-xs font-extrabold transition-all cursor-pointer border-0"
                >
                  {language === 'my' ? 'ယနေ့' : 'Today'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (calendarMonth === 12) {
                      setCalendarMonth(1);
                      setCalendarYear(calendarYear + 1);
                    } else {
                      setCalendarMonth(calendarMonth + 1);
                    }
                  }}
                  className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center text-[#1c1c1e] dark:text-white transition-all cursor-pointer border-0"
                  title="Next Month"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Calendar Day Header Row */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center font-extrabold text-[10px] sm:text-xs text-[#8e8e93] pb-2 border-b border-black/5 dark:border-white/5 uppercase tracking-wider">
              <div>{language === 'my' ? 'တနင်္ဂနွေ' : 'Sun'}</div>
              <div>{language === 'my' ? 'တနင်္လာ' : 'Mon'}</div>
              <div>{language === 'my' ? 'အင်္ဂါ' : 'Tue'}</div>
              <div>{language === 'my' ? 'ဗုဒ္ဓဟူး' : 'Wed'}</div>
              <div>{language === 'my' ? 'ကြာသပတေး' : 'Thu'}</div>
              <div>{language === 'my' ? 'သောကြာ' : 'Fri'}</div>
              <div>{language === 'my' ? 'စနေ' : 'Sat'}</div>
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-3">
              {/* Offset empty cells */}
              {Array.from({ length: new Date(calendarYear, calendarMonth - 1, 1).getDay() }).map((_, idx) => (
                <div key={`offset-${idx}`} className="w-full aspect-square min-h-0 rounded-xl sm:rounded-2xl bg-black/[0.01] dark:bg-white/[0.01]" />
              ))}

              {/* Month days */}
              {Array.from({ length: new Date(calendarYear, calendarMonth, 0).getDate() }).map((_, idx) => {
                const dayNum = idx + 1;
                const monthStr = calendarMonth.toString().padStart(2, '0');
                const dayStr = dayNum.toString().padStart(2, '0');
                const dateKey = `${calendarYear}-${monthStr}-${dayStr}`;

                const dayTxs = transactions.filter(tx => tx.date === dateKey);
                let dayIncome = 0;
                let dayExpense = 0;
                dayTxs.forEach(tx => {
                  if (tx.type === 'income') dayIncome += tx.amount;
                  else dayExpense += tx.amount;
                });

                const isToday = dateKey === new Date().toISOString().substring(0, 10);

                return (
                  <button
                    key={dateKey}
                    type="button"
                    onClick={() => setSelectedCalendarDay(dateKey)}
                    className={`w-full aspect-square min-h-0 p-1 sm:p-1.5 md:p-2.5 rounded-xl sm:rounded-2xl border transition-all text-left flex flex-col justify-between overflow-hidden cursor-pointer group hover:scale-[1.02] ${
                      isToday
                        ? 'bg-[#007aff]/10 border-[#007aff]/40 shadow-xs z-1'
                        : 'bg-black/[0.02] dark:bg-white/[0.03] border-black/5 dark:border-white/5 hover:bg-black/[0.05] dark:hover:bg-white/[0.08]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full min-w-0">
                      <span className={`text-[10px] sm:text-xs md:text-sm font-black w-4.5 h-4.5 sm:w-6 sm:h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full shrink-0 ${
                        isToday ? 'bg-[#007aff] text-white' : 'text-[#1c1c1e] dark:text-[#f2f2f7]'
                      }`}>
                        {dayNum}
                      </span>
                      {dayTxs.length > 0 && (
                        <span className="text-[8px] sm:text-[9px] md:text-[10px] font-black px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded-full bg-black/10 dark:bg-white/10 text-[#8e8e93] shrink-0">
                          {dayTxs.length}
                        </span>
                      )}
                    </div>

                    <div className="space-y-0.5 w-full min-w-0 overflow-hidden">
                      {dayIncome > 0 && (
                        <span className="block text-[7.5px] sm:text-[9px] md:text-[10px] font-black text-[#34c759] bg-[#34c759]/15 px-0.5 sm:px-1 py-0.2 sm:py-0.5 rounded-md truncate leading-tight">
                          +{formatAmount(dayIncome)}
                        </span>
                      )}
                      {dayExpense > 0 && (
                        <span className="block text-[7.5px] sm:text-[9px] md:text-[10px] font-black text-[#ff3b30] bg-[#ff3b30]/15 px-0.5 sm:px-1 py-0.2 sm:py-0.5 rounded-md truncate leading-tight">
                          -{formatAmount(dayExpense)}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day Detail Pop-up Sheet / Modal */}
          <AnimatePresence>
            {selectedCalendarDay && (
              <div 
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
                onClick={() => setSelectedCalendarDay(null)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-lg bg-white dark:bg-[#1c1c1e] rounded-[2.5rem] shadow-2xl p-6 border border-white/20 dark:border-white/10 space-y-5 max-h-[85vh] flex flex-col"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3 shrink-0">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-2xl bg-[#007aff]/10 text-[#007aff]">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-[#1c1c1e] dark:text-[#f2f2f7]">
                          {t('dailyTransactionsFor')}
                        </h3>
                        <p className="text-xs font-bold text-[#8e8e93] font-mono">
                          {selectedCalendarDay}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedCalendarDay(null)}
                      className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white flex items-center justify-center transition-all cursor-pointer border-0"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Daily Totals Summary Row */}
                  {(() => {
                    const dayTxs = transactions.filter(tx => tx.date === selectedCalendarDay);
                    const dayIncome = dayTxs.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0);
                    const dayExpense = dayTxs.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);
                    const dayNet = dayIncome - dayExpense;

                    return (
                      <div className="grid grid-cols-3 gap-2 shrink-0">
                        <div className="p-3 rounded-2xl bg-[#34c759]/10 border border-[#34c759]/20 text-center">
                          <span className="block text-[9px] font-black uppercase text-[#34c759]">{t('income')}</span>
                          <span className="block text-xs font-black text-[#34c759] font-mono mt-0.5">+{formatAmount(dayIncome)}</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-[#ff3b30]/10 border border-[#ff3b30]/20 text-center">
                          <span className="block text-[9px] font-black uppercase text-[#ff3b30]">{t('expense')}</span>
                          <span className="block text-xs font-black text-[#ff3b30] font-mono mt-0.5">-{formatAmount(dayExpense)}</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 text-center">
                          <span className="block text-[9px] font-black uppercase text-[#8e8e93]">{t('netSavings')}</span>
                          <span className={`block text-xs font-black font-mono mt-0.5 ${dayNet >= 0 ? 'text-[#34c759]' : 'text-[#ff3b30]'}`}>
                            {formatAmount(dayNet)}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Transactions List */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                    {transactions.filter(tx => tx.date === selectedCalendarDay).length === 0 ? (
                      <div className="py-12 text-center text-[#8e8e93]">
                        <FolderOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p className="text-xs font-bold">{t('noTransactions')}</p>
                      </div>
                    ) : (
                      transactions.filter(tx => tx.date === selectedCalendarDay).map(tx => {
                        const style = getCategoryStyle(tx.category, categoryColors);
                        return (
                          <div
                            key={tx.id}
                            className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className={`p-2 rounded-xl text-xs font-extrabold border shrink-0 ${style.bg} ${style.text} ${style.border}`}>
                                {tx.category}
                              </span>
                              <p className="text-xs font-bold text-[#1c1c1e] dark:text-white truncate">
                                {tx.description || tx.category}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`text-xs font-black font-mono ${tx.type === 'income' ? 'text-[#34c759]' : 'text-[#ff3b30]'}`}>
                                {tx.type === 'income' ? '+' : '-'}{formatAmount(tx.amount)}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCalendarDay(null);
                                  handleOpenEdit(tx);
                                }}
                                className="p-1.5 text-[#8e8e93] hover:text-[#007aff] cursor-pointer border-0 bg-transparent"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteTransaction(tx.id);
                                }}
                                className="p-1.5 text-[#8e8e93] hover:text-[#ff3b30] cursor-pointer border-0 bg-transparent"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Advanced Filter, Search, Segmented Controls Container for List View */}
          <div className="p-5 ios-glass rounded-[2rem] border border-black/5 dark:border-white/5 space-y-4 shadow-xs">
        <div className="flex flex-col lg:flex-row gap-3.5 items-stretch lg:items-center">
          {/* Custom Styled Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 w-4.5 h-4.5 text-[#8e8e93]" />
            <input
              id="search-input"
              type="text"
              placeholder={t('searchDescription')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-10 py-3 bg-black/[0.03] dark:bg-white/[0.04] border border-transparent hover:border-black/5 dark:hover:border-white/5 rounded-2xl text-sm text-[#1c1c1e] dark:text-[#f2f2f7] placeholder-[#8e8e93] focus:outline-none focus:ring-2 focus:ring-[#007aff]/35 focus:bg-white dark:focus:bg-[#1c1c1e] transition-all duration-200"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-[#8e8e93] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Filters Row */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Apple Styled Type Segmented Control */}
            <div className="flex w-full sm:w-72 md:w-80 p-1 bg-black/[0.03] dark:bg-white/[0.04] rounded-full shrink-0 border border-black/[0.02] dark:border-white/[0.02] h-11 items-center">
              {(['all', 'income', 'expense'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTypeFilter(type)}
                  className={`flex-1 justify-center px-2 h-9 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer flex items-center border-0 ${
                    typeFilter === type
                      ? 'bg-white dark:bg-[#38383a] text-[#007aff] shadow-xs font-black'
                      : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-[#f2f2f7]'
                  }`}
                >
                  {type === 'all'
                    ? t('allTypes')
                    : type === 'income'
                      ? t('income')
                      : t('expense')}
                </button>
              ))}
            </div>



            {/* Reset / Clear Filters Indicator button */}
            {hasActiveFilters && (
              <button
                id="clear-filters-btn"
                onClick={handleClearFilters}
                className="h-11 px-4.5 rounded-2xl flex items-center justify-center gap-1.5 text-xs font-bold text-[#ff3b30] hover:bg-[#ff3b30]/10 border border-transparent hover:border-[#ff3b30]/10 transition-all duration-200 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>{language === 'my' ? 'စီစစ်မှုဖျက်ရန်' : 'Reset'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Matches Status Line */}
        <div className="flex items-center justify-between text-[11px] font-bold text-[#8e8e93] uppercase tracking-wider pt-1">
          <span>
            {language === 'my' ? 'ရလဒ်တွေ့ရှိမှု -' : 'Ledger Match results:'}{' '}
            <span className="text-[#007aff] font-mono">{filteredTransactions.length}</span>{' '}
            {language === 'my' ? 'ခု' : 'records'}
          </span>
          {hasActiveFilters && (
            <span className="text-amber-500 font-semibold normal-case tracking-normal">
              {language === 'my' ? '* ဇယားတွင် ရှာဖွေမှု အသုံးပြုထားပါသည်' : '* Filters currently applied'}
            </span>
          )}
        </div>
      </div>

      {/* Transaction List - iOS Table Style */}
      <div className="ios-glass rounded-[2rem] border border-black/5 dark:border-white/5 overflow-hidden shadow-xs">
        {isMobile ? (
          /* Mobile View Card List */
          <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
            {filteredTransactions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <FolderOpen className="w-10 h-10 text-[#8e8e93]" />
                  <p className="text-xs text-[#8e8e93] font-bold uppercase tracking-wider">
                    {t('noTransactions')}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={handleClearFilters}
                      className="h-8 px-3 rounded-full bg-[#007aff] text-white text-[11px] font-bold transition-all border-0 cursor-pointer mt-1"
                    >
                      {language === 'my' ? 'စီစစ်မှုဖျက်ရန်' : 'Reset filters'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              paginatedTransactions.map((tx) => (
                <MobileTransactionCard
                  key={tx.id}
                  tx={tx}
                  formattedDate={formatDateDMY(tx.date)}
                  categoryStyle={getCategoryStyle(tx.category, categoryColors)}
                  translatedCategory={tc(tx.category)}
                  formattedAmount={formatAmount(tx.amount)}
                  onEdit={handleOpenEdit}
                  onDelete={onDeleteTransaction}
                />
              ))
            )}
          </div>
        ) : (
          /* Desktop View Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="transactions-table">
              <thead>
                <tr className="bg-black/[0.02] dark:bg-white/[0.02] text-[#8e8e93] font-bold text-[10px] uppercase tracking-wider border-b border-black/5 dark:border-white/5">
                  <th className="p-4.5">{t('date')}</th>
                  <th className="p-4.5">{t('category')}</th>
                  <th className="p-4.5">{t('description')}</th>
                  <th className="p-4.5 text-right">{t('amount')}</th>
                  <th className="p-4.5 text-center">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.03]">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3.5 max-w-sm mx-auto">
                        <div className="w-14 h-14 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-center text-[#8e8e93]">
                          <FolderOpen className="w-7 h-7" />
                        </div>
                        <p className="text-xs text-[#8e8e93] font-bold uppercase tracking-wider">
                          {t('noTransactions')}
                        </p>
                        <p className="text-xs text-[#8e8e93] leading-relaxed">
                          {language === 'my'
                            ? 'ရှာဖွေထားသော အချက်အလက်များ မရှိပါ။ အသစ်ထည့်သွင်းရန် သို့မဟုတ် စီစစ်မှုများကို ပြောင်းလဲပေးပါ။'
                            : 'No entries match your active query. Create a new transaction or reset filters.'}
                        </p>
                        {hasActiveFilters && (
                          <button
                            onClick={handleClearFilters}
                            className="h-9 px-4 rounded-full bg-[#007aff] hover:opacity-90 text-white text-xs font-bold transition-all border-0 cursor-pointer"
                          >
                            {language === 'my' ? 'စီစစ်မှုအားလုံးကို ပြန်လည်စတင်ပါ' : 'Clear Active Filters'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedTransactions.map((tx) => (
                    <DesktopTransactionRow
                      key={tx.id}
                      tx={tx}
                      formattedDate={formatDateDMY(tx.date)}
                      categoryStyle={getCategoryStyle(tx.category, categoryColors)}
                      translatedCategory={tc(tx.category)}
                      formattedAmount={formatAmount(tx.amount)}
                      onEdit={handleOpenEdit}
                      onDelete={onDeleteTransaction}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* High-Performance Pagination Bar Controls */}
        {filteredTransactions.length > 0 && (
          <div className="p-4 bg-black/[0.015] dark:bg-white/[0.015] border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8e8e93] font-bold">
            {/* Rows Per Page Selector */}
            <div className="flex items-center gap-2">
              <span>{language === 'my' ? 'တစ်မျက်နှာလျှင် အရေအတွက်:' : 'Rows per page:'}</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-2.5 py-1 bg-white dark:bg-[#2c2c2e] border border-black/10 dark:border-white/10 rounded-lg font-mono font-bold text-xs text-[#1c1c1e] dark:text-[#f2f2f7] focus:outline-none focus:ring-1 focus:ring-[#007aff]"
              >
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={0}>{language === 'my' ? 'အားလုံး' : 'All'}</option>
              </select>
              {pageSize > 0 && (
                <span className="font-mono text-[11px]">
                  {Math.min((currentPage - 1) * pageSize + 1, filteredTransactions.length)} -{' '}
                  {Math.min(currentPage * pageSize, filteredTransactions.length)} / {filteredTransactions.length}
                </span>
              )}
            </div>

            {/* Pagination Navigation Buttons */}
            {pageSize > 0 && totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-[#2c2c2e] border border-black/10 dark:border-white/10 text-[#1c1c1e] dark:text-[#f2f2f7] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#007aff] hover:text-white transition-all cursor-pointer border-0"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 font-mono text-xs font-bold text-[#1c1c1e] dark:text-[#f2f2f7]">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-[#2c2c2e] border border-black/10 dark:border-white/10 text-[#1c1c1e] dark:text-[#f2f2f7] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#007aff] hover:text-white transition-all cursor-pointer border-0"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
      )}

      {/* Slide-over or Modal for Add/Edit Transaction */}
      <AnimatePresence>
        {isOpenForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpenForm(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Modal Content - iOS Pop-up Sheet */}
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 10 }}
              className="relative w-full max-w-md p-6 bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-3xl rounded-3xl border border-white/50 dark:border-white/12 shadow-2xl space-y-5 gpu-layer"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-[#1c1c1e] dark:text-white flex items-center gap-2">
                  <Coins className="w-5 h-5 text-[#007aff]" />
                  {editingTx ? t('editTransaction') : t('addTransaction')}
                </h3>
                <button
                  id="close-tx-modal"
                  onClick={() => setIsOpenForm(false)}
                  className="w-9 h-9 flex items-center justify-center text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white rounded-full transition-colors cursor-pointer border-0 bg-transparent"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form id="tx-entry-form" onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Type Switcher - iOS Segmented buttons */}
                <div>
                  <label className="block text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider mb-2">
                    {t('type')}
                  </label>
                  <div className="grid grid-cols-2 gap-1 p-1 bg-black/[0.04] dark:bg-white/[0.05] rounded-full border border-black/[0.02] dark:border-white/[0.02]">
                    <button
                      id="form-type-expense-btn"
                      type="button"
                      onClick={() => handleTypeChange('expense')}
                      className={`py-2 text-xs font-extrabold rounded-full transition-all cursor-pointer border-0 ${
                        formType === 'expense'
                          ? 'bg-white dark:bg-[#38383a] text-[#ff3b30] shadow-xs font-black'
                          : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-[#f2f2f7]'
                      }`}
                    >
                      {t('expense')}
                    </button>
                    <button
                      id="form-type-income-btn"
                      type="button"
                      onClick={() => handleTypeChange('income')}
                      className={`py-2 text-xs font-extrabold rounded-full transition-all cursor-pointer border-0 ${
                        formType === 'income'
                          ? 'bg-white dark:bg-[#38383a] text-[#34c759] shadow-xs font-black'
                          : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-[#f2f2f7]'
                      }`}
                    >
                      {t('income')}
                    </button>
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <label
                    htmlFor="form-amount-input"
                    className="block text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider mb-2"
                  >
                    {t('amount')} ({currencySymbol})
                  </label>
                  <div className="relative">
                    <input
                      id="form-amount-input"
                      type="number"
                      min="0.01"
                      step="any"
                      required
                      placeholder="0.00"
                      value={formAmount}
                      onChange={(e) => {
                        setFormAmount(e.target.value);
                        if (errors.amount) {
                          setErrors((prev) => ({ ...prev, amount: undefined }));
                        }
                      }}
                      className={`w-full px-4 py-3 bg-black/[0.03] dark:bg-white/[0.04] border rounded-2xl text-sm text-[#1c1c1e] dark:text-[#f2f2f7] focus:outline-none focus:ring-2 font-mono font-black transition-all duration-200 ${
                        errors.amount
                          ? 'border-red-500/70 focus:ring-red-500/20'
                          : 'border-transparent focus:ring-[#007aff]/35'
                      }`}
                    />
                  </div>
                  {errors.amount && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[11px] text-red-500 font-bold mt-1.5 flex items-center gap-1.5"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.amount}
                    </motion.p>
                  )}
                </div>

                {/* Grid Fields: Category & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Category Dropdown */}
                  <div>
                    <label
                      htmlFor="form-category-select"
                      className="block text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider mb-2"
                    >
                      {t('category')}
                    </label>
                    <div className="relative flex items-center bg-black/[0.03] dark:bg-white/[0.04] rounded-2xl px-3.5 h-11 border border-transparent">
                      <select
                        id="form-category-select"
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full bg-transparent border-0 text-xs font-extrabold text-[#1c1c1e] dark:text-[#f2f2f7] focus:outline-none cursor-pointer pr-5 appearance-none h-full"
                      >
                        {formType === 'income'
                          ? incomeCategories.map((cat) => (
                              <option key={cat} value={cat}>
                                {tc(cat)}
                              </option>
                            ))
                          : expenseCategories.map((cat) => (
                              <option key={cat} value={cat}>
                                {tc(cat)}
                              </option>
                            ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[#8e8e93] absolute right-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Date Input */}
                  <div>
                    <label
                      htmlFor="form-date-input"
                      className="block text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider mb-2"
                    >
                      {t('date')}
                    </label>
                    <input
                      id="form-date-input"
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => {
                        setFormDate(e.target.value);
                        if (errors.date) {
                          setErrors((prev) => ({ ...prev, date: undefined }));
                        }
                      }}
                      className={`w-full px-3 h-11 bg-black/[0.03] dark:bg-white/[0.04] border rounded-2xl text-xs text-[#1c1c1e] dark:text-[#f2f2f7] focus:outline-none focus:ring-2 transition-all duration-200 ${
                        errors.date
                          ? 'border-red-500/70 focus:ring-red-500/20'
                          : 'border-transparent focus:ring-[#007aff]/35'
                      }`}
                    />
                    {errors.date && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[11px] text-red-500 font-bold mt-1.5 flex items-center gap-1.5"
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {errors.date}
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Description Input */}
                <div>
                  <label
                    htmlFor="form-description-input"
                    className="block text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider mb-2"
                  >
                    {t('description')} ({t('optional')})
                  </label>
                  <input
                    id="form-description-input"
                    type="text"
                    placeholder="e.g. Weekly lunch"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-black/[0.03] dark:bg-white/[0.04] border-0 rounded-2xl text-sm text-[#1c1c1e] dark:text-[#f2f2f7] focus:outline-none focus:ring-2 focus:ring-[#007aff]/35 placeholder-[#8e8e93]"
                  />
                </div>

                {/* Footer buttons - iOS standard action buttons */}
                <div className="flex justify-end gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsOpenForm(false)}
                    className="px-5 h-11 bg-black/[0.03] hover:bg-black/[0.07] dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-[#1c1c1e] dark:text-white rounded-full text-xs font-bold transition-all cursor-pointer border-0"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-6 h-11 bg-[#007aff] hover:opacity-90 text-white rounded-full text-xs font-bold transition-all cursor-pointer border-0 active:scale-95"
                  >
                    {t('save')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
});
