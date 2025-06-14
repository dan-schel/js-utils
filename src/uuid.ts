import { v4 } from "uuid";

/**
 * Returns a random UUID string.
 */
export function uuid(): string {
  // Using UUID package over crypto.randomUUID because the crypto API is
  // unavailable when using HTTP instead of HTTPS (impacts testing over LAN).
  return v4();
}
