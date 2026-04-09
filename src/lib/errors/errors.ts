/**
 * Centralized error codes grouped by domain.
 * Every error in the app maps to one of these codes.
 */
export enum ErrorCode {
  // ── Database (SQLite/Drizzle) ─────────────────────────────────────────
  DB_ERROR = "DB_ERROR",
  DB_DUPLICATE = "DB_DUPLICATE",
  DB_NOT_FOUND = "DB_NOT_FOUND",
  DB_CONSTRAINT_VIOLATION = "DB_CONSTRAINT_VIOLATION",

  // ── Validation ───────────────────────────────────────────────────────
  VALIDATION_ERROR = "VALIDATION_ERROR",
  VALIDATION_MISSING_FIELDS = "VALIDATION_MISSING_FIELDS",
  VALIDATION_INVALID_INPUT = "VALIDATION_INVALID_INPUT",

  // ── Storage (Local File System / Attachments) ────────────────────────
  STORAGE_ERROR = "STORAGE_ERROR",
  STORAGE_FILE_NOT_FOUND = "STORAGE_FILE_NOT_FOUND",
  STORAGE_PERMISSION_DENIED = "STORAGE_PERMISSION_DENIED",
  STORAGE_QUOTA_EXCEEDED = "STORAGE_QUOTA_EXCEEDED",

  // ── Backup & Restore ─────────────────────────────────────────────────
  BACKUP_FAILED = "BACKUP_FAILED",
  RESTORE_FAILED = "RESTORE_FAILED",
  IMPORT_INVALID_FILE = "IMPORT_INVALID_FILE",

  // ── Catch-All ────────────────────────────────────────────────────────
  UNKNOWN = "UNKNOWN",
}

/**
 * Set of error codes that are safe for the user to retry.
 * In a local app, most errors are immediate, but some storage or 
 * transient DB locks might be retryable.
 */
const RETRYABLE_CODES = new Set<ErrorCode>([
  ErrorCode.DB_ERROR,
  ErrorCode.STORAGE_ERROR,
  ErrorCode.BACKUP_FAILED,
]);

/**
 * Structured application error.
 *
 * Every error in the app is normalized into an `AppError` so consumers
 * always get a predictable shape — a typed `code`, a user-safe `userMessage`,
 * and enough metadata for logging and retry logic.
 */
export class AppError extends Error {
  /** Machine-readable error type. */
  readonly code: ErrorCode;

  /** Human-friendly message safe to display in the UI. */
  readonly userMessage: string;

  /** HTTP status code, when the error originated from a network response. */
  readonly statusCode?: number;

  /** Whether the user can meaningfully retry the failed action. */
  readonly isRetryable: boolean;

  /** The original, unparsed error — preserved for logging / debugging. */
  readonly originalError?: unknown;

  constructor(params: {
    code: ErrorCode;
    message: string;
    userMessage: string;
    statusCode?: number;
    isRetryable?: boolean;
    originalError?: unknown;
  }) {
    super(params.message);
    this.name = "AppError";
    this.code = params.code;
    this.userMessage = params.userMessage;
    this.statusCode = params.statusCode;
    this.isRetryable = params.isRetryable ?? RETRYABLE_CODES.has(params.code);
    this.originalError = params.originalError;
  }

  /** Serialisable representation for logging / telemetry. */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      statusCode: this.statusCode,
      isRetryable: this.isRetryable,
    };
  }
}
