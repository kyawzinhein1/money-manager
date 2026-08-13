import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CheckUpdatesView } from './CheckUpdatesView';
import { Settings } from '../../types';

describe('CheckUpdatesView', () => {
  const mockT = (key: string) => key;
  const mockSettings: Settings = {
    language: 'en',
    currency: 'USD',
    theme: 'light',
  };

  it('renders update title and close button', () => {
    const onClose = vi.fn();

    render(
      <CheckUpdatesView
        t={mockT}
        settings={mockSettings}
        onClose={onClose}
      />
    );

    expect(screen.getByText('App Updates & Deployment')).toBeInTheDocument();
    expect(screen.getAllByText('v2.1.8')[0]).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('allows checking for updates', async () => {
    const onClose = vi.fn();

    render(
      <CheckUpdatesView
        t={mockT}
        settings={mockSettings}
        onClose={onClose}
      />
    );

    const checkBtn = screen.getByRole('button', { name: /Check for Updates/i });
    fireEvent.click(checkBtn);
    expect(screen.getByText('Checking...')).toBeInTheDocument();
  });
});
