import React from 'react';
import { FormControlLabel, Switch, Typography } from '@mui/material';

export const isBelowBazin = stock =>
  typeof stock['Preço Teto Bazin'] === 'number' && typeof stock['Cotação'] === 'number' && stock['Cotação'] <= stock['Preço Teto Bazin'];

export const filterByBazin = (stocks, onlyBelow) => (onlyBelow ? stocks.filter(isBelowBazin) : stocks);

// Shows only the stocks trading at or below Bazin's price ceiling.
export default function BazinFilter({ stocks, value, onChange }) {
  const count = stocks.filter(isBelowBazin).length;
  return (
    <FormControlLabel
      control={<Switch checked={value} onChange={event => onChange(event.target.checked)} />}
      label={(
        <Typography variant="body2">
          Só abaixo do preço teto de Bazin <Typography component="span" variant="body2" color="text.secondary">({count} de {stocks.length})</Typography>
        </Typography>
      )}
    />
  );
}
