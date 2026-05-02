import { parseArgs } from "./args.js";
import { findTodoViolations, formatTimedTodoCount } from "./check.js";
import { getCandidateFilePaths, readIgnorePatterns } from "./files.js";
import { RealScriptIO, ScriptIO } from "./io.js";
import { getTodayInTimezone, isValidTimezone } from "./time.js";

export { ScriptIO } from "./io.js";

export async function main(io: ScriptIO = new RealScriptIO()) {
  const result = await todoCheck(io);

  if (result.error != null) {
    io.log(`🔴 ${result.error}`);
    process.exit(1);
  }

  io.log(`🟢 ${result.success}`);
  process.exit(0);
}

export async function todoCheck(io: ScriptIO) {
  const argsResult = parseArgs(io);
  if ("error" in argsResult) {
    return { error: argsResult.error };
  }

  const { timezone } = argsResult.parsed;
  if (!isValidTimezone(timezone)) {
    return { error: `Invalid timezone '${timezone}'.` };
  }

  const filePaths = await getCandidateFilePaths(io);
  if (filePaths == null) {
    return { error: "Unable to list files." };
  }

  const ignorePatterns = await readIgnorePatterns(io);
  const { timedTodoCount, violations } = await findTodoViolations(
    io,
    filePaths,
    ignorePatterns,
    getTodayInTimezone(timezone),
  );

  if (violations.length === 0) {
    return {
      success: `Looks good! (Found ${formatTimedTodoCount(timedTodoCount)}.)`,
    };
  }

  return {
    error: [`Found ${violations.length} TODOs:`, "", ...violations].join("\n"),
  };
}
