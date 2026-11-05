import { filterBySector, sectorCounts } from './SectorFilter';

const stocks = [{ Setor: 'Consumo' }, { Setor: 'Financeiro' }, { Setor: 'Consumo' }, { Setor: null }];

test('counts sectors, most represented first, missing ones as "Outros"', () => {
  expect(sectorCounts(stocks)).toEqual([['Consumo', 2], ['Financeiro', 1], ['Outros', 1]]);
});

test('filters by sector, or returns everything without one', () => {
  expect(filterBySector(stocks, 'Consumo')).toHaveLength(2);
  expect(filterBySector(stocks, 'Outros')).toHaveLength(1);
  expect(filterBySector(stocks, null)).toBe(stocks);
});
