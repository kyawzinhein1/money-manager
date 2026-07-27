import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check } from 'lucide-react';
import { Language } from '../types';

interface IOSDatePickerProps {
  value: string; // 'YYYY-MM-DD'
  onChange: (date: string) => void;
  language: Language;
  error?: string;
}

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_NAMES_MY = [
  'ဇန်နဝါရီ', 'ဖေဖော်ဝါရီ', 'မတ်', 'ဧပြီ', 'မေ', 'ဇွန်',
  'ဇူလိုင်', 'သြဂုတ်', 'စက်တင်ဘာ', 'အောက်တိုဘာ', 'နိုဝင်ဘာ', 'ဒီဇင်ဘာ'
];

const WEEKDAYS_EN = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const WEEKDAYS_MY = ['တနင်္ဂနွေ', 'တနင်္လာ', 'အင်္ဂါ', 'ဗုဒ္ဓဟူး', 'ကြာသပတေး', 'သောကြာ', 'စနေ'];

export const IOSDatePicker: React.FC<IOSDatePickerProps> = ({
  value,
  onChange,
  language,
  error
}) => {
  // Selected date components
  const parsedDate = value ? new Date(value + 'T00:00:00') : new Date();
  const validDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

  // Viewing month/year state
  const [viewYear, setViewYear] = useState<number>(validDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(validDate.getMonth()); // 0-11
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Sync viewing month with value if changed externally
  React.useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const todayStr = new Date().toISOString().substring(0, 10);
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().substring(0, 10);

  // Format date display
  const formatDateDisplay = (dateIso: string) => {
    const d = new Date(dateIso + 'T00:00:00');
    if (isNaN(d.getTime())) return dateIso;
    const day = d.getDate();
    const monthName = language === 'my' ? MONTH_NAMES_MY[d.getMonth()] : MONTH_NAMES_EN[d.getMonth()];
    const year = d.getFullYear();
    const weekday = d.toLocaleDateString(language === 'my' ? 'my-MM' : 'en-US', { weekday: 'short' });
    return `${weekday}, ${monthName} ${day}, ${year}`;
  };

  // Build calendar days matrix
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0-6
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const calendarDays = [];

  // Previous month trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevMonthIdx = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYearNum = viewMonth === 0 ? viewYear - 1 : viewYear;
    const iso = `${prevYearNum}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    calendarDays.push({ dayNum, iso, isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({ dayNum: d, iso, isCurrentMonth: true });
  }

  // Next month leading days to complete full grid
  const remainingCells = (42 - calendarDays.length) % 7 === 0 && calendarDays.length >= 35 ? 42 - calendarDays.length : (35 - calendarDays.length > 0 ? 35 - calendarDays.length : 42 - calendarDays.length);
  for (let d = 1; d <= remainingCells; d++) {
    const nextMonthIdx = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYearNum = viewMonth === 11 ? viewYear + 1 : viewYear;
    const iso = `${nextYearNum}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({ dayNum: d, iso, isCurrentMonth: false });
  }

  const handleSelectDay = (iso: string) => {
    onChange(iso);
  };

  return (
    <div className="space-y-3">
      {/* Quick Preset Buttons (iOS Segmented Style) */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            onChange(todayStr);
            setViewYear(new Date().getFullYear());
            setViewMonth(new Date().getMonth());
          }}
          className={`py-2 px-3 text-xs font-bold rounded-xl border-0 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            value === todayStr
              ? 'bg-[#007aff] text-white shadow-xs'
              : 'bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-[#1c1c1e] dark:text-[#f2f2f7]'
          }`}
        >
          <span>{language === 'my' ? 'ယနေ့' : 'Today'}</span>
          {value === todayStr && <Check className="w-3.5 h-3.5" />}
        </button>

        <button
          type="button"
          onClick={() => {
            onChange(yesterdayStr);
            const d = new Date(yesterdayStr + 'T00:00:00');
            setViewYear(d.getFullYear());
            setViewMonth(d.getMonth());
          }}
          className={`py-2 px-3 text-xs font-bold rounded-xl border-0 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            value === yesterdayStr
              ? 'bg-[#007aff] text-white shadow-xs'
              : 'bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-[#1c1c1e] dark:text-[#f2f2f7]'
          }`}
        >
          <span>{language === 'my' ? 'မနေ့က' : 'Yesterday'}</span>
          {value === yesterdayStr && <Check className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* iOS Style Selected Date Badge Trigger */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between cursor-pointer hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-all"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#007aff]/15 text-[#007aff] flex items-center justify-center shrink-0">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="text-[10px] font-bold text-[#8e8e93] block uppercase tracking-wider">
              {language === 'my' ? 'ရွေးချယ်ထားသော ရက်စွဲ' : 'SELECTED DATE'}
            </span>
            <span className="text-xs sm:text-sm font-bold text-[#1c1c1e] dark:text-white">
              {formatDateDisplay(value)}
            </span>
          </div>
        </div>

        <span className="text-[11px] font-bold text-[#007aff] px-2 py-1 rounded-lg bg-[#007aff]/10">
          {isExpanded ? (language === 'my' ? 'ပိတ်မည်' : 'Hide') : (language === 'my' ? 'ပြက္ခဒိန်ဖွင့်ရန်' : 'Calendar')}
        </span>
      </div>

      {/* Native iOS Graphical Calendar Card */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.98 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.08] shadow-md space-y-3">
              
              {/* Header: Month & Year controls */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm sm:text-base font-extrabold text-[#1c1c1e] dark:text-white">
                    {language === 'my' ? MONTH_NAMES_MY[viewMonth] : MONTH_NAMES_EN[viewMonth]}
                  </span>
                  <span className="text-sm font-bold text-[#8e8e93]">
                    {viewYear}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-black/[0.04] dark:bg-white/[0.08] text-[#007aff] hover:bg-[#007aff]/15 transition-all cursor-pointer border-0"
                    title="Previous Month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-black/[0.04] dark:bg-white/[0.08] text-[#007aff] hover:bg-[#007aff]/15 transition-all cursor-pointer border-0"
                    title="Next Month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 text-center border-b border-black/[0.05] dark:border-white/[0.05] pb-2">
                {(language === 'my' ? WEEKDAYS_MY : WEEKDAYS_EN).map((wd, idx) => (
                  <span
                    key={idx}
                    className={`text-[11px] font-black uppercase ${
                      idx === 0 || idx === 6 ? 'text-[#ff3b30]' : 'text-[#8e8e93]'
                    }`}
                  >
                    {wd.length > 3 ? wd.substring(0, 3) : wd}
                  </span>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((cell, index) => {
                  const isSelected = cell.iso === value;
                  const isToday = cell.iso === todayStr;

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectDay(cell.iso)}
                      className={`h-9 rounded-full flex flex-col items-center justify-center text-xs font-bold transition-all duration-150 cursor-pointer relative border-0 ${
                        isSelected
                          ? 'bg-[#007aff] text-white shadow-xs scale-105 font-black'
                          : isToday
                          ? 'text-[#007aff] font-extrabold bg-[#007aff]/10'
                          : cell.isCurrentMonth
                          ? 'text-[#1c1c1e] dark:text-[#f2f2f7] hover:bg-black/[0.05] dark:hover:bg-white/[0.08]'
                          : 'text-slate-300 dark:text-neutral-600 hover:text-slate-500'
                      }`}
                    >
                      <span>{cell.dayNum}</span>
                      {isToday && !isSelected && (
                        <span className="w-1 h-1 rounded-full bg-[#007aff] absolute bottom-1" />
                      )}
                    </button>
                  );
                })}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="text-[11px] text-red-500 font-extrabold flex items-center gap-1.5 mt-1">
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
