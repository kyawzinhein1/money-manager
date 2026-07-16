import { Transaction, Budget } from './types';

// Helper function to generate relative dates dynamically so the demo data is always relevant
const getDateAgo = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const DEFAULT_TRANSACTIONS: Transaction[] = [
  // --- This Month ---
  {
    id: 'demo-tx-1',
    type: 'income',
    category: 'Salary',
    amount: 1500000,
    date: getDateAgo(15),
    description: 'Monthly Salary Payment'
  },
  {
    id: 'demo-tx-2',
    type: 'income',
    category: 'Freelance',
    amount: 450000,
    date: getDateAgo(6),
    description: 'Web Development Project Milestone'
  },
  {
    id: 'demo-tx-3',
    type: 'income',
    category: 'Investment',
    amount: 80000,
    date: getDateAgo(3),
    description: 'Stock Dividends'
  },
  {
    id: 'demo-tx-4',
    type: 'expense',
    category: 'Housing',
    amount: 400000,
    date: getDateAgo(15),
    description: 'Apartment Monthly Rent'
  },
  {
    id: 'demo-tx-5',
    type: 'expense',
    category: 'Utilities',
    amount: 85000,
    date: getDateAgo(10),
    description: 'Electricity Bill'
  },
  {
    id: 'demo-tx-6',
    type: 'expense',
    category: 'Utilities',
    amount: 39000,
    date: getDateAgo(11),
    description: 'Fiber Internet Plan'
  },
  {
    id: 'demo-tx-7',
    type: 'expense',
    category: 'Food',
    amount: 75000,
    date: getDateAgo(14),
    description: 'Weekly Grocery Shopping'
  },
  {
    id: 'demo-tx-8',
    type: 'expense',
    category: 'Food',
    amount: 15000,
    date: getDateAgo(7),
    description: 'Cafe Coffee & Dessert'
  },
  {
    id: 'demo-tx-9',
    type: 'expense',
    category: 'Food',
    amount: 85000,
    date: getDateAgo(4),
    description: 'Family Restaurant Dinner'
  },
  {
    id: 'demo-tx-10',
    type: 'expense',
    category: 'Transportation',
    amount: 12000,
    date: getDateAgo(12),
    description: 'Taxi Ride'
  },
  {
    id: 'demo-tx-11',
    type: 'expense',
    category: 'Transportation',
    amount: 35000,
    date: getDateAgo(5),
    description: 'Fuel Refill'
  },
  {
    id: 'demo-tx-12',
    type: 'expense',
    category: 'Shopping',
    amount: 120000,
    date: getDateAgo(8),
    description: 'New Running Sneakers'
  },
  {
    id: 'demo-tx-13',
    type: 'expense',
    category: 'Shopping',
    amount: 180000,
    date: getDateAgo(7),
    description: 'Ergonomic Office Chair'
  },
  {
    id: 'demo-tx-14',
    type: 'expense',
    category: 'Entertainment',
    amount: 18000,
    date: getDateAgo(3),
    description: 'Movie Tickets & Popcorn'
  },
  {
    id: 'demo-tx-15',
    type: 'expense',
    category: 'Entertainment',
    amount: 14000,
    date: getDateAgo(13),
    description: 'Music Streaming Annual Renewal'
  },
  {
    id: 'demo-tx-16',
    type: 'expense',
    category: 'Healthcare',
    amount: 22000,
    date: getDateAgo(1),
    description: 'Vitamins & Supplements'
  },
  {
    id: 'demo-tx-17',
    type: 'expense',
    category: 'Education',
    amount: 65000,
    date: getDateAgo(14),
    description: 'Online Course Subscription'
  },

  // --- Previous Month ---
  {
    id: 'demo-tx-18',
    type: 'income',
    category: 'Salary',
    amount: 1500000,
    date: getDateAgo(45),
    description: 'Monthly Salary Payment'
  },
  {
    id: 'demo-tx-19',
    type: 'expense',
    category: 'Housing',
    amount: 400000,
    date: getDateAgo(45),
    description: 'Apartment Monthly Rent'
  },
  {
    id: 'demo-tx-20',
    type: 'expense',
    category: 'Food',
    amount: 110000,
    date: getDateAgo(40),
    description: 'Wholesale Grocery Outing'
  },
  {
    id: 'demo-tx-21',
    type: 'expense',
    category: 'Shopping',
    amount: 250000,
    date: getDateAgo(35),
    description: 'Smartphone Repair'
  }
];

export const DEFAULT_BUDGETS: Budget[] = [
  { category: 'Food', limit: 250000 },
  { category: 'Transportation', limit: 100000 },
  { category: 'Shopping', limit: 300000 },
  { category: 'Entertainment', limit: 80000 },
  { category: 'Housing', limit: 450000 },
  { category: 'Utilities', limit: 150000 },
  { category: 'Healthcare', limit: 100000 },
  { category: 'Education', limit: 100000 }
];

