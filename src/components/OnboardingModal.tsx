import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Coins, 
  Globe, 
  User, 
  Wallet, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  PiggyBank,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Language, Currency } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (data: {
    name: string;
    language: Language;
    currency: Currency;
    financialGoals: string[];
  }) => void;
}

const PRESET_CURRENCIES: Currency[] = [
  { code: 'MMK', symbol: 'Ks', name: 'Myanmar Kyat' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' }
];

export function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState<number>(0);
  const [name, setName] = useState<string>('');
  const [language, setLanguage] = useState<Language>('en');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(PRESET_CURRENCIES[0]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['track']);
  const [nameError, setNameError] = useState<string | undefined>(undefined);

  const goals = [
    {
      id: 'track',
      icon: <Coins className="w-5 h-5 text-[#007aff]" />,
      title: language === 'en' ? 'Track Daily Spending' : 'နေ့စဉ် သုံးစွဲမှု ခြေရာခံရန်',
      desc: language === 'en' ? 'Log expenses easily and analyze category trends.' : 'နေ့စဉ် သုံးစွဲမှုများကို လွယ်ကူစွာ မှတ်သားပြီး ခွဲခြားဆန်းစစ်မည်။',
    },
    {
      id: 'save',
      icon: <PiggyBank className="w-5 h-5 text-[#34c759]" />,
      title: language === 'en' ? 'Build Savings' : 'စုဆောင်းငွေ စုဆောင်းရန်',
      desc: language === 'en' ? 'Monitor cashflow and grow your primary savings.' : 'လက်ကျန်ငွေများကို စောင့်ကြည့်ပြီး စုဆောင်းငွေ တိုးပွားစေမည်။',
    },
    {
      id: 'budget',
      icon: <Wallet className="w-5 h-5 text-[#ff9500]" />,
      title: language === 'en' ? 'Control Budgets' : 'ဘတ်ဂျက်ကို ထိန်းချုပ်ရန်',
      desc: language === 'en' ? 'Set monthly spending limits to prevent overspending.' : 'မလိုလားအပ်သော သုံးစွဲမှုများ မရှိစေရန် လစဉ်ဘတ်ဂျက် ကန့်သတ်မည်။',
    },
    {
      id: 'analytics',
      icon: <Sparkles className="w-5 h-5 text-[#5856d6]" />,
      title: language === 'en' ? 'Analyze Financial Health' : 'ငွေကြေးအခြေအနေ ဆန်းစစ်ရန်',
      desc: language === 'en' ? 'Review beautiful reports and clean financial insights.' : 'ဝင်ငွေ၊ ထွက်ငွေ ဇယားများနှင့် အစီရင်ခံစာများကို စောင့်ကြည့်မည်။',
    },
  ];

  const toggleGoal = (id: string) => {
    setSelectedGoals(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Keep at least one selected
        return prev.filter(g => g !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) {
        setNameError(language === 'en' ? "Please enter your name" : "ကျေးဇူးပြု၍ သင့်အမည်ကို ထည့်သွင်းပေးပါ");
        return;
      }
      setNameError(undefined);
    }
    if (step < 2) {
      setStep(prev => prev + 1);
    } else {
      onComplete({
        name: name.trim(),
        language,
        currency: selectedCurrency,
        financialGoals: selectedGoals
      });
    }
  };

  const handlePrev = () => {
    setNameError(undefined);
    if (step > 0) {
      setStep(prev => prev - 1);
    }
  };

  // Onboarding Translations inside component for clean localization
  const content = {
    en: {
      welcome: "Welcome to Money Manager",
      tagline: "Your Premium Liquid Glass Financial Suite",
      description1: "Take absolute control of your personal finances with real-time analytics, dynamic custom budgets, localized currency settings, and perfect PDF generation.",
      profileTitle: "Personalize Your Space",
      profileSub: "Configure your primary user identity and localized language settings.",
      fullName: "Your Full Name",
      namePlaceholder: "Enter Your Name ...",
      appLang: "Application Language",
      currencyTitle: "Choose Primary Currency",
      currencySub: "Your balances, transactions, and budgets will adapt to this currency formatting.",
      back: "Back",
      next: "Next Step",
      getStarted: "Get Started",
      feature1: "Smart Localization (MMK / Ks & decimals)",
      feature2: "Zero-scroll transaction logs on mobile",
      feature3: "Beautiful responsive glass UI cards"
    },
    my: {
      welcome: "ငွေစာရင်း မန်နေဂျာမှ ကြိုဆိုပါသည်",
      tagline: "သင့်အတွက် အဆင့်မြင့် ဖန်သားပြင်ဒီဇိုင်း ငွေစာရင်းစနစ်",
      description1: "သုံးသပ်ချက်ဇယားများ၊ စိတ်ကြိုက်ပြင်ဆင်နိုင်သော ဘတ်ဂျက်များနှင့် လှပသော PDF ထုတ်ယူမှုစနစ်တို့ဖြင့် သင့်နေ့စဉ် ငွေကြေးအသုံးပြုမှုကို စနစ်တကျ ထိန်းချုပ်လိုက်ပါ။",
      profileTitle: "ကိုယ်ပိုင် အချက်အလက်များ ပြင်ဆင်ရန်",
      profileSub: "သင့်အမည်နှင့် အသုံးပြုလိုသော ဘာသာစကားတို့ကို ရွေးချယ်သတ်မှတ်ပါ။",
      fullName: "သင့်အမည်အပြည့်အစုံ",
      namePlaceholder: "သင့်အမည် ရိုက်ထည့်ပါ ...",
      appLang: "အသုံးပြုမည့် ဘာသာစကား",
      currencyTitle: "အဓိကအသုံးပြုမည့် ငွေကြေးရွေးချယ်ပါ",
      currencySub: "သင်၏ လက်ကျန်ငွေ၊ စာရင်းများနှင့် ဘတ်ဂျက်များသည် ဤငွေကြေးစနစ်အတိုင်း ပြောင်းလဲသွားပါမည်။",
      back: "နောက်သို့",
      next: "ရှေ့သို့",
      getStarted: "အခုပဲ စတင်မယ်",
      feature1: "မြန်မာကျပ်ငွေစနစ် (MMK / Ks) အပြည့်အဝထောက်ပံ့မှု",
      feature2: "ဖုန်းများတွင် ဘေးတိုက်ရွှေ့ရန်မလိုဘဲ စာရင်းကြည့်နိုင်မှု",
      feature3: "လှပဆွဲဆောင်မှုရှိသော ဖန်သားပြင်ကတ်ဒီဇိုင်းများ"
    }
  }[language];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/75 dark:bg-black/90 backdrop-blur-md overflow-y-auto no-print">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 26, stiffness: 220 }}
          className="relative w-full max-w-md h-[580px] p-6 md:p-8 rounded-[2.5rem] bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-neutral-800 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col justify-between"
        >
          {/* Decorative subtle glowing backdrops */}
          <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[#007aff]/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-[#5856d6]/10 blur-3xl pointer-events-none" />

          {/* Stepper Header */}
          <div className="flex items-center justify-between mb-6 relative z-10">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Money Manager • {step + 1}/3
            </span>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-350 ${
                    i === step ? 'w-6 bg-[#007aff]' : 'w-1.5 bg-slate-300 dark:bg-neutral-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Interactive Steps */}
          <div className="flex-1 flex flex-col justify-between overflow-hidden relative z-10">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5 max-h-[360px] overflow-y-auto pr-1 flex-1 py-1"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-tr from-[#007aff] to-[#5856d6] flex items-center justify-center text-white shadow-xl shadow-[#007aff]/20">
                      <Sparkles className="w-8 h-8 animate-pulse" />
                    </div>
                    <div className="space-y-1.5">
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-sans">
                        {content.welcome}
                      </h2>
                      <p className="text-xs font-bold text-[#007aff] uppercase tracking-wider">
                        {content.tagline}
                      </p>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed max-w-sm">
                      {content.description1}
                    </p>
                  </div>

                  {/* Highlights Bullet Cards */}
                  <div className="space-y-2.5 bg-slate-50 dark:bg-neutral-900 p-4 rounded-[1.5rem] border border-slate-100 dark:border-neutral-800">
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-800 dark:text-slate-100">
                      <CheckCircle2 className="w-4.5 h-4.5 text-[#34c759]" />
                      <span>{content.feature1}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-800 dark:text-slate-100">
                      <CheckCircle2 className="w-4.5 h-4.5 text-[#34c759]" />
                      <span>{content.feature2}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-800 dark:text-slate-100">
                      <CheckCircle2 className="w-4.5 h-4.5 text-[#34c759]" />
                      <span>{content.feature3}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 max-h-[360px] overflow-y-auto pr-1 flex-1 py-1"
                >
                  <div className="space-y-1.5">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      {content.profileTitle}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      {content.profileSub}
                    </p>
                  </div>

                  {/* Form inputs */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                        {content.fullName}
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (nameError) {
                              setNameError(undefined);
                            }
                          }}
                          className={`w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-neutral-900 border rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-200 ${
                            nameError
                              ? 'border-red-500 focus:ring-red-500/20'
                              : 'border-slate-200 dark:border-neutral-800 focus:border-[#007aff] focus:ring-[#007aff]/35'
                          }`}
                          placeholder={content.namePlaceholder}
                        />
                      </div>
                      {nameError && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-[11px] text-red-500 font-bold mt-1 flex items-center gap-1.5"
                        >
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {nameError}
                        </motion.p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                        {content.appLang}
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setLanguage('en')}
                          className={`py-2.5 px-4 rounded-2xl text-xs font-black transition-all border cursor-pointer ${
                            language === 'en'
                              ? 'bg-[#007aff] border-[#007aff] text-white shadow-md shadow-[#007aff]/15'
                              : 'bg-slate-50 dark:bg-neutral-900 border-slate-200 dark:border-neutral-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800'
                          }`}
                        >
                          English (EN)
                        </button>
                        <button
                          type="button"
                          onClick={() => setLanguage('my')}
                          className={`py-2.5 px-4 rounded-2xl text-xs font-black transition-all border cursor-pointer ${
                            language === 'my'
                              ? 'bg-[#007aff] border-[#007aff] text-white shadow-md shadow-[#007aff]/15'
                              : 'bg-slate-50 dark:bg-neutral-900 border-slate-200 dark:border-neutral-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800'
                          }`}
                        >
                          မြန်မာဘာသာ (MY)
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                        {content.currencyTitle}
                      </label>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-1">
                        {content.currencySub}
                      </p>
                      <div className="grid grid-cols-3 gap-1.5">
                        {PRESET_CURRENCIES.map((curr) => {
                          const isSelected = selectedCurrency.code === curr.code;
                          return (
                            <button
                              key={curr.code}
                              type="button"
                              onClick={() => {
                                setSelectedCurrency(curr);
                              }}
                              className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-[#007aff]/10 border-[#007aff] text-[#007aff] font-extrabold'
                                  : 'bg-slate-50 dark:bg-neutral-900 border-slate-200 dark:border-neutral-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800'
                              }`}
                            >
                              <span className="text-xs font-black font-mono">{curr.symbol}</span>
                              <span className={`text-[9px] font-bold uppercase tracking-wider ${isSelected ? 'text-[#007aff]' : 'text-slate-500 dark:text-slate-400'}`}>{curr.code}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 max-h-[360px] overflow-y-auto pr-1 flex-1 py-1"
                >
                  <div className="space-y-1.5">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight font-sans">
                      {language === 'en' ? "Select Your Financial Goals" : "သင်၏ ဘဏ္ဍာရေး ပန်းတိုင်များ ရွေးချယ်ပါ"}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                      {language === 'en' 
                        ? "Choose one or more objectives to customize your financial workspace." 
                        : "သင်၏ ဘဏ္ဍာရေး စီမံမှုကို ပိုမိုကောင်းမွန်စေရန် ပန်းတိုင်တစ်ခု သို့မဟုတ် တစ်ခုထက်ပို၍ ရွေးချယ်ပါ။"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {goals.map((goal) => {
                      const isSelected = selectedGoals.includes(goal.id);
                      return (
                        <button
                          key={goal.id}
                          type="button"
                          onClick={() => toggleGoal(goal.id)}
                          className={`w-full p-3 rounded-2xl border text-left flex items-start gap-3 cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'bg-[#007aff]/5 dark:bg-[#007aff]/10 border-[#007aff] shadow-sm'
                              : 'bg-slate-50 dark:bg-neutral-900 border-slate-200 dark:border-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-850'
                          }`}
                        >
                          <div className={`p-2 rounded-xl shrink-0 ${
                            isSelected 
                              ? 'bg-white dark:bg-neutral-800 shadow-md shadow-black/5' 
                              : 'bg-slate-200 dark:bg-neutral-800'
                          }`}>
                            {goal.icon}
                          </div>
                          <div className="space-y-0.5 min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                                {goal.title}
                              </span>
                              {isSelected && (
                                <span className="w-3.5 h-3.5 rounded-full bg-[#007aff] flex items-center justify-center shrink-0">
                                  <Check className="w-2.5 h-2.5 text-white" />
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                              {goal.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Controls */}
            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={handlePrev}
                disabled={step === 0}
                className={`flex-1 h-12 rounded-2xl flex items-center justify-center gap-1 text-xs font-black transition-all border-0 cursor-pointer ${
                  step === 0 
                    ? 'opacity-30 cursor-not-allowed text-slate-400 dark:text-neutral-700' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                {content.back}
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="flex-[2] h-12 rounded-2xl bg-gradient-to-r from-[#007aff] to-[#5856d6] text-white text-xs font-black shadow-lg shadow-[#007aff]/15 hover:shadow-[#007aff]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-1 cursor-pointer border-0"
              >
                {step === 2 ? (
                  <>
                    <Check className="w-4 h-4" />
                    {content.getStarted}
                  </>
                ) : (
                  <>
                    {content.next}
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
