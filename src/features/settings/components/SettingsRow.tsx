import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, HStack, Text, VStack } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';

interface SettingsRowProps {
  title: string;
  subtitle?: string;
  value?: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  onPress?: () => void;
}

export const SettingsRow = ({ title, subtitle, value, iconName, onPress }: SettingsRowProps) => {
  const { theme } = useTheme();

  return (
    <Card variant="outlined" padding="md" onPress={onPress} style={styles.card}>
      <HStack justify="space-between" align="center">
        <HStack spacing="sm" align="center" style={styles.leftGroup}>
          <View style={[styles.iconWrap, { backgroundColor: theme.colors.surface.input }]}>
            <Ionicons name={iconName} size={18} color={theme.colors.text.primary} />
          </View>
          <VStack spacing="xxs" style={styles.content}>
            <Text variant="sm" weight="semibold">{title}</Text>
            {subtitle ? (
              <Text variant="xs" color={theme.colors.text.secondary}>{subtitle}</Text>
            ) : null}
          </VStack>
        </HStack>

        <HStack spacing="xs" align="center">
          {value ? (
            <Text variant="xs" color={theme.colors.text.secondary} style={styles.value}>
              {value}
            </Text>
          ) : null}
          {onPress ? (
            <Ionicons name="chevron-forward" size={16} color={theme.colors.text.tertiary} />
          ) : null}
        </HStack>
      </HStack>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
  leftGroup: {
    flex: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  value: {
    textAlign: 'right',
    maxWidth: 120,
  },
});
