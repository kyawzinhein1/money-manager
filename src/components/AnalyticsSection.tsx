import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart,
  Bar,
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
  Clock
} from 'lucide-react';
import { Transaction, Language } from '../types';
import { TRANSLATIONS, CATEGORY_TRANSLATIONS } from '../translations';

interface AnalyticsSectionProps {
  transactions: Transaction[];
  currencySymbol: string;
  language: Language;
  formatAmount: (amount: number) => string;
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

// Category Icon Map for gorgeous visuals matching BudgetSection
const getCategoryIcon = (category: string) => {
  const norm = category.toLowerCase();
  if (norm.includes('food') || norm.includes('dining') || norm.includes('restaurant')) {
    return <Utensils className="w-3.5 h-3.5" />;
  }
  if (norm.includes('transport') || norm.includes('taxi') || norm.includes('bus') || norm.includes('fuel')) {
    return <Car className="w-3.5 h-3.5" />;
  }
  if (norm.includes('shop') || norm.includes('store') || norm.includes('clothes') || norm.includes('grocery')) {
    return <ShoppingBag className="w-3.5 h-3.5" />;
  }
  if (norm.includes('entertain') || norm.includes('movie') || norm.includes('show') || norm.includes('game')) {
    return <Film className="w-3.5 h-3.5" />;
  }
  if (norm.includes('house') || norm.includes('rent') || norm.includes('room')) {
    return <HomeIcon className="w-3.5 h-3.5" />;
  }
  if (norm.includes('util') || norm.includes('bill') || norm.includes('electric') || norm.includes('water')) {
    return <Zap className="w-3.5 h-3.5" />;
  }
  if (norm.includes('health') || norm.includes('medical') || norm.includes('pharmacy') || norm.includes('doctor')) {
    return <HeartPulse className="w-3.5 h-3.5" />;
  }
  if (norm.includes('educat') || norm.includes('school') || norm.includes('book') || norm.includes('course')) {
    return <GraduationCap className="w-3.5 h-3.5" />;
  }
  return <HelpCircle className="w-3.5 h-3.5" />;
};

// Custom accent colors for categories matching BudgetSection
const getCategoryColorClasses = (category: string, index: number) => {
  const norm = category.toLowerCase();
  const fallbackColor = COLORS[index % COLORS.length];
  
  if (norm.includes('food')) return { bg: 'bg-[#34c759]/10', text: 'text-[#34c759]', border: 'border-[#34c759]/20', fill: '#34c759' };
  if (norm.includes('transport')) return { bg: 'bg-[#007aff]/10', text: 'text-[#007aff]', border: 'border-[#007aff]/20', fill: '#007aff' };
  if (norm.includes('shop')) return { bg: 'bg-[#ff2d55]/10', text: 'text-[#ff2d55]', border: 'border-[#ff2d55]/20', fill: '#ff2d55' };
  if (norm.includes('entertain')) return { bg: 'bg-[#af52de]/10', text: 'text-[#af52de]', border: 'border-[#af52de]/20', fill: '#af52de' };
  if (norm.includes('house')) return { bg: 'bg-[#5856d6]/10', text: 'text-[#5856d6]', border: 'border-[#5856d6]/20', fill: '#5856d6' };
  if (norm.includes('util')) return { bg: 'bg-[#ff9500]/10', text: 'text-[#ff9500]', border: 'border-[#ff9500]/20', fill: '#ff9500' };
  if (norm.includes('health')) return { bg: 'bg-[#ff3b30]/10', text: 'text-[#ff3b30]', border: 'border-[#ff3b30]/20', fill: '#ff3b30' };
  if (norm.includes('educat')) return { bg: 'bg-[#1badf8]/10', text: 'text-[#1badf8]', border: 'border-[#1badf8]/20', fill: '#1badf8' };
  
  return { 
    bg: 'bg-slate-400/10', 
    text: 'text-slate-500 dark:text-slate-400', 
    border: 'border-slate-500/10', 
    fill: fallbackColor 
  };
};

const CustomChartTooltip = ({ active, payload, label, formatAmount }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-white/75 dark:bg-[#1c1c1e]/70 backdrop-blur-2xl border border-white/50 dark:border-white/12 rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_48px_rgba(0,0,0,0.45)] text-[11px] space-y-1.5 min-w-[130px] no-print">
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
              <span className="font-bold font-mono text-[#1c1c1e] dark:text-white">
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
}) => {
  const t = (key: string) => TRANSLATIONS[language][key] || key;
  const tc = (cat: string) => CATEGORY_TRANSLATIONS[language][cat] || cat;

  // Use the globally filtered transactions directly
  const filteredData = transactions;
  
  // Toggle style for daily trend line vs area chart
  const [trendStyle, setTrendStyle] = useState<'area' | 'line'>('area');

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

  // 1. Monthly History (Income vs Expense monthly bars for exactly previous 3 months)
  const monthlyData = useMemo(() => {
    const monthlyGroups: Record<string, { month: string; rawMonth: string; income: number; expense: number }> = {};

    // Generate precisely the current month and previous two months YYYY-MM labels
    const now = new Date();
    const targetMonths: string[] = [];
    for (let i = 2; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      targetMonths.push(`${yyyy}-${mm}`);
    }

    // Initialize monthlyGroups with the 3 target months to guarantee they appear on the chart
    targetMonths.forEach((mStr) => {
      const [y, m] = mStr.split('-');
      const d = new Date(parseInt(y), parseInt(m) - 1, 1);
      const formatMonth = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      monthlyGroups[mStr] = {
        month: formatMonth,
        rawMonth: mStr,
        income: 0,
        expense: 0,
      };
    });

    // Populate transaction totals only if they fall within our target 3 months range
    transactions.forEach((tx) => {
      const monthLabel = tx.date.substring(0, 7); // "YYYY-MM"
      if (monthlyGroups[monthLabel]) {
        if (tx.type === 'income') {
          monthlyGroups[monthLabel].income += tx.amount;
        } else {
          monthlyGroups[monthLabel].expense += tx.amount;
        }
      }
    });

    // Sort chronologically using the rawMonth YYYY-MM label
    return Object.values(monthlyGroups).sort((a, b) => a.rawMonth.localeCompare(b.rawMonth));
  }, [transactions]);

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
          <h2 className="text-xl font-bold tracking-tight text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#007aff]" />
            {t('analytics')}
          </h2>
          <p className="text-xs text-[#8e8e93]">
            {t('trend')} • {language === 'en' ? 'Interactive visual reports' : 'အပြန်အလှန်အကျိုးပြု ငွေကြေးအစီရင်ခံစာများ'}
          </p>
        </div>
      </div>

      {/* Bento Grid Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Net Savings (Left Bento Card) */}
        <div className="ios-glass rounded-[2rem] p-5 shadow-xs flex flex-col justify-between relative overflow-hidden min-h-[155px]">
          <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-[#007aff]/5 filter blur-2xl pointer-events-none -mr-10 -mt-10" />
          
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-[10px] bg-[#007aff]/10 text-[#007aff] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
              {t('netSavings')}
            </span>
            <span className="text-[10px] text-[#8e8e93] font-bold">
              {t('savingRate')}: {summary.savingRate.toFixed(1)}%
            </span>
          </div>

          <div className="relative z-10 my-3">
            <h3 className={`text-2xl font-black font-sans tracking-tight leading-none ${summary.netSavings >= 0 ? 'text-[#34c759]' : 'text-[#ff3b30]'}`}>
              {summary.netSavings < 0 ? '-' : ''}{formatAmount(Math.abs(summary.netSavings))}
            </h3>
          </div>

          {/* Simple relative progress indicator showing visual cashflow state */}
          <div className="relative z-10 w-full pt-1">
            <div className="w-full h-1 bg-[#f2f2f7] dark:bg-[#2c2c2e] rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${summary.netSavings >= 0 ? 'bg-[#34c759]' : 'bg-[#ff3b30]'}`}
                style={{ width: `${Math.min(Math.max(summary.savingRate, 0), 100)}%` }}
              />
            </div>
            <span className="block text-[9px] text-[#8e8e93] pt-1.5 font-bold">
              {language === 'en' ? 'Cashflow safety index' : 'ငွေကြေးလုံခြုံမှု အညွှန်းကိန်း'}
            </span>
          </div>
        </div>

        {/* Total Cash Inflow (Middle Bento Card) */}
        <div className="ios-glass rounded-[2rem] p-5 shadow-xs flex flex-col justify-between relative overflow-hidden min-h-[155px]">
          <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-[#34c759]/5 filter blur-2xl pointer-events-none -mr-10 -mt-10" />
          
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-[10px] bg-[#34c759]/10 text-[#34c759] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              {t('income')}
            </span>
            <span className="text-[10px] text-[#8e8e93] font-bold">
              {filteredData.filter(tx => tx.type === 'income').length} {language === 'en' ? 'entries' : 'ခု'}
            </span>
          </div>

          <div className="relative z-10 my-3">
            <h3 className="text-2xl font-black font-sans tracking-tight leading-none text-[#34c759]">
              {formatAmount(summary.totalIncome)}
            </h3>
          </div>

          <div className="relative z-10 text-[9px] text-[#8e8e93] font-bold">
            {language === 'en' ? 'Total monthly funds received' : 'စုစုပေါင်းလက်ခံရရှိသော ဝင်ငွေ'}
          </div>
        </div>

        {/* Total Cash Outflow (Right Bento Card) */}
        <div className="ios-glass rounded-[2rem] p-5 shadow-xs flex flex-col justify-between relative overflow-hidden min-h-[155px]">
          <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-[#ff3b30]/5 filter blur-2xl pointer-events-none -mr-10 -mt-10" />
          
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-[10px] bg-[#ff3b30]/10 text-[#ff3b30] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider flex items-center gap-1">
              <ArrowDownLeft className="w-3 h-3" />
              {t('expense')}
            </span>
            <span className="text-[10px] text-[#8e8e93] font-bold">
              {filteredData.filter(tx => tx.type === 'expense').length} {language === 'en' ? 'entries' : 'ခု'}
            </span>
          </div>

          <div className="relative z-10 my-3">
            <h3 className="text-2xl font-black font-sans tracking-tight leading-none text-[#ff3b30]">
              {formatAmount(summary.totalExpense)}
            </h3>
          </div>

          <div className="relative z-10 flex items-center justify-between text-[9px] text-[#8e8e93] font-bold">
            <span>{language === 'en' ? 'Disbursed funds' : 'သုံးစွဲပြီးသော အသုံးစရိတ်'}</span>
            {mostExpensiveDay && (
              <span className="text-[#ff3b30] font-mono">
                {language === 'en' ? 'Peak' : 'အများဆုံးနေ့'}: {mostExpensiveDay.date}
              </span>
            )}
          </div>
        </div>
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
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 text-[#8e8e93] font-bold uppercase tracking-wider">
                {language === 'en' ? 'AI Coach' : 'ဉာဏ်ရည်တု အကြံပြုချက်'}
              </span>
            </h4>
            <p className="text-black/75 dark:text-white/75 leading-relaxed font-medium">
              {coachInsight.desc}
            </p>
          </div>
        </div>
      )}

      {/* Charts Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="charts-container">
        
        {/* Interactive Day-by-Day Trend Chart */}
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

          <div className="h-64 w-full pt-2" id="daily-trend-chart">
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
                    <Area type="monotone" name={t('expense')} dataKey="expense" stroke="#ff3b30" strokeWidth={2.5} fillOpacity={1} fill="url(#colorExpense)" style={{ outline: 'none' }} />
                    <Area type="monotone" name={t('income')} dataKey="income" stroke="#34c759" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIncome)" style={{ outline: 'none' }} />
                  </AreaChart>
                ) : (
                  <LineChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5ea" opacity={0.1} />
                    <XAxis dataKey="dateStr" stroke="#8e8e93" fontSize={11} tickLine={false} />
                    <YAxis stroke="#8e8e93" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomChartTooltip formatAmount={formatAmount} />} />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Line type="monotone" name={t('expense')} dataKey="expense" stroke="#ff3b30" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 1 }} activeDot={{ r: 6 }} style={{ outline: 'none' }} />
                    <Line type="monotone" name={t('income')} dataKey="income" stroke="#34c759" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 1 }} activeDot={{ r: 6 }} style={{ outline: 'none' }} />
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
                      >
                        {categoryData.map((entry, index) => {
                          const styleInfo = getCategoryColorClasses(entry.rawName, index);
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
                    <span className="text-xl font-black text-[#1c1c1e] dark:text-white font-mono">
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
                const styleInfo = getCategoryColorClasses(item.rawName, index);
                return (
                  <div key={item.rawName} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-[#1c1c1e] dark:text-[#f2f2f7]">
                      <span className="flex items-center gap-2 font-bold">
                        <div className={`p-1.5 rounded-lg ${styleInfo.bg} ${styleInfo.text} border ${styleInfo.border}`}>
                          {getCategoryIcon(item.rawName)}
                        </div>
                        {item.name}
                      </span>
                      <div className="flex items-center gap-1.5 font-mono">
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

        {/* Monthly Trend History Bar Chart */}
        <div className="p-5 ios-glass rounded-[2rem] space-y-4 lg:col-span-2">
          <h3 className="text-sm font-bold text-[#1c1c1e] dark:text-white flex items-center gap-2">
            <Landmark className="w-4 h-4 text-[#007aff]" />
            {t('incomeVsExpense')} ({language === 'en' ? 'Last 3 Months' : 'နောက်ဆုံး ၃ လ'})
          </h3>
          <div className="h-60 w-full pt-1" id="monthly-bar-chart">
            {monthlyData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[#8e8e93] text-xs">
                {t('noTransactions')}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5ea" opacity={0.1} />
                  <XAxis dataKey="month" stroke="#8e8e93" fontSize={11} tickLine={false} />
                  <YAxis stroke="#8e8e93" fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomChartTooltip formatAmount={formatAmount} />} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar name={t('income')} dataKey="income" fill="#34c759" radius={[6, 6, 0, 0]} style={{ outline: 'none' }} />
                  <Bar name={t('expense')} dataKey="expense" fill="#ff3b30" radius={[6, 6, 0, 0]} style={{ outline: 'none' }} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </div>
  );
});

