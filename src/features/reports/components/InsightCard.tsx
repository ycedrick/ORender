import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, VStack } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';

interface InsightCardProps {
  label: string;
  value: string;
  helper: string;
}

export const InsightCard = ({ label, value, helper }: InsightCardProps) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface.card, borderColor: theme.colors.border.subtle }]}>
      <VStack spacing="xs">
        <Text variant="xs" weight="semibold" color={theme.colors.text.tertiary}>{label}</Text>
        <Text variant="xl" weight="bold">{value}</Text>
        <Text variant="xs" color={theme.colors.text.secondary}>{helper}</Text>
      </VStack>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
});
