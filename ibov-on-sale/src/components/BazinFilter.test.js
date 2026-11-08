import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BazinFilter, { filterByBazin, isBelowBazin } from './BazinFilter';

const STOCKS = [
  { Ativo: 'AAAA3', 'Cotação': 8, 'Preço Teto Bazin': 10 },
  { Ativo: 'BBBB3', 'Cotação': 12, 'Preço Teto Bazin': 10 },
  { Ativo: 'CCCC3', 'Cotação': 5, 'Preço Teto Bazin': null },
];

test('keeps only the stocks at or below the Bazin price ceiling', () => {
  expect(isBelowBazin({ 'Cotação': 10, 'Preço Teto Bazin': 10 })).toBe(true);
  expect(filterByBazin(STOCKS, true).map(s => s.Ativo)).toEqual(['AAAA3']);
  expect(filterByBazin(STOCKS, false)).toHaveLength(3);
});

test('the switch shows how many pass and toggles the filter', () => {
  const onChange = jest.fn();
  render(<BazinFilter stocks={STOCKS} value={false} onChange={onChange} />);
  expect(screen.getByText('(1 de 3)')).toBeInTheDocument();
  userEvent.click(screen.getByRole('checkbox', { name: /Só abaixo do preço teto de Bazin/ }));
  expect(onChange).toHaveBeenCalledWith(true);
});
