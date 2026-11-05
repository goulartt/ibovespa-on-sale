import React from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const CRITERIA = [
  ['Liquidez', 'mais de R$ 1 milhão negociado por dia, em média, nos últimos 3 meses'],
  ['Dividendos', 'dividend yield acima de 6% tanto nos últimos 12 meses quanto na média dos últimos 5 anos, o que deixa de fora dividendos extraordinários'],
  ['Regularidade', 'proventos pagos em pelo menos 3 dos últimos 5 anos'],
  ['Payout', 'a empresa distribui no máximo 100% do lucro, ou seja, não paga mais do que ganha'],
  ['Lucro', 'lucro em todos os últimos balanços anuais (pelo menos 3) e nos últimos 12 meses, com margem EBIT positiva'],
  ['Endividamento', 'dívida líquida menor que 3 vezes o EBIT'],
  ['Situação', 'ficam de fora as empresas em recuperação judicial ou extrajudicial, falência ou liquidação, segundo o cadastro da CVM'],
  ['Ordenação', 'do menor para o maior EV/EBIT, ou pela Fórmula Mágica, que soma a posição no EV/EBIT (mais barata) com a posição no ROIC (melhor negócio); uma ação por empresa, a mais negociada'],
];

export default function Methodology() {
  return (
    <Accordion disableGutters elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, '&:before': { display: 'none' } }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography sx={{ fontWeight: 600 }}>Como a lista é montada</Typography>
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
