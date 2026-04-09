import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

import { userProfile } from './user-profile';
import { timeEntries } from './time-entries';

export const dailyLogs = sqliteTable('daily_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => userProfile.id),
  timeEntryId: text('time_entry_id').references(() => timeEntries.id),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  title: text('title'),
  description: text('description'),
  tasksJson: text('tasks_json'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
