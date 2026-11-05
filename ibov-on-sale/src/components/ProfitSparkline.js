import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import { tokens } from '../theme';
import { formatCompactCurrency } from '../lib/format';

const WIDTH = 92;
const HEIGHT = 28;
const GAP = 3;

// Tiny bar chart of the net income of the last annual statements (losses below the axis, in red).
export default function ProfitSparkline({ years }) {
  if (!Array.isArray(years) || years.length === 0) return '—';

  const max = Math.max(...years.map(y => Math.abs(y.lucro)), 1);
  const hasLoss = years.some(y => y.lucro < 0);
  const axis = hasLoss ? HEIGHT / 2 : HEIGHT - 1;
  const room = hasLoss ? HEIGHT / 2 - 1 : HEIGHT - 2;
  const barWidth = (WIDTH - GAP * (years.length - 1)) / years.length;
  const summary = years.map(y => `${y.ano}: ${formatCompactCurrency(y.lucro)}`).join('\n');

  return (
    <Tooltip
      arrow
      title={(
        <Box sx={{ p: 0.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>Lucro líquido por ano</Typography>
          {years.map(y => (
            <Typography key={y.ano} variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {y.ano}: {formatCompactCurrency(y.lucro)}
            </Typography>
          ))}
        </Box>
      )}
    >
      <svg width={WIDTH} height={HEIGHT} role="img" aria-label={`Lucro líquido por ano. ${summary}`}>
        {years.map((y, i) => {
          const h = Math.max(1, (Math.abs(y.lucro) / max) * room);
          const positive = y.lucro >= 0;
          return (
            <rect
              key={y.ano}
              x={i * (barWidth + GAP)}
              y={positive ? axis - h : axis}
              width={barWidth}
              height={h}
              rx={1.5}
              fill={positive ? tokens.market : tokens.loss}
              opacity={i === years.length - 1 ? 1 : 0.55}
            />
          );
        })}
        <line x1={0} x2={WIDTH} y1={axis} y2={axis} stroke={tokens.rule} strokeWidth={1} />
      </svg>
    </Tooltip>
  );
}
