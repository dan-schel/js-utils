type Timestamped<T> = {
  readonly value: T;
  readonly timestamp: number;
};

/** Handles managing time and scheduling functions to run after a delay. */
export interface PollScheduler<T> {
  schedule: (callback: () => Promise<void>, delay: number) => T;
  cancelSchedule: (schedule: T) => void;
  getCurrentTimestamp: () => number;
}

/** Handles periodically fetching a value so it's always available in advance. */
export class Polled<T, SchedulerType> {
  readonly pollInterval: number;
  readonly retryInterval: number | null;
  readonly maxRetries: number;
  readonly requireInitSuccess: boolean;

  private readonly _fetch: () => Promise<T>;
  private readonly _scheduler: PollScheduler<SchedulerType>;
  private readonly _onError: ((error: unknown) => void) | null;

  private _initialized: boolean;
  private _data: Timestamped<T> | null;
  private _failedAttemptCount: number;
  private _runningSchedule: SchedulerType | null;

  constructor({
    fetch,
    scheduler,
    pollInterval,
    retryInterval = null,
    maxRetries = 5,
    onError = null,
    requireInitSuccess = true,
  }: {
    /** The function that does the expensive fetch. */
    fetch: () => Promise<T>;
    /**
     * The poll scheduler, which manages time and allows functions to be run
     * after a given delay. The timestamp and delay can be measured in any unit
     * of time, as long as they match the unit used for the poll interval, and
     * the retry interval.
     */
    scheduler: PollScheduler<SchedulerType>;
    /** How often to poll for fresh data. */
    pollInterval: number;
    /**
     * How often to retry after a failed fetch. Default: null (i.e. don't retry,
     * just wait for the next poll).
     */
    retryInterval?: number | null;
    /**
     * How many times to use the retry interval before reverting to the poll
     * interval. The retry interval will not be used again until a successful
     * fetch is made.
     */
    maxRetries?: number;
    /** Called when a fetch fails (except the first fetch, which throws). */
    onError?: ((error: unknown) => void) | null;
    /** Whether to throw if the fetch during init() fails. Default: true. */
    requireInitSuccess?: boolean;
  }) {
    this.pollInterval = pollInterval;
    this.retryInterval = retryInterval;
    this.maxRetries = maxRetries;
    this.requireInitSuccess = requireInitSuccess;

    this._fetch = fetch;
    this._scheduler = scheduler;
    this._onError = onError;

    this._initialized = false;
    this._data = null;
    this._failedAttemptCount = 0;
    this._runningSchedule = null;
  }

  /**
   * Fetch the value and start polling. Throws if the first fetch fails, unless
   * {@link requireInitSuccess} is false.
   */
  async init(): Promise<void> {
    if (this._data == null && this.requireInitSuccess) {
      await this._fetchAndStore();
      this._schedulePoll(this.pollInterval);
    } else {
      await this._poll();
    }
    this._initialized = true;
  }

  /** Stops polling for the value. Can be started again by calling init(). */
  dispose(): void {
    if (this._runningSchedule != null) {
      this._scheduler.cancelSchedule(this._runningSchedule);
      this._runningSchedule = null;
    }
    this._initialized = false;
  }

  /**
   * Get the value. Can be null if {@link requireInitSuccess} is set to false.
   * Use {@link require} to guarantee a non-null value.
   */
  get(): Timestamped<T> | null {
    this._assertInitialized();
    return this._data;
  }

  /**
   * Get the value. Throw if {@link requireInitSuccess} is false and the value
   * has never been successfully fetched.
   */
  require(): Timestamped<T> {
    this._assertInitialized();
    if (this._data == null) {
      throw new Error("Cannot retrieve polled value. No fetch has succeeded.");
    }
    return this._data;
  }

  /**
   * Ignore any polled value and fetch again. Throws if the fetch fails. As
   * calling this method refreshes the value, the next poll will be rescheduled
   * to avoid unnecessary fetches.
   */
  async fetch(): Promise<Timestamped<T>> {
    this._assertInitialized();
    const value = await this._fetchAndStore();
    this._schedulePoll(this.pollInterval);
    return value;
  }

  private async _poll() {
    this._runningSchedule = null;

    try {
      await this._fetchAndStore();
      this._failedAttemptCount = 0;
      this._schedulePoll(this.pollInterval);
    } catch (error) {
      this._onError?.(error);

      const interval =
        this._failedAttemptCount < this.maxRetries
          ? this.retryInterval ?? this.pollInterval
          : this.pollInterval;

      this._schedulePoll(interval);
      this._failedAttemptCount++;
    }
  }

  private async _fetchAndStore(): Promise<Timestamped<T>> {
    const value = await this._fetch();
    const timestamp = this._scheduler.getCurrentTimestamp();
    this._data = { value, timestamp };
    return this._data;
  }

  private _schedulePoll(interval: number) {
    if (this._runningSchedule != null) {
      this._scheduler.cancelSchedule(this._runningSchedule);
    }
    this._runningSchedule = this._scheduler.schedule(
      async () => await this._poll(),
      interval
    );
  }

  private _assertInitialized() {
    if (!this._initialized) {
      throw new Error("Cannot retrieve value. Call init() first.");
    }
  }
}
