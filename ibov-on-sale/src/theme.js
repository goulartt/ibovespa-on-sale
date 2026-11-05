import { createTheme } from '@mui/material/styles';

// "Encarte de oferta": quiet paper-and-ink page; the offer yellow is reserved for price tags.
export const tokens = {
  paper: '#F3F5F2',
  surface: '#FFFFFF',
  ink: '#1A2420',
  muted: '#5E6B64',
  rule: '#DDE3DE',
  market: '#0A5C45',
  offer: '#FFCE1F',
  loss: '#B3261E',
};

export const displayFont = '"Barlow Condensed", "Arial Narrow", sans-serif';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: tokens.market, contrastText: '#ffffff' },
    secondary: { main: tokens.offer, contrastText: tokens.ink },
    success: { main: tokens.market },
    error: { main: tokens.loss },
    background: { default: tokens.paper, paper: tokens.surface },
    text: { primary: tokens.ink, secondary: tokens.muted },
    divider: tokens.rule,
  },
  shape: { borderRadius: 6 },
  typography: {
    fontFamily: '"IBM Plex Sans", "Helvetica Neue", Arial, sans-serif',
    h1: { fontFamily: displayFont, fontWeight: 800, lineHeight: 0.95, letterSpacing: 0 },
    h2: { fontFamily: displayFont, fontWeight: 700, letterSpacing: 0 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiTooltip: {
      styleOverrides: {
        tooltip: { backgroundColor: tokens.ink, fontSize: 13, padding: 10 },
        arrow: { color: tokens.ink },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiLink: { defaultProps: { color: 'primary' } },
  },
});

export default theme;
