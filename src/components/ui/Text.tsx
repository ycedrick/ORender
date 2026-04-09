import React from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  TextStyle,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { FontSizes, LineHeights, LetterSpacings } from '@/theme/types';

export interface TextProps extends RNTextProps {
  /** Size variant based on theme. Defaults to 'md'. */
  variant?: keyof FontSizes;
  /** Font weight based on theme. Defaults to 'regular'. */
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  /** Text color override. Defaults to theme.colors.text.primary. */
  color?: string;
  /** Text alignment. Defaults to 'auto'. */
  align?: TextStyle['textAlign'];
  /** Line height variant based on theme. Defaults to 'normal'. */
  lineHeight?: keyof LineHeights;
  /** Letter spacing variant based on theme. Defaults to 'normal'. */
  letterSpacing?: keyof LetterSpacings;
  /** If true, uses theme.colors.text.secondary. Defaults to false. */
  dimmed?: boolean;
  /** If true, uses theme.colors.text.tertiary. Defaults to false. */
  muted?: boolean;
}

export const Text: React.FC<TextProps> = ({
  children,
  style,
  variant = 'md',
  weight = 'regular',
  color,
  align = 'auto',
  lineHeight = 'normal',
  letterSpacing = 'normal',
  dimmed = false,
  muted = false,
  ...rest
}) => {
  const { theme } = useTheme();

  let resolvedColor = color || theme.colors.text.primary;
  if (dimmed) resolvedColor = theme.colors.text.secondary;
  if (muted) resolvedColor = theme.colors.text.tertiary;

  const textStyle: TextStyle = {
    fontFamily: theme.typography.fontFamily[weight],
    fontSize: theme.typography.fontSizes[variant],
    color: resolvedColor,
    textAlign: align,
    lineHeight: theme.typography.fontSizes[variant] * theme.typography.lineHeights[lineHeight],
    letterSpacing: theme.typography.letterSpacings[letterSpacing],
  };

  return (
    <RNText style={[textStyle, style]} {...rest}>
      {children}
    </RNText>
  );
};
