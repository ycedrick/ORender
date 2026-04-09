import { useMemo } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useDailyLogs } from '@/hooks/use-daily-logs';
import { useTimeEntries } from '@/hooks/use-time-entries';
import { DailyLog } from '@/services/local/daily-log-service';
import { TimeEntry } from '@/services/local/time-entry-service';

const parseRouteDate = (value?: string | string[]) => {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return new Date();

  const [year, month, day] = raw.split('-').map(Number);
  if (!year || !month || !day) return new Date();

  return new Date(year, month - 1, day);
};

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const getEntryStatusLabel = (entry: TimeEntry) => {
  if (entry.status === 'edited') return 'Edited';
  if (entry.status === 'complete') return 'Completed';
  return 'Incomplete';
};

export const useCalendarDayDetailScreen = () => {
  const params = useLocalSearchParams<{ date?: string | string[] }>();
  const selectedDate = useMemo(() => parseRouteDate(params.date), [params.date]);
  const { data: timeEntries = [], isPending: isEntriesPending } = useTimeEntries();
  const { data: dailyLogs = [], isPending: isLogsPending } = useDailyLogs();

  const dayEntries = useMemo(() => {
    return timeEntries.filter((entry) => isSameDay(new Date(entry.clockIn), selectedDate));
  }, [selectedDate, timeEntries]);

  const dayLogs = useMemo(() => {
    return dailyLogs.filter((log) => isSameDay(new Date(log.date), selectedDate));
  }, [dailyLogs, selectedDate]);

  const summary = useMemo(() => {
    return {
      entriesCount: dayEntries.length,
      logsCount: dayLogs.length,
      totalHours: dayEntries.reduce((sum, entry) => {
        if (entry.totalHours && (entry.status === 'complete' || entry.status === 'edited')) {
          return sum + entry.totalHours;
        }
        return sum;
      }, 0),
      hasActivity: dayEntries.length > 0 || dayLogs.length > 0,
    };
  }, [dayEntries, dayLogs]);

  const title = selectedDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    selectedDate,
    title,
    dayEntries,
    dayLogs,
    summary,
    isLoading: isEntriesPending || isLogsPending,
    getEntryStatusLabel,
  };
};

export type CalendarDayDetailLog = DailyLog;
