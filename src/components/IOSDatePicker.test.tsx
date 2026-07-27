import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { IOSDatePicker } from './IOSDatePicker';

describe('IOSDatePicker', () => {
  it('renders date picker with shortcuts and calendar trigger', () => {
    const onChange = vi.fn();
    const todayStr = new Date().toISOString().substring(0, 10);

    render(
      <IOSDatePicker
        value={todayStr}
        onChange={onChange}
        language="en"
      />
    );

    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Yesterday')).toBeInTheDocument();
    expect(screen.getByText('SELECTED DATE')).toBeInTheDocument();

    const yesterdayBtn = screen.getByText('Yesterday');
    fireEvent.click(yesterdayBtn);
    expect(onChange).toHaveBeenCalled();
  });
});
