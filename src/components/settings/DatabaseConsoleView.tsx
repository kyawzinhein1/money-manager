import React, { useState } from 'react';
import {
  Database,
  X,
  ShieldCheck,
  FileDown,
  UploadCloud,
  AlertCircle,
  RefreshCw,
  Trash2,
  Coins,
  FolderKanban,
  Tag,
  Mail,
  SlidersHorizontal,
  Check,
  Copy,
  Save
} from 'lucide-react';
import { Transaction, Budget, Settings, UserProfile } from '../../types';

interface DatabaseConsoleViewProps {
  t: (key: string) => string;
  settings: Settings;
  profile: UserProfile;
  transactions: Transaction[];
  budgets: Budget[];
  incomeCategories: string[];
  expenseCategories: string[];
  readAlertIds: string[];
  onClose: () => void;
  onLoadDemoData: () => void;
  onClearAllData: () => void;
  onResetSettings?: () => void;
  onRestoreBackup: (json: any) => void;
}

export const DatabaseConsoleView: React.FC<DatabaseConsoleViewProps> = React.memo(({
  t,
  settings,
  profile,
  transactions,
  budgets,
  incomeCategories,
  expenseCategories,
  readAlertIds,
  onClose,
  onLoadDemoData,
  onClearAllData,
  onResetSettings,
  onRestoreBackup,
}) => {
  const [importError, setImportError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [isEditingKey, setIsEditingKey] = useState<string | null>(null);
  const [editJsonString, setEditJsonString] = useState<string>('');
  const [editError, setEditError] = useState<string | null>(null);
  const [copySuccessKey, setCopySuccessKey] = useState<string | null>(null);

  const handleDownloadBackupFile = () => {
    try {
      const backupData = {
        transactions: transactions || [],
        budgets: budgets || [],
        incomeCategories,
        expenseCategories,
        settings,
        profile,
        lastUpdated: new Date().toISOString()
      };
      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `money_manager_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export backup JSON file', e);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processBackupFile = (file: File) => {
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      setImportError(settings.language === 'my' ? 'ဖိုင်အမျိုးအစားသည် JSON ဖြစ်ရပါမည်။' : 'File must be a JSON file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.transactions || !Array.isArray(json.transactions)) {
          throw new Error('Invalid backup structure: transactions are missing');
        }
        setImportError(null);
        onRestoreBackup(json);
      } catch (err) {
        setImportError(settings.language === 'my' ? 'မမှန်ကန်သော ပုံစံဖြစ်နေပါသည် (ပျက်စီးနေသော ဖိုင်ဖြစ်နိုင်သည်)' : 'Invalid backup file structure or corrupted data.');
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processBackupFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processBackupFile(file);
    }
  };

  const calculateTotalStorageSize = () => {
    let totalBytes = 0;
    const keys = ['mm_transactions', 'mm_budgets', 'mm_income_categories', 'mm_expense_categories', 'mm_profile', 'mm_settings', 'read_alert_ids'];
    keys.forEach((k) => {
      const val = localStorage.getItem(k) || '';
      totalBytes += new Blob([val]).size;
    });
    if (totalBytes < 1024) return `${totalBytes} Bytes`;
    return `${(totalBytes / 1024).toFixed(2)} KB`;
  };

  const getKeySizeStr = (key: string) => {
    const val = localStorage.getItem(key) || '';
    const bytes = new Blob([val]).size;
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const handleCopyKeyData = (key: string, data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopySuccessKey(key);
    setTimeout(() => setCopySuccessKey(null), 2000);
  };

  const handleStartEdit = (key: string, data: any) => {
    setIsEditingKey(key);
    setEditJsonString(JSON.stringify(data, null, 2));
    setEditError(null);
  };

  const handleSaveEdit = (key: string) => {
    try {
      const parsed = JSON.parse(editJsonString);
      localStorage.setItem(key, JSON.stringify(parsed));
      window.location.reload();
    } catch (e: any) {
      setEditError(e.message || 'Invalid JSON syntax');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
      {/* Header Row */}
      <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.05] pb-5 gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
            <Database className="w-5 h-5 text-[#007aff]" />
            {settings.language === 'my' ? 'ဒေတာဘေ့စ်နှင့် စာရင်းထိန်းသိမ်းမှု' : 'Database & Data Ledger'}
          </h2>
          <p className="text-xs text-[#8e8e93] font-medium">
            {settings.language === 'my'
              ? 'လိုင်းမဲ့ဒေတာဘေ့စ် စစ်ဆေးပြင်ဆင်မှုများ၊ ဒေတာသိမ်းဆည်းခြင်းနှင့် စမ်းသပ်ဒေတာများကို စီမံခန့်ခွဲပါ'
              : 'Manage local offline databases, create/restore backups, or load demo datasets'}
          </p>
        </div>
        <button
          id="close-database-console-btn"
          onClick={onClose}
          className="w-11 h-11 flex items-center justify-center bg-[#f2f2f7] dark:bg-[#2c2c2e] text-[#1c1c1e] dark:text-[#f2f2f7] rounded-full hover:opacity-80 transition-all cursor-pointer border-0 shrink-0"
          title="Close Database Console"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Backup & Restore, reset/demo */}
        <div className="space-y-6">
          {/* Easy Backup & Restore Card */}
          <div className="p-6 ios-glass rounded-[2rem] space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-black/[0.04] dark:border-white/[0.04]">
              <ShieldCheck className="w-5 h-5 text-[#34c759]" />
              <div>
                <h3 className="text-sm font-extrabold text-[#1c1c1e] dark:text-[#f2f2f7]">
                  {settings.language === 'my' ? 'လုံခြုံစိတ်ချရသော ဒေတာသိမ်းဆည်းခြင်းနှင့် ပြန်ယူခြင်း' : 'Secure Backup & Restore'}
                </h3>
                <p className="text-[10px] text-[#8e8e93] mt-0.5 font-medium">
                  {settings.language === 'my'
                    ? 'သင့်စက်ပစ္စည်းထဲတွင် ဒေတာများကို Backup JSON ဖိုင်အဖြစ် လုံခြုံစွာ သိမ်းဆည်းပါ သို့မဟုတ် ပြန်ယူပါ'
                    : 'Easily save a copy of your ledger to your device or restore from a previous backup file'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Export/Backup Column */}
              <div className="space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <h4 className="text-xs font-black text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#007aff]/10 text-[#007aff] flex items-center justify-center text-[10px] font-bold">1</span>
                    {settings.language === 'my' ? 'ဒေတာသိမ်းဆည်းရန်' : 'Export Backup File'}
                  </h4>
                  <p className="text-[10px] text-[#8e8e93] leading-relaxed">
                    {settings.language === 'my'
                      ? 'လက်ရှိ စာရင်းဇယားများ၊ ဘတ်ဂျက်များ၊ အမျိုးအစားများနှင့် Profile အချက်အလက်အားလုံးကို backup ဖိုင်အဖြစ် ဒေါင်းလုဒ်လုပ်ပါ။'
                      : 'Download your entire ledger state including transactions, budgets, custom categories, and profile details as a secure JSON backup file.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadBackupFile}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#007aff] hover:bg-[#0071eb] text-white rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-xs border-0 mt-3"
                >
                  <FileDown className="w-4 h-4" />
                  {settings.language === 'my' ? 'ဒေတာသိမ်းဆည်းမည် (Download)' : 'Create & Download Backup'}
                </button>
              </div>

              {/* Import/Restore Column */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <h4 className="text-xs font-black text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#34c759]/10 text-[#34c759] flex items-center justify-center text-[10px] font-bold">2</span>
                    {settings.language === 'my' ? 'ဒေတာပြန်ယူရန်' : 'Restore Backup File'}
                  </h4>
                  <p className="text-[10px] text-[#8e8e93] leading-relaxed">
                    {settings.language === 'my'
                      ? 'ယခင်က ဒေါင်းလုဒ်လုပ်သိမ်းဆည်းထားသော JSON backup ဖိုင်ကို ရွေးချယ်၍ သင့်စာရင်းများကို ချက်ချင်း ပြန်လည်သွင်းယူပါ။'
                      : 'Restore your entire ledger state instantly by uploading or dropping your saved JSON backup file below.'}
                  </p>
                </div>

                <div className="pt-1">
                  <input
                    type="file"
                    id="direct-backup-file-input"
                    accept=".json"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="direct-backup-file-input"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                      isDragging 
                        ? 'border-[#34c759] bg-[#34c759]/5' 
                        : 'border-black/[0.08] dark:border-white/[0.08] hover:border-[#007aff]/40 hover:bg-black/[0.01] dark:hover:bg-white/[0.01]'
                    }`}
                  >
                    <UploadCloud className={`w-7 h-7 mb-1.5 transition-colors ${isDragging ? 'text-[#34c759]' : 'text-[#8e8e93]'}`} />
                    <p className="text-[10px] font-bold text-[#1c1c1e] dark:text-[#f2f2f7]">
                      {settings.language === 'my' ? 'ဖိုင်ရွေးရန်နှိပ်ပါ သို့မဟုတ် ဖိုင်ဆွဲထည့်ပါ' : 'Click to select or drag & drop file'}
                    </p>
                    <p className="text-[8px] text-[#8e8e93] mt-0.5">
                      money_manager_backup_*.json
                    </p>
                  </label>
                </div>
              </div>
            </div>

            {importError && (
              <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-[#ff3b30]/10 text-[#ff3b30] text-[10px] font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{importError}</span>
              </div>
            )}
          </div>

          {/* Data Management */}
          <div className="p-5 ios-glass rounded-[2rem] space-y-4">
            <h3 className="text-sm font-bold text-[#1c1c1e] dark:text-[#f2f2f7] flex items-center gap-2">
              <Database className="w-4 h-4 text-[#5856d6]" />
              {t('demoDataSection')}
            </h3>
            <p className="text-xs text-[#8e8e93] leading-relaxed">
              {t('demoDataDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                id="load-demo-data-btn"
                onClick={onLoadDemoData}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-[#5856d6]/10 hover:bg-[#5856d6]/20 text-[#5856d6] rounded-2xl text-xs font-bold transition-all cursor-pointer border-0"
              >
                <RefreshCw className="w-4 h-4" />
                {t('loadDemoData')}
              </button>
              <button
                id="clear-all-data-btn"
                onClick={onClearAllData}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-[#ff3b30]/10 hover:bg-[#ff3b30]/20 text-[#ff3b30] rounded-2xl text-xs font-bold transition-all cursor-pointer border-0"
              >
                <Trash2 className="w-4 h-4" />
                {t('clearAllData')}
              </button>
              {onResetSettings && (
                <button
                  id="reset-app-settings-btn"
                  onClick={onResetSettings}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-[#ff9500]/10 hover:bg-[#ff9500]/20 text-[#ff9500] rounded-2xl text-xs font-bold transition-all cursor-pointer border-0"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  {t('resetAppSettings')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Local Database Console & Engine Diagnostics */}
        <div className="space-y-6">
          <div className="p-6 ios-glass rounded-[2rem] space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.04] dark:border-white/[0.04]">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#007aff]" />
                <div>
                  <h3 className="text-sm font-extrabold text-[#1c1c1e] dark:text-[#f2f2f7]">
                    {settings.language === 'my' ? 'စက်တွင်း ဒေတာဘေ့စ် ကွန်ဆိုးလ်' : 'Local Database Console'}
                  </h3>
                  <p className="text-[10px] text-[#8e8e93] mt-0.5 font-medium">
                    {settings.language === 'my'
                      ? 'လိုင်းမဲ့သုံး အော့ဖ်လိုင်း ဒေတာဘေ့စ်အင်ဂျင်ကို တိုက်ရိုက် ကြည့်ရှုစစ်ဆေးပါ'
                      : 'Seamless offline engine monitoring & direct JSON key access'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-[#34c759]/10 text-[#34c759] font-extrabold text-[9px] px-2.5 py-1 rounded-full shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34c759] animate-pulse" />
                {settings.language === 'my' ? 'အဆင်သင့်' : 'LIVE / ACTIVE'}
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] text-xs">
              <span className="text-[#8e8e93] font-medium">
                {settings.language === 'my' ? 'စုစုပေါင်း သိုလှောင်မှုပမာဏ' : 'Total DB Payload Size'}
              </span>
              <span className="font-black text-[#1c1c1e] dark:text-white font-mono bg-black/5 dark:bg-white/5 px-2.5 py-0.5 rounded-md">
                {calculateTotalStorageSize()}
              </span>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  key: 'mm_transactions',
                  name: settings.language === 'my' ? 'မှတ်တမ်းများ (Transactions)' : 'Transactions',
                  icon: Coins,
                  count: transactions.length,
                  data: transactions
                },
                {
                  key: 'mm_budgets',
                  name: settings.language === 'my' ? 'ဘတ်ဂျက်များ (Budgets)' : 'Budgets',
                  icon: FolderKanban,
                  count: budgets.length,
                  data: budgets
                },
                {
                  key: 'mm_income_categories',
                  name: settings.language === 'my' ? 'ဝင်ငွေ အမျိုးအစားများ' : 'Income Categories',
                  icon: Tag,
                  count: incomeCategories.length,
                  data: incomeCategories
                },
                {
                  key: 'mm_expense_categories',
                  name: settings.language === 'my' ? 'ထွက်ငွေ အမျိုးအစားများ' : 'Expense Categories',
                  icon: Tag,
                  count: expenseCategories.length,
                  data: expenseCategories
                },
                {
                  key: 'mm_profile',
                  name: settings.language === 'my' ? 'ပရိုဖိုင် (Profile)' : 'Profile Info',
                  icon: Mail,
                  count: 1,
                  data: profile
                },
                {
                  key: 'mm_settings',
                  name: settings.language === 'my' ? 'ဆက်တင်များ (Settings)' : 'Global Settings',
                  icon: SlidersHorizontal,
                  count: Object.keys(settings).length,
                  data: settings
                },
                {
                  key: 'read_alert_ids',
                  name: settings.language === 'my' ? 'ဖတ်ပြီးသော အသိပေးချက်များ' : 'Read Alert IDs',
                  icon: ShieldCheck,
                  count: readAlertIds.length,
                  data: readAlertIds
                }
              ].map((table) => {
                const TableIcon = table.icon;
                const isExpanded = expandedKey === table.key;
                const isEditing = isEditingKey === table.key;
                const sizeStr = getKeySizeStr(table.key);

                return (
                  <div 
                    key={table.key}
                    className="border border-black/[0.04] dark:border-white/[0.04] rounded-2xl overflow-hidden bg-black/[0.01] dark:bg-white/[0.01] transition-all hover:border-black/[0.08] dark:hover:border-white/[0.08]"
                  >
                    <div className="flex items-center justify-between p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] text-[#1c1c1e] dark:text-[#f2f2f7]">
                          <TableIcon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#1c1c1e] dark:text-[#f2f2f7]">
                            {table.name}
                          </h4>
                          <p className="text-[9px] text-[#8e8e93] font-mono mt-0.5">
                            Key: {table.key} • {table.count} {settings.language === 'my' ? 'ခု' : 'records'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-[#8e8e93] font-mono bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded">
                          {sizeStr}
                        </span>
                        <button
                          onClick={() => {
                            if (isExpanded) {
                              setExpandedKey(null);
                              setIsEditingKey(null);
                            } else {
                              setExpandedKey(table.key);
                              setIsEditingKey(null);
                            }
                          }}
                          className="px-2.5 py-1 text-[10px] font-extrabold text-[#007aff] hover:bg-[#007aff]/10 rounded-lg transition-all cursor-pointer border-0 bg-transparent"
                        >
                          {isExpanded ? (settings.language === 'my' ? 'ပိတ်ရန်' : 'Close') : (settings.language === 'my' ? 'စစ်ဆေးရန်' : 'Inspect')}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-3.5 border-t border-black/[0.04] dark:border-white/[0.04] bg-black/[0.02] dark:bg-white/[0.02] space-y-3">
                        {!isEditing ? (
                          <>
                            <div className="relative">
                              <pre className="bg-black/90 dark:bg-black/95 p-4 rounded-xl text-[10px] font-mono text-[#34c759] overflow-x-auto max-h-[180px] leading-relaxed border border-black/10 select-all scrollbar-thin">
                                {JSON.stringify(table.data, null, 2)}
                              </pre>
                            </div>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleCopyKeyData(table.key, table.data)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.08] dark:hover:bg-white/[0.08] text-[#1c1c1e] dark:text-white rounded-lg text-[10px] font-bold border-0 cursor-pointer transition-all"
                              >
                                {copySuccessKey === table.key ? (
                                  <>
                                    <Check className="w-3 h-3 text-[#34c759]" />
                                    <span>{settings.language === 'my' ? 'ကော်ပီကူးပြီး' : 'Copied!'}</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3 text-[#8e8e93]" />
                                    <span>{settings.language === 'my' ? 'ကော်ပီကူးရန်' : 'Copy JSON'}</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleStartEdit(table.key, table.data)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#007aff]/10 hover:bg-[#007aff]/20 text-[#007aff] rounded-lg text-[10px] font-bold border-0 cursor-pointer transition-all"
                              >
                                <SlidersHorizontal className="w-3 h-3" />
                                {settings.language === 'my' ? 'တိုက်ရိုက်ပြင်မည်' : 'Direct Edit'}
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="space-y-2.5">
                            <textarea
                              value={editJsonString}
                              onChange={(e) => setEditJsonString(e.target.value)}
                              className="w-full h-[180px] p-3 rounded-xl bg-black/90 dark:bg-black/95 text-[10px] font-mono text-[#34c759] leading-relaxed border-0 focus:ring-1 focus:ring-[#007aff] outline-none resize-y scrollbar-thin"
                              spellCheck={false}
                            />
                            {editError && (
                              <p className="text-[10px] text-[#ff3b30] font-bold flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {editError}
                              </p>
                            )}
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setIsEditingKey(null)}
                                className="px-3 py-1.5 bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.08] dark:hover:bg-white/[0.08] text-[#8e8e93] rounded-lg text-[10px] font-bold border-0 cursor-pointer transition-all"
                              >
                                {settings.language === 'my' ? 'မလုပ်တော့ပါ' : 'Cancel'}
                              </button>
                              <button
                                onClick={() => handleSaveEdit(table.key)}
                                className="flex items-center gap-1 px-3.5 py-1.5 bg-[#007aff] hover:bg-[#0071eb] text-white rounded-lg text-[10px] font-bold border-0 cursor-pointer transition-all shadow-xs"
                              >
                                <Save className="w-3 h-3" />
                                {settings.language === 'my' ? 'ဒေတာသိမ်းမည်' : 'Save Changes'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
