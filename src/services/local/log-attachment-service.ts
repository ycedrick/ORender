import { db } from '@/db/client';
import { logAttachments } from '@/db/schema';
import { eq, InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { parseError } from '@/lib/errors';
import * as Crypto from 'expo-crypto';

export type LogAttachment = InferSelectModel<typeof logAttachments>;
export type NewLogAttachment = InferInsertModel<typeof logAttachments>;

export const LogAttachmentService = {
  async getByDailyLogId(dailyLogId: string): Promise<LogAttachment[]> {
    try {
      return await db.select().from(logAttachments).where(eq(logAttachments.dailyLogId, dailyLogId));
    } catch (err) {
      throw parseError(err);
    }
  },

  async create(data: Omit<NewLogAttachment, 'id'>): Promise<LogAttachment> {
    try {
      const id = Crypto.randomUUID();
      const results = await db.insert(logAttachments).values({ ...data, id }).returning();
      if (!results[0]) throw new Error('Failed to create log attachment');
      return results[0];
    } catch (err) {
      throw parseError(err);
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await db.delete(logAttachments).where(eq(logAttachments.id, id));
    } catch (err) {
      throw parseError(err);
    }
  },
};
