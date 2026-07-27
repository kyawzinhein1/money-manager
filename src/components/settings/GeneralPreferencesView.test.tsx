import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { GeneralPreferencesView } from './GeneralPreferencesView';
import { Settings } from '../../types';

describe('GeneralPreferencesView', () => {
  const mockSettings: Settings = {
    language: 'en',
    currency: 'MMK',
    theme: 'light',
  };

  const mockT = (key: string) => key;

  it('renders general preferences title and current language', () => {
    render(
      <GeneralPreferencesView
        t={mockT}
        settings={mockSettings}
        onUpdateLanguage={vi.fn()}
        onUpdateTheme={vi.fn()}
      />
    );

    expect(screen.getByText('General Preferences')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('opens language menu and triggers language change', () => {
    const onUpdateLanguage = vi.fn();
    render(
      <GeneralPreferencesView
        t={mockT}
        settings={mockSettings}
        onUpdateLanguage={onUpdateLanguage}
        onUpdateTheme={vi.fn()}
      />
    );

    const langBtn = screen.getByRole('button', { name: /english/i });
    fireEvent.click(langBtn);

    const myanmarOpt = screen.getByRole('button', { name: /မြန်မာ \(Myanmar\)/i });
    expect(myanmarOpt).toBeInTheDocument();

    fireEvent.click(myanmarOpt);
    expect(onUpdateLanguage).toHaveBeenCalledWith('my');
  });

  it('triggers theme changes when theme cards are clicked', () => {
    const onUpdateTheme = vi.fn();
    render(
      <GeneralPreferencesView
        t={mockT}
        settings={mockSettings}
        onUpdateLanguage={vi.fn()}
        onUpdateTheme={onUpdateTheme}
      />
    );

    const darkBtn = screen.getByRole('button', { name: /darkMode/i });
    fireEvent.click(darkBtn);
    expect(onUpdateTheme).toHaveBeenCalledWith('dark');
  });
});
