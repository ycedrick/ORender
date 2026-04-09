import { BackupHistory } from '@/services/local/backup-history-service';
import { UserSettings } from '@/services/local/user-settings-service';

export type ThemePreference = 'light' | 'dark' | 'system';
export type TimeFormatPreference = '12h' | '24h';
export type ReminderType = 'clock_in' | 'clock_out' | 'daily_log';

export interface ResolvedUserSettings {
  id?: string;
  userId: string;
  theme: ThemePreference;
  timeFormat: TimeFormatPreference;
  clockInReminderEnabled: boolean;
  clockInReminderTime: string | null;
  clockOutReminderEnabled: boolean;
  clockOutReminderTime: string | null;
  dailyLogReminderEnabled: boolean;
  dailyLogReminderTime: string | null;
  locationTaggingEnabled: boolean;
}

export interface ReminderMeta {
  type: ReminderType;
  title: string;
  description: string;
}

export const REMINDER_METAS: ReminderMeta[] = [
  {
    type: 'clock_in',
    title: 'Clock in reminder',
    description: 'Prompt yourself to start your shift on time.',
  },
  {
    type: 'clock_out',
    title: 'Clock out reminder',
    description: 'Catch open sessions before the day ends.',
  },
  {
    type: 'daily_log',
    title: 'Daily log reminder',
    description: 'Remember to complete your tasks and activities log.',
  },
];

export const DEFAULT_REPEAT_DAYS = [2, 3, 4, 5, 6];

export const DEFAULT_REMINDER_TIMES: Record<ReminderType, string> = {
  clock_in: '08:00',
  clock_out: '17:00',
  daily_log: '19:00',
};

export const DEFAULT_SETTINGS_VALUES = {
  theme: 'system' as ThemePreference,
  timeFormat: '12h' as TimeFormatPreference,
  clockInReminderEnabled: false,
  clockInReminderTime: DEFAULT_REMINDER_TIMES.clock_in,
  clockOutReminderEnabled: false,
  clockOutReminderTime: DEFAULT_REMINDER_TIMES.clock_out,
  dailyLogReminderEnabled: false,
  dailyLogReminderTime: DEFAULT_REMINDER_TIMES.daily_log,
  locationTaggingEnabled: false,
};

export const createDefaultSettingsPayload = (userId: string) => ({
  userId,
  ...DEFAULT_SETTINGS_VALUES,
});

export const resolveUserSettings = (
  userId: string,
  settings?: UserSettings
): ResolvedUserSettings => ({
  id: settings?.id,
  userId,
  theme: (settings?.theme ?? DEFAULT_SETTINGS_VALUES.theme) as ThemePreference,
  timeFormat: (settings?.timeFormat ?? DEFAULT_SETTINGS_VALUES.timeFormat) as TimeFormatPreference,
  clockInReminderEnabled: settings?.clockInReminderEnabled ?? DEFAULT_SETTINGS_VALUES.clockInReminderEnabled,
  clockInReminderTime: settings?.clockInReminderTime ?? DEFAULT_SETTINGS_VALUES.clockInReminderTime,
  clockOutReminderEnabled: settings?.clockOutReminderEnabled ?? DEFAULT_SETTINGS_VALUES.clockOutReminderEnabled,
  clockOutReminderTime: settings?.clockOutReminderTime ?? DEFAULT_SETTINGS_VALUES.clockOutReminderTime,
  dailyLogReminderEnabled: settings?.dailyLogReminderEnabled ?? DEFAULT_SETTINGS_VALUES.dailyLogReminderEnabled,
  dailyLogReminderTime: settings?.dailyLogReminderTime ?? DEFAULT_SETTINGS_VALUES.dailyLogReminderTime,
  locationTaggingEnabled: settings?.locationTaggingEnabled ?? DEFAULT_SETTINGS_VALUES.locationTaggingEnabled,
});

export const parseRepeatDays = (raw?: string | null) => {
  if (!raw) return [...DEFAULT_REPEAT_DAYS];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...DEFAULT_REPEAT_DAYS];
    return parsed
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value >= 1 && value <= 7)
      .sort((left, right) => left - right);
  } catch {
    return [...DEFAULT_REPEAT_DAYS];
  }
};

export const serializeRepeatDays = (days: number[]) => JSON.stringify([...days].sort((left, right) => left - right));

export const parseTimeStringToDate = (time: string) => {
  const [hoursText = '0', minutesText = '0'] = time.split(':');
  const date = new Date();
  date.setHours(Number(hoursText), Number(minutesText), 0, 0);
  return date;
};

export const formatTimeForStorage = (date: Date) =>
  `${`${date.getHours()}`.padStart(2, '0')}:${`${date.getMinutes()}`.padStart(2, '0')}`;

export const formatTimeValue = (time: string | null | undefined, format: TimeFormatPreference) => {
  if (!time) return 'Off';

  const [hoursText = '0', minutesText = '0'] = time.split(':');
  const hours = Number(hoursText);
  const minutes = Number(minutesText);

  if (format === '24h') {
    return `${`${hours}`.padStart(2, '0')}:${`${minutes}`.padStart(2, '0')}`;
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  const normalizedHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${normalizedHours}:${`${minutes}`.padStart(2, '0')} ${period}`;
};

export const formatRepeatDayLabel = (days: number[]) => {
  const normalized = [...days].sort((left, right) => left - right);
  const weekdays = [2, 3, 4, 5, 6];

  if (normalized.length === 7) return 'Every day';
  if (JSON.stringify(normalized) === JSON.stringify(weekdays)) return 'Weekdays';
  if (normalized.length === 2 && normalized[0] === 1 && normalized[1] === 7) return 'Weekends';

  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return normalized.map((day) => labels[day - 1]).join(', ');
};

export const buildReminderSummary = (
  enabledCount: number,
  nextTime: string | null,
  timeFormat: TimeFormatPreference
) => {
  if (enabledCount === 0) return 'No reminders enabled';
  if (!nextTime) return `${enabledCount} reminder${enabledCount > 1 ? 's' : ''} enabled`;
  return `${enabledCount} enabled • Next at ${formatTimeValue(nextTime, timeFormat)}`;
};

export const formatBackupDate = (value: Date | string | number | null | undefined) => {
  if (!value) return 'No exports yet';
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const buildBackupSummary = (backups: BackupHistory[]) => {
  const latest = backups[0];
  if (!latest) return 'No exports yet';
  return `Last export ${formatBackupDate(latest.createdAt)}`;
};

export const formatFileSize = (bytes?: number | null) => {
  if (!bytes || bytes <= 0) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
