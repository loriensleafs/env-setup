import { describe, expect, test } from "bun:test";
import { MANAGED_BLOCK } from "../dotfiles.ts";

describe("dotfiles managed block", () => {
  test("owns the decided lines: bun/local PATH, brew, fnm hook, docker alias", () => {
    expect(MANAGED_BLOCK).toContain(".bun/bin");
    expect(MANAGED_BLOCK).toContain(".local/bin");
    expect(MANAGED_BLOCK).toContain("brew shellenv");
    expect(MANAGED_BLOCK).toContain("fnm env --use-on-cd");
    expect(MANAGED_BLOCK).toContain("alias docker=podman");
  });

  test("guards are conditional so a missing tool can't break shell startup", () => {
    expect(MANAGED_BLOCK).toContain("command -v fnm >/dev/null &&");
    expect(MANAGED_BLOCK).toContain("command -v podman >/dev/null &&");
    expect(MANAGED_BLOCK).toContain('2>/dev/null');
  });
});
