import { db } from '@/db/client';
import { notificationSchedules } from '@/db/schema';
import { eq, InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { parseError } from '@/lib/errors';
import * as Crypto from 'expo-crypto';

export type NotificationSchedule = InferSelectModel<typeof notificationSchedules>;
export type NewNotificationSchedule = InferInsertModel<typeof notificationSchedules>;

export const NotificationScheduleService = {
  async getByUserId(userId: string): Promise<NotificationSchedule[]> {
    try {
      return await db.select().from(notificationSchedules).where(eq(notificationSchedules.userId, userId));
    } catch (err) {
      throw parseError(err);
    }
  },

  async create(data: Omit<NewNotificationSchedule, 'id'>): Promise<NotificationSchedule> {
    try {
      const id = Crypto.randomUUID();
      const results = await db.insert(notificationSchedules).values({ ...data, id }).returning();
      if (!results[0]) throw new Error('Failed to create notification schedule');
      return results[0];
    } catch (err) {
      throw parseError(err);
    }
  },

  async update(id: string, data: Partial<Omit<NewNotificationSchedule, 'id'>>): Promise<NotificationSchedule> {
    try {
      const results = await db.update(notificationSchedules).set(data).where(eq(notificationSchedules.id, id)).returning();
      if (!results[0]) throw new Error('Notification schedule not found for update');
      return results[0];
    } catch (err) {
      throw parseError(err);
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await db.delete(notificationSchedules).where(eq(notificationSchedules.id, id));
    } catch (err) {
      throw parseError(err);
    }
  },
};
