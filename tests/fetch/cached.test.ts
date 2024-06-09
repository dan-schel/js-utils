import { Cached } from "../../src/index";

describe("Cached", () => {
  it("should return the cached value until the cache duration of time passes", async () => {
    let currentTime = 0;
    let value = "original";

    const fetch = jest.fn(async () => value);

    const cached = new Cached({
      fetch,
      getCurrentTimestamp: () => currentTime,
      cacheDuration: 2,
      fallbackDuration: 5,
    });

    expect(fetch).toHaveBeenCalledTimes(0);

    expect(await cached.get()).toEqual({
      type: "fresh",
      value: "original",
      timestamp: 0,
    });

    value = "updated";
    currentTime = 1;
    expect(await cached.get()).toEqual({
      type: "cached",
      value: "original",
      timestamp: 0,
    });

    expect(fetch).toHaveBeenCalledTimes(1);

    currentTime = 2;
    expect(await cached.get()).toEqual({
      type: "fresh",
      value: "updated",
      timestamp: 2,
    });

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("should return the fallback value if the fetch fails", async () => {
    let currentTime = 0;
    let value: string | null = "original";

    const cached = new Cached({
      fetch: async () => {
        if (value == null) {
          throw new Error();
        }
        return value;
      },
      getCurrentTimestamp: () => currentTime,
      cacheDuration: 2,
      fallbackDuration: 5,
    });

    await cached.get();

    value = null;
    currentTime = 2;
    expect(await cached.get()).toEqual({
      type: "fallback",
      value: "original",
      timestamp: 0,
    });
  });

  it("should propagate the error if the fallback time has also expired", async () => {
    let currentTime = 0;
    let value: string | null = "original";

    const cached = new Cached({
      fetch: async () => {
        if (value == null) {
          throw new Error();
        }
        return value;
      },
      getCurrentTimestamp: () => currentTime,
      cacheDuration: 2,
      fallbackDuration: 5,
    });

    await cached.get();

    value = null;
    currentTime = 5;
    await expect(cached.get()).rejects.toThrow();
  });

  it("should throw an error if the cache has no data", async () => {
    let currentTime = 0;
    let value: string | null = null;

    const cached = new Cached({
      fetch: async () => {
        if (value == null) {
          throw new Error();
        }
        return value;
      },
      getCurrentTimestamp: () => currentTime,
      cacheDuration: 2,
      fallbackDuration: 5,
    });

    await expect(cached.get()).rejects.toThrow();
  });
});
