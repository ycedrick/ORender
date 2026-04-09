import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable, PressableProps } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Text } from './Text';

export interface IconButtonProps extends Omit<PressableProps, 'children'> {
  /** Icon element. */
  icon: React.ReactNode;
  /** Touch target size. Defaults to 'md'. */
  size?: 'sm' | 'md' | 'lg';
  /** Visual style. Defaults to 'ghost'. */
  variant?: 'ghost' | 'filled' | 'outlined';
  /** Optional count badge shown on top-right. */
  badge?: number;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  size = 'md',
  variant = 'ghost',
  badge,
  disabled = false,
  style,
  onPress,
  ...rest
}) => {
  const { theme } = useTheme();

  const sizeStyles = {
    sm: { target: 32, icon: 16 },
    md: { target: 40, icon: 20 },
    lg: { target: 48, icon: 24 },
  }[size];

  const variantStyles = {
    ghost: {
      background: 'transparent',
      border: 'transparent',
    },
    filled: {
      background: theme.colors.surface.input,
      border: 'transparent',
    },
    outlined: {
      background: 'transparent',
      border: theme.colors.border.default,
    },
  }[variant];

  const containerStyle: ViewStyle = {
    width: sizeStyles.target,
    height: sizeStyles.target,
    borderRadius: theme.borderRadius.full,
    backgroundColor: variantStyles.background,
    borderColor: variantStyles.border,
    borderWidth: variant === 'outlined' ? 1 : 0,
    justifyContent: 'center',
    alignItems: 'center',
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={(state) => [
        containerStyle,
        {
          opacity: disabled ? theme.opacity.disabled : (state.pressed ? theme.opacity.pressed : 1),
          backgroundColor: state.pressed && variant === 'ghost' ? theme.colors.surface.pressed : variantStyles.background,
        },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}
    >
      <View>
        {icon}
        {badge !== undefined && badge > 0 && (
          <View
            style={[
              styles.badge,
              { 
                backgroundColor: theme.colors.action.danger,
                borderColor: theme.colors.background,
              },
            ]}
          >
            <Text
              variant="xxs"
              weight="bold"
              color={theme.colors.text.inverse}
              style={styles.badgeText}
            >
              {badge > 99 ? '99+' : badge}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
    borderWidth: 1.5,
  },
  badgeText: {
    fontSize: 9,
    lineHeight: 12,
  },
});
