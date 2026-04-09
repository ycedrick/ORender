import { useRef, useEffect, useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { timeEntryQueryKeys, useActiveSession, useCreateTimeEntry, useUpdateTimeEntry } from '@/hooks/use-time-entries';
import { useUserProfile } from '@/hooks/use-user-profile';
import { TimeEntryService } from '@/services/local/time-entry-service';

const diffInSeconds = (d1: Date, d2: Date) =>
  Math.max(0, Math.floor((d1.getTime() - d2.getTime()) / 1000));

export function useSessionControls() {
  const queryClient = useQueryClient();
  const { data: userProfile } = useUserProfile();
  const { data: activeSession, isPending: isActivePending } = useActiveSession();
  const createEntry = useCreateTimeEntry();
  const updateEntry = useUpdateTimeEntry();
  const [isRecovering, setIsRecovering] = useState(false);
  const [isVerifyingClockIn, setIsVerifyingClockIn] = useState(false);
  const [hasRecoveredForUser, setHasRecoveredForUser] = useState<string | null>(null);

  // Keep a ref so the clock-out handler always sees the latest session,
  // even if it was captured in a stale closure (e.g. after app restart).
  const activeSessionRef = useRef(activeSession);
  useEffect(() => {
    activeSessionRef.current = activeSession;
  }, [activeSession]);

  useEffect(() => {
    if (!userProfile?.id || hasRecoveredForUser === userProfile.id) return;

    let cancelled = false;

    const runRecovery = async () => {
      setIsRecovering(true);
      try {
        await TimeEntryService.recoverIncompleteSessions(userProfile.id);
        if (cancelled) return;

        await queryClient.invalidateQueries({ queryKey: timeEntryQueryKeys.all });
        await queryClient.invalidateQueries({ queryKey: timeEntryQueryKeys.active() });
        setHasRecoveredForUser(userProfile.id);
      } finally {
        if (!cancelled) {
          setIsRecovering(false);
        }
      }
    };

    runRecovery();

    return () => {
      cancelled = true;
    };
  }, [hasRecoveredForUser, queryClient, userProfile?.id]);

  const handleClockIn = useCallback(() => {
    if (isActivePending || isRecovering) {
      Alert.alert('Please wait', 'Your session state is still loading. Try again in a moment.');
      return;
    }

    if (activeSessionRef.current) {
      Alert.alert('Already clocked in', 'You currently have an active session.');
      return;
    }

    if (!userProfile?.id) {
      Alert.alert('Profile required', 'Please complete your profile before clocking in.');
      return;
    }

    setIsVerifyingClockIn(true);
    TimeEntryService.getIncompleteSessionsByUser(userProfile.id)
      .then(async (sessions) => {
        if (sessions.length > 0) {
          await queryClient.invalidateQueries({ queryKey: timeEntryQueryKeys.active() });
          Alert.alert('Already clocked in', 'You currently have an active session.');
          return;
        }

        createEntry.mutate({
          userId: userProfile.id,
          clockIn: new Date(),
          status: 'incomplete',
          isManual: false,
          breakMinutes: 0,
        });
      })
      .catch(() => {
        Alert.alert('Clock-in failed', 'We could not verify your current session. Please try again.');
      })
      .finally(() => {
        setIsVerifyingClockIn(false);
      });
  }, [createEntry, isActivePending, isRecovering, queryClient, userProfile?.id]);

  const handleClockOut = useCallback(() => {
    if (isActivePending || isRecovering) {
      Alert.alert('Please wait', 'Your session state is still loading. Try again in a moment.');
      return;
    }

    const session = activeSessionRef.current;
    if (!session) {
      Alert.alert('No active session', 'You are not currently clocked in.');
      return;
    }

    const clockOutTime = new Date();
    const diffSecs = diffInSeconds(clockOutTime, session.clockIn);
    const effectiveSecs = Math.max(0, diffSecs - (session.breakMinutes * 60));
    const totalHours = effectiveSecs / 3600;

    updateEntry.mutate({
      id: session.id,
      data: {
        clockOut: clockOutTime,
        totalHours: Number(totalHours.toFixed(2)),
        status: 'complete',
      }
    });
  }, [isActivePending, isRecovering, updateEntry]);

  const isClockingIn = createEntry.isPending || isVerifyingClockIn;
  const isClockingOut = updateEntry.isPending;
  const isSessionStateReady = !isActivePending && !isRecovering;
  const isClockActionDisabled = isClockingIn || isClockingOut || !isSessionStateReady;

  return {
    activeSession,
    handleClockIn,
    handleClockOut,
    isClockingIn,
    isClockingOut,
    isRecovering,
    isSessionStateReady,
    isClockActionDisabled,
    isStopping: updateEntry.isPending,
    isActivePending,
  };
}
