import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FolderKanban,
  X,
  Search,
  Tag,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
  Plus,
  Sparkles,
  Trash2
} from 'lucide-react';
import { Settings } from '../../types';
import { CATEGORY_TRANSLATIONS } from '../../translations';

interface ManageCategoriesViewProps {
  t: (key: string) => string;
  settings: Settings;
  incomeCategories: string[];
  expenseCategories: string[];
  onAddCategory: (type: 'income' | 'expense', category: string) => void;
  onDeleteCategory: (type: 'income' | 'expense', category: string) => void;
  onClose: () => void;
}

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

export const ManageCategoriesView: React.FC<ManageCategoriesViewProps> = React.memo(({
  t,
  settings,
  incomeCategories,
  expenseCategories,
  onAddCategory,
  onDeleteCategory,
  onClose,
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'income' | 'expense'>('expense');
  const [catError, setCatError] = useState<string | undefined>(undefined);
  const [categoriesSearch, setCategoriesSearch] = useState('');
  const [activeCategoryTab, setActiveCategoryTab] = useState<'all' | 'expense' | 'income'>('all');

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newCatName.trim();
    if (!cleanName) {
      setCatError(t('categoryNameRequired'));
      return;
    }
    if (cleanName.length > 20) {
      setCatError(t('categoryNameTooLong'));
      return;
    }
    const isDuplicate = newCatType === 'expense'
      ? expenseCategories.some(c => c.toLowerCase() === cleanName.toLowerCase() || (CATEGORY_TRANSLATIONS['my']?.[c] && CATEGORY_TRANSLATIONS['my'][c].toLowerCase() === cleanName.toLowerCase()))
      : incomeCategories.some(c => c.toLowerCase() === cleanName.toLowerCase() || (CATEGORY_TRANSLATIONS['my']?.[c] && CATEGORY_TRANSLATIONS['my'][c].toLowerCase() === cleanName.toLowerCase()));
    if (isDuplicate) {
      setCatError(`${t('categoryAlreadyExists')} (${cleanName})`);
      return;
    }
    
    setCatError(undefined);
    onAddCategory(newCatType, cleanName);
    setNewCatName('');
  };

  const filteredExpenseList = expenseCategories
    .filter((cat) => {
      const myName = CATEGORY_TRANSLATIONS['my']?.[cat] || '';
      const searchLower = categoriesSearch.toLowerCase();
      return cat.toLowerCase().includes(searchLower) || myName.toLowerCase().includes(searchLower);
    });
  
  const filteredIncomeList = incomeCategories
    .filter((cat) => {
      const myName = CATEGORY_TRANSLATIONS['my']?.[cat] || '';
      const searchLower = categoriesSearch.toLowerCase();
      return cat.toLowerCase().includes(searchLower) || myName.toLowerCase().includes(searchLower);
    });

  const currentSuggestions = newCatType === 'expense'
    ? EXPENSE_SUGGESTIONS.filter(s => !expenseCategories.some(c => c.toLowerCase() === s.toLowerCase()))
    : INCOME_SUGGESTIONS.filter(s => !incomeCategories.some(c => c.toLowerCase() === s.toLowerCase()));

  const totalCategoriesCount = expenseCategories.length + incomeCategories.length;
  const expensePercentage = totalCategoriesCount > 0 ? (expenseCategories.length / totalCategoriesCount) * 100 : 50;

  return (
    <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
      {/* Manage Categories Header & Action Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/[0.05] dark:border-white/[0.05] pb-5">
        <div className="flex items-start justify-between w-full md:w-auto gap-4">
          <div>
            <h2 className="text-xl font-black tracking-tight text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-[#007aff]" />
              {t('manageCategories')}
            </h2>
            <p className="text-xs text-[#8e8e93] font-medium">
              {t('manageCategoriesHeaderDesc')}
            </p>
          </div>
          
          <button
            id="close-categories-btn"
            onClick={onClose}
            className="md:hidden w-11 h-11 flex items-center justify-center bg-[#f2f2f7] dark:bg-[#2c2c2e] text-[#1c1c1e] dark:text-[#f2f2f7] rounded-full hover:opacity-80 transition-all cursor-pointer border-0 shrink-0"
            title={settings.language === 'my' ? 'ပိတ်ရန်' : 'Close Manage Categories'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
          <div className="bg-black/[0.02] dark:bg-white/[0.03] rounded-3xl p-3 px-4.5 flex items-center gap-6 border border-black/[0.03] dark:border-white/[0.03] max-w-sm flex-1 md:flex-initial">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider font-extrabold text-[#8e8e93]">{t('totalLabelsText')}</p>
              <p className="text-lg font-black text-[#1c1c1e] dark:text-white leading-none">
                {totalCategoriesCount}
              </p>
            </div>
            <div className="h-8 w-[1px] bg-black/[0.08] dark:bg-white/[0.08]" />
            <div className="flex-1 space-y-1.5 min-w-[120px]">
              <div className="flex justify-between text-[10px] font-bold text-[#8e8e93]">
                <span>{expenseCategories.length} {settings.language === 'my' ? 'ထွက်' : 'Exp'}</span>
                <span>{incomeCategories.length} {settings.language === 'my' ? 'ဝင်' : 'Inc'}</span>
              </div>
              <div className="w-full h-1.5 bg-black/[0.06] dark:bg-white/[0.1] rounded-full overflow-hidden flex">
                <div className="bg-[#ff3b30] h-full transition-all duration-500" style={{ width: `${expensePercentage}%` }} />
                <div className="bg-[#34c759] h-full flex-1 transition-all duration-500" />
              </div>
            </div>
          </div>

          <button
            id="close-categories-btn-desktop"
            onClick={onClose}
            className="hidden md:flex w-11 h-11 items-center justify-center bg-[#f2f2f7] dark:bg-[#2c2c2e] text-[#1c1c1e] dark:text-[#f2f2f7] rounded-full hover:opacity-80 transition-all cursor-pointer border-0 shrink-0"
            title={settings.language === 'my' ? 'ပိတ်ရန်' : 'Close Manage Categories'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Categories Tab and Search bar */}
      <div className="flex flex-col sm:flex-row gap-3.5 items-stretch sm:items-center justify-between bg-black/[0.02] dark:bg-white/[0.03] p-2 rounded-3xl border border-black/[0.02] dark:border-white/[0.02]">
        <div className="flex p-1 bg-black/[0.04] dark:bg-white/[0.05] rounded-full shrink-0 border border-black/[0.02] dark:border-white/[0.02] h-10 items-center w-full sm:w-auto">
          {([
            { id: 'all', label: t('allCategories') },
            { id: 'expense', label: t('expenses') },
            { id: 'income', label: t('incomes') }
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

        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e8e93]" />
          <input
            type="text"
            placeholder={t('searchCategoryTagsPlaceholder')}
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
        {/* Left Column: Premium Add Category Form */}
        <div className="lg:col-span-4 p-6 ios-glass rounded-[2rem] space-y-5 border border-black/[0.03] dark:border-white/[0.03] shadow-xs">
          <div>
            <h3 className="text-sm font-black text-[#1c1c1e] dark:text-white flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-[#007aff]" />
              {t('createCustomTag')}
            </h3>
            <p className="text-[11px] text-[#8e8e93] font-medium mt-1">
              {t('createCustomTagDesc')}
            </p>
          </div>

          <form onSubmit={handleAddCategorySubmit} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#8e8e93]">
                {t('categoryTypeLabel')}
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
                  {t('expense')}
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
                  {t('income')}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="new-cat-name-input" className="text-[11px] font-bold uppercase tracking-wider text-[#8e8e93]">
                {t('categoryNameLabel')}
              </label>
              <input
                id="new-cat-name-input"
                type="text"
                placeholder={
                  newCatType === 'expense'
                    ? (settings.language === 'my' ? 'ဥပမာ - အားကစား၊ အိမ်လခ၊ ကော်ဖီ' : 'e.g. Gym, Rent, Coffee')
                    : (settings.language === 'my' ? 'ဥပမာ - အလွတ်တန်း၊ ဆိုင်ဝင်ငွေ' : 'e.g. Freelance, Rent Income')
                }
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
              {t('addCategoryTagBtn')}
            </button>
          </form>

          {currentSuggestions.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-black/[0.05] dark:border-white/[0.05]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8e8e93] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#ff9500]" />
                {t('popularSuggestionsLabel')}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {currentSuggestions.slice(0, 6).map((item) => {
                  const translatedSuggestion = CATEGORY_TRANSLATIONS[settings.language]?.[item] || item;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setNewCatName(translatedSuggestion);
                        setCatError(undefined);
                      }}
                      className="px-2.5 py-1.5 text-[10px] font-extrabold rounded-full bg-black/[0.03] hover:bg-black/[0.06] dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-[#1c1c1e] dark:text-[#f2f2f7] border border-black/[0.03] dark:border-white/[0.03] transition-all cursor-pointer"
                    >
                      +{translatedSuggestion}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Dynamic filtered list manager */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Expense Categories List */}
            {(activeCategoryTab === 'all' || activeCategoryTab === 'expense') && (
              <div className="p-5 ios-glass rounded-[2rem] space-y-4 flex flex-col border border-black/[0.03] dark:border-white/[0.03] shadow-xs">
                <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.05] pb-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#ff3b30] flex items-center gap-1.5">
                    <ArrowUpRight className="w-4 h-4" />
                    {t('expenseTagsLabel')} ({filteredExpenseList.length})
                  </h3>
                </div>
                
                {filteredExpenseList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-[#ff3b30]/10 flex items-center justify-center text-[#ff3b30]">
                      <Tag className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-[#1c1c1e] dark:text-white">{t('noExpenseTagsFound')}</p>
                      <p className="text-[10px] text-[#8e8e93] px-4">{t('tryAddingOrClearing')}</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-y-auto max-h-[350px] space-y-2 pr-1 custom-scrollbar">
                    <AnimatePresence initial={false}>
                      {filteredExpenseList.map((cat) => {
                        const col = getCategoryColor(cat);
                        const translatedName = CATEGORY_TRANSLATIONS[settings.language]?.[cat] || CATEGORY_TRANSLATIONS['my']?.[cat] || cat;
                        const myanmarTranslation = CATEGORY_TRANSLATIONS['my']?.[cat];
                        const showSubtext = settings.language === 'my' && myanmarTranslation && cat !== myanmarTranslation;

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
                                {translatedName.substring(0, 2)}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-black text-[#1c1c1e] dark:text-[#f2f2f7] truncate">
                                  {translatedName}
                                </span>
                                {showSubtext && (
                                  <span className="text-[10px] text-[#8e8e93] font-medium truncate">
                                    {cat}
                                  </span>
                                )}
                              </div>
                            </div>
                            {expenseCategories.length > 1 && (
                              <button
                                id={`delete-cat-${cat}`}
                                type="button"
                                onClick={() => onDeleteCategory('expense', cat)}
                                className="w-8 h-8 flex items-center justify-center text-[#8e8e93] hover:text-[#ff3b30] rounded-full hover:bg-red-500/10 transition-colors cursor-pointer border-0 bg-transparent"
                                title={t('deleteTagTooltip')}
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
                    {t('incomeTagsLabel')} ({filteredIncomeList.length})
                  </h3>
                </div>

                {filteredIncomeList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-[#34c759]/10 flex items-center justify-center text-[#34c759]">
                      <Tag className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-[#1c1c1e] dark:text-white">{t('noIncomeTagsFound')}</p>
                      <p className="text-[10px] text-[#8e8e93] px-4">{t('tryAddingOrClearing')}</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-y-auto max-h-[350px] space-y-2 pr-1 custom-scrollbar">
                    <AnimatePresence initial={false}>
                      {filteredIncomeList.map((cat) => {
                        const col = getCategoryColor(cat);
                        const translatedName = CATEGORY_TRANSLATIONS[settings.language]?.[cat] || CATEGORY_TRANSLATIONS['my']?.[cat] || cat;
                        const myanmarTranslation = CATEGORY_TRANSLATIONS['my']?.[cat];
                        const showSubtext = settings.language === 'my' && myanmarTranslation && cat !== myanmarTranslation;

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
                                {translatedName.substring(0, 2)}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-black text-[#1c1c1e] dark:text-[#f2f2f7] truncate">
                                  {translatedName}
                                </span>
                                {showSubtext && (
                                  <span className="text-[10px] text-[#8e8e93] font-medium truncate">
                                    {cat}
                                  </span>
                                )}
                              </div>
                            </div>
                            {incomeCategories.length > 1 && (
                              <button
                                id={`delete-cat-${cat}`}
                                type="button"
                                onClick={() => onDeleteCategory('income', cat)}
                                className="w-8 h-8 flex items-center justify-center text-[#8e8e93] hover:text-[#ff3b30] rounded-full hover:bg-red-500/10 transition-colors cursor-pointer border-0 bg-transparent"
                                title={t('deleteTagTooltip')}
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
});
