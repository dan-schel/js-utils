import { parseIntThrow, posMod } from "./integers";

/** An object with an hour and minute. */
export type Time = {
  hour: number;
  minute: number;
};

/**
 * Returns a local time for a timetable block starting time, based on an input
 * string. Several formats are accepted, e.g. 24-hour strings, 12-hour strings,
 * and strings excluding the minutes value. Returns null if the string is not
 * an understood format.
 * @param input The input string.
 */
export function tryParseUserTimeString(input: string): Time | null {
  const standardInput = input.replace(/\s+/g, " ").trim().toLowerCase();

  // Examples of matches: "16:00", "8am", "9:00am", "6.40 pm", "46:99", "14.50"
  // Does NOT match: "8", "1600", "8:0 pm"
  const regex = /^[0-9]{1,2}([:.][0-9]{2}( ?[ap]m)?| ?[ap]m)$/g;

  if (!regex.test(standardInput)) { return null; }

  // Split the string into components, e.g. "9:00am" becomes ["9", "00", "am"]
  // and "14.50" becomes ["14", "50"].
  const components = standardInput
    .replace(" ", "")
    .replace(".", ":")
    .replace("am", ":am")
    .replace("pm", ":pm")
    .split(":");

  // The regex above ensures the first component must be a number.
  const hour = parseIntThrow(components[0]);

  // There will always 2-3 components, but the second component could be either
  // am/pm, or a minute value.
  if (components[1] == "am" || components[1] == "pm") {
    const half = components[1];
    if (hour < 1 || hour > 12) { return null; }

    const minute = 0;
    return { hour: hour12To24(hour, half), minute: minute };
  }

  // If it's not "am" or "pm", then it's guaranteed to be a minute value.
  const minute = parseIntThrow(components[1]);
  if (minute > 59) { return null; }

  if (components.length == 3) {
    const half = components[2] as "am" | "pm";
    if (hour < 1 || hour > 12) { return null; }
    return { hour: hour12To24(hour, half), minute: minute };
  }

  // If there's no third component, then treat the time as a 24-hour time.
  if (hour > 23) { return null; }
  return { hour: hour, minute: minute };
}

/**
 * Returns the given 12-hour formatted hour as a 24-hour formatted hour. Can
 * only be expected to return sensible results if the hour passed is an integer
 * between 1 and 12 (inclusive).
 * @param hour The 12-hour formatted hour.
 * @param half The half of the day (either "am" or "pm").
 */
export function hour12To24(hour: number, half: "am" | "pm"): number {
  return (hour % 12) + (half == "pm" ? 12 : 0);
}

/**
 * Returns the given 24-hour formatted hour as a 12-hour formatted hour. Can
 * only be expected to return sensible results if the hour passed is an integer
 * between 0 and 23 (inclusive).
 * @param hour The 24-hour formatted hour.
 */
export function hour24To12(hour: number): { hour: number, half: "am" | "pm" } {
  return {
    hour: posMod(hour - 1, 12) + 1,
    half: hour < 12 ? "am" : "pm"
  };
}
