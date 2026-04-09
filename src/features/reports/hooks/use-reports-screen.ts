import { useMemo, useState } from 'react';
import { useDailyLogs } from '@/hooks/use-daily-logs';
import { useTimeEntries } from '@/hooks/use-time-entries';
import {
  buildReportBuckets,
  buildReportSummary,
  buildReportTrend,
  getPeriodMeta,
  getPeakBucket,
  ReportPeriod,
} from './report-utils';

export const useReportsScreen = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('weekly');
  const { data: entries = [], isPending: isEntriesPending } = useTimeEntries();
  const { data: logs = [], isPending: isLogsPending } = useDailyLogs();

  const meta = useMemo(() => getPeriodMeta(selectedPeriod), [selectedPeriod]);
  const buckets = useMemo(
    () => buildReportBuckets(entries, logs, selectedPeriod, meta.bucketCount),
    [entries, logs, meta.bucketCount, selectedPeriod]
  );
  const summary = useMemo(() => buildReportSummary(buckets), [buckets]);
  const trend = useMemo(() => buildReportTrend(buckets), [buckets]);
  const peakBucket = useMemo(() => getPeakBucket(buckets), [buckets]);

  return {
    selectedPeriod,
    setSelectedPeriod,
    buckets,
    summary,
    trend,
    peakBucket,
    isLoading: isEntriesPending || isLogsPending,
  };
};
