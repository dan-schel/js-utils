import { describe, it, expect } from "vitest";
import {
  kebabify,
  listifyAnd,
  listifyOr,
  isPresent,
  numberWiseSort,
  constify,
} from "../src/index.js";

describe("kebabify", () => {
  it("works", () => {
    expect(kebabify("")).toStrictEqual("");
    expect(kebabify("SCREAM")).toStrictEqual("scream");
    expect(kebabify("Dog food")).toStrictEqual("dog-food");
    expect(kebabify("It's about time!")).toStrictEqual("its-about-time");
    expect(kebabify("Söme fǔnky letţèrs")).toStrictEqual("sme-fnky-letrs");
    expect(kebabify("n0mb3rs are f1ne")).toStrictEqual("n0mb3rs-are-f1ne");
    expect(kebabify("double  space")).toStrictEqual("double-space");
  });
});

describe("constify", () => {
  it("works", () => {
    expect(constify("")).toStrictEqual("");
    expect(constify("whisper")).toStrictEqual("WHISPER");
    expect(constify("Dog food")).toStrictEqual("DOG_FOOD");
    expect(constify("It's about time!")).toStrictEqual("ITS_ABOUT_TIME");
    expect(constify("Söme fǔnky letţèrs")).toStrictEqual("SME_FNKY_LETRS");
    expect(constify("n0mb3rs are f1ne")).toStrictEqual("N0MB3RS_ARE_F1NE");
    expect(constify("double  space")).toStrictEqual("DOUBLE_SPACE");
  });
});

describe("listifyAnd", () => {
  it("works", () => {
    expect(
      listifyAnd(["cat", "dog", "frog", "cog", "fog", "log"]),
    ).toStrictEqual("cat, dog, frog, cog, fog, and log");
    expect(listifyAnd(["cat", "dog", "frog"])).toStrictEqual(
      "cat, dog, and frog",
    );
    expect(listifyAnd(["cat", "dog"])).toStrictEqual("cat and dog");
    expect(listifyAnd(["cat"])).toStrictEqual("cat");
    expect(listifyAnd([])).toStrictEqual("");
  });
});

describe("listifyOr", () => {
  it("works", () => {
    expect(
      listifyOr(["cat", "dog", "frog", "cog", "fog", "log"]),
    ).toStrictEqual("cat, dog, frog, cog, fog, or log");
    expect(listifyOr(["cat", "dog", "frog"])).toStrictEqual(
      "cat, dog, or frog",
    );
    expect(listifyOr(["cat", "dog"])).toStrictEqual("cat or dog");
    expect(listifyOr(["cat"])).toStrictEqual("cat");
    expect(listifyOr([])).toStrictEqual("");
  });
});

describe("isPresent", () => {
  it("works", () => {
    expect(isPresent("hello")).toBe(true);
    expect(isPresent("a")).toBe(true);
    expect(isPresent("")).toBe(false);
    expect(isPresent(null)).toBe(false);
    expect(isPresent(undefined)).toBe(false);
  });
});

describe("numberWiseSort", () => {
  it("works", () => {
    expect(numberWiseSort("item1", "item2")).toBeLessThan(0);
    expect(numberWiseSort("item2", "item10")).toBeLessThan(0);
    expect(numberWiseSort("item10", "item2")).toBeGreaterThan(0);
    expect(numberWiseSort("item1", "item1")).toBe(0);
  });
});
