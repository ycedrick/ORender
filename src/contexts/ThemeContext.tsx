import React, { createContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme } from '@/theme/light';
import { darkTheme } from '@/theme/dark';
import type { Theme, ThemeMode } from '@/theme/types';

// ─── Context Shape ───────────────────────────────────────────────────────────

export interface ThemeContextState {
  /** The currently resolved theme object */
  theme: Theme;
  /** The active mode ('light' | 'dark') */
  mode: ThemeMode;
  /** Whether the theme is following system preference */
  isSystemDefault: boolean;
}

export interface ThemeContextType extends ThemeContextState {
  /** Explicitly set the theme mode */
  setMode: (mode: ThemeMode) => void;
  /** Toggle between light and dark */
  toggleMode: () => void;
  /** Follow the device system color scheme */
  useSystemDefault: () => void;
  /** Whether the current theme is dark */
  isDark: boolean;
}

// ─── Context ─────────────────────────────────────────────────────────────────

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

interface ThemeProviderProps {
  /** Override the initial mode (defaults to system) */
  initialMode?: ThemeMode;
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  initialMode,
  children,
}) => {
  const systemColorScheme = useColorScheme();

  const [isSystemDefault, setIsSystemDefault] = useState(!initialMode);
  const [mode, setModeState] = useState<ThemeMode>(
    initialMode ?? (systemColorScheme === 'dark' ? 'dark' : 'light'),
  );

  // Sync with system changes when following system preference
  useEffect(() => {
    if (isSystemDefault && systemColorScheme) {
      setModeState(systemColorScheme === 'dark' ? 'dark' : 'light');
    }
  }, [isSystemDefault, systemColorScheme]);

  const theme = mode === 'dark' ? darkTheme : lightTheme;
  const isDark = mode === 'dark';

  const setMode = useCallback((newMode: ThemeMode) => {
    setIsSystemDefault(false);
    setModeState(newMode);
  }, []);

  const toggleMode = useCallback(() => {
    setIsSystemDefault(false);
    setModeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const useSystemDefault = useCallback(() => {
    setIsSystemDefault(true);
    if (systemColorScheme) {
      setModeState(systemColorScheme === 'dark' ? 'dark' : 'light');
    }
  }, [systemColorScheme]);

  const value: ThemeContextType = {
    theme,
    mode,
    isDark,
    isSystemDefault,
    setMode,
    toggleMode,
    useSystemDefault,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
