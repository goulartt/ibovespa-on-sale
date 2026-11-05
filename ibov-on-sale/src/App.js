import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Chip, Container, CssBaseline, Link, Paper, Stack, Typography } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import UpdateIcon from '@mui/icons-material/Update';
import theme from './theme';
import { fetchRanking } from './lib/api';
import { withDerivedFields } from './lib/fields';
import { formatDateTime } from './lib/format';
import SummaryCards from './components/SummaryCards';
import StocksTable from './components/StocksTable';
import Methodology from './components/Methodology';

function useRanking() {
  const [state, setState] = useState({ stocks: [], updatedAt: null, loading: true, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState(s => ({ ...s, loading: true, error: null }));
    fetchRanking({ signal: controller.signal })
      .then(({ stocks, updatedAt }) => setState({ stocks, updatedAt, loading: false, error: null }))
      .catch(error => {
        if (error.name !== 'AbortError') setState(s => ({ ...s, loading: false, error: error.message }));
      });
    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => setAttempt(a => a + 1), []);
  return { ...state, retry };
}

function Hero({ updatedAt }) {
  return (
    <Box
      component="header"
      sx={{
        color: 'primary.contrastText',
        background: 'linear-gradient(135deg, #081a30 0%, #0f2a4a 55%, #1d4a7a 100%)',
        pt: { xs: 5, md: 7 },
        pb: { xs: 10, md: 12 },
      }}
    >
      <Container maxWidth="xl">
        <Chip
          label="Ações da B3"
          size="small"
          sx={{ bgcolor: 'rgba(201, 162, 39, 0.18)', color: 'secondary.main', fontWeight: 700, mb: 2 }}
        />
        <Typography variant="h1" sx={{ fontSize: { xs: 32, md: 44 } }}>
          Ibovespa em Promoção
        </Typography>
        <Typography sx={{ mt: 1.5, maxWidth: 680, opacity: 0.85, fontSize: { xs: 15, md: 17 } }}>
          Empresas lucrativas, líquidas e pagadoras de dividendos, ordenadas das mais baratas para as
          mais caras pelo EV/EBIT.
        </Typography>
        {updatedAt && (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 3, opacity: 0.8 }}>
            <UpdateIcon fontSize="small" />
            <Typography variant="body2">Dados atualizados em {formatDateTime(updatedAt)}</Typography>
          </Stack>
        )}
      </Container>
    </Box>
  );
}

export default function App() {
  const { stocks, updatedAt, loading, error, retry } = useRanking();
  const rows = useMemo(() => stocks.map(withDerivedFields), [stocks]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Hero updatedAt={updatedAt} />
      <Container maxWidth="xl" component="main" sx={{ mt: { xs: -7, md: -8 }, pb: 6 }}>
        <Stack spacing={3}>
          {error ? (
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Alert
                severity="error"
                action={<Button color="inherit" startIcon={<RefreshIcon />} onClick={retry}>Tentar novamente</Button>}
              >
                {error}
              </Alert>
            </Paper>
          ) : (
            <>
              <SummaryCards stocks={rows} loading={loading} />
              <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 10px 30px rgba(15, 42, 74, 0.08)' }}>
                <StocksTable stocks={rows} loading={loading} />
              </Paper>
            </>
          )}
          <Methodology />
        </Stack>
      </Container>
      <Box component="footer" sx={{ borderTop: 1, borderColor: 'divider', py: 3, bgcolor: 'background.paper' }}>
        <Container maxWidth="xl">
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Dados: CVM (dados abertos) e Yahoo Finance. Conteúdo informativo, não é recomendação de investimento.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Powered by{' '}
              <Link href="https://github.com/goulartt" target="_blank" rel="noopener" underline="hover">João Goulart</Link>
            </Typography>
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
