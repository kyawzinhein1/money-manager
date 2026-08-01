import { Budget } from '../types';

export function findActiveBudget(
  budgets: Budget[],
  monthStr: string,
  yearStr: string
): Budget | null {
  if (!budgets || budgets.length === 0) return null;

  if (!yearStr || yearStr === 'all' || !monthStr || monthStr === 'all') {
    return budgets.find(b => !b.month) || budgets[0] || null;
  }

  const mNum = parseInt(monthStr, 10);
  const yNum = parseInt(yearStr, 10);
  if (isNaN(mNum) || isNaN(yNum)) {
    return budgets.find(b => !b.month) || budgets[0] || null;
  }

  const padMonth = String(mNum).padStart(2, '0');
  const targetMonthKey = `${yNum}-${padMonth}`;
  const monthStart = `${targetMonthKey}-01`;
  const lastDay = new Date(yNum, mNum, 0).getDate();
  const monthEnd = `${targetMonthKey}-${String(lastDay).padStart(2, '0')}`;

  // 1. Direct month key match
  const exact = budgets.find(b => b.month === targetMonthKey);
  if (exact) return exact;

  // 2. Custom date range match overlapping target month
  const custom = budgets.find(b => {
    if (b.startDate && b.endDate) {
      return b.startDate <= monthEnd && b.endDate >= monthStart;
    }
    return false;
  });
  if (custom) return custom;

  // 3. Fallback budget without specific month
  const fallback = budgets.find(b => !b.month);
  if (fallback) return fallback;

  return null;
}
