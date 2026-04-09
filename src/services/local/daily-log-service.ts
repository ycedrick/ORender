import { db } from '@/db/client';
import { dailyLogs } from '@/db/schema';
import { eq, desc, InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { parseError } from '@/lib/errors';
import * as Crypto from 'expo-crypto';

export type DailyLog = InferSelectModel<typeof dailyLogs>;
export type NewDailyLog = InferInsertModel<typeof dailyLogs>;

export const DailyLogService = {
  async getAll(): Promise<DailyLog[]> {
    try {
      return await db.select().from(dailyLogs).orderBy(desc(dailyLogs.date));
    } catch (err) {
      throw parseError(err);
    }
  },

  async getById(id: string): Promise<DailyLog | undefined> {
    try {
      const results = await db.select().from(dailyLogs).where(eq(dailyLogs.id, id)).limit(1);
      return results[0];
    } catch (err) {
      throw parseError(err);
    }
  },

  async create(data: Omit<NewDailyLog, 'id'>): Promise<DailyLog> {
    try {
      const id = Crypto.randomUUID();
      const results = await db.insert(dailyLogs).values({ ...data, id }).returning();
      if (!results[0]) throw new Error('Failed to create daily log');
      return results[0];
    } catch (err) {
      throw parseError(err);
    }
  },

  async update(id: string, data: Partial<Omit<NewDailyLog, 'id'>>): Promise<DailyLog> {
    try {
      const results = await db
        .update(dailyLogs)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(dailyLogs.id, id))
        .returning();
      if (!results[0]) throw new Error('Daily log not found for update');
      return results[0];
    } catch (err) {
      throw parseError(err);
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await db.delete(dailyLogs).where(eq(dailyLogs.id, id));
    } catch (err) {
      throw parseError(err);
    }
  },
};
