import { DailyLog } from '@/services/local/daily-log-service';
import { TimeEntry } from '@/services/local/time-entry-service';

export type ReportPeriod = 'daily' | 'weekly' | 'monthly';

export interface ReportBucket {
  key: string;
  label: string;
  shortLabel: string;
  startDate: Date;
  endDate: Date;
  totalHours: number;
  activeDays: number;
  entryCount: number;
  logCount: number;
}

export interface ReportSummary {
  totalHours: number;
  averageHours: number;
  activeDays: number;
  completedEntries: number;
  logDays: number;
}

export interface ReportTrend {
  latestLabel: string;
  previousLabel: string | null;
  latestHours: number;
  previousHours: number;
  changeHours: number;
  changePercentage: number | null;
  direction: 'up' | 'down' | 'flat';
}

const isCompletedEntry = (entry: TimeEntry) =>
  (entry.status === 'complete' || entry.status === 'edited') && !!entry.totalHours;

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const endOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
const addDays = (date: Date, amount: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
const addMonths = (date: Date, amount: number) => new Date(date.getFullYear(), date.getMonth() + amount, 1);
const startOfWeek = (date: Date) => addDays(startOfDay(date), -startOfDay(date).getDay());

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const createDailyBuckets = (count: number, today = new Date()) =>
  Array.from({ length: count }, (_, index) => {
    const date = addDays(today, -(count - 1 - index));
    return {
      key: toDateKey(date),
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      shortLabel: date.toLocaleDateString('en-US', { day: 'numeric' }),
      startDate: startOfDay(date),
      endDate: endOfDay(date),
    };
  });

const createWeeklyBuckets = (count: number, today = new Date()) =>
  Array.from({ length: count }, (_, index) => {
    const weekStart = addDays(startOfWeek(today), -7 * (count - 1 - index));
    const weekEnd = endOfDay(addDays(weekStart, 6));
    return {
      key: `${toDateKey(weekStart)}-${toDateKey(weekEnd)}`,
      label: `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      shortLabel: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      startDate: weekStart,
      endDate: weekEnd,
    };
  });

const createMonthlyBuckets = (count: number, today = new Date()) =>
  Array.from({ length: count }, (_, index) => {
    const monthDate = addMonths(startOfMonth(today), -(count - 1 - index));
    return {
      key: `${monthDate.getFullYear()}-${monthDate.getMonth() + 1}`,
      label: monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      shortLabel: monthDate.toLocaleDateString('en-US', { month: 'short' }),
      startDate: startOfMonth(monthDate),
      endDate: endOfMonth(monthDate),
    };
  });

const inRange = (value: Date, startDate: Date, endDate: Date) => value >= startDate && value <= endDate;

export const createBucketsForPeriod = (period: ReportPeriod, count: number) => {
  if (period === 'daily') return createDailyBuckets(count);
  if (period === 'weekly') return createWeeklyBuckets(count);
  return createMonthlyBuckets(count);
};

export const buildReportBuckets = (
  entries: TimeEntry[],
  logs: DailyLog[],
  period: ReportPeriod,
  count: number
): ReportBucket[] => {
  const completedEntries = entries.filter(isCompletedEntry);
  const buckets = createBucketsForPeriod(period, count);

  return buckets.map((bucket) => {
    const bucketEntries = completedEntries.filter((entry) =>
      inRange(new Date(entry.clockIn), bucket.startDate, bucket.endDate)
    );
    const bucketLogs = logs.filter((log) =>
      inRange(new Date(log.date), bucket.startDate, bucket.endDate)
    );

    const activeDayKeys = new Set(bucketEntries.map((entry) => toDateKey(new Date(entry.clockIn))));
    const totalHours = bucketEntries.reduce((sum, entry) => sum + (entry.totalHours ?? 0), 0);

    return {
      ...bucket,
      totalHours: Number(totalHours.toFixed(2)),
      activeDays: activeDayKeys.size,
      entryCount: bucketEntries.length,
      logCount: bucketLogs.length,
    };
  });
};

export const buildReportSummary = (buckets: ReportBucket[]): ReportSummary => {
  const totalHours = buckets.reduce((sum, bucket) => sum + bucket.totalHours, 0);
  const activeDays = buckets.reduce((sum, bucket) => sum + bucket.activeDays, 0);
  const completedEntries = buckets.reduce((sum, bucket) => sum + bucket.entryCount, 0);
  const logDays = buckets.reduce((sum, bucket) => sum + bucket.logCount, 0);

  return {
    totalHours: Number(totalHours.toFixed(2)),
    averageHours: buckets.length ? Number((totalHours / buckets.length).toFixed(2)) : 0,
    activeDays,
    completedEntries,
    logDays,
  };
};

export const buildReportTrend = (buckets: ReportBucket[]): ReportTrend => {
  const latestBucket = buckets[buckets.length - 1];
  const previousBucket = buckets[buckets.length - 2];

  if (!latestBucket) {
    return {
      latestLabel: 'Current period',
      previousLabel: null,
      latestHours: 0,
      previousHours: 0,
      changeHours: 0,
      changePercentage: null,
      direction: 'flat',
    };
  }

  const latestHours = latestBucket.totalHours;
  const previousHours = previousBucket?.totalHours ?? 0;
  const changeHours = Number((latestHours - previousHours).toFixed(2));
  const changePercentage = previousBucket && previousHours > 0
    ? Number((((latestHours - previousHours) / previousHours) * 100).toFixed(1))
    : null;

  return {
    latestLabel: latestBucket.label,
    previousLabel: previousBucket?.label ?? null,
    latestHours,
    previousHours,
    changeHours,
    changePercentage,
    direction: changeHours > 0 ? 'up' : changeHours < 0 ? 'down' : 'flat',
  };
};

export const getPeakBucket = (buckets: ReportBucket[]) =>
  buckets.reduce<ReportBucket | null>((currentPeak, bucket) => {
    if (!currentPeak || bucket.totalHours > currentPeak.totalHours) return bucket;
    return currentPeak;
  }, null);

const escapeCsvValue = (value: string | number) => {
  const normalized = String(value);
  if (normalized.includes(',') || normalized.includes('"') || normalized.includes('\n')) {
    return `"${normalized.replaceAll('"', '""')}"`;
  }
  return normalized;
};

export const buildReportExportCsv = (
  periodLabel: string,
  buckets: ReportBucket[],
  summary: ReportSummary
) => {
  const headerLines = [
    `${periodLabel} Report Export`,
    `Generated At,${new Date().toISOString()}`,
    `Total Hours,${summary.totalHours}`,
    `Average Hours Per Bucket,${summary.averageHours}`,
    `Active Days,${summary.activeDays}`,
    `Completed Entries,${summary.completedEntries}`,
    `Days With Logs,${summary.logDays}`,
    '',
    'Label,Start Date,End Date,Total Hours,Active Days,Completed Entries,Daily Logs',
  ];

  const rows = buckets.map((bucket) => [
    escapeCsvValue(bucket.label),
    bucket.startDate.toISOString(),
    bucket.endDate.toISOString(),
    bucket.totalHours,
    bucket.activeDays,
    bucket.entryCount,
    bucket.logCount,
  ].join(','));

  return [...headerLines, ...rows].join('\n');
};

export const formatHours = (hours: number) => `${hours.toFixed(2)} hrs`;

export const getPeriodMeta = (period: ReportPeriod) => {
  switch (period) {
    case 'daily':
      return {
        label: 'Daily',
        bucketCount: 7,
        detailBucketCount: 14,
      };
    case 'weekly':
      return {
        label: 'Weekly',
        bucketCount: 8,
        detailBucketCount: 12,
      };
    case 'monthly':
    default:
      return {
        label: 'Monthly',
        bucketCount: 6,
        detailBucketCount: 12,
      };
  }
};

export const getInsightMetrics = (
  entries: TimeEntry[],
  logs: DailyLog[],
  requiredHours: number
) => {
  const completedEntries = entries.filter(isCompletedEntry);
  const totalCompletedHours = completedEntries.reduce((sum, entry) => sum + (entry.totalHours ?? 0), 0);

  const hoursByWeekday = new Map<number, number>();
  completedEntries.forEach((entry) => {
    const weekday = new Date(entry.clockIn).getDay();
    hoursByWeekday.set(weekday, (hoursByWeekday.get(weekday) ?? 0) + (entry.totalHours ?? 0));
  });

  const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const mostActiveWeekday = [...hoursByWeekday.entries()].sort((left, right) => right[1] - left[1])[0];

  const completedDayKeys = [...new Set(completedEntries.map((entry) => toDateKey(new Date(entry.clockIn))))].sort();
  let longestStreak = 0;
  let currentStreak = 0;
  let previousDate: Date | null = null;

  completedDayKeys.forEach((key) => {
    const [year, month, day] = key.split('-').map(Number);
    const currentDate = new Date(year, month - 1, day);
    if (!previousDate) {
      currentStreak = 1;
    } else {
      const diff = startOfDay(currentDate).getTime() - startOfDay(previousDate).getTime();
      currentStreak = diff === 24 * 60 * 60 * 1000 ? currentStreak + 1 : 1;
    }
    longestStreak = Math.max(longestStreak, currentStreak);
    previousDate = currentDate;
  });

  const averageHoursPerCompletedDay = completedDayKeys.length
    ? Number((totalCompletedHours / completedDayKeys.length).toFixed(2))
    : 0;

  const progressPercentage = requiredHours > 0
    ? Math.min((totalCompletedHours / requiredHours) * 100, 100)
    : 0;

  return {
    longestStreak,
    mostActiveWeekday: mostActiveWeekday ? weekdayNames[mostActiveWeekday[0]] : 'No data yet',
    averageHoursPerCompletedDay,
    progressPercentage: Number(progressPercentage.toFixed(1)),
    totalCompletedHours: Number(totalCompletedHours.toFixed(2)),
    requiredHours,
    logDays: logs.length,
  };
};
