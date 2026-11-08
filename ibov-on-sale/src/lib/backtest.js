import { STRATEGIES } from './strategies';

// Categorical slots 1-3 of the validated reference palette (dataviz skill); benchmarks are neutral.
export const SERIES = [
  { id: 'deepValue', label: STRATEGIES.deepValue.label, color: '#2a78d6' },
  { id: 'dividendos', label: STRATEGIES.dividendos.label, color: '#eb6834' },
  { id: 'qualidade', label: STRATEGIES.qualidade.label, color: '#1baf7a' },
];
export const BENCHMARKS = [
  { id: 'cdi', label: 'CDI', color: '#1A2420', dash: '6 4' },
  { id: 'ibov', label: 'Ibovespa', color: '#5E6B64', dash: '2 3' },
];

export const MODES = {
  rotation: { id: 'rotation', label: 'Com rotação trimestral' },
  buyAndHold: { id: 'buyAndHold', label: 'Comprar e segurar' },
};

// Lines for the chart: the 3 strategies in the chosen mode + CDI + Ibovespa.
export function chartSeries(start, mode) {
  const strategies = SERIES
    .filter(s => start.estrategias[s.id])
    .map(s => ({ ...s, points: start.estrategias[s.id][mode].curva }));
  const benchmarks = BENCHMARKS
    .filter(b => start.benchmarks[b.id])
    .map(b => ({ ...b, points: start.benchmarks[b.id].curva }));
  return [...strategies, ...benchmarks];
}

// Rows of the year-by-year table: { year, deepValue, dividendos, qualidade, cdi, ibov }.
export function yearlyRows(start, mode) {
  const years = Object.keys(start.benchmarks.cdi.anual).sort();
  return years.map(year => {
    const row = { year };
    for (const s of SERIES) row[s.id] = start.estrategias[s.id]?.[mode]?.anual?.[year] ?? null;
    for (const b of BENCHMARKS) row[b.id] = start.benchmarks[b.id]?.anual?.[year] ?? null;
    return row;
  });
}

// "+12,34%" / "-3,10%"
export const signedPercent = value => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  const text = `${Math.abs(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
  return value > 0 ? `+${text}` : value < 0 ? `-${text}` : text;
};
