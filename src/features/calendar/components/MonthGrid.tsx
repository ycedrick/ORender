import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, VStack } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { CalendarDayCellData } from '../hooks/use-calendar-screen';
import { DayCell } from './DayCell';

interface MonthGridProps {
  weekdayLabels: string[];
  weeks: CalendarDayCellData[][];
  onSelectDay?: (date: Date) => void;
}

export const MonthGrid = ({ weekdayLabels, weeks, onSelectDay }: MonthGridProps) => {
  const { theme } = useTheme();

  return (
    <VStack spacing="sm">
      <View style={styles.weekdaysRow}>
        {weekdayLabels.map((label) => (
          <View key={label} style={styles.weekdayCell}>
            <Text variant="xs" weight="semibold" color={theme.colors.text.tertiary} align="center">
              {label}
            </Text>
          </View>
        ))}
      </View>

      <VStack spacing="xs">
        {weeks.map((week, weekIndex) => (
          <View key={`week-${weekIndex}`} style={styles.weekRow}>
            {week.map((cell) => (
              <View key={cell.date.toISOString()} style={styles.dayCellWrapper}>
                <DayCell cell={cell} onPress={onSelectDay} />
              </View>
            ))}
          </View>
        ))}
      </VStack>
    </VStack>
  );
};

const styles = StyleSheet.create({
  weekdaysRow: {
    flexDirection: 'row',
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dayCellWrapper: {
    flex: 1,
  },
});
