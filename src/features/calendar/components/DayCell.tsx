import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { CalendarDayCellData, toDateKey } from '../hooks/use-calendar-screen';

interface DayCellProps {
  cell: CalendarDayCellData;
  onPress?: (date: Date) => void;
}

export const DayCell = ({ cell, onPress }: DayCellProps) => {
  const { theme } = useTheme();

  const statusColor = cell.hasCompletedEntry
    ? theme.colors.action.success
    : cell.hasIncompleteEntry
      ? theme.colors.action.danger
      : cell.hasLog
        ? theme.colors.action.warning
        : 'transparent';

  const dayTextColor = !cell.isCurrentMonth
    ? theme.colors.text.tertiary
    : cell.isToday
      ? theme.colors.text.inverse
      : theme.colors.text.primary;

  const dateChipBackground = cell.isToday
    ? theme.colors.action.primary
    : cell.isCurrentMonth
      ? theme.colors.surface.input
      : theme.colors.surface.card;

  const dateChipBorder = cell.isToday
    ? theme.colors.action.primary
    : theme.colors.border.default;

  const accessibilityParts = [
    cell.date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
  ];

  if (cell.isToday) accessibilityParts.push('today');
  if (cell.hasCompletedEntry) accessibilityParts.push('logged');
  if (cell.hasIncompleteEntry) accessibilityParts.push('incomplete');
  if (!cell.hasCompletedEntry && !cell.hasIncompleteEntry && cell.hasLog) accessibilityParts.push('log only');
  if (!cell.isCurrentMonth) accessibilityParts.push('outside current month');

  return (
    <Pressable
      onPress={() => onPress?.(cell.date)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityParts.join(', ')}
      accessibilityHint={`Open details for ${toDateKey(cell.date)}`}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: theme.colors.background,
          opacity: cell.isCurrentMonth ? (pressed ? theme.opacity.pressed : 1) : 0.55,
        }
      ]}
    >
      <View style={styles.dayNumberWrap}>
        <View
          style={[
            styles.dateChip,
            {
              backgroundColor: dateChipBackground,
              borderColor: dateChipBorder,
            }
          ]}
        >
          <Text
            variant="sm"
            weight={cell.isToday ? 'semibold' : 'medium'}
            color={dayTextColor}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.9}
            style={styles.dayNumber}
          >
            {cell.dayNumber}
          </Text>

          {statusColor !== 'transparent' && (
            <View
              style={[
                styles.marker,
                {
                  backgroundColor: statusColor,
                  borderColor: cell.isToday ? theme.colors.action.primary : dateChipBackground,
                }
              ]}
            />
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    aspectRatio: 1,
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayNumberWrap: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateChip: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 10,
  },
  marker: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1.5,
    position: 'absolute',
    bottom: 3,
    right: 3,
  },
  dayNumber: {
    textAlign: 'center',
    includeFontPadding: false,
  },
});
