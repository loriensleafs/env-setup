import { describe, expect, test } from "bun:test";
import { EDITOR_SETTINGS, EXTENSIONS, cursorConfig, vscodeConfig } from "../editor-config.ts";

describe("editor config", () => {
  test("decided extensions incl. verified anthropic.claude-code, no tailwind/copilot", () => {
    expect(EXTENSIONS).toContain("anthropic.claude-code");
    expect(EXTENSIONS).toContain("oven.bun-vscode");
    expect(EXTENSIONS.some((e) => e.includes("tailwind"))).toBe(false);
    expect(EXTENSIONS.some((e) => e.toLowerCase().includes("copilot"))).toBe(false);
  });

  test("decided settings: One Dark Pro, material icons, JetBrains font", () => {
    expect(EDITOR_SETTINGS["workbench.colorTheme"]).toBe("One Dark Pro");
    expect(EDITOR_SETTINGS["workbench.iconTheme"]).toBe("material-icon-theme");
    expect(String(EDITOR_SETTINGS["editor.fontFamily"])).toContain("JetBrainsMono Nerd Font");
  });

  test("vscode mirrors cursor (same extension list by construction)", () => {
    expect(cursorConfig.deps).toContain("cursor");
    expect(vscodeConfig.deps).toContain("vscode");
    expect(vscodeConfig.title).toContain("mirrors Cursor");
  });
});
