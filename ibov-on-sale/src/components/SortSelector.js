import React from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { SORTS } from '../lib/api';

const OPTIONS = [
  { value: SORTS.evEbit, label: 'Mais baratas', hint: 'maior EBIT/EV' },
  { value: SORTS.magicFormula, label: 'Fórmula Mágica', hint: 'barata e rentável: EBIT/EV + ROIC' },
];

export default function SortSelector({ value, onChange, disabled }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
      <Typography id="sort-label" variant="body2" color="text.secondary">Ordenar por</Typography>
      <ToggleButtonGroup
        exclusive
        size="small"
        color="primary"
        value={value}
        disabled={disabled}
        aria-labelledby="sort-label"
        onChange={(event, next) => next && onChange(next)}
      >
        {OPTIONS.map(o => (
          <ToggleButton key={o.value} value={o.value} sx={{ px: 2, flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2 }}>
            <span style={{ fontWeight: 600 }}>{o.label}</span>
            <span style={{ fontSize: 12, opacity: 0.75, textTransform: 'none' }}>{o.hint}</span>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}
