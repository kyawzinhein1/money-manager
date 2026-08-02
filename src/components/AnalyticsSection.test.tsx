import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AnalyticsSection } from './AnalyticsSection';
import { Transaction, Budget } from '../types';

// Mock Recharts ResponsiveContainer for jsdom
vi.mock('recharts', async () => {
  const original = await vi.importActual('recharts');
  return {
    ...original,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: '800px', height: '400px' }}>{children}</div>
    ),
  };
});

describe('AnalyticsSection', () => {
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      type: 'expense',
      amount: 15000,
      category: 'Food',
      date: '2026-07-15',
      description: 'Dinner'
    },
    {
      id: '2',
      type: 'income',
      amount: 200000,
      category: 'Salary',
      date: '2026-07-01',
      description: 'Salary'
    }
  ];

  const mockBudgets: Budget[] = [
    { category: 'Food', limit: 300000 }
  ];

  const defaultProps = {
    transactions: mockTransactions,
    currencySymbol: 'Ks',
    language: 'en' as const,
    formatAmount: (amt: number) => `${amt} Ks`,
    budgets: mockBudgets,
    selectedMonth: '07',
    selectedYear: '2026',
    readAlertIds: [],
    toggleReadAlert: vi.fn(),
  };

  it('renders analytics title and summary card', () => {
    render(<AnalyticsSection {...defaultProps} />);
    expect(screen.getByText('Cash Flow Summary')).toBeInTheDocument();
  });

  it('summary card is collapsed by default and expands on clicking Expand button', () => {
    render(<AnalyticsSection {...defaultProps} />);
    const toggleButton = screen.getByRole('button', { name: /Expand Summary|Collapse Summary/i });
    expect(toggleButton).toHaveTextContent('Expand');

    // Click to expand
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveTextContent('Collapse');

    // Click to collapse back
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveTextContent('Expand');
  });

  it('renders correctly with custom date range filters', () => {
    render(
      <AnalyticsSection
        {...defaultProps}
        dateFilterMode="dateRange"
        startDate="2026-05-01"
        endDate="2026-08-15"
      />
    );
    expect(screen.getByText('Cash Flow Summary')).toBeInTheDocument();
  });
});
