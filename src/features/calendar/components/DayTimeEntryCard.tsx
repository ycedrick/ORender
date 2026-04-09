import React from 'react';
import { StyleSheet, View } from 'react-native';
import { HStack, Text, VStack } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { TimeEntry } from '@/services/local/time-entry-service';

interface DayTimeEntryCardProps {
  entry: TimeEntry;
  statusLabel: string;
}

const formatTime = (date: Date) =>
  new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

export const DayTimeEntryCard = ({ entry, statusLabel }: DayTimeEntryCardProps) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface.card, borderColor: theme.colors.border.subtle }]}>
      <VStack spacing="sm">
        <HStack justify="space-between" align="center">
          <Text variant="sm" weight="semibold">
            {formatTime(entry.clockIn)}{entry.clockOut ? ` - ${formatTime(entry.clockOut)}` : ' - Ongoing'}
          </Text>
          <Text variant="xs" weight="medium" color={theme.colors.text.secondary}>
            {statusLabel}
          </Text>
        </HStack>
        <HStack justify="space-between" wrap>
          <Text variant="xs" color={theme.colors.text.tertiary}>
            {entry.isManual ? 'Manual entry' : 'Clocked session'}
          </Text>
          <Text variant="xs" color={theme.colors.text.tertiary}>
            {entry.totalHours ? `${entry.totalHours.toFixed(2)} hrs` : 'In progress'}
          </Text>
        </HStack>
        {entry.notes && (
          <Text variant="xs" color={theme.colors.text.secondary}>
            {entry.notes}
          </Text>
        )}
      </VStack>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
});
