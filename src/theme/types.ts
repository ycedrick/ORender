/**
 * Theme Type Definitions
 *
 * Comprehensive type system for the design language.
 * Supports light and dark color schemes with full token coverage.
 */

// ─── Color Scheme ────────────────────────────────────────────────────────────

export type ThemeMode = 'light' | 'dark';

export interface TextColors {
  /** Primary text — highest contrast */
  primary: string;
  /** Secondary text — labels, captions */
  secondary: string;
  /** Tertiary text — placeholders, hints */
  tertiary: string;
  /** Disabled / muted text */
  disabled: string;
  /** Inverse text — for use on accent backgrounds */
  inverse: string;
}

export interface ActionColors {
  /** Primary interactive color (links, active icons) */
  primary: string;
  /** Pressed / active state of primary */
  primaryPressed: string;
  /** Destructive actions */
  danger: string;
  /** Danger pressed state */
  dangerPressed: string;
  /** Success indicators */
  success: string;
  /** Warning indicators */
  warning: string;
}

export interface SurfaceColors {
  /** Root app background */
  background: string;
  /** Elevated card / sheet surface */
  card: string;
  /** Higher elevation surface (modals, popovers) */
  elevated: string;
  /** Input field background */
  input: string;
  /** Pressed / highlight overlay */
  pressed: string;
}

export interface BorderColors {
  /** Default border / separator */
  default: string;
  /** Subtle border — lighter than default */
  subtle: string;
  /** Focused input border */
  focused: string;
}

export interface ThemeColors {
  text: TextColors;
  action: ActionColors;
  surface: SurfaceColors;
  border: BorderColors;

  // Convenience aliases
  /** Alias for surface.background */
  background: string;
  /** Alias for action.primary */
  primary: string;
  /** Alias for action.danger */
  error: string;
  /** Alias for action.success */
  success: string;
  /** Alias for action.warning */
  warning: string;
  /** Alias for border.default */
  separator: string;
  /** Icon default color */
  icon: string;
  /** Icon secondary color */
  iconSecondary: string;
}

// ─── Spacing ─────────────────────────────────────────────────────────────────

export interface ThemeSpacing {
  /** 2px */
  xxs: number;
  /** 4px */
  xs: number;
  /** 8px */
  sm: number;
  /** 12px */
  md: number;
  /** 16px */
  lg: number;
  /** 24px */
  xl: number;
  /** 32px */
  xxl: number;
  /** 48px */
  xxxl: number;
}

// ─── Typography ──────────────────────────────────────────────────────────────

export interface FontWeights {
  regular: '400';
  medium: '500';
  semibold: '600';
  bold: '700';
  extrabold: '800';
}

export interface FontSizes {
  /** 11px — fine print */
  xxs: number;
  /** 12px — caption */
  xs: number;
  /** 14px — body small */
  sm: number;
  /** 16px — body */
  md: number;
  /** 18px — subtitle */
  lg: number;
  /** 20px — title */
  xl: number;
  /** 24px — heading */
  xxl: number;
  /** 30px — display */
  xxxl: number;
  /** 36px — hero */
  display: number;
}

export interface LineHeights {
  tight: number;
  normal: number;
  relaxed: number;
}

export interface LetterSpacings {
  tight: number;
  normal: number;
  wide: number;
}

export interface ThemeTypography {
  fontFamily: {
    regular: string;
    medium: string;
    semibold: string;
    bold: string;
  };
  fontSizes: FontSizes;
  lineHeights: LineHeights;
  letterSpacings: LetterSpacings;
}

// ─── Border Radius ───────────────────────────────────────────────────────────

export interface ThemeBorderRadius {
  /** 0px */
  none: number;
  /** 4px */
  xs: number;
  /** 8px */
  sm: number;
  /** 12px */
  md: number;
  /** 16px */
  lg: number;
  /** 20px */
  xl: number;
  /** 24px */
  xxl: number;
  /** 9999px — pill */
  full: number;
}

// ─── Shadows ─────────────────────────────────────────────────────────────────

export interface Shadow {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export interface ThemeShadows {
  none: Shadow;
  sm: Shadow;
  md: Shadow;
  lg: Shadow;
}

// ─── Animation ───────────────────────────────────────────────────────────────

export interface ThemeAnimation {
  /** Fast micro-interaction (100ms) */
  fast: number;
  /** Normal transition (200ms) */
  normal: number;
  /** Slow, deliberate transition (350ms) */
  slow: number;
  /** Spring-like entrance (500ms) */
  spring: number;
}

// ─── Layout ──────────────────────────────────────────────────────────────────

export interface ThemeLayout {
  /** Standard horizontal screen padding */
  screenPaddingHorizontal: number;
  /** Standard vertical screen padding */
  screenPaddingVertical: number;
  /** Max content width for tablets */
  maxContentWidth: number;
  /** Standard header height */
  headerHeight: number;
  /** Standard bottom tab bar height */
  tabBarHeight: number;
}

// ─── Opacity ─────────────────────────────────────────────────────────────────

export interface ThemeOpacity {
  disabled: number;
  pressed: number;
  overlay: number;
}

// ─── Root Theme ──────────────────────────────────────────────────────────────

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
  animation: ThemeAnimation;
  layout: ThemeLayout;
  opacity: ThemeOpacity;
}
