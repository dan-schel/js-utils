import { basename, matchesGlob } from "node:path";

import type { ScriptIO } from "./io.js";

const TODO_IGNORE_FILE_PATH = ".todoignore";
const GIT_LIST_FILES_COMMAND =
  "git ls-files --cached --others --exclude-standard -z";

export async function getCandidateFilePaths(io: ScriptIO) {
  const gitFilePaths = getGitFilePaths(io);
  if (gitFilePaths != null) {
    return gitFilePaths;
  }

  try {
    return (await io.listFiles(".")).sort();
  } catch {
    return null;
  }
}

export async function readIgnorePatterns(io: ScriptIO) {
  try {
    return (await io.readFile(TODO_IGNORE_FILE_PATH))
      .split(/\r?\n/u)
      .map((line) => line.trim())
      .filter((line) => line !== "" && !line.startsWith("#"));
  } catch {
    return [];
  }
}

export async function readFileOrNull(io: ScriptIO, path: string) {
  try {
    return await io.readFile(path);
  } catch {
    return null;
  }
}

export function shouldIgnorePath(filePath: string, ignorePatterns: string[]) {
  return ignorePatterns.some((pattern) =>
    matchesIgnorePattern(filePath, pattern),
  );
}

function getGitFilePaths(io: ScriptIO) {
  if (!isGitRepository(io)) {
    return null;
  }

  try {
    return io
      .execSync(GIT_LIST_FILES_COMMAND)
      .split("\0")
      .filter((filePath) => filePath !== "")
      .sort();
  } catch {
    return null;
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
