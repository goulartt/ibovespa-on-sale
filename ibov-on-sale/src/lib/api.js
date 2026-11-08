export const API_URL = process.env.REACT_APP_API_URL || 'https://ibovespa-on-sale-api.vercel.app';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Every stock that passes the filters (the API allows up to 500).
const MAX_RESULTS = 500;

export const SORTS = { evEbit: 'evEbit', magicFormula: 'magicFormula' };

// Returns { stocks, updatedAt } for the "on sale" ranking.
export async function fetchRanking({ strategy = 'deepValue', sort = SORTS.evEbit, signal, fetchImpl = fetch } = {}) {
  let response;
  try {
    const query = new URLSearchParams({ strategy, sort, limit: String(MAX_RESULTS) });
    response = await fetchImpl(`${API_URL}/api/ibovespa/filtered?${query}`, { signal });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('Não foi possível conectar à API. Verifique sua conexão.');
  }

  if (!response.ok) {
    throw new ApiError('A API está indisponível no momento. Tente novamente em instantes.', response.status);
  }

  const stocks = await response.json();
  if (!Array.isArray(stocks)) throw new ApiError('Resposta inesperada da API.');
  return { stocks, updatedAt: response.headers.get('X-Data-Updated-At') };
}

// Results of the backtest (scripts/backtest.js in the API repository).
export async function fetchBacktest({ signal, fetchImpl = fetch } = {}) {
  let response;
  try {
    response = await fetchImpl(`${API_URL}/api/backtest`, { signal });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('Não foi possível conectar à API. Verifique sua conexão.');
  }
  if (!response.ok) {
    throw new ApiError('O backtest está indisponível no momento. Tente novamente em instantes.', response.status);
  }
  const data = await response.json();
  if (!data || !Array.isArray(data.inicios)) throw new ApiError('Resposta inesperada da API.');
  return data;
}

// Discount rate inputs of the intrinsic value ({ tesouro, ipca, retornoExigido, taxaFinal, ... }).
export async function fetchAssumptions({ signal, fetchImpl = fetch } = {}) {
  const response = await fetchImpl(`${API_URL}/api/ibovespa/premissas`, { signal });
  if (!response.ok) throw new ApiError('Premissas indisponíveis.', response.status);
  return response.json();
}
