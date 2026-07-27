import { describe, it, expect } from 'vitest';
import { generateForecastReport } from './forecasting';
import { Transaction, Budget } from '../types';

describe('generateForecastReport', () => {
  const dummyTransactions: Transaction[] = [
    {
      id: '1',
      type: 'expense',
      amount: 50000,
      category: 'Food',
      date: '2026-07-05',
      description: 'Lunch & Dinner'
    },
    {
      id: '2',
      type: 'expense',
      amount: 30000,
      category: 'Shopping',
      date: '2026-07-10',
      description: 'Clothes'
    },
    {
      id: '3',
      type: 'income',
      amount: 500000,
      category: 'Salary',
      date: '2026-07-01',
      description: 'July Salary'
    }
  ];

  const dummyBudgets: Budget[] = [
    {
      category: 'Food',
      limit: 100000
    }
  ];

  const formatAmount = (amt: number) => `${amt} MMK`;

  it('calculates total expense accurately for given month', () => {
    const report = generateForecastReport(dummyTransactions, dummyBudgets, '07', '2026', formatAmount);
    expect(report.totalSpent).toBe(80000);
    expect(report.remaining).toBe(20000);
    expect(report.isExceeded).toBe(false);
    expect(report.percent).toBe(80);
  });

  it('triggers budget_caution_75 alert when spending >= 75%', () => {
    const report = generateForecastReport(dummyTransactions, dummyBudgets, '07', '2026', formatAmount);
    const cautionAlert = report.alerts.find(a => a.id === 'budget_caution_75');
    expect(cautionAlert).toBeDefined();
    expect(cautionAlert?.type).toBe('warning');
  });

  it('detects when budget is exceeded', () => {
    const smallBudget: Budget[] = [{ category: 'Food', limit: 50000 }];
    const report = generateForecastReport(dummyTransactions, smallBudget, '07', '2026', formatAmount);
    expect(report.isExceeded).toBe(true);
    expect(report.remaining).toBe(-30000);
    const exceededAlert = report.alerts.find(a => a.id === 'budget_exceeded');
    expect(exceededAlert).toBeDefined();
    expect(exceededAlert?.type).toBe('critical');
  });

  it('triggers category concentration alert if a category accounts for >= 45% of total spend', () => {
    const report = generateForecastReport(dummyTransactions, dummyBudgets, '07', '2026', formatAmount);
    // Food = 50,000 out of 80,000 = 62.5%
    const foodAlert = report.alerts.find(a => a.id === 'concentration_Food');
    expect(foodAlert).toBeDefined();
    expect(foodAlert?.type).toBe('warning');
  });
});
