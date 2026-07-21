import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, DollarSign, Moon, Sun, FileDown, Check, Coins, AlertCircle, Sparkles, FolderKanban, Plus, Trash2, ArrowLeft, Database, RefreshCw, ChevronDown, Search, Tag, ArrowUpRight, ArrowDownLeft, SlidersHorizontal, Mail, ShieldCheck, UploadCloud, LogOut, CloudOff } from 'lucide-react';
import { Language, Currency, Settings, UserProfile } from '../types';
import { TRANSLATIONS } from '../translations';

interface SettingsSectionProps {
  settings: Settings;
  customCurrency: Currency;
  onUpdateLanguage: (lang: Language) => void;
  onUpdateTheme: (theme: 'light' | 'dark') => void;
  onUpdateCurrency: (code: string, symbol: string, name: string) => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
  incomeCategories: string[];
  expenseCategories: string[];
  onAddCategory: (type: 'income' | 'expense', category: string) => void;
  onDeleteCategory: (type: 'income' | 'expense', category: string) => void;
  onLoadDemoData: () => void;
  onClearAllData: () => void;
  profile: UserProfile;
  onEditProfileClick: () => void;
  onRestoreBackup: (data: any) => void;
}

const PRESET_CURRENCIES: Currency[] = [
  { code: 'MMK', symbol: 'Ks', name: 'Myanmar Kyat' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
];

const getCategoryColor = (name: string) => {
  const colors = [
    { bg: 'bg-[#007aff]/10 text-[#007aff] dark:bg-[#007aff]/15', border: 'border-[#007aff]/20' },
    { bg: 'bg-[#34c759]/10 text-[#34c759] dark:bg-[#34c759]/15', border: 'border-[#34c759]/20' },
    { bg: 'bg-[#ff9500]/10 text-[#ff9500] dark:bg-[#ff9500]/15', border: 'border-[#ff9500]/20' },
    { bg: 'bg-[#af52de]/10 text-[#af52de] dark:bg-[#af52de]/15', border: 'border-[#af52de]/20' },
    { bg: 'bg-[#ff3b30]/10 text-[#ff3b30] dark:bg-[#ff3b30]/15', border: 'border-[#ff3b30]/20' },
    { bg: 'bg-[#5856d6]/10 text-[#5856d6] dark:bg-[#5856d6]/15', border: 'border-[#5856d6]/20' },
    { bg: 'bg-[#00c7be]/10 text-[#00c7be] dark:bg-[#00c7be]/15', border: 'border-[#00c7be]/20' },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const EXPENSE_SUGGESTIONS = ['Rent', 'Groceries', 'Utilities', 'Travel', 'Dining', 'Wellness', 'Shopping', 'Gym', 'Education', 'Entertainment'];
const INCOME_SUGGESTIONS = ['Salary', 'Freelance', 'Dividends', 'Bonus', 'Investments', 'Consulting', 'Grants', 'Gifts'];

export const SettingsSection: React.FC<SettingsSectionProps> = React.memo(({
  settings,
  customCurrency,
  onUpdateLanguage,
  onUpdateTheme,
  onExportCSV,
  onExportPDF,
  onUpdateCurrency,
  incomeCategories,
  expenseCategories,
  onAddCategory,
  onDeleteCategory,
  onLoadDemoData,
  onClearAllData,
  profile,
  onEditProfileClick,
  onRestoreBackup,
}) => {
  const t = (key: string) => TRANSLATIONS[settings.language][key] || key;

  // Drag & drop file import states
  const [isDragging, setIsDragging] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Form states for custom currency
  const [currencyCode, setCurrencyCode] = useState(customCurrency.code);
  const [currencySymbol, setCurrencySymbol] = useState(customCurrency.symbol);
  const [currencyName, setCurrencyName] = useState(customCurrency.name);
  const [successMsg, setSuccessMsg] = useState(false);

  // Language dropdown menu state
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processBackupFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processBackupFile(file);
    }
  };

  const processBackupFile = (file: File) => {
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      setImportError(settings.language === 'my' ? 'ဖိုင်အမျိုးအစားသည် JSON ဖြစ်ရပါမည်။' : 'File must be a JSON file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.transactions || !Array.isArray(json.transactions)) {
          throw new Error('Invalid backup structure: transactions are missing');
        }
        setImportError(null);
        onRestoreBackup(json);
      } catch (err) {
        setImportError(settings.language === 'my' ? 'မမှန်ကန်သော ပုံစံဖြစ်နေပါသည် (ပျက်စီးနေသော ဖိုင်ဖြစ်နိုင်သည်)' : 'Invalid backup file structure or corrupted data.');
      }
    };
    reader.readAsText(file);
  };

  // Currency dropdown menu state
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);

  // Sub-page state for Category Management
  const [showManageCategories, setShowManageCategories] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'income' | 'expense'>('expense');
  const [catError, setCatError] = useState<string | undefined>(undefined);
  const [categoriesSearch, setCategoriesSearch] = useState('');
  const [activeCategoryTab, setActiveCategoryTab] = useState<'all' | 'expense' | 'income'>('all');

  const handleCurrencySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currencyCode.trim() && currencySymbol.trim() && currencyName.trim()) {
      onUpdateCurrency(
        currencyCode.trim().toUpperCase(),
        currencySymbol.trim(),
        currencyName.trim()
      );
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    }
  };

  const selectPreset = (curr: Currency) => {
    setCurrencyCode(curr.code);
    setCurrencySymbol(curr.symbol);
    setCurrencyName(curr.name);
    onUpdateCurrency(curr.code, curr.symbol, curr.name);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newCatName.trim();
    if (!cleanName) {
      setCatError("Category name is required.");
      return;
    }
    if (cleanName.length > 20) {
      setCatError("Category name must be 20 characters or less.");
      return;
    }
    const isDuplicate = newCatType === 'expense'
      ? expenseCategories.some(c => c.toLowerCase() === cleanName.toLowerCase())
      : incomeCategories.some(c => c.toLowerCase() === cleanName.toLowerCase());
    if (isDuplicate) {
      setCatError(`Category "${cleanName}" already exists.`);
      return;
    }
    
    setCatError(undefined);
    onAddCategory(newCatType, cleanName);
    setNewCatName('');
  };

  // If the manage categories sub-page is active, render it
  if (showManageCategories) {
    // Dynamic Filtered Categories List based on Search and Tab
    const filteredExpenseList = expenseCategories
      .filter((cat) => cat.toLowerCase().includes(categoriesSearch.toLowerCase()));
    
    const filteredIncomeList = incomeCategories
      .filter((cat) => cat.toLowerCase().includes(categoriesSearch.toLowerCase()));

    // Get current unused suggestions to display
    const currentSuggestions = newCatType === 'expense'
      ? EXPENSE_SUGGESTIONS.filter(s => !expenseCategories.some(c => c.toLowerCase() === s.toLowerCase()))
      : INCOME_SUGGESTIONS.filter(s => !incomeCategories.some(c => c.toLowerCase() === s.toLowerCase()));

    const totalCategoriesCount = expenseCategories.length + incomeCategories.length;
    const expensePercentage = totalCategoriesCount > 0 ? (expenseCategories.length / totalCategoriesCount) * 100 : 50;

    return (
      <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
        {/* Manage Categories Header & Action Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/[0.05] dark:border-white/[0.05] pb-5">
          <div className="flex items-center gap-3.5">
            <button
              id="back-to-settings-btn"
              onClick={() => {
                setShowManageCategories(false);
                setCategoriesSearch('');
                setActiveCategoryTab('all');
                window.scrollTo({ top: 0, behavior: 'instant' });
              }}
              className="w-11 h-11 flex items-center justify-center bg-black/[0.03] hover:bg-black/[0.06] dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-[#1c1c1e] dark:text-[#f2f2f7] rounded-full transition-all cursor-pointer border-0"
              title="Back to Settings"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-black tracking-tight text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-[#007aff]" />
                Manage Categories
              </h2>
              <p className="text-xs text-[#8e8e93] font-medium">
                Design custom classification labels for your cash flow tracking
              </p>
            </div>
          </div>

          {/* Quick Stats overview panel */}
          <div className="bg-black/[0.02] dark:bg-white/[0.03] rounded-3xl p-3 px-4.5 flex items-center gap-6 border border-black/[0.03] dark:border-white/[0.03] max-w-sm">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider font-extrabold text-[#8e8e93]">Total Labels</p>
              <p className="text-lg font-black text-[#1c1c1e] dark:text-white leading-none">
                {totalCategoriesCount}
              </p>
            </div>
            <div className="h-8 w-[1px] bg-black/[0.08] dark:bg-white/[0.08]" />
            <div className="flex-1 space-y-1.5 min-w-[120px]">
              <div className="flex justify-between text-[10px] font-bold text-[#8e8e93]">
                <span>{expenseCategories.length} Exp</span>
                <span>{incomeCategories.length} Inc</span>
              </div>
              <div className="w-full h-1.5 bg-black/[0.06] dark:bg-white/[0.1] rounded-full overflow-hidden flex">
                <div className="bg-[#ff3b30] h-full transition-all duration-500" style={{ width: `${expensePercentage}%` }} />
                <div className="bg-[#34c759] h-full flex-1 transition-all duration-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Categories Tab and Search bar */}
        <div className="flex flex-col sm:flex-row gap-3.5 items-stretch sm:items-center justify-between bg-black/[0.02] dark:bg-white/[0.03] p-2 rounded-3xl border border-black/[0.02] dark:border-white/[0.02]">
          {/* Tabs Filter */}
          <div className="flex p-1 bg-black/[0.04] dark:bg-white/[0.05] rounded-full shrink-0 border border-black/[0.02] dark:border-white/[0.02] h-10 items-center w-full sm:w-auto">
            {([
              { id: 'all', label: 'All Categories' },
              { id: 'expense', label: 'Expenses' },
              { id: 'income', label: 'Incomes' }
            ] as const).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategoryTab(tab.id)}
                className={`flex-1 sm:flex-initial px-4.5 h-8 text-[11px] font-extrabold rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center border-0 ${
                  activeCategoryTab === tab.id
                    ? 'bg-white dark:bg-[#38383a] text-[#007aff] shadow-xs'
                    : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-[#f2f2f7]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e8e93]" />
            <input
              type="text"
              placeholder="Search category tags..."
              value={categoriesSearch}
              onChange={(e) => setCategoriesSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-9 bg-white dark:bg-[#2c2c2e] border border-black/[0.05] dark:border-white/[0.05] focus:border-[#007aff] dark:focus:border-[#007aff] rounded-full text-xs font-semibold text-[#1c1c1e] dark:text-[#f2f2f7] placeholder-[#8e8e93] focus:outline-none transition-all focus:ring-4 focus:ring-[#007aff]/10"
            />
            {categoriesSearch && (
              <button
                type="button"
                onClick={() => setCategoriesSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-black/[0.06] hover:bg-black/[0.1] dark:bg-white/[0.1] dark:hover:bg-white/[0.15] text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-[#f2f2f7] transition-all cursor-pointer border-0 text-[9px]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Premium Add Category Form (4 cols) */}
          <div className="lg:col-span-4 p-6 ios-glass rounded-[2rem] space-y-5 border border-black/[0.03] dark:border-white/[0.03] shadow-xs">
            <div>
              <h3 className="text-sm font-black text-[#1c1c1e] dark:text-white flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#007aff]" />
                Create Custom Tag
              </h3>
              <p className="text-[11px] text-[#8e8e93] font-medium mt-1">
                Establish high-fidelity tracking metrics tailored to you
              </p>
            </div>

            <form onSubmit={handleAddCategorySubmit} noValidate className="space-y-4">
              {/* Type Picker */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#8e8e93]">
                  Category Type
                </label>
                <div className="grid grid-cols-2 gap-1 p-1.5 bg-[#f2f2f7] dark:bg-[#2c2c2e] rounded-2xl">
                  <button
                    type="button"
                    onClick={() => {
                      setNewCatType('expense');
                      setCatError(undefined);
                    }}
                    className={`py-2 text-xs font-extrabold rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 border-0 bg-transparent ${
                      newCatType === 'expense'
                        ? 'bg-white dark:bg-[#1c1c1e] text-[#ff3b30] shadow-xs font-black'
                        : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-[#f2f2f7]'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewCatType('income');
                      setCatError(undefined);
                    }}
                    className={`py-2 text-xs font-extrabold rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 border-0 bg-transparent ${
                      newCatType === 'income'
                        ? 'bg-white dark:bg-[#1c1c1e] text-[#34c759] shadow-xs font-black'
                        : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-[#f2f2f7]'
                    }`}
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    Income
                  </button>
                </div>
              </div>

              {/* Input field */}
              <div className="space-y-1.5">
                <label htmlFor="new-cat-name-input" className="text-[11px] font-bold uppercase tracking-wider text-[#8e8e93]">
                  Category Name
                </label>
                <input
                  id="new-cat-name-input"
                  type="text"
                  placeholder={newCatType === 'expense' ? 'e.g. Gym, Rent, Coffee' : 'e.g. Freelance, Rent Income'}
                  value={newCatName}
                  onChange={(e) => {
                    setNewCatName(e.target.value);
                    if (catError) {
                      setCatError(undefined);
                    }
                  }}
                  className={`w-full h-11 px-4 bg-[#f2f2f7] dark:bg-[#2c2c2e] border rounded-2xl text-xs md:text-sm font-semibold text-[#1c1c1e] dark:text-[#f2f2f7] focus:outline-none transition-all duration-200 ${
                    catError
                      ? 'border-red-500/70 focus:ring-4 focus:ring-red-500/10'
                      : 'border-transparent focus:ring-4 focus:ring-[#007aff]/15'
                  }`}
                />
                {catError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[11px] text-red-500 font-extrabold mt-1.5 flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {catError}
                  </motion.p>
                )}
              </div>

              <button
                id="add-category-btn"
                type="submit"
                className="w-full h-11 flex items-center justify-center gap-1.5 bg-[#007aff] hover:bg-[#0071eb] text-white rounded-2xl text-xs font-bold transition-all cursor-pointer border-0 shadow-xs active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                Add Category Tag
              </button>
            </form>

            {/* Smart suggestions panel */}
            {currentSuggestions.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-black/[0.05] dark:border-white/[0.05]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8e8e93] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#ff9500]" />
                  Popular Suggestions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {currentSuggestions.slice(0, 6).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setNewCatName(item);
                        setCatError(undefined);
                      }}
                      className="px-2.5 py-1.5 text-[10px] font-extrabold rounded-full bg-black/[0.03] hover:bg-black/[0.06] dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-[#1c1c1e] dark:text-[#f2f2f7] border border-black/[0.03] dark:border-white/[0.03] transition-all cursor-pointer"
                    >
                      +{item}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Dynamic filtered list manager (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Expense Categories List */}
              {(activeCategoryTab === 'all' || activeCategoryTab === 'expense') && (
                <div className="p-5 ios-glass rounded-[2rem] space-y-4 flex flex-col border border-black/[0.03] dark:border-white/[0.03] shadow-xs">
                  <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.05] pb-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#ff3b30] flex items-center gap-1.5">
                      <ArrowUpRight className="w-4 h-4" />
                      Expense Tags ({filteredExpenseList.length})
                    </h3>
                  </div>
                  
                  {filteredExpenseList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-[#ff3b30]/10 flex items-center justify-center text-[#ff3b30]">
                        <Tag className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-[#1c1c1e] dark:text-white">No Expense Tags Found</p>
                        <p className="text-[10px] text-[#8e8e93] px-4">Try adding custom tags or clearing filters</p>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-y-auto max-h-[350px] space-y-2 pr-1 custom-scrollbar">
                      <AnimatePresence initial={false}>
                        {filteredExpenseList.map((cat) => {
                          const col = getCategoryColor(cat);
                          return (
                            <motion.div
                              key={cat}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="flex items-center justify-between p-3 bg-black/[0.01] hover:bg-black/[0.03] dark:bg-white/[0.01] dark:hover:bg-white/[0.03] rounded-2xl border border-black/[0.02] dark:border-white/[0.02] transition-all"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-8 h-8 rounded-xl font-black text-[11px] uppercase flex items-center justify-center shrink-0 shadow-xs border ${col.bg} ${col.border}`}>
                                  {cat.substring(0, 2)}
                                </div>
                                <span className="text-xs font-black text-[#1c1c1e] dark:text-[#f2f2f7] truncate">
                                  {cat}
                                </span>
                              </div>
                              {expenseCategories.length > 1 && (
                                <button
                                  id={`delete-cat-${cat}`}
                                  type="button"
                                  onClick={() => onDeleteCategory('expense', cat)}
                                  className="w-8 h-8 flex items-center justify-center text-[#8e8e93] hover:text-[#ff3b30] rounded-full hover:bg-red-500/10 transition-colors cursor-pointer border-0 bg-transparent"
                                  title="Delete Tag"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              )}

              {/* Income Categories List */}
              {(activeCategoryTab === 'all' || activeCategoryTab === 'income') && (
                <div className="p-5 ios-glass rounded-[2rem] space-y-4 flex flex-col border border-black/[0.03] dark:border-white/[0.03] shadow-xs">
                  <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.05] pb-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#34c759] flex items-center gap-1.5">
                      <ArrowDownLeft className="w-4 h-4" />
                      Income Tags ({filteredIncomeList.length})
                    </h3>
                  </div>

                  {filteredIncomeList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-[#34c759]/10 flex items-center justify-center text-[#34c759]">
                        <Tag className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-[#1c1c1e] dark:text-white">No Income Tags Found</p>
                        <p className="text-[10px] text-[#8e8e93] px-4">Try adding custom tags or clearing filters</p>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-y-auto max-h-[350px] space-y-2 pr-1 custom-scrollbar">
                      <AnimatePresence initial={false}>
                        {filteredIncomeList.map((cat) => {
                          const col = getCategoryColor(cat);
                          return (
                            <motion.div
                              key={cat}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="flex items-center justify-between p-3 bg-black/[0.01] hover:bg-black/[0.03] dark:bg-white/[0.01] dark:hover:bg-white/[0.03] rounded-2xl border border-black/[0.02] dark:border-white/[0.02] transition-all"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-8 h-8 rounded-xl font-black text-[11px] uppercase flex items-center justify-center shrink-0 shadow-xs border ${col.bg} ${col.border}`}>
                                  {cat.substring(0, 2)}
                                </div>
                                <span className="text-xs font-black text-[#1c1c1e] dark:text-[#f2f2f7] truncate">
                                  {cat}
                                </span>
                              </div>
                              {incomeCategories.length > 1 && (
                                <button
                                  id={`delete-cat-${cat}`}
                                  type="button"
                                  onClick={() => onDeleteCategory('income', cat)}
                                  className="w-8 h-8 flex items-center justify-center text-[#8e8e93] hover:text-[#ff3b30] rounded-full hover:bg-red-500/10 transition-colors cursor-pointer border-0 bg-transparent"
                                  title="Delete Tag"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="settings-section">
      {/* Settings Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#007aff]" />
          {t('settings')}
        </h2>
        <p className="text-xs text-[#8e8e93]">
          Preferences, language, currency, categories and data export
        </p>
      </div>

      {/* iOS Style Profile Card at top of settings */}
      <div className="p-5 ios-glass rounded-[2rem] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <img
            src={profile.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={profile.name}
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-2xl object-cover border-2 border-white dark:border-[#2c2c2e] shadow-sm bg-slate-100"
          />
          <div>
            <h3 className="text-sm font-bold text-[#1c1c1e] dark:text-white">
              {profile.name}
            </h3>
            <p className="text-xs text-[#8e8e93] font-medium">
              {profile.email} {profile.occupation ? `• ${profile.occupation}` : ''}
            </p>
          </div>
        </div>
        <button
          id="settings-edit-profile-btn"
          onClick={onEditProfileClick}
          className="self-start sm:self-auto shrink-0 whitespace-nowrap flex items-center gap-1 px-3.5 py-1.5 bg-[#007aff]/10 hover:bg-[#007aff]/15 text-[#007aff] rounded-xl text-xs font-bold transition-all cursor-pointer border-0"
        >
          {t('editProfile')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Localization & Appearance Preferences */}
        <div className="space-y-6">
          {/* Theme & Language */}
          <div className={`p-5 ios-glass rounded-[2rem] space-y-5 relative transition-all duration-200 ${showLanguageMenu ? 'z-50' : 'z-10'}`}>
            <h3 className="text-sm font-bold text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
              <Sun className="w-4 h-4 text-[#ff9500]" />
              General Preferences
            </h3>

            {/* Language Selection */}
            <div className="space-y-2 flex flex-col relative" id="language-dropdown-container">
              <label className="text-xs font-bold text-[#8e8e93]">
                {t('language')}
              </label>
              
              <button
                id="language-dropdown-btn"
                type="button"
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="w-full h-11 px-4.5 bg-[#f2f2f7] dark:bg-[#2c2c2e] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] rounded-2xl flex items-center justify-between text-xs md:text-sm font-semibold text-[#1c1c1e] dark:text-[#f2f2f7] transition-all cursor-pointer border-0"
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-[#007aff]" />
                  <span>
                    {settings.language === 'en' ? 'English' : 'မြန်မာ (Myanmar)'}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-[#8e8e93] transition-transform duration-200 ${showLanguageMenu ? 'rotate-180' : ''}`} />
              </button>

              {showLanguageMenu && (
                <>
                  {/* Invisible click backdrop to close */}
                  <div
                    className="fixed inset-0 z-30 bg-transparent"
                    onClick={() => setShowLanguageMenu(false)}
                  />

                  {/* Dropdown Card */}
                  <div
                    className="absolute left-0 right-0 top-full mt-2 rounded-2xl bg-white/75 dark:bg-[#1c1c1e]/70 backdrop-blur-2xl border border-white/50 dark:border-white/12 shadow-2xl z-40 p-2 space-y-0.5"
                  >
                    <div className="px-3 py-1.5 text-[10px] font-extrabold text-[#8e8e93] uppercase tracking-wider">
                      {settings.language === 'my' ? 'ဘာသာစကားရွေးချယ်ရန်' : 'Choose Language'}
                    </div>

                    {/* English Option */}
                    <button
                      id="lang-opt-en"
                      type="button"
                      onClick={() => {
                        onUpdateLanguage('en');
                        setShowLanguageMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-all text-left cursor-pointer border-0 bg-transparent ${
                        settings.language === 'en' ? 'text-[#007aff]' : 'text-[#1c1c1e] dark:text-[#f2f2f7]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          settings.language === 'en' ? 'bg-[#007aff]/10 text-[#007aff]' : 'bg-black/[0.03] dark:bg-white/[0.05] text-[#8e8e93]'
                        }`}>
                          EN
                        </div>
                        <div>
                          <p className="text-xs font-extrabold leading-tight">English</p>
                          <p className="text-[10px] text-[#8e8e93] leading-none mt-1">United States / Global</p>
                        </div>
                      </div>
                      {settings.language === 'en' && <Check className="w-4 h-4 text-[#007aff] shrink-0" />}
                    </button>

                    {/* Myanmar Option */}
                    <button
                      id="lang-opt-my"
                      type="button"
                      onClick={() => {
                        onUpdateLanguage('my');
                        setShowLanguageMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-all text-left cursor-pointer border-0 bg-transparent ${
                        settings.language === 'my' ? 'text-[#007aff]' : 'text-[#1c1c1e] dark:text-[#f2f2f7]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          settings.language === 'my' ? 'bg-[#007aff]/10 text-[#007aff]' : 'bg-black/[0.03] dark:bg-white/[0.05] text-[#8e8e93]'
                        }`}>
                          MY
                        </div>
                        <div>
                          <p className="text-xs font-extrabold leading-tight">မြန်မာ (Myanmar)</p>
                          <p className="text-[10px] text-[#8e8e93] leading-none mt-1">Burmese / Localized</p>
                        </div>
                      </div>
                      {settings.language === 'my' && <Check className="w-4 h-4 text-[#007aff] shrink-0" />}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Theme Toggle */}
            <div className="space-y-2 flex flex-col">
              <label className="text-xs font-bold text-[#8e8e93]">
                {t('theme')}
              </label>
              <div className="relative flex bg-[#f2f2f7] dark:bg-[#2c2c2e] p-1 rounded-2xl w-full h-11">
                {/* Sliding active container backdrop */}
                <div
                  className="absolute top-1 bottom-1 rounded-xl bg-white dark:bg-[#1c1c1e] shadow-xs border border-[#e5e5ea] dark:border-[#3a3a3c] transition-all duration-200 ease-out"
                  style={{
                    left: settings.theme === 'light' ? '4px' : 'calc(50% + 2px)',
                    width: 'calc(50% - 6px)',
                  }}
                />

                {/* Light Mode Button */}
                <button
                  id="theme-toggle-light"
                  type="button"
                  onClick={() => onUpdateTheme('light')}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer relative z-10 select-none ${
                    settings.theme === 'light'
                      ? 'text-[#ff9500]'
                      : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-[#f2f2f7]'
                  }`}
                >
                  <Sun className={`w-4 h-4 shrink-0 transition-transform duration-300 ${settings.theme === 'light' ? 'rotate-12 scale-110' : ''}`} />
                  <span>{t('lightMode')}</span>
                </button>

                {/* Dark Mode Button */}
                <button
                  id="theme-toggle-dark"
                  type="button"
                  onClick={() => onUpdateTheme('dark')}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer relative z-10 select-none ${
                    settings.theme === 'dark'
                      ? 'text-[#007aff]'
                      : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-[#f2f2f7]'
                  }`}
                >
                  <Moon className={`w-4 h-4 shrink-0 transition-transform duration-300 ${settings.theme === 'dark' ? '-rotate-12 scale-110' : ''}`} />
                  <span>{t('darkMode')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Currency Manager */}
          <div className={`p-5 ios-glass rounded-[2rem] space-y-5 relative transition-all duration-200 ${showCurrencyMenu ? 'z-50' : 'z-10'}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
                <Coins className="w-4 h-4 text-[#007aff]" />
                {t('currency')}
              </h3>
              <span className="text-[10px] bg-[#007aff]/10 text-[#007aff] border border-[#007aff]/20 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                Flexible
              </span>
            </div>

            {/* Currency Selection Dropdown */}
            <div className="space-y-2 flex flex-col relative" id="currency-dropdown-container">
              <label className="text-xs font-bold text-[#8e8e93]">
                {settings.language === 'my' ? 'ငွေကြေးရွေးချယ်ရန်' : 'Select Preferred Currency'}
              </label>
              
              <button
                id="currency-dropdown-btn"
                type="button"
                onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
                className="w-full h-11 px-4.5 bg-[#f2f2f7] dark:bg-[#2c2c2e] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] rounded-2xl flex items-center justify-between text-xs md:text-sm font-semibold text-[#1c1c1e] dark:text-[#f2f2f7] transition-all cursor-pointer border-0"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-[#007aff]/10 text-[#007aff] flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    {customCurrency.symbol}
                  </span>
                  <span>
                    {customCurrency.code} - {customCurrency.name}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-[#8e8e93] transition-transform duration-200 ${showCurrencyMenu ? 'rotate-180' : ''}`} />
              </button>

              {showCurrencyMenu && (
                <>
                  <div
                    className="fixed inset-0 z-30 bg-transparent"
                    onClick={() => setShowCurrencyMenu(false)}
                  />
                  <div
                    className="absolute left-0 right-0 top-full mt-2 rounded-2xl bg-white/75 dark:bg-[#1c1c1e]/70 backdrop-blur-2xl border border-white/50 dark:border-white/12 shadow-2xl z-40 p-2 space-y-0.5 max-h-60 overflow-y-auto scrollbar-thin"
                  >
                    <div className="px-3 py-1.5 text-[10px] font-extrabold text-[#8e8e93] uppercase tracking-wider">
                      {settings.language === 'my' ? 'ငွေကြေးအမျိုးအစားရွေးချယ်ရန်' : 'Choose Currency'}
                    </div>
                    {PRESET_CURRENCIES.map((curr) => {
                      const isSelected = customCurrency.code === curr.code;
                      return (
                        <button
                          key={curr.code}
                          id={`preset-curr-${curr.code}`}
                          type="button"
                          onClick={() => {
                            selectPreset(curr);
                            setShowCurrencyMenu(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-all text-left cursor-pointer border-0 bg-transparent ${
                            isSelected ? 'text-[#007aff]' : 'text-[#1c1c1e] dark:text-[#f2f2f7]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                              isSelected ? 'bg-[#007aff]/10 text-[#007aff]' : 'bg-black/[0.03] dark:bg-white/[0.05] text-[#8e8e93]'
                            }`}>
                              {curr.symbol}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-extrabold leading-tight">{curr.code}</p>
                              <p className="text-[10px] text-[#8e8e93] leading-none mt-1 truncate">{curr.name}</p>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#007aff] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Manage Categories Menu */}
          <div className="p-5 ios-glass rounded-[2rem] space-y-4">
            <h3 className="text-sm font-bold text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-[#007aff]" />
              Manage Categories
            </h3>
            <p className="text-xs text-[#8e8e93]">
              Add new custom categories or remove existing categories for classification.
            </p>
            <button
              id="open-manage-categories-btn"
              onClick={() => {
                setShowManageCategories(true);
                window.scrollTo({ top: 0, behavior: 'instant' });
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#007aff]/10 hover:bg-[#007aff]/15 text-[#007aff] rounded-2xl text-xs font-bold transition-all cursor-pointer border-0"
            >
              <FolderKanban className="w-4 h-4" />
              Open Manage Categories Menu
            </button>
          </div>
        </div>

        {/* Right Column: Currency & Data Controls */}
        <div className="space-y-6">
          {/* Data Export section */}
          <div className="p-5 ios-glass rounded-[2rem] space-y-4">
            <h3 className="text-sm font-bold text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
              <FileDown className="w-4 h-4 text-[#34c759]" />
              {t('exportData')}
            </h3>
            <p className="text-xs text-[#8e8e93]">
              Download your transactions and budgets in highly standard, portable formats for bookkeeping, accounting, or physical filing.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                id="export-csv-btn"
                onClick={onExportCSV}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-[#34c759] hover:bg-[#30b753] text-white rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <FileDown className="w-4 h-4" />
                {t('exportCSV')}
              </button>
              <button
                id="export-pdf-btn"
                onClick={onExportPDF}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-[#007aff] hover:bg-[#0071eb] text-white rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-xs border-0"
              >
                <FileDown className="w-4 h-4" />
                {t('exportPDF')}
              </button>
            </div>
          </div>

          {/* Local / Offline File Restore Card */}
          <div className="p-5 ios-glass rounded-[2rem] space-y-4">
            <h3 className="text-sm font-bold text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#34c759]" />
              {settings.language === 'my' ? 'ဒေတာများကို ပြန်လည်သွင်းယူခြင်း' : 'Restore from Backup File'}
            </h3>
            <p className="text-xs text-[#8e8e93] leading-relaxed">
              {settings.language === 'my'
                ? 'သင့်အီးမေးလ် သို့မဟုတ် ကွန်ပျူတာထဲရှိ money_manager_backup.json ဖိုင်ကို ရွေးချယ်ပြီး ယခင်စာရင်းများကို စက္ကန့်ပိုင်းအတွင်း ပြန်လည်သွင်းယူပါ။'
                : 'Import your money_manager_backup.json file (either from Gmail attachments or local storage) to restore your entire ledger instantly.'}
            </p>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                isDragging 
                  ? 'border-[#34c759] bg-[#34c759]/5' 
                  : 'border-black/[0.08] dark:border-white/[0.08] hover:border-[#34c759]/40 hover:bg-black/[0.01] dark:hover:bg-white/[0.01]'
              }`}
            >
              <input
                type="file"
                id="backup-file-input"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label htmlFor="backup-file-input" className="cursor-pointer block space-y-2.5">
                <div className="w-10 h-10 rounded-full bg-[#34c759]/10 text-[#34c759] flex items-center justify-center mx-auto">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#1c1c1e] dark:text-[#f2f2f7]">
                    {settings.language === 'my' ? 'ဖိုင်ရွေးချယ်ရန် နှိပ်ပါ သို့မဟုတ် ဖိုင်ဆွဲထည့်ပါ' : 'Click to select or drag & drop JSON file'}
                  </p>
                  <p className="text-[10px] text-[#8e8e93]">
                    money_manager_backup.json
                  </p>
                </div>
              </label>
            </div>

            {importError && (
              <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-[#ff3b30]/10 text-[#ff3b30] text-[11px] font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{importError}</span>
              </div>
            )}
          </div>



          {/* Data Management */}
          <div className="p-5 ios-glass rounded-[2rem] space-y-4">
            <h3 className="text-sm font-bold text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
              <Database className="w-4 h-4 text-[#5856d6]" />
              {t('demoDataSection')}
            </h3>
            <p className="text-xs text-[#8e8e93] leading-relaxed">
              {t('demoDataDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                id="load-demo-data-btn"
                onClick={onLoadDemoData}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-[#5856d6]/10 hover:bg-[#5856d6]/20 text-[#5856d6] rounded-2xl text-xs font-bold transition-all cursor-pointer border-0"
              >
                <RefreshCw className="w-4 h-4" />
                {t('loadDemoData')}
              </button>
              <button
                id="clear-all-data-btn"
                onClick={onClearAllData}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-[#ff3b30]/10 hover:bg-[#ff3b30]/20 text-[#ff3b30] rounded-2xl text-xs font-bold transition-all cursor-pointer border-0"
              >
                <Trash2 className="w-4 h-4" />
                {t('clearAllData')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
