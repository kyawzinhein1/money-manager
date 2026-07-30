import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { SettingsSection } from './SettingsSection';
import { Settings, UserProfile } from '../types';

describe('SettingsSection', () => {
  const mockSettings: Settings = {
    language: 'en',
    currency: 'MMK',
    theme: 'light',
  };

  const mockProfile: UserProfile = {
    name: 'Alex Doe',
    incomeSource: 'Monthly Salary',
    savingsGoal: 'Save 20% of Monthly Income',
    financialFocus: 'Strict Expense Control',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    bio: 'Software engineer',
  };

  const mockT = (key: string) => key;

  it('renders profile card and settings options', () => {
    render(
      <SettingsSection
        t={mockT}
        settings={mockSettings}
        profile={mockProfile}
        transactions={[]}
        budgets={[]}
        incomeCategories={['Salary']}
        expenseCategories={['Food']}
        readAlertIds={[]}
        onUpdateLanguage={vi.fn()}
        onUpdateCurrency={vi.fn()}
        onUpdateTheme={vi.fn()}
        onAddCategory={vi.fn()}
        onDeleteCategory={vi.fn()}
        onEditProfileClick={vi.fn()}
        onExportCSV={vi.fn()}
        onExportPDF={vi.fn()}
        onLoadDemoData={vi.fn()}
        onClearAllData={vi.fn()}
        onRestoreBackup={vi.fn()}
      />
    );

    expect(screen.getByText('Alex Doe')).toBeInTheDocument();
    expect(screen.getByText(/Monthly Salary/)).toBeInTheDocument();
  });

  it('navigates to manage categories view when button clicked', () => {
    render(
      <SettingsSection
        t={mockT}
        settings={mockSettings}
        profile={mockProfile}
        transactions={[]}
        budgets={[]}
        incomeCategories={['Salary']}
        expenseCategories={['Food']}
        readAlertIds={[]}
        onUpdateLanguage={vi.fn()}
        onUpdateCurrency={vi.fn()}
        onUpdateTheme={vi.fn()}
        onAddCategory={vi.fn()}
        onDeleteCategory={vi.fn()}
        onEditProfileClick={vi.fn()}
        onExportCSV={vi.fn()}
        onExportPDF={vi.fn()}
        onLoadDemoData={vi.fn()}
        onClearAllData={vi.fn()}
        onRestoreBackup={vi.fn()}
      />
    );

    const openCategoriesBtn = screen.getByRole('button', { name: /openManageCategories/i });
    fireEvent.click(openCategoriesBtn);

    expect(screen.getAllByTitle('Close Manage Categories')[0]).toBeInTheDocument();
  });
});
