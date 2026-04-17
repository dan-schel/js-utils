import { describe, it, expect } from "vitest";
import { deepEquals } from "../src/index.js";

describe("deepEquals", () => {
  it("handles primitive values", () => {
    expect(deepEquals(1, 1)).toStrictEqual(true);
    expect(deepEquals("cat", "cat")).toStrictEqual(true);
    expect(deepEquals(true, true)).toStrictEqual(true);

    expect(deepEquals(1, 2)).toStrictEqual(false);
    expect(deepEquals("cat", "dog")).toStrictEqual(false);
    expect(deepEquals(true, false)).toStrictEqual(false);
    expect(deepEquals(1, "1")).toStrictEqual(false);
  });

  it("handles null and undefined", () => {
    expect(deepEquals(null, null)).toStrictEqual(true);
    expect(deepEquals(undefined, undefined)).toStrictEqual(true);

    expect(deepEquals(null, undefined)).toStrictEqual(false);
    expect(deepEquals(null, {})).toStrictEqual(false);
    expect(deepEquals(undefined, [])).toStrictEqual(false);
  });

  it("handles same-reference values", () => {
    const obj = { a: 1 };
    const arr = [1, 2, 3];

    expect(deepEquals(obj, obj)).toStrictEqual(true);
    expect(deepEquals(arr, arr)).toStrictEqual(true);
  });

  it("handles arrays", () => {
    expect(deepEquals([], [])).toStrictEqual(true);
    expect(deepEquals([1, 2, 3], [1, 2, 3])).toStrictEqual(true);
    expect(deepEquals([1, [2, 3]], [1, [2, 3]])).toStrictEqual(true);

    expect(deepEquals([1, 2, 3], [3, 2, 1])).toStrictEqual(false);
    expect(deepEquals([1, 2], [1, 2, 3])).toStrictEqual(false);
    expect(deepEquals([1, [2, 3]], [1, [2, 4]])).toStrictEqual(false);
  });

  it("handles plain objects", () => {
    expect(deepEquals({}, {})).toStrictEqual(true);
    expect(deepEquals({ a: 1, b: 2 }, { a: 1, b: 2 })).toStrictEqual(true);
    expect(deepEquals({ a: 1, b: 2 }, { b: 2, a: 1 })).toStrictEqual(true);

    expect(deepEquals({ a: 1 }, { a: 2 })).toStrictEqual(false);
    expect(deepEquals({ a: 1 }, { a: 1, b: 2 })).toStrictEqual(false);
    expect(deepEquals({ a: 1, b: 2 }, { a: 1, c: 2 })).toStrictEqual(false);
  });

  it("handles nested object and array combinations", () => {
    const left = {
      user: { id: 1, tags: ["a", "b"] },
      options: [{ enabled: true }, { enabled: false }],
    };

    const right = {
      user: { id: 1, tags: ["a", "b"] },
      options: [{ enabled: true }, { enabled: false }],
    };

    const changed = {
      user: { id: 1, tags: ["a", "c"] },
      options: [{ enabled: true }, { enabled: false }],
    };

    expect(deepEquals(left, right)).toStrictEqual(true);
    expect(deepEquals(left, changed)).toStrictEqual(false);
  });

  it("does not treat arrays and objects as equivalent", () => {
    expect(deepEquals([], {})).toStrictEqual(false);
    expect(deepEquals(["0"], { 0: "0" })).toStrictEqual(false);
  });

  it("treats missing and undefined properties as different", () => {
    expect(deepEquals({ a: undefined }, {})).toStrictEqual(false);
    expect(deepEquals({}, { a: undefined })).toStrictEqual(false);
  });
});
