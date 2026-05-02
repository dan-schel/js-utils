import { execSync } from "node:child_process";
import fsp from "node:fs/promises";

export abstract class ScriptIO {
  abstract getArgs(): string[];
  abstract execSync(command: string): string;
  abstract execSyncSilent(command: string): void;
  abstract readFile(path: string): Promise<string>;
  abstract listFiles(path: string): Promise<string[]>;
  abstract log(text: string): void;
}

export class RealScriptIO extends ScriptIO {
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
