import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Transaction } from '../../types';
import { CategoryStyle } from '../../utils/categoryStyle';
import { getCategoryIcon } from '../../utils/categoryIcon';

export interface TransactionCardItemProps {
  tx: Transaction;
  formattedDate: string;
  categoryStyle: CategoryStyle;
  translatedCategory: string;
  formattedAmount: string;
  categoryIcons?: Record<string, string>;
  onClick: (tx: Transaction) => void;
}

export const TransactionCardItem: React.FC<TransactionCardItemProps> = React.memo(({
  tx,
  categoryStyle,
  translatedCategory,
  formattedAmount,
  categoryIcons,
  onClick
}) => {
  const CategoryIcon = getCategoryIcon(tx.category, categoryIcons);

  return (
    <div
      id={`tx-card-${tx.id}`}
      onClick={() => onClick(tx)}
      className="group flex items-center justify-between px-3.5 sm:px-4 py-3 sm:py-3.5 hover:bg-black/[0.025] dark:hover:bg-white/[0.04] transition-colors cursor-pointer active:bg-black/[0.05] dark:active:bg-white/[0.08]"
    >
      <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
        <div
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 border shadow-2xs transition-transform duration-200 group-hover:scale-105 ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}
          style={categoryStyle.style}
        >
          <CategoryIcon className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-bold text-[#1c1c1e] dark:text-[#f2f2f7] truncate leading-tight group-hover:text-[#007aff] transition-colors">
            {tx.description || translatedCategory}
          </p>
          <div className="mt-1">
            <span className="text-[10px] sm:text-[11px] text-[#8e8e93] font-semibold uppercase tracking-wider truncate block">
              {translatedCategory}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2.5 shrink-0 pl-3">
        <span
          className={`text-xs sm:text-base font-extrabold font-sans tracking-tight whitespace-nowrap leading-none block ${
            tx.type === 'income' ? 'text-[#34c759]' : 'text-[#ff3b30]'
          }`}
        >
          {tx.type === 'income' ? '+' : '-'}{formattedAmount}
        </span>
        <ChevronRight className="w-4 h-4 text-[#8e8e93]/35 group-hover:text-[#007aff] group-hover:translate-x-0.5 transition-all shrink-0" />
      </div>
    </div>
  );
});
