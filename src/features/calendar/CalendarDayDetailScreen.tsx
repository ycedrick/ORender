import { Button, Screen, Spacer, Text, VStack } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { DayDetailCard } from './components/DayDetailCard';
import { DayLogCard } from './components/DayLogCard';
import { DayTimeEntryCard } from './components/DayTimeEntryCard';
import { useCalendarDayDetailScreen } from './hooks/use-calendar-day-detail-screen';

export const CalendarDayDetailScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const {
    title,
    dayEntries,
    dayLogs,
    summary,
    isLoading,
    getEntryStatusLabel,
  } = useCalendarDayDetailScreen();

  return (
    <Screen edges={["right", "left"]} scroll style={styles.container} contentContainerStyle={styles.content}>
      <VStack spacing="lg">
        <VStack spacing="xs" style={styles.header}>
          <View style={styles.backButton}>
            <Button
              variant="ghost"
              title="← Back"
              size="sm"
              onPress={() => router.back()}
            />
          </View>
          <Text variant="xl" weight="bold">{title}</Text>
          <Text color={theme.colors.text.secondary}>
            Review all time entries and daily logs recorded for this date.
          </Text>
        </VStack>

        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color={theme.colors.action.primary} />
          </View>
        ) : (
          <>
            <DayDetailCard
              entriesCount={summary.entriesCount}
              logsCount={summary.logsCount}
              totalHours={summary.totalHours}
            />

            {!summary.hasActivity && (
              <View style={[styles.emptyState, { backgroundColor: theme.colors.surface.card, borderColor: theme.colors.border.subtle }]}>
                <Text variant="sm" weight="semibold" align="center">No activity recorded for this day</Text>
                <Text variant="xs" align="center" color={theme.colors.text.secondary}>
                  Add an entry or log for this date.
                </Text>
                <View style={styles.emptyActions}>
                  <Button title="Manual Entry" size="sm" variant="outlined" onPress={() => router.push('/entry/manual')} />
                  <Button title="Create Log" size="sm" onPress={() => router.push('/log/create')} />
                </View>
              </View>
            )}

            {dayEntries.length > 0 && (
              <VStack spacing="sm">
                <Text variant="sm" weight="semibold" color={theme.colors.text.secondary}>TIME ENTRIES</Text>
                {dayEntries.map((entry) => (
                  <DayTimeEntryCard
                    key={entry.id}
                    entry={entry}
                    statusLabel={getEntryStatusLabel(entry)}
                  />
                ))}
              </VStack>
            )}

            {dayLogs.length > 0 && (
              <VStack spacing="sm">
                <Text variant="sm" weight="semibold" color={theme.colors.text.secondary}>DAILY LOGS</Text>
                {dayLogs.map((log) => (
                  <DayLogCard key={log.id} log={log} onPress={() => router.push(`/log/${log.id}`)} />
                ))}
              </VStack>
            )}
          </>
        )}
      </VStack>
      <Spacer size="xxxl" />
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 8,
    paddingBottom: 40,
  },
  header: {
    paddingBottom: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    marginLeft: -16,
  },
  loadingState: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  emptyActions: {
    gap: 10,
    alignSelf: 'center',
    alignItems: 'center',
  },
});
