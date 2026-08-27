import { describe, expect, test } from "bun:test";
import type { ItemContext } from "../../item.ts";
import { DEFAULTS, macosDefaults } from "../macos-defaults.ts";

function ctx(reads: Record<string, string>, calls: string[] = []): ItemContext {
  return {
    manifest: {} as never,
    log: () => {},
    run: async (cmd) => {
      calls.push(cmd.join(" "));
      if (cmd[0] === "defaults" && cmd[1] === "read") {
        const key = `${cmd[2]}.${cmd[3]}`;
        if (key in reads) return { exitCode: 0, stdout: `${reads[key]}\n`, stderr: "" };
        return { exitCode: 1, stdout: "", stderr: "missing" };
      }
      if (cmd[0] === "ls")
        return { exitCode: 0, stdout: "drwx------ peterkloss Library", stderr: "" };
      return { exitCode: 0, stdout: "", stderr: "" };
    },
  };
}

const allSet = Object.fromEntries(
  DEFAULTS.map((d) => [
    `${d.domain}.${d.key}`,
    d.type === "bool" ? (d.value === "true" ? "1" : "0") : d.value,
  ]),
);

describe("macos-defaults", () => {
  test("detect true when every default matches and Library visible", async () => {
    expect((await macosDefaults.detect(ctx(allSet))).installed).toBe(true);
  });

  test("detect false when one differs", async () => {
    const partial = { ...allSet, "com.apple.finder.FXPreferredViewStyle": "icnv" };
    expect((await macosDefaults.detect(ctx(partial))).installed).toBe(false);
  });

  test("install writes every default and restarts Finder", async () => {
    const calls: string[] = [];
    await macosDefaults.install?.(ctx({}, calls));
    expect(calls.filter((c) => c.startsWith("defaults write")).length).toBe(DEFAULTS.length);
    expect(calls.some((c) => c.startsWith("chflags nohidden"))).toBe(true);
    expect(calls.some((c) => c === "killall Finder")).toBe(true);
  });
});
