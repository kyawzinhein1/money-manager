import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, CalendarRange, ChevronDown, RotateCcw, Filter, ArrowRight, X } from 'lucide-react';
import { Settings } from '../types';
import { getLocalDateStr, getLocalMonthStr, getLocalYearStr } from '../utils/dateUtils';
import { IOSDateRangePicker } from './IOSDateRangePicker';

export interface DateFilterSwitcherProps {
  t: (key: string) => string;
  settings: Settings;
  dateFilterMode: 'monthYear' | 'dateRange';
  setDateFilterMode: (mode: 'monthYear' | 'dateRange') => void;
  selectedMonth: string;
  setSelectedMonth: (m: string) => void;
  selectedYear: string;
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
  monthMenuRef?: React.RefObject<HTMLDivElement>;
  yearMenuRef?: React.RefObject<HTMLDivElement>;
}

export const DateFilterSwitcher: React.FC<DateFilterSwitcherProps> = React.memo(({
  t,
  settings,
  dateFilterMode,
  setDateFilterMode,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
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
  monthMenuRef,
  yearMenuRef
}) => {
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  const handleClearRange = () => {
    setStartDate('');
    setEndDate('');
  };

  const formattedRangeText = startDate || endDate
    ? `${startDate || '...'} → ${endDate || '...'}`
    : (settings.language === 'my' ? 'ရက်စွဲ အပိုင်းအခြား ရွေးရန်' : 'Select Date Range');

  return (
    <>
      {/* Mobile View: ONLY Start Date - End Date filter button */}
      <div className="block sm:hidden relative z-40 p-2 px-3 ios-glass rounded-full border border-white/60 dark:border-white/10 shadow-sm no-print">
        <button
          type="button"
          id="filter-date-range-btn-mobile"
          onClick={() => setShowCalendarModal(true)}
          className="w-full flex items-center justify-between gap-2 bg-[#f2f2f7] dark:bg-[#2c2c2e] h-8 px-3 rounded-full text-xs font-bold text-[#1c1c1e] dark:text-[#f2f2f7] border-0 cursor-pointer"
        >
          <div className="flex items-center gap-2 truncate">
            <Calendar className="w-4 h-4 text-[#007aff] shrink-0" />
            <span className="truncate">{formattedRangeText}</span>
          </div>
          <div className="flex items-center gap-1 text-[#007aff] shrink-0">
            <span className="text-[10px] font-extrabold">{settings.language === 'my' ? 'ရွေးပါ' : 'Select'}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>

      {/* Desktop View: Full mode switcher + filter controls */}
      <div className="hidden sm:flex relative z-40 p-2.5 px-3.5 ios-glass rounded-full items-center justify-between gap-2.5 border border-white/60 dark:border-white/10 shadow-sm no-print">
        {/* Left: Compact Mode Switcher */}
        <div className="inline-flex p-0.5 bg-[#767680]/12 dark:bg-[#767680]/24 rounded-full font-sans shrink-0">
          <button
            type="button"
            id="filter-mode-monthyear-btn"
            onClick={() => setDateFilterMode('monthYear')}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border-0 ${
              dateFilterMode === 'monthYear'
                ? 'bg-white dark:bg-[#1c1c1e] text-[#007aff] shadow-xs'
                : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-[#f2f2f7]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{t('filterByMonthYear')}</span>
          </button>

          <button
            type="button"
            id="filter-mode-daterange-btn"
            onClick={() => setDateFilterMode('dateRange')}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border-0 ${
              dateFilterMode === 'dateRange'
                ? 'bg-white dark:bg-[#1c1c1e] text-[#007aff] shadow-xs'
                : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-[#f2f2f7]'
            }`}
          >
            <CalendarRange className="w-3.5 h-3.5" />
            <span>{t('filterByDateRange')}</span>
          </button>
        </div>

        {/* Right: Controls based on selected mode */}
        {dateFilterMode === 'monthYear' ? (
          <div className="flex items-center gap-2 font-sans">
            {/* Month Dropdown */}
            <div className={`relative flex-initial min-w-[90px] ${showMonthMenu ? 'z-50' : 'z-10'}`} id="month-dropdown-container">
              <button
                id="month-dropdown-btn"
                type="button"
                onClick={() => {
                  setShowMonthMenu(!showMonthMenu);
                  setShowYearMenu(false);
                }}
                className="w-full flex items-center justify-between gap-1 h-7 px-2.5 bg-[#f2f2f7] dark:bg-[#2c2c2e] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-[#1c1c1e] dark:text-[#f2f2f7] rounded-full text-xs font-bold transition-all cursor-pointer border-0"
              >
                <span className="truncate">{monthOptions.find(m => m.value === selectedMonth)?.label || selectedMonth}</span>
                <ChevronDown className="w-3 h-3 text-[#8e8e93] shrink-0" />
              </button>

              <AnimatePresence>
                {showMonthMenu && (
                  <>
                    <div className="fixed inset-0 z-30 bg-transparent" onClick={() => setShowMonthMenu(false)} />
                    <motion.div
                      ref={monthMenuRef}
                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.95 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 mt-1 w-full min-w-[110px] max-h-48 overflow-y-auto rounded-2xl bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-3xl border border-white/50 dark:border-white/12 shadow-2xl z-50 p-1 space-y-0.5 scrollbar-thin gpu-layer"
                    >
                      {monthOptions.map((opt) => (
                        <button
                          key={opt.value}
                          data-value={opt.value}
                          type="button"
                          onClick={() => {
                            setSelectedMonth(opt.value);
                            setShowMonthMenu(false);
                          }}
                          className={`w-full text-left px-2 py-1 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer ${
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

            {/* Year Dropdown */}
            <div className={`relative flex-initial min-w-[80px] ${showYearMenu ? 'z-50' : 'z-10'}`} id="year-dropdown-container">
              <button
                id="year-dropdown-btn"
                type="button"
                onClick={() => {
                  setShowYearMenu(!showYearMenu);
                  setShowMonthMenu(false);
                }}
                className="w-full flex items-center justify-between gap-1 h-7 px-2.5 bg-[#f2f2f7] dark:bg-[#2c2c2e] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-[#1c1c1e] dark:text-[#f2f2f7] rounded-full text-xs font-bold transition-all cursor-pointer border-0"
              >
                <span className="truncate">{selectedYear === 'all' ? (settings.language === 'my' ? 'နှစ်အားလုံး' : 'All Years') : selectedYear}</span>
                <ChevronDown className="w-3 h-3 text-[#8e8e93] shrink-0" />
              </button>

              <AnimatePresence>
                {showYearMenu && (
                  <>
                    <div className="fixed inset-0 z-30 bg-transparent" onClick={() => setShowYearMenu(false)} />
                    <motion.div
                      ref={yearMenuRef}
                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.95 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 mt-1 w-full min-w-[90px] max-h-48 overflow-y-auto rounded-2xl bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-3xl border border-white/50 dark:border-white/12 shadow-2xl z-50 p-1 space-y-0.5 scrollbar-thin gpu-layer"
                    >
                      {availableYears.map((yr) => (
                        <button
                          key={yr}
                          data-value={yr}
                          type="button"
                          onClick={() => {
                            setSelectedYear(yr);
                            setShowYearMenu(false);
                          }}
                          className={`w-full text-left px-2 py-1 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer ${
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
                        data-value="all"
                        onClick={() => {
                          setSelectedYear('all');
                          setShowYearMenu(false);
                        }}
                        className={`w-full text-left px-2 py-1 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer ${
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
              type="button"
              onClick={() => {
                setSelectedMonth(getLocalMonthStr());
                setSelectedYear(getLocalYearStr());
              }}
              className="h-7 px-3 flex items-center justify-center bg-[#007aff]/10 hover:bg-[#007aff]/20 text-[#007aff] rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap border-0 shrink-0"
              title="Reset to current month"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              <span>{t('thisMonth')}</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 font-sans">
            {/* Custom iOS Calendar Trigger Button */}
            <button
              type="button"
              id="filter-date-range-btn-desktop"
              onClick={() => setShowCalendarModal(true)}
              className="flex items-center gap-2 bg-[#f2f2f7] dark:bg-[#2c2c2e] hover:bg-black/5 dark:hover:bg-white/10 h-7 px-3 rounded-full text-xs font-bold text-[#1c1c1e] dark:text-[#f2f2f7] border-0 cursor-pointer transition-all"
            >
              <Calendar className="w-3.5 h-3.5 text-[#007aff]" />
              <span>{formattedRangeText}</span>
              <ChevronDown className="w-3 h-3 text-[#8e8e93]" />
            </button>

            {(startDate || endDate) && (
              <button
                type="button"
                onClick={handleClearRange}
                className="flex h-7 px-2.5 items-center justify-center bg-[#ff3b30]/10 hover:bg-[#ff3b30]/20 text-[#ff3b30] rounded-full text-xs font-bold transition-all cursor-pointer border-0 shrink-0"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                <span>{t('clearDateRange')}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* iOS Style Calendar Modal */}
      <AnimatePresence>
        {showCalendarModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 no-print">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCalendarModal(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 320 }}
              className="relative z-10 w-full max-w-md bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-3xl rounded-3xl p-4 sm:p-5 border border-white/50 dark:border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin font-sans"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#007aff]/15 text-[#007aff] flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#1c1c1e] dark:text-white leading-tight">
                      {settings.language === 'my' ? 'ရက်စွဲ စစ်ထုတ်မှု ရွေးချယ်ပါ' : 'Select Date Filter'}
                    </h3>
                    <p className="text-[11px] font-bold text-[#8e8e93]">
                      {settings.language === 'my' ? 'စတင်သည့်ရက် နှင့် ပြီးဆုံးသည့်ရက် ရွေးပါ' : 'Choose Start Date and End Date'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCalendarModal(false)}
                  className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 flex items-center justify-center text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white transition-all border-0 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Custom iOS Date Range Picker Component */}
              <IOSDateRangePicker
                startDate={startDate}
                endDate={endDate}
                onChange={(s, e) => {
                  setStartDate(s);
                  setEndDate(e);
                }}
                language={settings.language}
              />

              {/* Modal Footer Controls */}
              <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-2">
                {(startDate || endDate) && (
                  <button
                    type="button"
                    onClick={() => {
                      handleClearRange();
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#ff3b30] bg-[#ff3b30]/10 hover:bg-[#ff3b30]/20 transition-all border-0 cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t('clearDateRange')}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowCalendarModal(false)}
                  className="ml-auto px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#007aff] hover:bg-[#0063cc] shadow-xs transition-all border-0 cursor-pointer"
                >
                  {settings.language === 'my' ? 'ပြီးပြီ' : 'Done'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
});

