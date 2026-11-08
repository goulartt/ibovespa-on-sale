import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BacktestView from './BacktestView';
import EquityChart from './EquityChart';
import { fetchBacktest } from '../lib/api';
import { chartSeries, signedPercent, yearlyRows } from '../lib/backtest';
import { BACKTEST } from '../fixtures/backtest';

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
});

test('switching the start year and the mode updates the numbers', async () => {
  fetchBacktest.mockResolvedValue(BACKTEST);
  render(<BacktestView />);
  await screen.findByRole('article', { name: 'Deep Value' });

  userEvent.click(screen.getByRole('button', { name: 'Desde 2025' }));
  expect(screen.getByRole('article', { name: 'Deep Value' })).toHaveTextContent('+60,00%');

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
  render(<EquityChart series={chartSeries(BACKTEST.inicios[0], 'rotation')} />);
  for (const id of ['deepValue', 'dividendos', 'qualidade', 'cdi', 'ibov']) {
    expect(screen.getByTestId(`line-${id}`)).toBeInTheDocument();
  }
  expect(screen.getByRole('img', { name: /Deep Value \+30,00%/ })).toBeInTheDocument();
});

test('helpers', () => {
  expect(signedPercent(3.456)).toBe('+3,46%');
  expect(signedPercent(-1)).toBe('-1,00%');
  expect(signedPercent(null)).toBe('—');
  expect(yearlyRows(BACKTEST.inicios[0], 'rotation')[0]).toEqual({ year: '2024', deepValue: 25, dividendos: 35, qualidade: -10, cdi: 10, ibov: 5 });
});
