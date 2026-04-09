import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

import { userProfile } from './user-profile';

export const savedTasks = sqliteTable('saved_tasks', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => userProfile.id),
  label: text('label').notNull().unique(),
  useCount: integer('use_count').notNull().default(1),
  lastUsedAt: integer('last_used_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
