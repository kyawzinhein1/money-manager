import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NotificationsSection } from './NotificationsSection';
import { ForecastReport } from '../utils/forecasting';

describe('NotificationsSection', () => {
  const mockForecastReport: ForecastReport = {
    totalSpent: 120000,
    daysElapsed: 15,
    daysInMonth: 30,
    dailyAllowanceRemaining: 5000,
    currentDailyAvgSpent: 8000,
    dailyLimitAllowed: 6666,
    projectedSpent: 240000,
    remaining: 80000,
    isExceeded: false,
    percent: 60,
    estimatedBreachDay: null,
    forecastAccuracy: 'high',
    alerts: [
      {
        id: 'test_alert_1',
        type: 'warning',
        titleEn: 'Food Category High',
        titleMy: 'အထွေထွေ အသုံးများနေသည်',
        descEn: 'You spent 60% on Food.',
        descMy: 'အစာအသောက်တွင် ၆၀% သုံးစွဲထားသည်။',
        category: 'Food',
      },
    ],
    dailyPacingPoints: [],
  };

  const defaultProps = {
    forecastReport: mockForecastReport,
    readAlertIds: [],
    markAllAlertsAsRead: vi.fn(),
    markAllAlertsAsUnread: vi.fn(),
    toggleReadAlert: vi.fn(),
    language: 'en' as const,
    onClose: vi.fn(),
    onNavigateToBudgets: vi.fn(),
    formatAmount: (val: number) => `$${val}`,
  };

  it('renders title and alerts correctly', () => {
    render(<NotificationsSection {...defaultProps} />);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Food Category High')).toBeInTheDocument();
    expect(screen.getByText('You spent 60% on Food.')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<NotificationsSection {...defaultProps} />);
    const closeBtn = document.getElementById('close-notifications-btn');
    expect(closeBtn).not.toBeNull();
    if (closeBtn) {
      fireEvent.click(closeBtn);
      expect(defaultProps.onClose).toHaveBeenCalled();
    }
  });

  it('calls onNavigateToBudgets when view budgets button is clicked', () => {
    render(<NotificationsSection {...defaultProps} />);
    const viewBtn = document.getElementById('notification-view-budgets-btn');
    expect(viewBtn).not.toBeNull();
    if (viewBtn) {
      fireEvent.click(viewBtn);
      expect(defaultProps.onNavigateToBudgets).toHaveBeenCalled();
    }
  });
});
