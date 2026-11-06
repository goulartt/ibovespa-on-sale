import { STRATEGIES, strategyFromHash } from './strategies';
import { FIELDS } from './fields';

test('reads the strategy from the URL hash, defaulting to dividends', () => {
  expect(strategyFromHash('#qualidade')).toBe('qualidade');
  expect(strategyFromHash('')).toBe('dividendos');
  expect(strategyFromHash('#unknown')).toBe('dividendos');
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
