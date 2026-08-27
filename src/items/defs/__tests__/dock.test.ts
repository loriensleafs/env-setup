import { describe, expect, test } from "bun:test";
import type { ItemContext } from "../../item.ts";
import { dock, DOCK_APPS } from "../dock.ts";

function ctx(presentPaths: string[], calls: string[]): ItemContext {
  return {
    manifest: {} as never,
    log: () => {},
    run: async (cmd) => {
      calls.push(cmd.join(" "));
      if (cmd[0] === "ls") {
        const target = cmd[1] as string;
        return presentPaths.includes(target)
          ? { exitCode: 0, stdout: "", stderr: "" }
          : { exitCode: 1, stdout: "", stderr: "" };
      }
      return { exitCode: 0, stdout: "", stderr: "" };
    },
  };
}

describe("dock", () => {
  test("configure adds only present apps, in decided order, then restarts Dock", async () => {
    const calls: string[] = [];
    await dock.configure?.(
      ctx(["/Applications/Ghostty.app", "/Applications/Cursor.app", "/Applications"], calls),
      undefined,
    );
    const adds = calls.filter((c) => c.includes("--add"));
    expect(adds.some((c) => c.includes("Ghostty"))).toBe(true);
    expect(adds.some((c) => c.includes("Typora"))).toBe(false); // absent → skipped
    expect(calls.some((c) => c.includes("--remove all"))).toBe(true);
    expect(calls.at(-1)).toBe("killall Dock");
    // order preserved: Ghostty add before Cursor add
    expect(adds.findIndex((c) => c.includes("Ghostty"))).toBeLessThan(
      adds.findIndex((c) => c.includes("Cursor")),
    );
  });

  test("decided dock order is recorded", () => {
    expect(DOCK_APPS.map((a) => a.label)).toEqual([
      "Apps",
      "System Settings",
      "Ghostty",
      "Cursor",
      "Typora",
      "Claude",
      "Chrome",
      "Mail",
      "Calendar",
      "Drive",
      "Notes",
    ]);
  });
});
