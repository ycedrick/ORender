import { useMemo, useState } from 'react';
import { useTimeEntries } from '@/hooks/use-time-entries';
import { TimeEntry } from '@/services/local/time-entry-service';

export type HistoryStatusFilter = 'all' | 'completed' | 'active';
export type HistorySourceFilter = 'all' | 'clocked' | 'manual';

const isCompletedEntry = (totalHours: number | null, status: string) =>
  Boolean(totalHours) && (status === 'complete' || status === 'edited');

const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const formatTime = (date: Date) =>
  new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

const getStatusLabel = (entry: TimeEntry) => {
  if (entry.status === 'edited') return 'edited';
  if (entry.status === 'complete') return 'completed';
  return 'active';
};

const getSourceLabel = (entry: TimeEntry) => {
  return entry.isManual ? 'manual' : 'clocked';
};

export const useHistoryScreen = () => {
  const { data: entries = [], isPending } = useTimeEntries();
  const [statusFilter, setStatusFilter] = useState<HistoryStatusFilter>('all');
  const [sourceFilter, setSourceFilter] = useState<HistorySourceFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const summary = useMemo(() => {
    return entries.reduce(
      (acc, entry) => {
        acc.totalEntries += 1;

        if (isCompletedEntry(entry.totalHours, entry.status)) {
          acc.completedHours += entry.totalHours ?? 0;
        }

        if (entry.isManual) {
          acc.manualEntries += 1;
        }

        return acc;
      },
      {
        totalEntries: 0,
        completedHours: 0,
        manualEntries: 0,
      }
    );
  }, [entries]);

  const filteredEntries = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return entries.filter((entry) => {
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'completed' && isCompletedEntry(entry.totalHours, entry.status)) ||
        (statusFilter === 'active' && entry.status === 'incomplete');

      const matchesSource =
        sourceFilter === 'all' ||
        (sourceFilter === 'manual' && entry.isManual) ||
        (sourceFilter === 'clocked' && !entry.isManual);

      if (!matchesStatus || !matchesSource) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchableText = [
        formatDate(entry.clockIn),
        formatTime(entry.clockIn),
        entry.clockOut ? formatTime(entry.clockOut) : 'ongoing',
        getStatusLabel(entry),
        getSourceLabel(entry),
        entry.notes ?? '',
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [entries, searchQuery, sourceFilter, statusFilter]);

  return {
    entries: filteredEntries,
    isPending,
    summary,
    searchQuery,
    statusFilter,
    sourceFilter,
    setSearchQuery,
    setStatusFilter,
    setSourceFilter,
  };
};
