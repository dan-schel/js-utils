/**
 * Returns a random UUID string.
 */
export function uuid(): string {
  return crypto.randomUUID();
}
