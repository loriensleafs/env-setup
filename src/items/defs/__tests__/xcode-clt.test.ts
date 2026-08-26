import { describe, expect, test } from "bun:test";
import type { ItemContext } from "../../item.ts";
import type { RunResult } from "../../../exec/run.ts";
import { xcodeClt } from "../xcode-clt.ts";

function ctxWith(responses: Record<string, RunResult>): ItemContext {
  return {
    manifest: {} as never,
    log: () => {},
    run: async (cmd) => {
      const key = cmd.join(" ");
      for (const [pattern, result] of Object.entries(responses)) {
        if (key.includes(pattern)) return result;
      }
      return { exitCode: 1, stdout: "", stderr: "" };
    },
  };
}

describe("xcode-clt", () => {
  test("detect reads pkgutil version when present", async () => {
    const ctx = ctxWith({
      "xcode-select": { exitCode: 0, stdout: "/Library/Developer/CommandLineTools\n", stderr: "" },
      "pkgutil": { exitCode: 0, stdout: "version: 26.0.0.0.1\n", stderr: "" },
    });
    expect(await xcodeClt.detect(ctx)).toEqual({ installed: true, version: "26.0.0.0.1" });
  });

  test("not installed when xcode-select fails", async () => {
    expect((await xcodeClt.detect(ctxWith({}))).installed).toBe(false);
  });

  test("install finds the softwareupdate label", async () => {
    const cmds: string[] = [];
    const ctx: ItemContext = {
      manifest: {} as never,
      log: () => {},
      run: async (cmd) => {
        cmds.push(cmd.join(" "));
        if (cmd.join(" ").includes("--list")) {
          return {
            exitCode: 0,
            stdout: "* Label: Command Line Tools for Xcode-26.0\n",
            stderr: "",
          };
        }
        return { exitCode: 0, stdout: "", stderr: "" };
      },
    };
    await xcodeClt.install?.(ctx);
    expect(cmds.some((c) => c.includes('--install Command Line Tools for Xcode-26.0'))).toBe(true);
  });

  test("install throws when no label found", async () => {
    const ctx = ctxWith({ "--list": { exitCode: 0, stdout: "no labels here", stderr: "" } });
    await expect(xcodeClt.install?.(ctx)).rejects.toThrow(/could not find/);
  });
});
