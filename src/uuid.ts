import { v4 } from "uuid";

/**
 * Returns a random UUID string.
 */
export function uuid(): string {
  return v4();
}
