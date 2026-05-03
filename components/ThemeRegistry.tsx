'use client';

import type { ReactNode } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AuthProvider } from '@/components/auth/AuthContext';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#928ddd'
    },
    secondary: {
      main: '#b2aef2'
    },
    background: {
      default: '#fcfcfe',
      paper: 'rgba(255, 255, 255, 0.82)'
    },
    divider: '#e7e9ef',
    text: {
      primary: '#15162c',
      secondary: '#5b5f7a'
    }
  },
  shape: {
    borderRadius: 18
  },
  typography: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 700
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          paddingTop: 12,
          paddingBottom: 12
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.78)',
          borderRadius: 14
        }
      }
    }
  }
});

export function ThemeRegistry({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}