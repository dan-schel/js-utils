import { describe, it, expect } from "vitest";
import { kebabify, listifyAnd, listifyOr } from "../src/index";

describe("kebabify", () => {
  it("works", () => {
    expect(kebabify("")).toStrictEqual("");
    expect(kebabify("SCREAM")).toStrictEqual("scream");
    expect(kebabify("Dog food")).toStrictEqual("dog-food");
    expect(kebabify("It's about time!")).toStrictEqual("its-about-time");
    expect(kebabify("Söme fǔnky letţèrs")).toStrictEqual("sme-fnky-letrs");
    expect(kebabify("n0mb3rs are f1ne")).toStrictEqual("n0mb3rs-are-f1ne");
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
