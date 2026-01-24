import { describe, it, expect } from "vitest";
import { distanceInMeters } from "../src/index.js";

describe("distanceInMeters", () => {
  it("works", () => {
    const flindersStreetStation = {
      latitude: -37.81830513,
      longitude: 144.96696435,
    };

    const pakenhamStation = {
      latitude: -38.08061397,
      longitude: 145.48637907,
    };

    const result = distanceInMeters(
      flindersStreetStation.latitude,
      flindersStreetStation.longitude,
      pakenhamStation.latitude,
      pakenhamStation.longitude,
    );

    // Distance is approx 54 km according to Google Maps.
    expect(result).toBeGreaterThan(53000);
    expect(result).toBeLessThan(55000);
  });
});
