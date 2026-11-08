import React from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { COMMON_CRITERIA } from '../lib/strategies';


export default function Methodology({ strategy }) {
  const excluded = strategy.excludeCommon || [];
  const criteria = [...strategy.criteria, ...COMMON_CRITERIA.filter(([title]) => !excluded.includes(title))];
  return (
    <Accordion disableGutters elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, '&:before': { display: 'none' } }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography sx={{ fontWeight: 600 }}>Como a lista “{strategy.label}” é montada</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box component="ul" sx={{ m: 0, pl: 2.5, display: 'grid', gap: 0.75 }}>
          {criteria.map(([title, text]) => (
            <li key={title}>
              <Typography variant="body2"><strong>{title}:</strong> {text}.</Typography>
            </li>
          ))}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Os indicadores fundamentalistas são calculados a partir dos demonstrativos enviados à CVM
          (dados abertos), acumulados nos últimos 12 meses. Cotações, volume e proventos vêm do
          Yahoo Finance. Os dados são atualizados todos os dias úteis após o fechamento do pregão.
          Passe o mouse sobre o nome de cada coluna para ver o que ela significa.
        </Typography>
      </AccordionDetails>
    </Accordion>
  );
}
