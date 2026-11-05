import React from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const CRITERIA = [
  ['Liquidez', 'mais de R$ 1 milhão negociado por dia, em média, nos últimos 3 meses'],
  ['Rentabilidade', 'margem EBIT positiva nos últimos 12 meses'],
  ['Dividendos', 'dividend yield acima de 6% nos últimos 12 meses'],
  ['Saúde', 'empresas em recuperação judicial ficam de fora'],
  ['Ordenação', 'do menor para o maior EV/EBIT; uma ação por empresa (a mais negociada)'],
];

export default function Methodology() {
  return (
    <Accordion disableGutters elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3, '&:before': { display: 'none' } }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography sx={{ fontWeight: 600 }}>Como as ações são selecionadas</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box component="ul" sx={{ m: 0, pl: 2.5, display: 'grid', gap: 0.75 }}>
          {CRITERIA.map(([title, text]) => (
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
