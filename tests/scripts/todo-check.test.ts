// TODO-CHECK-IGNORE

import { describe, expect, it } from "vitest";
import {
  generateTodosReport,
  ScriptIO,
} from "../../scripts/todo-check/index.js";

class FakeScriptIO extends ScriptIO {
  readonly logs: string[] = [];

  constructor(
    private readonly _args: string[],
    private readonly _commands: Record<string, string>,
    private readonly _files: Record<string, string>,
    private readonly _todayIsoDate: string,
  ) {
    super();
  }

  getArgs(): string[] {
    return this._args;
  }

  execSync(command: string): string {
    if (command in this._commands) {
      return this._commands[command];
    }
    throw new Error();
  }

  execSyncSilent(command: string): void {
    if (!(command in this._commands)) throw new Error();
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async readFile(path: string): Promise<string> {
    if (path in this._files) return this._files[path];
    throw new Error();
  }

  log(text: string): void {
    this.logs.push(text);
  }

  getTodayIsoDate(_tz: string): string {
    return this._todayIsoDate;
  }
}

function scriptIO({
  args = [],
  files = { "src/index.ts": "" },
  currentBranchName = "feature-branch",
  todayIsoDate = "2026-05-23",
  commands,
}: {
  args?: string[];
  files?: Record<string, string>;
  currentBranchName?: string;
  todayIsoDate?: string;
  commands?: Record<string, string>;
}) {
  return new FakeScriptIO(
    ["node", "todo-check.js", "--tz", "UTC", "--extensions", ".ts", ...args],
    commands ?? {
      ...isGitRepository(),
      ...getCurrentBranchName(currentBranchName),
      ...getFiles(Object.keys(files)),
    },
    files,
    todayIsoDate,
  );
}

function isGitRepository() {
  return { "git rev-parse --is-inside-work-tree": "true" };
}

function getCurrentBranchName(name: string) {
  return { "git branch --show-current": name };
}

function getFiles(filePaths: string[]) {
  return {
    "git ls-files --cached --others --exclude-standard -z":
      filePaths.join("\0"),
  };
}

describe("todo-check script", () => {
  describe("when there are no TODOs", () => {
    it("passes", async () => {
      const io = scriptIO({ files: { "src/index.ts": "const x = 1;" } });
      const result = await generateTodosReport(io);
      expect(result).toEqual({
        pass: { upcoming: { count: 0, nextDueIsoDate: null } },
      });
    });
  });

  describe("when there is an undated TODO", () => {
    it("fails", async () => {
      const io = scriptIO({ files: { "src/index.ts": "// TODO: fix this" } });
      const result = await generateTodosReport(io);
      expect(result).toEqual({
        fail: { violations: [{ location: "src/index.ts:1:4", isoDate: null }] },
      });
    });
  });

  describe("when there is a past-due TODO", () => {
    it("fails", async () => {
      const io = scriptIO({
        files: { "src/index.ts": "// TODO 2026-01-01: fix this" },
      });
      const result = await generateTodosReport(io);
      expect(result).toEqual({
        fail: {
          violations: [{ location: "src/index.ts:1:4", isoDate: "2026-01-01" }],
        },
      });
    });
  });

  describe("when there is a future TODO", () => {
    it("passes with an upcoming count", async () => {
      const io = scriptIO({
        files: { "src/index.ts": "// TODO 2026-12-31: fix this" },
      });
      const result = await generateTodosReport(io);
      expect(result).toEqual({
        pass: { upcoming: { count: 1, nextDueIsoDate: "2026-12-31" } },
      });
    });
  });

  describe("when a TODO has an invalid date", () => {
    it("fails gracefully", async () => {
      const io = scriptIO({
        files: { "src/index.ts": "// TODO notadate: fix this" },
      });
      const result = await generateTodosReport(io);
      expect(result).toEqual({
        error: 'Bad YYYY-MM-DD at src/index.ts:1:4, got "notadate".',
      });
    });
  });

  describe("when on a branch that should be skipped", () => {
    it("skips the check", async () => {
      const io = scriptIO({
        args: ["--ignore", "^renovate\\/"],
        currentBranchName: "renovate/stuff",
      });
      const result = await generateTodosReport(io);
      expect(result).toEqual({ skip: "On ignored branch (renovate/stuff)." });
    });
  });

  describe("when on a branch that shouldn't be skipped", () => {
    it("performs the check", async () => {
      const io = scriptIO({
        args: ["--ignore", "^renovate\\/"],
        currentBranchName: "stuff",
        files: { "src/index.ts": "// TODO: fix this" },
      });
      const result = await generateTodosReport(io);
      expect(result).toEqual({
        fail: { violations: [{ location: "src/index.ts:1:4", isoDate: null }] },
      });
    });
  });

  describe("when a file extension doesn't match", () => {
    it("passes", async () => {
      const io = scriptIO({ files: { "src/index.md": "// TODO: fix this" } });
      const result = await generateTodosReport(io);
      expect(result).toEqual({
        pass: { upcoming: { count: 0, nextDueIsoDate: null } },
      });
    });
  });

  describe("when given an unknown argument", () => {
    it("fails saying the args are invalid", async () => {
      const msg =
        "Unknown flag '--bacon'. Usage: todo-check --tz <timezone> --extensions <.ext1> <.ext2> [--ignore <regex>]";
      const io = scriptIO({ args: ["--bacon", "yes"] });
      const result = await generateTodosReport(io);
      expect(result).toEqual({ error: msg });
    });
  });

  describe("when given too many ignore patterns", () => {
    it("fails saying the args are invalid", async () => {
      const msg =
        "Expected at most one --ignore flag. Usage: todo-check --tz <timezone> --extensions <.ext1> <.ext2> [--ignore <regex>]";
      const io = scriptIO({ args: ["--ignore", "foo", "--ignore", "bar"] });
      const result = await generateTodosReport(io);
      expect(result).toEqual({ error: msg });
    });
  });

  describe("when not run inside a git repo", () => {
    it("fails gracefully", async () => {
      const io = scriptIO({
        commands: {
          ...getCurrentBranchName("feature-branch"),
          ...getFiles([]),
        },
      });
      const result = await generateTodosReport(io);
      expect(result).toEqual({ error: "Not a git repository." });
    });
  });

  describe("when unable to determine current branch", () => {
    it("fails gracefully", async () => {
      const io = scriptIO({
        commands: {
          ...isGitRepository(),
          ...getFiles([]),
        },
      });
      const result = await generateTodosReport(io);
      expect(result).toEqual({ error: "Unable to determine current branch." });
    });
  });

  describe("when there's a TODO in a file containing TODO-CHECK-IGNORE", () => {
    it("ignores that TODO", async () => {
      const io = scriptIO({
        files: { "src/index.ts": "// TODO-CHECK-IGNORE\n// TODO: fix this" },
      });
      const result = await generateTodosReport(io);
      expect(result).toEqual({
        pass: { upcoming: { count: 0, nextDueIsoDate: null } },
      });
    });
  });
});
