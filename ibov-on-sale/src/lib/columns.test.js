import React from 'react';
import { render, screen } from '@testing-library/react';
import { buildColumns, compareNullsLast, initialColumnVisibility, withLabels } from './columns';
import { FIELDS, withDerivedFields } from './fields';

// Every field currently returned by GET /api/ibovespa/filtered.
const API_FIELDS = [
  'Ranking', 'Ativo', 'Empresa', 'Setor', 'Cotação', 'P/L', 'P/VP', 'PSR', 'Dividend Yield', 'P/EBIT', 'EV/EBIT',
  'Margem Ebit', 'Margem Líquida', 'ROE', 'Dívida Líquida/Patrimônio', 'Dívida Líquida/EBIT',
  'Liquidez Média Diária', 'Data Balanço', 'Situação', 'DY Médio 5 Anos', 'Payout', 'Anos com Dividendos',
  'ROIC', 'Lucros Anuais', 'Anos com Lucro', 'ROCE', 'Dívida Líquida/EBITDA', 'EBIT/EV', 'Instituição Financeira', 'Preço Teto Bazin', 'Desconto Bazin', 'Valor Intrínseco', 'Preço Teto', 'Margem de Segurança', 'Variação do Lucro', 'Desconto', 'ROE Médio', 'Payout Médio', 'Crescimento Esperado', 'Lucro Líquido', 'MA5', 'MA10', 'MA20', 'MMA50', 'MA100', 'MA200',
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
    expect(fmt('Anos com Dividendos', 4)).toBe('4 de 5');
    expect(fmt('Instituição Financeira', true)).toBe('Sim');
    expect(fmt('Instituição Financeira', false)).toBe('Não');
    expect(fmt('Lucros Anuais', [{ ano: 2024, lucro: 2.5e9 }, { ano: 2025, lucro: -1e6 }])).toBe('2024: R$ 2,50 bi; 2025: R$ -1,00 mi');
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
  expect(visibility).toMatchObject({ Empresa: false, MA5: false, PSR: false, 'Situação': false });
  expect(visibility['Dividend Yield']).toBeUndefined();
});

test('strategies can hide extra columns', () => {
  expect(initialColumnVisibility(undefined, ['ROCE'])).toMatchObject({ ROCE: false, Empresa: false });
});

test('trend is the distance between price and the 200-day average', () => {
  expect(withDerivedFields({ 'Cotação': 11, MA200: 10 })['Tendência']).toBeCloseTo(10);
  expect(withDerivedFields({ 'Cotação': 9, MA200: 10 })['Tendência']).toBeCloseTo(-10);
  expect(withDerivedFields({ 'Cotação': 9, MA200: null })['Tendência']).toBeNull();
});

test('a strategy can show only its own columns, with its own names', () => {
  const visibility = initialColumnVisibility(FIELDS, [], ['Ranking', 'Ativo', 'Cotação', 'Valor Intrínseco', 'Desconto']);
  expect(visibility['Valor Intrínseco']).toBeUndefined();
  expect(visibility.Desconto).toBeUndefined();
  expect(visibility['Cotação']).toBeUndefined();
  expect(visibility['P/L']).toBe(false);
  expect(visibility.Setor).toBe(false);
  const columns = buildColumns(withLabels(FIELDS, { 'Cotação': 'Valor atual' }));
  expect(columns.find(c => c.field === 'Cotação').headerName).toBe('Valor atual');
});

test('the buy price is highlighted when the stock trades below it', () => {
  const column = buildColumns().find(c => c.field === 'Preço Teto');
  const cell = (price, ceiling) => column.renderCell({ value: ceiling, formattedValue: `R$ ${ceiling}`, row: { 'Cotação': price } });
  render(<div>{cell(10, 12)}</div>);
  expect(screen.getByTitle('Cotação abaixo do preço teto')).toHaveTextContent('R$ 12');
  expect(cell(15, 12)).toBe('R$ 12');
});

test('a strategy can show columns hidden by default', () => {
  const visibility = initialColumnVisibility(FIELDS, ['ROCE'], null, ['Preço Teto Bazin']);
  expect(visibility['Preço Teto Bazin']).toBeUndefined();
  expect(visibility['Desconto Bazin']).toBe(false);
  expect(visibility.ROCE).toBe(false);
});
