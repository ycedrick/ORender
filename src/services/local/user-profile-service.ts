import { db } from '@/db/client';
import { userProfile } from '@/db/schema';
import { eq, InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { parseError } from '@/lib/errors';
import * as Crypto from 'expo-crypto';

export type UserProfile = InferSelectModel<typeof userProfile>;
export type NewUserProfile = InferInsertModel<typeof userProfile>;

export const UserProfileService = {
  async get(): Promise<UserProfile | undefined> {
    try {
      const results = await db.select().from(userProfile).limit(1);
      return results[0];
    } catch (err) {
      throw parseError(err);
    }
  },

  async create(data: Omit<NewUserProfile, 'id'>): Promise<UserProfile> {
    try {
      const id = Crypto.randomUUID();
      const results = await db.insert(userProfile).values({ ...data, id }).returning();
      if (!results[0]) throw new Error('Failed to create user profile');
      return results[0];
    } catch (err) {
      throw parseError(err);
    }
  },

  async update(id: string, data: Partial<Omit<NewUserProfile, 'id'>>): Promise<UserProfile> {
    try {
      const results = await db
        .update(userProfile)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(userProfile.id, id))
        .returning();
      if (!results[0]) throw new Error('User profile not found for update');
      return results[0];
    } catch (err) {
      throw parseError(err);
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await db.delete(userProfile).where(eq(userProfile.id, id));
    } catch (err) {
      throw parseError(err);
    }
  },
};
