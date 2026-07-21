import React, { useState } from 'react';
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
  XCircle,
  HelpCircle,
  FolderOpen
} from 'lucide-react';
import { Transaction, TransactionType, Language } from '../types';
import { TRANSLATIONS, CATEGORY_TRANSLATIONS } from '../translations';
import { generateLedgerPDF } from '../utils/pdfGenerator';

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

// Aesthetic Category styles with specific backgrounds, borders, and text colors
const getCategoryStyle = (categoryName: string) => {
  const norm = categoryName.trim().toLowerCase();
  switch (norm) {
    case 'food':
    case 'စားသောက်စရိတ်':
      return {
        bg: 'bg-amber-500/10 dark:bg-amber-500/20',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-500/10 dark:border-amber-500/20'
      };
    case 'transportation':
    case 'သယ်ယူပို့ဆောင်ရေး':
      return {
        bg: 'bg-blue-500/10 dark:bg-blue-500/20',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-500/10 dark:border-blue-500/20'
      };
    case 'shopping':
    case 'ဈေးဝယ်ခြင်း':
      return {
        bg: 'bg-pink-500/10 dark:bg-pink-500/20',
        text: 'text-pink-600 dark:text-pink-400',
        border: 'border-pink-500/10 dark:border-pink-500/20'
      };
    case 'entertainment':
    case 'ဖျော်ဖြေရေး':
      return {
        bg: 'bg-purple-500/10 dark:bg-purple-500/20',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-500/10 dark:border-purple-500/20'
      };
    case 'housing':
    case 'အိမ်လခ/အိမ်စရိတ်':
      return {
        bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
        text: 'text-indigo-600 dark:text-indigo-400',
        border: 'border-indigo-500/10 dark:border-indigo-500/20'
      };
    case 'utilities':
    case 'မီတာ/ရေဖိုး/ဖုန်းဘေလ်':
      return {
        bg: 'bg-teal-500/10 dark:bg-teal-500/20',
        text: 'text-teal-600 dark:text-teal-400',
        border: 'border-teal-500/10 dark:border-teal-500/20'
      };
    case 'healthcare':
    case 'ကျန်းမာရေး':
      return {
        bg: 'bg-red-500/10 dark:bg-red-500/20',
        text: 'text-red-600 dark:text-red-400',
        border: 'border-red-500/10 dark:border-red-500/20'
      };
    case 'education':
    case 'ပညာရေး':
      return {
        bg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
        text: 'text-cyan-600 dark:text-cyan-400',
        border: 'border-cyan-500/10 dark:border-cyan-500/20'
      };
    case 'salary':
    case 'လစာဝင်ငွေ':
      return {
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-500/10 dark:border-emerald-500/20'
      };
    case 'freelance':
    case 'လွတ်လပ်သောလုပ်ငန်း':
      return {
        bg: 'bg-sky-500/10 dark:bg-sky-500/20',
        text: 'text-sky-600 dark:text-sky-400',
        border: 'border-sky-500/10 dark:border-sky-500/20'
      };
    case 'investment':
    case 'ရင်းနှီးမြှုပ်နှံမှု':
      return {
        bg: 'bg-violet-500/10 dark:bg-violet-500/20',
        text: 'text-violet-600 dark:text-violet-400',
        border: 'border-violet-500/10 dark:border-violet-500/20'
      };
    case 'gift':
    case 'လက်ဆောင်ရရှိမှု':
      return {
        bg: 'bg-rose-500/10 dark:bg-rose-500/20',
        text: 'text-rose-600 dark:text-rose-400',
        border: 'border-rose-500/10 dark:border-rose-500/20'
      };
    default:
      return {
        bg: 'bg-slate-500/10 dark:bg-slate-500/20',
        text: 'text-slate-600 dark:text-slate-400',
        border: 'border-slate-500/10 dark:border-slate-500/20'
      };
  }
};

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
}) => {
  const t = (key: string) => TRANSLATIONS[language][key] || key;
  const tc = (cat: string) => CATEGORY_TRANSLATIONS[language][cat] || cat;

  const formatDateDMY = (dateString: string): string => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  };

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
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

  const handleOpenEdit = (tx: Transaction) => {
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
  };

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
  const filteredTransactions = transactions
    .filter((tx) => {
      const matchesSearch =
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || tx.type === typeFilter;
      const matchesCategory = categoryFilter === 'All' || tx.category === categoryFilter;
      return matchesSearch && matchesType && matchesCategory;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // descending by date

  // Reset Filters trigger
  const hasActiveFilters = searchTerm !== '' || categoryFilter !== 'All';
  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All');
    setTypeFilter('all');
  };

  // Real-Time summary metrics based on active filter criteria!
  const filteredIncomeTotal = filteredTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const filteredExpenseTotal = filteredTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const filteredNetBalance = filteredIncomeTotal - filteredExpenseTotal;

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
        <div className="flex items-center gap-2.5">
          {/* Export Report Action */}
          <div className="relative font-sans animate-fade-in" id="export-menu-container">
            <button
              id="export-dropdown-btn"
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={filteredTransactions.length === 0}
              className="flex items-center justify-center gap-2 h-11 px-4 border border-black/10 dark:border-white/10 hover:bg-black/[0.03] dark:hover:bg-white/[0.05] text-[#1c1c1e] dark:text-[#f2f2f7] disabled:opacity-40 rounded-full text-xs font-bold transition-all cursor-pointer bg-transparent"
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
            className="flex items-center justify-center gap-2 h-11 px-5.5 bg-[#007aff] hover:bg-[#007aff]/90 text-white rounded-full text-xs font-bold shadow-sm transition-all duration-200 cursor-pointer border-0 active:scale-95 shrink-0"
          >
            <Plus className="w-4.5 h-4.5" />
            {t('addTransaction')}
          </button>
        </div>
      </div>

      {/* Advanced Filter, Search, Segmented Controls Container */}
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
            <div className="flex w-full sm:w-72 md:w-80 p-1 bg-black/[0.04] dark:bg-white/[0.05] rounded-full shrink-0 border border-black/[0.02] dark:border-white/[0.02] h-11 items-center">
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
        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto">
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
                filteredTransactions.map((tx) => {
                  const catStyle = getCategoryStyle(tx.category);
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-black/[0.015] dark:hover:bg-white/[0.015] transition-all duration-150 text-sm"
                    >
                      {/* Date */}
                      <td className="p-4.5 font-mono text-xs text-[#8e8e93] font-extrabold">
                        {formatDateDMY(tx.date)}
                      </td>

                      {/* Category */}
                      <td className="p-4.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                        >
                          {tx.type === 'income' ? (
                            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                          ) : (
                            <ArrowDownLeft className="w-3.5 h-3.5 shrink-0" />
                          )}
                          {tc(tx.category)}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="p-4.5 text-[#1c1c1e] dark:text-[#f2f2f7] font-extrabold max-w-[240px] truncate">
                        {tx.description}
                      </td>

                      {/* Amount */}
                      <td
                        className={`p-4.5 text-right font-black font-mono whitespace-nowrap text-base ${
                          tx.type === 'income' ? 'text-[#34c759]' : 'text-[#ff3b30]'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}{formatAmount(tx.amount)}
                      </td>

                      {/* Action buttons */}
                      <td className="p-4.5">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Edit button */}
                          <button
                            id={`edit-tx-${tx.id}`}
                            onClick={() => handleOpenEdit(tx)}
                            className="w-10 h-10 flex items-center justify-center text-[#8e8e93] hover:text-[#007aff] hover:bg-[#007aff]/10 rounded-xl transition-all cursor-pointer border-0 bg-transparent"
                            title="Edit Ledger Entry"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete button */}
                          <button
                            id={`delete-tx-${tx.id}`}
                            onClick={() => onDeleteTransaction(tx.id)}
                            className="w-10 h-10 flex items-center justify-center text-[#8e8e93] hover:text-[#ff3b30] hover:bg-[#ff3b30]/10 rounded-xl transition-all cursor-pointer border-0 bg-transparent"
                            title="Remove ledger entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Card List (No horizontal scroll, fully responsive layout) */}
        <div className="block md:hidden divide-y divide-black/[0.04] dark:divide-white/[0.04]">
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
            filteredTransactions.map((tx) => {
              const catStyle = getCategoryStyle(tx.category);
              return (
                <div
                  key={tx.id}
                  className="p-4 space-y-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  {/* Top Line: Category badg and Amount */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                    >
                      {tx.type === 'income' ? (
                        <ArrowUpRight className="w-3 h-3 shrink-0" />
                      ) : (
                        <ArrowDownLeft className="w-3 h-3 shrink-0" />
                      )}
                      {tc(tx.category)}
                    </span>

                    <span
                      className={`text-base font-black font-mono ${
                        tx.type === 'income' ? 'text-[#34c759]' : 'text-[#ff3b30]'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}{formatAmount(tx.amount)}
                    </span>
                  </div>

                  {/* Description, Date & Actions Row */}
                  <div className="flex items-start justify-between gap-3 pt-0.5">
                    <div className="space-y-1 min-w-0">
                      <p className="text-sm font-extrabold text-[#1c1c1e] dark:text-[#f2f2f7] leading-snug truncate">
                        {tx.description}
                      </p>
                      <p className="text-[11px] font-extrabold text-[#8e8e93] font-mono leading-none">
                        {formatDateDMY(tx.date)}
                      </p>
                    </div>

                    {/* Circular Action triggers */}
                    <div className="flex items-center gap-1.5 shrink-0 self-center">
                      <button
                        id={`edit-tx-mob-${tx.id}`}
                        onClick={() => handleOpenEdit(tx)}
                        className="w-9 h-9 flex items-center justify-center text-[#8e8e93] hover:text-[#007aff] hover:bg-[#007aff]/10 bg-black/[0.03] dark:bg-white/[0.05] border-0 rounded-xl transition-all cursor-pointer"
                        title="Edit entry"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id={`delete-tx-mob-${tx.id}`}
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="w-9 h-9 flex items-center justify-center text-[#8e8e93] hover:text-[#ff3b30] hover:bg-[#ff3b30]/10 bg-black/[0.03] dark:bg-white/[0.05] border-0 rounded-xl transition-all cursor-pointer"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

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
              className="relative w-full max-w-md p-6 bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-3xl rounded-3xl border border-white/50 dark:border-white/12 shadow-2xl space-y-5"
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
