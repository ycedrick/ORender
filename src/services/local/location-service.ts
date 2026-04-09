import { db } from '@/db/client';
import { locations } from '@/db/schema';
import { eq, InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { parseError } from '@/lib/errors';
import * as Crypto from 'expo-crypto';

export type Location = InferSelectModel<typeof locations>;
export type NewLocation = InferInsertModel<typeof locations>;

export const LocationService = {
  async getByTimeEntryId(timeEntryId: string): Promise<Location | undefined> {
    try {
      const results = await db.select().from(locations).where(eq(locations.timeEntryId, timeEntryId)).limit(1);
      return results[0];
    } catch (err) {
      throw parseError(err);
    }
  },

  async create(data: Omit<NewLocation, 'id'>): Promise<Location> {
    try {
      const id = Crypto.randomUUID();
      const results = await db.insert(locations).values({ ...data, id }).returning();
      if (!results[0]) throw new Error('Failed to create location');
      return results[0];
    } catch (err) {
      throw parseError(err);
    }
  },

  async update(id: string, data: Partial<Omit<NewLocation, 'id'>>): Promise<Location> {
    try {
      const results = await db.update(locations).set(data).where(eq(locations.id, id)).returning();
      if (!results[0]) throw new Error('Location not found for update');
      return results[0];
    } catch (err) {
      throw parseError(err);
    }
  },
};
