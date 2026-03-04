import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from 'react-oidc-context';
import App from './App';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f4f5f7',
    }
  },
  typography: {
    fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
  }
});

const telegramOidcConfig = {
    authority: 'https://oauth.telegram.org',
    client_id: '8423941037',           // числовой Bot ID из BotFather
    client_secret: 'AAFkZqTd6OK87_Q9xJnfyYZldBQlV2EvP68',     // Client Secret из BotFather
    redirect_uri: `${window.location.origin}/auth/callback`,
    response_type: 'code',
    scope: 'openid profile',          // phone — только если реально нужен
    loadUserInfo: false,
    automaticSilentRenew: false,
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider {...telegramOidcConfig}>  {/* ← добавлено */}
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
