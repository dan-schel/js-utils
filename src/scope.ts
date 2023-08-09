/**
 * Runs a function on an item then returns the item, similarly to Kotlin's apply
 * function (https://kotlinlang.org/docs/scope-functions.html#apply). Great for
 * modifying properties on an item you just created in situations where you need
 * to write the whole block as an expression.
 * @param item The item to run the function on.
 * @param func The function to run on the item.
 */
export function apply<T>(item: T, func: (item: T) => void): T {
  func(item);
  return item;
}

/**
 * A type guard for nulls. Useful for `array.filter(nonNull)` to get correct
 * Typescript type.
 * @param value The value that might be null.
 */
export function nonNull<T>(value: T | null): value is T {
  return value != null;
}

/**
 * Promises the value won't be null. Throws if it is. Should be used to stop
 * typescript yelling at you when you're ABSOLUTELY SURE this value CANNOT be
 * null.
 * @param val The value.
 */
export function itsOk<T>(val: T | undefined | null): T {
  if (val == null) { throw new Error("Expected non-null value."); }
  return val;
}
