import React from 'react';
import { Skeleton, Typography } from '@mui/material';
import { isNumber } from '../lib/format';

const average = values => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : null);

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

const AGGREGATES = { average, median };

// [label, field, aggregate, format] -> { label, value }
export function summarize(stocks, metrics) {
  return metrics.map(([label, field, aggregate, format]) => ({
    label,
    value: format(AGGREGATES[aggregate](stocks.map(s => s[field]).filter(isNumber))),
  }));
}

// One plain sentence instead of a row of stat cards.
export default function Summary({ stocks, loading, sector, strategy }) {
  if (loading) return <Skeleton width="60%" sx={{ fontSize: 18 }} />;
  const [first, second] = summarize(stocks, strategy.summary);
  const count = stocks.length;
  return (
    <Typography sx={{ fontSize: 18, maxWidth: '70ch' }}>
      <strong>{count} {count === 1 ? 'ação' : 'ações'}</strong>{sector ? ` de ${sector}` : ''}{' '}
      {count === 1 ? 'passou' : 'passaram'} em todos os filtros. Juntas, têm {first.label}{' '}
      de <strong>{first.value}</strong> e {second.label} de <strong>{second.value}</strong>.
    </Typography>
  );
}
