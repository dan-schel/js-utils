import { it, expect, describe } from "vitest";
import { seededRandom } from "../src/index.js";

describe("seededRandom", () => {
  it("always returns values between 0 and 1", () => {
    const rng = seededRandom("test");
    for (let i = 0; i < 100; i++) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it("produces consistent values for same seed", () => {
    const rng1 = seededRandom("test-seed");
    const rng2 = seededRandom("test-seed");
    for (let i = 0; i < 10; i++) {
      expect(rng1()).toStrictEqual(rng2());
    }
  });

  it("produces different values for different seeds", () => {
    const rng1 = seededRandom("seed1");
    const rng2 = seededRandom("seed2");
    for (let i = 0; i < 10; i++) {
      expect(rng1()).not.toStrictEqual(rng2());
    }
  });

  describe("using seed 'test-seed'", () => {
    it("produces expected values", () => {
      const rng = seededRandom("test-seed");
      const expected = [
        0.4492686630692333, 0.20915749948471785, 0.721407589269802,
        0.039358347887173295, 0.8101780202705413, 0.34440386737696826,
        0.16312786610797048, 0.21254437253810465, 0.6570271246600896,
        0.9553023639600724,
      ];

      for (let i = 0; i < expected.length; i++) {
        expect(rng()).toStrictEqual(expected[i]);
      }
    });
  });

  describe("using seed 'hello-world'", () => {
    it("produces expected values", () => {
      const rng = seededRandom("hello-world");
      const expected = [
        0.22592852963134646, 0.7398041251581162, 0.15010468335822225,
        0.31473430641926825, 0.9614350744523108, 0.7382257990539074,
        0.6446647176053375, 0.20675464044325054, 0.24667895096354187,
        0.026752156671136618,
      ];

      for (let i = 0; i < expected.length; i++) {
        expect(rng()).toStrictEqual(expected[i]);
      }
    });
  });

  describe("using seed '12345'", () => {
    it("produces expected values", () => {
      const rng = seededRandom("12345");
      const expected = [
        0.6462731098290533, 0.5638589910231531, 0.35898207360878587,
        0.5788198646623641, 0.09846730646677315, 0.19421362481079996,
        0.318501623114571, 0.4165226521436125, 0.33385143359191716,
        0.031964317662641406,
      ];

      for (let i = 0; i < expected.length; i++) {
        expect(rng()).toStrictEqual(expected[i]);
      }
    });
  });
});
