import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import App from './App';

// Создаем тему (аналог ResourceDictionary в WPF)
// Можно вынести в отдельный файл src/theme.ts
const theme = createTheme({
  palette: {
    mode: 'light', // Или 'dark'
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f4f5f7', // Цвет фона как в Trello/Jira
    }
  },
  typography: {
    fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      {/* CssBaseline: нормализация стилей (reset.css) */}
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
