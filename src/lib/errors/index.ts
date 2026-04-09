/**
 * @module errors
 *
 * Centralised error handling for the app.
 *
 * @example
 * ```ts
 * import { parseError, AppError, ErrorCode } from "@/lib/errors";
 *
 * try {
 *   await someSupabaseCall();
 * } catch (err) {
 *   const appError = parseError(err);
 *   showToast(appError.userMessage);
 *
 *   if (appError.code === ErrorCode.AUTH_SESSION_EXPIRED) {
 *     navigateToLogin();
 *   }
 * }
 * ```
 */
export { AppError, ErrorCode } from "./errors";
export { parseError } from "./parser";
export { getUserMessage, USER_MESSAGES } from "./messages";
export { logError } from "./logger";
