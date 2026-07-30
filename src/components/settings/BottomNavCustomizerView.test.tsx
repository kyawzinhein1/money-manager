import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BottomNavCustomizerView } from './BottomNavCustomizerView';
import { Settings, DEFAULT_NAVBAR_SETTINGS } from '../../types';

describe('BottomNavCustomizerView', () => {
  const mockSettings: Settings = {
    language: 'en',
    currency: 'MMK',
    theme: 'light',
    navbarSettings: DEFAULT_NAVBAR_SETTINGS,
  };

  const mockT = (key: string) => key;
  const mockOnUpdate = vi.fn();
  const mockOnClose = vi.fn();

  it('renders the navbar customizer view title and live preview', () => {
    render(
      <BottomNavCustomizerView
        t={mockT}
        settings={mockSettings}
        onUpdateNavbarSettings={mockOnUpdate}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Customize Bottom Navigation Bar/i)).toBeInTheDocument();
    expect(screen.getByText(/Live Interactive Preview/i)).toBeInTheDocument();
  });

  it('calls onUpdateNavbarSettings when changing opacity slider', () => {
    render(
      <BottomNavCustomizerView
        t={mockT}
        settings={mockSettings}
        onUpdateNavbarSettings={mockOnUpdate}
        onClose={mockOnClose}
      />
    );

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '50' } });

    expect(mockOnUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ opacity: 50 })
    );
  });
});
