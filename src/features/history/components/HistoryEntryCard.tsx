import React from 'react';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, HStack, Text, VStack } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { TimeEntry } from '@/services/local/time-entry-service';

interface HistoryEntryCardProps {
  entry: TimeEntry;
}

const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const formatTime = (date: Date) =>
  new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

const getStatusLabel = (entry: TimeEntry) => {
  if (entry.status === 'edited') return 'Edited';
  if (entry.status === 'complete') return 'Completed';
  return 'Active';
};

export const HistoryEntryCard = ({ entry }: HistoryEntryCardProps) => {
  const { theme } = useTheme();

  return (
    <Card variant="outlined" style={styles.card}>
      <VStack spacing="md">
        <HStack justify="space-between" align="flex-start">
          <VStack spacing="xs" style={styles.entryMeta}>
            <Text variant="sm" weight="semibold">{formatDate(entry.clockIn)}</Text>
            <Text variant="xs" color={theme.colors.text.secondary}>
              {formatTime(entry.clockIn)}
              {entry.clockOut ? ` - ${formatTime(entry.clockOut)}` : ' - Ongoing'}
            </Text>
          </VStack>

          <HStack
            spacing="xs"
            style={[
              styles.badge,
              {
                backgroundColor: entry.status === 'incomplete'
                  ? theme.colors.action.primary + '15'
                  : theme.colors.surface.input,
              }
            ]}
          >
            <Ionicons
              name={entry.status === 'incomplete' ? 'time-outline' : 'checkmark-circle-outline'}
              size={14}
              color={entry.status === 'incomplete' ? theme.colors.action.primary : theme.colors.text.secondary}
            />
            <Text variant="xs" weight="medium" color={entry.status === 'incomplete' ? theme.colors.action.primary : theme.colors.text.secondary}>
              {getStatusLabel(entry)}
            </Text>
          </HStack>
        </HStack>

        <HStack justify="space-between" wrap>
          <VStack spacing="xs">
            <Text variant="xs" color={theme.colors.text.tertiary}>Duration</Text>
            <Text variant="sm" weight="medium">
              {entry.totalHours ? `${entry.totalHours.toFixed(2)} hrs` : '--'}
            </Text>
          </VStack>

          <VStack spacing="xs">
            <Text variant="xs" color={theme.colors.text.tertiary}>Break</Text>
            <Text variant="sm" weight="medium">{entry.breakMinutes} min</Text>
          </VStack>

          <VStack spacing="xs">
            <Text variant="xs" color={theme.colors.text.tertiary}>Source</Text>
            <Text variant="sm" weight="medium">{entry.isManual ? 'Manual' : 'Clocked'}</Text>
          </VStack>
        </HStack>
      </VStack>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  entryMeta: {
    flex: 1,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
});
