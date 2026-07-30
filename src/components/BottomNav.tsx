import React from 'react';
import { Wallet, History, PiggyBank, TrendingUp, Settings as SettingsIcon } from 'lucide-react';
import { NavbarSettings, DEFAULT_NAVBAR_SETTINGS } from '../types';

interface BottomNavProps {
  activeTab: string;
  lastMainTab: string;
  onTabChange: (tab: 'dashboard' | 'transactions' | 'budgets' | 'analytics' | 'settings') => void;
  t: (key: string) => string;
  navbarSettings?: NavbarSettings;
  theme?: 'light' | 'dark';
}

export const BottomNav: React.FC<BottomNavProps> = React.memo(({
  activeTab,
  lastMainTab,
  onTabChange,
  t,
  navbarSettings,
  theme = 'light'
}) => {
  const nav = navbarSettings || DEFAULT_NAVBAR_SETTINGS;

  const tabs = [
    { id: 'dashboard', label: t('navDashboard'), icon: Wallet },
    { id: 'transactions', label: t('navTransactions'), icon: History },
    { id: 'budgets', label: t('navBudgets'), icon: PiggyBank },
    { id: 'analytics', label: t('navAnalytics'), icon: TrendingUp },
    { id: 'settings', label: t('navSettings'), icon: SettingsIcon },
  ] as const;

  const opacityVal = (nav.opacity ?? 85) / 100;
  let background = '';

  if (nav.bgType === 'solid') {
    const hex = nav.bgColor || '#1c1c1e';
    const r = parseInt(hex.slice(1, 3) || '1c', 16);
    const g = parseInt(hex.slice(3, 5) || '1c', 16);
    const b = parseInt(hex.slice(5, 7) || '1e', 16);
    background = `rgba(${r}, ${g}, ${b}, ${opacityVal})`;
  } else if (nav.bgType === 'gradient') {
    background = `linear-gradient(135deg, ${nav.activeColor}${Math.round(opacityVal * 255).toString(16).padStart(2, '0')}, ${nav.bgColor || '#1c1c1e'}${Math.round(opacityVal * 255).toString(16).padStart(2, '0')})`;
  } else if (nav.bgType === 'accent') {
    const hex = nav.activeColor || '#007aff';
    const r = parseInt(hex.slice(1, 3) || '00', 16);
    const g = parseInt(hex.slice(3, 5) || '7a', 16);
    const b = parseInt(hex.slice(5, 7) || 'ff', 16);
    background = `rgba(${r}, ${g}, ${b}, ${opacityVal})`;
  } else {
    // glass
    background = theme === 'dark'
      ? `rgba(28, 28, 30, ${opacityVal})`
      : `rgba(255, 255, 255, ${opacityVal})`;
  }

  let blurAmount = '24px';
  if (nav.blur === 'none') blurAmount = '0px';
  if (nav.blur === 'low') blurAmount = '6px';
  if (nav.blur === 'medium') blurAmount = '12px';
  if (nav.blur === 'high') blurAmount = '24px';

  let shapeClasses = 'fixed bottom-3 left-3 right-3 sm:left-0 sm:right-0 sm:mx-auto sm:max-w-md rounded-[24px] px-1.5';
  if (nav.shape === 'full') {
    shapeClasses = 'fixed bottom-0 left-0 right-0 sm:left-0 sm:right-0 sm:mx-auto sm:max-w-md rounded-none px-2';
  } else if (nav.shape === 'pill') {
    shapeClasses = 'fixed bottom-3 left-4 right-4 sm:left-0 sm:right-0 sm:mx-auto sm:max-w-md rounded-full px-3';
  }

  let borderClasses = 'border border-black/10 dark:border-white/10 shadow-lg';
  if (nav.borderColor === 'glow') {
    borderClasses = 'border border-[#007aff]/30 shadow-[0_4px_20px_rgba(0,122,255,0.25)]';
  } else if (nav.borderColor === 'solid') {
    borderClasses = 'border-2 border-black/20 dark:border-white/20 shadow-md';
  } else if (nav.borderColor === 'none') {
    borderClasses = 'border-0 shadow-none';
  }

  return (
    <nav
      style={{
        background,
        backdropFilter: `blur(${blurAmount})`,
        WebkitBackdropFilter: `blur(${blurAmount})`,
      }}
      className={`${shapeClasses} ${borderClasses} py-1.5 flex items-center justify-around lg:hidden no-print z-[9999] gpu-layer transition-all`}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id || (activeTab === 'add-transaction' && lastMainTab === tab.id);
        const color = isActive ? nav.activeColor : nav.inactiveColor;

        return (
          <button
            key={tab.id}
            id={`mobile-nav-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={`relative z-20 flex flex-col items-center justify-center py-1.5 px-1 flex-1 min-w-0 transition-all cursor-pointer border-0 bg-transparent rounded-xl ${
              isActive ? 'scale-105 font-extrabold' : ''
            }`}
          >
            <Icon
              className={`w-5 h-5 shrink-0 transition-all ${isActive ? 'scale-110' : ''}`}
              style={{ color }}
            />
            {nav.showLabels !== false && (
              <span
                className="text-[10px] font-bold tracking-tight w-full truncate text-center block mt-0.5 whitespace-nowrap"
                style={{ color }}
              >
                {tab.label}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
});
