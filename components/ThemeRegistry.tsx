'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles';
import { AuthProvider } from '@/components/auth/AuthContext';

type ColorMode = 'light' | 'dark';

type ThemeModeContextValue = {
  mode: ColorMode;
  toggleMode: () => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);

function buildTheme(mode: ColorMode) {
  const isDark = mode === 'dark';

  let theme = createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#a78bfa' : '#7c3aed' // Purple
      },
      secondary: {
        main: isDark ? '#ffffff' : '#000000' // White / Black
      },
      background: {
        default: isDark ? '#080b13' : '#fcfcfe',
        paper: isDark ? '#0f172a' : 'rgba(255, 255, 255, 0.82)'
      },
      divider: isDark ? '#273449' : '#e7e9ef',
      text: {
        primary: isDark ? '#e2e8f0' : '#15162c',
        secondary: isDark ? '#94a3b8' : '#5b5f7a'
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
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.55)' : 'rgba(255, 255, 255, 0.78)',
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
      }
    }
  });

  theme = responsiveFontSizes(theme);
  return theme;
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeRegistry');
  }
  return context;
}

export function ThemeRegistry({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ColorMode>('light');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('hrms_color_mode');
    if (stored === 'dark' || stored === 'light') {
      setMode(stored);
      return;
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setMode(prefersDark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.documentElement.dataset.theme = mode;
    window.localStorage.setItem('hrms_color_mode', mode);
  }, [mode]);

  const theme = useMemo(() => buildTheme(mode), [mode]);
  const value = useMemo<ThemeModeContextValue>(
    () => ({
      mode,
      toggleMode: () => setMode((prev) => (prev === 'dark' ? 'light' : 'dark'))
    }),
    [mode]
  );

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}