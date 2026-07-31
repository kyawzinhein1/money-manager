import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check, ArrowRight, Sparkles } from 'lucide-react';
import { Language } from '../types';

interface IOSDateRangePickerProps {
  startDate: string; // 'YYYY-MM-DD'
  endDate: string;   // 'YYYY-MM-DD'
  onChange: (startDate: string, endDate: string) => void;
  language: Language;
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

export const IOSDateRangePicker: React.FC<IOSDateRangePickerProps> = ({
  startDate,
  endDate,
  onChange,
  language
}) => {
  const initialDate = startDate ? new Date(startDate + 'T00:00:00') : new Date();
  const validInitialDate = isNaN(initialDate.getTime()) ? new Date() : initialDate;

  const [viewYear, setViewYear] = useState<number>(validInitialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(validInitialDate.getMonth());
  const [activeTab, setActiveTab] = useState<'start' | 'end'>('start');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Sync viewing month if external dates change
  useEffect(() => {
    if (startDate) {
      const d = new Date(startDate + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [startDate]);

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

  const formatDateDisplay = (dateIso: string) => {
    if (!dateIso) return '---';
    const d = new Date(dateIso + 'T00:00:00');
    if (isNaN(d.getTime())) return dateIso;
    const day = d.getDate();
    const monthName = language === 'my' ? MONTH_NAMES_MY[d.getMonth()] : MONTH_NAMES_EN[d.getMonth()];
    const year = d.getFullYear();
    return `${monthName} ${day}, ${year}`;
  };

  // Build calendar matrix
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const calendarDays = [];

  // Prev month trailing
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevMonthIdx = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYearNum = viewMonth === 0 ? viewYear - 1 : viewYear;
    const iso = `${prevYearNum}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    calendarDays.push({ dayNum, iso, isCurrentMonth: false });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({ dayNum: d, iso, isCurrentMonth: true });
  }

  // Next month leading
  const remainingCells = (calendarDays.length % 7 === 0) ? 0 : 7 - (calendarDays.length % 7);
  for (let d = 1; d <= remainingCells; d++) {
    const nextMonthIdx = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYearNum = viewMonth === 11 ? viewYear + 1 : viewYear;
    const iso = `${nextYearNum}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({ dayNum: d, iso, isCurrentMonth: false });
  }

  const handleSelectDay = (iso: string) => {
    if (activeTab === 'start') {
      if (endDate && iso > endDate) {
        // If selecting a start date that is after current end date, push end date
        onChange(iso, iso);
      } else {
        onChange(iso, endDate || iso);
      }
      setActiveTab('end');
    } else {
      if (startDate && iso < startDate) {
        // If selecting end date earlier than start date, update start date
        onChange(iso, startDate);
        setActiveTab('end');
      } else {
        onChange(startDate || iso, iso);
        setActiveTab('start');
      }
    }
  };

  // Preset helper
  const setThisMonthPreset = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
    const startIso = `${y}-${m}-01`;
    const endIso = `${y}-${m}-${String(lastDay).padStart(2, '0')}`;
    onChange(startIso, endIso);
    setViewYear(y);
    setViewMonth(now.getMonth());
  };

  const setNext30DaysPreset = () => {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 30);
    const startIso = start.toISOString().substring(0, 10);
    const endIso = end.toISOString().substring(0, 10);
    onChange(startIso, endIso);
    setViewYear(start.getFullYear());
    setViewMonth(start.getMonth());
  };

  const calculateDaysCount = () => {
    if (!startDate || !endDate) return 0;
    const d1 = new Date(startDate + 'T00:00:00');
    const d2 = new Date(endDate + 'T00:00:00');
    const diff = Math.round((d2.getTime() - d1.getTime()) / 86400000) + 1;
    return diff > 0 ? diff : 0;
  };

  return (
    <div className="space-y-3">
      {/* Date Range Summary Header / Mode Selector */}
      <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.05] dark:border-white/[0.08] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#007aff]/15 text-[#007aff] flex items-center justify-center shrink-0">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#8e8e93] block uppercase tracking-wider">
                {language === 'my' ? 'ရွေးချယ်ထားသော ရက်စွဲ အပိုင်းအခြား' : 'SELECTED DATE RANGE'}
              </span>
              <span className="text-xs font-black text-[#007aff]">
                {calculateDaysCount()} {language === 'my' ? 'ရက်' : 'Days'} ({formatDateDisplay(startDate)} ~ {formatDateDisplay(endDate)})
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] font-bold text-[#007aff] px-2.5 py-1 rounded-lg bg-[#007aff]/10 border-0 cursor-pointer"
          >
            {isExpanded ? (language === 'my' ? 'ပိတ်မည်' : 'Hide') : (language === 'my' ? 'ပြက္ခဒိန်' : 'Calendar')}
          </button>
        </div>

        {/* Start / End Date Target Selection Tabs */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-black/5 dark:border-white/5">
          <button
            type="button"
            onClick={() => setActiveTab('start')}
            className={`p-2.5 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer flex flex-col items-start ${
              activeTab === 'start'
                ? 'bg-[#007aff] text-white shadow-xs'
                : 'bg-black/5 dark:bg-white/5 text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white'
            }`}
          >
            <span className="text-[9px] uppercase tracking-wider opacity-80">
              {language === 'my' ? 'စတင်သည့်ရက်' : 'Start Date'}
            </span>
            <span className="text-xs font-extrabold font-mono mt-0.5">
              {startDate || 'YYYY-MM-DD'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('end')}
            className={`p-2.5 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer flex flex-col items-start ${
              activeTab === 'end'
                ? 'bg-[#007aff] text-white shadow-xs'
                : 'bg-black/5 dark:bg-white/5 text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white'
            }`}
          >
            <span className="text-[9px] uppercase tracking-wider opacity-80">
              {language === 'my' ? 'ပြီးဆုံးသည့်ရက်' : 'End Date'}
            </span>
            <span className="text-xs font-extrabold font-mono mt-0.5">
              {endDate || 'YYYY-MM-DD'}
            </span>
          </button>
        </div>
      </div>

      {/* Preset range shortcuts */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={setThisMonthPreset}
          className="flex-1 py-1.5 px-3 text-[11px] font-bold rounded-xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-[#1c1c1e] dark:text-[#f2f2f7] border-0 transition-all cursor-pointer"
        >
          {language === 'my' ? 'ယခုလ တစ်လလုံး' : 'This Whole Month'}
        </button>
        <button
          type="button"
          onClick={setNext30DaysPreset}
          className="flex-1 py-1.5 px-3 text-[11px] font-bold rounded-xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-[#1c1c1e] dark:text-[#f2f2f7] border-0 transition-all cursor-pointer"
        >
          {language === 'my' ? 'ရက် (၃၀) စာ' : 'Next 30 Days'}
        </button>
      </div>

      {/* Single Graphical Calendar UI for Date Range */}
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
              {/* Header controls */}
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

              {/* Days Grid with Range Selection Visuals */}
              <div className="grid grid-cols-7 gap-y-1">
                {calendarDays.map((cell, index) => {
                  const isStart = cell.iso === startDate;
                  const isEnd = cell.iso === endDate;
                  const isSingleSelected = isStart && isEnd;
                  const isInRange = startDate && endDate && cell.iso > startDate && cell.iso < endDate;

                  let bgStyle = 'bg-transparent text-[#1c1c1e] dark:text-[#f2f2f7] hover:bg-black/[0.05] dark:hover:bg-white/[0.08]';
                  if (isSingleSelected) {
                    bgStyle = 'bg-[#007aff] text-white font-black shadow-xs rounded-full scale-105';
                  } else if (isStart) {
                    bgStyle = 'bg-[#007aff] text-white font-black shadow-xs rounded-l-full scale-105 z-10';
                  } else if (isEnd) {
                    bgStyle = 'bg-[#007aff] text-white font-black shadow-xs rounded-r-full scale-105 z-10';
                  } else if (isInRange) {
                    bgStyle = 'bg-[#007aff]/20 text-[#007aff] dark:text-blue-300 font-extrabold rounded-none';
                  } else if (!cell.isCurrentMonth) {
                    bgStyle = 'text-slate-300 dark:text-neutral-600 hover:text-slate-500';
                  }

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectDay(cell.iso)}
                      className={`h-9 flex flex-col items-center justify-center text-xs font-bold transition-all duration-150 cursor-pointer relative border-0 ${bgStyle}`}
                    >
                      <span>{cell.dayNum}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
