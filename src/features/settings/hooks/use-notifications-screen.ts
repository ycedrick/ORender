import { useMemo, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import {
  useCreateNotificationSchedule,
  useNotificationSchedules,
  useUpdateNotificationSchedule,
} from '@/hooks/use-notification-schedules';
import { useUserProfile } from '@/hooks/use-user-profile';
import {
  useCreateUserSettings,
  useUpdateUserSettings,
  useUserSettings,
} from '@/hooks/use-user-settings';
import {
  requestReminderPermissions,
  syncReminderNotifications,
  type ReminderScheduleInput,
} from './notification-utils';
import {
  createDefaultSettingsPayload,
  DEFAULT_REMINDER_TIMES,
  DEFAULT_REPEAT_DAYS,
  formatRepeatDayLabel,
  formatTimeForStorage,
  formatTimeValue,
  parseRepeatDays,
  parseTimeStringToDate,
  REMINDER_METAS,
  resolveUserSettings,
  serializeRepeatDays,
  type ReminderType,
} from './settings-utils';

const REMINDER_SETTING_FIELDS = {
  clock_in: {
    enabled: 'clockInReminderEnabled',
    time: 'clockInReminderTime',
  },
  clock_out: {
    enabled: 'clockOutReminderEnabled',
    time: 'clockOutReminderTime',
  },
  daily_log: {
    enabled: 'dailyLogReminderEnabled',
    time: 'dailyLogReminderTime',
  },
} as const;

export const useNotificationsScreen = () => {
  const router = useRouter();
  const { data: profile, isPending: isProfilePending } = useUserProfile();
  const { data: storedSettings, isPending: isSettingsPending } = useUserSettings(profile?.id);
  const { data: schedules = [], isPending: isSchedulesPending } = useNotificationSchedules(profile?.id);
  const createSchedule = useCreateNotificationSchedule();
  const updateSchedule = useUpdateNotificationSchedule();
  const createSettings = useCreateUserSettings();
  const updateSettings = useUpdateUserSettings();
  const [activePickerType, setActivePickerType] = useState<ReminderType | null>(null);
  const [savingType, setSavingType] = useState<ReminderType | null>(null);

  const settings = useMemo(
    () => (profile ? resolveUserSettings(profile.id, storedSettings) : null),
    [profile, storedSettings]
  );

  const reminders = useMemo(() => {
    return REMINDER_METAS.map((meta) => {
      const existing = schedules.find((schedule) => schedule.type === meta.type);

      return {
        ...meta,
        enabled: existing?.enabled ?? false,
        time: existing?.time ?? DEFAULT_REMINDER_TIMES[meta.type],
        repeatDays: parseRepeatDays(existing?.repeatDaysJson),
      };
    });
  }, [schedules]);

  const persistSettingsPatch = async (patch: Record<string, unknown>) => {
    if (!profile || !settings) return;

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

  const buildNextReminderList = (targetType: ReminderType, updates: Partial<ReminderScheduleInput>) =>
    reminders.map((reminder) => {
      if (reminder.type !== targetType) return reminder;
      return {
        ...reminder,
        ...updates,
      };
    });

  const saveReminder = async (type: ReminderType, updates: Partial<ReminderScheduleInput>) => {
    if (!profile || !settings) {
      Alert.alert('Profile unavailable', 'We could not load your reminder settings right now.');
      return;
    }

    const fields = REMINDER_SETTING_FIELDS[type];
    const existing = schedules.find((schedule) => schedule.type === type);
    const currentReminder = reminders.find((reminder) => reminder.type === type);

    if (!currentReminder) return;

    const nextReminder = {
      ...currentReminder,
      ...updates,
    };

    const nextRepeatDays = nextReminder.repeatDays.length > 0 ? nextReminder.repeatDays : [...DEFAULT_REPEAT_DAYS];
    const nextTime = nextReminder.time || DEFAULT_REMINDER_TIMES[type];

    if (existing) {
      await updateSchedule.mutateAsync({
        id: existing.id,
        data: {
          enabled: nextReminder.enabled,
          time: nextTime,
          repeatDaysJson: serializeRepeatDays(nextRepeatDays),
        },
      });
    } else {
      await createSchedule.mutateAsync({
        userId: profile.id,
        type,
        enabled: nextReminder.enabled,
        time: nextTime,
        repeatDaysJson: serializeRepeatDays(nextRepeatDays),
      });
    }

    await persistSettingsPatch({
      [fields.enabled]: nextReminder.enabled,
      [fields.time]: nextTime,
    });

    await syncReminderNotifications(
      buildNextReminderList(type, {
        enabled: nextReminder.enabled,
        time: nextTime,
        repeatDays: nextRepeatDays,
      })
    );
  };

  const handleToggleReminder = async (type: ReminderType, enabled: boolean) => {
    try {
      if (enabled) {
        const granted = await requestReminderPermissions();
        if (!granted) {
          Alert.alert('Permission required', 'Enable notifications in your device settings to use reminders.');
          return;
        }
      }

      setSavingType(type);
      await saveReminder(type, { enabled });
    } catch {
      Alert.alert('Could not update reminder', 'Please try updating this reminder again.');
    } finally {
      setSavingType(null);
    }
  };

  const handleSaveReminderTime = async (type: ReminderType, date: Date) => {
    try {
      setSavingType(type);
      await saveReminder(type, { time: formatTimeForStorage(date) });
      setActivePickerType(null);
    } catch {
      Alert.alert('Could not update reminder time', 'Please try selecting the time again.');
    } finally {
      setSavingType(null);
    }
  };

  const handleToggleRepeatDay = async (type: ReminderType, day: number) => {
    const currentReminder = reminders.find((reminder) => reminder.type === type);
    if (!currentReminder) return;

    const alreadySelected = currentReminder.repeatDays.includes(day);
    const nextRepeatDays = alreadySelected
      ? currentReminder.repeatDays.filter((value) => value !== day)
      : [...currentReminder.repeatDays, day].sort((left, right) => left - right);

    if (nextRepeatDays.length === 0) {
      Alert.alert('Select at least one day', 'Each reminder needs at least one repeat day.');
      return;
    }

    try {
      setSavingType(type);
      await saveReminder(type, { repeatDays: nextRepeatDays });
    } catch {
      Alert.alert('Could not update repeat days', 'Please try again.');
    } finally {
      setSavingType(null);
    }
  };

  const openTimePicker = (type: ReminderType) => {
    if (Platform.OS === 'ios') {
      setActivePickerType(type);
    }
  };

  return {
    reminders: reminders.map((reminder) => ({
      ...reminder,
      formattedTime: formatTimeValue(reminder.time, settings?.timeFormat ?? '12h'),
      repeatSummary: formatRepeatDayLabel(reminder.repeatDays),
      pickerDate: parseTimeStringToDate(reminder.time),
      isSaving: savingType === reminder.type,
    })),
    settings,
    activePickerType,
    isLoading: isProfilePending || isSettingsPending || isSchedulesPending,
    supportsInlineTimePicker: Platform.OS === 'ios',
    openTimePicker,
    closeTimePicker: () => setActivePickerType(null),
    handleToggleReminder,
    handleSaveReminderTime,
    handleToggleRepeatDay,
    goBack: () => router.back(),
  };
};
