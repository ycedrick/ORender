import { useMemo } from 'react';
import { useTimeEntries } from '@/hooks/use-time-entries';
import { useUserProfile } from '@/hooks/use-user-profile';

const isSameDay = (d1: Date, d2: Date) => 
  d1.getFullYear() === d2.getFullYear() && 
  d1.getMonth() === d2.getMonth() && 
  d1.getDate() === d2.getDate();

export function useDashboard() {
  const { data: userProfile } = useUserProfile();
  const { data: allEntries } = useTimeEntries();

  const requiredHours = userProfile?.requiredHours || 600;

  // Calculate total historical hours
  const totalCompletedHours = useMemo(() => {
    if (!allEntries) return 0;
    return allEntries.reduce((acc, entry) => {
      // Only count 'complete' or 'edited' time entries with totalHours populated
      if (entry.totalHours && (entry.status === 'complete' || entry.status === 'edited')) {
        return acc + entry.totalHours;
      }
      return acc;
    }, 0);
  }, [allEntries]);

  // Calculate today's completed hours (excludes the currently running one, until clocked out)
  const todayEntries = useMemo(() => {
    if (!allEntries) return [];
    const now = new Date();
    return allEntries.filter(entry => isSameDay(entry.clockIn, now));
  }, [allEntries]);

  const todayCompletedHours = useMemo(() => {
    return todayEntries.reduce((acc, entry) => {
      if (entry.totalHours && (entry.status === 'complete' || entry.status === 'edited')) {
        return acc + entry.totalHours;
      }
      return acc;
    }, 0);
  }, [todayEntries]);

  const progressPercentage = Math.min((totalCompletedHours / requiredHours) * 100, 100);

  return {
    userProfile,
    totalCompletedHours,
    todayCompletedHours,
    requiredHours,
    progressPercentage,
  };
}
