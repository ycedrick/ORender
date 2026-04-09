import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';


export const userProfile = sqliteTable('user_profile', {
  id: text('id').primaryKey(),
  fullName: text('full_name').notNull(),
  studentId: text('student_id'),
  school: text('school'),
  department: text('department'),
  company: text('company'),
  supervisorName: text('supervisor_name'),
  requiredHours: real('required_hours').notNull().default(600),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
