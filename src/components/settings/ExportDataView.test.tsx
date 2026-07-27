import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ExportDataView } from './ExportDataView';

describe('ExportDataView', () => {
  const mockT = (key: string) => key;

  it('renders export buttons and fires handlers', () => {
    const onExportCSV = vi.fn();
    const onExportPDF = vi.fn();

    render(
      <ExportDataView
        t={mockT}
        onExportCSV={onExportCSV}
        onExportPDF={onExportPDF}
      />
    );

    expect(screen.getByText('exportData')).toBeInTheDocument();

    const csvBtn = screen.getByRole('button', { name: /exportCSV/i });
    const pdfBtn = screen.getByRole('button', { name: /exportPDF/i });

    fireEvent.click(csvBtn);
    expect(onExportCSV).toHaveBeenCalledTimes(1);

    fireEvent.click(pdfBtn);
    expect(onExportPDF).toHaveBeenCalledTimes(1);
  });
});
