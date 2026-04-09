import { AppError } from "./errors";

// ─────────────────────────────────────────────────────────────────────────────
// Error Logger
//
// A thin logging layer that sits in front of whatever logging service
// we eventually adopt (Sentry, PostHog, etc.).
//
// For now it uses console.error. When we add a real service, swap the
// implementation inside `logError()` — every call-site stays the same.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Log a parsed `AppError`.
 *
 * Currently writes to `console.error`.
 * Replace the body of this function with your logging service later
 * (e.g. Sentry, PostHog, Crashlytics).
 */
export function logError(appError: AppError): void {
  // TODO: Replace with a real logging service (e.g. Sentry.captureException)
  console.error(
    `[AppError] ${appError.code} | ${appError.message}`,
    appError.toJSON(),
  );
}
