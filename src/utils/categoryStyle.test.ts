import { describe, it, expect } from 'vitest';
import { getCategoryStyle } from './categoryStyle';

describe('categoryStyle utility', () => {
  it('returns custom colors when provided in categoryColors map', () => {
    const customColors = {
      'Food': '#ff5722',
      'Shopping': '#9c27b0'
    };

    const foodStyle = getCategoryStyle('Food', customColors);
    expect(foodStyle.hex).toBe('#ff5722');
    expect(foodStyle.style).toEqual({
      backgroundColor: '#ff57221a',
      color: '#ff5722',
      borderColor: '#ff572233'
    });

    const shopStyle = getCategoryStyle('Shopping', customColors);
    expect(shopStyle.hex).toBe('#9c27b0');
  });

  it('returns default fallback theme styles when category has no custom color', () => {
    const defaultStyle = getCategoryStyle('Food');
    expect(defaultStyle.bg).toContain('amber');
    expect(defaultStyle.text).toContain('amber');
  });

  it('handles empty or missing category safely', () => {
    const emptyStyle = getCategoryStyle('');
    expect(emptyStyle.bg).toContain('slate');
  });
});
