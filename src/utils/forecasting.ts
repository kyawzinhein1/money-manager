import { Transaction, Budget } from '../types';
import { findActiveBudget } from './budgetUtils';

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
  pacingStatus: 'exceeded' | 'over_pace' | 'caution' | 'on_track';
  pacingMessageEn: string;
  pacingMessageMy: string;
  actionableAdviceEn: string;
  actionableAdviceMy: string;
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
  // Resolve active month and year for calculations
  const today = new Date();
  const currentYearNum = today.getFullYear();
  const currentMonthNum = today.getMonth() + 1; // 1-indexed

  const targetYear = selectedYear === 'all' ? currentYearNum : (parseInt(selectedYear) || currentYearNum);
  const targetMonth = selectedMonth === 'all' ? currentMonthNum : (parseInt(selectedMonth) || currentMonthNum);

  const activeBudget = findActiveBudget(budgets, targetMonth.toString(), targetYear.toString());
  const budgetLimit = activeBudget ? activeBudget.limit : 0;

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
    daysElapsed = Math.max(1, today.getDate());
  } else if (!isPastMonth) {
    // Future month
    daysElapsed = 1;
  }

  const daysRemaining = Math.max(1, daysInMonth - daysElapsed + (isCurrentMonth ? 1 : 0));

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
  const dailyAllowanceRemaining = !isExceeded && remaining > 0 ? remaining / daysRemaining : 0;

  // Practical Hybrid Projection:
  // Early in current month (days 1-10), large single-day expenses (like rent or tuition) distort daily average.
  // We use a smooth weighted blend between actual daily pace and target daily pacing.
  let projectedSpent = totalSpent;
  if (isPastMonth) {
    projectedSpent = totalSpent;
  } else if (isCurrentMonth) {
    if (budgetLimit > 0) {
      const weightActual = Math.min(1.0, daysElapsed / 12);
      const effectiveVariableDailyPace = (currentDailyAvgSpent * weightActual) + (dailyLimitAllowed * (1 - weightActual));
      const futureDays = Math.max(0, daysInMonth - daysElapsed);
      projectedSpent = Math.round(totalSpent + (effectiveVariableDailyPace * futureDays));
    } else {
      const futureDays = Math.max(0, daysInMonth - daysElapsed);
      projectedSpent = Math.round(totalSpent + (currentDailyAvgSpent * futureDays));
    }
  }

  // Estimate breach day
  let estimatedBreachDay: number | null = null;
  if (budgetLimit > 0 && currentDailyAvgSpent > 0 && projectedSpent > budgetLimit && !isPastMonth && !isExceeded) {
    const estimatedDay = Math.ceil(budgetLimit / currentDailyAvgSpent);
    estimatedBreachDay = Math.min(daysInMonth, Math.max(daysElapsed, estimatedDay));
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

  // Pacing status & Actionable Advice
  let pacingStatus: 'exceeded' | 'over_pace' | 'caution' | 'on_track' = 'on_track';
  let pacingMessageEn = 'You are spending well within your daily budget limit.';
  let pacingMessageMy = 'သင်၏ သုံးစွဲမှုသည် သတ်မှတ်ဘတ်ဂျက် စံနှုန်းအတွင်း စည်းကမ်းတကျ ရှိပါသည်။';
  let actionableAdviceEn = budgetLimit > 0
    ? `Target spending under ${formatAmount(dailyAllowanceRemaining)}/day for the next ${daysRemaining} days.`
    : `Average daily spend is currently ${formatAmount(currentDailyAvgSpent)}/day.`;
  let actionableAdviceMy = budgetLimit > 0
    ? `ကျန်ရှိသော ${daysRemaining} ရက်အတွက် တစ်နေ့လျှင် ${formatAmount(dailyAllowanceRemaining)} အောက် သုံးစွဲပါ။`
    : `လက်ရှိတစ်နေ့ ပျမ်းမျှသုံးစွဲမှုမှာ ${formatAmount(currentDailyAvgSpent)} ဖြစ်ပါသည်။`;

  if (isExceeded) {
    pacingStatus = 'exceeded';
    pacingMessageEn = `Budget exceeded by ${formatAmount(Math.abs(remaining))}.`;
    pacingMessageMy = `ဘတ်ဂျက်ထက် ${formatAmount(Math.abs(remaining))} ပိုမိုသုံးစွဲမိပြီး ဖြစ်သည်။`;
    actionableAdviceEn = `Pause non-essential expenses for the remainder of this month.`;
    actionableAdviceMy = `မလိုအပ်သော အပိုသုံးစရိတ်များကို ရပ်တန့်ထားရန် အကြံပြုပါသည်။`;
  } else if (budgetLimit > 0 && projectedSpent > budgetLimit) {
    pacingStatus = 'over_pace';
    pacingMessageEn = `Projected to breach budget by ~${formatAmount(projectedSpent - budgetLimit)} at current velocity.`;
    pacingMessageMy = `လက်ရှိအရှိန်အတိုင်းဆိုပါက လကုန်တွင် ~${formatAmount(projectedSpent - budgetLimit)} ခန့် ကျော်လွန်နိုင်ပါသည်။`;
    actionableAdviceEn = `Reduce daily variable spend to ${formatAmount(dailyAllowanceRemaining)}/day to stay safe.`;
    actionableAdviceMy = `ဘတ်ဂျက်မကျော်စေရန် ကျန်ရက်များတွင် တစ်နေ့လျှင် ${formatAmount(dailyAllowanceRemaining)} ထက် မပိုအောင် ထိန်းသုံးပါ။`;
  } else if (budgetLimit > 0 && percent >= 75) {
    pacingStatus = 'caution';
    pacingMessageEn = `You have used ${percent.toFixed(0)}% of your monthly budget.`;
    pacingMessageMy = `လစဉ်ဘတ်ဂျက်၏ ${percent.toFixed(0)}% အသုံးပြုပြီးဖြစ်သည်။`;
    actionableAdviceEn = `Keep daily spending around ${formatAmount(dailyAllowanceRemaining)}/day to keep a safety buffer.`;
    actionableAdviceMy = `ဘတ်ဂျက်လုံလောက်စေရန် တစ်နေ့လျှင် ${formatAmount(dailyAllowanceRemaining)} ဝန်းကျင်သာ သုံးစွဲပါ။`;
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

  const remainingDaysCount = Math.max(1, daysInMonth - daysElapsed);
  const projectedFutureDailyPace = budgetLimit > 0
    ? Math.max(0, (projectedSpent - totalSpent) / remainingDaysCount)
    : currentDailyAvgSpent;

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
      cumProj += projectedFutureDailyPace;
      dailyPacingPoints.push({
        day: d,
        actual: null,
        projected: Math.round(cumProj)
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
        descEn: `Caution: Spending has reached ${percent.toFixed(0)}% of your limit. Target ${formatAmount(dailyAllowanceRemaining)}/day for remaining days.`,
        descMy: `သတိပြုရန် - သင့်အသုံးစရိတ်သည် ဘတ်ဂျက်၏ ${percent.toFixed(0)}% သို့ ရောက်ရှိနေပြီဖြစ်သည်။ ကျန်ရက်များတွင် တစ်နေ့လျှင် ${formatAmount(dailyAllowanceRemaining)} ဖြင့် ထိန်းသုံးပါ။`
      });
    } else if (percent >= 50) {
      alerts.push({
        id: 'budget_half_50',
        type: 'info',
        titleEn: '50% Budget Milestone',
        titleMy: 'ဘတ်ဂျက် တစ်ဝက် သုံးစွဲပြီးမှု',
        descEn: `Note: You have utilized half (${percent.toFixed(0)}%) of your allocated monthly limit.`,
        descMy: `မှတ်ချက် - သင့်သတ်မှတ်ဘတ်ဂျက်၏ တစ်ဝက်တိတိ (${percent.toFixed(0)}%) ကို သုံးစွဲပြီး ဖြစ်သည်။`
      });
    }

    // 2. Velocity / Burn Rate Check
    if (!isExceeded && currentDailyAvgSpent > dailyLimitAllowed * 1.15 && percent < 100 && !isPastMonth && daysElapsed >= 3) {
      alerts.push({
        id: 'burn_rate_high',
        type: 'warning',
        titleEn: 'High Spending Pace',
        titleMy: 'အသုံးစရိတ်အရှိန် မြင့်မားနေသည်',
        descEn: `Pacing Alert: Daily burn rate of ${formatAmount(currentDailyAvgSpent)}/day exceeds recommended target of ${formatAmount(dailyLimitAllowed)}/day.`,
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
        descEn: `Forecast indicates you will breach budget around Day ${estimatedBreachDay} if spending continues at this speed. Recommended daily target: ${formatAmount(dailyAllowanceRemaining)}/day.`,
        descMy: `ခန့်မှန်းချက်အရ လက်ရှိအတိုင်း သုံးစွဲပါက ရက်စွဲ (${estimatedBreachDay}) ဝန်းကျင်တွင် ဘတ်ဂျက်ကျော်လွန်နိုင်ပါသည်။ တစ်နေ့လျှင် ${formatAmount(dailyAllowanceRemaining)} အောက် လျှော့သုံးပါ။`
      });
    }

    // 4. Stable Savings encouragement
    if (!isExceeded && projectedSpent <= budgetLimit && percent > 15 && !isPastMonth) {
      alerts.push({
        id: 'on_track_saving',
        type: 'success',
        titleEn: 'On Track & Under Budget',
        titleMy: 'သုံးစွဲမှု စည်းကမ်းကောင်းမွန်သည်',
        descEn: `Great control! Pacing comfortably under budget. Estimated month-end surplus: ${formatAmount(budgetLimit - projectedSpent)}.`,
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
          titleEn: 'High Category Concentration',
          titleMy: 'ကဏ္ဍတစ်ခုတည်း၌ စုပြုံသုံးစွဲမှု',
          descEn: `"${cat}" represents ${catPercent.toFixed(0)}% of total monthly spending (${formatAmount(amt)}).`,
          descMy: `"${cat}" ကဏ္ဍသည် စုစုပေါင်းသုံးစွဲမှု၏ ${catPercent.toFixed(0)}% (${formatAmount(amt)}) အထိ ယူထားသည်။`
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
    pacingStatus,
    pacingMessageEn,
    pacingMessageMy,
    actionableAdviceEn,
    actionableAdviceMy,
    alerts,
    dailyPacingPoints
  };
}

