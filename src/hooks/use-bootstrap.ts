import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { 
  Inter_400Regular, 
  Inter_500Medium, 
  Inter_600SemiBold, 
  Inter_700Bold 
} from '@expo-google-fonts/inter';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { db } from '@/db/client';
import migrations from '../../drizzle/migrations';
import { useOnboarding } from './use-onboarding';

/**
 * Hook to handle app-wide bootstrapping tasks.
 * Currently handles:
 * - SQLite database migrations
 * - Font loading (Inter)
 * - Onboarding state loading
 * 
 * @returns { isReady: boolean, error?: Error }
 */
export function useBootstrap() {
  const [isReady, setIsReady] = useState(false);
  const { isLoading: isOnboardingLoading } = useOnboarding();
  
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const { success: migrationsApplied, error: migrationError } = useMigrations(db, migrations);

  useEffect(() => {
    // Keep splash screen visible while bootstrapping
    SplashScreen.preventAutoHideAsync().catch(() => {
      /* ignore error */
    });
  }, []);

  useEffect(() => {
    if (fontsLoaded && migrationsApplied && !isOnboardingLoading) {
      // Once fonts, migrations, and onboarding state are ready, hide splash screen
      SplashScreen.hideAsync().catch(() => {
        /* ignore error */
      });
      setIsReady(true);
    }
  }, [fontsLoaded, migrationsApplied, isOnboardingLoading]);

  return { isReady, error: fontError || migrationError };
}
