import { execSync } from "child_process";
import fsp from "fs/promises";
import semver from "semver";

export async function main(io: ScriptIO = new RealScriptIO()) {
  const result = await bumpCheck(io);

  if (result.error != null) {
    io.log(`🔴 ${result.error}`);
    process.exit(1);
  } else if (result.skip != null) {
    io.log(`🔵 ${result.skip}`);
    process.exit(0);
  } else {
    io.log(`🟢 ${result.success}`);
    process.exit(0);
  }
}

export async function bumpCheck(io: ScriptIO) {
  const argsResult = interpretArgs(io);

  if (argsResult == null) {
    return { error: "Invalid arguments. Usage: bump-check [--ignore <regex>]" };
  }

  const { ignoreBranchRegex } = argsResult;
  if (!isGitRepository(io)) {
    return { error: "Not a git repository." };
  }

  const defaultBranch = getDefaultBranchName(io);
  if (defaultBranch == null) {
    return { error: "Unable to determine default branch." };
  }

  const currentBranch = getCurrentBranchName(io);
  if (currentBranch == null) {
    return { error: "Unable to determine current branch." };
  }
  if (currentBranch === defaultBranch) {
    return { skip: `On ${defaultBranch}.` };
  }
  if (ignoreBranchRegex != null && ignoreBranchRegex.test(currentBranch)) {
    return { skip: `On ignored branch (${currentBranch}).` };
  }

  const versionResult = await getCurrentPackageJson(io, currentBranch);
  if ("error" in versionResult) {
    return { error: versionResult.error };
  }

  io.log(`Detected v${versionResult.version} on ${currentBranch}.`);

  const masterPackageJson = getMasterPackageJson(io, defaultBranch);
  if (masterPackageJson == null) {
    return {
      error: `Unable to fetch package.json from ${defaultBranch} branch.`,
    };
  }

  const masterVersionResult = retrieveVersion(masterPackageJson, defaultBranch);
  if ("error" in masterVersionResult) {
    return { error: masterVersionResult.error };
  }

  io.log(`Detected v${masterVersionResult.version} on ${defaultBranch}.`);

  const bumped = semver.gt(versionResult.version, masterVersionResult.version);
  if (!bumped) {
    return {
      error: `Version not updated. Run 'npm version patch|minor|major' and commit the changes.`,
    };
  } else {
    return {
      success: "Looks good!",
    };
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

function getDefaultBranchName(io: ScriptIO) {
  return execOrNull(
    io,
    "git remote show origin | grep 'HEAD branch' | cut -d' ' -f5",
  )?.trim();
}

function getCurrentBranchName(io: ScriptIO) {
  return execOrNull(io, "git branch --show-current")?.trim();
}

async function getCurrentPackageJson(io: ScriptIO, currentBranch: string) {
  try {
    return retrieveVersion(await io.readPackageJson(), currentBranch);
  } catch {
    return { error: "Unable to read package.json." as const };
  }
}

function getMasterPackageJson(io: ScriptIO, defaultBranch: string) {
  return execOrNull(
    io,
    `git fetch origin ${defaultBranch} --depth=1 && git show origin/${defaultBranch}:package.json`,
  );
}

function execOrNull(io: ScriptIO, command: string): string | null {
  try {
    return io.execSync(command);
  } catch {
    return null;
  }
}

function retrieveVersion(jsonStr: string, branch: string) {
  try {
    const json: unknown = JSON.parse(jsonStr);
    if (
      typeof json === "object" &&
      json !== null &&
      "version" in json &&
      typeof json.version === "string"
    ) {
      return { version: json.version };
    } else {
      return {
        error: `No 'version' field found in ${branch}'s package.json.` as const,
      };
    }
  } catch {
    return {
      error:
        `Contents of ${branch}'s package.json weren't valid JSON.` as const,
    };
  }
}

function interpretArgs(io: ScriptIO) {
  const args = io.getArgs().slice(2);

  if (args.length === 0) {
    return { ignoreBranchRegex: null };
  } else if (args.length === 2 && args[0] === "--ignore") {
    return { ignoreBranchRegex: new RegExp(args[1]) };
  } else {
    return null; // Invalid arguments.
  }
}

export abstract class ScriptIO {
  abstract getArgs(): string[];
  abstract execSync(command: string): string;
  abstract execSyncSilent(command: string): void;
  abstract readPackageJson(): Promise<string>;
  abstract log(text: string): void;
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

  override readPackageJson(): Promise<string> {
    return fsp.readFile("package.json", "utf-8");
  }

  override log(text: string): void {
    // eslint-disable-next-line no-console
    console.log(text);
  }
}
