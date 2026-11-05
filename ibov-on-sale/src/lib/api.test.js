import { ApiError, fetchRanking } from './api';

const response = (body, { ok = true, status = 200, updatedAt = '2026-11-05T22:00:00Z' } = {}) => ({
  ok,
  status,
  json: async () => body,
  headers: { get: name => (name.toLowerCase() === 'x-data-updated-at' ? updatedAt : null) },
});

describe('fetchRanking', () => {
  test('returns the stocks and the data timestamp', async () => {
    const fetchImpl = jest.fn(async () => response([{ Ativo: 'PETR4' }]));
    await expect(fetchRanking({ fetchImpl })).resolves.toEqual({
      stocks: [{ Ativo: 'PETR4' }],
      updatedAt: '2026-11-05T22:00:00Z',
    });
    expect(fetchImpl.mock.calls[0][0]).toMatch(/\/api\/ibovespa\/filtered\?sort=evEbit$/);
    await fetchRanking({ fetchImpl, sort: 'magicFormula' });
    expect(fetchImpl.mock.calls[1][0]).toMatch(/sort=magicFormula$/);
  });

  test('turns HTTP errors into a friendly ApiError', async () => {
    const fetchImpl = async () => response({ error: 'x' }, { ok: false, status: 500 });
    await expect(fetchRanking({ fetchImpl })).rejects.toThrow(ApiError);
    await expect(fetchRanking({ fetchImpl })).rejects.toThrow(/indisponível/);
  });

  test('turns network failures into a friendly ApiError', async () => {
    const fetchImpl = async () => { throw new TypeError('Failed to fetch'); };
    await expect(fetchRanking({ fetchImpl })).rejects.toThrow(/conectar/);
  });

  test('rejects unexpected payloads', async () => {
    await expect(fetchRanking({ fetchImpl: async () => response({ nope: 1 }) })).rejects.toThrow(/inesperada/);
  });

  test('propagates aborts untouched', async () => {
    const abort = Object.assign(new Error('aborted'), { name: 'AbortError' });
    await expect(fetchRanking({ fetchImpl: async () => { throw abort; } })).rejects.toBe(abort);
  });
});
