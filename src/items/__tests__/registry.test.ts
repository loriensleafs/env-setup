import { describe, expect, test } from "bun:test";
import { z } from "zod";
import { defineItem } from "../item.ts";
import { DuplicateItemError, ItemRegistry } from "../registry.ts";

function stub(id: string, deps?: string[]) {
  return defineItem({
    id,
    title: id,
    kind: "brew-formula",
    deps,
    detect: async () => ({ installed: false }),
  });
}

describe("ItemRegistry", () => {
  test("registers, gets, rejects duplicates", () => {
    const r = new ItemRegistry();
    r.register(stub("jq"));
    expect(r.get("jq")?.id).toBe("jq");
    expect(() => r.register(stub("jq"))).toThrow(DuplicateItemError);
  });

  test("execution order respects deps and ignores deps outside the run", () => {
    const r = new ItemRegistry();
    r.register(stub("xcode-clt"));
    r.register(stub("homebrew", ["xcode-clt"]));
    r.register(stub("jq", ["homebrew"]));
    expect(r.executionOrder()).toEqual(["xcode-clt", "homebrew", "jq"]);
    // homebrew unselected → jq still runs, ordered without it
    expect(r.executionOrder(["jq", "xcode-clt"])).toEqual(["jq", "xcode-clt"]);
  });

  test("defineItem preserves config typing", () => {
    const item = defineItem({
      id: "podman",
      title: "Podman",
      kind: "brew-formula",
      configSchema: z.object({ cpus: z.number().int().min(1).max(16) }),
      defaultConfig: { cpus: 4 },
      detect: async () => ({ installed: false }),
      configure: async (_ctx, config) => {
        void config.cpus; // typed access compiles
      },
    });
    expect(item.defaultConfig?.cpus).toBe(4);
  });
});
