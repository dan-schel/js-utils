/* eslint-disable no-console */
import { execSync } from "child_process";
import fsp from "fs/promises";
import semver from "semver";

main();

async function main() {
  const result = await bumpCheck();

  if (result.error != null) {
    console.log(`❌ ${result.error}`);
    process.exit(1);
  } else if (result.skip != null) {
    console.log(`⏭️ ${result.skip}`);
    process.exit(0);
  } else {
    console.log(`✅ ${result.success}`);
    process.exit(0);
  }
}

async function bumpCheck() {
  if (!isGitRepository()) {
    return { error: "Not a git repository." };
  }

  const defaultBranch = getDefaultBranchName();
  if (defaultBranch == null) {
    return { error: "Unable to determine default branch." };
  }

  const currentBranch = getBranchName();
  if (currentBranch == null) {
    return { error: "Unable to determine current branch." };
  }
  if (currentBranch === defaultBranch) {
    return { skip: `On ${currentBranch}.` };
  }

  const versionResult = await getPackageJson();
  if ("error" in versionResult) {
    return { error: versionResult.error };
  }

  console.log(`Detected v${versionResult.version} on ${currentBranch}.`);

  const masterPackageJson = getMasterPackageJson(defaultBranch);
  if (masterPackageJson == null) {
    return { error: `Unable to read package.json on ${defaultBranch}.` };
  }

  const masterVersionResult = retrieveVersion(masterPackageJson);
  if ("error" in masterVersionResult) {
    // TODO: Do this better.
    return { error: masterVersionResult.error + " (master)" };
  }

  console.log(`Detected v${masterVersionResult.version} on ${defaultBranch}.`);

  const bumped = semver.gt(versionResult.version, masterVersionResult.version);
  if (!bumped) {
    return {
      error: "Version not bumped.",
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

function getBranchName() {
  try {
    return execSync("git branch --show-current").toString().trim();
  } catch {
    return null;
  }
}

async function getPackageJson() {
  try {
    return retrieveVersion(await fsp.readFile("package.json", "utf-8"));
  } catch {
    return { error: "Unable to read package.json." as const };
  }
}

function getMasterPackageJson(defaultBranch: string) {
  try {
    return execSync(
      `git fetch origin ${defaultBranch} --depth=1 && git show ${defaultBranch}:package.json`,
    ).toString();
  } catch {
    return null;
  }
}

function getDefaultBranchName() {
  try {
    return execSync(
      "git remote show origin | grep 'HEAD branch' | cut -d' ' -f5",
    )
      .toString()
      .trim();
  } catch {
    return null;
  }
}

function retrieveVersion(packageJson: string) {
  try {
    const json: unknown = JSON.parse(packageJson);
    if (
      typeof json === "object" &&
      json !== null &&
      "version" in json &&
      typeof json.version === "string"
    ) {
      return { version: json.version };
    } else {
      return { error: "No 'version' field found in package.json." as const };
    }
  } catch {
    return { error: "Contents of package.json weren't valid JSON." as const };
  }
}
