import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Container, CssBaseline, Link, Paper, Stack, Tab, Tabs, Typography } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import theme from './theme';
import { fetchRanking, SORTS } from './lib/api';
import { withDerivedFields } from './lib/fields';
import { formatDateTime } from './lib/format';
import PriceTags from './components/PriceTags';
import Summary from './components/Summary';
import StocksTable from './components/StocksTable';
import Methodology from './components/Methodology';
import SortSelector from './components/SortSelector';
import SectorFilter, { ALL_SECTORS, filterBySector } from './components/SectorFilter';
import BacktestView from './components/BacktestView';
import ValuationAssumptions from './components/ValuationAssumptions';
import { BACKTEST_VIEW, STRATEGIES, viewFromHash } from './lib/strategies';

const VIEWS = { ...STRATEGIES, [BACKTEST_VIEW.id]: BACKTEST_VIEW };

function useRanking(strategy, sort) {
  const [state, setState] = useState({ stocks: [], updatedAt: null, loading: true, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState(s => ({ ...s, loading: true, error: null }));
    fetchRanking({ strategy, sort, signal: controller.signal })
      .then(({ stocks, updatedAt }) => setState({ stocks, updatedAt, loading: false, error: null }))
      .catch(error => {
        if (error.name !== 'AbortError') setState(s => ({ ...s, loading: false, error: error.message }));
      });
    return () => controller.abort();
  }, [strategy, sort, attempt]);

  const retry = useCallback(() => setAttempt(a => a + 1), []);
  return { ...state, retry };
}

// Selected strategy (or the backtest) lives in the URL hash (#qualidade) so a link opens the same view.
function useView() {
  const [id, setId] = useState(() => viewFromHash(window.location.hash));
  useEffect(() => {
    const onHashChange = () => setId(viewFromHash(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  const select = useCallback(next => {
    window.history.replaceState(null, '', `#${next}`);
    setId(next);
  }, []);
  return [VIEWS[id], select];
}

function Header({ updatedAt, view, onViewChange }) {
  return (
    <Box component="header" sx={{ pt: { xs: 5, md: 8 }, pb: { xs: 4, md: 5 } }}>
      <Typography variant="h1" sx={{ fontSize: { xs: 56, sm: 80, md: 104 } }}>
        Ibovespa em Promoção
      </Typography>
      <Typography sx={{ mt: 2, maxWidth: '62ch', fontSize: { xs: 16, md: 18 }, color: 'text.secondary' }}>
        {view.lede}
      </Typography>
      <Tabs
        value={view.id}
        onChange={(event, next) => onViewChange(next)}
        aria-label="Estratégia"
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ mt: 3, borderBottom: 1, borderColor: 'divider', '& .MuiTab-root': { fontSize: 16, fontWeight: 600, px: 0, mr: 4, minWidth: 0 } }}
      >
        {Object.values(VIEWS).map(s => <Tab key={s.id} value={s.id} label={s.label} />)}
      </Tabs>
      {updatedAt && (
        <Typography variant="body2" sx={{ mt: 1.5, color: 'text.secondary' }}>
          Atualizado em {formatDateTime(updatedAt)}
        </Typography>
      )}
    </Box>
  );
}

function RankingView({ strategy, sort, onSortChange: setSort, onUpdatedAt }) {
  const [sector, setSector] = useState(ALL_SECTORS);
  const { stocks, updatedAt, loading, error, retry } = useRanking(strategy.id, sort);
  const allRows = useMemo(() => stocks.map(withDerivedFields), [stocks]);
  const rows = useMemo(() => filterBySector(allRows, sector), [allRows, sector]);
  useEffect(() => { onUpdatedAt(updatedAt); }, [updatedAt, onUpdatedAt]);

  return (
    <>
      {error ? (
        <Alert
          severity="error"
          action={<Button color="inherit" startIcon={<RefreshIcon />} onClick={retry}>Tentar novamente</Button>}
        >
          {error}
        </Alert>
      ) : (
        <Stack spacing={{ xs: 4, md: 5 }}>
          <Stack spacing={2}>
            {!strategy.hideSort && <SortSelector value={sort} onChange={setSort} disabled={loading} />}
            {strategy.showAssumptions && <ValuationAssumptions />}
            {!loading && <SectorFilter stocks={allRows} value={sector} onChange={setSector} />}
          </Stack>
          {!loading && rows.length === 0 ? (
            <Alert severity="info">
              Nenhuma ação passou em todos os filtros hoje. Veja os critérios logo abaixo.
            </Alert>
          ) : (
            <>
              <PriceTags stocks={rows} loading={loading} sector={sector} strategy={strategy} />
              <Summary stocks={rows} loading={loading} sector={sector} strategy={strategy} />
              <Paper variant="outlined" sx={{ borderRadius: 1.5, overflow: 'hidden' }}>
                <StocksTable
                  key={strategy.id}
                  stocks={rows}
                  loading={loading}
                  hiddenColumns={strategy.hiddenColumns}
                  visibleColumns={strategy.visibleColumns}
                  columnLabels={strategy.columnLabels}
                />
              </Paper>
            </>
          )}
        </Stack>
      )}
      <Box sx={{ mt: 4 }}>
        <Methodology strategy={strategy} />
      </Box>
    </>
  );
}

export default function App() {
  const [view, setView] = useView();
  const [updatedAt, setUpdatedAt] = useState(null);
  const [sort, setSort] = useState(SORTS.evEbit);
  const isBacktest = view.id === BACKTEST_VIEW.id;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl">
        <Header updatedAt={isBacktest ? null : updatedAt} view={view} onViewChange={setView} />
        <Box component="main" sx={{ pb: 8 }}>
          {isBacktest
            ? <BacktestView />
            : <RankingView key={view.id} strategy={view} sort={sort} onSortChange={setSort} onUpdatedAt={setUpdatedAt} />}
        </Box>
      </Container>
      <Box component="footer" sx={{ borderTop: 1, borderColor: 'divider', py: 3 }}>
        <Container maxWidth="xl">
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Dados da CVM, do Yahoo Finance e do Banco Central. Conteúdo informativo, não é recomendação de investimento.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Feito por{' '}
              <Link href="https://github.com/goulartt" target="_blank" rel="noopener" underline="hover">João Goulart</Link>
            </Typography>
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
