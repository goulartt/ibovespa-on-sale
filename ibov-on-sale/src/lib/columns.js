import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ColumnHeader from '../components/ColumnHeader';
import TickerLogo from '../components/TickerLogo';
import ProfitSparkline from '../components/ProfitSparkline';
import { companyName } from './names';
import { tokens } from '../theme';
import { FIELDS } from './fields';
import {
  formatCompactCurrency, formatCurrency, formatDate, formatMultiple, formatPercent, isNumber, EMPTY,
} from './format';

export const FORMATTERS = {
  rank: value => (isNumber(value) ? String(value) : EMPTY),
  ticker: value => value ?? EMPTY,
  text: value => value ?? EMPTY,
  currency: formatCurrency,
  percent: formatPercent,
  multiple: formatMultiple,
  compactCurrency: formatCompactCurrency,
  date: formatDate,
  situation: value => value || 'Normal',
  yesNo: value => (value === true ? 'Sim' : value === false ? 'Não' : EMPTY),
  outOfFive: value => (isNumber(value) ? `${value} de 5` : EMPTY),
  sparkline: years => (Array.isArray(years) && years.length ? years.map(y => `${y.ano}: ${formatCompactCurrency(y.lucro)}`).join('; ') : EMPTY),
};

const NUMERIC_FORMATS = new Set(['rank', 'currency', 'percent', 'multiple', 'compactCurrency', 'outOfFive']);

const signColor = value => (!isNumber(value) || value === 0 ? 'text.primary' : value > 0 ? 'success.main' : 'error.main');

function renderTicker({ value, row }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
      <TickerLogo ticker={value} />
      <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, lineHeight: 1.2 }}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>{value}</Typography>
        <Typography variant="caption" color="text.secondary" noWrap title={row.Empresa}>{companyName(row.Empresa)}</Typography>
      </Box>
    </Box>
  );
}

function renderSituation({ value }) {
  return value ? <Chip size="small" color="error" variant="outlined" label={value} /> : 'Normal';
}

function renderRank({ value }) {
  const top = value <= 3;
  return (
    <Box
      sx={{
        width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center',
        fontSize: 13, fontWeight: 700,
        bgcolor: top ? tokens.offer : 'transparent',
        color: top ? tokens.ink : 'text.secondary',
      }}
    >
      {value}
    </Box>
  );
}

function renderDividend({ value, formattedValue }) {
  if (!isNumber(value)) return EMPTY;
  const strong = value >= 10;
  return (
    <Chip
      size="small"
      label={formattedValue}
      color={strong ? 'success' : 'default'}
      variant={strong ? 'filled' : 'outlined'}
      sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}
    />
  );
}

function renderSigned({ value, formattedValue }) {
  return (
    <Box component="span" sx={{ color: signColor(value), fontVariantNumeric: 'tabular-nums' }}>
      {formattedValue}
    </Box>
  );
}

function renderTrend({ value, formattedValue }) {
  if (!isNumber(value)) return EMPTY;
  const Icon = value >= 0 ? ArrowDropUpIcon : ArrowDropDownIcon;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', color: signColor(value), fontWeight: 600 }}>
      <Icon fontSize="small" />
      {formattedValue.replace('-', '')}
    </Box>
  );
}

// Buy price: green when the stock already trades at or below it.
function renderCeiling({ value, formattedValue, row }) {
  if (!isNumber(value)) return EMPTY;
  const below = isNumber(row['Cotação']) && row['Cotação'] <= value;
  return below ? (
    <Chip size="small" color="success" label={formattedValue} title="Cotação abaixo do preço teto" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }} />
  ) : formattedValue;
}

function rendererFor(meta) {
  if (meta.ceiling) return renderCeiling;
  if (meta.format === 'ticker') return renderTicker;
  if (meta.format === 'rank') return renderRank;
  if (meta.format === 'situation') return renderSituation;
  if (meta.format === 'sparkline') return ({ value }) => <ProfitSparkline years={value} />;
  if (meta.highlight === 'dividend') return renderDividend;
  if (meta.trend) return renderTrend;
  if (meta.signed) return renderSigned;
  return undefined;
}

// DataGrid (v5) column definitions built from the field metadata.
export function buildColumns(fields = FIELDS) {
  return fields.map(meta => {
    const numeric = NUMERIC_FORMATS.has(meta.format);
    const format = FORMATTERS[meta.format] || FORMATTERS.text;
    return {
      field: meta.field,
      headerName: meta.label,
      description: meta.description,
      type: numeric ? 'number' : 'string',
      width: meta.width || 112,
      align: numeric ? 'right' : 'left',
      headerAlign: numeric ? 'right' : 'left',
      sortable: meta.format !== 'sparkline',
      valueFormatter: ({ value }) => format(value),
      renderHeader: () => <ColumnHeader label={meta.label} description={meta.description} />,
      renderCell: rendererFor(meta),
      // Missing values always sort last.
      sortComparator: numeric ? compareNullsLast : undefined,
    };
  });
}

export function compareNullsLast(a, b) {
  const aMissing = !isNumber(a);
  const bMissing = !isNumber(b);
  if (aMissing && bMissing) return 0;
  if (aMissing) return 1;
  if (bMissing) return -1;
  return a - b;
}

// `visibleOnly` (a strategy's own column set) overrides the default hidden flags;
// `extraShown` shows columns that are hidden by default.
export const initialColumnVisibility = (fields = FIELDS, extraHidden = [], visibleOnly = null, extraShown = []) =>
  Object.fromEntries(fields
    .filter(f => (visibleOnly
      ? !visibleOnly.includes(f.field)
      : (f.hidden && !extraShown.includes(f.field)) || extraHidden.includes(f.field)))
    .map(f => [f.field, false]));

// Strategy-specific header names, e.g. { 'Cotação': 'Valor atual' }.
export const withLabels = (fields, labels = {}) => fields.map(f => (labels[f.field] ? { ...f, label: labels[f.field] } : f));
