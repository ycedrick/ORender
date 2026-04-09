import { useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { appConstants } from '@/config/app-constants';
import { useRouter } from 'expo-router';
import { useBackupHistory } from '@/hooks/use-backup-history';
import { useNotificationSchedules } from '@/hooks/use-notification-schedules';
import { useTheme } from '@/hooks/use-theme';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useCreateUserSettings, useUpdateUserSettings, useUserSettings } from '@/hooks/use-user-settings';
import {
  buildBackupSummary,
  buildReminderSummary,
  createDefaultSettingsPayload,
  DEFAULT_SETTINGS_VALUES,
  formatTimeValue,
  ReminderType,
  resolveUserSettings,
  TimeFormatPreference,
  ThemePreference,
} from './settings-utils';

export const useSettingsScreen = () => {
  const router = useRouter();
  const { mode, isSystemDefault, setMode, useSystemDefault: applySystemDefault } = useTheme();
  const { data: profile, isPending: isProfilePending } = useUserProfile();
  const { data: storedSettings, isPending: isSettingsPending } = useUserSettings(profile?.id);
  const { data: schedules = [], isPending: isSchedulesPending } = useNotificationSchedules(profile?.id);
  const { data: backups = [], isPending: isBackupsPending } = useBackupHistory(profile?.id);
  const createSettings = useCreateUserSettings();
  const updateSettings = useUpdateUserSettings();
  const [isSavingTheme, setIsSavingTheme] = useState(false);
  const [isSavingTimeFormat, setIsSavingTimeFormat] = useState(false);

  const settings = useMemo(
    () => (profile ? resolveUserSettings(profile.id, storedSettings ?? undefined) : null),
    [profile, storedSettings]
  );

  const enabledSchedules = useMemo(() => schedules.filter((schedule) => schedule.enabled), [schedules]);
  const nextReminderTime = enabledSchedules[0]?.time ?? null;
  const reminderSummary = useMemo(
    () => buildReminderSummary(enabledSchedules.length, nextReminderTime, settings?.timeFormat ?? DEFAULT_SETTINGS_VALUES.timeFormat),
    [enabledSchedules.length, nextReminderTime, settings?.timeFormat]
  );
  const backupSummary = useMemo(() => buildBackupSummary(backups), [backups]);

  const persistSettings = async (patch: Partial<typeof DEFAULT_SETTINGS_VALUES>) => {
    if (!profile || !settings) {
      Alert.alert('Profile unavailable', 'We could not find your saved profile settings.');
      return;
    }

    if (settings.id) {
      await updateSettings.mutateAsync({
        id: settings.id,
        data: patch,
      });
      return;
    }

    await createSettings.mutateAsync({
      ...createDefaultSettingsPayload(profile.id),
      ...patch,
    });
  };

  const setThemePreference = async (preference: ThemePreference) => {
    try {
      setIsSavingTheme(true);
      await persistSettings({ theme: preference });

      if (preference === 'system') {
        applySystemDefault();
      } else {
        setMode(preference);
      }
    } catch {
      Alert.alert('Could not update theme', 'Please try changing the theme again.');
    } finally {
      setIsSavingTheme(false);
    }
  };

  const setTimeFormatPreference = async (timeFormat: TimeFormatPreference) => {
    try {
      setIsSavingTimeFormat(true);
      await persistSettings({ timeFormat });
    } catch {
      Alert.alert('Could not update time format', 'Please try again.');
    } finally {
      setIsSavingTimeFormat(false);
    }
  };

  const profileSubtitle = profile
    ? [profile.school, profile.company].filter(Boolean).join(' • ') || `Required hours: ${profile.requiredHours}`
    : 'Set up your trainee details and preferences';

  const versionLabel = appConstants.appVersion;

  const routeTo = (path: '/settings/edit-profile' | '/settings/notifications' | '/settings/backup' | '/settings/about') =>
    router.push(path);

  return {
    profile,
    settings,
    isSavingTheme,
    isSavingTimeFormat,
    currentThemePreference: settings?.theme ?? (isSystemDefault ? 'system' : mode),
    currentTimeFormat: settings?.timeFormat ?? DEFAULT_SETTINGS_VALUES.timeFormat,
    profileSubtitle,
    reminderSummary,
    backupSummary,
    versionLabel,
    isLoading: isProfilePending || isSettingsPending || isSchedulesPending || isBackupsPending,
    setThemePreference,
    setTimeFormatPreference,
    navigateToProfile: () => routeTo('/settings/edit-profile'),
    navigateToNotifications: () => routeTo('/settings/notifications'),
    navigateToBackup: () => routeTo('/settings/backup'),
    navigateToAbout: () => routeTo('/settings/about'),
    formatDisplayTime: (time: string | null | undefined) =>
      formatTimeValue(time, settings?.timeFormat ?? DEFAULT_SETTINGS_VALUES.timeFormat),
    reminderTypesEnabled: enabledSchedules.map((schedule) => schedule.type as ReminderType),
  };
};
