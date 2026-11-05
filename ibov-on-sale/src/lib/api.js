export const API_URL = process.env.REACT_APP_API_URL || 'https://ibovespa-on-sale-api.vercel.app';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Every stock that passes the filters (the API allows up to 200).
const MAX_RESULTS = 200;

export const SORTS = { evEbit: 'evEbit', magicFormula: 'magicFormula' };

// Returns { stocks, updatedAt } for the "on sale" ranking.
export async function fetchRanking({ sort = SORTS.evEbit, signal, fetchImpl = fetch } = {}) {
  let response;
  try {
    response = await fetchImpl(`${API_URL}/api/ibovespa/filtered?sort=${encodeURIComponent(sort)}&limit=${MAX_RESULTS}`, { signal });
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
