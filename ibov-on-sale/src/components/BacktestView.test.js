import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BacktestView from './BacktestView';
import EquityChart from './EquityChart';
import { fetchBacktest } from '../lib/api';
import { chartSeries, signedPercent, yearlyRows } from '../lib/backtest';
import { BACKTEST } from '../fixtures/backtest';
import { simulationRows } from './MoneySimulation';

jest.mock('../lib/api', () => ({ ...jest.requireActual('../lib/api'), fetchBacktest: jest.fn() }));

afterEach(() => jest.clearAllMocks());

test('shows one card per strategy compared with the CDI', async () => {
  fetchBacktest.mockResolvedValue(BACKTEST);
  render(<BacktestView />);
  const card = await screen.findByRole('article', { name: 'Deep Value' });
  expect(within(card).getByText('+30,00%')).toBeInTheDocument();
  expect(within(card).getByText('150,00% do CDI')).toBeInTheDocument();
  expect(screen.getByRole('article', { name: 'Qualidade a bom preço' })).toHaveTextContent('-5,00%');
  expect(screen.getByRole('table', { name: 'Retorno por ano' })).toBeInTheDocument();
  expect(card).toHaveTextContent('Carteira20 ações');
  expect(screen.getByRole('article', { name: 'Dividendos sustentáveis' })).toHaveTextContent('Carteira10 ações');
  expect(screen.getByText(/as 20 primeiras do ranking \(10 em Dividendos sustentáveis\)/)).toBeInTheDocument();
});

test('switching the start year and the mode updates the numbers', async () => {
  fetchBacktest.mockResolvedValue(BACKTEST);
  render(<BacktestView />);
  await screen.findByRole('article', { name: 'Deep Value' });

  expect(screen.getByRole('article', { name: 'Deep Value' })).toHaveTextContent('Inícios acima do CDI10 de 12');

  expect(screen.queryByRole('button', { name: 'Regras anteriores' })).not.toBeInTheDocument();
  userEvent.click(screen.getByRole('button', { name: '2020 até hoje (validação)' }));
  expect(screen.getByRole('article', { name: 'Deep Value' })).toHaveTextContent('+60,00%');
  expect(screen.getByRole('article', { name: 'Deep Value' })).not.toHaveTextContent('Inícios acima do CDI');

  userEvent.click(screen.getByRole('button', { name: 'Comprar e segurar' }));
  expect(screen.getByRole('article', { name: 'Deep Value' })).toHaveTextContent('+24,00%');
});

test('shows an error with a retry button', async () => {
  fetchBacktest.mockRejectedValueOnce(new Error('fora do ar')).mockResolvedValue(BACKTEST);
  render(<BacktestView />);
  userEvent.click(await screen.findByRole('button', { name: /Tentar novamente/ }));
  expect(await screen.findByRole('article', { name: 'Deep Value' })).toBeInTheDocument();
});

test('the chart draws one line per strategy and benchmark', () => {
  render(<EquityChart series={chartSeries(BACKTEST.periodos[0], 'rotation')} />);
  for (const id of ['deepValue', 'dividendos', 'qualidade', 'cdi', 'ibov']) {
    expect(screen.getByTestId(`line-${id}`)).toBeInTheDocument();
  }
  expect(screen.getByRole('img', { name: /Deep Value \+30,00%/ })).toBeInTheDocument();
});

test('helpers', () => {
  expect(signedPercent(3.456)).toBe('+3,46%');
  expect(signedPercent(-1)).toBe('-1,00%');
  expect(signedPercent(null)).toBe('—');
  expect(yearlyRows(BACKTEST.periodos[0], 'rotation')[0]).toEqual({ year: '2024', deepValue: 25, dividendos: 35, qualidade: -10, cdi: 10, ibov: 5 });
});

test('long periods use a log scale', () => {
  const long = [{ id: 'a', label: 'A', color: '#000', points: [['2014-01-02', 1], ['2020-01-02', 3], ['2026-01-02', 12]] }];
  render(<EquityChart series={long} />);
  expect(screen.getByText(/Escala logarítmica/)).toBeInTheDocument();
  expect(screen.getByRole('img', { name: /Retorno acumulado/ })).toHaveAttribute('data-scale', 'log');
});

test('the R$ 100 thousand simulation shows values after taxes, next to a CDB and an Ibovespa ETF', async () => {
  fetchBacktest.mockResolvedValue(BACKTEST);
  render(<BacktestView />);
  const table = await screen.findByRole('table', { name: 'Simulação com R$ 100 mil' });
  expect(within(table).getByText('CDB 100% do CDI')).toBeInTheDocument();
  expect(within(table).getByText('ETF de Ibovespa')).toBeInTheDocument();
  const rows = simulationRows(BACKTEST.periodos[0], 'rotation');
  expect(rows.map(r => r.id)).toEqual(['deepValue', 'dividendos', 'qualidade', 'cdi', 'ibov']);
  expect(rows[0].liquido).toBeCloseTo(125000);
  expect(rows[3].impostosVendas).toBeNull();
  expect(rows[3].impostoResgate).toBe(3000);
});
