import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Check,
  Sparkles,
  AlertCircle,
  Utensils,
  Car,
  ShoppingBag,
  Film,
  Home,
  Zap,
  HeartPulse,
  GraduationCap,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  Tag,
  FileText,
  LucideIcon
} from 'lucide-react';
import { Transaction, TransactionType, Language } from '../types';
import { TRANSLATIONS, CATEGORY_TRANSLATIONS } from '../translations';
import { IOSDatePicker } from './IOSDatePicker';
import { getCategoryStyle } from '../utils/categoryStyle';
import { getLocalDateStr } from '../utils/dateUtils';
import { getCategoryIcon } from '../utils/categoryIcon';

interface AddTransactionSectionProps {
  language: Language;
  currencySymbol: string;
  currencyCode: string;
  incomeCategories: string[];
  expenseCategories: string[];
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onCancel: () => void;
  initialTransaction?: Transaction | null;
  onEditTransaction?: (tx: Transaction) => void;
  formatAmount: (amount: number) => string;
  categoryColors?: Record<string, string>;
  categoryIcons?: Record<string, string>;
}

const getCategoryColors = (name: string) => {
  const norm = name.trim().toLowerCase();
  if (norm.includes('food') || norm.includes('dining') || norm.includes('grocer') || norm.includes('စားသောက်') || norm.includes('အစားအသောက်') || norm.includes('ကုန်စုံ')) {
    return {
      bg: 'bg-amber-500/10 text-amber-600 border-amber-500/15 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/20',
      active: 'bg-white dark:bg-white/10 text-amber-600 dark:text-amber-400 border-amber-500 shadow-sm border-2'
    };
  }
  if (norm.includes('transport') || norm.includes('travel') || norm.includes('သယ်ယူ') || norm.includes('ခရီးသွား')) {
    return {
      bg: 'bg-blue-500/10 text-blue-600 border-blue-500/15 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/20',
      active: 'bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 border-blue-500 shadow-sm border-2'
    };
  }
  if (norm.includes('shop') || norm.includes('ဈေးဝယ်')) {
    return {
      bg: 'bg-pink-500/10 text-pink-600 border-pink-500/15 dark:bg-pink-500/15 dark:text-pink-400 dark:border-pink-500/20',
      active: 'bg-white dark:bg-white/10 text-pink-600 dark:text-pink-400 border-pink-500 shadow-sm border-2'
    };
  }
  if (norm.includes('entertain') || norm.includes('ဖျော်ဖြေ')) {
    return {
      bg: 'bg-purple-500/10 text-purple-600 border-purple-500/15 dark:bg-purple-500/15 dark:text-purple-400 dark:border-purple-500/20',
      active: 'bg-white dark:bg-white/10 text-purple-600 dark:text-purple-400 border-purple-500 shadow-sm border-2'
    };
  }
  if (norm.includes('hous') || norm.includes('rent') || norm.includes('အိမ်')) {
    return {
      bg: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/15 dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-indigo-500/20',
      active: 'bg-white dark:bg-white/10 text-indigo-600 dark:text-indigo-400 border-indigo-500 shadow-sm border-2'
    };
  }
  if (norm.includes('util') || norm.includes('bill') || norm.includes('မီတာ') || norm.includes('ဖုန်းဘေလ်')) {
    return {
      bg: 'bg-teal-500/10 text-teal-600 border-teal-500/15 dark:bg-teal-500/15 dark:text-teal-400 dark:border-teal-500/20',
      active: 'bg-white dark:bg-white/10 text-teal-600 dark:text-teal-400 border-teal-500 shadow-sm border-2'
    };
  }
  if (norm.includes('health') || norm.includes('well') || norm.includes('gym') || norm.includes('ကျန်းမာရေး') || norm.includes('ဆေးဝါး') || norm.includes('ဂျင်')) {
    return {
      bg: 'bg-red-500/10 text-red-600 border-red-500/15 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/20',
      active: 'bg-white dark:bg-white/10 text-red-600 dark:text-red-400 border-red-500 shadow-sm border-2'
    };
  }
  if (norm.includes('educat') || norm.includes('school') || norm.includes('ပညာရေး') || norm.includes('သင်တန်း')) {
    return {
      bg: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/15 dark:bg-cyan-500/15 dark:text-cyan-400 dark:border-cyan-500/20',
      active: 'bg-white dark:bg-white/10 text-cyan-600 dark:text-cyan-400 border-cyan-500 shadow-sm border-2'
    };
  }
  if (norm.includes('salar') || norm.includes('လစာ')) {
    return {
      bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/15 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/20',
      active: 'bg-white dark:bg-white/10 text-emerald-600 dark:text-emerald-400 border-emerald-500 shadow-sm border-2'
    };
  }
  if (norm.includes('free') || norm.includes('consult') || norm.includes('လွတ်လပ်') || norm.includes('အလွတ်တန်း') || norm.includes('အကြံပေး')) {
    return {
      bg: 'bg-sky-500/10 text-sky-600 border-sky-500/15 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-500/20',
      active: 'bg-white dark:bg-white/10 text-sky-600 dark:text-sky-400 border-sky-500 shadow-sm border-2'
    };
  }
  if (norm.includes('invest') || norm.includes('dividend') || norm.includes('ရင်းနှီးမြှုပ်နှံ') || norm.includes('အစုရှယ်ယာ')) {
    return {
      bg: 'bg-violet-500/10 text-violet-600 border-violet-500/15 dark:bg-violet-500/15 dark:text-violet-400 dark:border-violet-500/20',
      active: 'bg-white dark:bg-white/10 text-violet-600 dark:text-violet-400 border-violet-500 shadow-sm border-2'
    };
  }
  if (norm.includes('gift') || norm.includes('bonus') || norm.includes('grant') || norm.includes('လက်ဆောင်') || norm.includes('ဆုကြေး') || norm.includes('ထောက်ပံ့')) {
    return {
      bg: 'bg-rose-500/10 text-rose-600 border-rose-500/15 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/20',
      active: 'bg-white dark:bg-white/10 text-rose-600 dark:text-rose-400 border-rose-500 shadow-sm border-2'
    };
  }
  return {
    bg: 'bg-slate-500/10 text-slate-600 border-slate-500/15 dark:bg-slate-500/15 dark:text-slate-400 dark:border-slate-500/20',
    active: 'bg-white dark:bg-white/10 text-slate-600 dark:text-slate-400 border-slate-500 shadow-sm border-2'
  };
};

// Map categories to list of common descriptions (autocomplete help chips)
const DESCRIPTION_SUGGESTIONS: Record<string, string[]> = {
  'food': ['Lunch', 'Dinner', 'Breakfast', 'Groceries', 'Coffee', 'Snacks', 'Restaurant'],
  'စားသောက်စရိတ်': ['နေ့လယ်စာ', 'ညစာ', 'မနက်စာ', 'ကုန်စုံဆိုင်', 'ကော်ဖီ', 'မုန့်', 'စားသောက်ဆိုင်'],
  'transportation': ['Taxi Fare', 'Gasoline', 'Bus Ticket', 'Train Ticket', 'Parking', 'Car Wash'],
  'သယ်ယူပို့ဆောင်ရေး': ['တက္ကစီခ', 'ဆီဖိုး', 'ဘတ်စ်ကားခ', 'ရထားလက်မှတ်', 'ကားပါကင်', 'ကားဆေးခ'],
  'shopping': ['Clothing', 'Shoes', 'Electronics', 'Home Decor', 'Gifts', 'Accessories'],
  'ဈေးဝယ်ခြင်း': ['အဝတ်အထည်', 'ဖိနပ်', 'အီလက်ထရောနစ်', 'အိမ်အလှဆင်', 'လက်ဆောင်', 'အသုံးအဆောင်'],
  'entertainment': ['Movie Ticket', 'Streaming Subscription', 'Video Games', 'Concert', 'Books'],
  'ဖျော်ဖြေရေး': ['ရုပ်ရှင်လက်မှတ်', 'လစဉ်ကြေး', 'ဂိမ်းဖိုး', 'ပွဲလမ်းသဘင်', 'စာအုပ်'],
  'housing': ['Rent', 'Maintenance', 'Furniture', 'Property Tax', 'Home Insurance'],
  'အိမ်လခ/အိမ်စရိတ်': ['အိမ်လခ', 'ပြုပြင်ထိန်းသိမ်းမှု', 'ပရိဘောဂ', 'အခွန်', 'အိမ်အာမခံ'],
  'utilities': ['Electricity Bill', 'Water Bill', 'Internet Bill', 'Mobile Bill', 'Trash Disposal'],
  'မီတာ/ရေဖိုး/ဖုန်းဘေလ်': ['မီတာခ', 'ရေဖိုး', 'အင်တာနက်ဖိုး', 'ဖုန်းဘေလ်', 'အမှိုက်ခ'],
  'healthcare': ['Medicine', 'Doctor Consultation', 'Dental Care', 'Vitamins', 'Gym Membership'],
  'ကျန်းမာရေး': ['ဆေးဖိုး', 'ဆရာဝန်ပြသခ', 'သွားနှင့်ခံတွင်း', 'အားဆေး', 'ဂျင်လစဉ်ကြေး'],
  'education': ['Tuition Fees', 'Textbooks', 'Online Courses', 'Stationery', 'School Uniform'],
  'ပညာရေး': ['ကျောင်းလခ', 'ကျောင်းသုံးစာအုပ်', 'အွန်လိုင်းသင်တန်း', 'စာရေးကိရိယာ', 'ကျောင်းဝတ်စုံ'],
  'salary': ['Monthly Salary', 'Overtime Pay', 'Bonus Payment', 'Advance Salary'],
  'လစာဝင်ငွေ': ['လစဉ်လစာ', 'အချိန်ပိုကြေး', 'ဆုကြေးငွေ', 'ကြိုတင်လစာ'],
  'freelance': ['Contract Work', 'Web Design', 'Writing Gig', 'Consulting Fee', 'App Development'],
  'လွတ်လပ်သောလုပ်ငန်း': ['စာချုပ်အလုပ်', 'ဝက်ဘ်ဆိုက်ဒီဇိုင်း', 'အလွတ်တန်းအလုပ်', 'အကြံပေးခ', 'ဆော့ဖ်ဝဲလ်ရေးဆွဲခြင်း'],
  'investment': ['Stock Dividends', 'Crypto Profit', 'Interest Income', 'Mutual Fund Return'],
  'ရင်းနှီးမြှုပ်နှံမှု': ['အစုရှယ်ယာအမြတ်', 'ခရစ်ပတိုအမြတ်', 'အတိုးရငွေ', 'ရန်ပုံငွေအမြတ်'],
  'gift': ['Birthday Gift', 'Holiday Bonus', 'Lucky Draw Winner', 'Cash Gift'],
  'လက်ဆောင်ရရှိမှု': ['မွေးနေ့လက်ဆောင်', 'နှစ်ပတ်လည်လက်ဆောင်', 'ကံစမ်းမဲပေါက်ခြင်း', 'ငွေသားလက်ဆောင်']
};

export const AddTransactionSection: React.FC<AddTransactionSectionProps> = React.memo(({
  language,
  currencySymbol,
  currencyCode,
  incomeCategories,
  expenseCategories,
  onAddTransaction,
  onCancel,
  initialTransaction = null,
  onEditTransaction,
  formatAmount,
  categoryColors = {},
  categoryIcons = {},
}) => {
  const t = (key: string) => TRANSLATIONS[language][key] || key;
  const tc = (cat: string) => CATEGORY_TRANSLATIONS[language][cat] || cat;

  // Form State
  const [type, setType] = useState<TransactionType>(initialTransaction ? initialTransaction.type : 'expense');
  const [amount, setAmount] = useState<string>(initialTransaction ? initialTransaction.amount.toString() : '');
  const [category, setCategory] = useState<string>(
    initialTransaction
      ? initialTransaction.category
      : (expenseCategories.length > 0 ? expenseCategories[0] : 'Food')
  );
  const [date, setDate] = useState<string>(
    initialTransaction ? initialTransaction.date : getLocalDateStr()
  );
  const [description, setDescription] = useState<string>(initialTransaction ? initialTransaction.description : '');

  // Validation Error state
  const [errors, setErrors] = useState<{ amount?: string; date?: string }>({});

  // Sync category if type toggled
  const handleTypeToggle = (selectedType: TransactionType) => {
    setType(selectedType);
    if (selectedType === 'income') {
      setCategory(incomeCategories.length > 0 ? incomeCategories[0] : 'Salary');
    } else {
      setCategory(expenseCategories.length > 0 ? expenseCategories[0] : 'Food');
    }
  };

  // Pre-fill fields if editing initialTransaction changes
  useEffect(() => {
    if (initialTransaction) {
      setType(initialTransaction.type);
      setAmount(initialTransaction.amount.toString());
      setCategory(initialTransaction.category);
      setDate(initialTransaction.date);
      setDescription(initialTransaction.description);
    }
  }, [initialTransaction]);

  // Handle preset buttons click
  const handleQuickAmount = (val: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + val).toString());
    setErrors(prev => ({ ...prev, amount: undefined }));
  };

  // Clear amount
  const handleClearAmount = () => {
    setAmount('');
  };

  // Get dynamic suggestions for descriptions
  const getSuggestions = () => {
    const normCategory = category.trim().toLowerCase();
    // Check direct English key or Burma translated key
    return DESCRIPTION_SUGGESTIONS[normCategory] || DESCRIPTION_SUGGESTIONS[category] || [];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { amount?: string; date?: string } = {};

    // Validate amount
    if (!amount.trim()) {
      newErrors.amount = t('validationAmountRequired');
    } else {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        newErrors.amount = t('validationAmountPositive');
      }
    }

    // Validate date
    if (!date.trim()) {
      newErrors.date = t('validationDateRequired');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to the error or keep visible
      return;
    }

    const finalAmount = parseFloat(amount);
    const txData = {
      type,
      category,
      amount: finalAmount,
      date,
      description: description.trim() || category,
    };

    if (initialTransaction && onEditTransaction) {
      onEditTransaction({
        ...initialTransaction,
        ...txData,
      });
    } else {
      onAddTransaction(txData);
    }

    // Call callback back
    onCancel();
  };

  // Helper quick date setters
  const setQuickDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    setDate(getLocalDateStr(d));
  };

  // Quick preset options based on currency
  const isMMK = currencyCode === 'MMK' || currencySymbol === 'Ks';
  const quickAmountPresets = isMMK
    ? [1000, 5000, 10000, 20000, 50000, 100000]
    : [5, 10, 20, 50, 100, 200];

  const currentCategories = type === 'expense' ? expenseCategories : incomeCategories;

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12 animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
      
      {/* Header Panel */}
      <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.05] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2.5 font-sans">
            <div className="w-8 h-8 rounded-xl bg-[#007aff]/10 text-[#007aff] flex items-center justify-center shrink-0 border border-[#007aff]/20">
              <Coins className="w-4.5 h-4.5" />
            </div>
            {initialTransaction ? t('editTransaction') : t('addTransaction')}
          </h2>
          <p className="text-[11px] text-[#8e8e93] font-medium mt-0.5">
            {initialTransaction
              ? (language === 'my' ? 'မှတ်တမ်းအချက်အလက်များကို ပြင်ဆင်ပါ' : 'Modify existing transaction details')
              : (language === 'my' ? 'ဝင်ငွေ/ထွက်ငွေ မှတ်တမ်းသစ် ထည့်သွင်းပါ' : 'Record your income or expense entry')}
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="w-10 h-10 flex items-center justify-center bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white rounded-full transition-all cursor-pointer border-0 shrink-0"
          title="Close"
          id="close-transaction-form-btn"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        
        {/* Type Toggle + Hero Amount Card */}
        <div className="ios-glass p-6 rounded-[2.25rem] border border-black/[0.04] dark:border-white/[0.08] shadow-lg shadow-black/[0.02] space-y-6 text-center">
          
          {/* iOS Master Segmented Control (Expense vs Income) */}
          <div className="max-w-xs mx-auto p-1.5 bg-black/[0.04] dark:bg-white/[0.06] rounded-2xl border border-black/[0.03] dark:border-white/[0.04] grid grid-cols-2 gap-1.5 shadow-inner">
            <button
              type="button"
              onClick={() => handleTypeToggle('expense')}
              className={`py-2.5 px-4 text-xs font-black rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 border-0 ${
                type === 'expense'
                  ? 'bg-white dark:bg-[#2c2c2e] text-[#ff3b30] shadow-md shadow-black/5 scale-[1.02]'
                  : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-[#f2f2f7] bg-transparent'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
              {t('expense')}
            </button>
            <button
              type="button"
              onClick={() => handleTypeToggle('income')}
              className={`py-2.5 px-4 text-xs font-black rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 border-0 ${
                type === 'income'
                  ? 'bg-white dark:bg-[#2c2c2e] text-[#34c759] shadow-md shadow-black/5 scale-[1.02]'
                  : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-[#f2f2f7] bg-transparent'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              {t('income')}
            </button>
          </div>

          {/* Large Hero Amount Input */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#8e8e93] block">
              {language === 'my' ? 'ပမာဏ ထည့်သွင်းရန်' : 'AMOUNT'}
            </span>

            <div className="relative flex items-center justify-center max-w-md mx-auto">
              <span className={`text-2xl sm:text-3xl font-black font-mono mr-2 ${type === 'income' ? 'text-[#34c759]' : 'text-[#ff3b30]'}`}>
                {type === 'income' ? '+' : '-'}{currencySymbol || currencyCode}
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
                className={`w-auto min-w-[120px] max-w-full text-4xl sm:text-5xl md:text-6xl font-mono font-black text-center bg-transparent border-0 focus:outline-none focus:ring-0 p-0 caret-[#007aff] tracking-tight ${
                  type === 'income' ? 'text-[#34c759]' : 'text-[#1c1c1e] dark:text-white'
                }`}
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

          {/* Quick Amount Pill Presets */}
          <div className="pt-2">
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider mr-1">
                {language === 'my' ? 'အမြန်ပေါင်း:' : 'Quick Add:'}
              </span>
              {quickAmountPresets.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAmount(val)}
                  className="px-3 py-1.5 rounded-xl bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-xs font-extrabold font-mono text-[#1c1c1e] dark:text-[#f2f2f7] transition-all cursor-pointer border border-black/[0.03] dark:border-white/[0.05] active:scale-95 shadow-2xs"
                >
                  +{val >= 1000 ? `${val / 1000}k` : val}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Category GRID Selector */}
        <div className="ios-glass p-6 rounded-[2.25rem] border border-black/[0.04] dark:border-white/[0.08] space-y-4 shadow-lg shadow-black/[0.02]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-[#8e8e93] flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#007aff]" />
                {t('selectCategory')}
              </h3>
              <p className="text-[11px] text-[#8e8e93] font-medium mt-0.5">
                {language === 'my' ? 'ငွေလွှဲ အမျိုးအစားတစ်ခုကို ရွေးချယ်ပါ' : 'Choose a category for this transaction'}
              </p>
            </div>
            <span className="text-[10px] font-extrabold text-[#007aff] bg-[#007aff]/10 px-2.5 py-1 rounded-full border border-[#007aff]/20">
              {tc(category)}
            </span>
          </div>

          {currentCategories.length === 0 ? (
            <div className="text-center py-6 text-xs text-[#8e8e93]">
              No categories configured.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {currentCategories.map((cat) => {
                const isSelected = category === cat;
                const IconComponent = getCategoryIcon(cat, categoryIcons);
                const catStyle = getCategoryStyle(cat, categoryColors);

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    style={
                      isSelected
                        ? catStyle.style
                          ? { backgroundColor: catStyle.hex, color: '#ffffff', borderColor: catStyle.hex }
                          : undefined
                        : catStyle.style
                    }
                    className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? catStyle.style
                          ? 'shadow-md scale-[1.02] border-2 font-black ring-2 ring-offset-2 ring-[#007aff]/30 dark:ring-offset-[#1c1c1e]'
                          : 'bg-[#007aff] text-white border-[#007aff] shadow-md shadow-[#007aff]/25 scale-[1.02] font-black'
                        : `${catStyle.bg} ${catStyle.text} ${catStyle.border} hover:scale-[1.02] hover:shadow-xs`
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-white/20 text-white' : 'bg-black/5 dark:bg-white/10'}`}>
                        <IconComponent className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-xs font-black truncate leading-tight">
                        {tc(cat)}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-white/25 text-white flex items-center justify-center shrink-0 ml-1">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Date Selector & Smart Description Suggestions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          {/* Left: Date Selector & Quick Date Chips */}
          <div className="ios-glass p-6 rounded-[2.25rem] border border-black/[0.04] dark:border-white/[0.08] space-y-4 shadow-lg shadow-black/[0.02] h-full">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#8e8e93] flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#007aff]" />
                {t('date')}
              </h3>

              {/* Quick Date Chips */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setQuickDate(0)}
                  className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                    date === getLocalDateStr()
                      ? 'bg-[#007aff] text-white border-[#007aff] shadow-2xs'
                      : 'bg-black/5 dark:bg-white/10 text-[#8e8e93] border-transparent hover:text-[#1c1c1e] dark:hover:text-white'
                  }`}
                >
                  {language === 'my' ? 'ယနေ့' : 'Today'}
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate(1)}
                  className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 text-[#8e8e93] border border-transparent hover:text-[#1c1c1e] dark:hover:text-white transition-all cursor-pointer"
                >
                  {language === 'my' ? 'မနေ့က' : 'Yesterday'}
                </button>
              </div>
            </div>

            <IOSDatePicker
              value={date}
              onChange={(newDate) => {
                setDate(newDate);
                if (errors.date) {
                  setErrors(prev => ({ ...prev, date: undefined }));
                }
              }}
              language={language}
              error={errors.date}
            />
          </div>

          {/* Right: Smart Description Input & Interactive Suggestion Chips */}
          <div className="ios-glass p-6 rounded-[2.25rem] border border-black/[0.04] dark:border-white/[0.08] space-y-4 shadow-lg shadow-black/[0.02] h-full">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#8e8e93] flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#007aff]" />
              {t('description')} ({t('optional')})
            </h3>

            <div className="space-y-3.5">
              <input
                type="text"
                placeholder={language === 'my' ? 'မှတ်စုရေးရန် (ဥပမာ- ထမင်းစားစရိတ်)' : 'e.g. Lunch with friends'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-12 px-4 bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.08] rounded-2xl text-xs sm:text-sm font-semibold text-[#1c1c1e] dark:text-[#f2f2f7] focus:outline-none focus:ring-4 focus:ring-[#007aff]/15 transition-all duration-200"
              />

              {/* Interactive Suggestion Chips */}
              {getSuggestions().length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#007aff]" />
                    {language === 'my' ? 'အမြန် ရွေးချယ်စရာများ:' : 'Suggestions:'}
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {getSuggestions().map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setDescription(suggestion)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                          description === suggestion
                            ? 'bg-[#007aff]/15 text-[#007aff] border-[#007aff]/30 font-bold'
                            : 'bg-black/[0.03] hover:bg-black/[0.06] dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-[#8e8e93] border-black/[0.03] dark:border-white/[0.05] hover:text-[#1c1c1e] dark:hover:text-white'
                        }`}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
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
            className={`w-2/3 h-13 flex items-center justify-center gap-2 rounded-2xl text-sm font-black text-white transition-all shadow-lg cursor-pointer border-0 active:scale-[0.98] ${
              type === 'income'
                ? 'bg-[#34c759] hover:bg-[#30d158] shadow-[#34c759]/25'
                : 'bg-[#007aff] hover:bg-[#0062cc] shadow-[#007aff]/25'
            }`}
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>
              {initialTransaction 
                ? (language === 'my' ? 'ပြင်ဆင်ချက် သိမ်းမည်' : 'Save Changes') 
                : (language === 'my' ? 'မှတ်တမ်း သိမ်းဆည်းမည်' : 'Save Transaction')}
            </span>
          </button>
        </div>

      </form>

    </div>
  );
});
