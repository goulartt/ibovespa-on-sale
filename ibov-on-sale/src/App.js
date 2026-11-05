import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Container, CssBaseline, Link, Paper, Stack, Typography } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import theme from './theme';
import { fetchRanking } from './lib/api';
import { withDerivedFields } from './lib/fields';
import { formatDateTime } from './lib/format';
import PriceTags from './components/PriceTags';
import Summary from './components/Summary';
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

function Header({ updatedAt }) {
  return (
    <Box component="header" sx={{ pt: { xs: 5, md: 8 }, pb: { xs: 4, md: 5 } }}>
      <Typography variant="h1" sx={{ fontSize: { xs: 56, sm: 80, md: 104 } }}>
        Ibovespa em Promoção
      </Typography>
      <Typography sx={{ mt: 2, maxWidth: '62ch', fontSize: { xs: 16, md: 18 }, color: 'text.secondary' }}>
        Ações da B3 que dão lucro, têm liquidez e pagam bons dividendos, da mais barata para a mais cara
        pelo EV/EBIT.
      </Typography>
      {updatedAt && (
        <Typography variant="body2" sx={{ mt: 1.5, color: 'text.secondary' }}>
          Atualizado em {formatDateTime(updatedAt)}
        </Typography>
      )}
    </Box>
  );
}

export default function App() {
  const { stocks, updatedAt, loading, error, retry } = useRanking();
  const rows = useMemo(() => stocks.map(withDerivedFields), [stocks]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl">
        <Header updatedAt={updatedAt} />
        <Box component="main" sx={{ pb: 8 }}>
          {error ? (
            <Alert
              severity="error"
              action={<Button color="inherit" startIcon={<RefreshIcon />} onClick={retry}>Tentar novamente</Button>}
            >
              {error}
            </Alert>
          ) : (
            <Stack spacing={{ xs: 4, md: 5 }}>
              <PriceTags stocks={rows} loading={loading} />
              <Summary stocks={rows} loading={loading} />
              <Paper variant="outlined" sx={{ borderRadius: 1.5, overflow: 'hidden' }}>
                <StocksTable stocks={rows} loading={loading} />
              </Paper>
            </Stack>
          )}
          <Box sx={{ mt: 4 }}>
            <Methodology />
          </Box>
        </Box>
      </Container>
      <Box component="footer" sx={{ borderTop: 1, borderColor: 'divider', py: 3 }}>
        <Container maxWidth="xl">
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Dados da CVM e do Yahoo Finance. Conteúdo informativo, não é recomendação de investimento.
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
