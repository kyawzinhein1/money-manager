import React from 'react';
import { LucideIcon, FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  id?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FolderOpen,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
  id
}) => {
  return (
    <div
      id={id}
      className={`ios-glass rounded-[2rem] border border-black/5 dark:border-white/5 p-8 sm:p-12 text-center shadow-xs flex flex-col items-center justify-center space-y-3 max-w-md mx-auto ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-center text-[#8e8e93]">
        <Icon className="w-7 h-7" />
      </div>
      <p className="text-xs text-[#8e8e93] font-bold uppercase tracking-wider">
        {title}
      </p>
      {description && (
        <p className="text-xs text-[#8e8e93] leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="h-8 px-4 rounded-full bg-[#007aff] text-white text-[11px] font-bold transition-all border-0 cursor-pointer mt-1 hover:opacity-90 active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
