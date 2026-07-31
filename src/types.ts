export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string; // YYYY-MM-DD
  description: string;
}

export type BalanceMethod = 'all_time' | 'monthly';

export interface Budget {
  category: string;
  limit: number;
  month?: string; // YYYY-MM format, e.g. "2026-07"
  startDate?: string; // YYYY-MM-DD format for custom date range budget
  endDate?: string;   // YYYY-MM-DD format for custom date range budget
}

export type Language = 'en' | 'my';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export interface Settings {
  language: Language;
  currency: string; // Currency code
  theme: 'light' | 'dark';
  reminderEnabled?: boolean;
  reminderTime?: string; // e.g., "20:00"
  reminderMessage?: string;
  navbarSettings?: NavbarSettings;
  balanceMethod?: BalanceMethod;
}

export interface NavbarSettings {
  bgType: 'glass' | 'solid' | 'gradient' | 'accent';
  bgColor: string;
  opacity: number; // 10 to 100
  blur: 'none' | 'low' | 'medium' | 'high';
  activeColor: string;
  inactiveColor: string;
  shape: 'floating' | 'full' | 'pill';
  showLabels: boolean;
  borderColor: 'default' | 'glow' | 'solid' | 'none';
}

export const DEFAULT_NAVBAR_SETTINGS: NavbarSettings = {
  bgType: 'glass',
  bgColor: '#1c1c1e',
  opacity: 85,
  blur: 'high',
  activeColor: '#007aff',
  inactiveColor: '#8e8e93',
  shape: 'floating',
  showLabels: true,
  borderColor: 'default',
};

export interface UserProfile {
  name: string;
  photoUrl: string;
  incomeSource?: string;
  paydayCycle?: string;
  savingsGoal?: string;
  financialFocus?: string;
  bio: string;
  email?: string;
  phone?: string;
  occupation?: string;
}

