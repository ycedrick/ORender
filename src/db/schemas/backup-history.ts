import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

import { userProfile } from './user-profile';

export const backupHistory = sqliteTable('backup_history', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => userProfile.id),
  filePath: text('file_path').notNull(),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size'),
  type: text('type', { enum: ['export', 'import'] }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
