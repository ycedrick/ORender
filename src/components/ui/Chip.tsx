import React from 'react';
import { ViewStyle, StyleSheet, Pressable, PressableProps } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Text } from './Text';
import { HStack } from './HStack';
import { IconButton } from './IconButton';
import { SymbolView } from 'expo-symbols';

export interface ChipProps extends Omit<PressableProps, 'children'> {
  /** Chip text. */
  label: string;
  /** If true, renders in selected state (filled). Defaults to false. */
  selected?: boolean;
  /** Leading icon. */
  icon?: React.ReactNode;
  /** Dismiss handler. If provided, shows an 'x' icon. */
  onDismiss?: () => void;
  /** Chip size. Defaults to 'md'. */
  size?: 'sm' | 'md';
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  icon,
  onDismiss,
  size = 'md',
  disabled = false,
  style,
  onPress,
  ...rest
}) => {
  const { theme } = useTheme();

  const sizeStyles = {
    sm: {
      height: 28,
      paddingHorizontal: theme.spacing.md,
      fontSize: 'xs' as const,
    },
    md: {
      height: 36,
      paddingHorizontal: theme.spacing.lg,
      fontSize: 'sm' as const,
    },
  }[size];

  const containerStyle: ViewStyle = {
    height: sizeStyles.height,
    paddingHorizontal: sizeStyles.paddingHorizontal,
    borderRadius: theme.borderRadius.full,
    backgroundColor: selected ? theme.colors.action.primary : theme.colors.surface.input,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
  };

  const textColor = selected ? theme.colors.text.inverse : theme.colors.text.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={(state) => [
        containerStyle,
        {
          opacity: disabled ? theme.opacity.disabled : (state.pressed ? theme.opacity.pressed : 1),
        },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}
    >
      <HStack spacing="xs" align="center">
        {icon && icon}
        <Text
          variant={sizeStyles.fontSize}
          weight="medium"
          color={textColor}
        >
          {label}
        </Text>
        {onDismiss && (
          <IconButton
            icon={
              <SymbolView
                name="xmark"
                size={12}
                tintColor={textColor}
              />
            }
            size="sm"
            onPress={onDismiss}
            style={styles.dismissButton}
          />
        )}
      </HStack>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  dismissButton: {
    marginLeft: -4,
    marginRight: -8,
    width: 20,
    height: 20,
  },
});
