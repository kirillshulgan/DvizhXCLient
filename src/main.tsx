import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from 'react-oidc-context';
import { WebStorageStateStore } from 'oidc-client-ts';
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
    // Убрать: authority: 'https://oauth.telegram.org',
    
    // Указываем endpoints вручную, чтобы не делать discovery запрос из браузера:
    metadata: {
        issuer: 'https://oauth.telegram.org',
        authorization_endpoint: 'https://oauth.telegram.org/auth',
        token_endpoint: 'https://oauth.telegram.org/token',
        jwks_uri: 'https://oauth.telegram.org/.well-known/jwks.json',
    },

    client_id: '8423941037',
    client_secret: 'AAFkZqTd6OK87_Q9xJnfyYZldBQlV2EvP68',
    redirect_uri: `${window.location.origin}/auth/callback`,
    response_type: 'code',
    scope: 'openid profile',
    loadUserInfo: false,
    automaticSilentRenew: false,

    // Хранить состояние OIDC в sessionStorage (безопаснее для PKCE state/nonce)
    userStore: new WebStorageStateStore({ store: window.sessionStorage }),
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
