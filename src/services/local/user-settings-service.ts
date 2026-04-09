import { db } from '@/db/client';
import { userSettings } from '@/db/schema';
import { eq, InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { parseError } from '@/lib/errors';
import * as Crypto from 'expo-crypto';

export type UserSettings = InferSelectModel<typeof userSettings>;
export type NewUserSettings = InferInsertModel<typeof userSettings>;

export const UserSettingsService = {
  async getByUserId(userId: string): Promise<UserSettings | null> {
    try {
      const results = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);
      return results[0] ?? null;
    } catch (err) {
      throw parseError(err);
    }
  },

  async create(data: Omit<NewUserSettings, 'id'>): Promise<UserSettings> {
    try {
      const id = Crypto.randomUUID();
      const results = await db.insert(userSettings).values({ ...data, id }).returning();
      if (!results[0]) throw new Error('Failed to create user settings');
      return results[0];
    } catch (err) {
      throw parseError(err);
    }
  },

  async update(id: string, data: Partial<Omit<NewUserSettings, 'id'>>): Promise<UserSettings> {
    try {
      const results = await db
        .update(userSettings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(userSettings.id, id))
        .returning();
      if (!results[0]) throw new Error('User settings not found for update');
      return results[0];
    } catch (err) {
      throw parseError(err);
    }
  },
};
