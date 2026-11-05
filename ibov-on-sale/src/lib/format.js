// pt-BR formatters for the table. All return '—' for missing values.
const EMPTY = '—';

const isNumber = value => typeof value === 'number' && Number.isFinite(value);

const decimal = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export const formatCurrency = value => (isNumber(value) ? currency.format(value) : EMPTY);

// Percent values come as 0-100 numbers (8.5 => "8,50%").
export const formatPercent = value => (isNumber(value) ? `${decimal.format(value)}%` : EMPTY);

export const formatMultiple = value => (isNumber(value) ? `${decimal.format(value)}x` : EMPTY);

const SCALES = [
  [1e12, 'tri'],
  [1e9, 'bi'],
  [1e6, 'mi'],
  [1e3, 'mil'],
];

export function formatCompactCurrency(value) {
  if (!isNumber(value)) return EMPTY;
  const abs = Math.abs(value);
  const scale = SCALES.find(([factor]) => abs >= factor);
  if (!scale) return formatCurrency(value);
  const [factor, suffix] = scale;
  return `R$ ${decimal.format(value / factor)} ${suffix}`;
}

// "2026-09-30" => "30/09/2026" (no timezone conversion).
export function formatDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(value)) return EMPTY;
  const [year, month, day] = value.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
}

export function formatDateTime(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return EMPTY;
  return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' });
}

export { EMPTY, isNumber };
