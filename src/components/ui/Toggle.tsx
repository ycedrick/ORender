import React from 'react';
import { Switch, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { HStack } from './HStack';
import { Text } from './Text';

export interface ToggleProps {
  /** Current state. */
  value: boolean;
  /** Change handler. */
  onValueChange: (val: boolean) => void;
  /** Optional inline label. */
  label?: string;
  /** If true, disables interaction. Defaults to false. */
  disabled?: boolean;
  /** Additional styles for the container. */
  style?: ViewStyle;
}

export const Toggle: React.FC<ToggleProps> = ({
  value,
  onValueChange,
  label,
  disabled = false,
  style,
}) => {
  const { theme } = useTheme();

  return (
    <HStack
      spacing="md"
      align="center"
      justify="space-between"
      style={[styles.container, style]}
    >
      {label && (
        <Text
          variant="md"
          weight="medium"
          color={disabled ? theme.colors.text.disabled : theme.colors.text.primary}
        >
          {label}
        </Text>
      )}
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: theme.colors.surface.input,
          true: theme.colors.action.primary,
        }}
        thumbColor={theme.colors.text.inverse}
        ios_backgroundColor={theme.colors.surface.input}
      />
    </HStack>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
});
