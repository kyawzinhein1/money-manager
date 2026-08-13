import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, Moon, Sun, Bell, CheckCircle2, AlertCircle, AlertTriangle, Info, Check, TrendingUp } from 'lucide-react';
import { Settings, Currency, UserProfile, Language } from '../types';

interface DashboardHeaderProps {
  t: (key: string) => string;
  settings: Settings;
  customCurrency: Currency;
  profile: UserProfile;
  activeTab: string;
  showAlertsMenu: boolean;
  readAlertIds: string[];
  forecastAlerts: Array<{
    id: string;
    type: 'critical' | 'warning' | 'info' | 'success';
    titleEn: string;
    titleMy: string;
    descEn: string;
    descMy: string;
  }>;
  onUpdateLanguage: (lang: Language) => void;
  onUpdateTheme: (theme: 'light' | 'dark') => void;
  onToggleAlertsMenu: () => void;
  onCloseAlertsMenu: () => void;
  onToggleReadAlert: (id: string) => void;
  onMarkAllAlertsRead: (activeIds: string[]) => void;
  onMarkAllAlertsUnread: (activeIds: string[]) => void;
  onSelectTab: (tab: any) => void;
  onSelectProfile: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = React.memo(({
  t,
  settings,
  customCurrency,
  profile,
  activeTab,
  showAlertsMenu,
  readAlertIds,
  forecastAlerts,
  onUpdateLanguage,
  onUpdateTheme,
  onToggleAlertsMenu,
  onCloseAlertsMenu,
  onToggleReadAlert,
  onMarkAllAlertsRead,
  onMarkAllAlertsUnread,
  onSelectTab,
  onSelectProfile,
}) => {
  const unreadAlertsCount = forecastAlerts.filter(a => !readAlertIds.includes(a.id)).length;

  return (
    <header className="relative z-40 ios-glass-nav sticky top-0 pt-[env(safe-area-inset-top)] no-print transition-all border-b border-black/[0.04] dark:border-white/[0.05]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-[#007aff] to-[#30b0ff] rounded-2xl flex items-center justify-center text-white shadow-md shadow-[#007aff]/25 ring-2 ring-white/50 dark:ring-black/50">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base md:text-lg font-extrabold tracking-tight text-[#1c1c1e] dark:text-[#f2f2f7] font-sans">
              {t('appName')}
            </h1>
            <p className="text-[10px] text-[#8e8e93] font-sans tracking-wider uppercase font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34c759]" />
              {customCurrency.code} Mode
            </p>
          </div>
        </div>

        {/* Quick toggle settings in top bar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Language toggle quick button */}
          <button
            id="quick-lang-toggle"
            onClick={() => onUpdateLanguage(settings.language === 'en' ? 'my' : 'en')}
            className="px-2.5 py-1.5 text-[#007aff] hover:bg-[#007aff]/10 rounded-full transition-all cursor-pointer font-bold text-xs"
            title="Switch Language"
          >
            {settings.language === 'en' ? 'MY' : 'EN'}
          </button>

          {/* Theme Toggle Button */}
          <button
            id="quick-theme-toggle"
            onClick={() => onUpdateTheme(settings.theme === 'light' ? 'dark' : 'light')}
            className="p-2 text-[#8e8e93] hover:text-[#007aff] hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all cursor-pointer"
            title="Toggle Theme"
          >
            {settings.theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Real-time Budget Alerts Bell Icon with dropdown popover */}
          <div className="relative">
            <button
              id="quick-alerts-toggle"
              onClick={onToggleAlertsMenu}
              className={`p-2 rounded-full transition-all cursor-pointer relative ${
                showAlertsMenu 
                  ? 'text-[#007aff] bg-[#007aff]/10' 
                  : 'text-[#8e8e93] hover:text-[#007aff] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              title="Budget Alerts & Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadAlertsCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ff3b30] rounded-full border border-white dark:border-black animate-pulse" />
              )}
            </button>

            <AnimatePresence>
              {showAlertsMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={onCloseAlertsMenu} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-3xl border border-black/10 dark:border-white/10 rounded-[2rem] shadow-2xl p-5 z-50 overflow-hidden no-print"
                  >
                    <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-[#007aff]" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-[#1c1c1e] dark:text-white">
                          {settings.language === 'my' ? 'ဘတ်ဂျက် သတိပေးချက်များ' : 'Budget Alerts Center'}
                        </h4>
                      </div>
                      {forecastAlerts.length > 0 && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const activeIds = forecastAlerts.map(a => a.id);
                              const hasUnread = activeIds.some(id => !readAlertIds.includes(id));
                              if (hasUnread) {
                                onMarkAllAlertsRead(activeIds);
                              } else {
                                onMarkAllAlertsUnread(activeIds);
                              }
                            }}
                            className="text-[10px] text-[#007aff] hover:underline font-extrabold bg-transparent border-none cursor-pointer"
                          >
                            {unreadAlertsCount > 0
                              ? (settings.language === 'my' ? 'အားလုံးဖတ်ပြီး' : 'Mark all read')
                              : (settings.language === 'my' ? 'မဖတ်ရသေးဟုမှတ်' : 'Mark all unread')
                            }
                          </button>
                          <span className="text-[10px] bg-[#007aff]/10 text-[#007aff] font-bold px-2 py-0.5 rounded-full">
                            {unreadAlertsCount}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
                      {forecastAlerts.length === 0 ? (
                        <div className="text-center py-10 text-xs text-[#8e8e93] space-y-2">
                          <CheckCircle2 className="w-8 h-8 text-[#34c759] mx-auto opacity-80" />
                          <p className="font-medium">
                            {settings.language === 'my' 
                              ? 'သတိပေးချက် မရှိပါ။ သင့်ဘတ်ဂျက်မှာ စိတ်ချရသောအခြေအနေရှိသည်။' 
                              : 'All safe! No active budget alarms.'}
                          </p>
                        </div>
                      ) : (
                        forecastAlerts.map((alert) => {
                          const isCritical = alert.type === 'critical';
                          const isWarning = alert.type === 'warning';
                          const isSuccess = alert.type === 'success';
                          const isRead = readAlertIds.includes(alert.id);

                          let alertBg = 'bg-[#007aff]/5 dark:bg-[#007aff]/10 border-[#007aff]/10';
                          let alertText = 'text-[#007aff]';
                          if (isCritical) {
                            alertBg = 'bg-[#ff3b30]/5 dark:bg-[#ff3b30]/10 border-[#ff3b30]/10';
                            alertText = 'text-[#ff3b30]';
                          } else if (isWarning) {
                            alertBg = 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/10';
                            alertText = 'text-amber-500';
                          } else if (isSuccess) {
                            alertBg = 'bg-[#34c759]/5 dark:bg-[#34c759]/10 border-[#34c759]/10';
                            alertText = 'text-[#34c759]';
                          }

                          return (
                            <div
                              key={alert.id}
                              className={`group p-3 rounded-2xl border flex gap-3 leading-normal transition-all duration-200 ${
                                isRead
                                  ? 'bg-black/[0.01] dark:bg-white/[0.01] border-black/[0.04] dark:border-white/[0.04] opacity-50'
                                  : `${alertBg} shadow-xs`
                              }`}
                            >
                              <div className={`p-1.5 rounded-xl self-start shrink-0 ${alertBg} ${alertText}`}>
                                {isCritical ? (
                                  <AlertCircle className="w-3.5 h-3.5" />
                                ) : isWarning ? (
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                ) : isSuccess ? (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                ) : (
                                  <Info className="w-3.5 h-3.5" />
                                )}
                              </div>
                              <div className="space-y-0.5 flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <h5 className={`font-extrabold text-[#1c1c1e] dark:text-white text-[11px] leading-snug ${isRead ? 'line-through text-[#8e8e93]' : ''}`}>
                                    {settings.language === 'my' ? alert.titleMy : alert.titleEn}
                                  </h5>
                                  
                                  <button
                                    onClick={() => onToggleReadAlert(alert.id)}
                                    className="shrink-0 w-7 h-7 -mt-1 -mr-1 rounded-full flex items-center justify-center text-[#8e8e93] hover:text-[#007aff] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-all cursor-pointer border-0 bg-transparent"
                                    title={isRead ? (settings.language === 'en' ? "Mark as Unread" : "မဖတ်ရသေးဟုမှတ်ရန်") : (settings.language === 'en' ? "Mark as Read" : "ဖတ်ပြီးမှတ်သားရန်")}
                                  >
                                    {isRead ? (
                                      <span className="text-[10px] font-extrabold leading-none opacity-50 hover:opacity-100">↺</span>
                                    ) : (
                                      <div className="relative w-4 h-4 flex items-center justify-center">
                                        <span className="absolute w-2 h-2 rounded-full bg-[#007aff] group-hover:scale-0 transition-all duration-150" />
                                        <Check className="w-3.5 h-3.5 text-[#007aff] scale-0 group-hover:scale-100 transition-all duration-150 absolute" />
                                      </div>
                                    )}
                                  </button>
                                </div>
                                <p className="text-black/70 dark:text-white/70 font-medium text-[10px] leading-relaxed">
                                  {settings.language === 'my' ? alert.descMy : alert.descEn}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="border-t border-black/5 dark:border-white/5 pt-3 mt-3">
                      <button
                        onClick={() => {
                          onSelectTab('budgets');
                          onCloseAlertsMenu();
                        }}
                        className="w-full h-9 bg-[#007aff] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#007aff]/90 transition-colors cursor-pointer border-none"
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{settings.language === 'my' ? 'စမတ်ခန့်မှန်းချက်များကို ကြည့်ရန်' : 'View Smart Projections'}</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Profile Switch */}
          <button
            id="navbar-profile-btn"
            onClick={onSelectProfile}
            className={`p-1 rounded-full transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'profile' ? 'ring-2 ring-[#007aff] bg-[#007aff]/10' : ''
            }`}
            title={t('profile')}
          >
            <img
              src={profile.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={profile.name}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover border border-black/10 dark:border-white/10 shadow-xs"
            />
            <span className="text-xs font-bold text-[#1c1c1e] dark:text-[#f2f2f7] pr-1 font-sans max-w-[80px] sm:max-w-[120px] truncate">
              {profile.name.split(' ')[0]}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
});
