import { Button, HStack, Screen, Spacer, Text, VStack } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, Share, StyleSheet, View } from 'react-native';
import { HoursChart } from './components/HoursChart';
import { SummaryCard } from './components/SummaryCard';
import { useReportDetailScreen } from './hooks/use-report-detail-screen';

export const ReportDetailScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const {
    periodLabel,
    buckets,
    summary,
    trend,
    peakBucket,
    exportCsv,
    averagePerActiveDay,
    trendSummary,
    isLoading,
  } = useReportDetailScreen();
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await Share.share({
        title: `${periodLabel} Report`,
        message: exportCsv,
      });
    } catch {
      Alert.alert('Export unavailable', 'The report could not be shared right now. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

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
          <Text variant="xl" weight="bold">{periodLabel} Report</Text>
          <Text color={theme.colors.text.secondary}>
            Explore the detailed hour breakdown for this reporting period.
          </Text>
        </VStack>

        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color={theme.colors.action.primary} />
          </View>
        ) : (
          <>
            <HStack spacing="sm" wrap>
              <SummaryCard label="Total Hours" value={`${summary.totalHours.toFixed(2)}`} />
              <SummaryCard label="Avg / Bucket" value={`${summary.averageHours.toFixed(2)}`} />
              <SummaryCard label="Avg / Active Day" value={`${averagePerActiveDay.toFixed(2)}`} />
              <SummaryCard label="Completed Entries" value={`${summary.completedEntries}`} />
            </HStack>

            <HoursChart
              buckets={buckets}
              height={220}
              title={`${periodLabel} Performance`}
              subtitle={`Latest: ${trend.latestLabel}`}
            />

            <View
              style={[
                styles.trendCard,
                {
                  backgroundColor: theme.colors.surface.card,
                  borderColor: theme.colors.border.subtle,
                }
              ]}
            >
              <VStack spacing="xs">
                <Text variant="xs" weight="semibold" color={theme.colors.text.tertiary}>
                  MOMENTUM
                </Text>
                <Text variant="lg" weight="bold">
                  {trend.direction === 'up' ? 'Building momentum' : trend.direction === 'down' ? 'Watch your pace' : 'Holding steady'}
                </Text>
                <Text color={theme.colors.text.secondary}>{trendSummary}</Text>
                {peakBucket ? (
                  <Text variant="sm" color={theme.colors.text.secondary}>
                    Strongest bucket: {peakBucket.label} with {peakBucket.totalHours.toFixed(2)} hrs.
                  </Text>
                ) : null}
              </VStack>
            </View>

            <VStack spacing="sm">
              <Text variant="sm" weight="semibold" color={theme.colors.text.secondary}>BREAKDOWN</Text>
              {buckets.map((bucket) => (
                <View
                  key={bucket.key}
                  style={[
                    styles.bucketRow,
                    {
                      backgroundColor: theme.colors.surface.card,
                      borderColor: theme.colors.border.subtle,
                    }
                  ]}
                >
                  <HStack justify="space-between" align="center">
                    <VStack spacing="xxs" style={styles.bucketContent}>
                      <Text variant="sm" weight="medium">{bucket.label}</Text>
                      <Text variant="xs" color={theme.colors.text.secondary}>
                        {bucket.entryCount} entries • {bucket.logCount} logs • {bucket.activeDays} active days
                      </Text>
                    </VStack>
                    <View
                      style={[
                        styles.hoursBadge,
                        {
                          backgroundColor: bucket.totalHours > 0 ? theme.colors.surface.input : theme.colors.surface.background,
                          borderColor: theme.colors.border.default,
                        }
                      ]}
                    >
                      <Text variant="sm" weight="semibold">
                        {bucket.totalHours.toFixed(2)}h
                      </Text>
                    </View>
                  </HStack>
                </View>
              ))}
            </VStack>

            <Button
              title={isExporting ? 'Exporting...' : 'Export Report'}
              variant="outlined"
              loading={isExporting}
              onPress={handleExport}
              icon={<Ionicons name="share-outline" size={18} color={theme.colors.action.primary} />}
            />
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
  bucketRow: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6,
  },
  trendCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  bucketContent: {
    flex: 1,
    paddingRight: 12,
  },
  hoursBadge: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
