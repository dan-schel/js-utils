/**
 * Parses an integer. Throws an error if the string given is not an integer (it
 * contains decimals, text, or illegal symbols).
 * @param value The string with the integer.
 */
export function parseIntThrow(value: string): number {
  if (!/^-?[0-9]+$/g.test(value)) {
    throw notAnInt(value);
  }
  const num = parseInt(value, 10);
  return num;
}

/**
 * Parses an integer. Returns null if the string given is not an integer (it
 * contains decimals, text, or illegal symbols).
 * @param value The string with the integer.
 */
export function parseIntNull(value: string): number | null {
  if (!/^-?[0-9]+$/g.test(value)) {
    return null;
  }
  const num = parseInt(value, 10);
  return num;
}

/**
 * Parses an integer. Throws an error if the string given is not an integer (it
 * contains decimals, text, or illegal symbols).
 * @param value The string with the integer.
 */
export function parseFloatThrow(value: string): number {
  if (!/^-?[0-9]*\.?[0-9]+$/g.test(value)) {
    throw notAFloat(value);
  }
  const num = parseFloat(value);
  return num;
}

/**
 * Parses an integer. Returns null if the string given is not an integer (it
 * contains decimals, text, or illegal symbols).
 * @param value The string with the integer.
 */
export function parseFloatNull(value: string): number | null {
  if (!/^-?[0-9]*\.?[0-9]+$/g.test(value)) {
    return null;
  }
  const num = parseFloat(value);
  return num;
}

/**
 * "`value`" is not an integer.
 */
const notAnInt = (value: string) => new Error(`"${value}" is not an integer.`);

/**
 * "`value`" is not an floating-point number.
 */
const notAFloat = (value: string) =>
  new Error(`"${value}" is not an floating-point number.`);

/**
 * For positive numbers, does `x % mod` as usual, but extends this pattern to
 * the negatives.
 *
 * For example:
 * - `posMod(-4, 4) = 0`
 * - `posMod(-3, 4) = 1`
 * - `posMod(-2, 4) = 2`
 * - `posMod(-1, 4) = 3`
 * - `posMod(0, 4) = 0`
 * - `posMod(1, 4) = 1`
 * - `posMod(2, 4) = 2`
 * - `posMod(3, 4) = 3`
 * - `posMod(4, 4) = 0`
 *
 * @param x The number to mod.
 * @param mod The mod factor.
 */
export function posMod(x: number, mod: number): number {
  if (x >= 0) {
    return x % mod;
  } else {
    return (x + Math.floor(x) * -mod) % mod;
  }
}

/** Represents a range of values, with a minimum and maximum. */
export class NumberRange {
  /** Creates a {@link NumberRange}. */
  constructor(
    /** The minimum value. */
    readonly min: number,
    /** The maximum value. */
    readonly max: number,
  ) {}

  /**
   * Parses a string like "4" or "2..5.5" to a number range. Returns null on
   * failure.
   * @param input A string, e.g. "4" or "2..5.5".
   */
  static parse(input: string): NumberRange | null {
    if (!input.includes("..")) {
      const n = parseFloatNull(input);
      if (n == null || isNaN(n)) {
        return null;
      }
      return new NumberRange(n, n);
    }

    const components = input.split("..");
    if (
      components.length !== 2 ||
      components[0].startsWith(".") ||
      components[0].endsWith(".") ||
      components[1].startsWith(".") ||
      components[1].endsWith(".")
    ) {
      return null;
    }
    const min = parseFloatNull(components[0]);
    const max = parseFloatNull(components[1]);
    if (min == null || max == null || isNaN(min) || isNaN(max)) {
      return null;
    }
    return new NumberRange(min, max);
  }

  /** E.g. "4" or "2..5.5". */
  asString(): string {
    if (this.min === this.max) {
      return this.min.toString();
    }
    return `${this.min}..${this.max}`;
  }
}
