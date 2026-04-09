import { env } from '@/config/env';
import { expoDb } from '@/db/client';
import { File } from 'expo-file-system';
import JSZip from 'jszip';
import { BACKUP_FORMAT_VERSION, BACKUP_MAGIC } from './export-utils';

/**
 * Parsed manifest from a validated .orender backup.
 */
export interface BackupManifest {
  magic: string;
  formatVersion: number;
  app: string;
  appVersion: string;
  exportedAt: string;
  user: {
    id: string;
    fullName: string;
  };
  contents: string[];
}

/**
 * Result of a successful validation.
 */
export interface ValidatedBackup {
  manifest: BackupManifest;
  databaseBytes: Uint8Array;
}

/**
 * Reads a picked .orender file, unzips it, and validates the manifest.
 * Throws a user-friendly error string on failure.
 */
export async function validateOrenderFile(fileUri: string): Promise<ValidatedBackup> {
  // 1. Read the file bytes
  const pickedFile = new File(fileUri);

  let fileBytes: Uint8Array;
  try {
    fileBytes = pickedFile.bytesSync();
  } catch {
    throw new Error('Could not read the selected file. It may be corrupted or inaccessible.');
  }

  // 2. Open as ZIP
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(fileBytes);
  } catch {
    throw new Error('The selected file is not a valid .orender backup archive.');
  }

  // 3. Read and parse manifest.json
  const manifestFile = zip.file('manifest.json');
  if (!manifestFile) {
    throw new Error('This archive is missing a manifest. It may not be an ORender backup.');
  }

  let manifest: BackupManifest;
  try {
    const manifestText = await manifestFile.async('text');
    manifest = JSON.parse(manifestText);
  } catch {
    throw new Error('The backup manifest is corrupted and could not be read.');
  }

  // 4. Validate magic signature
  if (manifest.magic !== BACKUP_MAGIC) {
    throw new Error('This file is not a valid ORender backup. The signature does not match.');
  }

  // 5. Validate format version
  if (manifest.formatVersion > BACKUP_FORMAT_VERSION) {
    throw new Error(
      `This backup was created with a newer version of the app (format v${manifest.formatVersion}). ` +
      `Please update ORender before restoring.`
    );
  }

  // 6. Extract database.sqlite
  const dbFile = zip.file('database.sqlite');
  if (!dbFile) {
    throw new Error('The backup archive does not contain a database file.');
  }

  let databaseBytes: Uint8Array;
  try {
    databaseBytes = await dbFile.async('uint8array');
  } catch {
    throw new Error('The database file inside the backup could not be extracted.');
  }

  if (databaseBytes.byteLength === 0) {
    throw new Error('The database file inside the backup is empty.');
  }


  return { manifest, databaseBytes };
}

/**
 * Replaces the current SQLite database with the restored bytes.
 * After calling this, the app MUST be restarted for changes to take effect.
 */
export function restoreDatabase(databaseBytes: Uint8Array): void {
  const dbName = env.databaseName;

  // 1. Resolve the exact database file path directly from expo-sqlite BEFORE closing
  let dbPath = expoDb.databasePath;
  if (!dbPath.startsWith('file://')) {
    dbPath = `file://${dbPath}`;
  }

  // 2. Close the active database connection (ignore if already closed)
  try {
    expoDb.closeSync();
  } catch (err) {
    // WAL may not exist — safe to ignore
  }

  const dbFile = new File(dbPath);

  // 3. Remove WAL and SHM files to prevent corruption
  const walFile = new File(`${dbPath}-wal`);
  const shmFile = new File(`${dbPath}-shm`);

  try {
    if (walFile.exists) walFile.delete();
  } catch {
    // WAL may not exist — safe to ignore
  }

  try {
    if (shmFile.exists) shmFile.delete();
  } catch {
    // SHM may not exist — safe to ignore
  }

  // 4. Overwrite the database file with backup bytes
  dbFile.create({ overwrite: true, intermediates: true });
  dbFile.write(databaseBytes);

}
