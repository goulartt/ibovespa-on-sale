import { PAGE_SIZE_OPTIONS, paginate, searchRows, sortRows, toCsv } from './tableData';

const rows = [
  { Ativo: 'PETR4', Empresa: 'PETRÓLEO BRASILEIRO S.A.', Ranking: 2, 'EV/EBIT': 5, 'Lucros Anuais': [{ ano: 2025, lucro: 1e9 }] },
  { Ativo: 'VALE3', Empresa: 'VALE S.A.', Ranking: 1, 'EV/EBIT': null },
  { Ativo: 'WEGE3', Empresa: 'WEG S.A.', Ranking: 3, 'EV/EBIT': 25.5 },
];

test('offers 100 and 150 rows per page', () => {
  expect(PAGE_SIZE_OPTIONS).toEqual([10, 25, 50, 100, 150]);
});

describe('searchRows', () => {
  test('matches ticker or company, ignoring case and accents', () => {
    expect(searchRows(rows, ['petroleo']).map(r => r.Ativo)).toEqual(['PETR4']);
    expect(searchRows(rows, ['wege']).map(r => r.Ativo)).toEqual(['WEGE3']);
    expect(searchRows(rows, ['s.a.', 'vale']).map(r => r.Ativo)).toEqual(['VALE3']);
    expect(searchRows(rows, [])).toBe(rows);
  });
});

describe('sortRows', () => {
  test('sorts numbers both ways with missing values last', () => {
    expect(sortRows(rows, [{ field: 'EV/EBIT', sort: 'asc' }]).map(r => r.Ativo)).toEqual(['PETR4', 'WEGE3', 'VALE3']);
    expect(sortRows(rows, [{ field: 'EV/EBIT', sort: 'desc' }]).map(r => r.Ativo)).toEqual(['WEGE3', 'PETR4', 'VALE3']);
  });

  test('sorts text and keeps the input untouched', () => {
    expect(sortRows(rows, [{ field: 'Ativo', sort: 'desc' }]).map(r => r.Ativo)).toEqual(['WEGE3', 'VALE3', 'PETR4']);
    expect(rows[0].Ativo).toBe('PETR4');
    expect(sortRows(rows, [])).toBe(rows);
  });
});

describe('paginate', () => {
  const many = Array.from({ length: 160 }, (_, i) => ({ Ativo: `T${i}` }));

  test('returns the requested page, including 150-row pages', () => {
    expect(paginate(many, 0, 150).rows).toHaveLength(150);
    expect(paginate(many, 1, 150).rows).toHaveLength(10);
  });

  test('clamps out-of-range pages (e.g. after a search shrinks the list)', () => {
    expect(paginate(many.slice(0, 5), 3, 10)).toEqual({ page: 0, rows: many.slice(0, 5) });
  });
});

test('toCsv writes Excel-friendly pt-BR CSV', () => {
  const fields = [
    { field: 'Ranking', label: '#', format: 'rank' },
    { field: 'Empresa', label: 'Empresa', format: 'text' },
    { field: 'EV/EBIT', label: 'EV/EBIT', format: 'multiple' },
    { field: 'Lucros Anuais', label: 'Lucro 5 anos', format: 'sparkline' },
  ];
  const csv = toCsv(rows.slice(0, 2), fields);
  expect(csv.charCodeAt(0)).toBe(0xfeff); // BOM so Excel reads UTF-8
  expect(csv.slice(1).trimEnd().split('\r\n')).toEqual([
    'Ranking;Empresa;EV/EBIT;Lucro 5 anos',
    '2;PETRÓLEO BRASILEIRO S.A.;5;2025: R$ 1,00 bi',
    '1;VALE S.A.;;',
  ]);
});
