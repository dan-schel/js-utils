import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ScriptIO, todoCheck } from "../src/todo-check.js";

class FakeScriptIO extends ScriptIO {
  readonly logs: string[] = [];

  constructor(
    private readonly _args: string[],
    private readonly _commands: Record<string, string>,
    private readonly _files: Record<string, string>,
    private readonly _listFiles: string[],
  ) {
    super();
  }

  override getArgs(): string[] {
    return this._args;
  }

  override execSync(command: string): string {
    if (command in this._commands) {
      return this._commands[command];
    }
    throw new Error();
  }

  override execSyncSilent(command: string): void {
    if (!(command in this._commands)) throw new Error();
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  override async readFile(path: string): Promise<string> {
    if (!(path in this._files)) throw new Error();
    return this._files[path];
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  override async listFiles(_path: string): Promise<string[]> {
    return this._listFiles;
  }

  override log(text: string): void {
    this.logs.push(text);
  }
}

function scriptIO({
  args = [],
  files = {},
  gitFiles = Object.keys(files).filter(
    (filePath) => filePath !== ".todoignore",
  ),
  isGitRepository = true,
}: {
  args?: string[];
  files?: Record<string, string>;
  gitFiles?: string[];
  isGitRepository?: boolean;
}) {
  return new FakeScriptIO(
    ["node", "todo-check.js", ...args],
    isGitRepository
      ? {
          "git rev-parse --is-inside-work-tree": "true",
          "git ls-files --cached --others --exclude-standard -z": `${gitFiles.join("\0")}\0`,
        }
      : {},
    files,
    gitFiles,
  );
}

describe("todo-check script", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-02T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("passes when there are no plain or due TODOs", async () => {
    const io = scriptIO({
      args: ["--tz", "Australia/Melbourne"],
      files: {
        "src/file.ts": "const x = 1;\n// TODO 2026-05-04: later\n",
      },
    });

    const result = await todoCheck(io);

    expect(result).toEqual({
      success: "Looks good! (Found 1 timed TODO.)",
    });
    expect(io.logs).toEqual([]);
  });

  it("fails on plain TODO comments and reports clickable locations", async () => {
    const io = scriptIO({
      args: ["--tz", "Australia/Melbourne"],
      files: {
        "src/file.ts": "const x = 1;\n// TODO: fix this\n",
      },
    });

    const result = await todoCheck(io);

    expect(result).toEqual({
      error: "Found 1 TODOs:\n\nsrc/file.ts:2",
    });
  });

  it("fails when a dated TODO is due in the configured timezone", async () => {
    const io = scriptIO({
      args: ["--tz", "Australia/Melbourne"],
      files: {
        "src/file.ts": "// TODO 2026-05-02: remove workaround\n",
      },
    });

    const result = await todoCheck(io);

    expect(result).toEqual({
      error: "Found 1 TODOs:\n\nsrc/file.ts:1",
    });
  });

  it("applies .todoignore patterns after gitignore filtering", async () => {
    const io = scriptIO({
      args: ["--tz", "Australia/Melbourne"],
      files: {
        ".todoignore": "ignored.ts\nsubdir/\n",
        "nested/ignored.ts": "// TODO: ignored\n",
        "subdir/file.ts": "// TODO 2026-05-01: ignored\n",
        "checked.ts": "// TODO 2026-05-03: still allowed\n",
      },
    });

    const result = await todoCheck(io);

    expect(result).toEqual({
      success: "Looks good! (Found 1 timed TODO.)",
    });
  });

  it("falls back to scanning files directly outside a git repository", async () => {
    const io = scriptIO({
      args: ["--tz", "Australia/Melbourne"],
      isGitRepository: false,
      files: {
        ".todoignore": "ignored.ts\n",
        "ignored.ts": "// TODO: ignored\n",
        "src/file.ts": "// TODO: found\n",
      },
      gitFiles: ["ignored.ts", "src/file.ts"],
    });

    const result = await todoCheck(io);

    expect(result).toEqual({
      error: "Found 1 TODOs:\n\nsrc/file.ts:1",
    });
  });

  it("fails gracefully on invalid arguments", async () => {
    const io = scriptIO({ args: ["--tz"] });

    const result = await todoCheck(io);

    expect(result).toEqual({
      error: "Invalid arguments. Usage: todo-check [--tz <iana-timezone>]",
    });
  });
});
