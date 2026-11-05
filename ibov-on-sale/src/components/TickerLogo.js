import React, { useState } from 'react';
import { Box } from '@mui/material';

// Company logos from brapi's public icon set (https://icons.brapi.dev). Falls back to the
// ticker initials when a company has no logo.
export const logoUrl = ticker => `https://icons.brapi.dev/icons/${encodeURIComponent(ticker)}.svg`;

export default function TickerLogo({ ticker, size = 28 }) {
  const [failed, setFailed] = useState(false);
  const common = {
    width: size, height: size, flexShrink: 0, borderRadius: '6px', overflow: 'hidden',
    border: '1px solid', borderColor: 'divider',
  };

  if (failed || !ticker) {
    return (
      <Box
        aria-hidden
        sx={{
          ...common, display: 'grid', placeItems: 'center', bgcolor: 'background.default',
          color: 'text.secondary', fontSize: size * 0.36, fontWeight: 700, letterSpacing: 0.2,
        }}
      >
        {(ticker || '?').slice(0, 2)}
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={logoUrl(ticker)}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      sx={{ ...common, display: 'block', bgcolor: '#fff' }}
    />
  );
}
