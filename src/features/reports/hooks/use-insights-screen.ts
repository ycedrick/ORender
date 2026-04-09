import { useMemo } from 'react';
import { useDailyLogs } from '@/hooks/use-daily-logs';
import { useTimeEntries } from '@/hooks/use-time-entries';
import { useUserProfile } from '@/hooks/use-user-profile';
import { getInsightMetrics } from './report-utils';

export const useInsightsScreen = () => {
  const { data: entries = [], isPending: isEntriesPending } = useTimeEntries();
  const { data: logs = [], isPending: isLogsPending } = useDailyLogs();
  const { data: userProfile, isPending: isProfilePending } = useUserProfile();

  const metrics = useMemo(
    () => getInsightMetrics(entries, logs, userProfile?.requiredHours ?? 600),
    [entries, logs, userProfile?.requiredHours]
  );

  return {
    metrics,
    isLoading: isEntriesPending || isLogsPending || isProfilePending,
  };
};
