import { Polled } from "../../src/index";

describe("Polled", () => {
  it("should have data after calling init()", async () => {
    const { polled } = setupPolled();

    await polled.init();

    expect(polled.get()).toEqual({
      value: "original",
      timestamp: 0,
    });
  });

  it("should throw if init() is not called", async () => {
    const { polled: polled1 } = setupPolled();
    expect(() => polled1.get()).toThrow();
    expect(() => polled1.require()).toThrow();
    await expect(polled1.fetch()).rejects.toThrow();

    const { polled: polled2 } = setupPolled({ requireInitSuccess: false });
    expect(() => polled2.get()).toThrow();
    expect(() => polled2.require()).toThrow();
    await expect(polled2.fetch()).rejects.toThrow();
  });

  it("should cancel the polling schedule when disposed", async () => {
    const { polled, cancelScheduleFn } = setupPolled();

    await polled.init();
    polled.dispose();

    expect(cancelScheduleFn).toHaveBeenCalledWith(1);
  });

  it("should schedule the next poll when one completes", async () => {
    const { polled, setValue, getCurrentSchedule, cancelScheduleFn } =
      setupPolled();

    await polled.init();

    expect(getCurrentSchedule()?.id).toBe(1);
    expect(getCurrentSchedule()?.delay).toBe(3);

    // Update the value and mock the time passing.
    setValue("updated");
    await getCurrentSchedule()!.callback();

    expect(polled.get()).toEqual({ value: "updated", timestamp: 3 });

    // A new schedule should've been set. The old one completed, so no attempt
    // to cancel it should've been made.
    expect(getCurrentSchedule()?.id).toBe(2);
    expect(getCurrentSchedule()?.delay).toBe(3);
    expect(cancelScheduleFn).toHaveBeenCalledTimes(0);
  });

  it("should use the retry interval if fetching fails", async () => {
    const { polled, setValue, getCurrentSchedule, cancelScheduleFn } =
      setupPolled();

    await polled.init();

    expect(getCurrentSchedule()?.id).toBe(1);
    expect(getCurrentSchedule()?.delay).toBe(3);

    // Update the value and mock the time passing.
    setValue(null);
    await getCurrentSchedule()!.callback();

    // The value remains the same and the new schedule uses the retry interval.
    expect(polled.get()).toEqual({ value: "original", timestamp: 0 });
    expect(getCurrentSchedule()?.id).toBe(2);
    expect(getCurrentSchedule()?.delay).toBe(1);
    expect(cancelScheduleFn).toHaveBeenCalledTimes(0);
  });

  it("should obey the max retries setting", async () => {
    const { polled, setValue, getCurrentSchedule, cancelScheduleFn } =
      setupPolled();

    await polled.init();
    expect(getCurrentSchedule()?.delay).toBe(3);

    // Update the value and mock the time passing.
    setValue(null);
    await getCurrentSchedule()!.callback();

    // Retry three times using the retry interval.
    // (1 first attempt + 3 retries = 4 total fetch calls)
    expect(getCurrentSchedule()?.delay).toBe(1);
    await getCurrentSchedule()!.callback();
    expect(getCurrentSchedule()?.delay).toBe(1);
    await getCurrentSchedule()!.callback();
    expect(getCurrentSchedule()?.delay).toBe(1);
    await getCurrentSchedule()!.callback();

    // The max retries have been reached, so the retry interval is not used.
    expect(getCurrentSchedule()?.delay).toBe(3);
    await getCurrentSchedule()!.callback();

    // Only a success can resets the retry count. We use the poll interval for
    // the next attempt.
    expect(getCurrentSchedule()?.delay).toBe(3);
    await getCurrentSchedule()!.callback();

    // Ultimately the value doesn't change and no schedules are cancelled.
    expect(polled.get()).toEqual({ value: "original", timestamp: 0 });
    expect(cancelScheduleFn).toHaveBeenCalledTimes(0);
  });

  it("should throw if the fetch during init() fails", async () => {
    const { polled, setValue } = setupPolled();

    setValue(null);
    await expect(polled.init()).rejects.toThrow();
  });

  it("should not throw in init() if requireInitSuccess is false", async () => {
    const { polled, setValue } = setupPolled({ requireInitSuccess: false });

    setValue(null);
    await polled.init();

    // ...but there won't be a value of course!
    expect(polled.get()).toBeNull();
    expect(() => polled.require()).toThrow();
  });

  it("should have the existing schedule reset when fetch() is used", async () => {
    const {
      polled,
      setValue,
      setCurrentTime,
      getCurrentSchedule,
      cancelScheduleFn,
    } = setupPolled();

    await polled.init();

    expect(getCurrentSchedule()?.id).toBe(1);
    expect(getCurrentSchedule()?.delay).toBe(3);

    // The schedule doesn't complete (the callback isn't called), but a bit of
    // time passes and the value changes.
    setValue("updated");
    setCurrentTime(1);

    // Fetch returns the updated value even though we didn't get around to
    // polling for it.
    const value = await polled.fetch();
    expect(value).toEqual({ value: "updated", timestamp: 1 });

    // The previous schedule (id = 1) is deleted and a new one set.
    expect(cancelScheduleFn).toHaveBeenCalledWith(1);
    expect(getCurrentSchedule()?.id).toBe(2);
    expect(getCurrentSchedule()?.delay).toBe(3);

    // The next update comes through at time = 4.
    await getCurrentSchedule()!.callback();
    expect(polled.get()).toEqual({ value: "updated", timestamp: 4 });
  });
});

// Helper function to set up a Polled instance with a mocked scheduler.
function setupPolled({
  requireInitSuccess,
}: { requireInitSuccess?: boolean } = {}) {
  let value: string | null = "original";
  let currentTime = 0;

  let scheduleID = 1;
  let schedule: {
    id: number;
    callback: () => Promise<void>;
    delay: number;
  } | null = null;
  const cancelScheduleFn = jest.fn();

  const polled = new Polled({
    fetch: async () => {
      if (value == null) {
        throw new Error();
      }
      return value;
    },
    scheduler: {
      getCurrentTimestamp: () => currentTime,
      schedule: (callback, delay) => {
        schedule = {
          id: scheduleID,
          callback: () => {
            currentTime += delay;
            return callback();
          },
          delay,
        };
        scheduleID++;
        return schedule.id;
      },
      cancelSchedule: cancelScheduleFn,
    },
    pollInterval: 3,
    retryInterval: 1,
    maxRetries: 3,
    requireInitSuccess,
  });

  return {
    polled,
    setValue: (newValue: string | null) => (value = newValue),
    setCurrentTime: (newTime: number) => (currentTime = newTime),
    getCurrentSchedule: () => schedule,
    cancelScheduleFn,
  };
}
