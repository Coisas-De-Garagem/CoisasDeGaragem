/**
 * Safely extracts a human-readable message from a caught value of type
 * `unknown` (the type of `catch` clauses since TypeScript 4.4).
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
