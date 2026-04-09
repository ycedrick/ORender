/**
 * Environment variables (EXPO_PUBLIC_ prefixed).
 * For app identity (name, version), use @/config/app-constants instead.
 */
export const env = {
  databaseName: process.env.EXPO_PUBLIC_DATABASE_NAME ?? 'ojt-tracker',
} as const;
