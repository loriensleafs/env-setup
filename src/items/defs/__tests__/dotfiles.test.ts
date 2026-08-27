import { describe, expect, test } from "bun:test";
import { buildRegistry } from "../../all.ts";
import { assembleManagedBlock, MARK_START, MARK_END } from "../shell-block.ts";

const block = assembleManagedBlock(buildRegistry().all());

describe("assembled managed block", () => {
  test("owns PATH/completions/hooks/alias for every installed tool", () => {
    for (const needle of [
      ".bun/bin",
      ".local/bin",
      "brew shellenv",
      "GOPATH",
      "fnm env --use-on-cd",
      ".bun/_bun",
      "site-functions",
      "alias docker=podman",
      "uv generate-shell-completion", // uv completions (was missing)
    ]) {
      expect(block).toContain(needle);
    }
  });

  test("invokes compinit exactly once, after the FPATH section", () => {
    expect(block).toContain("autoload -Uz compinit && compinit");
    // The compinit COMMAND appears exactly once (the FPATH header also mentions it).
    expect(block.split("autoload -Uz compinit && compinit").length - 1).toBe(1);
    expect(block.indexOf("site-functions")).toBeLessThan(block.indexOf("autoload -Uz compinit"));
    expect(block.indexOf("autoload -Uz compinit")).toBeLessThan(
      block.indexOf("uv generate-shell-completion"),
    );
  });

  test("uses fnm --shell zsh (deterministic) and drops the dead cargo line", () => {
    expect(block).toContain("fnm env --use-on-cd --shell zsh");
    expect(block).not.toContain(".cargo/bin");
  });

  test("guards are conditional so a missing tool can't break shell startup", () => {
    expect(block).toContain("command -v fnm >/dev/null &&");
    expect(block).toContain("command -v podman >/dev/null &&");
    expect(block).toContain("2>/dev/null");
  });

  test("is wrapped in the marker block", () => {
    expect(block.startsWith(MARK_START)).toBe(true);
    expect(block.trimEnd().endsWith(MARK_END)).toBe(true);
  });

  test("dedupes shared lines (e.g. ~/.local/bin PATH) to a single occurrence", () => {
    const occurrences = block.split('export PATH="$HOME/.local/bin:$PATH"').length - 1;
    expect(occurrences).toBe(1);
  });
});
