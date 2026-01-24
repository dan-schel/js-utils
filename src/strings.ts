/**
 * Returns the same string is kebab-case form. Returned string is guaranteed to
 * only contain a-z, numbers, and dashes. All other symbols such as dollar
 * signs and accented characters will be removed (for better or for worse).
 * @param text The string to convert.
 */
export function kebabify(text: string): string {
  return (
    text
      // Make lowercase.
      .toLowerCase()

      // Replace spaces with dashes.
      .replace(/\s+/g, "-")

      // Remove all other non ASCII letters/numbers.
      .replace(/[^a-z0-9-]/g, "")
  );
}

/**
 * Returns the same string in CONST_CASE form. Returned string is guaranteed to
 * only contain A-Z, numbers, and underscores. All other symbols such as dollar
 * signs and accented characters will be removed (for better or for worse).
 * @param input The string to convert.
 */
export function constify(text: string): string {
  return (
    text
      // Make uppercase.
      .toUpperCase()

      // Replace spaces with underscores.
      .replace(/\s+/g, "_")

      // Remove all other non ASCII letters/numbers.
      .replace(/[^A-Z0-9_]/g, "")
  );
}

/**
 * Creates a list with the specified things, joining them with the provided
 * separators. Returns an empty string if there's no items.
 * @param list The list of things.
 * @param normalSeparator The separator to use the normal case.
 * @param finalSeparator The separator to use for the final item.
 * @param pairSeparator The separator to use if there's only 2 items.
 */
export function listify(
  list: string[],
  normalSeparator: string,
  finalSeparator: string,
  pairSeparator: string,
): string {
  if (list.length === 0) {
    return "";
  }
  if (list.length === 1) {
    return list[0];
  }
  if (list.length === 2) {
    return `${list[0]}${pairSeparator}${list[1]}`;
  }

  const listExceptEnd = list.slice(0, -1).join(normalSeparator);
  const lastItem = list[list.length - 1];
  return `${listExceptEnd}${finalSeparator}${lastItem}`;
}

/**
 * Creates a list with the specified things, joining them with the word "and",
 * e.g. "A, B, and C". Returns an empty string if there's no items.
 * @param list The list of things.
 */
export function listifyAnd(list: string[]): string {
  return listify(list, ", ", ", and ", " and ");
}

/**
 * Creates a list with the specified things, joining them with the word "or",
 * e.g. "A, B, or C". Returns an empty string if there's no items.
 * @param list The list of things.
 */
export function listifyOr(list: string[]): string {
  return listify(list, ", ", ", or ", " or ");
}

/**
 * Returns true if the string is non-null, non-undefined, and has length > 0.
 * @param str The string to check.
 */
export function isPresent(str: string | null | undefined): str is string {
  return str != null && str.length > 0;
}

/**
 * Sorts two strings in such a way that "item1" < "item 2" < "item10".
 * @param a String 1.
 * @param b String 2.
 */
export function numberWiseSort(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true });
}
