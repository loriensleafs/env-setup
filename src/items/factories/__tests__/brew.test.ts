import { describe, expect, test } from "bun:test";
import type { ItemContext } from "../../item.ts";
import type { RunResult } from "../../../exec/run.ts";
import { brewCask, brewFormula } from "../brew.ts";

function ctxWith(responses: Record<string, RunResult>): ItemContext & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    manifest: {} as never,
    log: () => {},
    run: async (cmd) => {
      const key = cmd.join(" ");
      calls.push(key);
      for (const [pattern, result] of Object.entries(responses)) {
        if (key.includes(pattern)) return result;
      }
      return { exitCode: 1, stdout: "", stderr: "not mocked" };
    },
  };
}

describe("brewFormula", () => {
  test("detect parses installed version", async () => {
    const ctx = ctxWith({
      "list --versions jq": { exitCode: 0, stdout: "jq 1.7.1\n", stderr: "" },
    });
    const d = await brewFormula({ id: "jq", title: "jq" }).detect(ctx);
    expect(d).toEqual({ installed: true, version: "1.7.1" });
  });

  test("detect handles not-installed", async () => {
    const ctx = ctxWith({});
    const d = await brewFormula({ id: "jq", title: "jq" }).detect(ctx);
    expect(d.installed).toBe(false);
  });

  test("install throws with stderr on failure; succeeds silently otherwise", async () => {
    const bad = ctxWith({});
    await expect(brewFormula({ id: "jq", title: "jq" }).install?.(bad)).rejects.toThrow(
      /not mocked/,
    );
    const good = ctxWith({ "install jq": { exitCode: 0, stdout: "", stderr: "" } });
    await expect(brewFormula({ id: "jq", title: "jq" }).install?.(good)).resolves.toBeUndefined();
  });

  test("respects custom brew name and extra deps", async () => {
    const item = brewFormula({ id: "delta", title: "delta", name: "git-delta", deps: ["x"] });
    expect(item.deps).toEqual(["homebrew", "x"]);
    const ctx = ctxWith({
      "list --versions git-delta": { exitCode: 0, stdout: "git-delta 0.18.2", stderr: "" },
    });
    const d = await item.detect(ctx);
    expect(d.version).toBe("0.18.2");
  });

  test("cask uses --cask paths", async () => {
    const ctx = ctxWith({
      "list --cask --versions ghostty": { exitCode: 0, stdout: "ghostty 1.3.1", stderr: "" },
    });
    const d = await brewCask({ id: "ghostty", title: "Ghostty" }).detect(ctx);
    expect(d).toEqual({ installed: true, version: "1.3.1" });
    expect(ctx.calls[0]).toContain("--cask");
  });
});

describe("brewCask .app fallback", () => {
  test("manually-installed app detected via Info.plist", async () => {
    const ctx = ctxWith({
      "defaults read /Applications/Google Chrome.app/Contents/Info CFBundleShortVersionString": {
        exitCode: 0,
        stdout: "140.0.7339.80\n",
        stderr: "",
      },
    });
    const item = brewCask({
      id: "chrome",
      title: "Chrome",
      name: "google-chrome",
      appPath: "/Applications/Google Chrome.app",
    });
    const d = await item.detect(ctx);
    expect(d.installed).toBe(true);
    expect(d.version).toContain("not brew-managed");
  });

  test("absent app with appPath is not installed", async () => {
    const item = brewCask({ id: "x", title: "X", appPath: "/Applications/Nope.app" });
    expect((await item.detect(ctxWith({}))).installed).toBe(false);
  });
});
