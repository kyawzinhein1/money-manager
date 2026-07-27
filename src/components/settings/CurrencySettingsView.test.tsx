import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CurrencySettingsView } from './CurrencySettingsView';
import { Settings, Currency } from '../../types';

describe('CurrencySettingsView', () => {
  const mockSettings: Settings = {
    language: 'en',
    currency: 'MMK',
    theme: 'light',
  };

  const mockCustomCurrency: Currency = {
    code: 'MMK',
    symbol: 'Ks',
    name: 'Myanmar Kyat',
  };

  const mockPresetCurrencies: Currency[] = [
    { code: 'MMK', symbol: 'Ks', name: 'Myanmar Kyat' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
  ];

  const mockT = (key: string) => key;

  it('renders selected currency correctly', () => {
    render(
      <CurrencySettingsView
        t={mockT}
        settings={mockSettings}
        customCurrency={mockCustomCurrency}
        presetCurrencies={mockPresetCurrencies}
        onUpdateCurrency={vi.fn()}
      />
    );

    expect(screen.getByText('currency')).toBeInTheDocument();
    expect(screen.getByText('MMK - Myanmar Kyat')).toBeInTheDocument();
  });

  it('opens currency dropdown and allows selecting another currency', () => {
    const onUpdateCurrency = vi.fn();
    render(
      <CurrencySettingsView
        t={mockT}
        settings={mockSettings}
        customCurrency={mockCustomCurrency}
        presetCurrencies={mockPresetCurrencies}
        onUpdateCurrency={onUpdateCurrency}
      />
    );

    const dropdownBtn = screen.getByRole('button', { name: /MMK - Myanmar Kyat/i });
    fireEvent.click(dropdownBtn);

    const usdOpt = screen.getByRole('button', { name: /USD/i });
    expect(usdOpt).toBeInTheDocument();

    fireEvent.click(usdOpt);
    expect(onUpdateCurrency).toHaveBeenCalledWith('USD', '$', 'US Dollar');
  });
});
