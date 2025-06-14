/* eslint-disable no-console */
import { execSync } from "child_process";
import fsp from "fs/promises";
import semver from "semver";

export async function main(args: string[]) {
  const result = await bumpCheck(args);

  if (result.error != null) {
    console.log(`🔴 ${result.error}`);
    process.exit(1);
  } else if (result.skip != null) {
    console.log(`🔵 ${result.skip}`);
    process.exit(0);
  } else {
    console.log(`🟢 ${result.success}`);
    process.exit(0);
  }
}

async function bumpCheck(args: string[]) {
  const argsResult = interpretArgs(args);

  if (argsResult == null) {
    return { error: "Invalid arguments. Usage: bump-check [--ignore <regex>]" };
  }

  const { ignoreBranchRegex } = argsResult;
  if (!isGitRepository()) {
    return { error: "Not a git repository." };
  }

  const defaultBranch = getDefaultBranchName();
  if (defaultBranch == null) {
    return { error: "Unable to determine default branch." };
  }

  const currentBranch = getCurrentBranchName();
  if (currentBranch == null) {
    return { error: "Unable to determine current branch." };
  }
  if (currentBranch === defaultBranch) {
    return { skip: `On ${defaultBranch}.` };
  }
  if (ignoreBranchRegex != null && ignoreBranchRegex.test(currentBranch)) {
    return { skip: `On ignored branch (${currentBranch}).` };
  }

  const versionResult = await getCurrentPackageJson(currentBranch);
  if ("error" in versionResult) {
    return { error: versionResult.error };
  }

  console.log(`Detected v${versionResult.version} on ${currentBranch}.`);

  const masterPackageJson = getMasterPackageJson(defaultBranch);
  if (masterPackageJson == null) {
    return {
      error: `Unable to fetch package.json from ${defaultBranch} branch.`,
    };
  }

  const masterVersionResult = retrieveVersion(masterPackageJson, defaultBranch);
  if ("error" in masterVersionResult) {
    return { error: masterVersionResult.error };
  }

  console.log(`Detected v${masterVersionResult.version} on ${defaultBranch}.`);

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

function isGitRepository() {
  try {
    execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function getDefaultBranchName() {
  return execOrNull(
    "git remote show origin | grep 'HEAD branch' | cut -d' ' -f5",
  )?.trim();
}

function getCurrentBranchName() {
  return execOrNull("git branch --show-current")?.trim();
}

async function getCurrentPackageJson(currentBranch: string) {
  try {
    return retrieveVersion(
      await fsp.readFile("package.json", "utf-8"),
      currentBranch,
    );
  } catch {
    return { error: "Unable to read package.json." as const };
  }
}

function getMasterPackageJson(defaultBranch: string) {
  return execOrNull(
    `git fetch origin ${defaultBranch} --depth=1 && git show origin/${defaultBranch}:package.json`,
  );
}

function execOrNull(command: string): string | null {
  try {
    return execSync(command, { stdio: "pipe" }).toString();
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

function interpretArgs(args: string[]) {
  if (args.length === 0) {
    return { ignoreBranchRegex: null };
  } else if (args.length === 2 && args[0] === "--ignore") {
    return { ignoreBranchRegex: new RegExp(args[1]) };
  } else {
    return null; // Invalid arguments.
  }
}
