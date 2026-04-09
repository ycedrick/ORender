import Constants from 'expo-constants';

/**
 * Centralized app constants derived from Expo's app.json / app.config.
 * Import from here instead of using `Constants.expoConfig` directly.
 */
export const appConstants = {
  appName: Constants.expoConfig?.name ?? 'ORender',
  appVersion: Constants.expoConfig?.version ?? '1.0.0',
  appSlug: Constants.expoConfig?.slug ?? 'orender',
} as const;
