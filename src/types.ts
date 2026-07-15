export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string; // YYYY-MM-DD
  description: string;
}

export interface Budget {
  category: string;
  limit: number;
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
}

export interface UserProfile {
  name: string;
  email: string;
  photoUrl: string;
  phone: string;
  occupation: string;
  bio: string;
}

