import { readFileOrNull, shouldIgnorePath } from "./files.js";
import type { ScriptIO } from "./io.js";

const PLAIN_TODO_REGEX = /\bTODO: /;
const TIMED_TODO_REGEX = /\bTODO (\d{4}-\d{2}-\d{2}):/g;

type TodoSummary = {
  timedTodoCount: number;
  violations: string[];
};

export async function findTodoViolations(
  io: ScriptIO,
  filePaths: string[],
  ignorePatterns: string[],
  today: string,
): Promise<TodoSummary> {
  const violations: string[] = [];
  let timedTodoCount = 0;

  for (const filePath of filePaths) {
    if (shouldIgnorePath(filePath, ignorePatterns)) {
      continue;
    }

    const content = await readFileOrNull(io, filePath);
    if (content == null) {
      continue;
    }

    for (const [index, line] of content.split(/\r?\n/u).entries()) {
      const timedTodos = listTimedTodos(line);
      timedTodoCount += timedTodos.length;

      if (hasViolation(line, timedTodos, today)) {
        violations.push(`${filePath}:${index + 1}`);
      }
    }
  }

  return { timedTodoCount, violations };
}

export function formatTimedTodoCount(count: number) {
  return `${count} timed ${count === 1 ? "TODO" : "TODOs"}`;
}

function hasViolation(line: string, timedTodos: string[], today: string) {
  return (
    PLAIN_TODO_REGEX.test(line) || timedTodos.some((date) => date <= today)
  );
}

function listTimedTodos(line: string) {
  return Array.from(line.matchAll(TIMED_TODO_REGEX), (match) => match[1]);
}
