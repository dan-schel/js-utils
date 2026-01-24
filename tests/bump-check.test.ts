import { describe, expect, it } from "vitest";
import { bumpCheck, ScriptIO } from "../src/bump-check.js";

class FakeScriptIO extends ScriptIO {
  readonly logs: string[] = [];

  constructor(
    private readonly _args: string[],
    private readonly _commands: Record<string, string>,
    private readonly _packageJson: string | null,
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
  async readPackageJson(): Promise<string> {
    if (this._packageJson === null) throw new Error();
    return this._packageJson;
  }

  log(text: string): void {
    this.logs.push(text);
  }
}

function scriptIO({
  args = [],
  commands,
  packageJson,
  defaultBranch = "1.0.0",
  defaultBranchName = "master",
  currentBranch = "1.0.0",
  currentBranchName = "feature-branch",
}: {
  args?: string[];
  commands?: Record<string, string>;
  packageJson?: string | null;
  defaultBranch?: string;
  defaultBranchName?: string;
  currentBranch?: string;
  currentBranchName?: string;
}) {
  return new FakeScriptIO(
    ["node", "bump-check.js", ...args],
    commands ?? {
      ...isGitRepository(),
      ...getDefaultBranchName(defaultBranchName),
      ...getCurrentBranchName(currentBranchName),
      ...getMasterPackageJson(
        defaultBranchName,
        JSON.stringify({ version: defaultBranch }),
      ),
    },
    packageJson !== undefined
      ? packageJson
      : JSON.stringify({ version: currentBranch }),
  );
}

function isGitRepository() {
  return { "git rev-parse --is-inside-work-tree": "true" };
}

function getDefaultBranchName(name: string) {
  return {
    "git remote show origin | grep 'HEAD branch' | cut -d' ' -f5": name,
  };
}

function getCurrentBranchName(name: string) {
  return { "git branch --show-current": name };
}

function getMasterPackageJson(branchName: string, content: string) {
  return {
    [`git fetch origin ${branchName} --depth=1 && git show origin/${branchName}:package.json`]:
      content,
  };
}

describe("bump-check script", () => {
  describe("when the version has been updated", () => {
    it("passes", async () => {
      const io = scriptIO({ defaultBranch: "1.0.0", currentBranch: "1.0.1" });
      const result = await bumpCheck(io);
      expect(result).toEqual({ success: "Looks good!" });
      expect(io.logs).toEqual([
        "Detected v1.0.1 on feature-branch.",
        "Detected v1.0.0 on master.",
      ]);
    });
  });

  describe("when the version is the same", () => {
    it("outputs the detected versions and fails", async () => {
      const msg =
        "Version not updated. Run 'npm version patch|minor|major' and commit the changes.";
      const io = scriptIO({ defaultBranch: "1.0.0", currentBranch: "1.0.0" });
      const result = await bumpCheck(io);
      expect(result).toEqual({ error: msg });
      expect(io.logs).toEqual([
        "Detected v1.0.0 on feature-branch.",
        "Detected v1.0.0 on master.",
      ]);
    });
  });

  describe("when the version is older", () => {
    it("outputs the detected versions and fails", async () => {
      const msg =
        "Version not updated. Run 'npm version patch|minor|major' and commit the changes.";
      const io = scriptIO({ defaultBranch: "1.0.1", currentBranch: "1.0.0" });
      const result = await bumpCheck(io);
      expect(result).toEqual({ error: msg });
      expect(io.logs).toEqual([
        "Detected v1.0.0 on feature-branch.",
        "Detected v1.0.1 on master.",
      ]);
    });
  });

  describe("when running on master", () => {
    it("skips the version check", async () => {
      const msg = "On master.";
      const io = scriptIO({ currentBranchName: "master" });
      const result = await bumpCheck(io);
      expect(result).toEqual({ skip: msg });
      expect(io.logs).toEqual([]);
    });
  });

  describe("when on a branch that should be skipped", () => {
    it("skips the version check", async () => {
      const msg = "On ignored branch (renovate/stuff).";
      const io = scriptIO({
        args: ["--ignore", "^renovate\\/"],
        currentBranchName: "renovate/stuff",
      });
      const result = await bumpCheck(io);
      expect(result).toEqual({ skip: msg });
      expect(io.logs).toEqual([]);
    });
  });

  describe("when on a branch that shouldn't be skipped", () => {
    it("performs the version check", async () => {
      const msg =
        "Version not updated. Run 'npm version patch|minor|major' and commit the changes.";
      const io = scriptIO({
        args: ["--ignore", "^renovate\\/"],
        currentBranchName: "stuff",
      });
      const result = await bumpCheck(io);
      expect(result).toEqual({ error: msg });
      expect(io.logs).toEqual([
        "Detected v1.0.0 on stuff.",
        "Detected v1.0.0 on master.",
      ]);
    });
  });

  describe("when given no branch to skip", () => {
    it("fails saying the args are invalid", async () => {
      const msg = "Invalid arguments. Usage: bump-check [--ignore <regex>]";
      const io = scriptIO({ args: ["--ignore"] });
      const result = await bumpCheck(io);
      expect(result).toEqual({ error: msg });
      expect(io.logs).toEqual([]);
    });
  });

  describe("when given invalid arguments", () => {
    it("fails saying the args are invalid", async () => {
      const msg = "Invalid arguments. Usage: bump-check [--ignore <regex>]";
      const io = scriptIO({ args: ["--bacon", "yes"] });
      const result = await bumpCheck(io);
      expect(result).toEqual({ error: msg });
      expect(io.logs).toEqual([]);
    });
  });

  describe("when package.json is mangled", () => {
    it("fails gracefully", async () => {
      const msg =
        "Contents of feature-branch's package.json weren't valid JSON.";
      const io = scriptIO({ packageJson: "" });
      const result = await bumpCheck(io);
      expect(result).toEqual({ error: msg });
      expect(io.logs).toEqual([]);
    });
  });

  describe("when package.json cannot be read", () => {
    it("fails gracefully", async () => {
      const msg = "Unable to read package.json.";
      const io = scriptIO({ packageJson: null });
      const result = await bumpCheck(io);
      expect(result).toEqual({ error: msg });
      expect(io.logs).toEqual([]);
    });
  });

  describe("when not run inside a git repo", () => {
    it("fails gracefully", async () => {
      const msg = "Not a git repository.";
      const io = scriptIO({
        commands: {
          //...isGitRepository(),
          ...getDefaultBranchName("master"),
          ...getCurrentBranchName("feature-branch"),
          ...getMasterPackageJson("master", '{ version: "1.0.0" }'),
        },
      });
      const result = await bumpCheck(io);
      expect(result).toEqual({ error: msg });
      expect(io.logs).toEqual([]);
    });
  });

  describe("when unable to determine default branch name", () => {
    it("fails gracefully", async () => {
      const msg = "Unable to determine default branch.";
      const io = scriptIO({
        commands: {
          ...isGitRepository(),
          //...getDefaultBranchName("master"),
          ...getCurrentBranchName("feature-branch"),
          ...getMasterPackageJson("master", '{ version: "1.0.0" }'),
        },
      });
      const result = await bumpCheck(io);
      expect(result).toEqual({ error: msg });
      expect(io.logs).toEqual([]);
    });
  });

  describe("when unable to determine current branch name", () => {
    it("fails gracefully", async () => {
      const msg = "Unable to determine current branch.";
      const io = scriptIO({
        commands: {
          ...isGitRepository(),
          ...getDefaultBranchName("master"),
          //...getCurrentBranchName("feature-branch"),
          ...getMasterPackageJson("master", '{ version: "1.0.0" }'),
        },
      });
      const result = await bumpCheck(io);
      expect(result).toEqual({ error: msg });
      expect(io.logs).toEqual([]);
    });
  });

  describe("when unable read package.json on master", () => {
    it("outputs the detected current version and fails gracefully", async () => {
      const msg = "Unable to fetch package.json from master branch.";
      const io = scriptIO({
        commands: {
          ...isGitRepository(),
          ...getDefaultBranchName("master"),
          ...getCurrentBranchName("feature-branch"),
          //...getMasterPackageJson("master", '{ version: "1.0.0" }'),
        },
      });
      const result = await bumpCheck(io);
      expect(result).toEqual({ error: msg });
      expect(io.logs).toEqual(["Detected v1.0.0 on feature-branch."]);
    });
  });

  describe("when package.json on master is mangled", () => {
    it("outputs the detected current version and fails gracefully", async () => {
      const msg = "Contents of master's package.json weren't valid JSON.";
      const io = scriptIO({
        commands: {
          ...isGitRepository(),
          ...getDefaultBranchName("master"),
          ...getCurrentBranchName("feature-branch"),
          ...getMasterPackageJson("master", ""),
        },
      });
      const result = await bumpCheck(io);
      expect(result).toEqual({ error: msg });
      expect(io.logs).toEqual(["Detected v1.0.0 on feature-branch."]);
    });
  });
});
