export const getCategoryStyle = (categoryName: string) => {
  const norm = categoryName.trim().toLowerCase();
  switch (norm) {
    case 'food':
    case 'စားသောက်စရိတ်':
      return {
        bg: 'bg-amber-500/10 dark:bg-amber-500/20',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-500/10 dark:border-amber-500/20'
      };
    case 'transportation':
    case 'သယ်ယူပို့ဆောင်ရေး':
      return {
        bg: 'bg-blue-500/10 dark:bg-blue-500/20',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-500/10 dark:border-blue-500/20'
      };
    case 'shopping':
    case 'ဈေးဝယ်ခြင်း':
      return {
        bg: 'bg-pink-500/10 dark:bg-pink-500/20',
        text: 'text-pink-600 dark:text-pink-400',
        border: 'border-pink-500/10 dark:border-pink-500/20'
      };
    case 'entertainment':
    case 'ဖျော်ဖြေရေး':
      return {
        bg: 'bg-purple-500/10 dark:bg-purple-500/20',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-500/10 dark:border-purple-500/20'
      };
    case 'housing':
    case 'အိမ်လခ/အိမ်စရိတ်':
      return {
        bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
        text: 'text-indigo-600 dark:text-indigo-400',
        border: 'border-indigo-500/10 dark:border-indigo-500/20'
      };
    case 'utilities':
    case 'မီတာ/ရေဖိုး/ဖုန်းဘေလ်':
      return {
        bg: 'bg-teal-500/10 dark:bg-teal-500/20',
        text: 'text-teal-600 dark:text-teal-400',
        border: 'border-teal-500/10 dark:border-teal-500/20'
      };
    case 'healthcare':
    case 'ကျန်းမာရေး':
      return {
        bg: 'bg-red-500/10 dark:bg-red-500/20',
        text: 'text-red-600 dark:text-red-400',
        border: 'border-red-500/10 dark:border-red-500/20'
      };
    case 'education':
    case 'ပညာရေး':
      return {
        bg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
        text: 'text-cyan-600 dark:text-cyan-400',
        border: 'border-cyan-500/10 dark:border-cyan-500/20'
      };
    case 'salary':
    case 'လစာဝင်ငွေ':
      return {
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-500/10 dark:border-emerald-500/20'
      };
    case 'freelance':
    case 'အလွတ်တန်းဝင်ငွေ':
      return {
        bg: 'bg-violet-500/10 dark:bg-violet-500/20',
        text: 'text-violet-600 dark:text-violet-400',
        border: 'border-violet-500/10 dark:border-violet-500/20'
      };
    case 'investment':
    case 'ရင်းနှီးမြှုပ်နှံမှု':
      return {
        bg: 'bg-sky-500/10 dark:bg-sky-500/20',
        text: 'text-sky-600 dark:text-sky-400',
        border: 'border-sky-500/10 dark:border-sky-500/20'
      };
    case 'gift':
    case 'လက်ဆောင်':
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
