import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Updates from 'expo-updates';

const RECHECK_INTERVAL_MS = 5 * 60 * 1000;

export function useAppUpdates() {
  const lastCheckAtRef = useRef<number>(0);
  const isCheckingRef = useRef(false);

  useEffect(() => {
    if (__DEV__ || !Updates.isEnabled) {
      return;
    }

    let mounted = true;

    const checkForUpdates = async (force = false) => {
      const now = Date.now();
      if (!force && now - lastCheckAtRef.current < RECHECK_INTERVAL_MS) {
        return;
      }

      if (isCheckingRef.current) {
        return;
      }

      isCheckingRef.current = true;
      lastCheckAtRef.current = now;

      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
        }
      } catch (error) {
        if (__DEV__) {
          console.log('[UPDATES] Background update check failed:', error);
        }
      } finally {
        if (mounted) {
          isCheckingRef.current = false;
        }
      }
    };

    const initialTimer = setTimeout(() => {
      void checkForUpdates(true);
    }, 1500);

    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        void checkForUpdates();
      }
    });

    return () => {
      mounted = false;
      clearTimeout(initialTimer);
      subscription.remove();
    };
  }, []);
}
