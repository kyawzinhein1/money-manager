import React from 'react';
import { FileDown } from 'lucide-react';

interface ExportDataViewProps {
  t: (key: string) => string;
  onExportCSV: () => void;
  onExportPDF: () => void;
}

export const ExportDataView: React.FC<ExportDataViewProps> = ({
  t,
  onExportCSV,
  onExportPDF,
}) => {
  return (
    <div className="p-5 ios-glass rounded-[2rem] space-y-4">
      <h3 className="text-sm font-bold text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
        <FileDown className="w-4 h-4 text-[#34c759]" />
        {t('exportData')}
      </h3>
      <p className="text-xs text-[#8e8e93]">
        Download your transactions and budgets in highly standard, portable formats for bookkeeping, accounting, or physical filing.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          id="export-csv-btn"
          onClick={onExportCSV}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-[#34c759] hover:bg-[#30b753] text-white rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-xs border-0"
        >
          <FileDown className="w-4 h-4" />
          {t('exportCSV')}
        </button>
        <button
          id="export-pdf-btn"
          onClick={onExportPDF}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-[#007aff] hover:bg-[#0071eb] text-white rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-xs border-0"
        >
          <FileDown className="w-4 h-4" />
          {t('exportPDF')}
        </button>
      </div>
    </div>
  );
};
