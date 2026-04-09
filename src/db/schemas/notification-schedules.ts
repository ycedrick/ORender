import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

import { userProfile } from './user-profile';

export const notificationSchedules = sqliteTable('notification_schedules', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => userProfile.id),
  type: text('type', { enum: ['clock_in', 'clock_out', 'daily_log'] }).notNull(),
  time: text('time').notNull(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  repeatDaysJson: text('repeat_days_json'),
});
