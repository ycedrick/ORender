/**
 * Shared Design Tokens
 *
 * Mode-agnostic values shared between light and dark themes.
 */

import type {
  ThemeAnimation,
  ThemeBorderRadius,
  ThemeLayout,
  ThemeOpacity,
  ThemeSpacing,
  ThemeTypography,
} from './types';

// ─── Spacing ─────────────────────────────────────────────────────────────────

export const spacing: ThemeSpacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

// ─── Typography ──────────────────────────────────────────────────────────────

export const typography: ThemeTypography = {
  fontFamily: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
  fontSizes: {
    xxs: 11,
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    display: 36,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  letterSpacings: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
};

// ─── Border Radius ───────────────────────────────────────────────────────────

export const borderRadius: ThemeBorderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

// ─── Animation Durations (ms) ────────────────────────────────────────────────

export const animation: ThemeAnimation = {
  fast: 100,
  normal: 200,
  slow: 350,
  spring: 500,
};

// ─── Layout ──────────────────────────────────────────────────────────────────

export const layout: ThemeLayout = {
  screenPaddingHorizontal: 16,
  screenPaddingVertical: 16,
  maxContentWidth: 600,
  headerHeight: 56,
  tabBarHeight: 60,
};

// ─── Opacity ─────────────────────────────────────────────────────────────────

export const opacity: ThemeOpacity = {
  disabled: 0.38,
  pressed: 0.12,
  overlay: 0.5,
};
