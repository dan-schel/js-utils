// Ripped from Zod v3.25.67 to avoid the peer dependency. May need updating to
// support future Zod versions.
const zodCustom = "custom" as const;
const zodNever = Object.freeze({ status: "aborted" }) as never;
type ZodAddIssueArgs = { code: typeof zodCustom; message: string };
type ZodRefinementCtx = { addIssue: (args: ZodAddIssueArgs) => void };

/**
 * Builds a Zod transformation function with a built-in try/catch, so any thrown
 * errors will be caught and added as a custom issue to the Zod context.
 * @param transformFn The transformation function to apply to the input.
 * @param errorMessage Optional error message to use if no error message can be
 * extracted from the thrown error.
 */
export function buildZodTransform<I, O>(
  transformFn: (input: I) => O,
  errorMessage: string = "Error thrown during transformation.",
) {
  return (input: I, ctx: ZodRefinementCtx): O => {
    try {
      return transformFn(input);
    } catch (error) {
      ctx.addIssue({
        code: zodCustom,
        message: hasMessage(error) ? error.message : errorMessage,
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

// TODO: Could probably add numberStringJson, intStringJson, etc. helper types
// using a similar technique:

// export function createZodHelpers(z: ZodInterface) {
//   return {
//     numberStringJson: z.string().transform(/* etc. */),
//     intStringJson: z.string().transform(/* etc. */),
//   };
// }

// Then it can be used like:

// import { z } from "zod";
// export const { numberStringJson, intStringJson } = createZodHelpers(z);
