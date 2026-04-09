import React from 'react';
import { StyleSheet, View, ViewStyle, ViewProps, Pressable } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { ThemeSpacing, ThemeShadows } from '@/theme/types';

export interface CardProps extends ViewProps {
  /** Card style variant. Defaults to 'elevated'. */
  variant?: 'elevated' | 'outlined' | 'filled';
  /** Inner padding using theme spacing keys. Defaults to 'lg'. */
  padding?: keyof ThemeSpacing;
  /** Makes the card pressable. */
  onPress?: () => void;
  /** If true, disables press interaction. Defaults to false. */
  disabled?: boolean;
  /** Shadow size for 'elevated' variant. Defaults to 'sm'. */
  shadow?: keyof ThemeShadows;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'elevated',
  padding = 'lg',
  onPress,
  disabled = false,
  shadow = 'sm',
  ...rest
}) => {
  const { theme } = useTheme();

  const containerStyle: ViewStyle = {
    padding: theme.spacing[padding],
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface.card,
  };

  if (variant === 'elevated') {
    Object.assign(containerStyle, theme.shadows[shadow]);
  } else if (variant === 'outlined') {
    containerStyle.borderWidth = StyleSheet.hairlineWidth;
    containerStyle.borderColor = theme.colors.border.default;
  } else if (variant === 'filled') {
    containerStyle.backgroundColor = theme.colors.surface.input;
  }

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={(state) => [
          containerStyle,
          {
            opacity: disabled ? theme.opacity.disabled : (state.pressed ? theme.opacity.pressed : 1),
          },
          typeof style === 'function' ? (style as any)(state) : style as ViewStyle,
        ]}
        {...rest}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[containerStyle, style as ViewStyle]} {...rest}>
      {children}
    </View>
  );
};
