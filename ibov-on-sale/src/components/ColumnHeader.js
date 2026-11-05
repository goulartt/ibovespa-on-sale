import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// Column title with an info icon; hovering shows what the field means.
export default function ColumnHeader({ label, description }) {
  return (
    <Tooltip
      arrow
      enterDelay={150}
      placement="top"
      title={(
        <Box sx={{ p: 0.5, maxWidth: 280 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>{label}</Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.5 }}>{description}</Typography>
        </Box>
      )}
    >
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, cursor: 'help' }}>
        <span className="MuiDataGrid-columnHeaderTitle">{label}</span>
        {description && <InfoOutlinedIcon sx={{ fontSize: 15, opacity: 0.55 }} aria-label={`O que é ${label}`} />}
      </Box>
    </Tooltip>
  );
}
