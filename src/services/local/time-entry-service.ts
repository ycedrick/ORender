import { db } from '@/db/client';
import { timeEntries } from '@/db/schema';
import { and, eq, desc, InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { parseError } from '@/lib/errors';
import * as Crypto from 'expo-crypto';

export type TimeEntry = InferSelectModel<typeof timeEntries>;
export type NewTimeEntry = InferInsertModel<typeof timeEntries>;
export interface IncompleteSessionRecoveryResult {
  activeSession: TimeEntry | null;
  recoveredIds: string[];
}

export const TimeEntryService = {
  async getAll(): Promise<TimeEntry[]> {
    try {
      return await db.select().from(timeEntries).orderBy(desc(timeEntries.clockIn));
    } catch (err) {
      throw parseError(err);
    }
  },

  async getById(id: string): Promise<TimeEntry | undefined> {
    try {
      const results = await db.select().from(timeEntries).where(eq(timeEntries.id, id)).limit(1);
      return results[0];
    } catch (err) {
      throw parseError(err);
    }
  },

  async getActiveSession(): Promise<TimeEntry | undefined> {
    try {
      const results = await db
        .select()
        .from(timeEntries)
        .where(eq(timeEntries.status, 'incomplete'))
        .orderBy(desc(timeEntries.clockIn))
        .limit(1);
      return results[0];
    } catch (err) {
      throw parseError(err);
    }
  },

  async getIncompleteSessionsByUser(userId: string): Promise<TimeEntry[]> {
    try {
      return await db
        .select()
        .from(timeEntries)
        .where(and(
          eq(timeEntries.userId, userId),
          eq(timeEntries.status, 'incomplete')
        ))
        .orderBy(desc(timeEntries.clockIn));
    } catch (err) {
      throw parseError(err);
    }
  },

  async recoverIncompleteSessions(userId: string): Promise<IncompleteSessionRecoveryResult> {
    try {
      const incompleteSessions = await this.getIncompleteSessionsByUser(userId);
      if (incompleteSessions.length === 0) {
        return { activeSession: null, recoveredIds: [] };
      }

      const [newestSession, ...olderSessions] = incompleteSessions;
      if (olderSessions.length === 0) {
        return { activeSession: newestSession, recoveredIds: [] };
      }

      const recoveredIds: string[] = [];

      for (const session of olderSessions) {
        const recoveryClockOut = newestSession.clockIn > session.clockIn
          ? newestSession.clockIn
          : new Date();
        const diffSecs = Math.max(0, Math.floor((recoveryClockOut.getTime() - session.clockIn.getTime()) / 1000));
        const effectiveSecs = Math.max(0, diffSecs - (session.breakMinutes * 60));
        const totalHours = Number((effectiveSecs / 3600).toFixed(2));

        await db
          .update(timeEntries)
          .set({
            clockOut: recoveryClockOut,
            totalHours,
            status: 'edited',
            updatedAt: new Date(),
          })
          .where(eq(timeEntries.id, session.id));

        recoveredIds.push(session.id);
      }

      const refreshedSessions = await this.getIncompleteSessionsByUser(userId);

      return {
        activeSession: refreshedSessions[0] ?? null,
        recoveredIds,
      };
    } catch (err) {
      throw parseError(err);
    }
  },

  async create(data: Omit<NewTimeEntry, 'id'>): Promise<TimeEntry> {
    try {
      const id = Crypto.randomUUID();
      const results = await db.insert(timeEntries).values({ ...data, id }).returning();
      if (!results[0]) throw new Error('Failed to create time entry');
      return results[0];
    } catch (err) {
      throw parseError(err);
    }
  },

  async update(id: string, data: Partial<Omit<NewTimeEntry, 'id'>>): Promise<TimeEntry> {
    try {
      const results = await db
        .update(timeEntries)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(timeEntries.id, id))
        .returning();
      if (!results[0]) throw new Error('Time entry not found for update');
      return results[0];
    } catch (err) {
      throw parseError(err);
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await db.delete(timeEntries).where(eq(timeEntries.id, id));
    } catch (err) {
      throw parseError(err);
    }
  },
};
