import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0f2a4a', light: '#1d4a7a', dark: '#081a30', contrastText: '#ffffff' },
    secondary: { main: '#c9a227', contrastText: '#1b1400' },
    success: { main: '#11865b' },
    error: { main: '#c62f3d' },
    background: { default: '#f4f6f9', paper: '#ffffff' },
    text: { primary: '#14202e', secondary: '#5b6878' },
    divider: '#e3e8ef',
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 800, letterSpacing: -0.5 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiTooltip: {
      styleOverrides: {
        tooltip: { backgroundColor: '#0f2a4a', fontSize: 13, padding: 10, boxShadow: '0 8px 24px rgba(8, 26, 48, 0.25)' },
        arrow: { color: '#0f2a4a' },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
  },
});

export default theme;
