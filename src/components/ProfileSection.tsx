import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Wallet, 
  Calendar, 
  PiggyBank, 
  Target, 
  AlignLeft, 
  Camera, 
  Check, 
  X, 
  Edit3, 
  AlertCircle 
} from 'lucide-react';
import { UserProfile, Language } from '../types';
import { TRANSLATIONS } from '../translations';

interface ProfileSectionProps {
  profile: UserProfile;
  onSaveProfile: (updatedProfile: UserProfile) => void;
  language: Language;
  onClose?: () => void;
  initialEdit?: boolean;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
];

export const ProfileSection: React.FC<ProfileSectionProps> = React.memo(({
  profile,
  onSaveProfile,
  language,
  onClose,
  initialEdit = false,
}) => {
  const t = (key: string) => TRANSLATIONS[language][key] || key;

  const [isEditing, setIsEditing] = useState(initialEdit);

  useEffect(() => {
    setIsEditing(initialEdit);
  }, [initialEdit]);

  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [tempPhotoUrl, setTempPhotoUrl] = useState(profile.photoUrl);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState<string | undefined>(undefined);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 1.5MB to stay within safe localStorage bounds
    const maxSize = 1.5 * 1024 * 1024;
    if (file.size > maxSize) {
      const errMsg = language === 'my'
        ? "ပုံအရွယ်အစားသည် 1.5MB ထက် မကျော်ရပါ။"
        : "Image size must be less than 1.5MB.";
      setPhotoError(errMsg);
      return;
    }

    setPhotoError(undefined);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setTempPhotoUrl(base64String);
      setFormData((prev) => ({ ...prev, photoUrl: base64String }));
    };
    reader.onerror = () => {
      const errMsg = language === 'my'
        ? "ပုံဖတ်ရာတွင် အမှားအယွင်းရှိပါသည်။"
        : "Failed to read image file.";
      setPhotoError(errMsg);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    setFormData({ ...profile });
    setTempPhotoUrl(profile.photoUrl);
    setErrors({});
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectPreset = (url: string) => {
    setTempPhotoUrl(url);
    setFormData((prev) => ({ ...prev, photoUrl: url }));
    if (errors.photoUrl) {
      setErrors((prev) => ({ ...prev, photoUrl: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = language === 'my' ? "အမည် ဖြည့်စွက်ရန် လိုအပ်ပါသည်။" : "Name is required.";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = language === 'my' ? "အမည်သည် အနည်းဆုံး စာလုံး ၂ လုံး ရှိရပါမည်။" : "Name must be at least 2 characters.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSaveProfile({
      ...formData,
      photoUrl: tempPhotoUrl.trim(),
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({ ...profile });
    setTempPhotoUrl(profile.photoUrl);
    setErrors({});
    setPhotoError(undefined);
    setIsEditing(false);
  };

  // Practical Financial Defaults for display
  const displayIncomeSource = profile.incomeSource || (language === 'my' ? 'လစဉ် လစာဝင်ငွေ' : 'Monthly Salary');
  const displayPaydayCycle = profile.paydayCycle || (language === 'my' ? 'လစဉ် (၁ ရက်နေ့)' : 'Monthly (1st of Month)');
  const displaySavingsGoal = profile.savingsGoal || (language === 'my' ? 'ဝင်ငွေ၏ ၂၀% စုဆောင်းရန်' : 'Save 20% of Monthly Income');
  const displayFinancialFocus = profile.financialFocus || (language === 'my' ? 'သုံးစွဲမှု ထိန်းချုပ်ခြင်း' : 'Strict Expense Control');

  return (
    <div className="max-w-2xl mx-auto space-y-6" id="profile-section">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
            <User className="w-5 h-5 text-[#007aff]" />
            {t('profile')}
          </h2>
          <p className="text-xs text-[#8e8e93]">
            {language === 'my' ? 'သင့်ငွေကြေး စီမံခန့်ခွဲမှု ဆိုင်ရာ ကိုယ်ရေးအချက်အလက်များ' : 'Manage your financial profile and personal preferences'}
          </p>
        </div>
        {onClose && (
          <button
            id="close-profile-btn"
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center bg-[#f2f2f7] dark:bg-[#2c2c2e] text-[#1c1c1e] dark:text-[#f2f2f7] rounded-full hover:opacity-80 transition-all cursor-pointer border-0"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Profile Card */}
      <div className="ios-glass rounded-[2rem] overflow-hidden shadow-xs">
        {/* Banner Accent */}
        <div className="h-28 bg-gradient-to-r from-[#007aff] via-[#5856d6] to-[#34c759] relative" />

        <div className="px-6 pb-6 relative z-10">
          {/* Profile Photo Placement */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-14 mb-6 gap-4">
            <div className="relative group">
              <img
                src={tempPhotoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt={formData.name}
                referrerPolicy="no-referrer"
                className="w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-[#1c1c1e] shadow-md bg-slate-100"
              />
              {isEditing && (
                <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <Camera className="w-5 h-5" />
                </div>
              )}
            </div>
          </div>

          {/* Form / Content Switcher */}
          {!isEditing ? (
            <div className="space-y-6">
              {/* Core Header info */}
              <div>
                <h3 className="text-lg font-bold text-[#1c1c1e] dark:text-[#f2f2f7]" id="profile-display-name">
                  {profile.name}
                </h3>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#007aff]/10 text-[#007aff] mt-1.5 border border-[#007aff]/20">
                  <Target className="w-3.5 h-3.5" />
                  {displayFinancialFocus}
                </span>
              </div>

              {/* Bio / Financial Motto block */}
              {profile.bio && (
                <div className="p-4 bg-[#f2f2f7] dark:bg-[#2c2c2e]/60 rounded-2xl border-0">
                  <p className="text-[10px] text-[#8e8e93] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <AlignLeft className="w-3 h-3 text-[#007aff]" />
                    {t('bioLabel')}
                  </p>
                  <p className="text-xs sm:text-sm text-[#1c1c1e] dark:text-[#f2f2f7] italic font-medium">
                    "{profile.bio}"
                  </p>
                </div>
              )}

              {/* Practical Financial Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                {/* Income Source */}
                <div className="flex items-center gap-3.5 p-4 bg-[#f2f2f7] dark:bg-[#2c2c2e]/60 rounded-2xl border-0">
                  <div className="w-10 h-10 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shrink-0 shadow-xs">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] text-[#8e8e93] uppercase font-bold tracking-wider block">
                      {t('incomeSourceLabel')}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#1c1c1e] dark:text-[#f2f2f7] truncate block">
                      {displayIncomeSource}
                    </span>
                  </div>
                </div>

                {/* Income Cycle / Payday */}
                <div className="flex items-center gap-3.5 p-4 bg-[#f2f2f7] dark:bg-[#2c2c2e]/60 rounded-2xl border-0">
                  <div className="w-10 h-10 bg-[#007aff]/10 dark:bg-[#007aff]/20 text-[#007aff] rounded-2xl flex items-center justify-center shrink-0 shadow-xs">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] text-[#8e8e93] uppercase font-bold tracking-wider block">
                      {t('paydayCycleLabel')}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#1c1c1e] dark:text-[#f2f2f7] truncate block">
                      {displayPaydayCycle}
                    </span>
                  </div>
                </div>

                {/* Monthly Savings Target */}
                <div className="flex items-center gap-3.5 p-4 bg-[#f2f2f7] dark:bg-[#2c2c2e]/60 rounded-2xl border-0">
                  <div className="w-10 h-10 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center shrink-0 shadow-xs">
                    <PiggyBank className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] text-[#8e8e93] uppercase font-bold tracking-wider block">
                      {t('savingsGoalLabel')}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#1c1c1e] dark:text-[#f2f2f7] truncate block">
                      {displaySavingsGoal}
                    </span>
                  </div>
                </div>

                {/* Financial Focus Area */}
                <div className="flex items-center gap-3.5 p-4 bg-[#f2f2f7] dark:bg-[#2c2c2e]/60 rounded-2xl border-0">
                  <div className="w-10 h-10 bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center shrink-0 shadow-xs">
                    <Target className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] text-[#8e8e93] uppercase font-bold tracking-wider block">
                      {t('financialFocusLabel')}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#1c1c1e] dark:text-[#f2f2f7] truncate block">
                      {displayFinancialFocus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Edit button at the bottom of the profile card view */}
              <div className="flex justify-end pt-5 mt-4 border-t border-black/5 dark:border-white/5">
                <button
                  id="edit-profile-btn"
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-[#007aff] hover:bg-[#0071eb] text-white rounded-2xl text-xs font-bold shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {t('editProfile')}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5" id="profile-edit-form">
              {/* Preset Avatar Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#8e8e93] uppercase tracking-wider">
                  Select Preset Photo
                </label>
                <div className="flex items-center gap-2.5 overflow-x-auto py-1">
                  {PRESET_AVATARS.map((avatarUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(avatarUrl)}
                      className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        tempPhotoUrl === avatarUrl
                          ? 'border-[#007aff] scale-105 shadow-md'
                          : 'border-transparent'
                      }`}
                    >
                      <img src={avatarUrl} alt="avatar" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      {tempPhotoUrl === avatarUrl && (
                        <div className="absolute inset-0 bg-[#007aff]/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white font-bold" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Local Device Photo Uploader */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#8e8e93] uppercase tracking-wider">
                  {language === 'my' ? 'စက်ပစ္စည်းမှ ဓာတ်ပုံရွေးချယ်ရန်' : 'Upload Profile Photo'}
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-[#f2f2f7]/50 dark:bg-[#2c2c2e]/30 rounded-2xl border border-black/5 dark:border-white/5">
                  <div className="relative shrink-0">
                    <img
                      src={tempPhotoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-xl object-cover bg-slate-100 border border-black/10 dark:border-white/10"
                    />
                  </div>
                  <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
                    <p className="text-xs font-bold text-[#1c1c1e] dark:text-[#f2f2f7]">
                      {language === 'my' ? 'သင့်စက်ပစ္စည်းမှ ပုံရွေးချယ်ပါ' : 'Choose a picture from your device'}
                    </p>
                    <p className="text-[10px] text-[#8e8e93]">
                      {language === 'my' ? 'အများဆုံးအရွယ်အစား 1.5MB (JPEG, PNG)' : 'Max size 1.5MB (JPEG, PNG)'}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <button
                      id="upload-profile-photo-btn"
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-[#007aff] hover:bg-[#0071eb] text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      {language === 'my' ? 'ပုံရွေးရန်' : 'Choose File'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>
                {photoError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[11px] text-red-500 font-bold mt-1.5 flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {photoError}
                  </motion.p>
                )}
              </div>

              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-xs font-bold text-[#8e8e93] uppercase tracking-wider mb-1.5">
                  {t('nameLabel')}
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full h-11 px-3.5 bg-[#f2f2f7] dark:bg-[#2c2c2e] border rounded-2xl text-xs md:text-sm font-semibold text-[#1c1c1e] dark:text-[#f2f2f7] focus:outline-none transition-all duration-200 ${
                    errors.name
                      ? 'border-red-500/70 focus:ring-2 focus:ring-red-500/20'
                      : 'border-transparent focus:ring-2 focus:ring-[#007aff]/35'
                  }`}
                />
                {errors.name && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[11px] text-red-500 font-bold mt-1.5 flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.name}
                  </motion.p>
                )}
              </div>

              {/* Practical Financial Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Income Source */}
                <div>
                  <label htmlFor="incomeSource" className="block text-xs font-bold text-[#8e8e93] uppercase tracking-wider mb-1.5">
                    {t('incomeSourceLabel')}
                  </label>
                  <input
                    id="incomeSource"
                    type="text"
                    name="incomeSource"
                    list="income-source-suggestions"
                    value={formData.incomeSource || ''}
                    onChange={handleInputChange}
                    placeholder={language === 'my' ? 'ဥပမာ - လစဉ် လစာဝင်ငွေ' : 'e.g., Monthly Salary'}
                    className="w-full h-11 px-3.5 bg-[#f2f2f7] dark:bg-[#2c2c2e] border border-transparent rounded-2xl text-xs md:text-sm font-semibold text-[#1c1c1e] dark:text-[#f2f2f7] focus:outline-none focus:ring-2 focus:ring-[#007aff]/35 transition-all duration-200"
                  />
                  <datalist id="income-source-suggestions">
                    <option value={language === 'my' ? 'လစဉ် လစာဝင်ငွေ' : 'Monthly Salary'} />
                    <option value={language === 'my' ? 'စီးပွားရေး / ဆိုင်ဝင်ငွေ' : 'Business / Shop Income'} />
                    <option value={language === 'my' ? 'အလွတ်တန်းနှင့် ပရောဂျက်' : 'Freelance & Projects'} />
                    <option value={language === 'my' ? 'ရင်းနှီးမြှုပ်နှံမှုနှင့် အမြတ်ငွေ' : 'Investments & Dividends'} />
                    <option value={language === 'my' ? 'နေ့စား/ရက်တွက် ဝင်ငွေ' : 'Daily Wages'} />
                    <option value={language === 'my' ? 'ထောက်ပံ့ကြေး / ကျောင်းသား' : 'Allowance / Student'} />
                  </datalist>
                </div>

                {/* Payday Cycle */}
                <div>
                  <label htmlFor="paydayCycle" className="block text-xs font-bold text-[#8e8e93] uppercase tracking-wider mb-1.5">
                    {t('paydayCycleLabel')}
                  </label>
                  <input
                    id="paydayCycle"
                    type="text"
                    name="paydayCycle"
                    list="payday-cycle-suggestions"
                    value={formData.paydayCycle || ''}
                    onChange={handleInputChange}
                    placeholder={language === 'my' ? 'ဥပမာ - လစဉ် (၁ ရက်နေ့)' : 'e.g., Monthly (1st)'}
                    className="w-full h-11 px-3.5 bg-[#f2f2f7] dark:bg-[#2c2c2e] border border-transparent rounded-2xl text-xs md:text-sm font-semibold text-[#1c1c1e] dark:text-[#f2f2f7] focus:outline-none focus:ring-2 focus:ring-[#007aff]/35 transition-all duration-200"
                  />
                  <datalist id="payday-cycle-suggestions">
                    <option value={language === 'my' ? 'လစဉ် (၁ ရက်နေ့)' : 'Monthly (1st of Month)'} />
                    <option value={language === 'my' ? 'လစဉ် (လလယ်/လဆန်း)' : 'Monthly (Mid/End Month)'} />
                    <option value={language === 'my' ? 'နှစ်ပတ်တစ်ကြိမ်' : 'Bi-Weekly (Every 2 Weeks)'} />
                    <option value={language === 'my' ? 'အပတ်စဉ်' : 'Weekly'} />
                    <option value={language === 'my' ? 'ပုံသေမရှိ / စီမံရလွယ်ကူသော' : 'Flexible / Irregular'} />
                  </datalist>
                </div>

                {/* Savings Goal */}
                <div>
                  <label htmlFor="savingsGoal" className="block text-xs font-bold text-[#8e8e93] uppercase tracking-wider mb-1.5">
                    {t('savingsGoalLabel')}
                  </label>
                  <input
                    id="savingsGoal"
                    type="text"
                    name="savingsGoal"
                    list="savings-goal-suggestions"
                    value={formData.savingsGoal || ''}
                    onChange={handleInputChange}
                    placeholder={language === 'my' ? 'ဥပမာ - ဝင်ငွေ၏ ၂၀% စုဆောင်းရန်' : 'e.g., Save 20% of Monthly Income'}
                    className="w-full h-11 px-3.5 bg-[#f2f2f7] dark:bg-[#2c2c2e] border border-transparent rounded-2xl text-xs md:text-sm font-semibold text-[#1c1c1e] dark:text-[#f2f2f7] focus:outline-none focus:ring-2 focus:ring-[#007aff]/35 transition-all duration-200"
                  />
                  <datalist id="savings-goal-suggestions">
                    <option value={language === 'my' ? 'လစဉ်ဝင်ငွေ၏ ၂၀% စုဆောင်းရန်' : 'Save 20% of Monthly Income'} />
                    <option value={language === 'my' ? 'အရေးပေါ်ရန်ပုံငွေ စုဆောင်းရန်' : 'Build Emergency Fund (3-6 Months)'} />
                    <option value={language === 'my' ? 'ရင်းနှီးမြှုပ်နှံမှု မတည်ငွေ စုရန်' : 'Capital / Investment Building'} />
                    <option value={language === 'my' ? 'ကြွေးမြီနှင့် ကတိကဝတ်များ ဆေဆပ်ရန်' : 'Debt Payoff & Bill Clearance'} />
                  </datalist>
                </div>

                {/* Financial Focus Area */}
                <div>
                  <label htmlFor="financialFocus" className="block text-xs font-bold text-[#8e8e93] uppercase tracking-wider mb-1.5">
                    {t('financialFocusLabel')}
                  </label>
                  <input
                    id="financialFocus"
                    type="text"
                    name="financialFocus"
                    list="financial-focus-suggestions"
                    value={formData.financialFocus || ''}
                    onChange={handleInputChange}
                    placeholder={language === 'my' ? 'ဥပမာ - သုံးစွဲမှု ထိန်းချုပ်ခြင်း' : 'e.g., Strict Expense Control'}
                    className="w-full h-11 px-3.5 bg-[#f2f2f7] dark:bg-[#2c2c2e] border border-transparent rounded-2xl text-xs md:text-sm font-semibold text-[#1c1c1e] dark:text-[#f2f2f7] focus:outline-none focus:ring-2 focus:ring-[#007aff]/35 transition-all duration-200"
                  />
                  <datalist id="financial-focus-suggestions">
                    <option value={language === 'my' ? 'သုံးစွဲမှု ထိန်းချုပ်ခြင်း' : 'Strict Expense Control'} />
                    <option value={language === 'my' ? 'စုဆောင်းငွေ တိုးပွားစေခြင်း' : 'Wealth Building & Savings'} />
                    <option value={language === 'my' ? 'ကြွေးမြီ ကင်းရှင်းရေး' : 'Debt Reduction & Freedom'} />
                    <option value={language === 'my' ? 'ဝင်ငွေ/ထွက်ငွေ မျှတရေး' : 'Balanced Cash Flow'} />
                  </datalist>
                </div>
              </div>

              {/* Bio / Financial Motto Area */}
              <div>
                <label htmlFor="bio" className="block text-xs font-bold text-[#8e8e93] uppercase tracking-wider mb-1.5">
                  {t('bioLabel')}
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={2}
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder={language === 'my' ? 'သင့်ငွေကြေး စီမံခန့်ခွဲမှု ဆောင်ပုဒ် သို့မဟုတ် ရည်မှန်းချက်...' : 'Your financial Motto or personal targets...'}
                  className="w-full px-3.5 py-3 bg-[#f2f2f7] dark:bg-[#2c2c2e] border-0 rounded-2xl text-xs md:text-sm font-semibold text-[#1c1c1e] dark:text-[#f2f2f7] focus:outline-none resize-none"
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-[#e5e5ea] dark:border-[#2c2c2e]">
                <button
                  type="button"
                  id="cancel-profile-edit"
                  onClick={handleCancel}
                  className="px-4 py-2.5 border border-[#e5e5ea] dark:border-[#2c2c2e] text-[#1c1c1e] dark:text-[#f2f2f7] rounded-2xl text-xs font-bold hover:bg-[#f2f2f7] dark:hover:bg-[#2c2c2e] transition-colors cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  id="save-profile-btn"
                  className="px-4 py-2.5 bg-[#007aff] hover:bg-[#0071eb] text-white rounded-2xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  {t('saveChanges')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
});
