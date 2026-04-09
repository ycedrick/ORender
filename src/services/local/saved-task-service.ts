import { db } from '@/db/client';
import { savedTasks } from '@/db/schema';
import { eq, desc, InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { parseError } from '@/lib/errors';
import * as Crypto from 'expo-crypto';

export type SavedTask = InferSelectModel<typeof savedTasks>;
export type NewSavedTask = InferInsertModel<typeof savedTasks>;

export const SavedTaskService = {
  async getAll(): Promise<SavedTask[]> {
    try {
      return await db.select().from(savedTasks).orderBy(desc(savedTasks.useCount));
    } catch (err) {
      throw parseError(err);
    }
  },

  async create(data: Omit<NewSavedTask, 'id'>): Promise<SavedTask> {
    try {
      const id = Crypto.randomUUID();
      const results = await db.insert(savedTasks).values({ ...data, id }).returning();
      if (!results[0]) throw new Error('Failed to create saved task');
      return results[0];
    } catch (err) {
      throw parseError(err);
    }
  },

  async incrementUseCount(id: string): Promise<void> {
    try {
      const results = await db.select().from(savedTasks).where(eq(savedTasks.id, id)).limit(1);
      if (results[0]) {
        await db
          .update(savedTasks)
          .set({ 
            useCount: results[0].useCount + 1,
            lastUsedAt: new Date()
          })
          .where(eq(savedTasks.id, id));
      }
    } catch (err) {
      throw parseError(err);
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await db.delete(savedTasks).where(eq(savedTasks.id, id));
    } catch (err) {
      throw parseError(err);
    }
  },
};
