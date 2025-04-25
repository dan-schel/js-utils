import { test, expect } from "vitest";
import { hour12To24, hour24To12, tryParseUserTimeString } from "../src/index";

test("hour12To24", () => {
  expect(hour12To24(12, "am")).toStrictEqual(0);
  expect(hour12To24(1, "am")).toStrictEqual(1);
  expect(hour12To24(11, "am")).toStrictEqual(11);
  expect(hour12To24(12, "pm")).toStrictEqual(12);
  expect(hour12To24(1, "pm")).toStrictEqual(13);
  expect(hour12To24(11, "pm")).toStrictEqual(23);
});

test("hour24To12", () => {
  expect(hour24To12(0).hour).toStrictEqual(12);
  expect(hour24To12(1).hour).toStrictEqual(1);
  expect(hour24To12(11).hour).toStrictEqual(11);
  expect(hour24To12(12).hour).toStrictEqual(12);
  expect(hour24To12(13).hour).toStrictEqual(1);
  expect(hour24To12(23).hour).toStrictEqual(11);
  expect(hour24To12(0).half).toStrictEqual("am");
  expect(hour24To12(1).half).toStrictEqual("am");
  expect(hour24To12(11).half).toStrictEqual("am");
  expect(hour24To12(12).half).toStrictEqual("pm");
  expect(hour24To12(13).half).toStrictEqual("pm");
  expect(hour24To12(23).half).toStrictEqual("pm");
});

test("tryParseUserTimeString", () => {
  expect(tryParseUserTimeString("12:00am")).toStrictEqual({
    hour: 0,
    minute: 0,
  });
  expect(tryParseUserTimeString("1.57pm")).toStrictEqual({
    hour: 13,
    minute: 57,
  });
  expect(tryParseUserTimeString("1 pm")).toStrictEqual({ hour: 13, minute: 0 });
  expect(tryParseUserTimeString("8:45 am")).toStrictEqual({
    hour: 8,
    minute: 45,
  });
  expect(tryParseUserTimeString("8:45")).toStrictEqual({ hour: 8, minute: 45 });
  expect(tryParseUserTimeString("16:45")).toStrictEqual({
    hour: 16,
    minute: 45,
  });
  expect(tryParseUserTimeString("21.59")).toStrictEqual({
    hour: 21,
    minute: 59,
  });

  expect(tryParseUserTimeString("21.60")).toBeNull();
  expect(tryParseUserTimeString("13:45 pm")).toBeNull();
  expect(tryParseUserTimeString("13:45am")).toBeNull();
  expect(tryParseUserTimeString("-4:45")).toBeNull();
  expect(tryParseUserTimeString("24:45")).toBeNull();
});
