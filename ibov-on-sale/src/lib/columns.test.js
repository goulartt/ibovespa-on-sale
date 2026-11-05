import { buildColumns, compareNullsLast, initialColumnVisibility } from './columns';
import { FIELDS, withDerivedFields } from './fields';

// Every field currently returned by GET /api/ibovespa/filtered.
const API_FIELDS = [
  'Ranking', 'Ativo', 'Empresa', 'Cotação', 'P/L', 'P/VP', 'PSR', 'Dividend Yield', 'P/EBIT', 'EV/EBIT',
  'Margem Ebit', 'Margem Líquida', 'ROE', 'Dívida Líquida/Patrimônio', 'Dívida Líquida/EBIT',
  'Liquidez Média Diária', 'Data Balanço', 'MA5', 'MA10', 'MA20', 'MMA50', 'MA100', 'MA200',
];

describe('field metadata', () => {
  test('covers every field returned by the API', () => {
    const known = new Set(FIELDS.map(f => f.field));
    expect(API_FIELDS.filter(f => !known.has(f))).toEqual([]);
  });

  test('every column has a label and an explanation for the tooltip', () => {
    for (const f of FIELDS) {
      expect(f.label).toBeTruthy();
      expect(f.description.length).toBeGreaterThan(20);
    }
  });

  test('field names are unique', () => {
    expect(new Set(FIELDS.map(f => f.field)).size).toBe(FIELDS.length);
  });
});

describe('buildColumns', () => {
  const columns = Object.fromEntries(buildColumns().map(c => [c.field, c]));
  const fmt = (field, value) => columns[field].valueFormatter({ value });

  test('formats each kind of value', () => {
    expect(fmt('Dividend Yield', 8.123)).toBe('8,12%');
    expect(fmt('EV/EBIT', 3)).toBe('3,00x');
    expect(fmt('Liquidez Média Diária', 2.5e9)).toBe('R$ 2,50 bi');
    expect(fmt('Data Balanço', '2026-06-30')).toBe('30/06/2026');
    expect(fmt('P/L', null)).toBe('—');
  });

  test('numeric columns are right aligned and use friendly headers', () => {
    expect(columns['Cotação'].align).toBe('right');
    expect(columns.Ativo.align).toBe('left');
    expect(columns['Liquidez Média Diária'].headerName).toBe('Liquidez Diária');
    expect(columns.MA200.headerName).toBe('MM200');
  });

  test('missing values sort last', () => {
    expect([3, null, 1, undefined, 2].sort(compareNullsLast)).toEqual([1, 2, 3, null, undefined]);
  });
});

test('secondary columns start hidden', () => {
  const visibility = initialColumnVisibility();
  expect(visibility).toMatchObject({ Empresa: false, MA5: false, PSR: false });
  expect(visibility['Dividend Yield']).toBeUndefined();
});

test('trend is the distance between price and the 200-day average', () => {
  expect(withDerivedFields({ 'Cotação': 11, MA200: 10 })['Tendência']).toBeCloseTo(10);
  expect(withDerivedFields({ 'Cotação': 9, MA200: 10 })['Tendência']).toBeCloseTo(-10);
  expect(withDerivedFields({ 'Cotação': 9, MA200: null })['Tendência']).toBeNull();
});
