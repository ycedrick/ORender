import { db } from '@/db/client';
import { breaks } from '@/db/schema';
import { eq, InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { parseError } from '@/lib/errors';
import * as Crypto from 'expo-crypto';

export type Break = InferSelectModel<typeof breaks>;
export type NewBreak = InferInsertModel<typeof breaks>;

export const BreakService = {
  async getByTimeEntryId(timeEntryId: string): Promise<Break[]> {
    try {
      return await db.select().from(breaks).where(eq(breaks.timeEntryId, timeEntryId));
    } catch (err) {
      throw parseError(err);
    }
  },

  async create(data: Omit<NewBreak, 'id'>): Promise<Break> {
    try {
      const id = Crypto.randomUUID();
      const results = await db.insert(breaks).values({ ...data, id }).returning();
      if (!results[0]) throw new Error('Failed to create break');
      return results[0];
    } catch (err) {
      throw parseError(err);
    }
  },

  async update(id: string, data: Partial<Omit<NewBreak, 'id'>>): Promise<Break> {
    try {
      const results = await db.update(breaks).set(data).where(eq(breaks.id, id)).returning();
      if (!results[0]) throw new Error('Break not found for update');
      return results[0];
    } catch (err) {
      throw parseError(err);
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await db.delete(breaks).where(eq(breaks.id, id));
    } catch (err) {
      throw parseError(err);
    }
  },
};
