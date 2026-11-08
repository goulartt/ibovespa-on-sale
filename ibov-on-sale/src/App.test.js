import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { fetchBacktest, fetchRanking } from './lib/api';
import { BACKTEST } from './fixtures/backtest';

jest.mock('./lib/api', () => ({
  ...jest.requireActual('./lib/api'),
  fetchRanking: jest.fn(),
  fetchBacktest: jest.fn(),
}));

const STOCKS = [
  { Ranking: 1, Ativo: 'AAAA3', Empresa: 'EMPRESA A S.A.', Setor: 'Consumo', 'Cotação': 10, 'Dividend Yield': 12, 'EV/EBIT': 2, 'EBIT/EV': 50, MA200: 8 },
  { Ranking: 2, Ativo: 'BBBB4', Empresa: 'EMPRESA B S.A.', Setor: 'Financeiro', 'Cotação': 20, 'Dividend Yield': 8, 'EV/EBIT': 4, 'EBIT/EV': 25, MA200: 25 },
  { Ranking: 3, Ativo: 'CCCC3', Empresa: 'EMPRESA C S.A.', Setor: 'Financeiro', 'Cotação': 5, 'Dividend Yield': 10, 'EV/EBIT': 6, 'EBIT/EV': 15, MA200: 5 },
];

afterEach(() => {
  jest.clearAllMocks();
  window.history.replaceState(null, '', '/');
});

test('shows the summary and the ranking', async () => {
  fetchRanking.mockResolvedValue({ stocks: STOCKS, updatedAt: '2026-11-05T22:26:45.480Z' });
  render(<App />);

  expect(await screen.findByRole('article', { name: '1º lugar: AAAA3' })).toBeInTheDocument();
  expect(screen.getByRole('article', { name: '2º lugar: BBBB4' })).toBeInTheDocument();
  expect(screen.getByText('Empresa A')).toBeInTheDocument(); // readable company name on the tag
  expect(screen.getByText('Ibovespa em Promoção')).toBeInTheDocument();
  expect(await screen.findByText(/Atualizado em 05\/11\/2026/)).toBeInTheDocument();
  expect(screen.getAllByText('30,00%').length).toBeGreaterThan(0); // average EBIT/EV in the summary (Deep Value)
  expect(screen.getAllByText('4,00x').length).toBeGreaterThan(0); // median EV/EBIT
});

test('switching to the magic formula fetches the ranking again', async () => {
  fetchRanking.mockResolvedValue({ stocks: STOCKS, updatedAt: null });
  render(<App />);
  await screen.findByRole('article', { name: '1º lugar: AAAA3' });

  userEvent.click(screen.getByRole('button', { name: /Fórmula Mágica/ }));
  await waitFor(() => expect(fetchRanking).toHaveBeenLastCalledWith(expect.objectContaining({ sort: 'magicFormula' })));
});

test('switches to the quality strategy and remembers it in the URL', async () => {
  fetchRanking.mockResolvedValue({ stocks: STOCKS.map(s => ({ ...s, 'P/L': 7, ROCE: 22, 'Dívida Líquida/EBITDA': 0.4 })), updatedAt: null });
  render(<App />);
  await screen.findByRole('article', { name: '1º lugar: AAAA3' });
  expect(fetchRanking).toHaveBeenLastCalledWith(expect.objectContaining({ strategy: 'deepValue' }));
  expect(screen.getByRole('tab', { name: 'Deep Value' })).toHaveAttribute('aria-selected', 'true');

  userEvent.click(screen.getByRole('tab', { name: 'Qualidade a bom preço' }));
  await waitFor(() => expect(fetchRanking).toHaveBeenLastCalledWith(expect.objectContaining({ strategy: 'qualidade' })));
  expect(window.location.hash).toBe('#qualidade');
  expect(await screen.findByText(/^Empresas muito rentáveis/)).toBeInTheDocument(); // strategy subtitle
  expect((await screen.findAllByText('ROCE de')).length).toBeGreaterThan(0); // price tags
  expect(screen.getByText(/ROCE médio/)).toBeInTheDocument();
});

test('opens the strategy from the URL hash', async () => {
  window.history.replaceState(null, '', '/#qualidade');
  fetchRanking.mockResolvedValue({ stocks: STOCKS, updatedAt: null });
  render(<App />);
  await waitFor(() => expect(fetchRanking).toHaveBeenCalledWith(expect.objectContaining({ strategy: 'qualidade' })));
  expect(screen.getByRole('tab', { name: 'Qualidade a bom preço' })).toHaveAttribute('aria-selected', 'true');
});

test('filters the ranking by sector', async () => {
  fetchRanking.mockResolvedValue({ stocks: STOCKS, updatedAt: null });
  render(<App />);
  await screen.findByRole('article', { name: '1º lugar: AAAA3' });

  expect(screen.getByRole('button', { name: 'Todos (3)' })).toHaveAttribute('aria-pressed', 'true');
  userEvent.click(screen.getByRole('button', { name: 'Financeiro (2)' }));

  expect(screen.getByRole('article', { name: '1º em Financeiro: BBBB4' })).toBeInTheDocument();
  expect(screen.getByRole('article', { name: '2º em Financeiro: CCCC3' })).toBeInTheDocument();
  expect(screen.queryByRole('article', { name: /AAAA3/ })).not.toBeInTheDocument();
  expect(screen.getByText(/de Financeiro passaram em todos os filtros/)).toBeInTheDocument();

  userEvent.click(screen.getByRole('button', { name: 'Todos (3)' }));
  expect(screen.getByRole('article', { name: '1º lugar: AAAA3' })).toBeInTheDocument();
});

test('explains when no stock passes the filters', async () => {
  fetchRanking.mockResolvedValue({ stocks: [], updatedAt: null });
  render(<App />);
  expect(await screen.findByText(/Nenhuma ação passou em todos os filtros/)).toBeInTheDocument();
});

test('shows an error with a retry button', async () => {
  fetchRanking
    .mockRejectedValueOnce(new Error('A API está indisponível no momento.'))
    .mockResolvedValueOnce({ stocks: STOCKS, updatedAt: null });
  render(<App />);

  expect(await screen.findByText('A API está indisponível no momento.')).toBeInTheDocument();
  userEvent.click(screen.getByRole('button', { name: /tentar novamente/i }));
  await waitFor(() => expect(fetchRanking).toHaveBeenCalledTimes(2));
  expect(await screen.findByRole('article', { name: '1º lugar: AAAA3' })).toBeInTheDocument();
  expect(screen.queryByText('A API está indisponível no momento.')).not.toBeInTheDocument();
});

test('opens the backtest tab', async () => {
  fetchRanking.mockResolvedValue({ stocks: STOCKS, updatedAt: null });
  fetchBacktest.mockResolvedValue(BACKTEST);
  render(<App />);
  await screen.findByRole('article', { name: '1º lugar: AAAA3' });

  userEvent.click(screen.getByRole('tab', { name: 'Backtest' }));
  expect(await screen.findByRole('article', { name: 'Dividendos sustentáveis' })).toBeInTheDocument();
  expect(window.location.hash).toBe('#backtest');
});
