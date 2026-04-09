import { AppError, ErrorCode } from "./errors";
import { logError } from "./logger";
import { getUserMessage } from "./messages";

// ─────────────────────────────────────────────────────────────────────────────
// parseError — The single entry point for normalising ANY error in the app.
//
// Usage:
//   try { … }
//   catch (err) { const appError = parseError(err); }
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalise any thrown value into a structured `AppError`.
 *
 * Detects the error source automatically:
 *   • Drizzle ORM / SQLite errors
 *   • Validation failures
 *   • Storage failures
 *   • Generic JavaScript errors
 *
 * Already-parsed `AppError` instances pass through untouched.
 */
export function parseError(error: unknown): AppError {
  // 1. Already an AppError — pass through
  if (error instanceof AppError) {
    return error;
  }

  // 2. Not an object at all (string throw, null, etc.)
  if (error === null || error === undefined) {
    return createAppError(ErrorCode.UNKNOWN, "An unknown error occurred", error);
  }

  if (typeof error === "string") {
    return createAppError(
      inferCodeFromMessage(error),
      error,
      error,
    );
  }

  // From here on we know it's an object-like value.
  const err = error as Record<string, unknown>;
  const message = typeof err.message === "string" ? err.message : String(error);

  // 3. Database / SQLite / Drizzle specific detection
  // SQLite errors often have 'code' like 'SQLITE_CONSTRAINT'
  const dbCode = typeof err.code === "string" ? err.code : "";
  if (dbCode.startsWith("SQLITE_")) {
    return parseSqliteError(dbCode, message, error);
  }

  // 4. Generic Error with a message
  if (error instanceof Error) {
    return createAppError(
      inferCodeFromMessage(message),
      message,
      error,
    );
  }

  // 5. Fallback
  return createAppError(ErrorCode.UNKNOWN, message, error);
}

// ─────────────────────────────────────────────────────────────────────────────
// Source-specific parsers
// ─────────────────────────────────────────────────────────────────────────────

function parseSqliteError(
  code: string,
  message: string,
  original: unknown,
): AppError {
  const lower = message.toLowerCase();

  if (code === "SQLITE_CONSTRAINT" && (lower.includes("unique") || lower.includes("already exists"))) {
    return createAppError(ErrorCode.DB_DUPLICATE, message, original);
  }
  
  if (code === "SQLITE_CONSTRAINT") {
    return createAppError(ErrorCode.DB_CONSTRAINT_VIOLATION, message, original);
  }

  if (lower.includes("not found")) {
    return createAppError(ErrorCode.DB_NOT_FOUND, message, original);
  }

  return createAppError(ErrorCode.DB_ERROR, message, original);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Best-effort mapping from raw error message text to an error code.
 */
function inferCodeFromMessage(message: string): ErrorCode {
  const lower = message.toLowerCase();

  if (lower.includes("not found")) return ErrorCode.DB_NOT_FOUND;
  if (lower.includes("duplicate") || lower.includes("already exists")) return ErrorCode.DB_DUPLICATE;
  if (lower.includes("permission") || lower.includes("forbidden")) return ErrorCode.STORAGE_PERMISSION_DENIED;
  if (lower.includes("missing") && lower.includes("field")) return ErrorCode.VALIDATION_MISSING_FIELDS;
  if (lower.includes("invalid") && lower.includes("input")) return ErrorCode.VALIDATION_INVALID_INPUT;
  if (lower.includes("backup")) return ErrorCode.BACKUP_FAILED;
  if (lower.includes("restore") || lower.includes("import")) return ErrorCode.RESTORE_FAILED;

  return ErrorCode.UNKNOWN;
}

/**
 * Create an `AppError` with the user-friendly message auto-resolved from the code.
 */
function createAppError(
  code: ErrorCode,
  technicalMessage: string,
  originalError: unknown,
  statusCode?: number,
): AppError {
  const appError = new AppError({
    code,
    message: technicalMessage,
    userMessage: getUserMessage(code),
    statusCode,
    originalError,
  });

  // Auto-log every error so call-sites don't have to.
  logError(appError);

  return appError;
}
