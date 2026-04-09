import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

import { timeEntries } from './time-entries';

export const breaks = sqliteTable('breaks', {
  id: text('id').primaryKey(),
  timeEntryId: text('time_entry_id').notNull().references(() => timeEntries.id),
  startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
  endTime: integer('end_time', { mode: 'timestamp' }),
  durationMinutes: real('duration_minutes'),
});
