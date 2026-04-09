import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { ThemeSpacing } from '@/theme/types';

export interface DividerProps extends ViewProps {
  /** Line direction. Defaults to 'horizontal'. */
  direction?: 'horizontal' | 'vertical';
  /** Line color override. Defaults to theme.colors.separator. */
  color?: string;
  /** Line thickness. Defaults to StyleSheet.hairlineWidth. */
  thickness?: number;
  /** Margin above/below (horizontal) or left/right (vertical) using theme spacing keys. Defaults to 'md'. */
  spacing?: keyof ThemeSpacing;
  /** Left inset (for list separators). Defaults to 0. */
  inset?: number;
}

export const Divider: React.FC<DividerProps> = ({
  direction = 'horizontal',
  color,
  thickness = StyleSheet.hairlineWidth,
  spacing = 'md',
  inset = 0,
  style,
  ...rest
}) => {
  const { theme } = useTheme();

  const isHorizontal = direction === 'horizontal';
  const resolvedColor = color || theme.colors.separator;
  const marginValue = theme.spacing[spacing];

  return (
    <View
      style={[
        {
          backgroundColor: resolvedColor,
          width: isHorizontal ? '100%' : thickness,
          height: isHorizontal ? thickness : '100%',
          marginLeft: isHorizontal ? inset : marginValue,
          marginRight: isHorizontal ? 0 : marginValue,
          marginTop: isHorizontal ? marginValue : 0,
          marginBottom: isHorizontal ? marginValue : 0,
        },
        style,
      ]}
      {...rest}
    />
  );
};
