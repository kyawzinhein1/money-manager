import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  FileDown,
  Globe,
  Settings as SettingsIcon,
  Plus,
  TrendingUp,
  PieChart as PieChartIcon,
  Coins,
  History,
  CheckCircle2,
  Trash2,
  Moon,
  Sun,
  X,
  PiggyBank,
  Check,
  AlertTriangle,
  User,
  Share,
  RefreshCw,
  ChevronDown
} from 'lucide-react';

import { Transaction, Budget, Language, Currency, Settings, UserProfile } from './types';
import { TRANSLATIONS, CATEGORY_TRANSLATIONS } from './translations';
import { DEFAULT_TRANSACTIONS, DEFAULT_BUDGETS } from './defaultData';

// Component Imports
import { TransactionsSection } from './components/TransactionsSection';
import { BudgetSection } from './components/BudgetSection';
import { AnalyticsSection } from './components/AnalyticsSection';
import { SettingsSection } from './components/SettingsSection';
import { ProfileSection } from './components/ProfileSection';
import { OnboardingModal } from './components/OnboardingModal';
import { AddTransactionSection } from './components/AddTransactionSection';

// Google Drive Cloud Sync Utilities
import {
  initAuth,
  googleSignIn,
  googleSignOut,
  findDriveFile,
  downloadFromDrive,
  uploadToDrive,
  SyncData
} from './utils/googleDriveSync';
import { User as FirebaseUser } from 'firebase/auth';

const getCategoryStyle = (categoryName: string) => {
  const norm = categoryName.trim().toLowerCase();
  switch (norm) {
    case 'food':
    case 'food':
    case 'စားသောက်စရိတ်':
      return {
        bg: 'bg-amber-500/10 dark:bg-amber-500/20',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-500/10 dark:border-amber-500/20'
      };
    case 'transportation':
    case 'transportation':
    case 'သယ်ယူပို့ဆောင်ရေး':
      return {
        bg: 'bg-blue-500/10 dark:bg-blue-500/20',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-500/10 dark:border-blue-500/20'
      };
    case 'shopping':
    case 'shopping':
    case 'ဈေးဝယ်ခြင်း':
      return {
        bg: 'bg-pink-500/10 dark:bg-pink-500/20',
        text: 'text-pink-600 dark:text-pink-400',
        border: 'border-pink-500/10 dark:border-pink-500/20'
      };
    case 'entertainment':
    case 'entertainment':
    case 'ဖျော်ဖြေရေး':
      return {
        bg: 'bg-purple-500/10 dark:bg-purple-500/20',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-500/10 dark:border-purple-500/20'
      };
    case 'housing':
    case 'housing':
    case 'အိမ်လခ/အိမ်စရိတ်':
      return {
        bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
        text: 'text-indigo-600 dark:text-indigo-400',
        border: 'border-indigo-500/10 dark:border-indigo-500/20'
      };
    case 'utilities':
    case 'utilities':
    case 'မီတာ/ရေဖိုး/ဖုန်းဘေလ်':
      return {
        bg: 'bg-teal-500/10 dark:bg-teal-500/20',
        text: 'text-teal-600 dark:text-teal-400',
        border: 'border-teal-500/10 dark:border-teal-500/20'
      };
    case 'healthcare':
    case 'healthcare':
    case 'ကျန်းမာရေး':
      return {
        bg: 'bg-red-500/10 dark:bg-red-500/20',
        text: 'text-red-600 dark:text-red-400',
        border: 'border-red-500/10 dark:border-red-500/20'
      };
    case 'education':
    case 'education':
    case 'ပညာရေး':
      return {
        bg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
        text: 'text-cyan-600 dark:text-cyan-400',
        border: 'border-cyan-500/10 dark:border-cyan-500/20'
      };
    case 'salary':
    case 'salary':
    case 'လစာဝင်ငွေ':
      return {
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-500/10 dark:border-emerald-500/20'
      };
    case 'freelance':
    case 'freelance':
    case 'လွတ်လပ်သောလုပ်ငန်း':
      return {
        bg: 'bg-sky-500/10 dark:bg-sky-500/20',
        text: 'text-sky-600 dark:text-sky-400',
        border: 'border-sky-500/10 dark:border-sky-500/20'
      };
    case 'investment':
    case 'investment':
    case 'ရင်းနှီးမြှုပ်နှံမှု':
      return {
        bg: 'bg-violet-500/10 dark:bg-violet-500/20',
        text: 'text-violet-600 dark:text-violet-400',
        border: 'border-violet-500/10 dark:border-violet-500/20'
      };
    case 'gift':
    case 'gift':
    case 'လက်ဆောင်ရရှိမှု':
      return {
        bg: 'bg-rose-500/10 dark:bg-rose-500/20',
        text: 'text-rose-600 dark:text-rose-400',
        border: 'border-rose-500/10 dark:border-rose-500/20'
      };
    default:
      return {
        bg: 'bg-slate-500/10 dark:bg-slate-500/20',
        text: 'text-slate-600 dark:text-slate-400',
        border: 'border-slate-500/10 dark:border-slate-500/20'
      };
  }
};

export default function App() {
  // State Initialization from LocalStorage or Defaults with a one-time clean-up of old mock data
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const isCleaned = localStorage.getItem('mm_default_cleaned_v7');
    if (!isCleaned) {
      localStorage.setItem('mm_default_cleaned_v7', 'true');
      localStorage.removeItem('mm_transactions');
      localStorage.removeItem('mm_budgets');
      localStorage.removeItem('mm_onboarding_completed');
      localStorage.removeItem('mm_profile');
      localStorage.removeItem('mm_settings');
      localStorage.removeItem('mm_currency');
      localStorage.removeItem('mm_income_categories');
      localStorage.removeItem('mm_expense_categories');
      return DEFAULT_TRANSACTIONS;
    }
    const saved = localStorage.getItem('mm_transactions');
    return saved ? JSON.parse(saved) : DEFAULT_TRANSACTIONS;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('mm_budgets');
    return saved ? JSON.parse(saved) : DEFAULT_BUDGETS;
  });

  const [incomeCategories, setIncomeCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('mm_income_categories');
    return saved ? JSON.parse(saved) : ['Salary', 'Freelance', 'Investment', 'Gift', 'Others'];
  });

  const [expenseCategories, setExpenseCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('mm_expense_categories');
    return saved ? JSON.parse(saved) : ['Food', 'Transportation', 'Shopping', 'Entertainment', 'Housing', 'Utilities', 'Healthcare', 'Education', 'Others'];
  });

  const [customCurrency, setCustomCurrency] = useState<Currency>(() => {
    const saved = localStorage.getItem('mm_currency');
    return saved ? JSON.parse(saved) : { code: 'MMK', symbol: 'Ks', name: 'Myanmar Kyat' };
  });

  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('mm_settings');
    return saved ? JSON.parse(saved) : { language: 'en', currency: 'MMK', theme: 'light' };
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('mm_profile');
    return saved ? JSON.parse(saved) : {
      name: 'Kyaw Zin Hein',
      email: 'kyawzinhein162@gmail.com',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      phone: '+95 9 123456789',
      occupation: 'Software Engineer',
      bio: 'Managing daily expenses with custom currency views.'
    };
  });

  // Home Page (Dashboard) Date Selector Range State (Month and Year selector)
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return new Date().toISOString().substring(5, 7); // current month e.g. "07"
  });
  const [selectedYear, setSelectedYear] = useState<string>(() => {
    return new Date().toISOString().substring(0, 4); // current year e.g. "2026"
  });

  // Current Active Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'budgets' | 'analytics' | 'settings' | 'profile' | 'add-transaction'>('dashboard');
  const [editingTxInAddPage, setEditingTxInAddPage] = useState<Transaction | null>(null);
  const [lastMainTab, setLastMainTab] = useState<'dashboard' | 'transactions'>('dashboard');
  const [isProfileEditing, setIsProfileEditing] = useState<boolean>(false);
  const [showMonthMenu, setShowMonthMenu] = useState<boolean>(false);
  const [showYearMenu, setShowYearMenu] = useState<boolean>(false);

  useEffect(() => {
    if (activeTab === 'dashboard' || activeTab === 'transactions') {
      setLastMainTab(activeTab);
    }
  }, [activeTab]);

  // Interactive Quick Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // iOS PWA Install prompt state
  const [showIOSPrompt, setShowIOSPrompt] = useState<boolean>(false);

  // Google Drive Sync States
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [driveFileId, setDriveFileId] = useState<string | null>(() => {
    return localStorage.getItem('mm_drive_file_id');
  });
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'not-connected' | 'idle'>(() => {
    return localStorage.getItem('mm_google_token') ? 'idle' : 'not-connected';
  });
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(() => {
    return localStorage.getItem('mm_last_synced_time');
  });
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('mm_auto_sync_enabled');
    return saved !== 'false'; // Enabled by default if logged in
  });

  // Attempt to silent re-auth if token is cached
  useEffect(() => {
    initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
        setSyncStatus('synced');
      },
      () => {
        const token = localStorage.getItem('mm_google_token');
        if (token) {
          setGoogleToken(token);
          setSyncStatus('idle');
          findDriveFile(token).then(fileId => {
            if (fileId) {
              setDriveFileId(fileId);
              setSyncStatus('synced');
            }
          }).catch(() => {
            localStorage.removeItem('mm_google_token');
            setGoogleToken(null);
            setSyncStatus('not-connected');
          });
        }
      }
    );
  }, []);

  // Auto Cloud Sync whenever state changes
  useEffect(() => {
    if (googleToken && autoSyncEnabled) {
      const delayDebounceFn = setTimeout(() => {
        const syncData: SyncData = {
          transactions,
          budgets,
          incomeCategories,
          expenseCategories,
          customCurrency,
          settings,
          profile,
          lastUpdated: new Date().toISOString()
        };
        setSyncStatus('syncing');
        uploadToDrive(googleToken, syncData, driveFileId)
          .then(fileId => {
            if (fileId && fileId !== driveFileId) {
              setDriveFileId(fileId);
              localStorage.setItem('mm_drive_file_id', fileId);
            }
            setSyncStatus('synced');
            const timeStr = new Date().toLocaleTimeString();
            setLastSyncedTime(timeStr);
            localStorage.setItem('mm_last_synced_time', timeStr);
          })
          .catch(err => {
            console.error("Auto sync failed:", err);
            setSyncStatus('error');
          });
      }, 2000); // Debounce by 2 seconds to avoid multiple saves while typing/editing rapidly
      return () => clearTimeout(delayDebounceFn);
    }
  }, [transactions, budgets, incomeCategories, expenseCategories, customCurrency, settings, profile, googleToken, autoSyncEnabled, driveFileId]);

  // Connect Google Drive (Google Sign-In)
  const handleConnectGoogleDrive = async () => {
    setSyncStatus('syncing');
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setGoogleToken(result.accessToken);
        localStorage.setItem('mm_google_token', result.accessToken);
        
        // Find existing backup file in Google Drive
        const fileId = await findDriveFile(result.accessToken);
        if (fileId) {
          setDriveFileId(fileId);
          localStorage.setItem('mm_drive_file_id', fileId);
          
          // Download data from Drive to offer restore/merge
          const driveData = await downloadFromDrive(result.accessToken, fileId);
          if (driveData) {
            setConfirmDialog({
              isOpen: true,
              title: settings.language === 'my' ? 'Cloud Backup ရှာဖွေတွေ့ရှိသည်' : 'Cloud Backup Found',
              message: settings.language === 'my' 
                ? `သင်၏ Google Drive တွင် နောက်ဆုံးပြင်ဆင်ခဲ့သော (${new Date(driveData.lastUpdated).toLocaleString()}) မှတ်တမ်းဖိုင်ကို ရှာတွေ့ပါသည်။ ၎င်းကို ပြန်လည်ရယူမလား သို့မဟုတ် လက်ရှိဖုန်းထဲရှိမှတ်တမ်းများဖြင့် ထပ်မံသိမ်းဆည်းမလား?`
                : `We found an existing cloud backup on your Google Drive from ${new Date(driveData.lastUpdated).toLocaleString()}. Would you like to Restore from Cloud (overwrite current local data) or Save Local data to Cloud (overwrite cloud backup)?`,
              confirmText: settings.language === 'my' ? 'Cloud မှ ဒေတာရယူမည်' : 'Restore from Cloud',
              cancelText: settings.language === 'my' ? 'လက်ရှိဖုန်းမှဒေတာ သိမ်းဆည်းမည်' : 'Save Local to Cloud',
              isDestructive: false,
              onConfirm: () => {
                if (driveData.transactions) setTransactions(driveData.transactions);
                if (driveData.budgets) setBudgets(driveData.budgets);
                if (driveData.incomeCategories) setIncomeCategories(driveData.incomeCategories);
                if (driveData.expenseCategories) setExpenseCategories(driveData.expenseCategories);
                if (driveData.customCurrency) setCustomCurrency(driveData.customCurrency);
                if (driveData.settings) setSettings(driveData.settings);
                if (driveData.profile) setProfile(driveData.profile);
                
                setSyncStatus('synced');
                const timeStr = new Date().toLocaleTimeString();
                setLastSyncedTime(timeStr);
                localStorage.setItem('mm_last_synced_time', timeStr);
                showToast(settings.language === 'my' ? 'ဒေတာများကို အောင်မြင်စွာ ပြန်လည်ရယူပြီးပါပြီ။' : 'Cloud backup successfully restored!', 'success');
                setConfirmDialog(null);
              },
              onCancel: () => {
                const syncData: SyncData = {
                  transactions,
                  budgets,
                  incomeCategories,
                  expenseCategories,
                  customCurrency,
                  settings,
                  profile,
                  lastUpdated: new Date().toISOString()
                };
                uploadToDrive(result.accessToken, syncData, fileId)
                  .then(() => {
                    setSyncStatus('synced');
                    const timeStr = new Date().toLocaleTimeString();
                    setLastSyncedTime(timeStr);
                    localStorage.setItem('mm_last_synced_time', timeStr);
                    showToast(settings.language === 'my' ? 'လက်ရှိဒေတာကို Cloud တွင် သိမ်းဆည်းပြီးပါပြီ။' : 'Local data saved to Google Drive!', 'success');
                  })
                  .catch(err => {
                    console.error(err);
                    setSyncStatus('error');
                    showToast('Failed to save to Cloud', 'error');
                  });
                setConfirmDialog(null);
              }
            });
          }
        } else {
          // No backup found, perform initial save
          const syncData: SyncData = {
            transactions,
            budgets,
            incomeCategories,
            expenseCategories,
            customCurrency,
            settings,
            profile,
            lastUpdated: new Date().toISOString()
          };
          const newFileId = await uploadToDrive(result.accessToken, syncData, null);
          setDriveFileId(newFileId);
          localStorage.setItem('mm_drive_file_id', newFileId);
          setSyncStatus('synced');
          const timeStr = new Date().toLocaleTimeString();
          setLastSyncedTime(timeStr);
          localStorage.setItem('mm_last_synced_time', timeStr);
          showToast(settings.language === 'my' ? 'Google Drive တွင် အောင်မြင်စွာ စတင်သိမ်းဆည်းလိုက်ပါပြီ။' : 'Cloud sync successfully initialized on Google Drive!', 'success');
        }
      }
    } catch (err: any) {
      console.error("Failed to connect Google Drive:", err);
      const isIframe = typeof window !== 'undefined' && window.self !== window.top;
      
      if (err?.code === 'auth/popup-closed-by-user' || err?.message?.includes('popup-closed-by-user')) {
        setSyncStatus('not-connected');
        if (isIframe) {
          showToast(
            settings.language === 'my'
              ? 'ဘရောင်ဇာလုံခြုံရေးကြောင့် ညာဘက်အပေါ်ရှိ "ဝင်းဒိုးသစ်ဖြင့်ဖွင့်ရန်" ခလုတ်ကိုနှိပ်၍ ဝင်ရောက်ပေးပါ။'
              : 'Browser security inside preview iframe: Please open the app in a new tab to sign in successfully!',
            'error'
          );
        } else {
          showToast(t('authPopupClosed'), 'info');
        }
      } else {
        setSyncStatus('error');
        showToast(err.message || t('authGeneralError'), 'error');
      }
    }
  };

  // Disconnect Google Drive
  const handleDisconnectGoogleDrive = async () => {
    try {
      await googleSignOut();
      setGoogleUser(null);
      setGoogleToken(null);
      localStorage.removeItem('mm_google_token');
      setSyncStatus('not-connected');
      showToast(settings.language === 'my' ? 'Google Drive ချိတ်ဆက်မှုကို ဖြတ်တောက်လိုက်ပါပြီ။' : 'Disconnected from Google Drive.', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  // Manual Trigger Upload
  const handleTriggerDriveUpload = async () => {
    if (!googleToken) {
      await handleConnectGoogleDrive();
      return;
    }
    setSyncStatus('syncing');
    try {
      const syncData: SyncData = {
        transactions,
        budgets,
        incomeCategories,
        expenseCategories,
        customCurrency,
        settings,
        profile,
        lastUpdated: new Date().toISOString()
      };
      const fileId = await uploadToDrive(googleToken, syncData, driveFileId);
      if (fileId && fileId !== driveFileId) {
        setDriveFileId(fileId);
        localStorage.setItem('mm_drive_file_id', fileId);
      }
      setSyncStatus('synced');
      const timeStr = new Date().toLocaleTimeString();
      setLastSyncedTime(timeStr);
      localStorage.setItem('mm_last_synced_time', timeStr);
      showToast(settings.language === 'my' ? 'ဒေတာများကို Google Drive ထဲသို့ အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ။' : 'Data successfully backed up to Google Drive!', 'success');
    } catch (err) {
      console.error(err);
      setSyncStatus('error');
      showToast('Backup failed.', 'error');
    }
  };

  // Manual Trigger Download (Restore)
  const handleTriggerDriveDownload = async () => {
    if (!googleToken) {
      await handleConnectGoogleDrive();
      return;
    }
    setSyncStatus('syncing');
    try {
      const fileId = driveFileId || await findDriveFile(googleToken);
      if (!fileId) {
        setSyncStatus('idle');
        showToast(settings.language === 'my' ? 'Google Drive ပေါ်တွင် မည်သည့်မှတ်တမ်းမှ ရှာမတွေ့ပါ။' : 'No backup found on Google Drive.', 'error');
        return;
      }
      const driveData = await downloadFromDrive(googleToken, fileId);
      if (!driveData) {
        setSyncStatus('error');
        showToast('Failed to download backup.', 'error');
        return;
      }

      setConfirmDialog({
        isOpen: true,
        title: settings.language === 'my' ? 'မှတ်တမ်း ပြန်လည်ရယူရန် သေချာပါသလား?' : 'Restore Backup?',
        message: settings.language === 'my'
          ? `ဤလုပ်ဆောင်ချက်သည် သင့်ဖုန်းထဲရှိ လက်ရှိငွေစာရင်းမှတ်တမ်းအားလုံးကို Google Drive ရှိမှတ်တမ်းများ (${new Date(driveData.lastUpdated).toLocaleString()}) ဖြင့် အစားထိုးပါလိမ့်မည်။ ဆက်လုပ်ရန် သေချာပါသလား?`
          : `Are you sure you want to restore the backup from ${new Date(driveData.lastUpdated).toLocaleString()}? This will overwrite all of your current local transaction entries, categories, budgets, and profile preferences permanently.`,
        confirmText: settings.language === 'my' ? 'သေချာပါသည်၊ အစားထိုးမည်' : 'Yes, Restore and Overwrite',
        cancelText: settings.language === 'my' ? 'မလုပ်တော့ပါ' : 'Cancel',
        isDestructive: true,
        onConfirm: () => {
          if (driveData.transactions) setTransactions(driveData.transactions);
          if (driveData.budgets) setBudgets(driveData.budgets);
          if (driveData.incomeCategories) setIncomeCategories(driveData.incomeCategories);
          if (driveData.expenseCategories) setExpenseCategories(driveData.expenseCategories);
          if (driveData.customCurrency) setCustomCurrency(driveData.customCurrency);
          if (driveData.settings) setSettings(driveData.settings);
          if (driveData.profile) setProfile(driveData.profile);
          
          setSyncStatus('synced');
          const timeStr = new Date().toLocaleTimeString();
          setLastSyncedTime(timeStr);
          localStorage.setItem('mm_last_synced_time', timeStr);
          showToast(settings.language === 'my' ? 'မှတ်တမ်းများကို အောင်မြင်စွာ ပြန်လည်ရယူပြီးပါပြီ။' : 'Backup restored successfully!', 'success');
          setConfirmDialog(null);
        },
        onCancel: () => {
          setSyncStatus('synced');
          setConfirmDialog(null);
        }
      });
    } catch (err) {
      console.error(err);
      setSyncStatus('error');
      showToast('Restore failed.', 'error');
    }
  };

  const handleToggleAutoSync = () => {
    const newVal = !autoSyncEnabled;
    setAutoSyncEnabled(newVal);
    localStorage.setItem('mm_auto_sync_enabled', newVal ? 'true' : 'false');
    showToast(
      newVal
        ? (settings.language === 'my' ? 'အလိုအလျောက် သိမ်းဆည်းမှုကို ဖွင့်လိုက်ပါပြီ။' : 'Automatic saving enabled.')
        : (settings.language === 'my' ? 'အလိုအလျောက် သိမ်းဆည်းမှုကို ပိတ်လိုက်ပါပြီ။' : 'Automatic saving disabled.'),
      'info'
    );
  };

  // Custom Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
    onCancel?: () => void;
    isDestructive?: boolean;
  } | null>(null);

  // Welcome Onboarding Screen State for first time user
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    return !localStorage.getItem('mm_onboarding_completed');
  });

  const handleOnboardingComplete = (data: {
    name: string;
    language: Language;
    currency: Currency;
    financialGoals: string[];
  }) => {
    // Update profile
    setProfile(prev => ({
      ...prev,
      name: data.name
    }));

    // Update settings
    setSettings(prev => ({
      ...prev,
      language: data.language,
      currency: data.currency.code
    }));

    // Update custom currency
    setCustomCurrency(data.currency);

    // Save financial goals chosen during onboarding
    localStorage.setItem('mm_onboarding_goals', JSON.stringify(data.financialGoals));

    // Initialize budgets to empty (user requested to remove default budget limit)
    setBudgets([]);

    // Ensure we start with a clean transactions state
    setTransactions([]);

    // Save onboarding completion status
    localStorage.setItem('mm_onboarding_completed', 'true');
    setShowOnboarding(false);

    // Show nice welcome toast
    const welcomeMsg = data.language === 'my'
      ? 'ငွေစာရင်း မန်နေဂျာမှ ကြိုဆိုပါသည်။ စတင်ပြင်ဆင်မှု ပြီးဆုံးပါပြီ။'
      : 'Welcome to Money Manager! Your space is ready.';
    showToast(welcomeMsg, 'success');
  };

  useEffect(() => {
    // Detect Safari on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    
    if (isIOS && !isStandalone) {
      // Small timeout to let screen render smoothly
      const timer = setTimeout(() => {
        const dismissed = sessionStorage.getItem('mm_ios_pwa_dismissed');
        if (!dismissed) {
          setShowIOSPrompt(true);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Synchronize with LocalStorage
  useEffect(() => {
    localStorage.setItem('mm_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('mm_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('mm_income_categories', JSON.stringify(incomeCategories));
  }, [incomeCategories]);

  useEffect(() => {
    localStorage.setItem('mm_expense_categories', JSON.stringify(expenseCategories));
  }, [expenseCategories]);

  const t = React.useCallback((key: string) => TRANSLATIONS[settings.language][key] || key, [settings.language]);
  const tc = React.useCallback((cat: string) => CATEGORY_TRANSLATIONS[settings.language][cat] || cat, [settings.language]);

  const handleAddCategory = React.useCallback((type: 'income' | 'expense', category: string) => {
    if (type === 'income') {
      if (!incomeCategories.includes(category)) {
        setIncomeCategories(prev => [...prev, category]);
        showToast(`Income category "${category}" added.`, 'success');
      } else {
        showToast(`Category already exists.`, 'error');
      }
    } else {
      if (!expenseCategories.includes(category)) {
        setExpenseCategories(prev => [...prev, category]);
        showToast(`Expense category "${category}" added.`, 'success');
      } else {
        showToast(`Category already exists.`, 'error');
      }
    }
  }, [incomeCategories, expenseCategories]);

  const handleDeleteCategory = React.useCallback((type: 'income' | 'expense', category: string) => {
    setConfirmDialog({
      isOpen: true,
      title: settings.language === 'my' ? "အမျိုးအစားဖျက်မည်" : "Delete Category",
      message: settings.language === 'my'
        ? `"${tc(category)}" အမျိုးအစားကို ဖျက်ရန် သေချာပါသလား?`
        : `Are you sure you want to delete category "${tc(category)}"?`,
      confirmText: settings.language === 'my' ? "ဖျက်မည်" : "Delete",
      cancelText: settings.language === 'my' ? "မလုပ်တော့ပါ" : "Cancel",
      isDestructive: true,
      onConfirm: () => {
        if (type === 'income') {
          if (incomeCategories.length > 1) {
            setIncomeCategories(prev => prev.filter(c => c !== category));
            showToast(`Income category "${category}" removed.`, 'info');
          }
        } else {
          if (expenseCategories.length > 1) {
            setExpenseCategories(prev => prev.filter(c => c !== category));
            showToast(`Expense category "${category}" removed.`, 'info');
          }
        }
        setConfirmDialog(null);
      }
    });
  }, [settings.language, incomeCategories, expenseCategories, tc]);

  useEffect(() => {
    localStorage.setItem('mm_currency', JSON.stringify(customCurrency));
  }, [customCurrency]);

  useEffect(() => {
    localStorage.setItem('mm_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('mm_profile', JSON.stringify(profile));
  }, [profile]);

  // Apply Theme class to document root for dark mode
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Scroll to top when active tab changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLoadDemoData = React.useCallback(() => {
    setConfirmDialog({
      isOpen: true,
      title: settings.language === 'my' ? "နမူနာဒေတာများ ထည့်သွင်းမည်" : "Load Demo Dataset",
      message: t('confirmLoadDemo') || "This will replace your current transactions and budgets with our preloaded demo dataset. Continue?",
      confirmText: settings.language === 'my' ? "သေချာသည်" : "Load Demo",
      cancelText: settings.language === 'my' ? "မလုပ်တော့ပါ" : "Cancel",
      isDestructive: false,
      onConfirm: () => {
        setTransactions(DEFAULT_TRANSACTIONS);
        setBudgets(DEFAULT_BUDGETS);
        showToast(t('loadDemoSuccess') || 'Demo dataset preloaded successfully!', 'success');
        setConfirmDialog(null);
      }
    });
  }, [settings.language, t]);

  const handleClearAllData = React.useCallback(() => {
    setConfirmDialog({
      isOpen: true,
      title: settings.language === 'my' ? "ဒေတာအားလုံး ဖျက်မည်" : "Clear All Data",
      message: t('confirmClear') || "Are you absolutely sure you want to clear all transactions and budgets? This action is permanent and cannot be undone.",
      confirmText: settings.language === 'my' ? "ဖျက်မည်" : "Clear All",
      cancelText: settings.language === 'my' ? "မလုပ်တော့ပါ" : "Cancel",
      isDestructive: true,
      onConfirm: () => {
        setTransactions([]);
        setBudgets([]);
        showToast(t('clearSuccess') || 'All transactions and budgets cleared!', 'success');
        setConfirmDialog(null);
      }
    });
  }, [settings.language, t]);

  const formatAmount = React.useCallback((amount: number) => {
    const formatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    if (customCurrency.code === 'MMK' || customCurrency.symbol === 'Ks') {
      return `${formatted} Ks`;
    }
    return `${customCurrency.symbol}${formatted}`;
  }, [customCurrency]);

  const formatDateDMY = React.useCallback((dateString: string): string => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  }, []);

  const availableYears = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 5;
    const endYear = currentYear + 5;
    const yearsList: string[] = [];
    for (let y = startYear; y <= endYear; y++) {
      yearsList.push(y.toString());
    }
    // Include any custom years from existing transactions
    transactions.forEach(tx => {
      const yr = tx.date.split('-')[0];
      if (yr && !yearsList.includes(yr)) {
        yearsList.push(yr);
      }
    });
    return yearsList.sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  const monthOptions = React.useMemo(() => [
    { value: '01', label: t('jan') },
    { value: '02', label: t('feb') },
    { value: '03', label: t('mar') },
    { value: '04', label: t('apr') },
    { value: '05', label: t('may') },
    { value: '06', label: t('jun') },
    { value: '07', label: t('jul') },
    { value: '08', label: t('aug') },
    { value: '09', label: t('sep') },
    { value: '10', label: t('oct') },
    { value: '11', label: t('nov') },
    { value: '12', label: t('dec') },
    { value: 'all', label: settings.language === 'my' ? 'လအားလုံး' : 'All Months' }
  ], [settings.language]);

  // Global calculations for current range
  const currentMonthStr = new Date().toISOString().substring(0, 7); // "YYYY-MM"

  const dashboardFilteredTransactions = React.useMemo(() => {
    return transactions.filter((tx) => {
      const txYear = tx.date.substring(0, 4);
      const txMonth = tx.date.substring(5, 7);
      
      const matchYear = selectedYear === 'all' || txYear === selectedYear;
      const matchMonth = selectedMonth === 'all' || txMonth === selectedMonth;
      
      return matchYear && matchMonth;
    });
  }, [transactions, selectedMonth, selectedYear]);

  const totals = React.useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    dashboardFilteredTransactions.forEach((tx) => {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else {
        totalExpense += tx.amount;
      }
    });

    return {
      income: totalIncome,
      expense: totalExpense,
      balance: totalIncome - totalExpense,
    };
  }, [dashboardFilteredTransactions]);

  // Handle Updates
  const handleAddTransaction = React.useCallback((newTx: Omit<Transaction, 'id'>) => {
    const tx: Transaction = {
      ...newTx,
      id: `tx-${Date.now()}`,
    };
    setTransactions((prev) => [tx, ...prev]);
    showToast(t('addRecordSuccess'), 'success');

    // Check if total monthly expense budget is exceeded with this new transaction
    if (tx.type === 'expense') {
      const overallBudget = budgets[0];
      if (overallBudget) {
        const totalSpent = transactions
          .filter((t) => t.type === 'expense' && t.date.substring(0, 7) === tx.date.substring(0, 7))
          .reduce((sum, t) => sum + t.amount, 0) + tx.amount;
        if (totalSpent > overallBudget.limit) {
          showToast(`Warning: Monthly Expense Budget Exceeded!`, 'error');
        }
      }
    }
  }, [budgets, transactions, t]);

  const handleEditTransaction = React.useCallback((updatedTx: Transaction) => {
    setTransactions((prev) => prev.map((tx) => (tx.id === updatedTx.id ? updatedTx : tx)));
    showToast(t('updateRecordSuccess'), 'success');
  }, [t]);

  const handleDeleteTransaction = React.useCallback((id: string) => {
    const transactionToDelete = transactions.find(t => t.id === id);
    if (!transactionToDelete) return;

    setConfirmDialog({
      isOpen: true,
      title: settings.language === 'my' ? "မှတ်တမ်းဖျက်မည်" : "Delete Transaction",
      message: settings.language === 'my' 
        ? `ဤမှတ်တမ်း (${tc(transactionToDelete.category)} - ${formatAmount(transactionToDelete.amount)}) ကို ဖျက်ရန် သေချာပါသလား?` 
        : `Are you sure you want to delete this transaction (${tc(transactionToDelete.category)} - ${formatAmount(transactionToDelete.amount)})?`,
      confirmText: settings.language === 'my' ? "ဖျက်မည်" : "Delete",
      cancelText: settings.language === 'my' ? "မလုပ်တော့ပါ" : "Cancel",
      isDestructive: true,
      onConfirm: () => {
        setTransactions((prev) => prev.filter((tx) => tx.id !== id));
        showToast(t('deleteRecordSuccess'), 'success');
        setConfirmDialog(null);
      }
    });
  }, [transactions, settings.language, tc, formatAmount, t]);

  const handleSaveBudget = React.useCallback((category: string, limit: number) => {
    setBudgets([{ category: 'Total', limit }]);
    showToast(t('budgetSavedSuccess'), 'success');
  }, [t]);

  const handleDeleteBudget = React.useCallback((category: string) => {
    setConfirmDialog({
      isOpen: true,
      title: settings.language === 'my' ? "ဘတ်ဂျက်ပယ်ဖျက်မည်" : "Delete Budget Limit",
      message: settings.language === 'my'
        ? "သတ်မှတ်ထားသော ဘတ်ဂျက်ကန့်သတ်ချက်ကို ပယ်ဖျက်ရန် သေချာပါသလား?"
        : "Are you sure you want to remove your overall budget limit?",
      confirmText: settings.language === 'my' ? "ပယ်ဖျက်မည်" : "Remove",
      cancelText: settings.language === 'my' ? "မလုပ်တော့ပါ" : "Cancel",
      isDestructive: true,
      onConfirm: () => {
        setBudgets([]);
        showToast("Budget limit removed.", 'info');
        setConfirmDialog(null);
      }
    });
  }, [settings.language]);

  // Preference switches
  const handleUpdateLanguage = React.useCallback((lang: Language) => {
    setSettings((prev) => ({ ...prev, language: lang }));
  }, []);

  const handleUpdateTheme = React.useCallback((theme: 'light' | 'dark') => {
    setSettings((prev) => ({ ...prev, theme }));
  }, []);

  const handleUpdateCurrency = React.useCallback((code: string, symbol: string, name: string) => {
    setCustomCurrency({ code, symbol, name });
    setSettings((prev) => ({ ...prev, currency: code }));
  }, []);

  const handleAddTransactionTrigger = React.useCallback(() => {
    setEditingTxInAddPage(null);
    setActiveTab('add-transaction');
  }, []);

  const handleEditTransactionTrigger = React.useCallback((tx: Transaction) => {
    setEditingTxInAddPage(tx);
    setActiveTab('add-transaction');
  }, []);

  const handleCancelAddTransaction = React.useCallback(() => {
    setActiveTab(lastMainTab);
  }, [lastMainTab]);

  const handleEditProfileClick = React.useCallback(() => {
    setActiveTab('profile');
    setIsProfileEditing(true);
  }, []);

  const handleSaveProfile = React.useCallback((updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    showToast(t('updateProfileSuccess') || 'Profile updated successfully!', 'success');
    setIsProfileEditing(false);
  }, [t]);

  const handleCloseProfile = React.useCallback(() => {
    setActiveTab('dashboard');
    setIsProfileEditing(false);
  }, []);

  // Client-Side CSV Export Generation
  const handleExportCSV = React.useCallback(() => {
    const headers = [t('date'), t('type'), t('category'), t('description'), `${t('amount')} (${customCurrency.code})`].join(',');
    const rows = dashboardFilteredTransactions.map((tx) => {
      return [
        tx.date,
        tx.type === 'income' ? 'Income' : 'Expense',
        tx.category,
        `"${tx.description.replace(/"/g, '""')}"`,
        tx.amount,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    
    const filterSuffix = `Y${selectedYear}_M${selectedMonth}`;
    link.setAttribute('download', `money_manager_report_${filterSuffix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV report downloaded successfully!");
  }, [t, customCurrency.code, dashboardFilteredTransactions, selectedYear, selectedMonth]);

  // PDF Report layout generator triggering Native print-to-PDF flow
  const handleExportPDF = React.useCallback(() => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast("Please allow popups to generate the report", 'error');
      return;
    }

    const getMonthName = (monthValue: string) => {
      const months: Record<string, string> = {
        'all': settings.language === 'en' ? 'All Months' : 'လအားလုံး',
        '01': 'January',
        '02': 'February',
        '03': 'March',
        '04': 'April',
        '05': 'May',
        '06': 'June',
        '07': 'July',
        '08': 'August',
        '09': 'September',
        '10': 'October',
        '11': 'November',
        '12': 'December',
      };
      return months[monthValue] || monthValue;
    };

    const getYearName = (yearValue: string) => {
      return yearValue === 'all' ? (settings.language === 'en' ? 'All Years' : 'နှစ်အားလုံး') : yearValue;
    };

    const totalIncome = dashboardFilteredTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = dashboardFilteredTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netSavings = totalIncome - totalExpense;
    const savingRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    const rows = dashboardFilteredTransactions
      .map(
        (tx) => `
      <tr>
        <td style="font-family: monospace;">${tx.date}</td>
        <td><span class="badge ${tx.type === 'income' ? 'badge-income' : 'badge-expense'}">${tc(tx.category)}</span></td>
        <td>${tx.description}</td>
        <td class="amount ${tx.type === 'income' ? 'text-income' : 'text-expense'}">
          ${tx.type === 'income' ? '+' : '-'}${formatAmount(tx.amount)}
        </td>
      </tr>
    `
      )
      .join('');

    const budgetRows = budgets
      .map((b) => {
        const spent = dashboardFilteredTransactions
          .filter((tx) => tx.type === 'expense' && tx.category === b.category)
          .reduce((sum, tx) => sum + tx.amount, 0);
        const isExceeded = spent > b.limit;
        const percent = b.limit > 0 ? ((spent / b.limit) * 100).toFixed(0) : '0';
        return `
        <tr>
          <td><strong>${tc(b.category)}</strong></td>
          <td class="amount">${formatAmount(b.limit)}</td>
          <td class="amount">${formatAmount(spent)}</td>
          <td>
            <span class="badge ${isExceeded ? 'badge-danger' : 'badge-success'}">
              ${percent}% ${isExceeded ? 'Exceeded' : 'Safe'}
            </span>
          </td>
        </tr>
      `;
      })
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${t('appName')} - PDF Statement</title>
          <style>
            body {
              font-family: 'Inter', -apple-system, sans-serif;
              color: #1e293b;
              margin: 40px;
              line-height: 1.5;
            }
            .header-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
              border-bottom: 3px solid #6366f1;
              padding-bottom: 20px;
            }
            .title {
              font-size: 26px;
              font-weight: 800;
              color: #1e293b;
            }
            .subtitle {
              font-size: 13px;
              color: #64748b;
              margin-top: 5px;
            }
            .summary-grid {
              display: table;
              width: 100%;
              table-layout: fixed;
              border-collapse: separate;
              border-spacing: 15px;
              margin-bottom: 35px;
            }
            .summary-card {
              display: table-cell;
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 14px;
              padding: 20px;
              text-align: center;
            }
            .summary-card .label {
              font-size: 11px;
              color: #64748b;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .summary-card .value {
              font-size: 20px;
              font-weight: 800;
              margin-top: 8px;
            }
            .section-title {
              font-size: 16px;
              font-weight: 800;
              color: #0f172a;
              border-left: 4px solid #6366f1;
              padding-left: 10px;
              margin: 30px 0 15px 0;
            }
            table.data-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            table.data-table th {
              background-color: #f1f5f9;
              color: #475569;
              font-size: 12px;
              font-weight: 700;
              text-align: left;
              padding: 12px;
              border-bottom: 2px solid #cbd5e1;
            }
            table.data-table td {
              padding: 12px;
              font-size: 13px;
              border-bottom: 1px solid #e2e8f0;
            }
            .amount {
              text-align: right;
              font-family: monospace;
              font-weight: 700;
            }
            .text-income { color: #10b981; }
            .text-expense { color: #f43f5e; }
            .badge {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 9999px;
              font-size: 11px;
              font-weight: 600;
            }
            .badge-income { background-color: #ecfdf5; color: #065f46; }
            .badge-expense { background-color: #fff1f2; color: #9f1239; }
            .badge-success { background-color: #f0fdf4; color: #166534; }
            .badge-danger { background-color: #fef2f2; color: #991b1b; }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td>
                <div class="title">${t('appName')}</div>
                <div class="subtitle">Official Financial Report &amp; Balance Sheet</div>
                <div style="font-size: 12px; color: #475569; margin-top: 5px; font-weight: 600;">
                  Period: ${getMonthName(selectedMonth)} / ${getYearName(selectedYear)}
                </div>
              </td>
              <td style="text-align: right; font-size: 12px; color: #64748b;">
                <strong>Date:</strong> ${new Date().toLocaleDateString()}<br/>
                <strong>Currency:</strong> ${customCurrency.name} (${customCurrency.code})<br/>
                <strong>Language:</strong> ${settings.language === 'en' ? 'English' : 'Myanmar'}
              </td>
            </tr>
          </table>

          <div class="summary-grid">
            <div class="summary-card">
              <div class="label">${t('income')}</div>
              <div class="value text-income">+${formatAmount(totalIncome)}</div>
            </div>
            <div class="summary-card">
              <div class="label">${t('expense')}</div>
              <div class="value text-expense">-${formatAmount(totalExpense)}</div>
            </div>
            <div class="summary-card">
              <div class="label">${t('netSavings')}</div>
              <div class="value" style="color: ${netSavings >= 0 ? '#10b981' : '#f43f5e'}">${netSavings < 0 ? '-' : ''}${formatAmount(Math.abs(netSavings))}</div>
            </div>
            <div class="summary-card">
              <div class="label">${t('savingRate')}</div>
              <div class="value">${savingRate.toFixed(1)}%</div>
            </div>
          </div>

          <div class="section-title">${t('budgets')} (${getMonthName(selectedMonth)} ${getYearName(selectedYear)})</div>
          <table class="data-table">
            <thead>
              <tr>
                <th>${t('category')}</th>
                <th style="text-align: right;">${t('budget')}</th>
                <th style="text-align: right;">${t('spent')}</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${budgetRows ? budgetRows : `<tr><td colspan="4" style="text-align: center; color: #94a3b8;">No budget limits configured.</td></tr>`}
            </tbody>
          </table>

          <div class="section-title">${t('transactions')}</div>
          <table class="data-table">
            <thead>
              <tr>
                <th>${t('date')}</th>
                <th>${t('category')}</th>
                <th>${t('description')}</th>
                <th style="text-align: right;">${t('amount')}</th>
              </tr>
            </thead>
            <tbody>
              ${rows ? rows : `<tr><td colspan="4" style="text-align: center; color: #94a3b8;">No transaction logs found.</td></tr>`}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 600);
  }, [settings.language, dashboardFilteredTransactions, selectedMonth, selectedYear, customCurrency, t, formatAmount, budgets]);

  // List of active categories for warning calculations
  const categoriesExceeded = React.useMemo(() => {
    return budgets.filter((b) => {
      const spent = dashboardFilteredTransactions
        .filter((tx) => tx.type === 'expense' && tx.category === b.category)
        .reduce((sum, tx) => sum + tx.amount, 0);
      return spent > b.limit;
    });
  }, [dashboardFilteredTransactions, budgets]);

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-[#09090b] text-[#1c1c1e] dark:text-[#f2f2f7] font-sans transition-colors duration-300 pb-28 lg:pb-8 relative overflow-hidden`}>
      {/* iOS Liquid Backdrops */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 no-print">
        <div className="absolute top-[10%] left-[-10%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full filter blur-[80px] md:blur-[140px] animate-blob-1 opacity-50 dark:opacity-30 bg-gradient-to-tr from-[#007aff]/20 to-[#af52de]/20" />
        <div className="absolute top-[40%] right-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full filter blur-[70px] md:blur-[120px] animate-blob-2 opacity-45 dark:opacity-25 bg-gradient-to-tr from-[#34c759]/15 to-[#5ac8fa]/15" />
        <div className="absolute bottom-[15%] left-[10%] w-[400px] md:w-[650px] h-[400px] md:h-[650px] rounded-full filter blur-[90px] md:blur-[150px] animate-blob-3 opacity-40 dark:opacity-20 bg-gradient-to-tr from-[#ff9500]/15 to-[#ff3b30]/15" />
      </div>

      {/* Toast Notification (iOS Dynamic Island Style) */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-full backdrop-blur-xl bg-white/95 dark:bg-[#1c1c1e]/95 shadow-[0_12px_36px_rgba(0,0,0,0.12)] text-[#1c1c1e] dark:text-white font-semibold text-xs md:text-sm border border-black/5 dark:border-white/10 transition-all max-w-[90%]"
          >
            <div className={`w-2 h-2 rounded-full shrink-0 ${
              toast.type === 'success' ? 'bg-[#34c759]' : toast.type === 'error' ? 'bg-[#ff3b30]' : 'bg-[#007aff]'
            }`} />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Banner for Budget Warnings */}
      {categoriesExceeded.length > 0 && (
        <div className="relative z-10 bg-rose-500 text-white py-2 px-4 text-center text-xs font-semibold flex items-center justify-center gap-2 shadow-sm animate-pulse no-print">
          <AlertTriangle className="w-4 h-4" />
          <span>
            {t('overBudget')}: {categoriesExceeded.map((c) => tc(c.category)).join(', ')}
          </span>
        </div>
      )}

      {/* Top Header */}
      <header className="relative z-40 backdrop-blur-2xl bg-white/35 dark:bg-black/45 border-b border-white/40 dark:border-white/10 sticky top-0 no-print transition-all shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#007aff] rounded-2xl flex items-center justify-center text-white shadow-xs">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-bold tracking-tight text-[#1c1c1e] dark:text-[#f2f2f7] font-sans">
                {t('appName')}
              </h1>
              <p className="text-[10px] text-[#8e8e93] font-mono tracking-wider uppercase font-medium">
                {customCurrency.code} Mode
              </p>
            </div>
          </div>

          {/* Quick toggle settings in top bar */}
          <div className="flex items-center gap-2">
            {/* Language toggle quick button */}
            <button
              id="quick-lang-toggle"
              onClick={() => handleUpdateLanguage(settings.language === 'en' ? 'my' : 'en')}
              className="px-2.5 py-1.5 text-[#007aff] hover:bg-[#007aff]/10 rounded-full transition-all cursor-pointer font-bold text-xs"
              title="Switch Language"
            >
              {settings.language === 'en' ? 'MY' : 'EN'}
            </button>

            {/* Theme Toggle Button */}
            <button
              id="quick-theme-toggle"
              onClick={() => handleUpdateTheme(settings.theme === 'light' ? 'dark' : 'light')}
              className="p-2 text-[#8e8e93] hover:text-[#007aff] hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all cursor-pointer"
              title="Toggle Theme"
            >
              {settings.theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Quick Profile Switch */}
            <button
              id="navbar-profile-btn"
              onClick={() => {
                setActiveTab('profile');
                setIsProfileEditing(false);
              }}
              className={`p-1.5 rounded-full transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'profile' ? 'ring-2 ring-[#007aff]' : ''
              }`}
              title={t('profile')}
            >
              <img
                src={profile.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={profile.name}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover"
              />
              <span className="hidden md:inline text-xs font-semibold text-[#1c1c1e] dark:text-[#f2f2f7] pr-1 font-sans">
                {profile.name.split(' ')[0]}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-6 font-sans">
        {/* Navigation Sidebar for Large Screen & Header Tabs */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Rail Desktop Navigation Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-1.5 no-print">
            {[
              { id: 'dashboard', label: t('dashboard'), icon: Wallet },
              { id: 'transactions', label: t('transactions'), icon: History },
              { id: 'budgets', label: t('budgets'), icon: PiggyBank },
              { id: 'analytics', label: t('analytics'), icon: TrendingUp },
              { id: 'settings', label: t('settings'), icon: SettingsIcon },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`rail-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full h-11 flex items-center gap-3.5 px-4 rounded-2xl text-sm font-bold transition-all text-left cursor-pointer border-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#007aff] to-[#0066d6] text-white shadow-[0_4px_12px_rgba(0,122,255,0.25),inset_0_1px_1px_rgba(255,255,255,0.35)]'
                      : 'text-[#8e8e93] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#1c1c1e] dark:hover:text-[#f2f2f7]'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </aside>

          {/* Main content body panel */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Global Date Range Switcher */}
            {activeTab === 'dashboard' && (
              <div className="relative z-40 p-4 ios-glass rounded-[2rem] flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-[#007aff]/10 dark:bg-[#007aff]/15 rounded-full flex items-center justify-center text-[#007aff] shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-[#8e8e93] uppercase tracking-wider font-sans">
                    Filter Range
                  </span>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
                  {/* Month Dropdown Menu */}
                  <div className={`relative font-sans flex-1 sm:flex-initial w-full sm:w-[100px] ${showMonthMenu ? 'z-50' : 'z-10'}`} id="month-dropdown-container">
                    <button
                      id="month-dropdown-btn"
                      onClick={() => {
                        setShowMonthMenu(!showMonthMenu);
                        setShowYearMenu(false);
                      }}
                      className="w-full flex items-center justify-between gap-1.5 h-8 px-2 bg-[#f2f2f7] dark:bg-[#2c2c2e] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-[#1c1c1e] dark:text-[#f2f2f7] rounded-full text-xs font-bold transition-all cursor-pointer border-0"
                    >
                      <span className="truncate">{monthOptions.find(m => m.value === selectedMonth)?.label || selectedMonth}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-[#8e8e93] shrink-0" />
                    </button>

                    <AnimatePresence>
                      {showMonthMenu && (
                        <>
                          <div
                            className="fixed inset-0 z-30 bg-transparent"
                            onClick={() => setShowMonthMenu(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 mt-1 w-full min-w-[100px] max-h-48 overflow-y-auto rounded-2xl bg-white/75 dark:bg-[#1c1c1e]/70 backdrop-blur-2xl border border-white/50 dark:border-white/12 shadow-2xl z-50 p-1.5 space-y-0.5 scrollbar-thin"
                          >
                            {monthOptions.map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                  setSelectedMonth(opt.value);
                                  setShowMonthMenu(false);
                                }}
                                className={`w-full text-left px-2 py-1.5 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer ${
                                  selectedMonth === opt.value
                                    ? 'bg-[#007aff] text-white'
                                    : 'bg-transparent text-[#1c1c1e] dark:text-[#f2f2f7] hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Year Dropdown Menu */}
                  <div className={`relative font-sans flex-1 sm:flex-initial w-full sm:w-[90px] ${showYearMenu ? 'z-50' : 'z-10'}`} id="year-dropdown-container">
                    <button
                      id="year-dropdown-btn"
                      onClick={() => {
                        setShowYearMenu(!showYearMenu);
                        setShowMonthMenu(false);
                      }}
                      className="w-full flex items-center justify-between gap-1.5 h-8 px-2 bg-[#f2f2f7] dark:bg-[#2c2c2e] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-[#1c1c1e] dark:text-[#f2f2f7] rounded-full text-xs font-bold transition-all cursor-pointer border-0"
                    >
                      <span className="truncate">{selectedYear === 'all' ? (settings.language === 'my' ? 'နှစ်အားလုံး' : 'All Years') : selectedYear}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-[#8e8e93] shrink-0" />
                    </button>

                    <AnimatePresence>
                      {showYearMenu && (
                        <>
                          <div
                            className="fixed inset-0 z-30 bg-transparent"
                            onClick={() => setShowYearMenu(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 mt-1 w-full min-w-[90px] max-h-48 overflow-y-auto rounded-2xl bg-white/75 dark:bg-[#1c1c1e]/70 backdrop-blur-2xl border border-white/50 dark:border-white/12 shadow-2xl z-50 p-1.5 space-y-0.5 scrollbar-thin"
                          >
                            {availableYears.map((yr) => (
                              <button
                                key={yr}
                                type="button"
                                onClick={() => {
                                  setSelectedYear(yr);
                                  setShowYearMenu(false);
                                }}
                                className={`w-full text-left px-2 py-1.5 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer ${
                                  selectedYear === yr
                                    ? 'bg-[#007aff] text-white'
                                    : 'bg-transparent text-[#1c1c1e] dark:text-[#f2f2f7] hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
                                }`}
                              >
                                {yr}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedYear('all');
                                setShowYearMenu(false);
                              }}
                              className={`w-full text-left px-2 py-1.5 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer ${
                                selectedYear === 'all'
                                  ? 'bg-[#007aff] text-white'
                                  : 'bg-transparent text-[#1c1c1e] dark:text-[#f2f2f7] hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
                              }`}
                            >
                              {settings.language === 'my' ? 'နှစ်အားလုံး' : 'All Years'}
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Reset Button */}
                  <button
                    id="dashboard-date-reset-btn"
                    onClick={() => {
                      setSelectedMonth(new Date().toISOString().substring(5, 7));
                      setSelectedYear(new Date().toISOString().substring(0, 4));
                    }}
                    className="flex-1 sm:flex-initial h-8 px-4 flex items-center justify-center bg-[#007aff]/10 hover:bg-[#007aff]/20 text-[#007aff] rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-w-[80px]"
                    title="Reset to current month"
                  >
                    <span className="truncate">{t('thisMonth')}</span>
                  </button>
                </div>
              </div>
            )}

            <div key={activeTab}>
                {/* 1. Dashboard Tab */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-6" id="view-dashboard">
                    {/* Welcome Grid - Apple Card Style */}
                    <div className="ios-glass text-[#1c1c1e] dark:text-[#f2f2f7] rounded-[2rem] p-6 relative overflow-hidden transition-all duration-300">
                      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                        {/* Left side: Balance (7 cols on md) */}
                        <div className="md:col-span-7 space-y-2.5">
                          <div className="flex items-center gap-2">
                            <span className="flex h-2.5 w-2.5 rounded-full bg-[#34c759] animate-pulse" />
                            <span className="text-[#8e8e93] text-[10px] md:text-xs font-bold uppercase tracking-widest font-sans">
                              {t('totalBalance')}
                            </span>
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#f2f2f7] dark:bg-[#2c2c2e] text-[#1c1c1e] dark:text-[#f2f2f7] font-bold">
                              {selectedMonth === 'all' ? t('allMonths') : selectedMonth}/{selectedYear === 'all' ? t('allYears') : selectedYear}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1c1c1e] dark:text-white font-sans tracking-tight leading-none">
                              {formatAmount(totals.balance)}
                            </h2>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              totals.balance >= 0 ? 'bg-[#34c759]/10 text-[#34c759]' : 'bg-[#ff3b30]/10 text-[#ff3b30]'
                            }`}>
                              {totals.balance >= 0 ? 'Healthy' : 'Overdraft'}
                            </span>
                          </div>
                        </div>

                        {/* Right side: Income/Expense Side-by-Side (5 cols on md) */}
                        <div className="md:col-span-5 grid grid-cols-2 gap-3">
                          {/* Income Mini Card */}
                          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#f2f2f7]/50 dark:bg-[#2c2c2e]/40 border border-[#e5e5ea]/50 dark:border-white/5">
                            <div className="w-8 h-8 rounded-full bg-[#34c759]/10 flex items-center justify-center shrink-0">
                              <ArrowUpRight className="w-4.5 h-4.5 text-[#34c759]" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[#8e8e93] text-[9px] uppercase font-bold block tracking-wider">{t('income')}</span>
                              <span className="font-extrabold text-xs md:text-sm text-[#34c759] font-mono truncate block mt-0.5">
                                {formatAmount(totals.income)}
                              </span>
                            </div>
                          </div>

                          {/* Expense Mini Card */}
                          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#f2f2f7]/50 dark:bg-[#2c2c2e]/40 border border-[#e5e5ea]/50 dark:border-white/5">
                            <div className="w-8 h-8 rounded-full bg-[#ff3b30]/10 flex items-center justify-center shrink-0">
                              <ArrowDownLeft className="w-4.5 h-4.5 text-[#ff3b30]" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[#8e8e93] text-[9px] uppercase font-bold block tracking-wider">{t('expense')}</span>
                              <span className="font-extrabold text-xs md:text-sm text-[#ff3b30] font-mono truncate block mt-0.5">
                                {formatAmount(totals.expense)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Shortcuts Bar - Refined & Polished */}
                    <div className="p-2 bg-white/40 dark:bg-black/20 rounded-2xl flex items-center justify-between gap-1 no-print border border-white/20 dark:border-white/5 shadow-xs">
                      <button
                        id="quick-add-tx"
                        onClick={() => {
                          setEditingTxInAddPage(null);
                          setActiveTab('add-transaction');
                        }}
                        className="flex-1 h-11 flex items-center justify-center gap-2 px-3 rounded-xl hover:bg-[#007aff]/10 dark:hover:bg-[#007aff]/15 text-[#007aff] transition-all duration-200 cursor-pointer group border-0"
                      >
                        <div className="w-6 h-6 rounded-full bg-[#007aff]/10 flex items-center justify-center text-[#007aff] shrink-0 group-hover:scale-105 transition-transform">
                          <Plus className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[11px] sm:text-xs font-bold leading-none">{t('quickAdd')}</span>
                      </button>

                      <div className="w-[1px] h-5 bg-[#e5e5ea] dark:bg-white/10 shrink-0" />

                      <button
                        id="quick-set-budget"
                        onClick={() => setActiveTab('budgets')}
                        className="flex-1 h-11 flex items-center justify-center gap-2 px-3 rounded-xl hover:bg-[#34c759]/10 dark:hover:bg-[#34c759]/15 text-[#34c759] transition-all duration-200 cursor-pointer group border-0"
                      >
                        <div className="w-6 h-6 rounded-full bg-[#34c759]/10 flex items-center justify-center text-[#34c759] shrink-0 group-hover:scale-105 transition-transform">
                          <PiggyBank className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[11px] sm:text-xs font-bold leading-none">{t('quickBudget')}</span>
                      </button>

                      <div className="w-[1px] h-5 bg-[#e5e5ea] dark:bg-white/10 shrink-0" />

                      <button
                        id="quick-export-pdf"
                        onClick={handleExportPDF}
                        className="flex-1 h-11 flex items-center justify-center gap-2 px-3 rounded-xl hover:bg-[#af52de]/10 dark:hover:bg-[#af52de]/15 text-[#af52de] transition-all duration-200 cursor-pointer group border-0"
                      >
                        <div className="w-6 h-6 rounded-full bg-[#af52de]/10 flex items-center justify-center text-[#af52de] shrink-0 group-hover:scale-105 transition-transform">
                          <FileDown className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[11px] sm:text-xs font-bold leading-none">{t('quickPDF')}</span>
                      </button>
                    </div>

                    {/* Mini Ledger and Analytics Grid */}
                    <div className="space-y-6">
                      {/* Budgets Summary Mini Card - Moved to Top & Extensively Polished */}
                      <div className="p-6 ios-glass rounded-[2rem] border border-black/5 dark:border-white/5 space-y-5 shadow-xs">
                        {(() => {
                          const activeBudget = budgets[0];
                          if (!activeBudget) {
                            return (
                              <div className="text-center py-8">
                                <p className="text-xs text-[#8e8e93] mb-2">{t('noBudgetsSet')}</p>
                                <button
                                  id="set-initial-budget"
                                  onClick={() => setActiveTab('budgets')}
                                  className="h-9 px-4 inline-flex items-center justify-center bg-[#34c759] text-white rounded-full text-xs font-bold transition-all hover:opacity-90 shadow-xs cursor-pointer border-0"
                                >
                                  {settings.language === 'my' ? "ဘတ်ဂျက်သတ်မှတ်ရန်" : "Set Budget Limit"}
                                </button>
                              </div>
                            );
                          }
                          const spent = dashboardFilteredTransactions
                            .filter((tx) => tx.type === 'expense')
                            .reduce((sum, tx) => sum + tx.amount, 0);
                          const percent = activeBudget.limit > 0 ? (spent / activeBudget.limit) * 100 : 0;
                          const isExceeded = spent > activeBudget.limit;
                          const remainingAmount = activeBudget.limit - spent;
                          const overspentAmount = Math.abs(remainingAmount);

                          return (
                            <div className="space-y-5">
                              {/* Header Title & Pulse Status badge */}
                              <div className="flex items-center justify-between border-b border-[#f2f2f7] dark:border-[#2c2c2e] pb-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-2xl bg-[#34c759]/10 text-[#34c759] flex items-center justify-center shrink-0">
                                    <PiggyBank className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-extrabold text-[#1c1c1e] dark:text-white leading-none">
                                      {t('budgetStatus')}
                                    </h3>
                                    <span className="text-[10px] text-[#8e8e93] font-bold uppercase tracking-wider block mt-1">
                                      {settings.language === 'my' ? 'လစဉ်သုံးစွဲမှုအခြေအနေ' : 'MONTHLY SPENDING HEALTH'}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {isExceeded ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff3b30]/10 text-[#ff3b30] text-[10px] font-extrabold border border-[#ff3b30]/10">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30] animate-pulse" />
                                      {t('overBudget') || 'Over Budget!'}
                                    </span>
                                  ) : percent >= 75 ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff9500]/10 text-[#ff9500] text-[10px] font-extrabold border border-[#ff9500]/10">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff9500] animate-pulse" />
                                      {settings.language === 'my' ? 'သတိပြုစရာ' : 'Near Limit'}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#34c759]/10 text-[#34c759] text-[10px] font-extrabold border border-[#34c759]/10">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#34c759] animate-pulse" />
                                      {settings.language === 'my' ? 'အခြေအနေကောင်း' : 'On Track'}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Executive 3-Column Metrics Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
                                {/* Total Limit Box */}
                                <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.03] dark:border-white/[0.03] flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-[#007aff]/10 text-[#007aff] flex items-center justify-center shrink-0">
                                    <Wallet className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="text-[10px] text-[#8e8e93] font-bold uppercase tracking-wider block">
                                      {t('overallMonthlyBudget') || 'Monthly Budget'}
                                    </span>
                                    <span className="font-extrabold text-xs md:text-sm text-[#1c1c1e] dark:text-white font-mono block mt-0.5 truncate">
                                      {formatAmount(activeBudget.limit)}
                                    </span>
                                  </div>
                                </div>

                                {/* Total Spent Box */}
                                <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.03] dark:border-white/[0.03] flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-[#ff9500]/10 text-[#ff9500] flex items-center justify-center shrink-0">
                                    <ArrowDownLeft className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="text-[10px] text-[#8e8e93] font-bold uppercase tracking-wider block">
                                      {t('totalExpenseSpent') || 'Spent'}
                                    </span>
                                    <span className="font-extrabold text-xs md:text-sm text-[#ff3b30] font-mono block mt-0.5 truncate">
                                      {formatAmount(spent)}
                                    </span>
                                  </div>
                                </div>

                                {/* Remaining / Over Budget Box */}
                                <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.03] dark:border-white/[0.03] flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isExceeded ? 'bg-[#ff3b30]/10 text-[#ff3b30]' : 'bg-[#34c759]/10 text-[#34c759]'}`}>
                                    {isExceeded ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                  </div>
                                  <div className="min-w-0">
                                    <span className="text-[10px] text-[#8e8e93] font-bold uppercase tracking-wider block">
                                      {isExceeded ? (t('overBudgetLimit') || 'Over Budget') : (t('availableRemainingSpend') || 'Remaining')}
                                    </span>
                                    <span className={`font-extrabold text-xs md:text-sm font-mono block mt-0.5 truncate ${isExceeded ? 'text-[#ff3b30]' : 'text-[#34c759]'}`}>
                                      {isExceeded ? formatAmount(overspentAmount) : formatAmount(remainingAmount)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Beautiful Progress Bar & Motivational text */}
                              <div className="space-y-2.5 pt-1">
                                <div className="w-full h-3 bg-[#f2f2f7] dark:bg-white/10 rounded-full overflow-hidden p-[2px] border border-[#e5e5ea] dark:border-white/5 shadow-inner">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                                      isExceeded
                                        ? 'bg-gradient-to-r from-[#ff3b30] to-[#ff453a] shadow-[0_0_8px_rgba(255,59,48,0.3)]'
                                        : percent >= 75
                                          ? 'bg-gradient-to-r from-[#ff9500] to-[#ffaa00] shadow-[0_0_8px_rgba(255,149,0,0.3)]'
                                          : 'bg-gradient-to-r from-[#34c759] to-[#30d158] shadow-[0_0_8px_rgba(52,199,89,0.3)]'
                                    }`}
                                    style={{ width: `${Math.min(percent, 100)}%` }}
                                  />
                                </div>
                                <div className="flex items-center justify-between text-[11px] font-semibold text-[#8e8e93]">
                                  <span className="font-mono">
                                    {percent.toFixed(1)}% {settings.language === 'my' ? 'ဘတ်ဂျက်သုံးစွဲပြီး' : 'budget spent'}
                                  </span>
                                  <span className="italic block max-w-[70%] text-right truncate">
                                    {isExceeded
                                      ? (settings.language === 'my' ? "သတိပေးချက် - လစဉ်ဘတ်ဂျက် ကန့်သတ်ချက်ကျော်လွန်သွားပါပြီ။" : "Alert: Monthly budget limit exceeded!")
                                      : percent >= 75
                                        ? (settings.language === 'my' ? "သတိပြုရန် - ဘတ်ဂျက်ကုန်ခါနီး ဖြစ်နေပါပြီ။" : "Caution: You have used over 75% of your budget.")
                                        : (settings.language === 'my' ? "သုံးစွဲမှုအခြေအနေ စိတ်ချရပါသည်" : "Excellent control! Your monthly budget is safe.")
                                    }
                                  </span>
                                </div>
                              </div>

                              {/* Footer note & actions */}
                              <div className="flex items-center justify-between pt-3 border-t border-[#f2f2f7] dark:border-[#2c2c2e]">
                                <span className="text-[10px] text-[#8e8e93] font-bold tracking-wider uppercase">
                                  {settings.language === 'my' ? 'ဘတ်ဂျက်ပြင်ဆင်ရန် နှိပ်ပါ' : 'ADJUST YOUR PARAMETERS'}
                                </span>
                                <button
                                  id="adjust-overall-budget"
                                  onClick={() => setActiveTab('budgets')}
                                  className="text-xs font-bold text-[#007aff] hover:bg-[#007aff]/5 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all duration-200 cursor-pointer border-0 shrink-0"
                                >
                                  <span>{t('edit')}</span>
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Recent Activities Panel - Extensively Polished */}
                      <div className="p-6 ios-glass rounded-[2rem] border border-black/5 dark:border-white/5 space-y-4 shadow-xs">
                        <div className="flex items-center justify-between border-b border-[#f2f2f7] dark:border-[#2c2c2e] pb-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-[#007aff]/10 text-[#007aff] flex items-center justify-center shrink-0">
                              <History className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-sm font-extrabold text-[#1c1c1e] dark:text-white leading-none">
                                {t('recentTransactions')}
                              </h3>
                              <span className="text-[10px] text-[#8e8e93] font-bold uppercase tracking-wider block mt-1">
                                {settings.language === 'my' ? 'လတ်တလော ဝင်/ထွက်မှတ်တမ်းများ' : 'LATEST LEDGER ACTIVITIES'}
                              </span>
                            </div>
                          </div>
                          
                          <button
                            id="view-all-tx"
                            onClick={() => setActiveTab('transactions')}
                            className="text-xs font-extrabold text-[#007aff] hover:underline bg-[#007aff]/5 hover:bg-[#007aff]/10 px-3 py-1.5 rounded-full transition-all cursor-pointer border-0"
                          >
                            {t('all')}
                          </button>
                        </div>

                        <div className="space-y-2.5">
                          {dashboardFilteredTransactions.slice(0, 5).map((tx) => {
                            const style = getCategoryStyle(tx.category);
                            return (
                              <div
                                key={tx.id}
                                className="group flex items-center justify-between p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200"
                              >
                                <div className="flex items-center gap-3.5 min-w-0">
                                  <div
                                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 border ${style.bg} ${style.text} ${style.border}`}
                                  >
                                    {tx.type === 'income' ? (
                                      <ArrowUpRight className="w-5 h-5" />
                                    ) : (
                                      <ArrowDownLeft className="w-5 h-5" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-extrabold text-[#1c1c1e] dark:text-[#f2f2f7] truncate leading-tight">
                                      {tx.description}
                                    </p>
                                    <span className="text-[10px] text-[#8e8e93] font-mono block mt-1 uppercase font-bold tracking-wider">
                                      {tc(tx.category)} | {formatDateDMY(tx.date)}
                                    </span>
                                  </div>
                                </div>
                                <span
                                  className={`text-sm md:text-base font-extrabold font-mono whitespace-nowrap leading-none ${
                                    tx.type === 'income' ? 'text-[#34c759]' : 'text-[#ff3b30]'
                                  }`}
                                >
                                  {tx.type === 'income' ? '+' : '-'}{formatAmount(tx.amount)}
                                </span>
                              </div>
                            );
                          })}
                          {dashboardFilteredTransactions.length === 0 && (
                            <div className="text-center py-10">
                              <p className="text-xs text-[#8e8e93]">
                                {t('noTransactions')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Transactions Section */}
                {activeTab === 'transactions' && (
                  <TransactionsSection
                    transactions={dashboardFilteredTransactions}
                    currencySymbol={customCurrency.symbol}
                    language={settings.language}
                    onAddTransaction={handleAddTransaction}
                    onEditTransaction={handleEditTransaction}
                    onDeleteTransaction={handleDeleteTransaction}
                    formatAmount={formatAmount}
                    incomeCategories={incomeCategories}
                    expenseCategories={expenseCategories}
                    onAddTransactionTrigger={() => {
                      setEditingTxInAddPage(null);
                      setActiveTab('add-transaction');
                    }}
                    onEditTransactionTrigger={(tx) => {
                      setEditingTxInAddPage(tx);
                      setActiveTab('add-transaction');
                    }}
                  />
                )}

                {/* 7. Add/Edit Transaction Section */}
                {activeTab === 'add-transaction' && (
                  <AddTransactionSection
                    language={settings.language}
                    currencySymbol={customCurrency.symbol}
                    currencyCode={customCurrency.code}
                    incomeCategories={incomeCategories}
                    expenseCategories={expenseCategories}
                    onAddTransaction={handleAddTransaction}
                    onCancel={() => setActiveTab(lastMainTab)}
                    initialTransaction={editingTxInAddPage}
                    onEditTransaction={handleEditTransaction}
                    formatAmount={formatAmount}
                  />
                )}

                {/* 3. Budgets Section */}
                {activeTab === 'budgets' && (
                  <BudgetSection
                    budgets={budgets}
                    transactions={dashboardFilteredTransactions}
                    currencySymbol={customCurrency.symbol}
                    language={settings.language}
                    onSaveBudget={handleSaveBudget}
                    onDeleteBudget={handleDeleteBudget}
                    formatAmount={formatAmount}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                  />
                )}

                {/* 4. Analytics Section */}
                {activeTab === 'analytics' && (
                  <AnalyticsSection
                    transactions={dashboardFilteredTransactions}
                    currencySymbol={customCurrency.symbol}
                    language={settings.language}
                    formatAmount={formatAmount}
                  />
                )}

                {/* 5. Settings Section */}
                {activeTab === 'settings' && (
                  <SettingsSection
                    settings={settings}
                    customCurrency={customCurrency}
                    onUpdateLanguage={handleUpdateLanguage}
                    onUpdateTheme={handleUpdateTheme}
                    onUpdateCurrency={handleUpdateCurrency}
                    onExportCSV={handleExportCSV}
                    onExportPDF={handleExportPDF}
                    incomeCategories={incomeCategories}
                    expenseCategories={expenseCategories}
                    onAddCategory={handleAddCategory}
                    onDeleteCategory={handleDeleteCategory}
                    onLoadDemoData={handleLoadDemoData}
                    onClearAllData={handleClearAllData}
                    profile={profile}
                    onEditProfileClick={() => {
                      setActiveTab('profile');
                      setIsProfileEditing(true);
                    }}
                    googleUser={googleUser}
                    syncStatus={syncStatus}
                    lastSyncedTime={lastSyncedTime}
                    autoSyncEnabled={autoSyncEnabled}
                    onToggleAutoSync={handleToggleAutoSync}
                    onConnectGoogleDrive={handleConnectGoogleDrive}
                    onDisconnectGoogleDrive={handleDisconnectGoogleDrive}
                    onTriggerDriveUpload={handleTriggerDriveUpload}
                    onTriggerDriveDownload={handleTriggerDriveDownload}
                  />
                )}

                {/* 6. Profile Section */}
                {activeTab === 'profile' && (
                  <ProfileSection
                    profile={profile}
                    onSaveProfile={(updatedProfile) => {
                      setProfile(updatedProfile);
                      showToast(t('updateProfileSuccess') || 'Profile updated successfully!', 'success');
                      setIsProfileEditing(false);
                    }}
                    language={settings.language}
                    onClose={() => {
                      setActiveTab('dashboard');
                      setIsProfileEditing(false);
                    }}
                    initialEdit={isProfileEditing}
                  />
                )}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation for Mobile Devices */}
      <nav className="fixed bottom-4 left-4 right-4 backdrop-blur-2xl bg-white/35 dark:bg-[#0d0d11]/45 border border-white/50 dark:border-white/10 p-2.5 flex items-center justify-around lg:hidden no-print z-40 transition-all rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
        {[
          { id: 'dashboard', label: t('dashboard'), icon: Wallet },
          { id: 'transactions', label: t('transactions'), icon: History },
          { id: 'budgets', label: t('budgets'), icon: PiggyBank },
          { id: 'analytics', label: t('analytics'), icon: TrendingUp },
          { id: 'settings', label: t('settings'), icon: SettingsIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`mobile-nav-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-[#007aff] font-bold scale-105'
                  : 'text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-[#f2f2f7]'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-[9px] font-bold tracking-tight w-full truncate text-center block mt-0.5">
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* iOS Liquid Glass PWA Install guidance overlay */}
      <AnimatePresence>
        {showIOSPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 p-5 ios-glass rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.3)] border border-white/20 dark:border-white/10 no-print"
          >
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#007aff] to-[#5856d6] flex items-center justify-center text-white shadow-md shadow-[#007aff]/10 shrink-0">
                  <span className="text-xl font-bold font-sans">$</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1c1c1e] dark:text-[#f2f2f7]">
                    Install Money Manager
                  </h4>
                  <p className="text-[10px] text-[#8e8e93] font-bold uppercase tracking-wider">
                    Native iOS App Experience
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowIOSPrompt(false);
                  sessionStorage.setItem('mm_ios_pwa_dismissed', 'true');
                }}
                className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-[#f2f2f7] transition-colors cursor-pointer border-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-xs text-[#1c1c1e]/80 dark:text-[#f2f2f7]/80 leading-relaxed mb-4">
              Install this app on your device's home screen for seamless fullscreen execution, instant offline launch, and perfect liquid glass interface rendering.
            </p>
            
            <div className="space-y-3 bg-black/[0.03] dark:bg-white/[0.03] p-3.5 rounded-2xl">
              <div className="flex items-center gap-3 text-xs">
                <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#1c1c1e] flex items-center justify-center text-[#007aff] shadow-xs shrink-0">
                  <Share className="w-4 h-4" />
                </div>
                <p className="text-[#1c1c1e] dark:text-[#f2f2f7] font-semibold">
                  1. Tap the <span className="font-bold">Share</span> button in Safari.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#1c1c1e] flex items-center justify-center text-[#007aff] shadow-xs shrink-0">
                  <Plus className="w-4 h-4" />
                </div>
                <p className="text-[#1c1c1e] dark:text-[#f2f2f7] font-semibold">
                  2. Scroll down and choose <span className="font-bold">Add to Home Screen</span>.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Confirmation Dialog */}
      <AnimatePresence>
        {confirmDialog?.isOpen && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDialog(null)}
              className="absolute inset-0 bg-black/45 backdrop-blur-xs"
            />

            {/* Modal Content - iOS Pop-up style */}
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 10 }}
              className="relative w-full max-w-sm p-6 bg-white/75 dark:bg-[#1c1c1e]/70 backdrop-blur-2xl rounded-3xl border border-white/50 dark:border-white/12 shadow-2xl space-y-4 text-center z-10"
            >
              <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                confirmDialog.isDestructive 
                  ? 'bg-red-500/10 text-red-500' 
                  : 'bg-[#5856d6]/10 text-[#5856d6]'
              }`}>
                {confirmDialog.isDestructive ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <RefreshCw className="w-6 h-6" />
                )}
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#1c1c1e] dark:text-white">
                  {confirmDialog.title}
                </h3>
                <p className="text-xs text-[#8e8e93] leading-relaxed px-2">
                  {confirmDialog.message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (confirmDialog.onCancel) {
                      confirmDialog.onCancel();
                    } else {
                      setConfirmDialog(null);
                    }
                  }}
                  className="h-11 rounded-2xl flex items-center justify-center text-xs font-bold text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white bg-[#f2f2f7] dark:bg-[#2c2c2e] hover:bg-[#e5e5ea] dark:hover:bg-[#3a3a3c] transition-all cursor-pointer border-0"
                >
                  {confirmDialog.cancelText}
                </button>
                <button
                  type="button"
                  onClick={confirmDialog.onConfirm}
                  className={`h-11 rounded-2xl text-xs font-bold text-white transition-all cursor-pointer border-0 ${
                    confirmDialog.isDestructive
                      ? 'bg-[#ff3b30] hover:bg-[#e03026]'
                      : 'bg-[#5856d6] hover:bg-[#4b49be]'
                  }`}
                >
                  {confirmDialog.confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Welcome Onboarding Screen */}
      <OnboardingModal isOpen={showOnboarding} onComplete={handleOnboardingComplete} />
    </div>
  );
}
