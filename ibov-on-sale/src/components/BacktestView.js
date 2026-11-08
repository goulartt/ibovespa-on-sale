import React, { useCallback, useEffect, useState } from 'react';
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Paper, Skeleton, Stack,
  Table, TableBody, TableCell, TableHead, TableRow, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import EquityChart from './EquityChart';
import { fetchBacktest } from '../lib/api';
import { BENCHMARKS, MODES, SERIES, chartSeries, signedPercent, yearlyRows } from '../lib/backtest';
import { formatDate, formatPercent } from '../lib/format';
import { tokens, displayFont } from '../theme';

function useBacktest() {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState(s => ({ ...s, loading: true, error: null }));
    fetchBacktest({ signal: controller.signal })
      .then(data => setState({ data, loading: false, error: null }))
      .catch(error => {
        if (error.name !== 'AbortError') setState(s => ({ ...s, loading: false, error: error.message }));
      });
    return () => controller.abort();
  }, [attempt]);
  const retry = useCallback(() => setAttempt(a => a + 1), []);
  return { ...state, retry };
}

const valueColor = v => (typeof v !== 'number' ? 'text.primary' : v >= 0 ? 'success.main' : 'error.main');

function StrategyCard({ series, run, cdi }) {
  const m = run.metricas;
  const beat = m.retorno > cdi.metricas.retorno;
  return (
    <Paper variant="outlined" component="article" aria-label={series.label} sx={{ p: 2.5, borderRadius: 1.5, borderTop: `3px solid ${series.color}` }}>
      <Typography sx={{ fontWeight: 600 }}>{series.label}</Typography>
      <Typography sx={{ fontFamily: displayFont, fontWeight: 800, fontSize: 44, lineHeight: 1.1, color: valueColor(m.retorno) }}>
        {signedPercent(m.retorno)}
      </Typography>
      <Typography variant="body2" sx={{ mb: 1.5 }}>
        <Box component="strong" sx={{ color: beat ? 'success.main' : 'error.main' }}>
          {formatPercent(m.percentualCdi)} do CDI
        </Box>{' '}
        ({signedPercent(m.excessoCdi).replace('%', ' p.p.')})
      </Typography>
      <Box component="dl" sx={{ m: 0, display: 'grid', gridTemplateColumns: 'auto auto', rowGap: 0.5, columnGap: 2, fontSize: 14 }}>
        {[
          ['Ao ano', signedPercent(m.retornoAnual)],
          ['Maior queda', formatPercent(m.maxDrawdown)],
          ['Volatilidade', `${formatPercent(m.volatilidade)} a.a.`],
          ['Operações', String(m.operacoes)],
        ].map(([k, v]) => (
          <React.Fragment key={k}>
            <Box component="dt" sx={{ color: 'text.secondary' }}>{k}</Box>
            <Box component="dd" sx={{ m: 0, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{v}</Box>
          </React.Fragment>
        ))}
      </Box>
    </Paper>
  );
}

function YearlyTable({ start, mode }) {
  const rows = yearlyRows(start, mode);
  const columns = [...SERIES, ...BENCHMARKS];
  return (
    <Paper variant="outlined" sx={{ borderRadius: 1.5, overflowX: 'auto' }}>
      <Table size="small" aria-label="Retorno por ano">
        <TableHead>
          <TableRow>
            <TableCell>Ano</TableCell>
            {columns.map(c => <TableCell key={c.id} align="right">{c.label}</TableCell>)}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={row.year}>
              <TableCell component="th" scope="row">
                {row.year}{i === 0 && start.inicio.slice(5) !== '01-02' ? '*' : ''}{i === rows.length - 1 ? ' (até agora)' : ''}
              </TableCell>
              {columns.map(c => (
                <TableCell
                  key={c.id}
                  align="right"
                  sx={{
                    fontVariantNumeric: 'tabular-nums',
                    color: valueColor(row[c.id]),
                    fontWeight: SERIES.some(s => s.id === c.id) && row[c.id] > row.cdi ? 700 : 400,
                  }}
                >
                  {signedPercent(row[c.id])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

const tickers = list => list.map(p => p.ticker).join(', ') || '—';

function Trades({ start, mode }) {
  return (
    <Stack spacing={1}>
      {SERIES.map(s => {
        const run = start.estrategias[s.id]?.[mode];
        if (!run) return null;
        return (
          <Accordion key={s.id} disableGutters elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 600 }}>Carteira e trocas: {s.label}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2"><strong>Carteira inicial ({formatDate(start.inicio)}):</strong> {tickers(run.carteiraInicial)}</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}><strong>Carteira hoje:</strong> {run.carteiraAtual.join(', ') || '—'}</Typography>
              {run.trocas.length > 0 && (
                <Box component="ul" sx={{ mt: 1.5, mb: 0, pl: 2.5, display: 'grid', gap: 0.5 }}>
                  {run.trocas.map(t => (
                    <li key={t.date}>
                      <Typography variant="body2">
                        <strong>{formatDate(t.date)}:</strong>{' '}
                        {t.sold.length > 0 && <>vendeu {t.sold.map(x => `${x.ticker} (${x.rank ? `${x.rank}º` : 'saiu do ranking'})`).join(', ')}</>}
                        {t.sold.length > 0 && t.bought.length > 0 && '; '}
                        {t.bought.length > 0 && <>comprou {t.bought.map(x => `${x.ticker} (${x.rank}º)`).join(', ')}</>}
                      </Typography>
                    </li>
                  ))}
                </Box>
              )}
              {run.eventos.length > 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Sem cotação (convertido em caixa no CDI): {run.eventos.map(e => `${e.ticker} em ${formatDate(e.date)}`).join(', ')}.
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Stack>
  );
}

const LIMITATIONS = [
  ['Sem olhar o futuro', 'em cada data, o ranking usa só os balanços já entregues à CVM (data de recebimento), cotações e proventos até o pregão anterior; as compras e vendas acontecem no fechamento'],
  ['Viés de sobrevivência', 'empresas que saíram da bolsa e não têm histórico no Yahoo Finance não entram nos rankings do passado, o que tende a melhorar um pouco o resultado'],
  ['Cadastro atual', 'a situação na CVM (recuperação judicial) é a de hoje, valendo a partir da data de início informada; empresas que já saíram de uma recuperação podem ter entrado no ranking quando estavam nela'],
  ['Balanços refeitos', 'quando um balanço foi reapresentado, usamos a versão final com a data de entrega da primeira'],
  ['Custos', '0,1% por compra e por venda; sem imposto de renda nem taxa de custódia. Proventos reinvestidos (preço ajustado). Dinheiro parado rende o CDI'],
  ['Rotação', 'nos primeiros pregões após 5/abr, 20/mai, 20/ago e 20/nov (depois dos prazos dos balanços), vende quem saiu do top 20 ou deixou de passar nos filtros e compra as mais bem colocadas que não estão na carteira'],
];

export default function BacktestView() {
  const { data, loading, error, retry } = useBacktest();
  const [year, setYear] = useState(null);
  const [mode, setMode] = useState(MODES.rotation.id);

  if (error) {
    return (
      <Alert severity="error" action={<Button color="inherit" startIcon={<RefreshIcon />} onClick={retry}>Tentar novamente</Button>}>
        {error}
      </Alert>
    );
  }
  if (loading || !data) {
    return (
      <Stack spacing={2}>
        <Skeleton variant="rounded" height={48} />
        <Skeleton variant="rounded" height={360} />
      </Stack>
    );
  }

  const start = data.inicios.find(s => s.ano === year) || data.inicios[0];
  const cdi = start.benchmarks.cdi;
  const ibov = start.benchmarks.ibov;

  return (
    <Stack spacing={{ xs: 3, md: 4 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} flexWrap="wrap">
        <ToggleButtonGroup exclusive size="small" value={start.ano} onChange={(e, v) => v && setYear(v)} aria-label="Início">
          {data.inicios.map(s => <ToggleButton key={s.ano} value={s.ano}>Desde {s.ano}</ToggleButton>)}
        </ToggleButtonGroup>
        <ToggleButtonGroup exclusive size="small" value={mode} onChange={(e, v) => v && setMode(v)} aria-label="Modo">
          {Object.values(MODES).map(m => <ToggleButton key={m.id} value={m.id}>{m.label}</ToggleButton>)}
        </ToggleButtonGroup>
      </Stack>

      <Typography sx={{ fontSize: 18, maxWidth: '75ch' }}>
        De {formatDate(start.inicio)} a {formatDate(start.fim)}, o CDI rendeu <strong>{signedPercent(cdi.metricas.retorno)}</strong> e
        o Ibovespa <strong>{signedPercent(ibov.metricas.retorno)}</strong>. Cada estratégia começou com as 10 primeiras do
        ranking, com o mesmo peso{mode === 'rotation' ? ', e trocou a cada trimestre quem saiu do top 20' : ', sem nenhuma troca depois'}.
      </Typography>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
        {SERIES.map(s => start.estrategias[s.id] && (
          <StrategyCard key={s.id} series={s} run={start.estrategias[s.id][mode]} cdi={cdi} />
        ))}
      </Box>

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 1.5 }}>
        <Typography variant="h2" sx={{ fontSize: 28, mb: 1 }}>Retorno acumulado</Typography>
        <EquityChart series={chartSeries(start, mode)} />
      </Paper>

      <Box>
        <Typography variant="h2" sx={{ fontSize: 28, mb: 1.5 }}>Ano a ano</Typography>
        <YearlyTable start={start} mode={mode} />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Em negrito, os anos em que a estratégia bateu o CDI.
        </Typography>
      </Box>

      <Trades start={start} mode={mode} />

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 1.5, bgcolor: tokens.paper }}>
        <Typography sx={{ fontWeight: 600, mb: 1 }}>Como o backtest foi feito e suas limitações</Typography>
        <Box component="ul" sx={{ m: 0, pl: 2.5, display: 'grid', gap: 0.75 }}>
          {LIMITATIONS.map(([title, text]) => (
            <li key={title}><Typography variant="body2"><strong>{title}:</strong> {text}.</Typography></li>
          ))}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Rentabilidade passada não garante rentabilidade futura. Calculado em {formatDate(data.updatedAt)} com dados da CVM,
          do Yahoo Finance e do Banco Central.
        </Typography>
      </Paper>
    </Stack>
  );
}
