const TIMEZONE_DATE_LOCALE = "en-CA";

export function isValidTimezone(timezone: string) {
  try {
    Intl.DateTimeFormat(TIMEZONE_DATE_LOCALE, { timeZone: timezone }).format();
    return true;
  } catch {
    return false;
  }
}

export function getTodayInTimezone(timezone: string) {
  const parts = new Intl.DateTimeFormat(TIMEZONE_DATE_LOCALE, {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (year == null || month == null || day == null) {
    throw new Error("Unable to determine today's date.");
  }

  return `${year}-${month}-${day}`;
}
