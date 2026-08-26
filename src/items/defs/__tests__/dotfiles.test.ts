import { describe, expect, test } from "bun:test";
import { MANAGED_BLOCK } from "../dotfiles.ts";

describe("dotfiles managed block", () => {
  test("owns PATH for every installed tool + hooks + completions + alias", () => {
    for (const needle of [
      ".bun/bin", ".local/bin", "brew shellenv", "GOPATH", ".cargo/bin",
      "fnm env --use-on-cd", ".bun/_bun", "site-functions", "alias docker=podman",
    ]) {
      expect(MANAGED_BLOCK).toContain(needle);
    }
  });

  test("guards are conditional so a missing tool can't break shell startup", () => {
    expect(MANAGED_BLOCK).toContain("command -v fnm >/dev/null &&");
    expect(MANAGED_BLOCK).toContain("command -v podman >/dev/null &&");
    expect(MANAGED_BLOCK).toContain('2>/dev/null');
  });
});
