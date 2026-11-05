import React from 'react';
import { Box, Paper, Skeleton, Typography } from '@mui/material';
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
  const byDy = [...stocks].filter(s => isNumber(s['Dividend Yield'])).sort((a, b) => b['Dividend Yield'] - a['Dividend Yield']);
  return {
    count: stocks.length,
    averageDy: average(pick('Dividend Yield')),
    medianEvEbit: median(pick('EV/EBIT')),
    topDy: byDy[0] || null,
  };
}

function Card({ label, value, hint, loading }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: 'background.paper' }}>
      <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1 }}>{label}</Typography>
      <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, fontVariantNumeric: 'tabular-nums' }}>
        {loading ? <Skeleton width="60%" /> : value}
      </Typography>
      <Typography variant="body2" color="text.secondary" noWrap>
        {loading ? <Skeleton width="80%" /> : hint}
      </Typography>
    </Paper>
  );
}

export default function SummaryCards({ stocks, loading }) {
  const s = summarize(stocks);
  return (
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' } }}>
      <Card loading={loading} label="Ações selecionadas" value={s.count} hint="passaram em todos os filtros" />
      <Card loading={loading} label="Dividend yield médio" value={formatPercent(s.averageDy)} hint="últimos 12 meses" />
      <Card loading={loading} label="EV/EBIT mediano" value={formatMultiple(s.medianEvEbit)} hint="quanto menor, mais barato" />
      <Card
        loading={loading}
        label="Maior dividend yield"
        value={s.topDy ? formatPercent(s.topDy['Dividend Yield']) : '—'}
        hint={s.topDy ? s.topDy.Ativo : ''}
      />
    </Box>
  );
}
