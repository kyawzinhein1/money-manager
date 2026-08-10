import React, { useState, useMemo } from 'react';
import { 
  Bell, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Check, 
  TrendingUp, 
  BellOff, 
  CheckCheck
} from 'lucide-react';
import { Language } from '../types';
import { ForecastReport, SmartAlert } from '../utils/forecasting';
import { TRANSLATIONS } from '../translations';

export interface NotificationsSectionProps {
  forecastReport: ForecastReport;
  readAlertIds: string[];
  markAllAlertsAsRead: (ids: string[]) => void;
  markAllAlertsAsUnread: (ids: string[]) => void;
  toggleReadAlert: (id: string) => void;
  language: Language;
  onClose?: () => void;
  onNavigateToBudgets?: () => void;
  formatAmount: (amount: number) => string;
}

export const NotificationsSection: React.FC<NotificationsSectionProps> = React.memo(({
  forecastReport,
  readAlertIds,
  markAllAlertsAsRead,
  markAllAlertsAsUnread,
  toggleReadAlert,
  language,
  onClose,
  onNavigateToBudgets,
}) => {
  const t = (key: string) => TRANSLATIONS[language][key] || key;

  const [filterMode, setFilterMode] = useState<'all' | 'unread' | 'read'>('all');

  const alerts = forecastReport.alerts || [];
  const unreadCount = alerts.filter(a => !readAlertIds.includes(a.id)).length;
  const readCount = alerts.length - unreadCount;

  const filteredAlerts = useMemo(() => {
    if (filterMode === 'unread') {
      return alerts.filter(a => !readAlertIds.includes(a.id));
    }
    if (filterMode === 'read') {
      return alerts.filter(a => readAlertIds.includes(a.id));
    }
    return alerts;
  }, [alerts, readAlertIds, filterMode]);

  const allActiveIds = useMemo(() => alerts.map(a => a.id), [alerts]);
  const hasUnread = unreadCount > 0;

  const handleToggleAll = () => {
    if (hasUnread) {
      markAllAlertsAsRead(allActiveIds);
    } else {
      markAllAlertsAsUnread(allActiveIds);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6" id="notifications-section">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2.5 font-sans">
            <div className="w-8 h-8 rounded-xl bg-[#007aff]/10 text-[#007aff] flex items-center justify-center shrink-0 border border-[#007aff]/20">
              <Bell className="w-4.5 h-4.5" />
            </div>
            {language === 'my' ? 'သတိပေးချက်များ' : 'Notifications'}
          </h2>
          <p className="text-xs text-[#8e8e93]">
            {language === 'my'
              ? 'ဘတ်ဂျက်နှင့် ဘဏ္ဍာရေး အသိပေးချက် သတိပေးချက်များ'
              : 'Budget alerts and financial notifications center'}
          </p>
        </div>
        {onClose && (
          <button
            id="close-notifications-btn"
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center bg-[#f2f2f7] dark:bg-[#2c2c2e] text-[#1c1c1e] dark:text-[#f2f2f7] rounded-full hover:opacity-80 transition-all cursor-pointer border-0"
            title={language === 'my' ? 'ပိတ်ရန်' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Notifications Card */}
      <div className="ios-glass rounded-[2rem] p-6 shadow-xs relative">
        {/* Header Action & Summary Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-5 border-b border-black/5 dark:border-white/5 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[#1c1c1e] dark:text-[#f2f2f7]">
                {language === 'my' ? 'ဘတ်ဂျက်နှင့် သုံးစွဲမှု သတိပေးချက်များ' : 'Budget & Spending Alerts'}
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#007aff]/10 text-[#007aff] font-extrabold">
                {unreadCount} {language === 'my' ? 'မဖတ်ရသေး' : 'Unread'}
              </span>
            </div>
            <p className="text-xs text-[#8e8e93]">
              {language === 'my'
                ? 'လစဉ် ဘတ်ဂျက်သတ်မှတ်ချက်များ ပိုမိုကျော်လွန်ခြင်းမရှိစေရန် စမတ်စနစ်မှ အလိုအလျောက် အသိပေးချက်များ'
                : 'Automated smart alarms preventing budget overruns and monitoring spend velocity'}
            </p>
          </div>

          {alerts.length > 0 && (
            <button
              id="toggle-all-read-btn"
              onClick={handleToggleAll}
              className="px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-[#007aff]/10 hover:text-[#007aff] text-[#1c1c1e] dark:text-[#f2f2f7] font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer border-0 self-start sm:self-auto shrink-0"
            >
              <CheckCheck className="w-4 h-4 text-[#007aff]" />
              <span>
                {hasUnread
                  ? (language === 'my' ? 'အားလုံးဖတ်ပြီး ဟုမှတ်မည်' : 'Mark all read')
                  : (language === 'my' ? 'မဖတ်ရသေးဟု မှတ်မည်' : 'Mark all unread')}
              </span>
            </button>
          )}
        </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border-0 ${
                filterMode === 'all'
                  ? 'bg-[#007aff] text-white shadow-xs'
                  : 'bg-black/5 dark:bg-white/5 text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white'
              }`}
            >
              {language === 'my' ? 'အားလုံး' : 'All'} ({alerts.length})
            </button>
            <button
              onClick={() => setFilterMode('unread')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border-0 ${
                filterMode === 'unread'
                  ? 'bg-[#007aff] text-white shadow-xs'
                  : 'bg-black/5 dark:bg-white/5 text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white'
              }`}
            >
              {language === 'my' ? 'မဖတ်ရသေး' : 'Unread'} ({unreadCount})
            </button>
            <button
              onClick={() => setFilterMode('read')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border-0 ${
                filterMode === 'read'
                  ? 'bg-[#007aff] text-white shadow-xs'
                  : 'bg-black/5 dark:bg-white/5 text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white'
              }`}
            >
              {language === 'my' ? 'ဖတ်ပြီး' : 'Read'} ({readCount})
            </button>
          </div>

          {/* Alert List Container */}
          <div className="space-y-3">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#34c759]/10 text-[#34c759] flex items-center justify-center mx-auto">
                  <BellOff className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[#1c1c1e] dark:text-[#f2f2f7]">
                    {language === 'my' ? 'သတိပေးချက်များ မရှိသေးပါ' : 'No notifications'}
                  </h4>
                  <p className="text-xs text-[#8e8e93] max-w-sm mx-auto">
                    {filterMode === 'unread'
                      ? (language === 'my' ? 'မဖတ်ရသေးသော သတိပေးချက်များ မရှိပါ။' : 'You have read all notifications.')
                      : (language === 'my'
                          ? 'သုံးစွဲမှုနှင့် ဘတ်ဂျက် စီမံခန့်ခွဲမှုအားလုံး အဆင်ပြေလျက်ရှိပါသည်။'
                          : 'Your budget and spending limits are performing well without breach warnings.')}
                  </p>
                </div>
              </div>
            ) : (
              filteredAlerts.map((alert: SmartAlert) => {
                const isCritical = alert.type === 'critical';
                const isWarning = alert.type === 'warning';
                const isSuccess = alert.type === 'success';
                const isRead = readAlertIds.includes(alert.id);

                let alertBg = 'bg-[#007aff]/5 dark:bg-[#007aff]/10 border-[#007aff]/20';
                let alertText = 'text-[#007aff]';
                if (isCritical) {
                  alertBg = 'bg-[#ff3b30]/5 dark:bg-[#ff3b30]/10 border-[#ff3b30]/20';
                  alertText = 'text-[#ff3b30]';
                } else if (isWarning) {
                  alertBg = 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20';
                  alertText = 'text-amber-500';
                } else if (isSuccess) {
                  alertBg = 'bg-[#34c759]/5 dark:bg-[#34c759]/10 border-[#34c759]/20';
                  alertText = 'text-[#34c759]';
                }

                return (
                  <div
                    key={alert.id}
                    className={`group p-4 rounded-2xl border flex items-start gap-3.5 transition-all duration-200 ${
                      isRead
                        ? 'bg-black/[0.01] dark:bg-white/[0.01] border-black/[0.05] dark:border-white/[0.05] opacity-60'
                        : `${alertBg} shadow-xs`
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${alertBg} ${alertText}`}>
                      {isCritical ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : isWarning ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : isSuccess ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Info className="w-4 h-4" />
                      )}
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`font-bold text-[#1c1c1e] dark:text-white text-xs sm:text-sm leading-snug ${isRead ? 'line-through text-[#8e8e93]' : ''}`}>
                          {language === 'my' ? alert.titleMy : alert.titleEn}
                        </h4>

                        <button
                          onClick={() => toggleReadAlert(alert.id)}
                          className="shrink-0 w-8 h-8 -mt-1 -mr-1 rounded-full flex items-center justify-center text-[#8e8e93] hover:text-[#007aff] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-all cursor-pointer border-0 bg-transparent"
                          title={isRead ? (language === 'en' ? "Mark as Unread" : "မဖတ်ရသေးဟုမှတ်ရန်") : (language === 'en' ? "Mark as Read" : "ဖတ်ပြီးမှတ်သားရန်")}
                        >
                          {isRead ? (
                            <span className="text-xs font-extrabold leading-none opacity-60 hover:opacity-100">↺</span>
                          ) : (
                            <div className="relative w-4 h-4 flex items-center justify-center">
                              <span className="absolute w-2.5 h-2.5 rounded-full bg-[#007aff] group-hover:scale-0 transition-all duration-150" />
                              <Check className="w-4 h-4 text-[#007aff] scale-0 group-hover:scale-100 transition-all duration-150 absolute" />
                            </div>
                          )}
                        </button>
                      </div>

                      <p className="text-black/80 dark:text-white/80 text-xs leading-relaxed">
                        {language === 'my' ? alert.descMy : alert.descEn}
                      </p>

                      {alert.category && (
                        <div className="pt-1 flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-[#8e8e93]">
                            {alert.category}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Action to Navigate to Budgets */}
          {onNavigateToBudgets && (
            <div className="border-t border-black/5 dark:border-white/5 pt-4 mt-6">
              <button
                id="notification-view-budgets-btn"
                onClick={onNavigateToBudgets}
                className="w-full h-11 bg-[#007aff] text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#007aff]/90 transition-colors cursor-pointer border-none shadow-xs"
              >
                <TrendingUp className="w-4 h-4" />
                <span>{language === 'my' ? 'စမတ် ဘတ်ဂျက်ခန့်မှန်းချက်များကို ကြည့်ရန်' : 'View Smart Projections & Budgets'}</span>
              </button>
            </div>
          )}
      </div>
    </div>
  );
});
