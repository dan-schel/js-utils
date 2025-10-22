import { describe, it, expect } from "vitest";
import {
  parseIntThrow,
  parseIntNull,
  posMod,
  NumberRange,
  parseFloatThrow,
  parseFloatNull,
} from "../src/index";

describe("parseIntThrow", () => {
  it("works", () => {
    expect(parseIntThrow("3")).toStrictEqual(3);
    expect(parseIntThrow("-3")).toStrictEqual(-3);

    expect(() => parseIntThrow("3a")).toThrow();
    expect(() => parseIntThrow("-3a")).toThrow();
    expect(() => parseIntThrow("3.2")).toThrow();
    expect(() => parseIntThrow("-3.4")).toThrow();
    expect(() => parseIntThrow("0.0")).toThrow();
  });
});

describe("parseIntNull", () => {
  it("works", () => {
    expect(parseIntNull("3")).toStrictEqual(3);
    expect(parseIntNull("-3")).toStrictEqual(-3);

    expect(parseIntNull("3a")).toBeNull();
    expect(parseIntNull("-3a")).toBeNull();
    expect(parseIntNull("3.2")).toBeNull();
    expect(parseIntNull("-3.4")).toBeNull();
    expect(parseIntNull("0.0")).toBeNull();
  });
});

describe("parseFloatThrow", () => {
  it("works", () => {
    expect(parseFloatThrow("3")).toStrictEqual(3);
    expect(parseFloatThrow("-3")).toStrictEqual(-3);
    expect(parseFloatThrow("0.5")).toStrictEqual(0.5);
    expect(parseFloatThrow("-0.5")).toStrictEqual(-0.5);
    expect(parseFloatThrow("2.666")).toStrictEqual(2.666);
    expect(parseFloatThrow("-2.666")).toStrictEqual(-2.666);
    expect(parseFloatThrow(".666")).toStrictEqual(0.666);
    expect(parseFloatThrow("-.666")).toStrictEqual(-0.666);

    expect(() => parseFloatThrow("3a")).toThrow();
    expect(() => parseFloatThrow("-3a")).toThrow();
    expect(() => parseFloatThrow("3..1")).toThrow();
    expect(() => parseFloatThrow("-123.1.8")).toThrow();
  });
});

describe("parseFloatNull", () => {
  it("works", () => {
    expect(parseFloatNull("3")).toStrictEqual(3);
    expect(parseFloatNull("-3")).toStrictEqual(-3);
    expect(parseFloatNull("0.5")).toStrictEqual(0.5);
    expect(parseFloatNull("-0.5")).toStrictEqual(-0.5);
    expect(parseFloatNull("2.666")).toStrictEqual(2.666);
    expect(parseFloatNull("-2.666")).toStrictEqual(-2.666);
    expect(parseFloatNull(".666")).toStrictEqual(0.666);
    expect(parseFloatNull("-.666")).toStrictEqual(-0.666);

    expect(parseFloatNull("3a")).toBeNull();
    expect(parseFloatNull("-3a")).toBeNull();
    expect(parseFloatNull("3..1")).toBeNull();
    expect(parseFloatNull("-123.1.8")).toBeNull();
  });
});

describe("posMod", () => {
  it("works", () => {
    expect(posMod(0, 4)).toStrictEqual(0);
    expect(posMod(1, 4)).toStrictEqual(1);
    expect(posMod(2, 4)).toStrictEqual(2);
    expect(posMod(3, 4)).toStrictEqual(3);
    expect(posMod(4, 4)).toStrictEqual(0);
    expect(posMod(5, 4)).toStrictEqual(1);
    expect(posMod(6, 4)).toStrictEqual(2);
    expect(posMod(7, 4)).toStrictEqual(3);
    expect(posMod(8, 4)).toStrictEqual(0);

    expect(posMod(-8, 4)).toStrictEqual(0);
    expect(posMod(-7, 4)).toStrictEqual(1);
    expect(posMod(-6, 4)).toStrictEqual(2);
    expect(posMod(-5, 4)).toStrictEqual(3);
    expect(posMod(-4, 4)).toStrictEqual(0);
    expect(posMod(-3, 4)).toStrictEqual(1);
    expect(posMod(-2, 4)).toStrictEqual(2);
    expect(posMod(-1, 4)).toStrictEqual(3);
    expect(posMod(0, 4)).toStrictEqual(0);

    expect(posMod(8.0, 4)).toStrictEqual(0);
    expect(posMod(7.999, 4)).toBeCloseTo(3.999, 8);
    expect(posMod(0.5, 4)).toBeCloseTo(0.5, 8);
    expect(posMod(4.2, 4)).toBeCloseTo(0.2, 8);
    expect(posMod(4.001, 4)).toBeCloseTo(0.001, 8);

    expect(posMod(-4.0, 4)).toStrictEqual(0);
    expect(posMod(-3.999, 4)).toBeCloseTo(0.001, 8);
    expect(posMod(-4.1, 4)).toBeCloseTo(3.9, 8);
    expect(posMod(-2.2, 4)).toBeCloseTo(1.8, 8);
    expect(posMod(-0.001, 4)).toBeCloseTo(3.999, 8);
  });
});

describe("NumberRange", () => {
  describe("parse", () => {
    it("works", () => {
      expect(NumberRange.parse("4")?.min).toStrictEqual(4);
      expect(NumberRange.parse("4")?.max).toStrictEqual(4);
      expect(NumberRange.parse("0.5")?.min).toStrictEqual(0.5);
      expect(NumberRange.parse("0.5")?.max).toStrictEqual(0.5);
      expect(NumberRange.parse(".5")?.min).toStrictEqual(0.5);
      expect(NumberRange.parse(".5")?.max).toStrictEqual(0.5);
      expect(NumberRange.parse("2..5.5")?.min).toStrictEqual(2);
      expect(NumberRange.parse("2..5.5")?.max).toStrictEqual(5.5);

      expect(NumberRange.parse("2...5.5")).toBeNull();
      expect(NumberRange.parse("2...1")).toBeNull();
      expect(NumberRange.parse("..1")).toBeNull();
      expect(NumberRange.parse("1..")).toBeNull();
    });
  });
});
