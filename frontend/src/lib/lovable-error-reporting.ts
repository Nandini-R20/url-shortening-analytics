/**
 * Error reporting utility for the application.
 * Captures and reports errors from React error boundaries.
 */

export function reportLovableError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  console.error("[ErrorBoundary]", error, context);
}
