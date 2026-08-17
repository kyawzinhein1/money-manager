import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  ReferenceLine,
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown,
  PieChartIcon, 
  CalendarRange, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Landmark,
  Sparkles,
  Info,
  Calendar,
  CalendarDays,
  BarChart3,
  Layers,
  Utensils,
  Car,
  ShoppingBag,
  Film,
  Home as HomeIcon,
  Zap,
  HeartPulse,
  GraduationCap,
  HelpCircle,
  Clock,
  CheckCircle2,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Transaction, Language, Budget } from '../types';
import { TRANSLATIONS, CATEGORY_TRANSLATIONS } from '../translations';
import { generateForecastReport } from '../utils/forecasting';
import { findActiveBudget } from '../utils/budgetUtils';
import { getCategoryIcon } from '../utils/categoryIcon';
import { getCategoryStyle } from '../utils/categoryStyle';

interface AnalyticsSectionProps {
  transactions: Transaction[];
  currencySymbol: string;
  language: Language;
  formatAmount: (amount: number) => string;
  budgets: Budget[];
  selectedMonth: string;
  selectedYear: string;
  dateFilterMode?: 'monthYear' | 'dateRange';
  startDate?: string;
  endDate?: string;
  allTransactions?: Transaction[];
  readAlertIds: string[];
  toggleReadAlert: (id: string) => void;
  categoryColors?: Record<string, string>;
  categoryIcons?: Record<string, string>;
}

const COLORS = [
  '#007aff', // System Blue
  '#34c759', // System Green
  '#ff9500', // System Orange
  '#af52de', // System Purple
  '#ff3b30', // System Red
  '#5856d6', // Indigo
  '#ffcc00', // Yellow
  '#5ac8fa', // Teal/Cyan
  '#8e8e93', // Grey
];

// Custom accent colors for categories matching BudgetSection
const getCategoryColorClasses = (category: string, index: number, categoryColors?: Record<string, string>) => {
  const fallbackColor = COLORS[index % COLORS.length];
  const catStyle = getCategoryStyle(category, categoryColors);
  const fill = catStyle.hex || fallbackColor;
  return {
    ...catStyle,
    fill
  };
};

const CustomChartTooltip = ({ active, payload, label, formatAmount }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-3xl border border-white/50 dark:border-white/12 rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_48px_rgba(0,0,0,0.45)] text-[11px] space-y-1.5 min-w-[130px] no-print">
        {label && (
          <p className="font-extrabold text-[#1c1c1e] dark:text-white mb-1.5 tracking-tight border-b border-black/5 dark:border-white/5 pb-1">
            {label}
          </p>
        )}
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 font-sans">
              <span className="text-[#8e8e93] font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color || entry.fill }} />
                {entry.name}
              </span>
              <span className="font-bold font-sans text-[#1c1c1e] dark:text-white">
                {formatAmount(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = React.memo(({
  transactions,
  currencySymbol,
  language,
  formatAmount,
  budgets,
  selectedMonth,
  selectedYear,
  dateFilterMode,
  startDate,
  endDate,
  allTransactions,
  readAlertIds,
  toggleReadAlert,
  categoryColors = {},
  categoryIcons = {},
}) => {
  const t = (key: string) => TRANSLATIONS[language][key] || key;
  const tc = (cat: string) => CATEGORY_TRANSLATIONS[language][cat] || cat;

  const isCustomRange = dateFilterMode === 'dateRange' || Boolean(startDate) || Boolean(endDate);

  const currentMonthKey = `${selectedYear}-${selectedMonth.padStart(2, '0')}`;
  const activeBudgetLimit = useMemo(() => {
    const found = findActiveBudget(budgets, selectedMonth, selectedYear);
    return found ? found.limit : 0;
  }, [budgets, selectedMonth, selectedYear]);

  const forecast = useMemo(() => {
    return generateForecastReport(
      transactions,
      budgets,
      selectedMonth,
      selectedYear,
      formatAmount
    );
  }, [transactions, budgets, selectedMonth, selectedYear, formatAmount]);

  // Use the globally filtered transactions directly
  const filteredData = transactions;
  
  // Toggle style for daily trend line vs area chart
  const [trendStyle, setTrendStyle] = useState<'area' | 'line'>('area');

  // Toggle chart style for Weekly and Monthly analysis charts
  const [weeklyChartMode, setWeeklyChartMode] = useState<'bars' | 'net'>('bars');
  const [monthlyChartMode, setMonthlyChartMode] = useState<'bars' | 'net'>('bars');
  
  // Collapse/Expand state for combined Net Savings, Income & Expense summary card (default is collapsed)
  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(true);

  // Calculations for current selected range
  const summary = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    filteredData.forEach((tx) => {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else {
        totalExpense += tx.amount;
      }
    });

    const netSavings = totalIncome - totalExpense;
    const savingRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    return {
      totalIncome,
      totalExpense,
      netSavings,
      savingRate,
    };
  }, [filteredData]);

  // Chart Header Label describing active range
  const chartHeaderLabel = useMemo(() => {
    if (isCustomRange) {
      if (startDate && endDate) {
        return `${startDate} → ${endDate}`;
      } else if (startDate) {
        return `≥ ${startDate}`;
      } else if (endDate) {
        return `≤ ${endDate}`;
      } else {
        return t('allTime');
      }
    } else {
      if (selectedYear !== 'all' && selectedMonth !== 'all') {
        const d = new Date(parseInt(selectedYear, 10), parseInt(selectedMonth, 10) - 1, 1);
        const mName = d.toLocaleString('en-US', { month: 'short' });
        return `${mName} ${selectedYear}`;
      } else if (selectedYear !== 'all') {
        return selectedYear;
      } else {
        return language === 'en' ? 'Last 6 Months' : 'နောက်ဆုံး ၆ လ';
      }
    }
  }, [isCustomRange, startDate, endDate, selectedMonth, selectedYear, language, t]);

  // Myanmar short month mapping
  const MY_SHORT_MONTHS: Record<string, string> = {
    '01': 'ဇန်',
    '02': 'ဖေ',
    '03': 'မတ်',
    '04': 'ဧပြီ',
    '05': 'မေ',
    '06': 'ဇွန်',
    '07': 'ဇူ',
    '08': 'ဩ',
    '09': 'စက်',
    '10': 'အောက်',
    '11': 'နို',
    '12': 'ဒီ'
  };

  // 1. Weekly Analysis Data (Calculated dynamically for selected month or multi-week ranges)
  const weeklyData = useMemo(() => {
    if (filteredData.length === 0) return [];

    // Case A: Single Month View (e.g. 2026-08)
    if (!isCustomRange && selectedYear !== 'all' && selectedMonth !== 'all') {
      const selY = parseInt(selectedYear, 10);
      const selM = parseInt(selectedMonth, 10);
      const daysInMonth = new Date(selY, selM, 0).getDate();

      const weeks = [
        {
          weekKey: 'w1',
          shortLabel: language === 'my' ? 'ပတ် ၁ (၁-၇)' : 'W1 (1-7)',
          label: language === 'my' ? 'ပထမပတ် (၁-၇)' : 'Week 1 (1-7)',
          startDay: 1,
          endDay: 7,
          income: 0,
          expense: 0,
          txCount: 0
        },
        {
          weekKey: 'w2',
          shortLabel: language === 'my' ? 'ပတ် ၂ (၈-၁၄)' : 'W2 (8-14)',
          label: language === 'my' ? 'ဒုတိယပတ် (၈-၁၄)' : 'Week 2 (8-14)',
          startDay: 8,
          endDay: 14,
          income: 0,
          expense: 0,
          txCount: 0
        },
        {
          weekKey: 'w3',
          shortLabel: language === 'my' ? 'ပတ် ၃ (၁၅-၂၁)' : 'W3 (15-21)',
          label: language === 'my' ? 'တတိယပတ် (၁၅-၂၁)' : 'Week 3 (15-21)',
          startDay: 15,
          endDay: 21,
          income: 0,
          expense: 0,
          txCount: 0
        },
        {
          weekKey: 'w4',
          shortLabel: language === 'my' ? 'ပတ် ၄ (၂၂-၂၈)' : 'W4 (22-28)',
          label: language === 'my' ? 'စတုတ္ထပတ် (၂၂-၂၈)' : 'Week 4 (22-28)',
          startDay: 22,
          endDay: 28,
          income: 0,
          expense: 0,
          txCount: 0
        },
        {
          weekKey: 'w5',
          shortLabel: language === 'my' ? `ပတ် ၅ (၂၉-${daysInMonth})` : `W5 (29-${daysInMonth})`,
          label: language === 'my' ? `ပဉ္စမပတ် (၂၉-${daysInMonth})` : `Week 5 (29-${daysInMonth})`,
          startDay: 29,
          endDay: daysInMonth,
          income: 0,
          expense: 0,
          txCount: 0
        }
      ];

      filteredData.forEach((tx) => {
        if (!tx.date) return;
        const parts = tx.date.split('-');
        if (parts.length === 3) {
          const day = parseInt(parts[2], 10);
          const w = weeks.find((wItem) => day >= wItem.startDay && day <= wItem.endDay);
          if (w) {
            if (tx.type === 'income') w.income += tx.amount;
            else w.expense += tx.amount;
            w.txCount += 1;
          }
        }
      });

      return weeks.map((w) => ({
        ...w,
        net: w.income - w.expense
      }));
    }

    // Case B: Multi-month, Date range or All Time (7-day calendar groupings)
    const dates = filteredData.map((t) => t.date).filter(Boolean).sort();
    if (dates.length === 0) return [];

    const minDateStr = dates[0];
    const maxDateStr = dates[dates.length - 1];
    const minD = new Date(minDateStr);
    const maxD = new Date(maxDateStr);
    const diffDays = Math.max(Math.ceil((maxD.getTime() - minD.getTime()) / (1000 * 60 * 60 * 24)) + 1, 7);
    const numWeeks = Math.min(Math.ceil(diffDays / 7), 8);

    const weekBuckets: Array<{
      weekKey: string;
      shortLabel: string;
      label: string;
      startDate: Date;
      endDate: Date;
      income: number;
      expense: number;
      txCount: number;
    }> = [];

    for (let i = 0; i < numWeeks; i++) {
      const wStart = new Date(minD.getTime() + i * 7 * 24 * 60 * 60 * 1000);
      const wEnd = new Date(Math.min(minD.getTime() + ((i + 1) * 7 - 1) * 24 * 60 * 60 * 1000, maxD.getTime()));

      const sM = wStart.getMonth() + 1;
      const sD = wStart.getDate();
      const eM = wEnd.getMonth() + 1;
      const eD = wEnd.getDate();

      const shortLabel = `${sM}/${sD}-${eD}`;
      const label = language === 'my'
        ? `အပတ် ${i + 1} (${sM}/${sD} - ${eM}/${eD})`
        : `Week ${i + 1} (${sM}/${sD} - ${eM}/${eD})`;

      weekBuckets.push({
        weekKey: `w_${i + 1}`,
        shortLabel,
        label,
        startDate: wStart,
        endDate: wEnd,
        income: 0,
        expense: 0,
        txCount: 0
      });
    }

    filteredData.forEach((tx) => {
      if (!tx.date) return;
      const txD = new Date(tx.date);
      const targetBucket = weekBuckets.find((b) => txD >= b.startDate && txD <= b.endDate) || weekBuckets[weekBuckets.length - 1];
      if (targetBucket) {
        if (tx.type === 'income') targetBucket.income += tx.amount;
        else targetBucket.expense += tx.amount;
        targetBucket.txCount += 1;
      }
    });

    return weekBuckets.map((w) => ({
      ...w,
      net: w.income - w.expense
    }));
  }, [filteredData, isCustomRange, selectedYear, selectedMonth, language]);

  // Weekly stats for summary badges
  const weeklyStats = useMemo(() => {
    if (weeklyData.length === 0) {
      return { highestSpendingWeek: null, avgExpense: 0, highestExpenseAmount: 0 };
    }
    let maxExp = 0;
    let maxWeekLabel = '';
    let totalExp = 0;
    let activeWeeks = 0;

    weeklyData.forEach((w) => {
      totalExp += w.expense;
      if (w.expense > 0 || w.income > 0) activeWeeks += 1;
      if (w.expense > maxExp) {
        maxExp = w.expense;
        maxWeekLabel = w.label;
      }
    });

    const divisor = Math.max(activeWeeks, weeklyData.length, 1);
    return {
      highestSpendingWeek: maxExp > 0 ? maxWeekLabel : null,
      highestExpenseAmount: maxExp,
      avgExpense: totalExp / divisor
    };
  }, [weeklyData]);

  // 2. Monthly History (Income vs Expense monthly bars dynamically aligned with custom range/filters)
  const monthlyData = useMemo(() => {
    const monthlyGroups: Record<string, { month: string; rawMonth: string; income: number; expense: number; net: number }> = {};
    const targetMonths: string[] = [];

    if (isCustomRange) {
      if (startDate && endDate) {
        const startYM = startDate.substring(0, 7);
        const endYM = endDate.substring(0, 7);

        if (startYM === endYM) {
          // If start and end date fall in the same month, show 5 preceding months + this month for context
          const [sY, sM] = startYM.split('-').map(Number);
          for (let i = 4; i >= 0; i--) {
            const d = new Date(sY, sM - 1 - i, 1);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            targetMonths.push(`${yyyy}-${mm}`);
          }
        } else {
          // Generate all YYYY-MM months from startYM to endYM inclusive
          const [sY, sM] = startYM.split('-').map(Number);
          const [eY, eM] = endYM.split('-').map(Number);
          let currY = sY;
          let currM = sM;

          while (currY < eY || (currY === eY && currM <= eM)) {
            const yyyy = currY;
            const mm = String(currM).padStart(2, '0');
            targetMonths.push(`${yyyy}-${mm}`);

            currM++;
            if (currM > 12) {
              currM = 1;
              currY++;
            }
          }
        }
      } else if (startDate) {
        const startYM = startDate.substring(0, 7);
        const [sY, sM] = startYM.split('-').map(Number);
        const now = new Date();
        const endY = now.getFullYear();
        const endM = now.getMonth() + 1;

        let currY = sY;
        let currM = sM;
        while (currY < endY || (currY === endY && currM <= endM)) {
          const yyyy = currY;
          const mm = String(currM).padStart(2, '0');
          targetMonths.push(`${yyyy}-${mm}`);
          currM++;
          if (currM > 12) {
            currM = 1;
            currY++;
          }
        }
      } else if (endDate) {
        const endYM = endDate.substring(0, 7);
        const [eY, eM] = endYM.split('-').map(Number);
        for (let i = 5; i >= 0; i--) {
          const d = new Date(eY, eM - 1 - i, 1);
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          targetMonths.push(`${yyyy}-${mm}`);
        }
      } else {
        // All time: gather all distinct YYYY-MM from transactions/allTransactions
        const txSource = (allTransactions && allTransactions.length > 0) ? allTransactions : transactions;
        const set = new Set<string>();
        txSource.forEach(tx => {
          if (tx.date) set.add(tx.date.substring(0, 7));
        });
        const sorted = Array.from(set).sort();
        if (sorted.length > 0) {
          targetMonths.push(...sorted);
        } else {
          const now = new Date();
          for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            targetMonths.push(`${yyyy}-${mm}`);
          }
        }
      }
    } else {
      // Month/Year filter mode
      if (selectedYear !== 'all' && selectedMonth !== 'all') {
        const selY = parseInt(selectedYear, 10);
        const selM = parseInt(selectedMonth, 10);
        for (let i = 5; i >= 0; i--) {
          const d = new Date(selY, selM - 1 - i, 1);
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          targetMonths.push(`${yyyy}-${mm}`);
        }
      } else if (selectedYear !== 'all' && selectedMonth === 'all') {
        const selY = parseInt(selectedYear, 10);
        for (let m = 1; m <= 12; m++) {
          const mm = String(m).padStart(2, '0');
          targetMonths.push(`${selY}-${mm}`);
        }
      } else {
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          targetMonths.push(`${yyyy}-${mm}`);
        }
      }
    }

    // Populate targetMonths in monthlyGroups with localization
    targetMonths.forEach((mStr) => {
      const [y, m] = mStr.split('-');
      const d = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
      const shortYear = y.slice(2);
      const formatMonth = language === 'my'
        ? `${MY_SHORT_MONTHS[m] || m} '${shortYear}`
        : d.toLocaleString('en-US', { month: 'short', year: '2-digit' });

      monthlyGroups[mStr] = {
        month: formatMonth,
        rawMonth: mStr,
        income: 0,
        expense: 0,
        net: 0,
      };
    });

    const txSource = (allTransactions && allTransactions.length > 0) ? allTransactions : transactions;

    txSource.forEach((tx) => {
      if (!tx.date) return;

      if (isCustomRange) {
        if (startDate && tx.date < startDate) return;
        if (endDate && tx.date > endDate) return;
      }

      const monthLabel = tx.date.substring(0, 7); // "YYYY-MM"
      if (monthlyGroups[monthLabel]) {
        if (tx.type === 'income') {
          monthlyGroups[monthLabel].income += tx.amount;
        } else {
          monthlyGroups[monthLabel].expense += tx.amount;
        }
      }
    });

    return Object.values(monthlyGroups)
      .map((item) => ({
        ...item,
        net: item.income - item.expense
      }))
      .sort((a, b) => a.rawMonth.localeCompare(b.rawMonth));
  }, [transactions, allTransactions, isCustomRange, startDate, endDate, selectedMonth, selectedYear, language]);

  // Monthly stats for summary badges
  const monthlyStats = useMemo(() => {
    if (monthlyData.length === 0) {
      return { topSavingsMonth: null, avgMonthlyIncome: 0, avgMonthlyExpense: 0 };
    }

    let maxNet = -Infinity;
    let topMonthLabel = '';
    let totalInc = 0;
    let totalExp = 0;
    let activeMonths = 0;

    monthlyData.forEach((m) => {
      totalInc += m.income;
      totalExp += m.expense;
      if (m.income > 0 || m.expense > 0) activeMonths += 1;
      if (m.net > maxNet) {
        maxNet = m.net;
        topMonthLabel = m.month;
      }
    });

    const divisor = Math.max(activeMonths, 1);
    return {
      topSavingsMonth: maxNet > 0 ? topMonthLabel : null,
      topNetSavings: maxNet,
      avgMonthlyIncome: totalInc / divisor,
      avgMonthlyExpense: totalExp / divisor
    };
  }, [monthlyData]);

  // 2. Day-by-Day Trend (Daily Line)
  const dailyData = useMemo(() => {
    const dailyGroups: Record<string, { dateStr: string; income: number; expense: number }> = {};

    filteredData.forEach((tx) => {
      const dateLabel = tx.date;
      if (!dailyGroups[dateLabel]) {
        dailyGroups[dateLabel] = {
          dateStr: dateLabel.substring(5), // "MM-DD" style for compact display
          income: 0,
          expense: 0,
        };
      }

      if (tx.type === 'income') {
        dailyGroups[dateLabel].income += tx.amount;
      } else {
        dailyGroups[dateLabel].expense += tx.amount;
      }
    });

    // Sort dates
    return Object.values(dailyGroups).sort((a, b) => a.dateStr.localeCompare(b.dateStr));
  }, [filteredData]);

  // 3. Category Breakdown (Pie)
  const categoryData = useMemo(() => {
    const categoryGroups: Record<string, number> = {};
    let totalExpense = 0;

    filteredData.forEach((tx) => {
      if (tx.type === 'expense') {
        categoryGroups[tx.category] = (categoryGroups[tx.category] || 0) + tx.amount;
        totalExpense += tx.amount;
      }
    });

    return Object.entries(categoryGroups).map(([name, value]) => ({
      name: tc(name),
      rawName: name,
      value,
      percentage: totalExpense > 0 ? (value / totalExpense) * 100 : 0,
    })).sort((a, b) => b.value - a.value);
  }, [filteredData, language]);

  // Smart localized financial tips from the coach
  const coachInsight = useMemo(() => {
    if (filteredData.length === 0) return null;

    const topCategory = categoryData[0];
    const { totalIncome, totalExpense, netSavings, savingRate } = summary;

    if (totalExpense > totalIncome && totalIncome > 0) {
      return {
        type: 'danger',
        title: language === 'my' ? 'ဘတ်ဂျက်လိုငွေပြမှု (အရေးကြီး)' : 'Cash Outflow Deficit',
        desc: language === 'my' 
          ? `လတ်တလောကာလတွင် သင့်အသုံးစရိတ်သည် ဝင်ငွေထက် ${formatAmount(Math.abs(netSavings))} ပိုများနေပါသည်။ စုဆောင်းငွေနှုန်းသည် ${savingRate.toFixed(0)}% အနုတ်လက္ခဏာဖြစ်နေသဖြင့် အရေးကြီးမဟုတ်သော ကဏ္ဍများကို လျှော့ချသင့်ပါသည်။`
          : `You have spent ${formatAmount(Math.abs(netSavings))} more than your income this period. Your saving rate is at ${savingRate.toFixed(0)}%. We highly recommend reviewing discretionary expenses.`,
      };
    }

    if (savingRate > 35) {
      return {
        type: 'success',
        title: language === 'my' ? 'ထူးချွန်သော ငွေကြေးစုဆောင်းမှု' : 'Outstanding Savings Discipline',
        desc: language === 'my'
          ? `ဂုဏ်ယူပါသည်! သင့်ဝင်ငွေ၏ ${savingRate.toFixed(0)}% အထိ စုဆောင်းနိုင်ခဲ့ပါသည်။ ၎င်းသည် ကျန်းမာသော ငွေရေးကြေးရေး ပန်းတိုင်ဆီသို့ ဦးတည်နေပြီး အသုံးစရိတ် စည်းကမ်း အလွန်ကောင်းမွန်ပါသည်။`
          : `Phenomenal job! You have successfully saved ${savingRate.toFixed(0)}% of your total income. This places you in the top tier of healthy wealth-building habits.`,
      };
    }

    if (topCategory && topCategory.percentage > 40) {
      return {
        type: 'warning',
        title: language === 'my' ? 'ကဏ္ဍတစ်ခုတည်းတွင် အသုံးများနေခြင်း' : 'High Category Concentration',
        desc: language === 'my'
          ? `သင့်စုစုပေါင်းအသုံးစရိတ်၏ ${topCategory.percentage.toFixed(0)}% ကို "${topCategory.name}" ကဏ္ဍတစ်ခုတည်းတွင် အသုံးပြုထားသည်ကို တွေ့ရသည်။ ဤကဏ္ဍကို အနည်းငယ်လျှော့ချခြင်းဖြင့် ပိုမိုစုဆောင်းနိုင်မည်ဖြစ်သည်။`
          : `Spending on "${topCategory.name}" accounts for ${topCategory.percentage.toFixed(0)}% of your total expenses. Adjusting this single driver will scale your savings immediately.`,
      };
    }

    return {
      type: 'info',
      title: language === 'my' ? 'မျှတသော ငွေကြေးစီးဆင်းမှု' : 'Balanced Financial Flow',
      desc: language === 'my'
        ? `သင့်ငွေကြေးစီးဆင်းမှုသည် တည်ငြိမ်သော အခြေအနေတွင်ရှိပြီး ဝင်ငွေ၏ ${savingRate.toFixed(0)}% ကို စုဆောင်းထားနိုင်ပါသည်။ ယခုအတိုင်း ဆက်လက်ထိန်းသိမ်းသွားပါ။`
        : `Your cash flow is steady, with a savings rate of ${savingRate.toFixed(0)}%. You are maintaining a highly healthy balance between spending and goals.`,
    };
  }, [filteredData, categoryData, summary, language]);

  // Find the single highest spending day
  const mostExpensiveDay = useMemo(() => {
    const expensesByDay: Record<string, number> = {};
    filteredData.forEach(tx => {
      if (tx.type === 'expense') {
        expensesByDay[tx.date] = (expensesByDay[tx.date] || 0) + tx.amount;
      }
    });
    
    let maxDay = '';
    let maxAmount = 0;
    Object.entries(expensesByDay).forEach(([date, amt]) => {
      if (amt > maxAmount) {
        maxAmount = amt;
        maxDay = date;
      }
    });

    return maxAmount > 0 ? { date: maxDay.substring(5), amount: maxAmount } : null;
  }, [filteredData]);

  return (
    <div className="space-y-6" id="analytics-section">
      {/* Title & Static Meta */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2.5 font-sans">
            <div className="w-8 h-8 rounded-xl bg-[#007aff]/10 text-[#007aff] flex items-center justify-center shrink-0 border border-[#007aff]/20">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
            {t('analytics')}
          </h2>
          <p className="text-xs text-[#8e8e93]">
            {t('trend')} • {language === 'en' ? 'Interactive visual reports' : 'အပြန်အလှန်အကျိုးပြု ငွေကြေးအစီရင်ခံစာများ'}
          </p>
        </div>
      </div>

      {/* Executive Cash Flow Summary Card */}
      <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/80 dark:border-white/10 transition-all duration-300">
        
        {/* Card Header Bar */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/10 text-[#007aff]">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1c1c1e] dark:text-white leading-tight">
                {language === 'en' ? 'Cash Flow Summary' : 'ငွေကြေးစီးဆင်းမှု အနှစ်ချုပ်'}
              </h3>
              <p className="text-[11px] text-[#8e8e93] font-medium">
                {chartHeaderLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSummaryCollapsed(!isSummaryCollapsed)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-[#007aff] text-xs font-semibold transition-all cursor-pointer active:scale-95 select-none"
              aria-label={isSummaryCollapsed ? 'Expand Summary' : 'Collapse Summary'}
            >
              <span>{isSummaryCollapsed ? (language === 'en' ? 'Expand' : 'ဖြန့်ပါ') : (language === 'en' ? 'Collapse' : 'ခေါက်ပါ')}</span>
              {isSummaryCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Collapsed Compact View */}
        {isSummaryCollapsed ? (
          <div className="pt-4 flex flex-wrap items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8e8e93] font-medium">{t('netSavings')}:</span>
              <span className={`text-base font-bold font-sans ${summary.netSavings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {summary.netSavings < 0 ? '-' : '+'}{formatAmount(Math.abs(summary.netSavings))}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs font-medium font-sans text-[#8e8e93]">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {formatAmount(summary.totalIncome)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                <ArrowDownLeft className="w-3.5 h-3.5" />
                {formatAmount(summary.totalExpense)}
              </span>
            </div>
          </div>
        ) : (
          /* Expanded Clean Metric Grid View */
          <div className="pt-5 space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Income */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#8e8e93] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {t('income')}
                  </span>
                  <span className="text-[10px] font-sans text-[#8e8e93]">
                    {filteredData.filter(tx => tx.type === 'income').length} {language === 'en' ? 'txns' : 'ခု'}
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-[#1c1c1e] dark:text-white">
                  {formatAmount(summary.totalIncome)}
                </div>
              </div>

              {/* Expense */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#8e8e93] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    {t('expense')}
                  </span>
                  <span className="text-[10px] font-sans text-[#8e8e93]">
                    {filteredData.filter(tx => tx.type === 'expense').length} {language === 'en' ? 'txns' : 'ခု'}
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-[#1c1c1e] dark:text-white">
                  {formatAmount(summary.totalExpense)}
                </div>
              </div>

              {/* Net Cash Flow */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#8e8e93] flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${summary.netSavings >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    {t('netSavings')}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    summary.netSavings >= 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  }`}>
                    {summary.savingRate.toFixed(0)}% {language === 'en' ? 'Saved' : 'စုဆောင်းငွေ'}
                  </span>
                </div>
                <div className={`text-xl sm:text-2xl font-bold font-sans tracking-tight ${
                  summary.netSavings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {summary.netSavings < 0 ? '-' : '+'}{formatAmount(Math.abs(summary.netSavings))}
                </div>
              </div>

            </div>

            {/* Streamlined Cash Flow Proportion Bar */}
            {summary.totalIncome > 0 && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs font-medium text-[#8e8e93]">
                  <span>{language === 'en' ? 'Income Breakdown' : 'ဝင်ငွေ ခွဲဝေမှု ခွဲခြမ်းစိတ်ဖြာချက်'}</span>
                  <div className="flex items-center gap-3 text-[11px] font-sans">
                    <span className="text-rose-500">
                      {language === 'en' ? 'Spent' : 'သုံးစွဲ'}: {((summary.totalExpense / summary.totalIncome) * 100).toFixed(1)}%
                    </span>
                    <span className="text-emerald-500">
                      {language === 'en' ? 'Saved' : 'စုဆောင်း'}: {Math.max(summary.savingRate, 0).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-rose-500 transition-all duration-500"
                    style={{ width: `${Math.min((summary.totalExpense / summary.totalIncome) * 100, 100)}%` }}
                  />
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500 flex-1"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Smart Localized Financial Coach Insight Bubble */}
      {coachInsight && (
        <div className={`p-4 rounded-[1.8rem] ios-glass border flex items-start gap-3.5 text-xs transition-all shadow-2xs`}>
          <div className={`p-2.5 rounded-xl shrink-0 ${
            coachInsight.type === 'danger'
              ? 'bg-[#ff3b30]/10 text-[#ff3b30]'
              : coachInsight.type === 'warning'
              ? 'bg-amber-500/10 text-amber-500'
              : coachInsight.type === 'success'
              ? 'bg-[#34c759]/10 text-[#34c759]'
              : 'bg-[#007aff]/10 text-[#007aff]'
          }`}>
            <Sparkles className="w-4 h-4 shrink-0" />
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-[#1c1c1e] dark:text-white flex items-center gap-1.5">
              {coachInsight.title}
            </h4>
            <p className="text-black/75 dark:text-white/75 leading-relaxed font-medium">
              {coachInsight.desc}
            </p>
          </div>
        </div>
      )}

      {/* Charts Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="charts-container">
        
        {/* 1. Weekly Analysis Chart */}
        <div className="p-5 ios-glass rounded-[2rem] space-y-4 flex flex-col justify-between" id="weekly-analysis-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <h3 className="text-sm font-bold text-[#1c1c1e] dark:text-white flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-[#007aff]" />
                {t('weeklyAnalysis')}
              </h3>
              {weeklyStats.highestSpendingWeek && (
                <p className="text-[11px] text-[#8e8e93] font-medium mt-0.5">
                  {t('highestSpendingWeek')}: <span className="font-semibold text-rose-500">{weeklyStats.highestSpendingWeek}</span>
                </p>
              )}
            </div>

            {/* Grouped Bars vs Net Flow switch */}
            <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setWeeklyChartMode('bars')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  weeklyChartMode === 'bars'
                    ? 'bg-white dark:bg-[#1c1c1e] text-[#1c1c1e] dark:text-white shadow-xs'
                    : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white'
                }`}
              >
                {language === 'en' ? 'Income vs Exp' : 'ဝင်/ထွက်'}
              </button>
              <button
                type="button"
                onClick={() => setWeeklyChartMode('net')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  weeklyChartMode === 'net'
                    ? 'bg-white dark:bg-[#1c1c1e] text-[#1c1c1e] dark:text-white shadow-xs'
                    : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white'
                }`}
              >
                {t('netFlow')}
              </button>
            </div>
          </div>

          <div className="h-64 w-full pt-2 gpu-layer" id="weekly-bar-chart">
            {weeklyData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[#8e8e93] text-xs">
                {t('noTransactions')}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {weeklyChartMode === 'bars' ? (
                  <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5ea" opacity={0.1} />
                    <XAxis dataKey="shortLabel" stroke="#8e8e93" fontSize={11} tickLine={false} />
                    <YAxis stroke="#8e8e93" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomChartTooltip formatAmount={formatAmount} />} />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Bar name={t('expense')} dataKey="expense" fill="#ff3b30" radius={[4, 4, 0, 0]} maxBarSize={32} style={{ outline: 'none' }} isAnimationActive={false} />
                    <Bar name={t('income')} dataKey="income" fill="#34c759" radius={[4, 4, 0, 0]} maxBarSize={32} style={{ outline: 'none' }} isAnimationActive={false} />
                  </BarChart>
                ) : (
                  <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5ea" opacity={0.1} />
                    <XAxis dataKey="shortLabel" stroke="#8e8e93" fontSize={11} tickLine={false} />
                    <YAxis stroke="#8e8e93" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomChartTooltip formatAmount={formatAmount} />} />
                    <ReferenceLine y={0} stroke="#8e8e93" strokeDasharray="2 2" />
                    <Bar
                      name={t('netFlow')}
                      dataKey="net"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={36}
                      style={{ outline: 'none' }}
                      isAnimationActive={false}
                    >
                      {weeklyData.map((entry, idx) => (
                        <Cell key={`cell-net-w-${idx}`} fill={entry.net >= 0 ? '#34c759' : '#ff3b30'} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 2. Monthly Analysis Chart */}
        <div className="p-5 ios-glass rounded-[2rem] space-y-4 flex flex-col justify-between" id="monthly-analysis-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <h3 className="text-sm font-bold text-[#1c1c1e] dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#34c759]" />
                {t('monthlyAnalysis')}
              </h3>
              {monthlyStats.topSavingsMonth && (
                <p className="text-[11px] text-[#8e8e93] font-medium mt-0.5">
                  {t('bestSavingsMonth')}: <span className="font-semibold text-emerald-500">{monthlyStats.topSavingsMonth}</span>
                </p>
              )}
            </div>

            {/* Grouped Bars vs Net Flow switch */}
            <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setMonthlyChartMode('bars')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  monthlyChartMode === 'bars'
                    ? 'bg-white dark:bg-[#1c1c1e] text-[#1c1c1e] dark:text-white shadow-xs'
                    : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white'
                }`}
              >
                {language === 'en' ? 'Income vs Exp' : 'ဝင်/ထွက်'}
              </button>
              <button
                type="button"
                onClick={() => setMonthlyChartMode('net')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  monthlyChartMode === 'net'
                    ? 'bg-white dark:bg-[#1c1c1e] text-[#1c1c1e] dark:text-white shadow-xs'
                    : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white'
                }`}
              >
                {t('netFlow')}
              </button>
            </div>
          </div>

          <div className="h-64 w-full pt-2 gpu-layer" id="monthly-bar-chart">
            {monthlyData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[#8e8e93] text-xs">
                {t('noTransactions')}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {monthlyChartMode === 'bars' ? (
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5ea" opacity={0.1} />
                    <XAxis dataKey="month" stroke="#8e8e93" fontSize={11} tickLine={false} />
                    <YAxis stroke="#8e8e93" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomChartTooltip formatAmount={formatAmount} />} />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Bar name={t('expense')} dataKey="expense" fill="#ff3b30" radius={[4, 4, 0, 0]} maxBarSize={32} style={{ outline: 'none' }} isAnimationActive={false} />
                    <Bar name={t('income')} dataKey="income" fill="#34c759" radius={[4, 4, 0, 0]} maxBarSize={32} style={{ outline: 'none' }} isAnimationActive={false} />
                  </BarChart>
                ) : (
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5ea" opacity={0.1} />
                    <XAxis dataKey="month" stroke="#8e8e93" fontSize={11} tickLine={false} />
                    <YAxis stroke="#8e8e93" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomChartTooltip formatAmount={formatAmount} />} />
                    <ReferenceLine y={0} stroke="#8e8e93" strokeDasharray="2 2" />
                    <Bar
                      name={t('netFlow')}
                      dataKey="net"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={36}
                      style={{ outline: 'none' }}
                      isAnimationActive={false}
                    >
                      {monthlyData.map((entry, idx) => (
                        <Cell key={`cell-net-m-${idx}`} fill={entry.net >= 0 ? '#34c759' : '#ff3b30'} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </div>
        
        {/* 3. Interactive Day-by-Day Trend Chart */}
        <div className="p-5 ios-glass rounded-[2rem] space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-[#1c1c1e] dark:text-white flex items-center gap-2">
              <CalendarRange className="w-4 h-4 text-[#007aff]" />
              {t('trend')}
            </h3>

            {/* Area vs Line interactive switch */}
            <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setTrendStyle('area')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  trendStyle === 'area'
                    ? 'bg-white dark:bg-[#1c1c1e] text-[#1c1c1e] dark:text-white shadow-xs'
                    : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white'
                }`}
              >
                {language === 'en' ? 'Area' : 'ဧရိယာ'}
              </button>
              <button
                type="button"
                onClick={() => setTrendStyle('line')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  trendStyle === 'line'
                    ? 'bg-white dark:bg-[#1c1c1e] text-[#1c1c1e] dark:text-white shadow-xs'
                    : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white'
                }`}
              >
                {language === 'en' ? 'Line' : 'မျဉ်း'}
              </button>
            </div>
          </div>

          <div className="h-64 w-full pt-2 gpu-layer" id="daily-trend-chart">
            {dailyData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[#8e8e93] text-xs">
                {t('noTransactions')}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {trendStyle === 'area' ? (
                  <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff3b30" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#ff3b30" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34c759" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#34c759" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5ea" opacity={0.1} />
                    <XAxis dataKey="dateStr" stroke="#8e8e93" fontSize={11} tickLine={false} />
                    <YAxis stroke="#8e8e93" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomChartTooltip formatAmount={formatAmount} />} />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Area type="monotone" name={t('expense')} dataKey="expense" stroke="#ff3b30" strokeWidth={2.5} fillOpacity={1} fill="url(#colorExpense)" style={{ outline: 'none' }} isAnimationActive={false} />
                    <Area type="monotone" name={t('income')} dataKey="income" stroke="#34c759" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIncome)" style={{ outline: 'none' }} isAnimationActive={false} />
                  </AreaChart>
                ) : (
                  <LineChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5ea" opacity={0.1} />
                    <XAxis dataKey="dateStr" stroke="#8e8e93" fontSize={11} tickLine={false} />
                    <YAxis stroke="#8e8e93" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomChartTooltip formatAmount={formatAmount} />} />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Line type="monotone" name={t('expense')} dataKey="expense" stroke="#ff3b30" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 1 }} activeDot={{ r: 6 }} style={{ outline: 'none' }} isAnimationActive={false} />
                    <Line type="monotone" name={t('income')} dataKey="income" stroke="#34c759" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 1 }} activeDot={{ r: 6 }} style={{ outline: 'none' }} isAnimationActive={false} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category Breakdown (Pie Chart + List with unified styling) */}
        <div className="p-5 ios-glass rounded-[2rem] space-y-4 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-[#1c1c1e] dark:text-white flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-[#34c759]" />
            {t('byCategory')} ({t('expenses')})
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center flex-1">
            {/* Donut Chart with Centered readout */}
            <div className="sm:col-span-5 h-44 w-full flex items-center justify-center relative" id="category-pie-chart">
              {categoryData.length === 0 ? (
                <div className="text-[#8e8e93] text-xs">
                  {t('noTransactions')}
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                        style={{ outline: 'none' }}
                        isAnimationActive={false}
                      >
                        {categoryData.map((entry, index) => {
                          const styleInfo = getCategoryColorClasses(entry.rawName, index, categoryColors);
                          return (
                            <Cell key={`cell-${index}`} fill={styleInfo.fill} style={{ outline: 'none' }} />
                          );
                        })}
                      </Pie>
                      <Tooltip content={<CustomChartTooltip formatAmount={formatAmount} />} />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Center Readout Labels */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-black text-[#1c1c1e] dark:text-white font-sans">
                      {categoryData.length}
                    </span>
                    <span className="text-[9px] text-[#8e8e93] font-bold uppercase tracking-wider">
                      {language === 'en' ? 'Categories' : 'ကဏ္ဍများ'}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Gorgeous Category Ranking List (matching the style details of Budget section) */}
            <div className="sm:col-span-7 space-y-3.5 max-h-[195px] overflow-y-auto pr-1 scrollbar-thin">
              {categoryData.slice(0, 5).map((item, index) => {
                const styleInfo = getCategoryColorClasses(item.rawName, index, categoryColors);
                const CatIcon = getCategoryIcon(item.rawName, categoryIcons);
                return (
                  <div key={item.rawName} className="space-y-1.5 fast-render-row">
                    <div className="flex items-center justify-between text-xs text-[#1c1c1e] dark:text-[#f2f2f7]">
                      <span className="flex items-center gap-2 font-bold">
                        <div
                          className={`p-1.5 rounded-lg border ${styleInfo.bg} ${styleInfo.text} ${styleInfo.border}`}
                          style={styleInfo.style}
                        >
                          <CatIcon className="w-3.5 h-3.5" />
                        </div>
                        {item.name}
                      </span>
                      <div className="flex items-center gap-1.5 font-sans">
                        <span className="font-extrabold text-[#1c1c1e] dark:text-white">
                          {formatAmount(item.value)}
                        </span>
                        <span className="text-[10px] text-[#8e8e93] font-bold">
                          ({item.percentage.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                    
                    {/* Linear color-coded track */}
                    <div className="w-full h-1.5 bg-[#f2f2f7] dark:bg-[#2c2c2e] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ 
                          width: `${item.percentage}%`, 
                          backgroundColor: styleInfo.fill 
                        }} 
                      />
                    </div>
                  </div>
                );
              })}
              {categoryData.length === 0 && (
                <div className="text-center py-10 text-xs text-[#8e8e93]">
                  {t('noTransactions')}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Smart Spending Forecast & Daily Target (Full Width Bento Panel) */}
        <div className="p-5 sm:p-6 ios-glass rounded-[2rem] space-y-5 lg:col-span-2 shadow-xs border border-black/5 dark:border-white/5" id="forecasting-analytics-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f2f2f7] dark:border-[#2c2c2e] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#007aff]/10 text-[#007aff] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1c1c1e] dark:text-white leading-tight">
                  {language === 'en' ? 'Smart Spending Forecast' : 'ဘတ်ဂျက် ခန့်မှန်းချက်နှင့် သုံးစွဲမှု အကြံပြုချက်များ'}
                </h3>
                <p className="text-xs text-[#8e8e93] mt-0.5 font-normal">
                  {language === 'en' ? 'Practical daily pacing & advice' : 'လက်တွေ့ကျသော တစ်နေ့တာ သုံးစွဲမှု အကြံပြုချက်များ'}
                </p>
              </div>
            </div>

            {/* Reliability Confidence Badge */}
            <div className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-black/5 dark:bg-white/10 text-[#8e8e93] dark:text-gray-300">
              <Clock className="w-3.5 h-3.5 text-[#007aff]" />
              <span>
                {forecast.forecastAccuracy === 'high'
                  ? (language === 'en' ? 'High Confidence' : 'စိတ်ချရမှု မြင့်မား')
                  : forecast.forecastAccuracy === 'medium'
                  ? (language === 'en' ? 'Mid-Month Estimate' : 'လလယ် ခန့်မှန်းချက်')
                  : (language === 'en' ? 'Early Month Target' : 'လဆန်း ပဏာမ စံနှုန်း')
                }
              </span>
            </div>
          </div>

          {/* Practical Metrics Grid: Recommended Daily Target, Projected Total, Current Daily Pace */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Recommended Daily Allowance for Remaining Days */}
            <div className="p-3.5 bg-[#007aff]/5 dark:bg-[#007aff]/10 border border-[#007aff]/10 rounded-2xl space-y-1">
              <span className="block text-xs text-[#007aff] font-semibold">
                {language === 'en' ? 'Recommended Daily Limit' : 'အကြံပြု တစ်နေ့တာ သုံးစွဲမှု'}
              </span>
              <span className="block text-lg font-bold font-sans text-[#007aff]">
                {activeBudgetLimit > 0 ? `${formatAmount(forecast.dailyAllowanceRemaining)}/day` : (language === 'en' ? 'No budget set' : 'ဘတ်ဂျက်မသတ်မှတ်ထားပါ')}
              </span>
              <span className="block text-[11px] text-[#8e8e93] font-normal">
                {language === 'en' ? 'Target for remaining days' : 'ကျန်ရှိသော ရက်များအတွက် စံနှုန်း'}
              </span>
            </div>

            {/* 2. Projected Spent */}
            <div className="p-3.5 bg-[#f2f2f7]/80 dark:bg-[#2c2c2e]/60 rounded-2xl space-y-1">
              <span className="block text-xs text-[#8e8e93] font-medium">
                {language === 'en' ? 'Projected Month-End Total' : 'လကုန် ခန့်မှန်းခြေ စုစုပေါင်း'}
              </span>
              <span className={`block text-lg font-bold font-sans ${forecast.projectedSpent > activeBudgetLimit && activeBudgetLimit > 0 ? 'text-[#ff3b30]' : 'text-[#34c759]'}`}>
                {formatAmount(forecast.projectedSpent)}
              </span>
              <span className="block text-[11px] text-[#8e8e93] font-normal">
                {activeBudgetLimit > 0 ? `${language === 'en' ? 'Limit:' : 'ဘတ်ဂျက်:'} ${formatAmount(activeBudgetLimit)}` : (language === 'en' ? 'Based on daily burn' : 'လက်ရှိသုံးစွဲမှု အရှိန်')}
              </span>
            </div>

            {/* 3. Current Daily Average */}
            <div className="p-3.5 bg-[#f2f2f7]/80 dark:bg-[#2c2c2e]/60 rounded-2xl space-y-1">
              <span className="block text-xs text-[#8e8e93] font-medium">
                {language === 'en' ? 'Current Daily Pace' : 'လက်ရှိ တစ်နေ့ ပျမ်းမျှ'}
              </span>
              <span className="block text-lg font-bold font-sans text-[#1c1c1e] dark:text-white">
                {formatAmount(forecast.currentDailyAvgSpent)}/day
              </span>
              <span className="block text-[11px] text-[#8e8e93] font-normal">
                {language === 'en' ? `Over ${forecast.daysElapsed} days elapsed` : `လွန်ခဲ့သော ${forecast.daysElapsed} ရက် ပျမ်းမျှ`}
              </span>
            </div>
          </div>

          {/* Actionable Practical Recommendation Banner */}
          <div className={`p-3.5 rounded-2xl flex items-start gap-3 transition-colors ${
            forecast.pacingStatus === 'exceeded'
              ? 'bg-[#ff3b30]/10 text-[#ff3b30]'
              : forecast.pacingStatus === 'over_pace' || forecast.pacingStatus === 'caution'
              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
              : 'bg-[#34c759]/10 text-[#34c759]'
          }`}>
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-xs">
              <p className="font-bold">
                {language === 'my' ? forecast.pacingMessageMy : forecast.pacingMessageEn}
              </p>
              <p className="font-normal opacity-90">
                {language === 'my' ? forecast.actionableAdviceMy : forecast.actionableAdviceEn}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 pt-1">
            {/* Left side: Active Alert Logs (5 cols) */}
            <div className="xl:col-span-5 flex flex-col justify-between gap-3">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#1c1c1e] dark:text-white flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#007aff]" />
                    {language === 'en' ? 'Active Budget Signals' : 'ဘတ်ဂျက် ညွှန်ပြချက်များ'}
                  </h4>
                  {forecast.alerts.length > 0 && (
                    <span className="text-[10px] bg-[#007aff]/10 text-[#007aff] font-bold px-2 py-0.5 rounded-full">
                      {forecast.alerts.filter(alert => !readAlertIds.includes(alert.id)).length} {language === 'en' ? 'Unread' : 'မဖတ်ရသေး'}
                    </span>
                  )}
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {forecast.alerts.length === 0 ? (
                    <div className="p-5 text-center border border-dashed border-black/10 dark:border-white/10 rounded-2xl text-xs text-[#8e8e93] space-y-1 w-full">
                      <p className="font-medium">{language === 'en' ? 'All spending signals look clean.' : 'အသုံးစရိတ်အားလုံး စနစ်တကျရှိပါသည်။'}</p>
                    </div>
                  ) : (
                    forecast.alerts.map((alert) => {
                      const isCritical = alert.type === 'critical';
                      const isWarning = alert.type === 'warning';
                      const isSuccess = alert.type === 'success';
                      const isRead = readAlertIds.includes(alert.id);

                      let alertBg = 'bg-[#007aff]/5 dark:bg-[#007aff]/10 border-[#007aff]/10';
                      let alertText = 'text-[#007aff]';
                      if (isCritical) {
                        alertBg = 'bg-[#ff3b30]/5 dark:bg-[#ff3b30]/10 border-[#ff3b30]/10';
                        alertText = 'text-[#ff3b30]';
                      } else if (isWarning) {
                        alertBg = 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/10';
                        alertText = 'text-amber-500';
                      } else if (isSuccess) {
                        alertBg = 'bg-[#34c759]/5 dark:bg-[#34c759]/10 border-[#34c759]/10';
                        alertText = 'text-[#34c759]';
                      }

                      return (
                        <div
                          key={alert.id}
                          className={`group p-3 rounded-xl border flex gap-2.5 leading-normal fast-render-row ${
                            isRead
                              ? 'bg-black/[0.01] dark:bg-white/[0.01] border-black/[0.04] dark:border-white/[0.04] opacity-50'
                              : `${alertBg}`
                          }`}
                        >
                          <div className={`p-1 rounded-lg self-start shrink-0 ${alertBg} ${alertText}`}>
                            {isCritical ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : isWarning ? (
                              <TrendingDown className="w-3 h-3" />
                            ) : (
                              <Info className="w-3 h-3" />
                            )}
                          </div>
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h5 className={`font-bold text-[#1c1c1e] dark:text-white text-xs ${isRead ? 'line-through text-[#8e8e93]' : ''}`}>
                                {language === 'my' ? alert.titleMy : alert.titleEn}
                              </h5>
                              
                              <button
                                onClick={() => toggleReadAlert(alert.id)}
                                className="shrink-0 w-5 h-5 -mt-0.5 -mr-1 rounded-full flex items-center justify-center text-[#8e8e93] hover:text-[#007aff] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-all cursor-pointer border-0 bg-transparent"
                                title={isRead ? (language === 'en' ? "Mark as Unread" : "မဖတ်ရသေးဟုမှတ်ရန်") : (language === 'en' ? "Mark as Read" : "ဖတ်ပြီးမှတ်သားရန်")}
                              >
                                {isRead ? (
                                  <span className="text-[10px] font-bold opacity-50 hover:opacity-100">↺</span>
                                ) : (
                                  <div className="relative w-3.5 h-3.5 flex items-center justify-center">
                                    <span className="absolute w-1.5 h-1.5 rounded-full bg-[#007aff] group-hover:scale-0 transition-all duration-150" />
                                    <Check className="w-3 h-3 text-[#007aff] scale-0 group-hover:scale-100 transition-all duration-150 absolute" />
                                  </div>
                                )}
                              </button>
                            </div>
                            <p className="text-[#8e8e93] text-[11px] font-normal leading-relaxed">
                              {language === 'my' ? alert.descMy : alert.descEn}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right side: Actual vs Projected Trajectory Path Chart (7 cols) */}
            <div className="xl:col-span-7 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between text-xs text-[#8e8e93] font-medium">
                <span>{language === 'en' ? 'Spending Accumulation Trajectory' : 'အသုံးစရိတ် လမ်းကြောင်း'}</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="w-2.5 h-0.5 bg-[#007aff] rounded-full inline-block" />
                    <span>{language === 'en' ? 'Actual' : 'လက်ရှိ'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="w-2.5 h-0.5 bg-[#af52de] rounded-full border border-dashed inline-block" />
                    <span>{language === 'en' ? 'Projected' : 'ခန့်မှန်း'}</span>
                  </div>
                </div>
              </div>

              <div className="h-52 w-full pt-2 rounded-2xl bg-black/[0.01] dark:bg-white/[0.01] border border-black/[0.03] dark:border-white/[0.03] overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecast.dailyPacingPoints} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5ea" opacity={0.06} />
                    <XAxis dataKey="day" stroke="#8e8e93" fontSize={10} tickLine={false} />
                    <YAxis stroke="#8e8e93" fontSize={10} tickLine={false} />
                    <Tooltip content={<CustomChartTooltip formatAmount={formatAmount} />} />
                    {activeBudgetLimit > 0 && (
                      <ReferenceLine y={activeBudgetLimit} stroke="#ff3b30" strokeDasharray="3 3" strokeOpacity={0.6} label={{ value: language === 'en' ? 'Budget Limit' : 'ဘတ်ဂျက်', fill: '#ff3b30', fontSize: 10, position: 'insideTopLeft' }} />
                    )}
                    <Line name={t('expense')} dataKey="actual" stroke="#007aff" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} connectNulls style={{ outline: 'none' }} isAnimationActive={false} />
                    <Line name={language === 'en' ? 'Projected' : 'ခန့်မှန်း'} dataKey="projected" stroke="#af52de" strokeWidth={2} strokeDasharray="4 4" dot={false} style={{ outline: 'none' }} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
});

