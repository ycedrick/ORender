import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

import { userProfile } from './user-profile';

export const timeEntries = sqliteTable('time_entries', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => userProfile.id),
  clockIn: integer('clock_in', { mode: 'timestamp' }).notNull(),
  clockOut: integer('clock_out', { mode: 'timestamp' }),
  totalHours: real('total_hours'),
  breakMinutes: real('break_minutes').notNull().default(0),
  status: text('status', { enum: ['complete', 'incomplete', 'edited'] }).notNull().default('incomplete'),
  isManual: integer('is_manual', { mode: 'boolean' }).notNull().default(false),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
