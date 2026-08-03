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
  FolderOpen,
  Tag,
  Info
} from 'lucide-react';
import { Transaction, TransactionType, Language } from '../types';
import { TRANSLATIONS, CATEGORY_TRANSLATIONS } from '../translations';
import { generateLedgerPDF } from '../utils/pdfGenerator';
import { getCategoryStyle, CategoryStyle } from '../utils/categoryStyle';
import { getLocalDateStr } from '../utils/dateUtils';
import { getCategoryIcon } from '../utils/categoryIcon';

interface TransactionsSectionProps {
  transactions: Transaction[];
  currencySymbol: string;
  language: Language;
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string, onSuccess?: () => void) => void;
  formatAmount: (amount: number) => string;
  incomeCategories?: string[];
  expenseCategories?: string[];
  onAddTransactionTrigger?: () => void;
  onEditTransactionTrigger?: (tx: Transaction) => void;
  categoryColors?: Record<string, string>;
  categoryIcons?: Record<string, string>;
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
  categoryIcons?: Record<string, string>;
  onClick: (tx: Transaction) => void;
}

const DesktopTransactionRow: React.FC<TransactionRowProps> = React.memo(({
  tx,
  formattedDate,
  categoryStyle,
  translatedCategory,
  formattedAmount,
  categoryIcons,
  onClick
}) => {
  const CategoryIcon = getCategoryIcon(tx.category, categoryIcons);
  return (
    <tr
      id={`tx-row-${tx.id}`}
      onClick={() => onClick(tx)}
      className="hover:bg-black/[0.04] dark:hover:bg-white/[0.04] text-sm fast-render-row transition-colors cursor-pointer group"
    >
      <td className="p-3.5 pl-4 font-mono text-xs text-[#8e8e93] font-medium">
        {formattedDate}
      </td>
      <td className="p-3.5 whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}
          style={categoryStyle.style}
        >
          <CategoryIcon className="w-3.5 h-3.5 shrink-0" />
          {translatedCategory}
        </span>
      </td>
      <td className="p-3.5 text-[#1c1c1e] dark:text-[#f2f2f7] font-semibold max-w-[240px] truncate">
        {tx.description || translatedCategory}
      </td>
      <td
        className={`p-3.5 text-right font-bold font-mono whitespace-nowrap text-base ${
          tx.type === 'income' ? 'text-[#34c759]' : 'text-[#ff3b30]'
        }`}
      >
        {tx.type === 'income' ? '+' : '-'}{formattedAmount}
      </td>
      <td className="p-3.5 pr-4 text-right">
        <ChevronRight className="w-4 h-4 text-[#8e8e93] opacity-40 group-hover:opacity-100 transition-opacity inline-block" />
      </td>
    </tr>
  );
});

const MobileTransactionCard: React.FC<TransactionRowProps> = React.memo(({
  tx,
  categoryStyle,
  translatedCategory,
  formattedAmount,
  categoryIcons,
  onClick
}) => {
  const CategoryIcon = getCategoryIcon(tx.category, categoryIcons);
  return (
    <div
      id={`tx-card-${tx.id}`}
      onClick={() => onClick(tx)}
      className="p-3.5 flex items-center justify-between gap-3 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors cursor-pointer fast-render-row active:bg-black/5 dark:active:bg-white/5"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Category Icon Badge */}
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}
          style={categoryStyle.style}
        >
          <CategoryIcon className="w-4 h-4 shrink-0" />
        </div>

        {/* Title & Category Subtitle */}
        <div className="min-w-0 space-y-0.5 flex-1">
          <p className="text-sm font-bold text-[#1c1c1e] dark:text-[#f2f2f7] leading-snug truncate">
            {tx.description || translatedCategory}
          </p>
          <span className="text-xs font-medium text-[#8e8e93] block truncate">
            {translatedCategory}
          </span>
        </div>
      </div>

      {/* Amount & Chevron */}
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`text-sm sm:text-base font-bold font-mono ${
            tx.type === 'income' ? 'text-[#34c759]' : 'text-[#ff3b30]'
          }`}
        >
          {tx.type === 'income' ? '+' : '-'}{formattedAmount}
        </span>
        <ChevronRight className="w-4 h-4 text-[#8e8e93]/50 shrink-0" />
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
  categoryIcons = {},
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
  const [selectedTxDetail, setSelectedTxDetail] = useState<Transaction | null>(null);

  // Form Fields
  const [formType, setFormType] = useState<TransactionType>('expense');
  const [formCategory, setFormCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState(getLocalDateStr());
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
    setFormDate(getLocalDateStr());
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

  // Format Date for Group Header
  const formatGroupHeaderDate = useCallback((dateStr: string): string => {
    if (!dateStr) return '';
    const today = getLocalDateStr();

    const yesterdayObj = new Date();
    yesterdayObj.setDate(yesterdayObj.getDate() - 1);
    const yesterday = getLocalDateStr(yesterdayObj);

    const formattedDMY = formatDateDMY(dateStr);

    if (dateStr === today) {
      return language === 'my' ? `ယနေ့ (${formattedDMY})` : `Today, ${formattedDMY}`;
    }
    if (dateStr === yesterday) {
      return language === 'my' ? `မနေ့က (${formattedDMY})` : `Yesterday, ${formattedDMY}`;
    }

    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        const dt = new Date(y, m - 1, d);
        if (language === 'en') {
          const dayName = dt.toLocaleDateString('en-US', { weekday: 'short' });
          const monthName = dt.toLocaleDateString('en-US', { month: 'short' });
          return `${dayName}, ${d} ${monthName} ${y}`;
        }
      }
    }

    return formattedDMY;
  }, [language, formatDateDMY]);

  // Group paginated transactions by date
  const groupedTransactions = useMemo(() => {
    const list = pageSize === 0 ? filteredTransactions : paginatedTransactions;
    const groups: { date: string; txs: Transaction[]; dailyExpense: number; dailyIncome: number }[] = [];
    const map = new Map<string, { date: string; txs: Transaction[]; dailyExpense: number; dailyIncome: number }>();

    for (const tx of list) {
      let group = map.get(tx.date);
      if (!group) {
        group = { date: tx.date, txs: [], dailyExpense: 0, dailyIncome: 0 };
        map.set(tx.date, group);
        groups.push(group);
      }
      group.txs.push(tx);
      if (tx.type === 'expense') {
        group.dailyExpense += tx.amount;
      } else if (tx.type === 'income') {
        group.dailyIncome += tx.amount;
      }
    }

    return groups;
  }, [filteredTransactions, paginatedTransactions, pageSize]);

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

  const currentDetailTx = useMemo(() => {
    if (!selectedTxDetail) return null;
    return transactions.find((t) => t.id === selectedTxDetail.id) || selectedTxDetail;
  }, [selectedTxDetail, transactions]);

  // Scroll to top when transaction detail page is opened
  useEffect(() => {
    if (selectedTxDetail) {
      window.scrollTo(0, 0);
    }
  }, [selectedTxDetail]);

  // Dedicated Transaction Detail Page View
  if (currentDetailTx) {
    const style = getCategoryStyle(currentDetailTx.category, categoryColors);
    const translatedCat = tc(currentDetailTx.category);
    const DetailCatIcon = getCategoryIcon(currentDetailTx.category, categoryIcons);

    return (
      <div className="space-y-5 max-w-lg mx-auto pb-8" id="transaction-detail-page">
        {/* Navigation Top Bar */}
        <div className="flex items-center justify-between py-1 border-b border-black/5 dark:border-white/5 pb-3">
          <button
            id="tx-detail-back-btn"
            onClick={() => setSelectedTxDetail(null)}
            className="inline-flex items-center gap-1 text-[#007aff] hover:opacity-80 font-semibold text-sm transition-opacity cursor-pointer border-0 bg-transparent p-0"
          >
            <ChevronLeft className="w-5 h-5 -ml-1" />
            <span>{language === 'my' ? 'နောက်သို့' : 'Back'}</span>
          </button>

          <h2 className="text-sm font-bold text-[#1c1c1e] dark:text-[#f2f2f7]">
            {language === 'my' ? 'စာရင်း အသေးစိတ်' : 'Transaction Detail'}
          </h2>

          <div className="w-16" /> {/* Visual Spacer */}
        </div>

        {/* Hero Card Banner */}
        <div className="ios-glass p-6 rounded-2xl border border-black/5 dark:border-white/5 shadow-xs text-center space-y-3 relative overflow-hidden">
          {/* Category Icon Badge */}
          <div
            className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center border shadow-xs ${style.bg} ${style.text} ${style.border}`}
            style={style.style}
          >
            <DetailCatIcon className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <p className="text-[11px] font-medium text-[#8e8e93] uppercase tracking-wider">
              {currentDetailTx.type === 'income'
                ? (language === 'my' ? 'ဝင်ငွေ ပမာဏ' : 'Income Amount')
                : (language === 'my' ? 'အသုံးစရိတ် ပမာဏ' : 'Expense Amount')}
            </p>
            <div
              className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${
                currentDetailTx.type === 'income' ? 'text-[#34c759]' : 'text-[#ff3b30]'
              }`}
            >
              {currentDetailTx.type === 'income' ? '+' : '-'}{formatAmount(currentDetailTx.amount)}
            </div>
            <div className="pt-1">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}
                style={style.style}
              >
                <DetailCatIcon className="w-3.5 h-3.5" />
                {translatedCat}
              </span>
            </div>
          </div>
        </div>

        {/* Details Group Card (iOS Inset Group Style) */}
        <div className="ios-glass rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden shadow-xs divide-y divide-black/5 dark:divide-white/5">
          {/* Note / Description */}
          <div className="p-4 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#007aff]/10 flex items-center justify-center shrink-0 mt-0.5">
              <FileText className="w-4 h-4 text-[#007aff]" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[#8e8e93] font-medium block text-[10px] uppercase tracking-wider">
                {language === 'my' ? 'မှတ်စု / အကြောင်းအရာ' : 'Note / Description'}
              </span>
              <p className="text-sm font-semibold text-[#1c1c1e] dark:text-[#f2f2f7] mt-0.5 break-words">
                {currentDetailTx.description || tc(currentDetailTx.category)}
              </p>
            </div>
          </div>

          {/* Date */}
          <div className="p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-purple-500" />
              </div>
              <div className="min-w-0">
                <span className="text-[#8e8e93] font-medium block text-[10px] uppercase tracking-wider">
                  {language === 'my' ? 'ရက်စွဲ' : 'Date'}
                </span>
                <span className="font-semibold text-xs sm:text-sm text-[#1c1c1e] dark:text-[#f2f2f7] truncate block">
                  {formatGroupHeaderDate(currentDetailTx.date)}
                </span>
              </div>
            </div>
            <span className="font-mono text-xs text-[#8e8e93] font-medium bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-lg shrink-0">
              {formatDateDMY(currentDetailTx.date)}
            </span>
          </div>

          {/* Type */}
          <div className="p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                currentDetailTx.type === 'income' ? 'bg-[#34c759]/10' : 'bg-[#ff3b30]/10'
              }`}>
                <Tag className={`w-4 h-4 ${
                  currentDetailTx.type === 'income' ? 'text-[#34c759]' : 'text-[#ff3b30]'
                }`} />
              </div>
              <div>
                <span className="text-[#8e8e93] font-medium block text-[10px] uppercase tracking-wider">
                  {language === 'my' ? 'အမျိုးအစား' : 'Type'}
                </span>
                <span className={`font-semibold text-xs sm:text-sm ${
                  currentDetailTx.type === 'income' ? 'text-[#34c759]' : 'text-[#ff3b30]'
                }`}>
                  {currentDetailTx.type === 'income'
                    ? (language === 'my' ? 'ဝင်ငွေ' : 'Income')
                    : (language === 'my' ? 'အသုံးစရိတ်' : 'Expense')}
                </span>
              </div>
            </div>
          </div>

          {/* Entry ID */}
          <div className="p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gray-500/10 flex items-center justify-center shrink-0">
                <Info className="w-4 h-4 text-[#8e8e93]" />
              </div>
              <div className="min-w-0">
                <span className="text-[#8e8e93] font-medium block text-[10px] uppercase tracking-wider">
                  {language === 'my' ? 'မှတ်ပုံတင် အိုင်ဒီ' : 'Entry ID'}
                </span>
                <span className="font-mono text-xs text-[#1c1c1e] dark:text-[#f2f2f7] font-medium truncate block">
                  {currentDetailTx.id}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons: Compact & Sleek */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            id={`detail-page-edit-${currentDetailTx.id}`}
            onClick={() => {
              const txToEdit = currentDetailTx;
              setSelectedTxDetail(null);
              handleOpenEdit(txToEdit);
            }}
            className="py-2.5 px-4 rounded-xl bg-[#007aff] hover:bg-[#007aff]/90 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border-0 shadow-2xs active:scale-[0.98]"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{language === 'my' ? 'ပြင်ဆင်မည်' : 'Edit'}</span>
          </button>

          <button
            id={`detail-page-delete-${currentDetailTx.id}`}
            onClick={() => {
              const txId = currentDetailTx.id;
              onDeleteTransaction(txId, () => {
                setSelectedTxDetail(null);
              });
            }}
            className="py-2.5 px-4 rounded-xl bg-[#ff3b30]/10 hover:bg-[#ff3b30]/20 text-[#ff3b30] font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-[#ff3b30]/20 active:scale-[0.98]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{language === 'my' ? 'ဖျက်မည်' : 'Delete'}</span>
          </button>
        </div>
      </div>
    );
  }

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
        <div className="inline-flex items-center p-1 bg-black/[0.04] dark:bg-white/[0.05] rounded-2xl border border-black/[0.04] dark:border-white/[0.06] h-11 w-full sm:w-auto shadow-xs">
          <button
            id="view-mode-list-btn"
            type="button"
            onClick={() => setViewMode('list')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 h-9 rounded-xl text-xs transition-all border-0 cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white dark:bg-[#2c2c2e] text-[#007aff] shadow-xs font-extrabold border border-black/5 dark:border-white/10'
                : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white font-semibold'
            }`}
          >
            <List className="w-4 h-4" />
            <span>{t('listView')}</span>
          </button>
          <button
            id="view-mode-calendar-btn"
            type="button"
            onClick={() => setViewMode('calendar')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 h-9 rounded-xl text-xs transition-all border-0 cursor-pointer ${
              viewMode === 'calendar'
                ? 'bg-white dark:bg-[#2c2c2e] text-[#007aff] shadow-xs font-extrabold border border-black/5 dark:border-white/10'
                : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white font-semibold'
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

                const isToday = dateKey === getLocalDateStr();

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
          {/* Advanced Search & Segmented Mode Control Panel */}
          <div className="p-4 sm:p-5 ios-glass rounded-[2rem] border border-black/5 dark:border-white/5 space-y-3.5 shadow-xs">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
              
              {/* Refined Search Input */}
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e8e93] pointer-events-none" />
                <input
                  id="search-input"
                  type="text"
                  placeholder={t('searchDescription')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-11 pl-10 pr-9 bg-black/[0.04] dark:bg-white/[0.05] border border-black/[0.04] dark:border-white/[0.06] hover:border-black/10 dark:hover:border-white/10 rounded-2xl text-xs sm:text-sm font-medium text-[#1c1c1e] dark:text-[#f2f2f7] placeholder-[#8e8e93] focus:outline-none focus:ring-2 focus:ring-[#007aff]/25 focus:border-[#007aff]/40 focus:bg-white dark:focus:bg-[#1c1c1e] transition-all duration-200"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white transition-all cursor-pointer border-0"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* 3-Toggle Mode Switch & Reset Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                {/* Apple Inset 3-Toggle Segment Control */}
                <div className="flex items-center p-1 bg-black/[0.04] dark:bg-white/[0.05] rounded-2xl border border-black/[0.04] dark:border-white/[0.06] h-11 w-full sm:w-auto shrink-0 shadow-xs">
                  {(['all', 'income', 'expense'] as const).map((type) => {
                    const isActive = typeFilter === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setTypeFilter(type)}
                        className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 h-9 px-3.5 sm:px-4 rounded-xl text-xs transition-all duration-200 cursor-pointer border-0 select-none ${
                          isActive
                            ? type === 'income'
                              ? 'bg-white dark:bg-[#2c2c2e] text-[#34c759] shadow-xs font-black border border-black/5 dark:border-white/10'
                              : type === 'expense'
                                ? 'bg-white dark:bg-[#2c2c2e] text-[#ff3b30] shadow-xs font-black border border-black/5 dark:border-white/10'
                                : 'bg-white dark:bg-[#2c2c2e] text-[#007aff] shadow-xs font-black border border-black/5 dark:border-white/10'
                            : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-[#f2f2f7] font-semibold hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
                        }`}
                      >
                        {type === 'all' && <Filter className="w-3.5 h-3.5 opacity-75" />}
                        {type === 'income' && <ArrowUpRight className="w-3.5 h-3.5" />}
                        {type === 'expense' && <ArrowDownLeft className="w-3.5 h-3.5" />}
                        <span>
                          {type === 'all'
                            ? t('allTypes')
                            : type === 'income'
                              ? t('income')
                              : t('expense')}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Reset / Clear Filters Action Button */}
                {hasActiveFilters && (
                  <button
                    id="clear-filters-btn"
                    onClick={handleClearFilters}
                    className="h-11 px-4 rounded-2xl flex items-center justify-center gap-1.5 text-xs font-bold text-[#ff3b30] bg-[#ff3b30]/10 hover:bg-[#ff3b30]/20 border border-[#ff3b30]/20 transition-all duration-200 cursor-pointer shrink-0"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>{language === 'my' ? 'စီစစ်မှုဖျက်ရန်' : 'Reset'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Match Results Status Bar */}
            <div className="flex items-center justify-between text-[11px] font-bold text-[#8e8e93] pt-1.5 border-t border-black/5 dark:border-white/5">
              <div className="flex items-center gap-1.5">
                <span className="uppercase tracking-wider text-[10px]">
                  {language === 'my' ? 'ရလဒ်တွေ့ရှိမှု:' : 'Ledger Records:'}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#007aff]/10 text-[#007aff] font-mono font-extrabold text-xs">
                  {filteredTransactions.length}
                </span>
              </div>

              {hasActiveFilters && (
                <span className="text-amber-500 font-medium text-[11px] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {language === 'my' ? 'စီစစ်မှုအသုံးပြုထားသည်' : 'Active filters applied'}
                </span>
              )}
            </div>
          </div>

      {/* Transaction List - iOS Table Style */}
      <div className="ios-glass rounded-[2rem] border border-black/5 dark:border-white/5 overflow-hidden shadow-xs">
        {isMobile ? (
          /* Mobile View Card List Grouped by Date */
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
              groupedTransactions.map((group) => (
                <div key={group.date} className="border-b border-black/5 dark:border-white/5 last:border-b-0">
                  {/* Sticky Date Group Header */}
                  <div className="sticky top-0 z-10 px-4 py-2 bg-[#f2f2f7]/95 dark:bg-[#2c2c2e]/95 backdrop-blur-md flex items-center justify-between text-xs border-y border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-1.5 font-bold text-[#1c1c1e] dark:text-[#f2f2f7]">
                      <Calendar className="w-3.5 h-3.5 text-[#007aff]" />
                      <span>{formatGroupHeaderDate(group.date)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono font-bold text-xs">
                      {group.dailyExpense > 0 && (
                        <span className="text-[#ff3b30] bg-[#ff3b30]/10 px-2 py-0.5 rounded-full text-[11px]">
                          -{formatAmount(group.dailyExpense)}
                        </span>
                      )}
                      {group.dailyIncome > 0 && (
                        <span className="text-[#34c759] bg-[#34c759]/10 px-2 py-0.5 rounded-full text-[11px]">
                          +{formatAmount(group.dailyIncome)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Transactions under this Date */}
                  <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                    {group.txs.map((tx) => (
                      <MobileTransactionCard
                        key={tx.id}
                        tx={tx}
                        formattedDate={formatDateDMY(tx.date)}
                        categoryStyle={getCategoryStyle(tx.category, categoryColors)}
                        translatedCategory={tc(tx.category)}
                        formattedAmount={formatAmount(tx.amount)}
                        categoryIcons={categoryIcons}
                        onClick={setSelectedTxDetail}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Desktop View Table Grouped by Date */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="transactions-table">
              <thead>
                <tr className="bg-black/[0.02] dark:bg-white/[0.02] text-[#8e8e93] font-bold text-[10px] uppercase tracking-wider border-b border-black/5 dark:border-white/5">
                  <th className="p-4.5">{t('date')}</th>
                  <th className="p-4.5">{t('category')}</th>
                  <th className="p-4.5">{t('description')}</th>
                  <th className="p-4.5 text-right">{t('amount')}</th>
                  <th className="p-4.5 text-right"></th>
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
                  groupedTransactions.map((group) => (
                    <React.Fragment key={group.date}>
                      {/* Date Group Section Header Row */}
                      <tr className="bg-[#f2f2f7]/80 dark:bg-[#2c2c2e]/60 border-y border-black/5 dark:border-white/5">
                        <td colSpan={3} className="p-2.5 pl-4 font-bold text-xs text-[#1c1c1e] dark:text-[#f2f2f7]">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-[#007aff]" />
                            <span>{formatGroupHeaderDate(group.date)}</span>
                            <span className="text-[11px] text-[#8e8e93] font-normal ml-1">
                              ({group.txs.length} {group.txs.length === 1 ? (language === 'my' ? 'ခု' : 'entry') : (language === 'my' ? 'ခု' : 'entries')})
                            </span>
                          </div>
                        </td>
                        <td colSpan={2} className="p-2.5 pr-4 text-right font-mono font-bold text-xs">
                          <div className="flex items-center justify-end gap-2">
                            {group.dailyIncome > 0 && (
                              <span className="text-[#34c759] bg-[#34c759]/10 px-2.5 py-0.5 rounded-full text-xs">
                                +{formatAmount(group.dailyIncome)}
                              </span>
                            )}
                            {group.dailyExpense > 0 && (
                              <span className="text-[#ff3b30] bg-[#ff3b30]/10 px-2.5 py-0.5 rounded-full text-xs">
                                -{formatAmount(group.dailyExpense)}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Transaction Rows for this Date */}
                      {group.txs.map((tx) => (
                        <DesktopTransactionRow
                          key={tx.id}
                          tx={tx}
                          formattedDate={formatDateDMY(tx.date)}
                          categoryStyle={getCategoryStyle(tx.category, categoryColors)}
                          translatedCategory={tc(tx.category)}
                          formattedAmount={formatAmount(tx.amount)}
                          categoryIcons={categoryIcons}
                          onClick={setSelectedTxDetail}
                        />
                      ))}
                    </React.Fragment>
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
