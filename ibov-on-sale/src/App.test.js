import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { fetchRanking } from './lib/api';

jest.mock('./lib/api', () => ({
  ...jest.requireActual('./lib/api'),
  fetchRanking: jest.fn(),
}));

const STOCKS = [
  { Ranking: 1, Ativo: 'AAAA3', Empresa: 'EMPRESA A S.A.', 'Cotação': 10, 'Dividend Yield': 12, 'EV/EBIT': 2, MA200: 8 },
  { Ranking: 2, Ativo: 'BBBB4', Empresa: 'EMPRESA B S.A.', 'Cotação': 20, 'Dividend Yield': 8, 'EV/EBIT': 4, MA200: 25 },
];

afterEach(() => jest.clearAllMocks());

test('shows the summary and the ranking', async () => {
  fetchRanking.mockResolvedValue({ stocks: STOCKS, updatedAt: '2026-11-05T22:26:45.480Z' });
  render(<App />);

  expect(await screen.findByRole('article', { name: '1º lugar: AAAA3' })).toBeInTheDocument();
  expect(screen.getByRole('article', { name: '2º lugar: BBBB4' })).toBeInTheDocument();
  expect(screen.getByText('Empresa A')).toBeInTheDocument(); // readable company name on the tag
  expect(screen.getByText('Ibovespa em Promoção')).toBeInTheDocument();
  expect(screen.getByText(/Atualizado em 05\/11\/2026/)).toBeInTheDocument();
  expect(screen.getByText('10,00%')).toBeInTheDocument(); // average DY in the summary
  expect(screen.getByText('3,00x')).toBeInTheDocument(); // median EV/EBIT
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
