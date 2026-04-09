/**
 * Light Theme
 *
 * Clean, minimal, high-contrast light palette.
 * Predominantly white backgrounds with jet-black text and subtle grey accents.
 */

import {
  animation,
  borderRadius,
  layout,
  opacity,
  spacing,
  typography,
} from './tokens';
import type { Theme, ThemeColors, ThemeShadows } from './types';

// ─── Colors ──────────────────────────────────────────────────────────────────

const colors: ThemeColors = {
  text: {
    primary: '#000000',
    secondary: '#737373',
    tertiary: '#999999',
    disabled: '#C7C7CC',
    inverse: '#FFFFFF',
  },
  action: {
    primary: '#000000',
    primaryPressed: '#262626',
    danger: '#FF3B30',
    dangerPressed: '#CC2F26',
    success: '#34C759',
    warning: '#FF9500',
  },
  surface: {
    background: '#FFFFFF',
    card: '#FFFFFF',
    elevated: '#FFFFFF',
    input: '#F5F5F5',
    pressed: 'rgba(0, 0, 0, 0.05)',
  },
  border: {
    default: '#E5E5E5',
    subtle: '#F0F0F0',
    focused: '#000000',
  },

  // Convenience aliases
  background: '#FFFFFF',
  primary: '#000000',
  error: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
  separator: '#E5E5E5',
  icon: '#000000',
  iconSecondary: '#737373',
};

// ─── Shadows ─────────────────────────────────────────────────────────────────

const shadows: ThemeShadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
};

// ─── Assembled Theme ─────────────────────────────────────────────────────────

export const lightTheme: Theme = {
  mode: 'light',
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  animation,
  layout,
  opacity,
};
