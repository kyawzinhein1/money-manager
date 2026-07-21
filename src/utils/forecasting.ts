import { Transaction, Budget } from '../types';

export interface SmartAlert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  titleEn: string;
  titleMy: string;
  descEn: string;
  descMy: string;
  category?: string;
  metric?: string;
}

export interface ForecastReport {
  totalSpent: number;
  daysElapsed: number;
  daysInMonth: number;
  dailyAllowanceRemaining: number;
  currentDailyAvgSpent: number;
  dailyLimitAllowed: number;
  projectedSpent: number;
  remaining: number;
  isExceeded: boolean;
  percent: number;
  estimatedBreachDay: number | null;
  forecastAccuracy: 'high' | 'medium' | 'low';
  alerts: SmartAlert[];
  dailyPacingPoints: { day: number; actual: number | null; projected: number }[];
}

export function generateForecastReport(
  transactions: Transaction[],
  budgets: Budget[],
  selectedMonth: string,
  selectedYear: string,
  formatAmount: (amount: number) => string
): ForecastReport {
  const activeBudget = budgets[0] || null;
  const budgetLimit = activeBudget ? activeBudget.limit : 0;

  // Resolve active month and year for calculations (fallback to current today if 'all' is selected)
  const today = new Date();
  const currentYearNum = today.getFullYear();
  const currentMonthNum = today.getMonth() + 1; // 1-indexed

  const targetYear = selectedYear === 'all' ? currentYearNum : (parseInt(selectedYear) || currentYearNum);
  const targetMonth = selectedMonth === 'all' ? currentMonthNum : (parseInt(selectedMonth) || currentMonthNum);

  const getDaysInMonth = (y: number, m: number) => {
    return new Date(y, m, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(targetYear, targetMonth);

  // Check if we are examining the active current month
  const isCurrentMonth = targetYear === currentYearNum && targetMonth === currentMonthNum;
  const isPastMonth = targetYear < currentYearNum || (targetYear === currentYearNum && targetMonth < currentMonthNum);

  // Calculate elapsed days
  let daysElapsed = daysInMonth;
  if (isCurrentMonth) {
    daysElapsed = today.getDate();
  } else if (!isPastMonth) {
    // Future month
    daysElapsed = 1;
  }

  // Filter transactions for this specific month/year
  const monthStr = targetMonth.toString().padStart(2, '0');
  const yearStr = targetYear.toString();
  const monthPrefix = `${yearStr}-${monthStr}`;

  const monthExpenses = transactions.filter(
    (tx) => tx.type === 'expense' && tx.date.startsWith(monthPrefix)
  );

  const totalSpent = monthExpenses.reduce((sum, tx) => sum + tx.amount, 0);
  const remaining = budgetLimit - totalSpent;
  const isExceeded = totalSpent > budgetLimit;
  const percent = budgetLimit > 0 ? (totalSpent / budgetLimit) * 100 : 0;

  // Daily pacing calculations
  const dailyLimitAllowed = budgetLimit > 0 ? budgetLimit / daysInMonth : 0;
  const currentDailyAvgSpent = totalSpent / daysElapsed;
  const daysRemaining = Math.max(1, daysInMonth - daysElapsed + 1);
  const dailyAllowanceRemaining = !isExceeded && remaining > 0 ? remaining / daysRemaining : 0;

  // Linear Run-rate pacing projection
  const projectedSpent = budgetLimit > 0 
    ? (isCurrentMonth ? currentDailyAvgSpent * daysInMonth : totalSpent)
    : totalSpent;

  // Estimate breach day
  let estimatedBreachDay: number | null = null;
  if (budgetLimit > 0 && currentDailyAvgSpent > 0 && projectedSpent > budgetLimit && !isPastMonth) {
    const estimatedDay = Math.ceil(budgetLimit / currentDailyAvgSpent);
    estimatedBreachDay = Math.min(daysInMonth, Math.max(1, estimatedDay));
  }

  // Forecast accuracy estimation based on days of data gathered
  let forecastAccuracy: 'high' | 'medium' | 'low' = 'low';
  if (isPastMonth) {
    forecastAccuracy = 'high';
  } else if (isCurrentMonth) {
    if (daysElapsed > 20) forecastAccuracy = 'high';
    else if (daysElapsed >= 8) forecastAccuracy = 'medium';
    else forecastAccuracy = 'low';
  }

  // Create projection trajectory points for charts
  const dailyPacingPoints: { day: number; actual: number | null; projected: number }[] = [];
  let cumActual = 0;
  let cumProj = 0;

  // Map expenses by day
  const dailyExpenseMap: Record<number, number> = {};
  monthExpenses.forEach((tx) => {
    const day = parseInt(tx.date.substring(8, 10));
    if (!isNaN(day)) {
      dailyExpenseMap[day] = (dailyExpenseMap[day] || 0) + tx.amount;
    }
  });

  for (let d = 1; d <= daysInMonth; d++) {
    const dayActual = dailyExpenseMap[d] || 0;
    cumActual += dayActual;

    if (d <= daysElapsed) {
      cumProj = cumActual;
      dailyPacingPoints.push({
        day: d,
        actual: cumActual,
        projected: cumProj
      });
    } else {
      // Future projection
      cumProj += currentDailyAvgSpent;
      dailyPacingPoints.push({
        day: d,
        actual: null,
        projected: cumProj
      });
    }
  }

  // Generate intelligent alarms and alerts
  const alerts: SmartAlert[] = [];

  if (budgetLimit > 0) {
    // 1. Budget breach / critical limits
    if (isExceeded) {
      alerts.push({
        id: 'budget_exceeded',
        type: 'critical',
        titleEn: 'Budget Exceeded!',
        titleMy: 'သတ်မှတ်ဘတ်ဂျက် ကျော်လွန်သွားပါပြီ!',
        descEn: `Alert: You are over your monthly budget limit of ${formatAmount(budgetLimit)} by ${formatAmount(Math.abs(remaining))}. We highly recommend freezing non-essential spending.`,
        descMy: `သတိပေးချက် - သင့်လစဉ်ဘတ်ဂျက် ${formatAmount(budgetLimit)} ထက် ${formatAmount(Math.abs(remaining))} ပိုမိုအသုံးပြုမိသွားပြီ ဖြစ်သည်။ မလိုအပ်သောအသုံးစရိတ်များကို အမြန်ဆုံး လျှော့ချပါ။`
      });
    } else if (percent >= 90) {
      alerts.push({
        id: 'budget_critical_90',
        type: 'critical',
        titleEn: 'Critical Budget Usage (90%+)',
        titleMy: 'ဘတ်ဂျက်အခြေအနေ အလွန်စိုးရိမ်ရသည် (၉၀%ကျော်)',
        descEn: `Critical warning: You have utilized ${percent.toFixed(0)}% of your allowance. Only ${formatAmount(remaining)} is left for the remaining ${daysRemaining} days.`,
        descMy: `အလွန်စိုးရိမ်ရသော သတိပေးချက် - သင့်ဘတ်ဂျက်၏ ${percent.toFixed(0)}% အသုံးပြုပြီးပါပြီ။ ကျန်ရှိသော ${daysRemaining} ရက်အတွက် ${formatAmount(remaining)} သာ ကျန်ပါတော့သည်။`
      });
    } else if (percent >= 75) {
      alerts.push({
        id: 'budget_caution_75',
        type: 'warning',
        titleEn: 'Budget Caution Alert (75%+)',
        titleMy: 'ဘတ်ဂျက်အခြေအနေ သတိပြုရန် (၇၅%ကျော်)',
        descEn: `Caution: Spending has reached ${percent.toFixed(0)}% of your limit. Consider scaling down discretionary items.`,
        descMy: `သတိပြုရန် - သင့်အသုံးစရိတ်သည် ဘတ်ဂျက်၏ ${percent.toFixed(0)}% သို့ ရောက်ရှိနေပြီဖြစ်သည်။ မလိုအပ်သည်များကို လျှော့ချသုံးစွဲရန် အကြံပြုပါသည်။`
      });
    } else if (percent >= 50) {
      alerts.push({
        id: 'budget_half_50',
        type: 'info',
        titleEn: '50% Budget Milestone',
        titleMy: 'ဘတ်ဂျက် တစ်ဝက် သုံးစွဲပြီးမှု',
        descEn: `Note: You have utilized exactly half (${percent.toFixed(0)}%) of your allocated monthly limit.`,
        descMy: `မှတ်ချက် - သင့်သတ်မှတ်ဘတ်ဂျက်၏ တစ်ဝက်တိတိ (${percent.toFixed(0)}%) ကို သုံးစွဲပြီး ဖြစ်သည်။`
      });
    }

    // 2. Velocity / Burn Rate Check
    if (!isExceeded && currentDailyAvgSpent > dailyLimitAllowed && percent < 100 && !isPastMonth) {
      alerts.push({
        id: 'burn_rate_high',
        type: 'warning',
        titleEn: 'High Velocity (Daily Burn Rate)',
        titleMy: 'အသုံးစရိတ်အရှိန် မြင့်မားနေသည်',
        descEn: `Pacing Alert: Your current daily average of ${formatAmount(currentDailyAvgSpent)}/day is higher than the recommended daily target of ${formatAmount(dailyLimitAllowed)}/day.`,
        descMy: `အရှိန်သတိပေးချက် - လက်ရှိတစ်နေ့ပျမ်းမျှသုံးစရိတ် ${formatAmount(currentDailyAvgSpent)} သည် စံနှုန်းဖြစ်သော ${formatAmount(dailyLimitAllowed)} ထက် မြင့်မားနေပါသည်။`
      });
    }

    // 3. Pacing Projection Alert
    if (!isExceeded && projectedSpent > budgetLimit && estimatedBreachDay && !isPastMonth) {
      alerts.push({
        id: 'pacing_projection_breach',
        type: 'critical',
        titleEn: 'Projected Budget Breach',
        titleMy: 'လကုန်၌ ဘတ်ဂျက်ကျော်လွန်နိုင်မှု',
        descEn: `Pacing forecast indicates you will exceed your budget around Day ${estimatedBreachDay} of this month at the current spending velocity. Try limiting daily spend to ${formatAmount(dailyAllowanceRemaining)}/day.`,
        descMy: `ခန့်မှန်းချက်အရ လက်ရှိသုံးစွဲမှုအရှိန်အတိုင်းဆိုပါက ဤလ၏ ရက်စွဲ (${estimatedBreachDay}) ဝန်းကျင်တွင် ဘတ်ဂျက်ကျော်လွန်သွားနိုင်ပါသည်။ တစ်နေ့လျှင် ${formatAmount(dailyAllowanceRemaining)} ထက် မပိုအောင် ထိန်းသုံးပါ။`
      });
    }

    // 4. Stable Savings encouragement
    if (!isExceeded && projectedSpent <= budgetLimit && percent > 15 && !isPastMonth) {
      alerts.push({
        id: 'on_track_saving',
        type: 'success',
        titleEn: 'Excellent Spending Control',
        titleMy: 'သုံးစွဲမှု စည်းကမ်းကောင်းမွန်သည်',
        descEn: `Great job! You are pacing well under limit and projected to save ${formatAmount(budgetLimit - projectedSpent)} of your budget this month.`,
        descMy: `အလွန်တော်ပါသည်! လက်ရှိသုံးစွဲမှုသည် ဘတ်ဂျက်အောက်တွင် ရှိနေပြီး လကုန်ပါက ${formatAmount(budgetLimit - projectedSpent)} ဝန်းကျင် ပိုလျှံစုဆောင်းနိုင်မည်ဖြစ်သည်။`
      });
    }
  }

  // 5. Category Concentration Warning (if any single category consumes > 45% of total expense)
  const categorySpentMap: Record<string, number> = {};
  monthExpenses.forEach((tx) => {
    categorySpentMap[tx.category] = (categorySpentMap[tx.category] || 0) + tx.amount;
  });

  if (totalSpent > 0) {
    Object.entries(categorySpentMap).forEach(([cat, amt]) => {
      const catPercent = (amt / totalSpent) * 100;
      if (catPercent >= 45) {
        alerts.push({
          id: `concentration_${cat}`,
          type: 'warning',
          titleEn: 'Concentrated Category Spending',
          titleMy: 'ကဏ္ဍတစ်ခုတည်း၌ စုပြုံသုံးစွဲမှု',
          descEn: `Category Concentration: "${cat}" consumes ${catPercent.toFixed(0)}% of your entire spending. Try diversifying or limiting expenses in this area.`,
          descMy: `ကဏ္ဍစုပြုံမှုသတိပေးချက် - "${cat}" ကဏ္ဍသည် စုစုပေါင်းသုံးစွဲမှု၏ ${catPercent.toFixed(0)}% အထိ ယူထားသည်။ ဤကဏ္ဍရှိ သုံးစွဲမှုများကို လျှော့ချရန် စဉ်းစားပါ။`
        });
      }
    });
  }

  return {
    totalSpent,
    daysElapsed,
    daysInMonth,
    dailyAllowanceRemaining,
    currentDailyAvgSpent,
    dailyLimitAllowed,
    projectedSpent,
    remaining,
    isExceeded,
    percent,
    estimatedBreachDay,
    forecastAccuracy,
    alerts,
    dailyPacingPoints
  };
}
