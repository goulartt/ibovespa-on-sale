import React, { useEffect, useState } from 'react';
import { Paper, Typography } from '@mui/material';
import { fetchAssumptions } from '../lib/api';
import { formatDate, formatPercent } from '../lib/format';

// The discount rate of the day, spelled out: Tesouro IPCA+ + IPCA - perpetual growth.
export default function ValuationAssumptions() {
  const [data, setData] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    fetchAssumptions({ signal: controller.signal }).then(setData).catch(() => {});
    return () => controller.abort();
  }, []);
  if (!data) return null;
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }} aria-label="Taxa de desconto">
      <Typography sx={{ fontSize: 15 }}>
        <strong>Taxa de desconto:</strong> {data.tesouro.titulo} ({formatPercent(data.tesouro.taxa)} ao ano + inflação,
        em {formatDate(data.tesouro.data)}) + IPCA esperado de {formatPercent(data.ipca.taxa)} (Boletim Focus)
        = retorno exigido de <strong>{formatPercent(data.retornoExigido)}</strong>, menos {formatPercent(data.crescimentoPerpetuidade)} de
        crescimento na perpetuidade = <strong>{formatPercent(data.taxaFinal)}</strong>.
      </Typography>
    </Paper>
  );
}
