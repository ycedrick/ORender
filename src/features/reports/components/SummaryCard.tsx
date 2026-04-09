import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, VStack } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';

interface SummaryCardProps {
  label: string;
  value: string;
}

export const SummaryCard = ({ label, value }: SummaryCardProps) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface.card, borderColor: theme.colors.border.subtle }]}>
      <VStack spacing="xs">
        <Text variant="xs" weight="semibold" color={theme.colors.text.tertiary}>{label}</Text>
        <Text variant="xl" weight="bold">{value}</Text>
      </VStack>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    minWidth: 100,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
});
