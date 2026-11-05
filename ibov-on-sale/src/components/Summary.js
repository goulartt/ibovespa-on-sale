import React from 'react';
import { Skeleton, Typography } from '@mui/material';
import { formatMultiple, formatPercent, isNumber } from '../lib/format';

const average = values => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : null);

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function summarize(stocks) {
  const pick = field => stocks.map(s => s[field]).filter(isNumber);
  return {
    count: stocks.length,
    averageDy: average(pick('Dividend Yield')),
    medianEvEbit: median(pick('EV/EBIT')),
  };
}

// One plain sentence instead of a row of stat cards.
export default function Summary({ stocks, loading }) {
  if (loading) return <Skeleton width="60%" sx={{ fontSize: 18 }} />;
  const s = summarize(stocks);
  return (
    <Typography sx={{ fontSize: 18, maxWidth: '70ch' }}>
      <strong>{s.count} ações</strong> passaram em todos os filtros. Juntas, têm dividend yield médio
      de <strong>{formatPercent(s.averageDy)}</strong> e EV/EBIT mediano de <strong>{formatMultiple(s.medianEvEbit)}</strong>.
    </Typography>
  );
}
