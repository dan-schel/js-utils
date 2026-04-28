/**
 * Exhaustiveness check helper for discriminated unions. Call this in the
 * default/else branch of a switch or if-else chain to get a compile-time error
 * if the union gains a new variant that isn't handled.
 * @param x The value that should be of type `never`.
 */
export function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${String(x)}`);
}
