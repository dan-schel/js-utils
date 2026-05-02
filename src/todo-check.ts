import { execSync } from "node:child_process";
import fsp from "node:fs/promises";
import { basename, matchesGlob } from "node:path";

export async function main(io: ScriptIO = new RealScriptIO()) {
  const result = await todoCheck(io);

  if (result.error != null) {
    io.log(`🔴 ${result.error}`);
    process.exit(1);
  } else {
    io.log(`🟢 ${result.success}`);
    process.exit(0);
  }
}

export async function todoCheck(io: ScriptIO) {
  const argsResult = interpretArgs(io);

  if (argsResult == null) {
    return {
      error: "Invalid arguments. Usage: todo-check [--tz <iana-timezone>]",
    };
  }
  const timezone = argsResult.timezone ?? getLocalTimezone();
  if (!isValidTimezone(timezone)) {
    return { error: `Invalid timezone '${timezone}'.` };
  }

  const filePaths = await getCandidateFilePaths(io);
  if (filePaths == null) {
    return { error: "Unable to list files." };
  }

  const today = getTodayInTimezone(timezone);
  const ignorePatterns = await readTodoIgnore(io);
  const violations = await findViolations(io, filePaths, ignorePatterns, today);

  if (violations.length === 0) {
    return { success: `No TODO violations found. (${timezone})` };
  }

  const lines = violations.map(
    (violation) =>
      `${violation.filePath}:${violation.lineNumber} ${violation.text}`,
  );

  return {
    error: [
      `Found ${violations.length} TODO violation(s). (${timezone})`,
      ...lines,
    ].join("\n"),
  };
}

async function findViolations(
  io: ScriptIO,
  filePaths: string[],
  ignorePatterns: string[],
  today: string,
) {
  const violations: Violation[] = [];

  for (const filePath of filePaths) {
    if (shouldIgnore(filePath, ignorePatterns)) {
      continue;
    }

    const content = await readTextFile(io, filePath);
    if (content == null) {
      continue;
    }

    for (const [index, line] of content.split(/\r?\n/u).entries()) {
      if (/\bTODO: /.test(line)) {
        violations.push({ filePath, lineNumber: index + 1, text: line.trim() });
      }

      for (const match of line.matchAll(/\bTODO (\d{4}-\d{2}-\d{2}):/g)) {
        if (match[1] <= today) {
          violations.push({
            filePath,
            lineNumber: index + 1,
            text: line.trim(),
          });
        }
      }
    }
  }

  return violations;
}

async function readTextFile(io: ScriptIO, path: string) {
  try {
    const content = await io.readFile(path);
    return content.includes("\0") ? null : content;
  } catch {
    return null;
  }
}

function shouldIgnore(filePath: string, ignorePatterns: string[]) {
  return ignorePatterns.some((pattern) =>
    matchesIgnorePattern(filePath, pattern),
  );
}

function matchesIgnorePattern(filePath: string, pattern: string) {
  const normalizedPattern = pattern.replaceAll("\\", "/");

  if (normalizedPattern.endsWith("/")) {
    return filePath.startsWith(normalizedPattern);
  }
  if (
    filePath === normalizedPattern ||
    filePath.startsWith(`${normalizedPattern}/`)
  ) {
    return true;
  }
  if (matchesGlob(filePath, normalizedPattern)) {
    return true;
  }
  return (
    !normalizedPattern.includes("/") &&
    matchesGlob(basename(filePath), normalizedPattern)
  );
}

async function readTodoIgnore(io: ScriptIO) {
  try {
    return (await io.readFile(".todoignore"))
      .split(/\r?\n/u)
      .map((line) => line.trim())
      .filter((line) => line !== "" && !line.startsWith("#"));
  } catch {
    return [];
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

async function getCandidateFilePaths(io: ScriptIO) {
  if (isGitRepository(io)) {
    try {
      return io
        .execSync("git ls-files --cached --others --exclude-standard -z")
        .split("\0")
        .filter((filePath) => filePath !== "");
    } catch {
      return null;
    }
  }

  try {
    return await io.listFiles(".");
  } catch {
    return null;
  }
}

function interpretArgs(io: ScriptIO) {
  const args = io.getArgs().slice(2);

  if (args.length === 0) {
    return { timezone: null };
  }
  if (args.length === 2 && args[0] === "--tz") {
    return { timezone: args[1] };
  }
  return null;
}

function getLocalTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function isValidTimezone(timezone: string) {
  try {
    Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format();
    return true;
  } catch {
    return false;
  }
}

function getTodayInTimezone(timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
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

type Violation = {
  filePath: string;
  lineNumber: number;
  text: string;
};

export abstract class ScriptIO {
  abstract getArgs(): string[];
  abstract execSync(command: string): string;
  abstract execSyncSilent(command: string): void;
  abstract readFile(path: string): Promise<string>;
  abstract listFiles(path: string): Promise<string[]>;
  abstract log(text: string): void;
}

class RealScriptIO extends ScriptIO {
  override getArgs(): string[] {
    return process.argv;
  }

  override execSync(command: string): string {
    return execSync(command, { stdio: "pipe" }).toString();
  }

  override execSyncSilent(command: string): void {
    execSync(command, { stdio: "ignore" });
  }

  override readFile(path: string): Promise<string> {
    return fsp.readFile(path, "utf-8");
  }

  override async listFiles(path: string): Promise<string[]> {
    const entries = await fsp.readdir(path, { withFileTypes: true });
    const children = await Promise.all(
      entries.map(async (entry) => {
        const childPath = path === "." ? entry.name : `${path}/${entry.name}`;

        if (entry.isDirectory()) {
          return this.listFiles(childPath);
        }
        return [childPath];
      }),
    );

    return children.flat();
  }

  override log(text: string): void {
    // eslint-disable-next-line no-console
    console.log(text);
  }
}
