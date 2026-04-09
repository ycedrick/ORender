import { ErrorCode } from "./errors";

/**
 * User-friendly messages for every error code.
 *
 * These are designed to be shown directly in the UI — they use plain language
 * and never expose technical details.
 */
export const USER_MESSAGES: Record<ErrorCode, string> = {
  // ── Database (SQLite/Drizzle) ─────────────────────────────────────────
  [ErrorCode.DB_ERROR]:
    "A database error occurred. Please try again.",
  [ErrorCode.DB_DUPLICATE]:
    "This record already exists in the database.",
  [ErrorCode.DB_NOT_FOUND]:
    "The requested record could not be found.",
  [ErrorCode.DB_CONSTRAINT_VIOLATION]:
    "This action violates a database rule. Please check your input.",

  // ── Validation ───────────────────────────────────────────────────────
  [ErrorCode.VALIDATION_ERROR]:
    "The information you provided isn't quite right. Please check and try again.",
  [ErrorCode.VALIDATION_MISSING_FIELDS]:
    "Please fill in all the required fields.",
  [ErrorCode.VALIDATION_INVALID_INPUT]:
    "Some of the details you entered are invalid. Please check and try again.",

  // ── Storage (Local File System / Attachments) ────────────────────────
  [ErrorCode.STORAGE_ERROR]:
    "A storage error occurred while managing local files.",
  [ErrorCode.STORAGE_FILE_NOT_FOUND]:
    "The file you're looking for was not found on this device.",
  [ErrorCode.STORAGE_PERMISSION_DENIED]:
    "The app doesn't have permission to access your device's storage.",
  [ErrorCode.STORAGE_QUOTA_EXCEEDED]:
    "Your device is running out of storage space.",

  // ── Backup & Restore ─────────────────────────────────────────────────
  [ErrorCode.BACKUP_FAILED]:
    "We couldn't create a backup of your data. Please try again.",
  [ErrorCode.RESTORE_FAILED]:
    "Something went wrong while restoring your data.",
  [ErrorCode.IMPORT_INVALID_FILE]:
    "The file you're trying to import isn't a valid backup file.",

  // ── Catch-All ────────────────────────────────────────────────────────
  [ErrorCode.UNKNOWN]:
    "Something went wrong. Please try again.",
};

const FALLBACK_MESSAGE = USER_MESSAGES[ErrorCode.UNKNOWN];

/**
 * Get the user-friendly message for a given error code.
 */
export function getUserMessage(code: ErrorCode): string {
  return USER_MESSAGES[code] ?? FALLBACK_MESSAGE;
}
