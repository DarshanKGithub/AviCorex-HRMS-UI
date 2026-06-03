'use client';

import { type ReactNode } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles';
import { AuthProvider } from '@/components/auth/AuthContext';

function buildTheme() {
  let theme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#7c3aed' // Purple
      },
      secondary: {
        main: '#000000' // Black
      },
      background: {
        default: '#f4f6fc',
        paper: '#ffffff'
      },
      divider: '#e7e9ef',
      text: {
        primary: '#1e293b',
        secondary: '#64748b'
      }
    },
    shape: {
      borderRadius: 16
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
            paddingBottom: 12,
            '@media (max-width:600px)': {
              paddingTop: 8,
              paddingBottom: 8,
              paddingLeft: 10,
              paddingRight: 10,
              fontSize: '0.9rem'
            }
          }
        }
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            backgroundColor: 'rgba(255, 255, 255, 0.78)',
            borderRadius: 14,
            '@media (max-width:600px)': {
              borderRadius: 12
            }
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none'
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: '0 4px 24px rgba(0,0,0,0.02)',
            border: 'none'
          }
        }
      }
    }
  });

  theme = responsiveFontSizes(theme);
  return theme;
}

export function ThemeRegistry({ children }: { children: ReactNode }) {
  const theme = buildTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}