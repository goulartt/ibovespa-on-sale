import React from 'react';
import { Box, Skeleton, Typography } from '@mui/material';
import TickerLogo from './TickerLogo';
import { displayFont, tokens } from '../theme';
import { formatMultiple, formatPercent } from '../lib/format';
import { companyName } from '../lib/names';

const TILTS = ['-1.6deg', '0.9deg', '-0.6deg'];

// The top of the ranking presented as supermarket price tags: the "price" is the EV/EBIT.
function Tag({ stock, index, loading }) {
  return (
    <Box
      component="article"
      aria-label={stock ? `${index + 1}º lugar: ${stock.Ativo}` : undefined}
      sx={{
        position: 'relative',
        bgcolor: tokens.offer,
        color: tokens.ink,
        pl: 5, pr: 3, py: 2.5,
        transform: { sm: `rotate(${TILTS[index]})` },
        clipPath: 'polygon(22px 0, 100% 0, 100% 100%, 22px 100%, 0 50%)',
        // punched hole for the string
        '&::before': {
          content: '""', position: 'absolute', left: 16, top: '50%', width: 10, height: 10,
          mt: '-5px', borderRadius: '50%', bgcolor: tokens.paper,
        },
      }}
    >
      <Typography sx={{ fontFamily: displayFont, fontWeight: 700, fontSize: 18 }}>
        {index + 1}º lugar
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mt: 1 }}>
        {loading ? <Skeleton variant="rounded" width={32} height={32} /> : <TickerLogo ticker={stock.Ativo} size={32} />}
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 18, lineHeight: 1.1 }}>
            {loading ? <Skeleton width={70} /> : stock.Ativo}
          </Typography>
          <Typography variant="body2" noWrap sx={{ opacity: 0.8 }}>
            {loading ? <Skeleton width={120} /> : companyName(stock.Empresa)}
          </Typography>
        </Box>
      </Box>
      <Typography sx={{ mt: 2, fontSize: 14 }}>EV/EBIT</Typography>
      <Typography sx={{ fontFamily: displayFont, fontWeight: 800, fontSize: 64, lineHeight: 0.9 }}>
        {loading ? <Skeleton width={110} /> : formatMultiple(stock['EV/EBIT'])}
      </Typography>
      <Typography sx={{ mt: 1, fontSize: 15 }}>
        {loading ? <Skeleton width={140} /> : <>Dividend yield de <strong>{formatPercent(stock['Dividend Yield'])}</strong></>}
      </Typography>
    </Box>
  );
}

export default function PriceTags({ stocks, loading }) {
  const top = loading ? [null, null, null] : stocks.slice(0, 3);
  if (!top.length) return null;
  return (
    <Box
      component="section"
      aria-label="Três primeiros do ranking"
      sx={{ display: 'grid', gap: { xs: 2, sm: 3 }, gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }, maxWidth: 1040 }}
    >
      {top.map((stock, index) => (
        <Tag key={stock ? stock.Ativo : index} stock={stock} index={index} loading={loading} />
      ))}
    </Box>
  );
}
