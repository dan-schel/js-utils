type Timestamped<T> = {
  readonly value: T;
  readonly timestamp: number;
};

type Returned<T> = Timestamped<T> & {
  readonly type: "fresh" | "cached" | "fallback";
};

/** Handles caching a value for a given duration to avoid repeated fetches. */
export class Cached<T> {
  private _data: Timestamped<T> | null;

  constructor(
    /** The function that does the expensive fetch. */
    private readonly _fetch: () => Promise<T>,
    /**
     * Provides the current timestamp. The timestamp can be measured in any unit
     * of time, as long as it matches the unit used for cache duration and
     * fallback duration.
     */
    private readonly _getCurrentTimestamp: () => number,
    /** How long to cache data before attempting to fetch fresh again. */
    private readonly _cacheDuration: number,
    /**
     * How long expired data can continue to be used in the event of a failed
     * fetch. Default: 0 (i.e. never fallback).
     */
    private readonly _fallbackDuration: number = 0
  ) {
    this._data = null;
  }

  /**
   * Get the value. Will throw if the fetch fails and the cached data is
   * unavailable for older than the fallback duration.
   */
  async get(): Promise<Returned<T>> {
    const cached = this._getCachedData(this._cacheDuration);
    if (cached !== null) {
      return { ...cached, type: "cached" };
    }

    try {
      return { ...(await this.fetch()), type: "fresh" };
    } catch (error) {
      // If the fetch fails, fallback to returning the cached data if configured
      // to and the data isn't too stale.
      const cached = this._getCachedData(this._fallbackDuration);
      if (cached !== null) {
        return { ...cached, type: "fallback" };
      }
      throw error;
    }
  }

  /**
   * Ignore the cache the fetch the value. The result will be cached for future
   * access.
   */
  async fetch(): Promise<Timestamped<T>> {
    const value = await this._fetch();
    const timestamp = this._getCurrentTimestamp();
    this._data = { value, timestamp };
    return this._data;
  }

  /**
   * Clear the cache and force the value to be re-fetched on next access,
   * regardless of age.
   */
  async clear(): Promise<void> {
    this._data = null;
  }

  private _getCachedData(maxAge: number): Timestamped<T> | null {
    if (this._data == null) {
      return null;
    }
    const expiry = this._data.timestamp + maxAge;
    return this._getCurrentTimestamp() < expiry ? this._data : null;
  }
}
