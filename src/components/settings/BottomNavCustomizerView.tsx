import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Smartphone,
  Monitor,
  Palette,
  Sliders,
  Sparkles,
  RotateCcw,
  Eye,
  Check,
  ShieldAlert,
  Wallet,
  History,
  PiggyBank,
  TrendingUp,
  Settings as SettingsIcon
} from 'lucide-react';
import { Language, Settings, NavbarSettings, DEFAULT_NAVBAR_SETTINGS } from '../../types';

interface BottomNavCustomizerViewProps {
  t: (key: string) => string;
  settings: Settings;
  onUpdateNavbarSettings: (navbarSettings: NavbarSettings) => void;
  onClose: () => void;
}

const PRESET_BG_COLORS = [
  { name: 'Pure Dark', hex: '#1c1c1e' },
  { name: 'Pure Black', hex: '#000000' },
  { name: 'Midnight Navy', hex: '#0f172a' },
  { name: 'Deep Sapphire', hex: '#1e3a8a' },
  { name: 'Forest Emerald', hex: '#064e3b' },
  { name: 'Royal Purple', hex: '#3b0764' },
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Soft Slate', hex: '#f8fafc' },
];

const PRESET_ACTIVE_COLORS = [
  { name: 'iOS Blue', hex: '#007aff' },
  { name: 'Sky Cyan', hex: '#00c7be' },
  { name: 'Mint Green', hex: '#30d158' },
  { name: 'Sunset Orange', hex: '#ff9500' },
  { name: 'Rose Pink', hex: '#ff2d55' },
  { name: 'Neon Purple', hex: '#bf5af2' },
  { name: 'Golden Yellow', hex: '#ffd60a' },
  { name: 'Pure White', hex: '#ffffff' },
];

const PRESET_INACTIVE_COLORS = [
  { name: 'Muted Gray', hex: '#8e8e93' },
  { name: 'Soft Slate', hex: '#94a3b8' },
  { name: 'Dark Charcoal', hex: '#4b5563' },
  { name: 'Subtle White', hex: '#d1d5db' },
];

export const BottomNavCustomizerView: React.FC<BottomNavCustomizerViewProps> = ({
  t,
  settings,
  onUpdateNavbarSettings,
  onClose,
}) => {
  const language = settings.language;
  const currentNavSettings: NavbarSettings = {
    ...DEFAULT_NAVBAR_SETTINGS,
    ...(settings.navbarSettings || {})
  };

  const [navState, setNavState] = useState<NavbarSettings>(currentNavSettings);
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 1024 : false;
  });
  const [previewTab, setPreviewTab] = useState<'dashboard' | 'transactions' | 'budgets' | 'analytics' | 'settings'>('dashboard');

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleApplyChange = (partial: Partial<NavbarSettings>) => {
    const updated = { ...navState, ...partial };
    setNavState(updated);
    onUpdateNavbarSettings(updated);
  };

  const handleResetDefaults = () => {
    setNavState(DEFAULT_NAVBAR_SETTINGS);
    onUpdateNavbarSettings(DEFAULT_NAVBAR_SETTINGS);
  };

  // Helper function to build preview style based on navState
  const getNavbarStyles = (nav: NavbarSettings) => {
    const opacityVal = nav.opacity / 100;
    let background = '';
    
    if (nav.bgType === 'glass') {
      background = settings.theme === 'dark'
        ? `rgba(28, 28, 30, ${opacityVal})`
        : `rgba(255, 255, 255, ${opacityVal})`;
    } else if (nav.bgType === 'solid') {
      // Convert hex to rgba
      const hex = nav.bgColor || '#1c1c1e';
      const r = parseInt(hex.slice(1, 3) || '1c', 16);
      const g = parseInt(hex.slice(3, 5) || '1c', 16);
      const b = parseInt(hex.slice(5, 7) || '1e', 16);
      background = `rgba(${r}, ${g}, ${b}, ${opacityVal})`;
    } else if (nav.bgType === 'gradient') {
      background = `linear-gradient(135deg, ${nav.activeColor}${Math.round(opacityVal * 255).toString(16).padStart(2, '0')}, ${nav.bgColor}${Math.round(opacityVal * 255).toString(16).padStart(2, '0')})`;
    } else if (nav.bgType === 'accent') {
      const hex = nav.activeColor || '#007aff';
      const r = parseInt(hex.slice(1, 3) || '00', 16);
      const g = parseInt(hex.slice(3, 5) || '7a', 16);
      const b = parseInt(hex.slice(5, 7) || 'ff', 16);
      background = `rgba(${r}, ${g}, ${b}, ${opacityVal})`;
    }

    let blurAmount = '0px';
    if (nav.blur === 'low') blurAmount = '6px';
    if (nav.blur === 'medium') blurAmount = '12px';
    if (nav.blur === 'high') blurAmount = '24px';

    return {
      background,
      backdropFilter: `blur(${blurAmount})`,
      WebkitBackdropFilter: `blur(${blurAmount})`,
    };
  };

  const getShapeClass = (shape: NavbarSettings['shape']) => {
    switch (shape) {
      case 'full':
        return 'w-full rounded-none px-2';
      case 'pill':
        return 'w-[92%] rounded-full px-3';
      case 'floating':
      default:
        return 'w-[92%] rounded-[24px] px-2';
    }
  };

  const getBorderClass = (border: NavbarSettings['borderColor'], activeColor: string) => {
    switch (border) {
      case 'glow':
        return `border border-[${activeColor}]/40 shadow-[0_4px_20px_rgba(0,122,255,0.25)]`;
      case 'solid':
        return 'border-2 border-black/20 dark:border-white/20 shadow-md';
      case 'none':
        return 'border-0 shadow-none';
      case 'default':
      default:
        return 'border border-black/10 dark:border-white/10 shadow-lg';
    }
  };

  const previewNavTabs = [
    { id: 'dashboard', label: t('navDashboard') || 'Wallet', icon: Wallet },
    { id: 'transactions', label: t('navTransactions') || 'History', icon: History },
    { id: 'budgets', label: t('navBudgets') || 'Budgets', icon: PiggyBank },
    { id: 'analytics', label: t('navAnalytics') || 'Analytics', icon: TrendingUp },
    { id: 'settings', label: t('navSettings') || 'Settings', icon: SettingsIcon },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center text-[#1c1c1e] dark:text-[#f2f2f7] transition-all cursor-pointer border-0"
            title={language === 'my' ? 'နောက်သို့' : 'Back'}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[#007aff]" />
              {language === 'my' ? 'မိုဘိုင်း Bottom Navbar ပြင်ဆင်ရန်' : 'Customize Bottom Navigation Bar'}
            </h2>
            <p className="text-xs text-[#8e8e93]">
              {language === 'my'
                ? 'မိုဘိုင်းဖုန်းစခရင်တွင် ပြသမည့် Bottom Navigation Bar ၏ အရောင်၊ ကြည်လင်မှု၊ ပုံစံများ စိတ်ကြိုက်ပြင်ဆင်ပါ'
                : 'Personalize colors, transparency, backdrop blur, shapes, and active highlights for mobile screen size'}
            </p>
          </div>
        </div>

        <button
          onClick={handleResetDefaults}
          className="px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-bold text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white transition-all flex items-center gap-1.5 cursor-pointer border-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {language === 'my' ? 'မူလအတိုင်းပြန်ထားမည်' : 'Reset Default'}
        </button>
      </div>

      {/* Screen Size Device Notice Banner */}
      {isDesktop ? (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
            <Monitor className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                {language === 'my' ? 'PC/Desktop စခရင် အရွယ်အစား ဖြစ်နေပါသည်' : 'PC / Desktop Screen Detected'}
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold text-[10px] uppercase tracking-wider">
                {language === 'my' ? 'မိုဘိုင်းအတွက်သာ' : 'Mobile Only'}
              </span>
            </div>
            <p className="text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
              {language === 'my'
                ? 'PC စခရင်တွင် Bottom Navigation Bar ကို ဝှက်ထားပြီး ဘေးတိုက် Sidebar Navigation ကို အသုံးပြုပါသည်။ မိုဘိုင်းစခရင် သို့မဟုတ် Browser window ကျဉ်းမြောင်းချိန်တွင် ဤပြင်ဆင်ချက်များ တိုက်ရိုက်သက်ရောက်ပါမည်။'
                : 'Bottom Navigation Bar is automatically disabled on PC / desktop screens in favor of the sidebar navigation rail. Changes made here will take effect live on mobile devices or smaller viewports.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-[#007aff]/10 border border-[#007aff]/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#007aff]">
            <Smartphone className="w-4 h-4" />
            <span>{language === 'my' ? 'မိုဘိုင်းစခရင်တွင် တိုက်ရိုက် သက်ရောက်နေပါသည်။' : 'Mobile Screen Detected — Customization is Active'}</span>
          </div>
          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-[#007aff] text-white">
            ACTIVE
          </span>
        </div>
      )}

      {/* Live Interactive Preview Canvas */}
      <div className="p-5 ios-glass rounded-[2rem] space-y-3 border border-black/5 dark:border-white/5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#1c1c1e] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-[#007aff]" />
            {language === 'my' ? 'တိုက်ရိုက် အစမ်းကြည့်ရှုမှု (Live Preview)' : 'Live Interactive Preview'}
          </h3>
          <span className="text-[11px] font-medium text-[#8e8e93]">
            {language === 'my' ? 'နှိပ်၍ အစမ်း စမ်းသပ်ကြည့်ပါ' : 'Tap tabs to preview active states'}
          </span>
        </div>

        {/* Mock Phone Stage */}
        <div className="relative w-full h-44 rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200 dark:from-zinc-900 dark:to-zinc-950 border border-black/10 dark:border-white/10 flex flex-col justify-between p-4 overflow-hidden shadow-inner">
          {/* Top Status Bar Mock */}
          <div className="flex items-center justify-between text-[10px] text-[#8e8e93] font-mono px-2">
            <span>09:41</span>
            <div className="flex items-center gap-1">
              <span>5G</span>
              <span>100%</span>
            </div>
          </div>

          <div className="text-center space-y-1">
            <p className="text-xs font-semibold text-[#8e8e93]">
              {language === 'my' ? 'အပလီကေးရှင်း အောက်ခြေ စခရင် အစမ်းကြည့်ရှုမှု' : 'Application Content Area'}
            </p>
            <p className="text-[11px] text-[#1c1c1e]/60 dark:text-white/60 font-mono">
              Selected Tab: <span className="font-bold text-[#007aff]">{previewTab.toUpperCase()}</span>
            </p>
          </div>

          {/* Render Customized Bottom Navbar Preview */}
          <div className="flex justify-center w-full pb-1">
            <nav
              style={getNavbarStyles(navState)}
              className={`py-2 transition-all flex items-center justify-around ${getShapeClass(navState.shape)} ${getBorderClass(navState.borderColor, navState.activeColor)}`}
            >
              {previewNavTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = previewTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setPreviewTab(tab.id as any)}
                    className="flex flex-col items-center justify-center px-1 flex-1 min-w-0 border-0 bg-transparent cursor-pointer transition-transform"
                  >
                    <Icon
                      className={`w-5 h-5 shrink-0 transition-all ${isActive ? 'scale-110' : ''}`}
                      style={{ color: isActive ? navState.activeColor : navState.inactiveColor }}
                    />
                    {navState.showLabels && (
                      <span
                        className="text-[9px] font-bold tracking-tight w-full truncate text-center block mt-0.5 whitespace-nowrap"
                        style={{ color: isActive ? navState.activeColor : navState.inactiveColor }}
                      >
                        {tab.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Control Panels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel 1: Style & Background */}
        <div className="p-5 ios-glass rounded-[2rem] space-y-5 border border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#007aff]" />
            <h3 className="text-sm font-bold text-[#1c1c1e] dark:text-white">
              {language === 'my' ? 'နောက်ခံပုံစံနှင့် အရောင်' : 'Background Style & Tint'}
            </h3>
          </div>

          {/* Background Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#8e8e93] block">
              {language === 'my' ? 'နောက်ခံ အမျိုးအစား' : 'Background Type'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'glass', label: language === 'my' ? 'iOS Liquid Glass' : 'Liquid Glass' },
                { id: 'solid', label: language === 'my' ? 'Solid Color' : 'Solid Color' },
                { id: 'gradient', label: language === 'my' ? 'Gradient Tint' : 'Gradient Tint' },
                { id: 'accent', label: language === 'my' ? 'Accent Theme' : 'Accent Theme' },
              ].map((typeOption) => (
                <button
                  key={typeOption.id}
                  onClick={() => handleApplyChange({ bgType: typeOption.id as any })}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    navState.bgType === typeOption.id
                      ? 'bg-[#007aff] text-white border-[#007aff] shadow-sm'
                      : 'bg-black/5 dark:bg-white/5 text-[#1c1c1e] dark:text-[#f2f2f7] border-transparent hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
                >
                  {typeOption.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Background Color Presets (if solid or gradient) */}
          {(navState.bgType === 'solid' || navState.bgType === 'gradient') && (
            <div className="space-y-2 pt-1 border-t border-black/5 dark:border-white/5">
              <label className="text-xs font-bold text-[#8e8e93] block">
                {language === 'my' ? 'နောက်ခံ အရောင်ရွေးချယ်ပါ' : 'Select Background Color'}
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_BG_COLORS.map((preset) => (
                  <button
                    key={preset.hex}
                    onClick={() => handleApplyChange({ bgColor: preset.hex })}
                    className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                      navState.bgColor === preset.hex ? 'border-[#007aff] scale-110 shadow-md' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: preset.hex }}
                    title={preset.name}
                  >
                    {navState.bgColor === preset.hex && (
                      <Check className={`w-3.5 h-3.5 ${preset.hex === '#ffffff' || preset.hex === '#f8fafc' ? 'text-black' : 'text-white'}`} />
                    )}
                  </button>
                ))}
                <input
                  type="color"
                  value={navState.bgColor || '#1c1c1e'}
                  onChange={(e) => handleApplyChange({ bgColor: e.target.value })}
                  className="w-7 h-7 rounded-full cursor-pointer border-0 bg-transparent p-0 shrink-0"
                  title="Custom Color Picker"
                />
              </div>
            </div>
          )}

          {/* Transparency Slider */}
          <div className="space-y-2 pt-1 border-t border-black/5 dark:border-white/5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-[#8e8e93]">
                {language === 'my' ? 'နောက်ခံ ကြည်လင်မှု (Transparency / Opacity)' : 'Background Opacity'}
              </label>
              <span className="font-mono font-bold text-[#007aff]">{navState.opacity}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={navState.opacity}
              onChange={(e) => handleApplyChange({ opacity: Number(e.target.value) })}
              className="w-full accent-[#007aff] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8e8e93] font-medium">
              <span>10% (Transparent)</span>
              <span>50%</span>
              <span>100% (Solid)</span>
            </div>
          </div>

          {/* Backdrop Blur Selection */}
          <div className="space-y-2 pt-1 border-t border-black/5 dark:border-white/5">
            <label className="text-xs font-bold text-[#8e8e93] block">
              {language === 'my' ? 'နောက်ခံ မှေဝါးမှု (Backdrop Blur Effect)' : 'Backdrop Blur Intensity'}
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'none', label: 'None' },
                { id: 'low', label: 'Low (6px)' },
                { id: 'medium', label: 'Med (12px)' },
                { id: 'high', label: 'High (24px)' },
              ].map((blurOpt) => (
                <button
                  key={blurOpt.id}
                  onClick={() => handleApplyChange({ blur: blurOpt.id as any })}
                  className={`p-2 rounded-xl text-[11px] font-bold transition-all border cursor-pointer text-center ${
                    navState.blur === blurOpt.id
                      ? 'bg-[#007aff] text-white border-[#007aff]'
                      : 'bg-black/5 dark:bg-white/5 text-[#1c1c1e] dark:text-white border-transparent'
                  }`}
                >
                  {blurOpt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Panel 2: Icon Highlights & Shape Controls */}
        <div className="p-5 ios-glass rounded-[2rem] space-y-5 border border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#007aff]" />
            <h3 className="text-sm font-bold text-[#1c1c1e] dark:text-white">
              {language === 'my' ? 'အိုင်ကွန်နှင့် ဘောင် ပုံစံများ' : 'Icon Colors & Shape Layout'}
            </h3>
          </div>

          {/* Active Tab Color */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#8e8e93] block">
              {language === 'my' ? 'ရွေးချယ်ထားသော အိုင်ကွန် အရောင် (Active Color)' : 'Active Icon & Text Highlight'}
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_ACTIVE_COLORS.map((preset) => (
                <button
                  key={preset.hex}
                  onClick={() => handleApplyChange({ activeColor: preset.hex })}
                  className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                    navState.activeColor === preset.hex ? 'border-[#1c1c1e] dark:border-white scale-110 shadow-md' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: preset.hex }}
                  title={preset.name}
                >
                  {navState.activeColor === preset.hex && (
                    <Check className={`w-3.5 h-3.5 ${preset.hex === '#ffffff' || preset.hex === '#ffd60a' ? 'text-black' : 'text-white'}`} />
                  )}
                </button>
              ))}
              <input
                type="color"
                value={navState.activeColor || '#007aff'}
                onChange={(e) => handleApplyChange({ activeColor: e.target.value })}
                className="w-7 h-7 rounded-full cursor-pointer border-0 bg-transparent p-0 shrink-0"
                title="Custom Active Color"
              />
            </div>
          </div>

          {/* Inactive Tab Color */}
          <div className="space-y-2 pt-1 border-t border-black/5 dark:border-white/5">
            <label className="text-xs font-bold text-[#8e8e93] block">
              {language === 'my' ? 'အသုံးမပြုထားသော အိုင်ကွန် အရောင် (Inactive Color)' : 'Inactive Icon & Text Color'}
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_INACTIVE_COLORS.map((preset) => (
                <button
                  key={preset.hex}
                  onClick={() => handleApplyChange({ inactiveColor: preset.hex })}
                  className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                    navState.inactiveColor === preset.hex ? 'border-[#007aff] scale-110 shadow-md' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: preset.hex }}
                  title={preset.name}
                >
                  {navState.inactiveColor === preset.hex && (
                    <Check className="w-3.5 h-3.5 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Navbar Shape */}
          <div className="space-y-2 pt-1 border-t border-black/5 dark:border-white/5">
            <label className="text-xs font-bold text-[#8e8e93] block">
              {language === 'my' ? 'Navbar ဘောင် ပုံသဏ္ဍာန် (Navbar Shape)' : 'Navbar Layout Shape'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'floating', label: language === 'my' ? 'Floating Card' : 'Floating Card' },
                { id: 'full', label: language === 'my' ? 'Full Width' : 'Full Width Dock' },
                { id: 'pill', label: language === 'my' ? 'Capsule Pill' : 'Capsule Pill' },
              ].map((shapeOpt) => (
                <button
                  key={shapeOpt.id}
                  onClick={() => handleApplyChange({ shape: shapeOpt.id as any })}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center ${
                    navState.shape === shapeOpt.id
                      ? 'bg-[#007aff] text-white border-[#007aff]'
                      : 'bg-black/5 dark:bg-white/5 text-[#1c1c1e] dark:text-white border-transparent'
                  }`}
                >
                  {shapeOpt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Border Outline Style */}
          <div className="space-y-2 pt-1 border-t border-black/5 dark:border-white/5">
            <label className="text-xs font-bold text-[#8e8e93] block">
              {language === 'my' ? 'ဘောင်မျဉ်းနှင့် အလင်းတန်း (Border & Glow)' : 'Border & Accent Glow'}
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'default', label: 'Default' },
                { id: 'glow', label: 'Glow' },
                { id: 'solid', label: 'Solid' },
                { id: 'none', label: 'None' },
              ].map((borderOpt) => (
                <button
                  key={borderOpt.id}
                  onClick={() => handleApplyChange({ borderColor: borderOpt.id as any })}
                  className={`p-2 rounded-xl text-[11px] font-bold transition-all border cursor-pointer text-center ${
                    navState.borderColor === borderOpt.id
                      ? 'bg-[#007aff] text-white border-[#007aff]'
                      : 'bg-black/5 dark:bg-white/5 text-[#1c1c1e] dark:text-white border-transparent'
                  }`}
                >
                  {borderOpt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Show Labels Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
            <div>
              <p className="text-xs font-bold text-[#1c1c1e] dark:text-white">
                {language === 'my' ? 'စာတမ်းများ ပြသမည်' : 'Show Text Labels'}
              </p>
              <p className="text-[10px] text-[#8e8e93]">
                {language === 'my' ? 'အိုင်ကွန်များ အောက်တွင် အမည်များ ပြသ/ဝှက်ပါ' : 'Display feature names below icons'}
              </p>
            </div>
            <button
              onClick={() => handleApplyChange({ showLabels: !navState.showLabels })}
              className={`w-12 h-7 rounded-full p-1 transition-colors border-0 cursor-pointer ${
                navState.showLabels ? 'bg-[#007aff]' : 'bg-black/20 dark:bg-white/20'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  navState.showLabels ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
