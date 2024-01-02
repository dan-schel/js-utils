/**
 * Returns the same string is kebab-case form. Returned string is guaranteed to
 * only contain a-z, numbers, and dashes. All other symbols such as dollar
 * signs, and accented characters will be removed (for better or for worse).
 * @param text The string to convert.
 */
export function kebabify(text: string): string {
  return (
    text
      // Make lowercase.
      .toLowerCase()

      // Replace spaces with dashes.
      .replace(/\s/g, "-")

      // Remove all other non ASCII letters/numbers.
      .replace(/[^a-z0-9-]/g, "")
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
  pairSeparator: string
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
