import { useMemo, type ReactNode } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider, type Theme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { useUIStore } from '@/store/uiStore';

/**
 * Tema do MUI alinhado aos tokens do design system (global.css).
 *
 * O app usa Tailwind com dark mode por classe (.dark no <html>). Aqui lemos o
 * mesmo estado (uiStore.darkMode) para construir o tema MUI correspondente,
 * garantindo que componentes MUI (ex.: DatePicker) fiquem visualmente
 * consistentes com o resto da interface em ambos os modos.
 *
 * As cores espelham os tokens semânticos -- não são hardcoded arbitrárias.
 */

const PALETTE = {
  primary: '#2563eb', // --color-primary-600 (--color-primary)
  primaryHover: '#1d4ed8', // --color-primary-700
  error: '#ef4444', // --color-error
  warning: '#f59e0b', // --color-warning
  success: '#22c55e', // --color-success
  info: '#3b82f6', // --color-info
};

function buildTheme(darkMode: boolean): Theme {
  const surface = darkMode ? '#111827' : '#ffffff'; // neutral-900 / neutral-0
  const background = darkMode ? '#030712' : '#f9fafb'; // neutral-950 / neutral-50
  const border = darkMode ? '#1f2937' : '#e5e7eb'; // neutral-800 / neutral-200
  const textMain = darkMode ? '#f3f4f6' : '#111827'; // neutral-100 / neutral-900
  const textMuted = darkMode ? '#9ca3af' : '#6b7280'; // neutral-400 / neutral-500

  return createTheme({
    cssVariables: false,
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: PALETTE.primary, dark: PALETTE.primaryHover },
      error: { main: PALETTE.error },
      warning: { main: PALETTE.warning },
      success: { main: PALETTE.success },
      info: { main: PALETTE.info },
      background: { default: background, paper: surface },
      text: { primary: textMain, secondary: textMuted },
      divider: border,
    },
    shape: { borderRadius: 10 }, // --radius-lg = 0.625rem
    typography: {
      fontFamily:
        "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          // Deixa o body sob controle do global.css (Tailwind) — não sobrescrever.
          body: {
            backgroundColor: 'unset',
            color: 'unset',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: surface,
            backgroundImage: 'none',
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: surface,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: border },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: border },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: PALETTE.primary,
              borderWidth: 2,
            },
          },
        },
      },
    },
  });
}

export function AppMuiThemeProvider({ children }: { children: ReactNode }) {
  const darkMode = useUIStore((s) => s.darkMode);
  const theme = useMemo(() => buildTheme(darkMode), [darkMode]);
  return (
    <MuiThemeProvider theme={theme}>
      {/* CssBaseline aplica o reset do MUI, mas mantemos o body/color controlados
          pelo global.css do Tailwind via background-color/color herdados. */}
      <CssBaseline enableColorScheme={false} />
      {children}
    </MuiThemeProvider>
  );
}
