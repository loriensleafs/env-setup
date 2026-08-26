import { describe, expect, test } from "bun:test";
import { humanize } from "../config-screens.ts";

describe("humanize", () => {
  test("camelCase to words", () => {
    expect(humanize("fontSize")).toBe("Font size");
    expect(humanize("quickTerminal")).toBe("Quick terminal");
    expect(humanize("memoryMb")).toBe("Memory mb");
    expect(humanize("theme")).toBe("Theme");
  });
});
