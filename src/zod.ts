import { parseFloatNull, parseIntNull } from "./integers.js";

// Import types only and recreate some types/values manually to avoid dependency
// on zod (it's just a dev dependency).
import { type z as zod } from "zod";
const zodNever = Object.freeze({ status: "aborted" }) as never;
type ZodRefinementCtx = { issues: unknown[] };

/**
 * Creates helper Zod schemas, e.g. `intStringSchema`.
 * @param z `z` from zod. You're required to pass it in, as this library does
 * not directly depend on zod.
 */
export function createSchemaHelpers(z: typeof zod) {
  return {
    intStringSchema: createIntStringSchema(z),
    floatStringSchema: createFloatStringSchema(z),
    booleanStringSchema: createBooleanStringSchema(z),
  };
}

/**
 * A Zod schema which accepts a string and transforms it to an int. Parsing
 * fails if the string does not represent a valid integer.
 * @param z `z` from zod. You're required to pass it in, as this library does
 * not directly depend on zod.
 */
export function createIntStringSchema(z: typeof zod) {
  return z.string().transform((x, ctx) => {
    const result = parseIntNull(x);
    if (result != null) return result;

    ctx.issues.push({ code: "custom", message: "Not an integer.", input: x });
    return z.NEVER;
  });
}

/**
 * A Zod schema which accepts a string and transforms it to a float. Parsing
 * fails if the string does not represent a valid floating-point number.
 * @param z `z` from zod. You're required to pass it in, as this library does
 * not directly depend on zod.
 */
export function createFloatStringSchema(z: typeof zod) {
  return z.string().transform((x, ctx) => {
    const result = parseFloatNull(x);
    if (result != null) return result;

    ctx.addIssue({ code: "custom", message: "Not a number.", input: x });
    return z.NEVER;
  });
}

/**
 * A Zod schema which accepts a string and transforms it to a boolean. Parsing
 * fails if the string is not exactly equal to "true" or "false".
 * @param z `z` from zod. You're required to pass it in, as this library does
 * not directly depend on zod.
 */
export function createBooleanStringSchema(z: typeof zod) {
  return z.enum(["true", "false"]).transform((x) => x === "true");
}

/**
 * Builds a Zod transformation function with a built-in try/catch, so any thrown
 * errors will be caught and added as a custom issue to the Zod context.
 *
 * Usage:
 *
 * ```ts
 * z.string().transform(buildZodTransform((val) => {
 *   // Do something that might throw.
 * }));
 * ```
 *
 * @param transformFn The transformation function to apply to the input.
 * @param errorMessage Optional error message to use if no error message can be
 * extracted from the thrown error.
 */
export function buildZodTransform<I, O>(
  transformFn: (input: I) => O,
  errorMessage: string = "Error thrown during transformation.",
) {
  return (val: I, ctx: ZodRefinementCtx) => {
    try {
      return transformFn(val);
    } catch (e) {
      ctx.issues.push({
        code: "custom",
        message: hasMessage(e) ? e.message : errorMessage,
        input: val,
      });
      return zodNever;
    }
  };
}

function hasMessage(input: unknown): input is { message: string } {
  return (
    typeof input === "object" &&
    input != null &&
    "message" in input &&
    typeof input.message === "string"
  );
}
