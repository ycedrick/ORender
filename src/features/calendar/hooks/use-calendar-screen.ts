import { useMemo, useState } from 'react';
import { useDailyLogs } from '@/hooks/use-daily-logs';
import { useTimeEntries } from '@/hooks/use-time-entries';

export interface CalendarDayCellData {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasCompletedEntry: boolean;
  hasIncompleteEntry: boolean;
  hasLog: boolean;
}

export interface CalendarMonthPageData {
  key: string;
  monthDate: Date;
  weeks: CalendarDayCellData[][];
  summary: {
    hasAnyActivity: boolean;
    activityDays: number;
    completedDays: number;
    incompleteDays: number;
    logOnlyDays: number;
  };
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const addMonths = (date: Date, months: number) => new Date(date.getFullYear(), date.getMonth() + months, 1);

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const buildMonthSummary = (weeks: CalendarDayCellData[][]) => {
  const visibleMonthCells = weeks.flat().filter((cell) => cell.isCurrentMonth);
  const withActivity = visibleMonthCells.filter(
    (cell) => cell.hasCompletedEntry || cell.hasIncompleteEntry || cell.hasLog
  );

  return {
    hasAnyActivity: withActivity.length > 0,
    activityDays: withActivity.length,
    completedDays: visibleMonthCells.filter((cell) => cell.hasCompletedEntry).length,
    incompleteDays: visibleMonthCells.filter((cell) => cell.hasIncompleteEntry).length,
    logOnlyDays: visibleMonthCells.filter(
      (cell) => !cell.hasCompletedEntry && !cell.hasIncompleteEntry && cell.hasLog
    ).length,
  };
};

const buildMonthWeeks = (
  monthDate: Date,
  dayStatusMap: Map<string, {
    hasCompletedEntry: boolean;
    hasIncompleteEntry: boolean;
    hasLog: boolean;
  }>
) => {
  const today = new Date();
  const firstDayOfMonth = startOfMonth(monthDate);
  const gridStart = addDays(firstDayOfMonth, -firstDayOfMonth.getDay());

  return Array.from({ length: 6 }, (_, weekIndex) => (
    Array.from({ length: 7 }, (_, dayIndex) => {
      const date = addDays(gridStart, weekIndex * 7 + dayIndex);
      const status = dayStatusMap.get(toDateKey(date));

      return {
        date,
        dayNumber: date.getDate(),
        isCurrentMonth: date.getMonth() === monthDate.getMonth(),
        isToday: isSameDay(date, today),
        hasCompletedEntry: status?.hasCompletedEntry ?? false,
        hasIncompleteEntry: status?.hasIncompleteEntry ?? false,
        hasLog: status?.hasLog ?? false,
      } satisfies CalendarDayCellData;
    })
  ));
};

export const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const useCalendarScreen = () => {
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const { data: timeEntries = [], isPending: isEntriesPending } = useTimeEntries();
  const { data: dailyLogs = [], isPending: isLogsPending } = useDailyLogs();

  const monthLabel = useMemo(() => {
    return visibleMonth.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }, [visibleMonth]);

  const dayStatusMap = useMemo(() => {
    const statuses = new Map<string, {
      hasCompletedEntry: boolean;
      hasIncompleteEntry: boolean;
      hasLog: boolean;
    }>();

    timeEntries.forEach((entry) => {
      const key = toDateKey(new Date(entry.clockIn));
      const current = statuses.get(key) ?? {
        hasCompletedEntry: false,
        hasIncompleteEntry: false,
        hasLog: false,
      };

      if (entry.status === 'complete' || entry.status === 'edited') {
        current.hasCompletedEntry = true;
      }

      if (entry.status === 'incomplete') {
        current.hasIncompleteEntry = true;
      }

      statuses.set(key, current);
    });

    dailyLogs.forEach((log) => {
      const key = toDateKey(new Date(log.date));
      const current = statuses.get(key) ?? {
        hasCompletedEntry: false,
        hasIncompleteEntry: false,
        hasLog: false,
      };

      current.hasLog = true;
      statuses.set(key, current);
    });

    return statuses;
  }, [dailyLogs, timeEntries]);

  const monthPages = useMemo(() => {
    return [-1, 0, 1].map((offset) => {
      const monthDate = addMonths(visibleMonth, offset);
      const weeks = buildMonthWeeks(monthDate, dayStatusMap);

      return {
        key: toDateKey(monthDate),
        monthDate,
        weeks,
        summary: buildMonthSummary(weeks),
      } satisfies CalendarMonthPageData;
    });
  }, [dayStatusMap, visibleMonth]);

  const visibleMonthSummary = monthPages[1]?.summary ?? {
    hasAnyActivity: false,
    activityDays: 0,
    completedDays: 0,
    incompleteDays: 0,
    logOnlyDays: 0,
  };

  const goToPreviousMonth = () => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  };

  return {
    monthLabel,
    weekdayLabels: WEEKDAY_LABELS,
    weeks: monthPages[1]?.weeks ?? [],
    monthPages,
    visibleMonthSummary,
    goToPreviousMonth,
    goToNextMonth,
    isLoading: isEntriesPending || isLogsPending,
  };
};
