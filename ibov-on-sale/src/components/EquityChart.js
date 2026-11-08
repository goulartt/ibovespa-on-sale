import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { tokens } from '../theme';
import { formatDate } from '../lib/format';
import { signedPercent } from '../lib/backtest';

const DEFAULT_WIDTH = 960;
const M = { top: 14, right: 104, bottom: 30, left: 52 };

// Draws at the real container width so text keeps its size on phones.
function useWidth(ref) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const w = Math.round(entry.contentRect.width);
      if (w > 0) setWidth(w);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}
const LABEL_GAP = 15;

const toPct = v => (v - 1) * 100;

function niceTicks(min, max, count = 5) {
  const span = max - min || 1;
  const raw = span / count;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map(m => m * pow).find(s => s >= raw);
  const ticks = [];
  for (let t = Math.ceil(min / step) * step; t <= max + 1e-9; t += step) ticks.push(Math.round(t * 100) / 100 || 0);
  return ticks;
}

const TOOLTIP_WIDTH = 220;

// Next to the crosshair on wide charts; centered on it (but inside the chart) on phones.
function tooltipPosition(px, width) {
  if (width >= 600) return px > width * 0.6 ? { left: px - TOOLTIP_WIDTH - 12 } : { left: px + 12 };
  return { left: Math.min(Math.max(px - TOOLTIP_WIDTH / 2, 0), width - TOOLTIP_WIDTH) };
}

// Pushes end labels apart so they don't overlap (keeps their order).
function spreadLabels(items) {
  const sorted = [...items].sort((a, b) => a.y - b.y);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].y - sorted[i - 1].y < LABEL_GAP) sorted[i].y = sorted[i - 1].y + LABEL_GAP;
  }
  return sorted;
}

// Cumulative return of each series since the start (all series share the same dates).
export default function EquityChart({ series }) {
  const ref = useRef(null);
  const boxRef = useRef(null);
  const W = useWidth(boxRef);
  const H = W < 600 ? 260 : 340;
  const [hover, setHover] = useState(null);
  const dates = useMemo(() => series[0]?.points.map(p => p[0]) || [], [series]);

  const geometry = useMemo(() => {
    const all = series.flatMap(s => s.points.map(p => toPct(p[1])));
    const min = Math.min(0, ...all);
    const max = Math.max(0, ...all);
    const pad = (max - min) * 0.06 || 1;
    const yMin = min - pad;
    const yMax = max + pad;
    const n = Math.max(dates.length - 1, 1);
    const x = i => M.left + (i / n) * (W - M.left - M.right);
    const y = v => M.top + ((yMax - v) / (yMax - yMin)) * (H - M.top - M.bottom);
    const years = dates
      .map((d, i) => [d.slice(0, 4), i])
      .filter(([yr], i, arr) => i === 0 || yr !== arr[i - 1][0])
      .filter(([, i], k, arr) => k === 0 || x(i) - x(arr[k - 1][1]) > 40);
    return { x, y, ticks: niceTicks(yMin, yMax, H < 300 ? 4 : 5), years };
  }, [series, dates, W, H]);

  if (dates.length < 2) return null;
  const { x, y, ticks, years } = geometry;

  const labels = spreadLabels(series.map(s => {
    const last = s.points[s.points.length - 1][1];
    return { id: s.id, label: s.label, color: s.color, dash: s.dash, y: y(toPct(last)), value: toPct(last) };
  }));

  const onMove = event => {
    const rect = ref.current.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width) * W;
    const ratio = (px - M.left) / (W - M.left - M.right);
    const i = Math.round(Math.min(1, Math.max(0, ratio)) * (dates.length - 1));
    setHover({ i });
  };

  const hovered = hover && [...series]
    .map(s => ({ ...s, value: toPct(s.points[hover.i][1]) }))
    .sort((a, b) => b.value - a.value);

  return (
    <Box ref={boxRef} sx={{ position: 'relative' }}>
      <Stack direction="row" flexWrap="wrap" sx={{ gap: 2, mb: 1.5 }} role="list" aria-label="Legenda">
        {series.map(s => (
          <Stack key={s.id} direction="row" alignItems="center" spacing={0.75} role="listitem">
            <svg width="22" height="10" aria-hidden="true">
              <line x1="1" x2="21" y1="5" y2="5" stroke={s.color} strokeWidth="2" strokeDasharray={s.dash} strokeLinecap="round" />
            </svg>
            <Typography variant="body2">{s.label}</Typography>
          </Stack>
        ))}
      </Stack>
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        role="img"
        aria-label={`Retorno acumulado desde ${formatDate(dates[0])}: ${labels.map(l => `${l.label} ${signedPercent(l.value)}`).join(', ')}`}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        style={{ display: 'block', touchAction: 'pan-y' }}
      >
        {ticks.map(t => (
          <g key={t}>
            <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} stroke={t === 0 ? tokens.muted : tokens.rule} strokeWidth={1} />
            <text x={M.left - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize="12" fill={tokens.muted}>
              {`${t.toLocaleString('pt-BR')}%`}
            </text>
          </g>
        ))}
        {years.map(([yr, i]) => (
          <text key={yr} x={x(i)} y={H - 8} textAnchor={i === 0 ? 'start' : 'middle'} fontSize="12" fill={tokens.muted}>{yr}</text>
        ))}
        {series.map(s => (
          <path
            key={s.id}
            d={s.points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(toPct(p[1])).toFixed(1)}`).join('')}
            fill="none"
            stroke={s.color}
            strokeWidth="2"
            strokeDasharray={s.dash}
            strokeLinejoin="round"
            strokeLinecap="round"
            data-testid={`line-${s.id}`}
          />
        ))}
        {labels.map(l => (
          <g key={l.id}>
            <circle cx={x(dates.length - 1)} cy={y(l.value)} r="3.5" fill={l.color} stroke={tokens.surface} strokeWidth="2" />
            <line x1={W - M.right + 8} x2={W - M.right + 18} y1={l.y} y2={l.y} stroke={l.color} strokeWidth="2" strokeDasharray={l.dash} />
            <text x={W - M.right + 22} y={l.y} dy="0.32em" fontSize="12" fontWeight="600" fill={tokens.ink}>
              {signedPercent(l.value)}
            </text>
          </g>
        ))}
        {hover && (
          <g>
            <line x1={x(hover.i)} x2={x(hover.i)} y1={M.top} y2={H - M.bottom} stroke={tokens.muted} strokeWidth="1" />
            {hovered.map(s => (
              <circle key={s.id} cx={x(hover.i)} cy={y(s.value)} r="4" fill={s.color} stroke={tokens.surface} strokeWidth="2" />
            ))}
          </g>
        )}
      </svg>
      {hover && (
        <Box
          role="status"
          sx={{
            position: 'absolute', top: 40, pointerEvents: 'none', zIndex: 1,
            ...tooltipPosition(x(hover.i), W),
            bgcolor: tokens.ink, color: '#fff', borderRadius: 1, px: 1.5, py: 1, width: TOOLTIP_WIDTH,
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>{formatDate(dates[hover.i])}</Typography>
          {hovered.map(s => (
            <Stack key={s.id} direction="row" justifyContent="space-between" spacing={2} alignItems="center">
              <Stack direction="row" spacing={0.75} alignItems="center">
                <Box sx={{ width: 10, height: 3, borderRadius: 1, bgcolor: s.color === tokens.ink ? '#fff' : s.color }} />
                <Typography variant="caption">{s.label}</Typography>
              </Stack>
              <Typography variant="caption" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{signedPercent(s.value)}</Typography>
            </Stack>
          ))}
        </Box>
      )}
    </Box>
  );
}
