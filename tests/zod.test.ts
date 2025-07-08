import { expect, describe, it } from "vitest";
import { buildZodTransform } from "../src/zod";

const zodNever = Object.freeze({ status: "aborted" }) as never;

function createMockZodContext() {
  type ZodIssue = { code: string; message: string };
  const issues: ZodIssue[] = [];
  return {
    addIssue: (args: ZodIssue) => issues.push(args),
    issues,
  };
}

describe("buildZodTransform", () => {
  describe("the transform function succeeds", () => {
    function fn(input: string): number {
      return parseInt(input, 10);
    }

    it("returns the transformed value and doesn't add any issues", () => {
      const transform = buildZodTransform(fn);
      const ctx = createMockZodContext();
      const result = transform("42", ctx);

      expect(result).toBe(42);
      expect(ctx.issues).toHaveLength(0);
    });
  });

  describe("the transform function throws an error", () => {
    describe("with a message", () => {
      function fn(_input: string): number {
        throw new Error("Custom error message");
      }

      it("returns zodNever, and adds an issue with the error message", () => {
        const transform = buildZodTransform(fn);
        const ctx = createMockZodContext();
        const result = transform("invalid", ctx);

        expect(result).toEqual(zodNever);
        expect(ctx.issues).toHaveLength(1);
        expect(ctx.issues[0]).toEqual({
          code: "custom",
          message: "Custom error message",
        });
      });
    });

    describe("without a message", () => {
      function fn(_input: string): number {
        throw "Something that isn't an error object";
      }

      it("returns zodNever, and adds an issue with a default error message", () => {
        const transform = buildZodTransform(fn);
        const ctx = createMockZodContext();
        const result = transform("invalid", ctx);

        expect(result).toEqual(zodNever);
        expect(ctx.issues).toHaveLength(1);
        expect(ctx.issues[0]).toEqual({
          code: "custom",
          message: "Error thrown during transformation.",
        });
      });

      describe("when supplied with an override error message", () => {
        it("returns zodNever, and adds an issue with the override error message", () => {
          const transform = buildZodTransform(fn, "Custom override message");
          const ctx = createMockZodContext();
          const result = transform("invalid", ctx);

          expect(result).toEqual(zodNever);
          expect(ctx.issues).toHaveLength(1);
          expect(ctx.issues[0]).toEqual({
            code: "custom",
            message: "Custom override message",
          });
        });
      });
    });
  });
});
