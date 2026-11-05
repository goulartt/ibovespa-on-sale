import {
  formatCompactCurrency, formatCurrency, formatDate, formatDateTime, formatMultiple, formatPercent,
} from './format';

// Intl uses a non-breaking space between "R$" and the number.
const normalize = s => s.replace(/ /g, ' ');

describe('formatters', () => {
  test('currency', () => {
    expect(normalize(formatCurrency(1234.5))).toBe('R$ 1.234,50');
    expect(normalize(formatCurrency(-3))).toBe('-R$ 3,00');
  });

  test('percent and multiple use two decimals', () => {
    expect(formatPercent(8.5)).toBe('8,50%');
    expect(formatPercent(-12.345)).toBe('-12,35%');
    expect(formatMultiple(5.1)).toBe('5,10x');
  });

  test('compact currency picks the right scale', () => {
    expect(formatCompactCurrency(2_564_000_000)).toBe('R$ 2,56 bi');
    expect(formatCompactCurrency(1_500_000)).toBe('R$ 1,50 mi');
    expect(formatCompactCurrency(12_000)).toBe('R$ 12,00 mil');
    expect(formatCompactCurrency(3e12)).toBe('R$ 3,00 tri');
    expect(normalize(formatCompactCurrency(999))).toBe('R$ 999,00');
  });

  test('dates', () => {
    expect(formatDate('2026-09-30')).toBe('30/09/2026');
    expect(formatDate('invalid')).toBe('—');
    expect(formatDateTime('2026-11-05T22:26:45.480Z')).toBe('05/11/2026, 19:26');
  });

  test.each([null, undefined, NaN, Infinity, 'abc'])('missing value %p renders as a dash', value => {
    for (const format of [formatCurrency, formatPercent, formatMultiple, formatCompactCurrency, formatDate, formatDateTime]) {
      expect(format(value)).toBe('—');
    }
  });
});
