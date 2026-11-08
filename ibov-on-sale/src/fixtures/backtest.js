const curve = (a, b) => [['2024-01-02', 1], ['2024-06-03', a], ['2025-01-02', b]];
const run = (retorno, extra = {}) => ({
  metricas: { retorno, retornoAnual: retorno / 2, cdi: 20, percentualCdi: retorno * 5, excessoCdi: retorno - 20, maxDrawdown: -15, volatilidade: 20, operacoes: 4 },
  anual: { 2024: retorno - 5, 2025: 5 },
  curva: curve(1 + retorno / 200, 1 + retorno / 100),
  carteiraInicial: [{ ticker: 'AAAA3', empresa: 'A', rank: 1 }, { ticker: 'BBBB4', empresa: 'B', rank: 2 }],
  carteiraAtual: ['AAAA3', 'CCCC3'],
  trocas: [{ date: '2024-05-20', sold: [{ ticker: 'BBBB4', empresa: 'B', rank: null }], bought: [{ ticker: 'CCCC3', empresa: 'C', rank: 1 }] }],
  eventos: [],
  simulacao: { aporte: 100000, semImpostos: 100000 * (1 + retorno / 100), liquido: 100000 * (1 + retorno / 120), impostosVendas: 1000, impostoResgate: 500, proventos: 5000 },
  ...extra,
});
const bench = retorno => ({
  simulacao: { semImpostos: 100000 * (1 + retorno / 100), liquido: 100000 * (1 + 0.85 * retorno / 100), impostos: 150 * retorno },
  metricas: { retorno, retornoAnual: retorno / 2, percentualCdi: 100 },
  anual: { 2024: retorno / 2, 2025: retorno / 2 },
  curva: curve(1 + retorno / 200, 1 + retorno / 100),
});
const versions = (rotation, hold) => ({ rotation: run(rotation), buyAndHold: run(hold, { trocas: [] }) });
const period = (id, label, mult) => ({
  id,
  label,
  inicio: '2024-01-02',
  fim: '2026-11-06',
  benchmarks: { cdi: bench(20), ibov: bench(10) },
  estrategias: {
    deepValue: versions(30 * mult, 12 * mult),
    dividendos: versions(40 * mult, 25 * mult),
    qualidade: versions(-5 * mult, 8 * mult),
  },
});
const robust = { rotation: { acimaCdi: 10, total: 12 }, buyAndHold: { acimaCdi: 6, total: 12 } };

export const BACKTEST = {
  updatedAt: '2026-11-08T12:00:00.000Z',
  parametros: { tamanhos: { deepValue: 20, qualidade: 20, dividendos: 10 } },
  periodos: [period('completo', '2014 até hoje', 1), period('validacao', '2020 até hoje (validação)', 2)],
  robustez: { anos: [2014, 2015], deepValue: robust, dividendos: robust, qualidade: robust },
};
