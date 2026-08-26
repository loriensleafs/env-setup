import { describe, expect, test } from "bun:test";
import { betterDisplaySchema } from "../better-display.ts";

describe("better-display", () => {
  test("sensible defaults", () => {
    expect(betterDisplaySchema.parse({})).toEqual({
      startAtLogin: true, showMenuBarItem: true, checkForUpdates: true,
    });
  });
});
