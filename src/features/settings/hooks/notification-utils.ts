import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { ReminderType } from './settings-utils';

export interface ReminderScheduleInput {
  type: ReminderType;
  enabled: boolean;
  time: string;
  repeatDays: number[];
}

const REMINDER_CONTENT: Record<ReminderType, { title: string; body: string }> = {
  clock_in: {
    title: 'Time to clock in',
    body: 'Start your shift and keep your OJT attendance on track.',
  },
  clock_out: {
    title: 'Ready to clock out?',
    body: 'Wrap up your active session so your hours stay accurate.',
  },
  daily_log: {
    title: 'Complete your daily log',
    body: 'Capture today’s tasks and activities while they are still fresh.',
  },
};

export const configureNotificationPresentation = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
};

export const ensureReminderChannel = async () => {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('reminders', {
    name: 'Reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
};

export const requestReminderPermissions = async () => {
  if (Platform.OS === 'web') return false;

  const currentPermissions = await Notifications.getPermissionsAsync();
  if (currentPermissions.granted) return true;

  const requestedPermissions = await Notifications.requestPermissionsAsync();
  return requestedPermissions.granted;
};

export const syncReminderNotifications = async (schedules: ReminderScheduleInput[]) => {
  if (Platform.OS === 'web') return;

  await ensureReminderChannel();
  await Notifications.cancelAllScheduledNotificationsAsync();

  const enabledSchedules = schedules.filter((schedule) => schedule.enabled && schedule.repeatDays.length > 0);

  for (const schedule of enabledSchedules) {
    const [hoursText = '0', minutesText = '0'] = schedule.time.split(':');
    const hour = Number(hoursText);
    const minute = Number(minutesText);

    for (const weekday of schedule.repeatDays) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: REMINDER_CONTENT[schedule.type].title,
          body: REMINDER_CONTENT[schedule.type].body,
          sound: 'default',
          data: {
            source: 'ojt-tracker',
            reminderType: schedule.type,
          },
        },
        trigger: {
          type: 'weekly',
          weekday,
          hour,
          minute,
        },
      });
    }
  }
};
