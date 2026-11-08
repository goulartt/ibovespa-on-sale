import { STRATEGIES, strategyFromHash, viewFromHash } from './strategies';
import { FIELDS } from './fields';

test('reads the strategy from the URL hash, defaulting to dividends', () => {
  expect(strategyFromHash('#qualidade')).toBe('qualidade');
  expect(strategyFromHash('#dividendos')).toBe('dividendos');
  expect(strategyFromHash('')).toBe('deepValue');
  expect(strategyFromHash('#unknown')).toBe('deepValue');
});

test('Deep Value is the first tab', () => {
  expect(Object.keys(STRATEGIES)).toEqual(['deepValue', 'dividendos', 'qualidade']);
});

test('every strategy refers to existing fields', () => {
  const known = new Set(FIELDS.map(f => f.field));
  for (const s of Object.values(STRATEGIES)) {
    expect(known.has(s.tag.priceField)).toBe(true);
    expect(s.hiddenColumns.filter(f => !known.has(f))).toEqual([]);
    expect(s.summary.map(([, field]) => field).filter(f => !known.has(f))).toEqual([]);
    expect(s.criteria.length).toBeGreaterThan(2);
  }
});

test('the backtest tab has its own hash', () => {
  expect(viewFromHash('#backtest')).toBe('backtest');
  expect(viewFromHash('#qualidade')).toBe('qualidade');
  expect(viewFromHash('')).toBe('deepValue');
});
