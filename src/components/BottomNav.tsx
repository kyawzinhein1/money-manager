import React from 'react';
import { Wallet, History, PiggyBank, TrendingUp, Settings as SettingsIcon } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  lastMainTab: string;
  onTabChange: (tab: 'dashboard' | 'transactions' | 'budgets' | 'analytics' | 'settings') => void;
  t: (key: string) => string;
}

export const BottomNav: React.FC<BottomNavProps> = React.memo(({ activeTab, lastMainTab, onTabChange, t }) => {
  const tabs = [
    { id: 'dashboard', label: t('navDashboard'), icon: Wallet },
    { id: 'transactions', label: t('navTransactions'), icon: History },
    { id: 'budgets', label: t('navBudgets'), icon: PiggyBank },
    { id: 'analytics', label: t('navAnalytics'), icon: TrendingUp },
    { id: 'settings', label: t('navSettings'), icon: SettingsIcon },
  ] as const;

  return (
    <nav className="fixed bottom-3 left-3 right-3 sm:left-0 sm:right-0 sm:mx-auto sm:max-w-md ios-glass-nav px-1.5 py-1.5 flex items-center justify-around lg:hidden no-print z-[9999] rounded-[24px] gpu-layer">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id || (activeTab === 'add-transaction' && lastMainTab === tab.id);
        return (
          <button
            key={tab.id}
            id={`mobile-nav-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={`relative z-20 flex flex-col items-center justify-center py-1.5 px-1 flex-1 min-w-0 transition-all cursor-pointer border-0 bg-transparent rounded-xl ${
              isActive
                ? 'text-[#007aff] dark:text-[#30b0ff] font-extrabold scale-105'
                : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-[#f2f2f7]'
            }`}
          >
            <Icon className={`w-5 h-5 shrink-0 transition-transform ${isActive ? 'scale-110 text-[#007aff] dark:text-[#30b0ff]' : ''}`} />
            <span className="text-[10px] font-bold tracking-tight w-full truncate text-center block mt-0.5 whitespace-nowrap">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
});
