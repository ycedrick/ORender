import { db } from '@/db/client';
import { backupHistory } from '@/db/schema';
import { eq, desc, InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { parseError } from '@/lib/errors';
import * as Crypto from 'expo-crypto';

export type BackupHistory = InferSelectModel<typeof backupHistory>;
export type NewBackupHistory = InferInsertModel<typeof backupHistory>;

export const BackupHistoryService = {
  async getByUserId(userId: string): Promise<BackupHistory[]> {
    try {
      return await db
        .select()
        .from(backupHistory)
        .where(eq(backupHistory.userId, userId))
        .orderBy(desc(backupHistory.createdAt));
    } catch (err) {
      throw parseError(err);
    }
  },

  async create(data: Omit<NewBackupHistory, 'id'>): Promise<BackupHistory> {
    try {
      const id = Crypto.randomUUID();
      const results = await db.insert(backupHistory).values({ ...data, id }).returning();
      if (!results[0]) throw new Error('Failed to create backup history entry');
      return results[0];
    } catch (err) {
      throw parseError(err);
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await db.delete(backupHistory).where(eq(backupHistory.id, id));
    } catch (err) {
      throw parseError(err);
    }
  },
};
