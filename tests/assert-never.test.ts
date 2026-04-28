import { describe, it, expect } from "vitest";
import { assertNever } from "../src/index.js";

describe("assertNever", () => {
  it("throws with the unexpected value in the message", () => {
    expect(() => assertNever("oops" as never)).toThrowError(
      "Unexpected value: oops",
    );
  });
});
