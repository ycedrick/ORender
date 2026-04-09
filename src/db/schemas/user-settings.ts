import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

import { userProfile } from './user-profile';

export const userSettings = sqliteTable('user_settings', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique().references(() => userProfile.id),
  theme: text('theme', { enum: ['light', 'dark', 'system'] }).notNull().default('system'),
  timeFormat: text('time_format', { enum: ['12h', '24h'] }).notNull().default('12h'),
  clockInReminderEnabled: integer('clock_in_reminder_enabled', { mode: 'boolean' }).notNull().default(false),
  clockInReminderTime: text('clock_in_reminder_time'),
  clockOutReminderEnabled: integer('clock_out_reminder_enabled', { mode: 'boolean' }).notNull().default(false),
  clockOutReminderTime: text('clock_out_reminder_time'),
  dailyLogReminderEnabled: integer('daily_log_reminder_enabled', { mode: 'boolean' }).notNull().default(false),
  dailyLogReminderTime: text('daily_log_reminder_time'),
  locationTaggingEnabled: integer('location_tagging_enabled', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
