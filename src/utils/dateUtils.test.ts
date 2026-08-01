import { describe, it, expect } from 'vitest';
import { getLocalDateStr, getLocalMonthStr, getLocalYearStr, getLocalMonthYearKey } from './dateUtils';

describe('dateUtils', () => {
  it('correctly extracts local month, year, and date strings regardless of UTC offset', () => {
    const testDate = new Date(2026, 7, 1); // August 1, 2026 local time
    expect(getLocalMonthStr(testDate)).toBe('08');
    expect(getLocalYearStr(testDate)).toBe('2026');
    expect(getLocalDateStr(testDate)).toBe('2026-08-01');
    expect(getLocalMonthYearKey(testDate)).toBe('2026-08');
  });

  it('correctly handles month padded strings for single digit months', () => {
    const janDate = new Date(2026, 0, 15); // January 15, 2026 local time
    expect(getLocalMonthStr(janDate)).toBe('01');
    expect(getLocalDateStr(janDate)).toBe('2026-01-15');
  });
});
