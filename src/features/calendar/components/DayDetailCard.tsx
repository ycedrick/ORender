import React from 'react';
import { StyleSheet, View } from 'react-native';
import { HStack, Text } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';

interface DayDetailCardProps {
  entriesCount: number;
  logsCount: number;
  totalHours: number;
}

export const DayDetailCard = ({ entriesCount, logsCount, totalHours }: DayDetailCardProps) => {
  const { theme } = useTheme();

  return (
    <HStack spacing="sm" wrap>
      <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface.card, borderColor: theme.colors.border.subtle }]}>
        <Text variant="xs" color={theme.colors.text.tertiary}>Entries</Text>
        <Text variant="lg" weight="bold">{entriesCount}</Text>
      </View>
      <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface.card, borderColor: theme.colors.border.subtle }]}>
        <Text variant="xs" color={theme.colors.text.tertiary}>Logs</Text>
        <Text variant="lg" weight="bold">{logsCount}</Text>
      </View>
      <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface.card, borderColor: theme.colors.border.subtle }]}>
        <Text variant="xs" color={theme.colors.text.tertiary}>Hours</Text>
        <Text variant="lg" weight="bold">{totalHours.toFixed(2)}</Text>
      </View>
    </HStack>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    flexGrow: 1,
    minWidth: 100,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
});
