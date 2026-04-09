import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  Pressable,
  PressableProps,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Text } from './Text';
import { HStack } from './HStack';
import { FontSizes } from '@/theme/types';

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  /** Button label. */
  title: string;
  /** Visual style. Defaults to 'filled'. */
  variant?: 'filled' | 'outlined' | 'ghost' | 'danger';
  /** Button size. Defaults to 'md'. */
  size?: 'sm' | 'md' | 'lg';
  /** If true, shows a loading spinner and disables interaction. Defaults to false. */
  loading?: boolean;
  /** Leading or trailing icon. */
  icon?: React.ReactNode;
  /** Icon placement. Defaults to 'left'. */
  iconPosition?: 'left' | 'right';
  /** If true, stretches to container width. Defaults to false. */
  fullWidth?: boolean;
  /** If true, adds a subtle outer ring/border for that minimalist aesthetic. Defaults to false. */
  ring?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'filled',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  ring = false,
  style,
  onPress,
  ...rest
}) => {
  const { theme } = useTheme();

  // Memoize theme-dependent styles
  const themeStyles = useMemo(() => {
    const variants = {
      filled: {
        background: theme.colors.action.primary,
        text: theme.colors.text.inverse,
        border: 'transparent',
      },
      outlined: {
        background: 'transparent',
        text: theme.colors.action.primary,
        border: theme.colors.border.default,
      },
      ghost: {
        background: 'transparent',
        text: theme.colors.action.primary,
        border: 'transparent',
      },
      danger: {
        background: theme.colors.action.danger,
        text: theme.colors.text.inverse,
        border: 'transparent',
      },
    };

    const sizes = {
      sm: {
        height: 36,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.borderRadius.sm,
        fontSize: 'sm' as keyof FontSizes,
      },
      md: {
        height: 48,
        paddingHorizontal: theme.spacing.xl,
        borderRadius: theme.borderRadius.md,
        fontSize: 'md' as keyof FontSizes,
      },
      lg: {
        height: 56,
        paddingHorizontal: theme.spacing.xxl,
        borderRadius: theme.borderRadius.lg,
        fontSize: 'lg' as keyof FontSizes,
      },
    };

    return { variant: variants[variant], size: sizes[size] };
  }, [theme, variant, size]);

  const buttonContent = (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={(state) => [
        styles.base,
        {
          backgroundColor: themeStyles.variant.background,
          borderColor: themeStyles.variant.border,
          borderWidth: variant === 'outlined' ? 1 : 0,
          height: themeStyles.size.height,
          paddingHorizontal: themeStyles.size.paddingHorizontal,
          borderRadius: themeStyles.size.borderRadius,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          opacity: disabled || loading ? theme.opacity.disabled : (state.pressed ? theme.opacity.pressed : 1),
        },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}
    >
      <HStack spacing="sm" align="center" justify="center" fill={fullWidth}>
        {loading ? (
          <ActivityIndicator size="small" color={themeStyles.variant.text} />
        ) : (
          <>
            {icon && iconPosition === 'left' && icon}
            <Text
              variant={themeStyles.size.fontSize}
              weight="semibold"
              color={themeStyles.variant.text}
            >
              {title}
            </Text>
            {icon && iconPosition === 'right' && icon}
          </>
        )}
      </HStack>
    </Pressable>
  );

  if (ring) {
    return (
      <View 
        style={[
          styles.ring, 
          { 
            borderColor: theme.colors.border.subtle,
            borderRadius: themeStyles.size.borderRadius + 6,
            alignSelf: fullWidth ? 'stretch' : 'flex-start',
          }
        ]}
      >
        {buttonContent}
      </View>
    );
  }

  return buttonContent;
};

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  ring: {
    padding: 6,
    borderWidth: 1.5,
  },
});
