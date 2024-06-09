import { Polled } from "../../src/index";

describe("Polled", () => {
  it("should have data after calling init()", async () => {
    let currentTime = 0;
    let value = "original";

    const polled = new Polled({
      fetch: async () => value,
      scheduler: {
        getCurrentTimestamp: () => currentTime,
        schedule: (_callback, _delay) => "schedule-id",
        cancelSchedule: (_schedule) => {},
      },
      pollInterval: 2,
    });

    await polled.init();

    expect(polled.get()).toEqual({
      value: "original",
      timestamp: 0,
    });
  });

  it("should throw if init() is not called", async () => {
    let currentTime = 0;
    let value = "original";

    const polled = new Polled({
      fetch: async () => value,
      scheduler: {
        getCurrentTimestamp: () => currentTime,
        schedule: (_callback, _delay) => "schedule-id",
        cancelSchedule: (_schedule) => {},
      },
      pollInterval: 2,
    });

    expect(() => polled.get()).toThrow();
  });

  it("should cancel the polling schedule when disposed", async () => {
    let currentTime = 0;
    let value = "original";

    const cancelSchedule = jest.fn();

    const polled = new Polled({
      fetch: async () => value,
      scheduler: {
        getCurrentTimestamp: () => currentTime,
        schedule: (_callback, _delay) => "schedule-id",
        cancelSchedule,
      },
      pollInterval: 2,
    });

    await polled.init();
    polled.dispose();

    expect(cancelSchedule).toHaveBeenCalledWith("schedule-id");
  });

  it("should schedule the next poll when one completes", async () => {
    let currentTime = 0;
    let value = "original";

    let scheduleID = 1;
    let schedule: { id: number; callback: () => void; delay: number } | null =
      null;
    const cancelSchedule = jest.fn();

    const polled = new Polled({
      fetch: async () => value,
      scheduler: {
        getCurrentTimestamp: () => currentTime,
        schedule: (callback, delay) => {
          schedule = { id: scheduleID, callback, delay };
          scheduleID++;
          return schedule.id;
        },
        cancelSchedule,
      },
      pollInterval: 2,
    });

    await polled.init();

    // Use of "as any" because Typescript doesn't notice the assignment in the
    // callback for some reason.
    expect((schedule as any).id).toBe(1);
    expect((schedule as any).delay).toBe(2);

    value = "updated";
    currentTime = 2;
    await (schedule as any).callback();

    expect(cancelSchedule).toHaveBeenCalledTimes(0);
    expect(polled.get()).toEqual({ value: "updated", timestamp: 2 });
    expect((schedule as any).id).toBe(2);
    expect((schedule as any).delay).toBe(2);
  });
});
