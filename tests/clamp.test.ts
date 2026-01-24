import { describe, it, expect } from "vitest";
import { clamp, map, mapClamp } from "../src/index.js";

describe("clamp", () => {
  it("works", () => {
    expect(clamp(5, 0, 4)).toStrictEqual(4);
    expect(clamp(5, 4, 0)).toStrictEqual(4);
    expect(clamp(3, 0, 4)).toStrictEqual(3);
    expect(clamp(-5, 0, -4)).toStrictEqual(-4);
    expect(clamp(-5, -4, 0)).toStrictEqual(-4);
    expect(clamp(-3, 0, -4)).toStrictEqual(-3);
  });
});

describe("map", () => {
  it("works", () => {
    expect(map(5, 0, 4, 9, 10)).toBeCloseTo(10.25, 5);
    expect(map(5, 4, 0, 9, 10)).toBeCloseTo(8.75, 5);
    expect(map(3, 0, 4, 9, 10)).toBeCloseTo(9.75, 5);
    expect(map(-5, 0, -4, 9, 10)).toBeCloseTo(10.25, 5);
    expect(map(-5, -4, 0, 9, 10)).toBeCloseTo(8.75, 5);
    expect(map(-3, 0, -4, 9, 10)).toBeCloseTo(9.75, 5);
  });
});

describe("mapClamp", () => {
  it("works", () => {
    expect(mapClamp(5, 0, 4, 9, 10)).toBeCloseTo(10, 5);
    expect(mapClamp(5, 4, 0, 9, 10)).toBeCloseTo(9, 5);
    expect(mapClamp(3, 0, 4, 9, 10)).toBeCloseTo(9.75, 5);
    expect(mapClamp(-5, 0, -4, 9, 10)).toBeCloseTo(10, 5);
    expect(mapClamp(-5, -4, 0, 9, 10)).toBeCloseTo(9, 5);
    expect(mapClamp(-3, 0, -4, 9, 10)).toBeCloseTo(9.75, 5);
  });
});
