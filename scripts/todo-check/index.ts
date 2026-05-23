import { execSync } from "child_process";
import fsp from "fs/promises";

export async function main(io: ScriptIO = new RealScriptIO()) {
  const result = await generateTodosReport(io);

  if (result.error != null) {
    io.log(`🔴 ${result.error}`);
    process.exit(1);
  } else if (result.skip != null) {
    io.log(`🔵 ${result.skip}`);
    process.exit(0);
  } else if (result.fail != null) {
    const count = result.fail.violations.length;
    io.log(`🔴 Found ${count} ${count === 1 ? "TODO" : "TODOs"} to address:\n`);
    for (const { location, isoDate } of result.fail.violations) {
      io.log(`- ${location}${isoDate != null ? ` (due ${isoDate})` : ""}`);
    }
    process.exit(1);
  } else {
    const count = result.pass.upcoming.count;
    const nextDue = result.pass.upcoming.nextDueIsoDate;

    const dueOrNextDue = count === 1 ? "due" : "next due";
    const nextDueSuffix = nextDue != null ? `, ${dueOrNextDue} ${nextDue}` : "";
    const suffix = count > 0 ? ` (${count} upcoming${nextDueSuffix})` : "";

    io.log(`🟢 No TODOs requiring action${suffix}.`);
    process.exit(0);
  }
}

export async function generateTodosReport(io: ScriptIO) {
  const argsResult = interpretArgs(io);
  if (argsResult.error != null) return { error: argsResult.error };
  const args = argsResult.args;

  const branchResult = getCurrentBranchName(io);
  if (branchResult.error != null) return { error: branchResult.error };
  const currentBranch = branchResult.branch;
  if (args.ignore != null && args.ignore.test(currentBranch)) {
    return { skip: `On ignored branch (${currentBranch}).` };
  }

  const filesResult = getFilesToScan(io);
  if (filesResult.error != null) return { error: filesResult.error };
  const files = filesResult.files;

  const todos: { location: string; isoDate: string | null }[] = [];

  for (const file of files) {
    const ext = file.split(".").at(-1)?.toLowerCase();
    if (ext == null || !args.extensions.includes(ext)) continue;

    const content = await io.readFile(file);
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = /\sTODO([^:]{0,16}):/.exec(line);
      if (match != null) {
        const location = `${file}:${i + 1}:${match.index + 2}`;
        const dateBit = match[1]?.trim() ?? null;
        if (dateBit != null && !/^\d{4}-\d{2}-\d{2}$/.test(dateBit)) {
          return { error: `Bad YYYY-MM-DD at ${location}, got "${dateBit}".` };
        }
        todos.push({ location, isoDate: dateBit });
      }
    }
  }

  const todayIsoDate = io.getTodayIsoDate(args.tz);
  const violations = [];
  let upcomingCount = 0;
  let nextDueIsoDate: string | null = null;

  for (const { location, isoDate } of todos) {
    if (isoDate == null || isoDate <= todayIsoDate) {
      violations.push({ location, isoDate });
    } else {
      upcomingCount++;
      if (nextDueIsoDate == null || isoDate < nextDueIsoDate) {
        nextDueIsoDate = isoDate;
      }
    }
  }

  if (violations.length > 0) return { fail: { violations } };

  return {
    pass: {
      upcoming: {
        count: upcomingCount,
        nextDueIsoDate,
      },
    },
  };
}

function interpretArgs(io: ScriptIO) {
  const args = io.getArgs().slice(2);

  const usage =
    "Usage: todo-check " +
    "--tz <timezone> " +
    "--extensions <.ext1> <.ext2> " +
    "[--ignore <regex>]";

  // Extract.
  let currentFlag: string | null = null;
  const byType: Record<string, string[]> = {
    tz: [],
    extensions: [],
    ignore: [],
  };
  for (const arg of args) {
    if (arg.startsWith("--")) {
      currentFlag = arg.slice(2);
    } else if (currentFlag != null) {
      if (currentFlag in byType) {
        byType[currentFlag].push(arg);
      } else {
        return { error: `Unknown flag '--${currentFlag}'. ${usage}` };
      }
    } else {
      return { error: `Not expecting '${arg}'. ${usage}` };
    }
  }

  // Validate.
  const tzArr = byType["tz"];
  const extensionsArr = byType["extensions"];
  const ignoreRaw = byType["ignore-branch"];
  if (tzArr.length !== 1) {
    return { error: `Expected exactly one timezone. ${usage}` };
  }
  if (extensionsArr.length === 0) {
    return { error: `Expected at least one extension. ${usage}` };
  }
  if (extensionsArr.some((e) => !e.startsWith("."))) {
    return { error: `Extensions should always start with a dot. ${usage}` };
  }
  if (ignoreRaw.length > 1) {
    return { error: `Expected at most one --ignore flag. ${usage}` };
  }

  // Return.
  const tz = tzArr[0];
  const extensions = extensionsArr.map((e) => e.toLowerCase().slice(1));
  const ignore = ignoreRaw.length === 1 ? new RegExp(ignoreRaw[0]) : null;
  return { args: { tz, extensions, ignore: ignore } };
}

function getFilesToScan(io: ScriptIO) {
  if (!isGitRepository(io)) {
    return { error: "Not a git repository." };
  }

  try {
    const files = io
      .execSync("git ls-files --cached --others --exclude-standard -z")
      .split("\0")
      .filter((filePath) => filePath !== "")
      .sort();

    return { files };
  } catch {
    return { error: "Not a git repository." };
  }
}

function isGitRepository(io: ScriptIO) {
  try {
    io.execSyncSilent("git rev-parse --is-inside-work-tree");
    return true;
  } catch {
    return false;
  }
}

function getCurrentBranchName(io: ScriptIO) {
  try {
    return { branch: io.execSync("git branch --show-current").trim() };
  } catch {
    return { error: "Unable to determine current branch." };
  }
}

export abstract class ScriptIO {
  abstract getArgs(): string[];
  abstract execSync(command: string): string;
  abstract execSyncSilent(command: string): void;
  abstract readFile(path: string): Promise<string>;
  abstract log(text: string): void;
  abstract getTodayIsoDate(tz: string): string;
}

class RealScriptIO extends ScriptIO {
  override getArgs(): string[] {
    return process.argv;
  }

  override execSync(command: string): string {
    return execSync(command, { stdio: "pipe" }).toString();
  }

  override execSyncSilent(command: string) {
    execSync(command, { stdio: "ignore" });
  }

  override async readFile(path: string): Promise<string> {
    return await fsp.readFile(path, "utf-8");
  }

  override log(text: string): void {
    // eslint-disable-next-line no-console
    console.log(text);
  }

  override getTodayIsoDate(tz: string): string {
    return new Date().toLocaleString("en-CA", { timeZone: tz }).slice(0, 10);
  }
}
