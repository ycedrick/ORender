/**
 * Theme — Barrel Export
 *
 * Central entry point for the entire theme system.
 * Re-exports types, tokens, and both theme variants.
 */

// Types
export type {
  Theme,
  ThemeMode,
  ThemeColors,
  TextColors,
  ActionColors,
  SurfaceColors,
  BorderColors,
  ThemeSpacing,
  ThemeTypography,
  FontWeights,
  FontSizes,
  LineHeights,
  LetterSpacings,
  ThemeBorderRadius,
  Shadow,
  ThemeShadows,
  ThemeAnimation,
  ThemeLayout,
  ThemeOpacity,
} from './types';

// Shared tokens
export {
  spacing,
  typography,
  borderRadius,
  animation,
  layout,
  opacity,
} from './tokens';

// Theme variants
export { lightTheme } from './light';
export { darkTheme } from './dark';
