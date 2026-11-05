import React from 'react';
import { Box, Chip, Typography } from '@mui/material';

export const ALL_SECTORS = null;

// Sectors present in the ranking, most represented first, with their counts.
export function sectorCounts(stocks) {
  const counts = new Map();
  for (const s of stocks) {
    const sector = s.Setor || 'Outros';
    counts.set(sector, (counts.get(sector) || 0) + 1);
  }
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt-BR'));
}

export function filterBySector(stocks, sector) {
  return sector ? stocks.filter(s => (s.Setor || 'Outros') === sector) : stocks;
}

export default function SectorFilter({ stocks, value, onChange }) {
  const sectors = sectorCounts(stocks);
  if (sectors.length < 2) return null;

  const chip = (label, count, sector) => {
    const selected = value === sector;
    return (
      <Chip
        key={label}
        label={`${label} (${count})`}
        clickable
        color={selected ? 'primary' : 'default'}
        variant={selected ? 'filled' : 'outlined'}
        aria-pressed={selected}
        onClick={() => onChange(sector)}
        sx={{ fontWeight: selected ? 600 : 400 }}
      />
    );
  };

  return (
    <Box component="nav" aria-label="Filtrar por setor" sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>Setor</Typography>
      {chip('Todos', stocks.length, ALL_SECTORS)}
      {sectors.map(([sector, count]) => chip(sector, count, sector))}
    </Box>
  );
}
