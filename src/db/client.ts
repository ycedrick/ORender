import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

/**
 * Singleton SQLite database client using expo-sqlite and drizzle-orm.
 * 
 * Default database name is 'db.sqlite' if DATABASE_NAME environment variable is not provided.
 */
export const expoDb = openDatabaseSync(process.env.DATABASE_NAME ?? 'db.sqlite');

export const db = drizzle(expoDb);
