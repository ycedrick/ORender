import { Button, Screen, Spacer, Text, VStack } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { InsightCard } from './components/InsightCard';
import { useInsightsScreen } from './hooks/use-insights-screen';

export const InsightsScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { metrics, isLoading } = useInsightsScreen();

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
          <Text variant="xl" weight="bold">Insights</Text>
          <Text color={theme.colors.text.secondary}>
            Quick performance highlights based on your recorded training activity.
          </Text>
        </VStack>

        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color={theme.colors.action.primary} />
          </View>
        ) : (
          <VStack spacing="sm">
            <InsightCard
              label="Longest Streak"
              value={`${metrics.longestStreak} day${metrics.longestStreak === 1 ? '' : 's'}`}
              helper="Consecutive days with completed hours."
            />
            <InsightCard
              label="Most Active Weekday"
              value={metrics.mostActiveWeekday}
              helper="Day of the week with the highest completed hours."
            />
            <InsightCard
              label="Average Hours / Day"
              value={`${metrics.averageHoursPerCompletedDay.toFixed(2)} hrs`}
              helper="Average completed hours across active days."
            />
            <InsightCard
              label="Completion Progress"
              value={`${metrics.progressPercentage.toFixed(1)}%`}
              helper={`${metrics.totalCompletedHours.toFixed(2)} of ${metrics.requiredHours} required hours completed.`}
            />
          </VStack>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
});
