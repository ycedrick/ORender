/**
 * Dark Theme
 *
 * Deep, true-black dark palette.
 * OLED-friendly #000000 backgrounds with clean white text and muted grey accents.
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
    primary: '#F5F5F5',
    secondary: '#A0A0A0',
    tertiary: '#737373',
    disabled: '#4A4A4A',
    inverse: '#000000',
  },
  action: {
    primary: '#FFFFFF',
    primaryPressed: '#D4D4D4',
    danger: '#FF453A',
    dangerPressed: '#CC372E',
    success: '#30D158',
    warning: '#FF9F0A',
  },
  surface: {
    background: '#000000',
    card: '#1C1C1E',
    elevated: '#2C2C2E',
    input: '#1C1C1E',
    pressed: 'rgba(255, 255, 255, 0.08)',
  },
  border: {
    default: '#2C2C2E',
    subtle: '#1C1C1E',
    focused: '#FFFFFF',
  },

  // Convenience aliases
  background: '#000000',
  primary: '#FFFFFF',
  error: '#FF453A',
  success: '#30D158',
  warning: '#FF9F0A',
  separator: '#2C2C2E',
  icon: '#F5F5F5',
  iconSecondary: '#A0A0A0',
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
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
};

// ─── Assembled Theme ─────────────────────────────────────────────────────────

export const darkTheme: Theme = {
  mode: 'dark',
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  animation,
  layout,
  opacity,
};
