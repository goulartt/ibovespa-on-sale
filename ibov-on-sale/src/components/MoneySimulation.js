import React from 'react';
import { Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { SERIES, runOf, signedPercent } from '../lib/backtest';
import { formatDate } from '../lib/format';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const formatMoney = value => (typeof value === 'number' && Number.isFinite(value) ? money.format(value) : '—');

const yearsBetween = (a, b) => (Date.parse(b) - Date.parse(a)) / (365.25 * 86400000);

// Rows: the strategies plus a CDB of 100% of the CDI and an Ibovespa ETF, all after taxes.
export function simulationRows(period, mode) {
  const years = yearsBetween(period.inicio, period.fim);
  const row = (id, label, s, salesTax) => {
    const factor = s.liquido / (s.aporte ?? 100000);
    return {
      id,
      label,
      semImpostos: s.semImpostos,
      impostosVendas: salesTax ? s.impostosVendas : null,
      impostoResgate: salesTax ? s.impostoResgate : s.impostos,
      liquido: s.liquido,
      retornoAnual: years > 0 ? (Math.pow(factor, 1 / years) - 1) * 100 : null,
    };
  };
  const strategies = SERIES
    .filter(s => runOf(period, s.id, mode)?.simulacao)
    .map(s => row(s.id, s.label, runOf(period, s.id, mode).simulacao, true));
  const benchmarks = [
    ['cdi', 'CDB 100% do CDI'],
    ['ibov', 'ETF de Ibovespa'],
  ].filter(([id]) => period.benchmarks[id]?.simulacao)
    .map(([id, label]) => row(id, label, period.benchmarks[id].simulacao, false));
  return [...strategies, ...benchmarks];
}

export default function MoneySimulation({ period, mode }) {
  const rows = simulationRows(period, mode);
  if (rows.length === 0) return null;
  const cdi = rows.find(r => r.id === 'cdi');
  return (
    <div>
      <Typography variant="h2" sx={{ fontSize: 28, mb: 1 }}>Com R$ 100 mil e impostos</Typography>
      <Typography sx={{ mb: 1.5, maxWidth: '75ch' }}>
        R$ 100 mil aplicados em {formatDate(period.inicio)} em cada opção e resgatados em {formatDate(period.fim)}, depois do
        imposto de renda de pessoa física.
      </Typography>
      <Paper variant="outlined" sx={{ borderRadius: 1.5, overflowX: 'auto' }}>
        <Table size="small" aria-label="Simulação com R$ 100 mil">
          <TableHead>
            <TableRow>
              <TableCell>Aplicação</TableCell>
              <TableCell align="right">Valor líquido</TableCell>
              <TableCell align="right">Líquido ao ano</TableCell>
              <TableCell align="right">Sem impostos</TableCell>
              <TableCell align="right">IR nas vendas</TableCell>
              <TableCell align="right">IR ao resgatar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id}>
                <TableCell component="th" scope="row">{r.label}</TableCell>
                <TableCell
                  align="right"
                  sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: cdi && r.id !== 'cdi' && r.liquido > cdi.liquido ? 700 : 400 }}
                >
                  {formatMoney(r.liquido)}
                </TableCell>
                <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>{signedPercent(r.retornoAnual)}</TableCell>
                <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>{formatMoney(r.semImpostos)}</TableCell>
                <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>{r.impostosVendas == null ? '—' : formatMoney(r.impostosVendas)}</TableCell>
                <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>{formatMoney(r.impostoResgate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        Em negrito, o que terminou acima do CDB. Ações: 15% sobre o lucro líquido do mês nas vendas, isento quando o total
        vendido no mês fica em até R$ 20 mil, prejuízos compensando lucros seguintes; dividendos isentos e reinvestidos na
        própria ação; dinheiro parado rende o CDI menos 15% de IR. "IR ao resgatar" é o imposto de vender tudo no último
        dia. CDB e ETF de Ibovespa: 15% sobre o ganho no resgate (prazo acima de 2 anos), sem taxas de administração.
        Os juros sobre capital próprio (JCP) aparecem misturados aos dividendos nos dados do Yahoo, então os 15% retidos
        na fonte sobre eles não foram descontados, o que melhora um pouco o resultado das ações.
      </Typography>
    </div>
  );
}
