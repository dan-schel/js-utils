import { describe, it, expect } from "vitest";
import { base64, decimal, itsOk, reencode, tryReencode } from "../src/index.js";

describe("reencode", () => {
  it("works", () => {
    const inputAlpha = "0123456789.";

    const strings = ["", "0", ".", "00", "20230313.142900.315.241"];
    for (const str of strings) {
      // Use reencode.
      expect(
        reencode(reencode(str, inputAlpha, base64), base64, inputAlpha),
      ).toBe(str);

      // Use tryReencode.
      const encoded = tryReencode(str, inputAlpha, base64);
      expect(encoded).not.toBeNull();
      expect(tryReencode(itsOk(encoded), base64, inputAlpha)).toBe(str);
    }
  });

  it("converts values correctly", () => {
    const inputAlpha = "0123456789.";
    expect(reencode("", inputAlpha, base64)).toBe("");
    expect(tryReencode("", inputAlpha, base64)).toBe("");
    expect(reencode("20230313.142900.315.241", inputAlpha, base64)).toBe(
      "QLH_XPPqOjola",
    );
    expect(tryReencode("20230313.142900.315.241", inputAlpha, base64)).toBe(
      "QLH_XPPqOjola",
    );

    expect(reencode("0", "012", decimal)).toBe("0");
    expect(tryReencode("0", "012", decimal)).toBe("0");
    expect(reencode("1", "012", decimal)).toBe("1");
    expect(tryReencode("1", "012", decimal)).toBe("1");
    expect(reencode("2", "012", decimal)).toBe("2");
    expect(tryReencode("2", "012", decimal)).toBe("2");
    expect(reencode("00", "012", decimal)).toBe("3");
    expect(tryReencode("00", "012", decimal)).toBe("3");
    expect(reencode("01", "012", decimal)).toBe("4");
    expect(tryReencode("01", "012", decimal)).toBe("4");
    expect(reencode("02", "012", decimal)).toBe("5");
    expect(tryReencode("02", "012", decimal)).toBe("5");
    expect(reencode("10", "012", decimal)).toBe("6");
    expect(tryReencode("10", "012", decimal)).toBe("6");
  });

  it("handles same-alphabet conversions", () => {
    expect(reencode("cAt123", base64, base64)).toBe("cAt123");
    expect(tryReencode("cAt123", base64, base64)).toBe("cAt123");
    expect(reencode("0", decimal, decimal)).toBe("0");
    expect(tryReencode("0", decimal, decimal)).toBe("0");
    expect(reencode("", decimal, decimal)).toBe("");
    expect(tryReencode("", decimal, decimal)).toBe("");
    expect(reencode("00", decimal, decimal)).toBe("00");
    expect(tryReencode("00", decimal, decimal)).toBe("00");
    expect(reencode("13", decimal, decimal)).toBe("13");
    expect(tryReencode("13", decimal, decimal)).toBe("13");
  });

  it("fails on invalid input", () => {
    expect(() => reencode("123a", decimal, base64)).toThrow();
    expect(tryReencode("123a", decimal, base64)).toBeNull();
    expect(() => reencode("cat", decimal, base64)).toThrow();
    expect(tryReencode("cat", decimal, base64)).toBeNull();
  });
});
