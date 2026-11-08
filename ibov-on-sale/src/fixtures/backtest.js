const curve = (a, b) => [['2024-01-02', 1], ['2024-06-03', a], ['2025-01-02', b]];
const run = (retorno, extra = {}) => ({
  metricas: { retorno, retornoAnual: retorno / 2, cdi: 20, percentualCdi: retorno * 5, excessoCdi: retorno - 20, maxDrawdown: -15, volatilidade: 20, operacoes: 4 },
  anual: { 2024: retorno - 5, 2025: 5 },
  curva: curve(1 + retorno / 200, 1 + retorno / 100),
  carteiraInicial: [{ ticker: 'AAAA3', empresa: 'A', rank: 1 }, { ticker: 'BBBB4', empresa: 'B', rank: 2 }],
  carteiraAtual: ['AAAA3', 'CCCC3'],
  trocas: [{ date: '2024-05-20', sold: [{ ticker: 'BBBB4', empresa: 'B', rank: null }], bought: [{ ticker: 'CCCC3', empresa: 'C', rank: 1 }] }],
  eventos: [],
  ...extra,
});
const bench = retorno => ({
  metricas: { retorno, percentualCdi: 100 },
  anual: { 2024: retorno / 2, 2025: retorno / 2 },
  curva: curve(1 + retorno / 200, 1 + retorno / 100),
});
const start = (ano, mult) => ({
  ano,
  inicio: `${ano}-01-02`,
  fim: '2026-11-06',
  benchmarks: { cdi: bench(20), ibov: bench(10) },
  estrategias: {
    deepValue: { rotation: run(30 * mult), buyAndHold: run(12 * mult, { trocas: [] }) },
    dividendos: { rotation: run(40 * mult), buyAndHold: run(25 * mult, { trocas: [] }) },
    qualidade: { rotation: run(-5 * mult), buyAndHold: run(8 * mult, { trocas: [] }) },
  },
});

export const BACKTEST = { updatedAt: '2026-11-08T12:00:00.000Z', inicios: [start(2024, 1), start(2025, 2)] };
