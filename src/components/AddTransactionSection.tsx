import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
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
}

const getCategoryIcon = (name: string): LucideIcon => {
  const norm = name.trim().toLowerCase();
  switch (norm) {
    case 'food':
    case 'စားသောက်စရိတ်':
      return Utensils;
    case 'transportation':
    case 'သယ်ယူပို့ဆောင်ရေး':
      return Car;
    case 'shopping':
    case 'ဈေးဝယ်ခြင်း':
      return ShoppingBag;
    case 'entertainment':
    case 'ဖျော်ဖြေရေး':
      return Film;
    case 'housing':
    case 'အိမ်လခ/အိမ်စရိတ်':
      return Home;
    case 'utilities':
    case 'မီတာ/ရေဖိုး/ဖုန်းဘေလ်':
      return Zap;
    case 'healthcare':
    case 'ကျန်းမာရေး':
      return HeartPulse;
    case 'education':
    case 'ပညာရေး':
      return GraduationCap;
    case 'salary':
    case 'လစာဝင်ငွေ':
      return Briefcase;
    case 'freelance':
    case 'လွတ်လပ်သောလုပ်ငန်း':
      return Laptop;
    case 'investment':
    case 'ရင်းနှီးမြှုပ်နှံမှု':
      return TrendingUp;
    case 'gift':
    case 'လက်ဆောင်ရရှိမှု':
      return Gift;
    default:
      return Tag;
  }
};

const getCategoryColors = (name: string) => {
  const norm = name.trim().toLowerCase();
  switch (norm) {
    case 'food':
    case 'စားသောက်စရိတ်':
      return {
        bg: 'bg-amber-500/10 text-amber-600 border-amber-500/15 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/20',
        active: 'bg-white dark:bg-white/10 text-amber-600 dark:text-amber-400 border-amber-500 shadow-sm border-2'
      };
    case 'transportation':
    case 'သယ်ယူပို့ဆောင်ရေး':
      return {
        bg: 'bg-blue-500/10 text-blue-600 border-blue-500/15 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/20',
        active: 'bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 border-blue-500 shadow-sm border-2'
      };
    case 'shopping':
    case 'ဈေးဝယ်ခြင်း':
      return {
        bg: 'bg-pink-500/10 text-pink-600 border-pink-500/15 dark:bg-pink-500/15 dark:text-pink-400 dark:border-pink-500/20',
        active: 'bg-white dark:bg-white/10 text-pink-600 dark:text-pink-400 border-pink-500 shadow-sm border-2'
      };
    case 'entertainment':
    case 'ဖျော်ဖြေရေး':
      return {
        bg: 'bg-purple-500/10 text-purple-600 border-purple-500/15 dark:bg-purple-500/15 dark:text-purple-400 dark:border-purple-500/20',
        active: 'bg-white dark:bg-white/10 text-purple-600 dark:text-purple-400 border-purple-500 shadow-sm border-2'
      };
    case 'housing':
    case 'အိမ်လခ/အိမ်စရိတ်':
      return {
        bg: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/15 dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-indigo-500/20',
        active: 'bg-white dark:bg-white/10 text-indigo-600 dark:text-indigo-400 border-indigo-500 shadow-sm border-2'
      };
    case 'utilities':
    case 'မီတာ/ရေဖိုး/ဖုန်းဘေလ်':
      return {
        bg: 'bg-teal-500/10 text-teal-600 border-teal-500/15 dark:bg-teal-500/15 dark:text-teal-400 dark:border-teal-500/20',
        active: 'bg-white dark:bg-white/10 text-teal-600 dark:text-teal-400 border-teal-500 shadow-sm border-2'
      };
    case 'healthcare':
    case 'ကျန်းမာရေး':
      return {
        bg: 'bg-red-500/10 text-red-600 border-red-500/15 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/20',
        active: 'bg-white dark:bg-white/10 text-red-600 dark:text-red-400 border-red-500 shadow-sm border-2'
      };
    case 'education':
    case 'ပညာရေး':
      return {
        bg: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/15 dark:bg-cyan-500/15 dark:text-cyan-400 dark:border-cyan-500/20',
        active: 'bg-white dark:bg-white/10 text-cyan-600 dark:text-cyan-400 border-cyan-500 shadow-sm border-2'
      };
    case 'salary':
    case 'လစာဝင်ငွေ':
      return {
        bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/15 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/20',
        active: 'bg-white dark:bg-white/10 text-emerald-600 dark:text-emerald-400 border-emerald-500 shadow-sm border-2'
      };
    case 'freelance':
    case 'လွတ်လပ်သောလုပ်ငန်း':
      return {
        bg: 'bg-sky-500/10 text-sky-600 border-sky-500/15 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-500/20',
        active: 'bg-white dark:bg-white/10 text-sky-600 dark:text-sky-400 border-sky-500 shadow-sm border-2'
      };
    case 'investment':
    case 'ရင်းနှီးမြှုပ်နှံမှု':
      return {
        bg: 'bg-violet-500/10 text-violet-600 border-violet-500/15 dark:bg-violet-500/15 dark:text-violet-400 dark:border-violet-500/20',
        active: 'bg-white dark:bg-white/10 text-violet-600 dark:text-violet-400 border-violet-500 shadow-sm border-2'
      };
    case 'gift':
    case 'လက်ဆောင်ရရှိမှု':
      return {
        bg: 'bg-rose-500/10 text-rose-600 border-rose-500/15 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/20',
        active: 'bg-white dark:bg-white/10 text-rose-600 dark:text-rose-400 border-rose-500 shadow-sm border-2'
      };
    default:
      return {
        bg: 'bg-slate-500/10 text-slate-600 border-slate-500/15 dark:bg-slate-500/15 dark:text-slate-400 dark:border-slate-500/20',
        active: 'bg-white dark:bg-white/10 text-slate-600 dark:text-slate-400 border-slate-500 shadow-sm border-2'
      };
  }
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

export const AddTransactionSection: React.FC<AddTransactionSectionProps> = ({
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
    initialTransaction ? initialTransaction.date : new Date().toISOString().substring(0, 10)
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
    setDate(d.toISOString().substring(0, 10));
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
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-10 h-10 flex items-center justify-center bg-black/[0.03] hover:bg-black/[0.06] dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-[#1c1c1e] dark:text-[#f2f2f7] rounded-full transition-all cursor-pointer border-0"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-black tracking-tight text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
              <Coins className="w-5 h-5 text-[#007aff]" />
              {initialTransaction ? t('editTransaction') : t('addTransaction')}
            </h2>
            <p className="text-[11px] text-[#8e8e93] font-medium">
              {initialTransaction
                ? (language === 'my' ? 'မှတ်တမ်းအချက်အလက်များကို ပြင်ဆင်ပါ' : 'Modify the existing transaction details')
                : (language === 'my' ? 'မှတ်တမ်းသစ်တစ်ခု ထည့်သွင်းပါ' : 'Establish a high-fidelity record in your ledger')}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        
        {/* Centered Large Immersive Amount Section */}
        <div className="ios-glass p-6 rounded-[2rem] border border-black/[0.03] dark:border-white/[0.03] shadow-xs text-center space-y-4">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#8e8e93] block">
            {language === 'my' ? 'သွင်းငွေ/ထုတ်ငွေ ပမာဏ' : 'TRANSACTION VOLUME'}
          </span>

          <div className="relative flex items-center justify-center max-w-sm mx-auto">
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
              className="w-full text-4xl sm:text-5xl font-mono font-black text-center text-[#1c1c1e] dark:text-white bg-transparent border-0 focus:outline-none focus:ring-0 p-0 caret-[#007aff]"
              style={{ width: `${Math.max(amount.length * 24 + 40, 120)}px`, maxWidth: '100%' }}
            />
            {amount && (
              <button
                type="button"
                onClick={handleClearAmount}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-black/[0.06] hover:bg-black/[0.1] dark:bg-white/[0.1] dark:hover:bg-white/[0.15] text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white transition-all cursor-pointer border-0 text-[10px] ml-1 shrink-0"
                title="Clear Amount"
              >
                ✕
              </button>
            )}
          </div>

          {errors.amount && (
            <div className="text-[11px] text-red-500 font-extrabold flex items-center justify-center gap-1.5 animate-bounce mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.amount}</span>
            </div>
          )}

          {/* iOS Segmented Control for Expense vs Income */}
          <div className="max-w-xs mx-auto p-1 bg-black/[0.03] dark:bg-white/[0.04] rounded-full border border-black/[0.02] dark:border-white/[0.02] grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => handleTypeToggle('expense')}
              className={`py-2 text-xs font-black rounded-full transition-all cursor-pointer flex items-center justify-center gap-1.5 border-0 ${
                type === 'expense'
                  ? 'bg-white dark:bg-[#38383a] text-[#ff3b30] shadow-xs'
                  : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-[#f2f2f7] bg-transparent'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              {t('expense')}
            </button>
            <button
              type="button"
              onClick={() => handleTypeToggle('income')}
              className={`py-2 text-xs font-black rounded-full transition-all cursor-pointer flex items-center justify-center gap-1.5 border-0 ${
                type === 'income'
                  ? 'bg-white dark:bg-[#38383a] text-[#34c759] shadow-xs'
                  : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-[#f2f2f7] bg-transparent'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              {t('income')}
            </button>
          </div>
        </div>

        {/* Dynamic Category GRID Selector (No plain select dropdowns) */}
        <div className="ios-glass p-6 rounded-[2rem] border border-black/[0.03] dark:border-white/[0.03] space-y-4 shadow-xs">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#8e8e93] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#007aff]" />
              {t('selectCategory')}
            </h3>
            <p className="text-[10px] text-[#8e8e93] font-medium mt-1">
              {language === 'my' ? 'ငွေလွှဲကဏ္ဍတစ်ခုကို နှိပ်ပြီးရွေးချယ်ပါ' : 'Select a thematic classification label'}
            </p>
          </div>

          {currentCategories.length === 0 ? (
            <div className="text-center py-6 text-xs text-[#8e8e93]">
              No categories setup.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {currentCategories.map((cat) => {
                const isSelected = category === cat;
                const IconComponent = getCategoryIcon(cat);
                const col = getCategoryColors(cat);

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? col.active
                        : `${col.bg} border-transparent hover:scale-[1.02]`
                    }`}
                  >
                    <div className="shrink-0">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black truncate leading-none">
                      {tc(cat)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Date, Time, and Description Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          {/* Left: Date Selector shortcuts & Input */}
          <div className="ios-glass p-6 rounded-[2rem] border border-black/[0.03] dark:border-white/[0.03] space-y-4 shadow-xs h-full">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#8e8e93] flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#007aff]" />
              {t('date')}
            </h3>

            <div className="space-y-3">
              {/* Predefined Shortcuts */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setQuickDate(0)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border-0 transition-all cursor-pointer ${
                    date === new Date().toISOString().substring(0, 10)
                      ? 'bg-[#007aff]/15 text-[#007aff]'
                      : 'bg-black/[0.02] hover:bg-black/[0.05] dark:bg-white/[0.03] dark:hover:bg-white/[0.06] text-[#1c1c1e] dark:text-[#f2f2f7]'
                  }`}
                >
                  {language === 'my' ? 'ယနေ့' : 'Today'}
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate(1)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border-0 transition-all cursor-pointer ${
                    date === new Date(Date.now() - 86400000).toISOString().substring(0, 10)
                      ? 'bg-[#007aff]/15 text-[#007aff]'
                      : 'bg-black/[0.02] hover:bg-black/[0.05] dark:bg-white/[0.03] dark:hover:bg-white/[0.06] text-[#1c1c1e] dark:text-[#f2f2f7]'
                  }`}
                >
                  {language === 'my' ? 'မနေ့က' : 'Yesterday'}
                </button>
              </div>

              {/* Native Input field */}
              <input
                type="date"
                required
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (errors.date) {
                    setErrors(prev => ({ ...prev, date: undefined }));
                  }
                }}
                className={`w-full h-11 px-4 bg-black/[0.03] dark:bg-white/[0.04] border rounded-2xl text-xs sm:text-sm font-semibold text-[#1c1c1e] dark:text-[#f2f2f7] focus:outline-none focus:ring-4 transition-all duration-200 ${
                  errors.date
                    ? 'border-red-500/70 focus:ring-red-500/10'
                    : 'border-transparent focus:ring-[#007aff]/15'
                }`}
              />
              {errors.date && (
                <div className="text-[11px] text-red-500 font-extrabold flex items-center gap-1.5 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.date}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Smart Description suggestions & Input */}
          <div className="ios-glass p-6 rounded-[2rem] border border-black/[0.03] dark:border-white/[0.03] space-y-4 shadow-xs h-full">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#8e8e93] flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#007aff]" />
              {t('description')} ({t('optional')})
            </h3>

            <div className="space-y-3.5">
              {/* Plain Input field */}
              <input
                type="text"
                placeholder={language === 'my' ? 'မှတ်စုရေးရန် (ဥပမာ- ထမင်းစားစရိတ်)' : 'e.g. Lunch with friends'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-11 px-4 bg-black/[0.03] dark:bg-white/[0.04] border border-transparent rounded-2xl text-xs sm:text-sm font-semibold text-[#1c1c1e] dark:text-[#f2f2f7] focus:outline-none focus:ring-4 focus:ring-[#007aff]/15 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full h-12 flex items-center justify-center gap-2 bg-[#007aff] hover:bg-[#0066d6] text-white rounded-2xl text-sm font-bold transition-all shadow-md shadow-[#007aff]/10 cursor-pointer border-0 active:scale-[0.98]"
          >
            <Check className="w-5 h-5" />
            <span>{language === 'my' ? 'သိမ်းဆည်းမည်' : 'Save'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
