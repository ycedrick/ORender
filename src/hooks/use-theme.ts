import { useContext } from 'react';
import { ThemeContext, ThemeContextType } from '@/contexts/ThemeContext';

/**
 * Custom hook to consume the ThemeContext.
 * Must be used within a ThemeProvider.
 *
 * @returns The current theme, mode, and theme-management functions.
 *
 * @example
 * ```tsx
 * const { theme, isDark, toggleMode } = useTheme();
 *
 * <View style={{ backgroundColor: theme.colors.surface.background }}>
 *   <Text style={{ color: theme.colors.text.primary }}>Hello</Text>
 * </View>
 * ```
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
