import { Button, HStack, Screen, Text, VStack } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { HoursChart } from './components/HoursChart';
import { PeriodSelector } from './components/PeriodSelector';
import { SummaryCard } from './components/SummaryCard';
import { useReportsScreen } from './hooks/use-reports-screen';

export const ReportsScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const {
    selectedPeriod,
    setSelectedPeriod,
    buckets,
    summary,
    trend,
    peakBucket,
    isLoading,
  } = useReportsScreen();

  return (
    <Screen edges={["left", "right"]} scroll style={styles.container} contentContainerStyle={styles.content}>
      <VStack spacing="lg">
        <VStack spacing="xs">
          <Text variant="xl" weight="bold">Reports</Text>
          <Text color={theme.colors.text.secondary}>
            Review your hours across daily, weekly, and monthly periods.
          </Text>
        </VStack>

        <PeriodSelector selectedPeriod={selectedPeriod} onSelectPeriod={setSelectedPeriod} />

        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color={theme.colors.action.primary} />
          </View>
        ) : (
          <>
            <HStack spacing="sm" wrap>
              <SummaryCard label="Total Hours" value={`${summary.totalHours.toFixed(2)}`} />
              <SummaryCard label="Avg / Bucket" value={`${summary.averageHours.toFixed(2)}`} />
              <SummaryCard label="Active Days" value={`${summary.activeDays}`} />
            </HStack>

            <HoursChart
              buckets={buckets}
              title={`${selectedPeriod[0].toUpperCase()}${selectedPeriod.slice(1)} overview`}
              subtitle={peakBucket
                ? `Peak ${selectedPeriod} period: ${peakBucket.shortLabel} with ${peakBucket.totalHours.toFixed(2)} hrs`
                : 'No completed hours yet'}
            />

            <View
              style={[
                styles.narrativeCard,
                {
                  backgroundColor: theme.colors.surface.card,
                  borderColor: theme.colors.border.subtle,
                }
              ]}
            >
              <VStack spacing="xs">
                <Text variant="xs" weight="semibold" color={theme.colors.text.tertiary}>
                  SNAPSHOT
                </Text>
                <Text variant="lg" weight="bold">
                  {trend.direction === 'up' ? 'Trending upward' : trend.direction === 'down' ? 'Softer than last period' : 'Steady output'}
                </Text>
                <Text color={theme.colors.text.secondary}>
                  {trend.previousLabel
                    ? `${trend.latestLabel} recorded ${trend.latestHours.toFixed(2)} hrs compared with ${trend.previousHours.toFixed(2)} hrs in ${trend.previousLabel}.`
                    : `Your current ${selectedPeriod} range has ${trend.latestHours.toFixed(2)} hrs so far.`}
                </Text>
              </VStack>
            </View>

            <VStack spacing="sm">
              <Button title={`Open ${selectedPeriod[0].toUpperCase()}${selectedPeriod.slice(1)} Report`} onPress={() => router.push(`/reports/${selectedPeriod}`)} />
              <Button title="View Insights" variant="outlined" onPress={() => router.push('/reports/insights')} />
            </VStack>
          </>
        )}
      </VStack>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  narrativeCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
});
