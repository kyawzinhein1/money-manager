import React, { useState, useEffect } from 'react';
import { Sun, Moon, Globe, ChevronDown, Check, Bell, Clock, MessageSquare, Send, BellRing, ShieldCheck, Calendar, Download, ExternalLink, RefreshCw, Trash2, CheckCircle2 } from 'lucide-react';
import { Language, Settings } from '../../types';
import { syncGoogleCalendarEvent, deleteGoogleCalendarEvent, getSavedCalendarEventId } from '../../utils/googleCalendar';

interface GeneralPreferencesViewProps {
  t: (key: string) => string;
  settings: Settings;
  onUpdateLanguage: (lang: Language) => void;
  onUpdateTheme: (theme: 'light' | 'dark') => void;
  onUpdateReminder?: (enabled: boolean, time: string, message: string) => void;
  onTriggerTestReminder?: () => void;
}

export const GeneralPreferencesView: React.FC<GeneralPreferencesViewProps> = ({
  t,
  settings,
  onUpdateLanguage,
  onUpdateTheme,
  onUpdateReminder,
  onTriggerTestReminder,
}) => {
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(settings.reminderEnabled ?? false);
  const [reminderTime, setReminderTime] = useState<string>(settings.reminderTime || '20:00');
  const [reminderMessage, setReminderMessage] = useState<string>(settings.reminderMessage || '');
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
  });
  
  const [hasGCalEvent, setHasGCalEvent] = useState<boolean>(() => !!getSavedCalendarEventId());
  const [isGCalSyncing, setIsGCalSyncing] = useState<boolean>(false);
  const [gcalStatusMsg, setGcalStatusMsg] = useState<string>('');

  useEffect(() => {
    setReminderEnabled(settings.reminderEnabled ?? false);
    if (settings.reminderTime) setReminderTime(settings.reminderTime);
    if (settings.reminderMessage !== undefined) setReminderMessage(settings.reminderMessage);
    setHasGCalEvent(!!getSavedCalendarEventId());
  }, [settings.reminderEnabled, settings.reminderTime, settings.reminderMessage]);

  const handleToggleReminder = async (enabled: boolean) => {
    setReminderEnabled(enabled);
    if (onUpdateReminder) {
      onUpdateReminder(enabled, reminderTime, reminderMessage);
    }

    // If user disables reminder and has an active Google Calendar event synced, offer automatic removal
    if (!enabled && hasGCalEvent) {
      const confirmMsg = t('confirmRemoveGoogleCalendar') || "Are you sure you want to delete the daily expense reminder from your Google Calendar?";
      try {
        const deleted = await deleteGoogleCalendarEvent(confirmMsg);
        if (deleted) {
          setHasGCalEvent(false);
          setGcalStatusMsg('');
        }
      } catch (err: any) {
        console.error('Failed to auto-remove Google Calendar event:', err);
      }
    }
  };

  const parseAuthErrorMessage = (err: any) => {
    const code = err?.code || '';
    const msg = String(err?.message || '');
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request' || msg.includes('popup-closed-by-user') || msg.includes('cancelled-popup-request')) {
      return t('popupClosedByUser');
    }
    if (code === 'auth/popup-blocked' || msg.includes('popup-blocked')) {
      return t('popupBlocked');
    }
    return err?.message || 'Google Calendar operation failed.';
  };

  const handleDirectGCalSync = async () => {
    setIsGCalSyncing(true);
    setGcalStatusMsg('');
    try {
      await syncGoogleCalendarEvent({
        time: reminderTime,
        message: reminderMessage,
        lang: settings.language
      });
      setHasGCalEvent(true);
      setGcalStatusMsg(t('googleCalendarSynced') || 'Synced with Google Calendar!');
    } catch (err: any) {
      console.warn('Google Calendar Sync:', err);
      setGcalStatusMsg(parseAuthErrorMessage(err));
    } finally {
      setIsGCalSyncing(false);
    }
  };

  const handleRemoveGCalEvent = async () => {
    const confirmMsg = t('confirmRemoveGoogleCalendar') || "Are you sure you want to delete the daily expense reminder from your Google Calendar?";
    setIsGCalSyncing(true);
    try {
      const deleted = await deleteGoogleCalendarEvent(confirmMsg);
      if (deleted) {
        setHasGCalEvent(false);
        setGcalStatusMsg('');
      }
    } catch (err: any) {
      console.warn('Remove Google Calendar Event:', err);
      setGcalStatusMsg(parseAuthErrorMessage(err));
    } finally {
      setIsGCalSyncing(false);
    }
  };

  const handleTimeChange = (time: string) => {
    setReminderTime(time);
    if (onUpdateReminder) {
      onUpdateReminder(reminderEnabled, time, reminderMessage);
    }
  };

  const handleMessageChange = (msg: string) => {
    setReminderMessage(msg);
    if (onUpdateReminder) {
      onUpdateReminder(reminderEnabled, reminderTime, msg);
    }
  };

  const handleRequestNotificationPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
    }
  };

  const handleDownloadICS = () => {
    const title = settings.language === 'my' ? "Money Manager သတိပေးချက်" : "Money Manager Daily Reminder";
    const msg = reminderMessage || (settings.language === 'my' ? "ဒီနေ့ အသုံးစရိတ်များကို ရေးသွင်းရန် မမေ့ပါနဲ့!" : "Don't forget to log your daily expenses!");
    const timeClean = reminderTime.replace(':', '');
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const startDateStr = `${year}${month}${day}T${timeClean}00`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Money Manager//Daily Expense Reminder//EN',
      'BEGIN:VEVENT',
      `UID:daily-expense-reminder-${Date.now()}@moneymanager`,
      `DTSTAMP:${startDateStr}Z`,
      `DTSTART:${startDateStr}`,
      `RRULE:FREQ=DAILY`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${msg}`,
      'BEGIN:VALARM',
      'TRIGGER:-PT0M',
      'ACTION:DISPLAY',
      `DESCRIPTION:${msg}`,
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Daily_Expense_Reminder.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOpenGoogleCalendar = () => {
    const title = settings.language === 'my' ? "Money Manager သတိပေးချက်" : "Money Manager Daily Reminder";
    const msg = reminderMessage || (settings.language === 'my' ? "ဒီနေ့ အသုံးစရိတ်များကို ရေးသွင်းရန် မမေ့ပါနဲ့!" : "Don't forget to log your daily expenses!");
    const timeClean = reminderTime.replace(':', '');
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const startDateStr = `${year}${month}${day}T${timeClean}00`;

    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(msg)}&dates=${startDateStr}/${startDateStr}&recur=RRULE:FREQ=DAILY`;
    window.open(gcalUrl, '_blank');
  };

  return (
    <div className={`p-5 ios-glass rounded-[2rem] space-y-5 relative transition-all duration-200 ${showLanguageMenu ? 'z-50' : 'z-10'}`}>
      <h3 className="text-sm font-bold text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
        <Sun className="w-4 h-4 text-[#ff9500]" />
        General Preferences
      </h3>

      {/* Language Selection */}
      <div className="space-y-2 flex flex-col relative" id="language-dropdown-container">
        <label className="text-xs font-bold text-[#8e8e93]">
          {t('language')}
        </label>
        
        <button
          id="language-dropdown-btn"
          type="button"
          onClick={() => setShowLanguageMenu(!showLanguageMenu)}
          className="w-full h-11 px-4.5 bg-[#f2f2f7] dark:bg-[#2c2c2e] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] rounded-2xl flex items-center justify-between text-xs md:text-sm font-semibold text-[#1c1c1e] dark:text-[#f2f2f7] transition-all cursor-pointer border-0"
        >
          <div className="flex items-center gap-2.5">
            <Globe className="w-4 h-4 text-[#007aff]" />
            <span>
              {settings.language === 'en' ? 'English' : 'မြန်မာ (Myanmar)'}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-[#8e8e93] transition-transform duration-200 ${showLanguageMenu ? 'rotate-180' : ''}`} />
        </button>

        {showLanguageMenu && (
          <>
            {/* Invisible click backdrop to close */}
            <div
              className="fixed inset-0 z-30 bg-transparent"
              onClick={() => setShowLanguageMenu(false)}
            />

            {/* Dropdown Card */}
            <div
              className="absolute left-0 right-0 top-full mt-2 rounded-2xl bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-3xl border border-white/50 dark:border-white/12 shadow-2xl z-40 p-2 space-y-0.5"
            >
              <div className="px-3 py-1.5 text-[10px] font-extrabold text-[#8e8e93] uppercase tracking-wider">
                {settings.language === 'my' ? 'ဘာသာစကားရွေးချယ်ရန်' : 'Choose Language'}
              </div>

              {/* English Option */}
              <button
                id="lang-opt-en"
                type="button"
                onClick={() => {
                  onUpdateLanguage('en');
                  setShowLanguageMenu(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-all text-left cursor-pointer border-0 bg-transparent ${
                  settings.language === 'en' ? 'text-[#007aff]' : 'text-[#1c1c1e] dark:text-[#f2f2f7]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    settings.language === 'en' ? 'bg-[#007aff]/10 text-[#007aff]' : 'bg-black/[0.03] dark:bg-white/[0.05] text-[#8e8e93]'
                  }`}>
                    EN
                  </div>
                  <div>
                    <p className="text-xs font-extrabold leading-tight">English</p>
                    <p className="text-[10px] text-[#8e8e93] leading-none mt-1">United States / Global</p>
                  </div>
                </div>
                {settings.language === 'en' && <Check className="w-4 h-4 text-[#007aff] shrink-0" />}
              </button>

              {/* Myanmar Option */}
              <button
                id="lang-opt-my"
                type="button"
                onClick={() => {
                  onUpdateLanguage('my');
                  setShowLanguageMenu(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-all text-left cursor-pointer border-0 bg-transparent ${
                  settings.language === 'my' ? 'text-[#007aff]' : 'text-[#1c1c1e] dark:text-[#f2f2f7]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    settings.language === 'my' ? 'bg-[#007aff]/10 text-[#007aff]' : 'bg-black/[0.03] dark:bg-white/[0.05] text-[#8e8e93]'
                  }`}>
                    MY
                  </div>
                  <div>
                    <p className="text-xs font-extrabold leading-tight">မြန်မာ (Myanmar)</p>
                    <p className="text-[10px] text-[#8e8e93] leading-none mt-1">Burmese / Localized</p>
                  </div>
                </div>
                {settings.language === 'my' && <Check className="w-4 h-4 text-[#007aff] shrink-0" />}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Theme Selector */}
      <div className="pt-3 border-t border-black/[0.05] dark:border-white/[0.05] space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
            <Sun className="w-4 h-4 text-[#ff9500] dark:hidden" />
            <Moon className="w-4 h-4 text-[#007aff] hidden dark:block" />
            <span>{t('theme')}</span>
          </label>
          <span className="text-[10px] text-[#007aff] bg-[#007aff]/10 border border-[#007aff]/20 px-2.5 py-0.5 rounded-lg font-extrabold">
            {settings.theme === 'dark' ? t('darkMode') : t('lightMode')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Light Mode Card */}
          <button
            id="theme-toggle-light"
            type="button"
            onClick={() => onUpdateTheme('light')}
            className={`relative p-3.5 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer text-center border-2 ${
              settings.theme === 'light'
                ? 'bg-white dark:bg-[#2c2c2e] border-[#007aff] shadow-md scale-[1.02]'
                : 'bg-[#f2f2f7]/70 dark:bg-[#1c1c1e]/70 border-transparent hover:border-black/10 dark:hover:border-white/10 opacity-70 hover:opacity-100'
            }`}
          >
            {settings.theme === 'light' && (
              <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#007aff] text-white flex items-center justify-center shadow-xs">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            )}

            <div className="w-full h-12 rounded-xl bg-gradient-to-b from-[#ffffff] to-[#f2f2f7] border border-black/10 p-2 flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between">
                <div className="w-3.5 h-3.5 rounded-full bg-[#ff9500] flex items-center justify-center">
                  <Sun className="w-2.5 h-2.5 text-white" />
                </div>
                <div className="w-8 h-1.5 rounded-full bg-black/15" />
              </div>
              <div className="space-y-1">
                <div className="w-full h-1.5 rounded-full bg-black/20" />
                <div className="w-2/3 h-1.5 rounded-full bg-[#007aff]/50" />
              </div>
            </div>

            <p className={`text-xs font-black ${settings.theme === 'light' ? 'text-[#1c1c1e] dark:text-[#f2f2f7]' : 'text-[#8e8e93]'}`}>
              {t('lightMode')}
            </p>
          </button>

          {/* Dark Mode Card */}
          <button
            id="theme-toggle-dark"
            type="button"
            onClick={() => onUpdateTheme('dark')}
            className={`relative p-3.5 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer text-center border-2 ${
              settings.theme === 'dark'
                ? 'bg-[#2c2c2e] border-[#007aff] shadow-md scale-[1.02]'
                : 'bg-[#f2f2f7]/70 dark:bg-[#1c1c1e]/70 border-transparent hover:border-black/10 dark:hover:border-white/10 opacity-70 hover:opacity-100'
            }`}
          >
            {settings.theme === 'dark' && (
              <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#007aff] text-white flex items-center justify-center shadow-xs">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            )}

            <div className="w-full h-12 rounded-xl bg-gradient-to-b from-[#1c1c1e] to-[#121214] border border-white/10 p-2 flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between">
                <div className="w-3.5 h-3.5 rounded-full bg-[#007aff] flex items-center justify-center">
                  <Moon className="w-2.5 h-2.5 text-white" />
                </div>
                <div className="w-8 h-1.5 rounded-full bg-white/20" />
              </div>
              <div className="space-y-1">
                <div className="w-full h-1.5 rounded-full bg-white/20" />
                <div className="w-2/3 h-1.5 rounded-full bg-[#007aff]/60" />
              </div>
            </div>

            <p className={`text-xs font-black ${settings.theme === 'dark' ? 'text-[#f2f2f7]' : 'text-[#8e8e93]'}`}>
              {t('darkMode')}
            </p>
          </button>
        </div>
      </div>

      {/* Daily Expense Reminder Section */}
      <div className="pt-4 border-t border-black/[0.05] dark:border-white/[0.05] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl transition-colors ${reminderEnabled ? 'bg-[#ff9500]/15 text-[#ff9500]' : 'bg-black/5 dark:bg-white/5 text-[#8e8e93]'}`}>
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#1c1c1e] dark:text-[#f2f2f7]">
                {t('dailyReminder')}
              </h4>
              <p className="text-[10px] text-[#8e8e93]">
                {t('dailyReminderDesc')}
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            id="reminder-toggle-btn"
            type="button"
            onClick={() => handleToggleReminder(!reminderEnabled)}
            className={`relative w-12 h-7 rounded-full transition-colors duration-200 p-0.5 cursor-pointer border-0 ${
              reminderEnabled ? 'bg-[#34c759]' : 'bg-[#e5e5ea] dark:bg-[#3a3a3c]'
            }`}
            aria-label={t('dailyReminder')}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                reminderEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {reminderEnabled && (
          <div className="space-y-3.5 pt-1 animate-fade-in">
            {/* Time Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#8e8e93] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#007aff]" />
                <span>{t('reminderTime')}</span>
              </label>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  id="reminder-time-input"
                  type="time"
                  value={reminderTime}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="h-10 px-3 bg-[#f2f2f7] dark:bg-[#2c2c2e] text-[#1c1c1e] dark:text-[#f2f2f7] font-extrabold text-sm rounded-xl border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#007aff]"
                />

                {/* Quick Presets */}
                <div className="flex items-center gap-1 overflow-x-auto py-1">
                  {['08:00', '13:00', '20:00', '21:30'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleTimeChange(preset)}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer border-0 ${
                        reminderTime === preset
                          ? 'bg-[#007aff] text-white shadow-xs'
                          : 'bg-black/5 dark:bg-white/5 text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-white'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Message Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#8e8e93] flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#5856d6]" />
                <span>{t('reminderMessage')}</span>
              </label>
              <input
                id="reminder-message-input"
                type="text"
                value={reminderMessage}
                onChange={(e) => handleMessageChange(e.target.value)}
                placeholder={t('reminderMessagePlaceholder')}
                className="w-full h-10 px-3.5 bg-[#f2f2f7] dark:bg-[#2c2c2e] text-[#1c1c1e] dark:text-[#f2f2f7] text-xs font-semibold rounded-xl border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#007aff]"
              />
            </div>

            {/* Web Notification Permission & Test Trigger Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              {'Notification' in window && (
                <button
                  type="button"
                  onClick={handleRequestNotificationPermission}
                  disabled={notifPermission === 'granted'}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all border-0 ${
                    notifPermission === 'granted'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 cursor-default'
                      : notifPermission === 'denied'
                      ? 'bg-red-500/10 text-red-600 dark:text-red-400 cursor-pointer'
                      : 'bg-[#007aff]/10 text-[#007aff] hover:bg-[#007aff]/20 cursor-pointer'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>
                    {notifPermission === 'granted'
                      ? t('notificationsAllowed')
                      : notifPermission === 'denied'
                      ? t('notificationsBlocked')
                      : t('enableNotifications')}
                  </span>
                </button>
              )}

              {onTriggerTestReminder && (
                <button
                  id="test-reminder-btn"
                  type="button"
                  onClick={onTriggerTestReminder}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ff9500]/10 hover:bg-[#ff9500]/20 text-[#ff9500] font-extrabold text-[11px] rounded-xl transition-all cursor-pointer border-0 ml-auto"
                >
                  <BellRing className="w-3.5 h-3.5" />
                  <span>{t('testReminder')}</span>
                </button>
              )}
            </div>

            {/* Outside-App Daily Alarm Calendar Sync Section */}
            <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/10 space-y-2.5 mt-2">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-[#007aff] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="text-[11px] font-bold text-[#1c1c1e] dark:text-[#f2f2f7]">
                      {t('syncCalendar')}
                    </h5>
                    {hasGCalEvent && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Google Calendar</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#8e8e93] leading-relaxed">
                    {t('syncCalendarDesc')}
                  </p>
                </div>
              </div>

              {/* Direct Google Calendar Sync Button */}
              <div className="pt-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    id="direct-gcal-sync-btn"
                    type="button"
                    onClick={handleDirectGCalSync}
                    disabled={isGCalSyncing}
                    className="flex-1 min-w-[180px] flex items-center justify-center gap-2 px-3.5 py-2.5 bg-[#4285f4] hover:bg-[#3367d6] active:scale-[0.99] text-white font-extrabold text-xs rounded-xl transition-all shadow-xs cursor-pointer border-0 disabled:opacity-60"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGCalSyncing ? 'animate-spin' : ''}`} />
                    <span>{hasGCalEvent ? (t('googleCalendarSynced') || 'Update Google Calendar') : (t('syncGoogleCalendarDirect') || 'Sync Directly to Google Calendar')}</span>
                  </button>

                  {hasGCalEvent && (
                    <button
                      id="remove-gcal-btn"
                      type="button"
                      onClick={handleRemoveGCalEvent}
                      disabled={isGCalSyncing}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-xs rounded-xl transition-all cursor-pointer border-0 disabled:opacity-60"
                      title={t('removeFromGoogleCalendar')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{t('removeFromGoogleCalendar')}</span>
                    </button>
                  )}
                </div>

                {/* Secondary options: ICS download & web template */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    id="download-ics-btn"
                    type="button"
                    onClick={handleDownloadICS}
                    className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-3 py-1.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#1c1c1e] dark:text-[#f2f2f7] font-semibold text-[11px] rounded-xl transition-all cursor-pointer border-0"
                  >
                    <Download className="w-3 h-3" />
                    <span>{t('downloadIcs')}</span>
                  </button>

                  <button
                    id="open-gcal-btn"
                    type="button"
                    onClick={handleOpenGoogleCalendar}
                    className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-3 py-1.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#1c1c1e] dark:text-[#f2f2f7] font-semibold text-[11px] rounded-xl transition-all cursor-pointer border-0"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>{t('openGoogleCalendar')}</span>
                  </button>
                </div>
              </div>

              {gcalStatusMsg && (
                <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 pt-0.5">
                  {gcalStatusMsg}
                </p>
              )}

              <p className="text-[9.5px] text-[#8e8e93] dark:text-[#98989d] italic leading-tight pt-1">
                {t('calendarNotice')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
