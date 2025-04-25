// NOTE: Changing any of the below encoding alphabets/algorithms is a breaking
// change that is probably super easy to forget about! Don't do it!

/** An encoding/decoding alphabet using the numbers 0-9. */
export const decimal = "0123456789";

/** An encoding/decoding alphabet using ASCII letters only (no numbers). */
export const alpha = "abcdefghijklmnopqrstuvwxyz";

/**
 * An encoding/decoding alphabet using decimal numbers and lowercase letters.
 */
export const base36 = "0123456789abcdefghijklmnopqrstuvwxyz";

/**
 * An encoding/decoding alphabet using decimal numbers, lowercase letters,
 * uppercase letters, underscores, and dashes.
 */
export const base64 =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-";

/**
 * An encoding/decoding alphabet similar to base64, but with some letters and
 * numbers strategically removed to improve readability (avoids lookalike
 * characters) and curb accidental profanity.
 */
export const base48Safe = "2345679bcdfghjkmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ";

/**
 * Encodes/decodes a string from the given "from" alphabet to the given "to"
 * alphabet. The process is symmetric, so to decode the string, call the same
 * function with the "from" and "to" alphabets swapped. Throws an error if a
 * character within the input string is not in the "from" alphabet.
 * @param input The string to encode/decode.
 * @param fromAlpha The alphabet the input string is using, e.g. decimal.
 * @param toAlpha The alphabet the output string should use, e.g. base-64.
 */
export function reencode(
  input: string,
  fromAlpha: string,
  toAlpha: string,
): string {
  return stringFromValue(stringToValue(input, fromAlpha, true), toAlpha);
}

/**
 * Encodes/decodes a string from the given "from" alphabet to the given "to"
 * alphabet. The process is symmetric, so to decode the string, call the same
 * function with the "from" and "to" alphabets swapped. Returns null if a
 * character within the input string is not in the "from" alphabet.
 * @param input The string to encode/decode.
 * @param fromAlpha The alphabet the input string is using, e.g. decimal.
 * @param toAlpha The alphabet the output string should use, e.g. base-64.
 */
export function tryReencode(
  input: string,
  fromAlpha: string,
  toAlpha: string,
): string | null {
  const value = stringToValue(input, fromAlpha, false);
  if (value == null) {
    return null;
  }
  return stringFromValue(value, toAlpha);
}

/**
 * Converts a given string to a numeric value, according to the given alphabet.
 * For example, using the alphabet `"012"`, strings `["", "0", "1", "2", "00",
 * "01", "02", ...]` become `[0, 1, 2, 3, 4, 5, 6, ...]` respectively. A
 * `bigint` is used to ensure that any length string can be converted.
 * @param input The string to obtain the numeric value of.
 * @param alpha The alphabet the string should be counted against.
 * @param throwOnFail True if the function should throw an error if a character
 * within the string is not in the given alphabet, if false, the function will
 * instead return null.
 */
function stringToValue(input: string, alpha: string, throwOnFail: true): bigint;
function stringToValue(
  input: string,
  alpha: string,
  throwOnFail: false,
): bigint | null;
function stringToValue(
  input: string,
  alpha: string,
  throwOnFail: boolean,
): bigint | null {
  let value = BigInt(0);
  let multiplier = BigInt(1);

  for (let i = input.length - 1; i >= 0; i--) {
    const char = input[i];
    const alphaIndex = alpha.indexOf(char);
    if (alphaIndex < 0) {
      if (throwOnFail) {
        throw new Error(`The "${char}" character is not allowed.`);
      } else {
        return null;
      }
    }

    value += BigInt(alphaIndex + 1) * multiplier;
    multiplier *= BigInt(alpha.length);
  }

  return value;
}

/**
 * Converts a given numeric value to a string, according to the given alphabet.
 * For example, using the alphabet `"012"`, numbers `[0, 1, 2, 3, 4, 5, 6, ...]`
 * become `["", "0", "1", "2", "00", "01", "02", ...]` respectively. This is
 * used as the inverse of {@link stringToValue}.
 * @param value The number to obtain the string for.
 * @param alpha The alphabet the string should be counted against.
 */
function stringFromValue(value: bigint, alpha: string): string {
  if (value === BigInt(0)) {
    return "";
  }

  const alphaLength = BigInt(alpha.length);

  let result = "";
  let runningValue = value;

  while (runningValue > 0) {
    runningValue -= BigInt(1);

    const index = runningValue % alphaLength;
    const char = alpha[Number(index)];
    result = char + result;

    runningValue /= alphaLength;
  }
  return result;
}
