import { useMemo } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useDailyLogs } from '@/hooks/use-daily-logs';
import { useTimeEntries } from '@/hooks/use-time-entries';
import {
  buildReportBuckets,
  buildReportExportCsv,
  buildReportSummary,
  buildReportTrend,
  formatHours,
  getPeriodMeta,
  getPeakBucket,
  ReportPeriod,
} from './report-utils';

const getRoutePeriod = (value?: string | string[]): ReportPeriod => {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === 'daily' || raw === 'weekly' || raw === 'monthly') return raw;
  return 'weekly';
};

export const useReportDetailScreen = () => {
  const params = useLocalSearchParams<{ period?: string | string[] }>();
  const period = getRoutePeriod(params.period);
  const { data: entries = [], isPending: isEntriesPending } = useTimeEntries();
  const { data: logs = [], isPending: isLogsPending } = useDailyLogs();

  const meta = useMemo(() => getPeriodMeta(period), [period]);
  const buckets = useMemo(
    () => buildReportBuckets(entries, logs, period, meta.detailBucketCount),
    [entries, logs, meta.detailBucketCount, period]
  );
  const summary = useMemo(() => buildReportSummary(buckets), [buckets]);
  const trend = useMemo(() => buildReportTrend(buckets), [buckets]);
  const peakBucket = useMemo(() => getPeakBucket(buckets), [buckets]);
  const exportCsv = useMemo(
    () => buildReportExportCsv(meta.label, buckets, summary),
    [buckets, meta.label, summary]
  );

  const averagePerActiveDay = useMemo(() => (
    summary.activeDays > 0 ? Number((summary.totalHours / summary.activeDays).toFixed(2)) : 0
  ), [summary.activeDays, summary.totalHours]);

  const trendSummary = useMemo(() => {
    if (!trend.previousLabel) {
      return `You're tracking ${formatHours(trend.latestHours)} in ${trend.latestLabel}. Add one more completed period to unlock comparisons.`;
    }

    if (trend.direction === 'flat') {
      return `You're steady at ${formatHours(trend.latestHours)} in ${trend.latestLabel}, matching ${trend.previousLabel}.`;
    }

    const directionLabel = trend.direction === 'up' ? 'up' : 'down';
    const percentageLabel = trend.changePercentage !== null
      ? ` (${Math.abs(trend.changePercentage).toFixed(1)}%)`
      : '';

    return `You're ${directionLabel} ${formatHours(Math.abs(trend.changeHours))}${percentageLabel} compared with ${trend.previousLabel}.`;
  }, [trend]);

  return {
    period,
    periodLabel: meta.label,
    buckets,
    summary,
    trend,
    peakBucket,
    exportCsv,
    averagePerActiveDay,
    trendSummary,
    isLoading: isEntriesPending || isLogsPending,
  };
};
