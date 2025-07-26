import fs from "fs";
import path from "path";
import { assert, test } from "vitest";

const exceptions = [
  // Exported as a binary in bin/bump-check.
  "src/bump-check.ts",
];

test("all code files are exported", () => {
  for (const dir of getDirsToCheck()) {
    // Step 1: Check every folder in src has an index.ts file.
    const indexFile = path.join(dir, "index.ts");
    assert(fs.existsSync(indexFile), `'${dir}' is missing an index.ts file`);
    const indexContent = fs.readFileSync(indexFile, "utf-8");

    // Step 2: Make sure the index.ts file exports all other typescript files in
    // the directory.
    for (const file of getNonIndexTypescriptFiles(dir)) {
      const relativePath = path.relative(dir, file);
      const expectedExport = `export * from "./${relativePath.replace(/.ts$/g, ".js")}";`;
      assert(
        indexContent.includes(expectedExport),
        `'${indexFile}' should contain '${expectedExport}'`,
      );
    }

    // Step 3: Make sure the index.ts file exports the index.ts files of each
    // of its subdirectories.
    for (const subdir of getSubdirectories(dir)) {
      const relativePath = path.relative(dir, subdir);
      const expectedExport = `export * from "./${relativePath}/index.js";`;
      assert(
        indexContent.includes(expectedExport),
        `'${indexFile}' should contain '${expectedExport}'`,
      );
    }
  }
});

function getDirsToCheck(dir: string = "src") {
  const childDirs = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((x) => x.isDirectory())
    .flatMap((x) => getDirsToCheck(path.join(dir, x.name)));
  return [dir, ...childDirs];
}

function getNonIndexTypescriptFiles(dir: string) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(
      (x) => x.isFile() && x.name.endsWith(".ts") && x.name !== "index.ts",
    )
    .map((f) => path.join(dir, f.name))
    .filter((x) => !exceptions.includes(x));
}

function getSubdirectories(dir: string) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((file) => file.isDirectory())
    .map((file) => path.join(dir, file.name));
}
