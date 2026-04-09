import { useRouter } from 'expo-router';
import { useCallback } from 'react';

/**
 * Business logic for the Welcome screen.
 * Handles navigation to the profile setup step.
 */
export const useWelcomeScreen = () => {
  const router = useRouter();

  const handleGetStarted = useCallback(() => {
    router.push('/(onboarding)/profile-setup');
  }, [router]);

  return {
    handleGetStarted,
  };
};
