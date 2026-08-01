export function getLocalDateStr(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getLocalMonthStr(date: Date = new Date()): string {
  return String(date.getMonth() + 1).padStart(2, '0');
}

export function getLocalYearStr(date: Date = new Date()): string {
  return date.getFullYear().toString();
}

export function getLocalMonthYearKey(date: Date = new Date()): string {
  return `${getLocalYearStr(date)}-${getLocalMonthStr(date)}`;
}
