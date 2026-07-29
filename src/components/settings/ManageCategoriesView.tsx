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
  Trash2,
  EyeOff,
  Check,
  Palette,
  CheckCircle2,
  Archive,
  Info
} from 'lucide-react';
import { Settings } from '../../types';
import { CATEGORY_TRANSLATIONS } from '../../translations';

interface ManageCategoriesViewProps {
  t: (key: string) => string;
  settings: Settings;
  incomeCategories: string[];
  expenseCategories: string[];
  inactiveIncomeCategories?: string[];
  inactiveExpenseCategories?: string[];
  categoryColors?: Record<string, string>;
  onAddCategory: (type: 'income' | 'expense', category: string, color?: string) => void;
  onDeactivateCategory?: (type: 'income' | 'expense', category: string) => void;
  onReactivateCategory?: (type: 'income' | 'expense', category: string) => void;
  onDeleteCategoryPermanently?: (type: 'income' | 'expense', category: string) => void;
  onUpdateCategoryColor?: (category: string, color: string) => void;
  onDeleteCategory: (type: 'income' | 'expense', category: string) => void;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#007aff', // iOS Blue
  '#34c759', // iOS Emerald
  '#ff9500', // iOS Orange
  '#af52de', // iOS Purple
  '#ff3b30', // iOS Red
  '#5856d6', // iOS Indigo
  '#00c7be', // iOS Teal
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#6366f1', // Violet
  '#8b5cf6', // Indigo
];

export const getCategoryColor = (name: string, customColors?: Record<string, string>): {
  bg: string;
  border: string;
  style?: React.CSSProperties;
  hex: string;
} => {
  const norm = name.trim();
  const customHex = customColors?.[norm] || customColors?.[norm.toLowerCase()];
  if (customHex) {
    return {
      bg: '',
      border: '',
      style: {
        backgroundColor: `${customHex}1f`,
        color: customHex,
        borderColor: `${customHex}33`,
      },
      hex: customHex,
    };
  }

  const fallbackColors = [
    { bg: 'bg-[#007aff]/10 text-[#007aff] dark:bg-[#007aff]/15', border: 'border-[#007aff]/20', hex: '#007aff' },
    { bg: 'bg-[#34c759]/10 text-[#34c759] dark:bg-[#34c759]/15', border: 'border-[#34c759]/20', hex: '#34c759' },
    { bg: 'bg-[#ff9500]/10 text-[#ff9500] dark:bg-[#ff9500]/15', border: 'border-[#ff9500]/20', hex: '#ff9500' },
    { bg: 'bg-[#af52de]/10 text-[#af52de] dark:bg-[#af52de]/15', border: 'border-[#af52de]/20', hex: '#af52de' },
    { bg: 'bg-[#ff3b30]/10 text-[#ff3b30] dark:bg-[#ff3b30]/15', border: 'border-[#ff3b30]/20', hex: '#ff3b30' },
    { bg: 'bg-[#5856d6]/10 text-[#5856d6] dark:bg-[#5856d6]/15', border: 'border-[#5856d6]/20', hex: '#5856d6' },
    { bg: 'bg-[#00c7be]/10 text-[#00c7be] dark:bg-[#00c7be]/15', border: 'border-[#00c7be]/20', hex: '#00c7be' },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % fallbackColors.length;
  return fallbackColors[index];
};

const EXPENSE_SUGGESTIONS = ['Rent', 'Groceries', 'Utilities', 'Travel', 'Dining', 'Wellness', 'Shopping', 'Gym', 'Education', 'Entertainment'];
const INCOME_SUGGESTIONS = ['Salary', 'Freelance', 'Dividends', 'Bonus', 'Investments', 'Consulting', 'Grants', 'Gifts'];

export const ManageCategoriesView: React.FC<ManageCategoriesViewProps> = React.memo(({
  t,
  settings,
  incomeCategories,
  expenseCategories,
  inactiveIncomeCategories = [],
  inactiveExpenseCategories = [],
  categoryColors = {},
  onAddCategory,
  onDeactivateCategory,
  onReactivateCategory,
  onDeleteCategoryPermanently,
  onUpdateCategoryColor,
  onDeleteCategory,
  onClose,
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'income' | 'expense'>('expense');
  const [selectedColor, setSelectedColor] = useState<string>(PRESET_COLORS[0]);
  const [catError, setCatError] = useState<string | undefined>(undefined);
  const [categoriesSearch, setCategoriesSearch] = useState('');
  
  // Status tab: 'active' | 'inactive'
  const [statusTab, setStatusTab] = useState<'active' | 'inactive'>('active');
  // Type filter tab: 'all' | 'expense' | 'income'
  const [activeCategoryTab, setActiveCategoryTab] = useState<'all' | 'expense' | 'income'>('all');

  // Inline color editor state
  const [editingCategoryColor, setEditingCategoryColor] = useState<string | null>(null);
  const [editingColorHex, setEditingColorHex] = useState<string>('#007aff');

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
    const isDuplicateActive = newCatType === 'expense'
      ? expenseCategories.some(c => c.toLowerCase() === cleanName.toLowerCase() || (CATEGORY_TRANSLATIONS['my']?.[c] && CATEGORY_TRANSLATIONS['my'][c].toLowerCase() === cleanName.toLowerCase()))
      : incomeCategories.some(c => c.toLowerCase() === cleanName.toLowerCase() || (CATEGORY_TRANSLATIONS['my']?.[c] && CATEGORY_TRANSLATIONS['my'][c].toLowerCase() === cleanName.toLowerCase()));

    if (isDuplicateActive) {
      setCatError(`${t('categoryAlreadyExists')} (${cleanName})`);
      return;
    }

    setCatError(undefined);
    onAddCategory(newCatType, cleanName, selectedColor);
    setNewCatName('');
  };

  const handleDeactivate = (type: 'income' | 'expense', cat: string) => {
    if (onDeactivateCategory) {
      onDeactivateCategory(type, cat);
    } else {
      onDeleteCategory(type, cat);
    }
  };

  const handleReactivate = (type: 'income' | 'expense', cat: string) => {
    if (onReactivateCategory) {
      onReactivateCategory(type, cat);
    } else {
      onAddCategory(type, cat);
    }
  };

  const handleDeletePermanently = (type: 'income' | 'expense', cat: string) => {
    if (onDeleteCategoryPermanently) {
      onDeleteCategoryPermanently(type, cat);
    } else {
      onDeleteCategory(type, cat);
    }
  };

  const handleSaveColorEdit = () => {
    if (editingCategoryColor && onUpdateCategoryColor) {
      onUpdateCategoryColor(editingCategoryColor, editingColorHex);
    }
    setEditingCategoryColor(null);
  };

  // Filter Active Lists
  const filteredActiveExpenseList = expenseCategories.filter((cat) => {
    const myName = CATEGORY_TRANSLATIONS['my']?.[cat] || '';
    const searchLower = categoriesSearch.toLowerCase();
    return cat.toLowerCase().includes(searchLower) || myName.toLowerCase().includes(searchLower);
  });

  const filteredActiveIncomeList = incomeCategories.filter((cat) => {
    const myName = CATEGORY_TRANSLATIONS['my']?.[cat] || '';
    const searchLower = categoriesSearch.toLowerCase();
    return cat.toLowerCase().includes(searchLower) || myName.toLowerCase().includes(searchLower);
  });

  // Filter Inactive Lists
  const filteredInactiveExpenseList = inactiveExpenseCategories.filter((cat) => {
    const myName = CATEGORY_TRANSLATIONS['my']?.[cat] || '';
    const searchLower = categoriesSearch.toLowerCase();
    return cat.toLowerCase().includes(searchLower) || myName.toLowerCase().includes(searchLower);
  });

  const filteredInactiveIncomeList = inactiveIncomeCategories.filter((cat) => {
    const myName = CATEGORY_TRANSLATIONS['my']?.[cat] || '';
    const searchLower = categoriesSearch.toLowerCase();
    return cat.toLowerCase().includes(searchLower) || myName.toLowerCase().includes(searchLower);
  });

  const totalActiveCount = expenseCategories.length + incomeCategories.length;
  const totalInactiveCount = inactiveExpenseCategories.length + inactiveIncomeCategories.length;
  const expensePercentage = totalActiveCount > 0 ? (expenseCategories.length / totalActiveCount) * 100 : 50;

  const currentSuggestions = newCatType === 'expense'
    ? EXPENSE_SUGGESTIONS.filter(s => !expenseCategories.some(c => c.toLowerCase() === s.toLowerCase()))
    : INCOME_SUGGESTIONS.filter(s => !incomeCategories.some(c => c.toLowerCase() === s.toLowerCase()));

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
                {totalActiveCount} <span className="text-xs font-normal text-[#8e8e93]">({totalInactiveCount} {t('inactiveCategories')})</span>
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

      {/* Primary Status Toggle Bar (Activated vs Inactive) + Filter & Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Active / Inactive Status Switcher */}
          <div className="flex p-1 bg-black/[0.04] dark:bg-white/[0.05] rounded-full shrink-0 border border-black/[0.02] dark:border-white/[0.02] h-11 items-center w-full sm:w-auto">
            <button
              type="button"
              id="active-categories-tab-btn"
              onClick={() => setStatusTab('active')}
              className={`flex-1 sm:flex-initial px-5 h-9 text-xs font-black rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 border-0 ${
                statusTab === 'active'
                  ? 'bg-white dark:bg-[#38383a] text-[#007aff] shadow-xs'
                  : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-[#f2f2f7]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#34c759]" />
              {t('activeCategories')} ({totalActiveCount})
            </button>
            <button
              type="button"
              id="inactive-categories-tab-btn"
              onClick={() => setStatusTab('inactive')}
              className={`flex-1 sm:flex-initial px-5 h-9 text-xs font-black rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 border-0 ${
                statusTab === 'inactive'
                  ? 'bg-white dark:bg-[#38383a] text-[#ff9500] shadow-xs'
                  : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-[#f2f2f7]'
              }`}
            >
              <Archive className="w-3.5 h-3.5 text-[#ff9500]" />
              {t('inactiveCategories')} ({totalInactiveCount})
            </button>
          </div>

          {/* Type Filter & Search input */}
          <div className="flex flex-col sm:flex-row gap-3 items-center flex-1 max-w-lg">
            <div className="flex p-1 bg-black/[0.03] dark:bg-white/[0.04] rounded-full shrink-0 border border-black/[0.02] dark:border-white/[0.02] h-10 items-center w-full sm:w-auto">
              {([
                { id: 'all', label: t('allCategories') },
                { id: 'expense', label: t('expenses') },
                { id: 'income', label: t('incomes') }
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategoryTab(tab.id)}
                  className={`flex-1 sm:flex-initial px-3.5 h-8 text-[11px] font-extrabold rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center border-0 ${
                    activeCategoryTab === tab.id
                      ? 'bg-white dark:bg-[#38383a] text-[#007aff] shadow-xs'
                      : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-[#f2f2f7]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative flex-1 w-full">
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Premium Add Category Form with Custom Color Setup */}
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
            {/* Category Type Switcher */}
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

            {/* Category Name Input */}
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

            {/* Custom Color Setup Section */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#8e8e93] flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#007aff]" />
                  {t('categoryColorLabel')}
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase font-mono px-2 py-0.5 rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-[#1c1c1e] dark:text-[#f2f2f7]">
                    {selectedColor}
                  </span>
                </div>
              </div>

              {/* Color Swatches Grid + Custom Color Picker */}
              <div className="grid grid-cols-7 gap-2 items-center p-2.5 bg-[#f2f2f7] dark:bg-[#2c2c2e] rounded-2xl border border-black/[0.03] dark:border-white/[0.03]">
                {PRESET_COLORS.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setSelectedColor(hex)}
                    className={`w-7 h-7 rounded-full cursor-pointer transition-all flex items-center justify-center border-2 ${
                      selectedColor === hex
                        ? 'scale-110 border-white dark:border-[#1c1c1e] shadow-md ring-2 ring-[#007aff]'
                        : 'border-transparent hover:scale-105 opacity-85 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: hex }}
                    title={hex}
                  >
                    {selectedColor === hex && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </button>
                ))}

                {/* Custom Hex Color Picker Input */}
                <div className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-dashed border-[#8e8e93]/50 hover:border-[#007aff] transition-all flex items-center justify-center cursor-pointer group shrink-0">
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    title={t('selectCategoryColor')}
                  />
                  <Palette className="w-3.5 h-3.5 text-[#8e8e93] group-hover:text-[#007aff] transition-colors" />
                </div>
              </div>

              {/* Live Badge Preview */}
              <div className="flex items-center gap-3 p-3 bg-black/[0.02] dark:bg-white/[0.03] rounded-2xl border border-black/[0.03] dark:border-white/[0.03]">
                <span className="text-[10px] font-extrabold uppercase text-[#8e8e93]">
                  {settings.language === 'my' ? 'နမူနာ -' : 'Preview:'}
                </span>
                <div
                  className="px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-2 border shadow-xs transition-all"
                  style={{
                    backgroundColor: `${selectedColor}1f`,
                    color: selectedColor,
                    borderColor: `${selectedColor}40`,
                  }}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>{newCatName.trim() || (newCatType === 'expense' ? 'Expense Category' : 'Income Category')}</span>
                </div>
              </div>
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

        {/* Right Column: Dynamic Filtered Category List Manager (Active / Inactive) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Categories Section */}
          {statusTab === 'active' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Active Expense Categories */}
              {(activeCategoryTab === 'all' || activeCategoryTab === 'expense') && (
                <div className="p-5 ios-glass rounded-[2rem] space-y-4 flex flex-col border border-black/[0.03] dark:border-white/[0.03] shadow-xs">
                  <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.05] pb-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#ff3b30] flex items-center gap-1.5">
                      <ArrowUpRight className="w-4 h-4" />
                      {t('expenseTagsLabel')} ({filteredActiveExpenseList.length})
                    </h3>
                  </div>

                  {filteredActiveExpenseList.length === 0 ? (
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
                    <div className="overflow-y-auto max-h-[380px] space-y-2 pr-1 custom-scrollbar">
                      <AnimatePresence initial={false}>
                        {filteredActiveExpenseList.map((cat) => {
                          const col = getCategoryColor(cat, categoryColors);
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
                                {/* Clickable Color Badge to edit color */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingCategoryColor(cat);
                                    setEditingColorHex(col.hex || '#ff3b30');
                                  }}
                                  className={`w-8 h-8 rounded-xl font-black text-[11px] uppercase flex items-center justify-center shrink-0 shadow-xs border cursor-pointer hover:scale-105 transition-all ${col.bg} ${col.border}`}
                                  style={col.style}
                                  title={settings.language === 'my' ? 'အရောင် ပြောင်းရန်' : 'Click to edit color'}
                                >
                                  {translatedName.substring(0, 2)}
                                </button>
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

                              {/* Deactivate Button */}
                              <button
                                id={`deactivate-cat-${cat}`}
                                type="button"
                                onClick={() => handleDeactivate('expense', cat)}
                                className="px-3 py-1.5 flex items-center gap-1.5 text-[#ff9500] hover:text-[#ff9500] rounded-xl bg-[#ff9500]/10 hover:bg-[#ff9500]/20 transition-all cursor-pointer border border-[#ff9500]/20 text-[11px] font-black"
                                title={t('deactivateCategory')}
                              >
                                <EyeOff className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">{t('deactivateCategory')}</span>
                              </button>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              )}

              {/* Active Income Categories */}
              {(activeCategoryTab === 'all' || activeCategoryTab === 'income') && (
                <div className="p-5 ios-glass rounded-[2rem] space-y-4 flex flex-col border border-black/[0.03] dark:border-white/[0.03] shadow-xs">
                  <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.05] pb-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#34c759] flex items-center gap-1.5">
                      <ArrowDownLeft className="w-4 h-4" />
                      {t('incomeTagsLabel')} ({filteredActiveIncomeList.length})
                    </h3>
                  </div>

                  {filteredActiveIncomeList.length === 0 ? (
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
                    <div className="overflow-y-auto max-h-[380px] space-y-2 pr-1 custom-scrollbar">
                      <AnimatePresence initial={false}>
                        {filteredActiveIncomeList.map((cat) => {
                          const col = getCategoryColor(cat, categoryColors);
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
                                {/* Clickable Color Badge */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingCategoryColor(cat);
                                    setEditingColorHex(col.hex || '#34c759');
                                  }}
                                  className={`w-8 h-8 rounded-xl font-black text-[11px] uppercase flex items-center justify-center shrink-0 shadow-xs border cursor-pointer hover:scale-105 transition-all ${col.bg} ${col.border}`}
                                  style={col.style}
                                  title={settings.language === 'my' ? 'အရောင် ပြောင်းရန်' : 'Click to edit color'}
                                >
                                  {translatedName.substring(0, 2)}
                                </button>
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

                              {/* Deactivate Button */}
                              <button
                                id={`deactivate-cat-${cat}`}
                                type="button"
                                onClick={() => handleDeactivate('income', cat)}
                                className="px-3 py-1.5 flex items-center gap-1.5 text-[#ff9500] hover:text-[#ff9500] rounded-xl bg-[#ff9500]/10 hover:bg-[#ff9500]/20 transition-all cursor-pointer border border-[#ff9500]/20 text-[11px] font-black"
                                title={t('deactivateCategory')}
                              >
                                <EyeOff className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">{t('deactivateCategory')}</span>
                              </button>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Inactive Categories Section */}
          {statusTab === 'inactive' && (
            <div className="space-y-6">
              {/* Informational Banner */}
              <div className="p-4 bg-[#ff9500]/10 border border-[#ff9500]/20 rounded-2xl flex items-start gap-3">
                <Info className="w-5 h-5 text-[#ff9500] shrink-0 mt-0.5" />
                <p className="text-xs text-[#1c1c1e] dark:text-[#f2f2f7] font-medium leading-relaxed">
                  {t('inactiveTagsDesc')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inactive Expense Categories */}
                {(activeCategoryTab === 'all' || activeCategoryTab === 'expense') && (
                  <div className="p-5 ios-glass rounded-[2rem] space-y-4 flex flex-col border border-black/[0.03] dark:border-white/[0.03] shadow-xs">
                    <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.05] pb-2">
                      <h3 className="text-xs font-black uppercase tracking-wider text-[#8e8e93] flex items-center gap-1.5">
                        <Archive className="w-4 h-4 text-[#ff9500]" />
                        {t('expenseTagsLabel')} ({filteredInactiveExpenseList.length})
                      </h3>
                    </div>

                    {filteredInactiveExpenseList.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-black/[0.04] dark:bg-white/[0.05] flex items-center justify-center text-[#8e8e93]">
                          <Archive className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-[#1c1c1e] dark:text-white">{t('noInactiveTagsFound')}</p>
                          <p className="text-[10px] text-[#8e8e93] px-4">{t('inactiveTagsDesc')}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-y-auto max-h-[380px] space-y-2 pr-1 custom-scrollbar">
                        <AnimatePresence initial={false}>
                          {filteredInactiveExpenseList.map((cat) => {
                            const col = getCategoryColor(cat, categoryColors);
                            const translatedName = CATEGORY_TRANSLATIONS[settings.language]?.[cat] || CATEGORY_TRANSLATIONS['my']?.[cat] || cat;

                            return (
                              <motion.div
                                key={cat}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex items-center justify-between p-3 bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl border border-black/[0.03] dark:border-white/[0.03] transition-all opacity-85 hover:opacity-100"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div
                                    className={`w-8 h-8 rounded-xl font-black text-[11px] uppercase flex items-center justify-center shrink-0 shadow-xs border ${col.bg} ${col.border}`}
                                    style={col.style}
                                  >
                                    {translatedName.substring(0, 2)}
                                  </div>
                                  <span className="text-xs font-extrabold text-[#1c1c1e] dark:text-[#f2f2f7] truncate">
                                    {translatedName}
                                  </span>
                                </div>

                                {/* Inactive Controls: Activate OR Delete Permanently */}
                                <div className="flex items-center gap-2 shrink-0">
                                  {/* Activate Button */}
                                  <button
                                    id={`activate-cat-${cat}`}
                                    type="button"
                                    onClick={() => handleReactivate('expense', cat)}
                                    className="px-3 py-1.5 flex items-center gap-1 bg-[#34c759]/10 hover:bg-[#34c759]/20 text-[#34c759] border border-[#34c759]/20 rounded-xl text-[11px] font-black transition-all cursor-pointer"
                                    title={t('reactivateCategory')}
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>{t('reactivateCategory')}</span>
                                  </button>

                                  {/* Delete Permanently Button */}
                                  <button
                                    id={`delete-permanent-cat-${cat}`}
                                    type="button"
                                    onClick={() => handleDeletePermanently('expense', cat)}
                                    className="p-1.5 text-[#ff3b30] hover:bg-[#ff3b30]/10 rounded-xl border border-transparent hover:border-[#ff3b30]/20 transition-all cursor-pointer"
                                    title={t('deletePermanently')}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                )}

                {/* Inactive Income Categories */}
                {(activeCategoryTab === 'all' || activeCategoryTab === 'income') && (
                  <div className="p-5 ios-glass rounded-[2rem] space-y-4 flex flex-col border border-black/[0.03] dark:border-white/[0.03] shadow-xs">
                    <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.05] pb-2">
                      <h3 className="text-xs font-black uppercase tracking-wider text-[#8e8e93] flex items-center gap-1.5">
                        <Archive className="w-4 h-4 text-[#ff9500]" />
                        {t('incomeTagsLabel')} ({filteredInactiveIncomeList.length})
                      </h3>
                    </div>

                    {filteredInactiveIncomeList.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-black/[0.04] dark:bg-white/[0.05] flex items-center justify-center text-[#8e8e93]">
                          <Archive className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-[#1c1c1e] dark:text-white">{t('noInactiveTagsFound')}</p>
                          <p className="text-[10px] text-[#8e8e93] px-4">{t('inactiveTagsDesc')}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-y-auto max-h-[380px] space-y-2 pr-1 custom-scrollbar">
                        <AnimatePresence initial={false}>
                          {filteredInactiveIncomeList.map((cat) => {
                            const col = getCategoryColor(cat, categoryColors);
                            const translatedName = CATEGORY_TRANSLATIONS[settings.language]?.[cat] || CATEGORY_TRANSLATIONS['my']?.[cat] || cat;

                            return (
                              <motion.div
                                key={cat}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex items-center justify-between p-3 bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl border border-black/[0.03] dark:border-white/[0.03] transition-all opacity-85 hover:opacity-100"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div
                                    className={`w-8 h-8 rounded-xl font-black text-[11px] uppercase flex items-center justify-center shrink-0 shadow-xs border ${col.bg} ${col.border}`}
                                    style={col.style}
                                  >
                                    {translatedName.substring(0, 2)}
                                  </div>
                                  <span className="text-xs font-extrabold text-[#1c1c1e] dark:text-[#f2f2f7] truncate">
                                    {translatedName}
                                  </span>
                                </div>

                                {/* Inactive Controls: Activate OR Delete Permanently */}
                                <div className="flex items-center gap-2 shrink-0">
                                  {/* Activate Button */}
                                  <button
                                    id={`activate-cat-${cat}`}
                                    type="button"
                                    onClick={() => handleReactivate('income', cat)}
                                    className="px-3 py-1.5 flex items-center gap-1 bg-[#34c759]/10 hover:bg-[#34c759]/20 text-[#34c759] border border-[#34c759]/20 rounded-xl text-[11px] font-black transition-all cursor-pointer"
                                    title={t('reactivateCategory')}
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>{t('reactivateCategory')}</span>
                                  </button>

                                  {/* Delete Permanently Button */}
                                  <button
                                    id={`delete-permanent-cat-${cat}`}
                                    type="button"
                                    onClick={() => handleDeletePermanently('income', cat)}
                                    className="p-1.5 text-[#ff3b30] hover:bg-[#ff3b30]/10 rounded-xl border border-transparent hover:border-[#ff3b30]/20 transition-all cursor-pointer"
                                    title={t('deletePermanently')}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
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
          )}
        </div>
      </div>

      {/* Color Edit Popover/Modal */}
      {editingCategoryColor && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1c1c1e] rounded-[2rem] p-6 max-w-sm w-full space-y-4 border border-black/[0.1] dark:border-white/[0.1] shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-[#1c1c1e] dark:text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#007aff]" />
                {t('selectCategoryColor')} ({editingCategoryColor})
              </h4>
              <button
                type="button"
                onClick={() => setEditingCategoryColor(null)}
                className="w-8 h-8 rounded-full bg-black/[0.05] dark:bg-white/[0.1] flex items-center justify-center text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white transition-colors cursor-pointer border-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-6 gap-2.5 py-2">
              {PRESET_COLORS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setEditingColorHex(hex)}
                  className={`w-9 h-9 rounded-full cursor-pointer transition-all flex items-center justify-center border-2 ${
                    editingColorHex === hex
                      ? 'scale-110 border-white dark:border-[#1c1c1e] shadow-md ring-2 ring-[#007aff]'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: hex }}
                >
                  {editingColorHex === hex && <Check className="w-4 h-4 text-white stroke-[3]" />}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <div className="relative flex-1">
                <input
                  type="color"
                  value={editingColorHex}
                  onChange={(e) => setEditingColorHex(e.target.value)}
                  className="w-full h-10 rounded-xl cursor-pointer bg-transparent border-0"
                />
              </div>
              <button
                type="button"
                onClick={handleSaveColorEdit}
                className="px-5 h-10 bg-[#007aff] hover:bg-[#0071eb] text-white rounded-xl text-xs font-black transition-all cursor-pointer border-0 shadow-xs"
              >
                {t('save') || 'Save Color'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
