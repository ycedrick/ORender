import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Text, VStack } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { CalendarDayDetailLog } from '../hooks/use-calendar-day-detail-screen';

interface DayLogCardProps {
  log: CalendarDayDetailLog;
  onPress?: () => void;
}

export const DayLogCard = ({ log, onPress }: DayLogCardProps) => {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.colors.surface.card,
          borderColor: theme.colors.border.subtle,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <VStack spacing="xs">
        <Text variant="sm" weight="semibold">{log.title || 'Daily Log'}</Text>
        {log.description ? (
          <Text variant="xs" color={theme.colors.text.secondary}>
            {log.description}
          </Text>
        ) : (
          <Text variant="xs" color={theme.colors.text.tertiary}>
            No additional description for this log.
          </Text>
        )}
      </VStack>
    </Pressable>
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
