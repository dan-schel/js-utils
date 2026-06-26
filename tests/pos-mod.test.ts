import { describe, it, expect } from "vitest";
import { posMod } from "../src/index.js";

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
    expect(posMod(-0, 4)).toStrictEqual(0);
  });
});
