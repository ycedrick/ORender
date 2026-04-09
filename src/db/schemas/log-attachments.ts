import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

import { dailyLogs } from './daily-logs';

export const logAttachments = sqliteTable('log_attachments', {
  id: text('id').primaryKey(),
  dailyLogId: text('daily_log_id').notNull().references(() => dailyLogs.id),
  filePath: text('file_path').notNull(),
  fileName: text('file_name').notNull(),
  mimeType: text('mime_type'),
  fileSize: integer('file_size'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
