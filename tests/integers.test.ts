import { parseIntThrow, parseIntNull, posMod } from "../src/index";

test("parseIntThrow", () => {
  expect(parseIntThrow("3")).toStrictEqual(3);
  expect(parseIntThrow("-3")).toStrictEqual(-3);

  expect(() => parseIntThrow("3a")).toThrow();
  expect(() => parseIntThrow("-3a")).toThrow();

  expect(() => parseIntThrow("3.2")).toThrow();
  expect(() => parseIntThrow("-3.4")).toThrow();
  expect(() => parseIntThrow("0.0")).toThrow();
});

test("parseIntNull", () => {
  expect(parseIntNull("3")).toStrictEqual(3);
  expect(parseIntNull("-3")).toStrictEqual(-3);

  expect(parseIntNull("3a")).toEqual(null);
  expect(parseIntNull("-3a")).toEqual(null);

  expect(parseIntNull("3.2")).toEqual(null);
  expect(parseIntNull("-3.4")).toEqual(null);
  expect(parseIntNull("0.0")).toEqual(null);
});

test("posMod", () => {
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
