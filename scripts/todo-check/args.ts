import type { ScriptIO } from "./io.js";

const TODO_CHECK_USAGE =
  "Invalid arguments. Usage: todo-check [--tz <iana-timezone>]";

type ParsedArgs = {
  timezone: string;
};

type ArgsResult = { parsed: ParsedArgs } | { error: typeof TODO_CHECK_USAGE };

export function parseArgs(io: ScriptIO): ArgsResult {
  const args = io.getArgs().slice(2);

  if (args.length === 0) {
    return { parsed: { timezone: getLocalTimezone() } };
  }

  if (args.length === 2 && args[0] === "--tz") {
    return { parsed: { timezone: args[1] } };
  }

  return { error: TODO_CHECK_USAGE };
}

function getLocalTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
