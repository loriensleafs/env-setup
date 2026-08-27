import { describe, expect, test } from "bun:test";
import { EDITOR_SETTINGS, EXTENSIONS, cursorConfig, vscodeConfig } from "../editor-config.ts";

describe("editor config", () => {
  test("decided extensions incl. verified anthropic.claude-code, no tailwind/copilot", () => {
    expect(EXTENSIONS).toContain("anthropic.claude-code");
    expect(EXTENSIONS).toContain("oven.bun-vscode");
    expect(EXTENSIONS.some((e) => e.includes("tailwind"))).toBe(false);
    expect(EXTENSIONS.some((e) => e.toLowerCase().includes("copilot"))).toBe(false);
  });

  test("decided settings: One Dark Pro via preferred*, material icons, JetBrains font", () => {
    // autoDetectColorScheme rewrites workbench.colorTheme (vscode #196119), so
    // the theme is pinned through the preferred* keys and colorTheme is NOT set.
    expect(EDITOR_SETTINGS["workbench.preferredDarkColorTheme"]).toBe("One Dark Pro");
    expect(EDITOR_SETTINGS["workbench.preferredLightColorTheme"]).toBe("Default Light Modern");
    expect(EDITOR_SETTINGS["workbench.colorTheme"]).toBeUndefined();
    expect(EDITOR_SETTINGS["window.autoDetectColorScheme"]).toBe(true);
    expect(EDITOR_SETTINGS["workbench.iconTheme"]).toBe("material-icon-theme");
    expect(String(EDITOR_SETTINGS["editor.fontFamily"])).toContain("JetBrainsMono Nerd Font");
  });

  test("vscode mirrors cursor (same extension list by construction)", () => {
    expect(cursorConfig.deps).toContain("cursor");
    expect(vscodeConfig.deps).toContain("vscode");
    expect(vscodeConfig.title).toContain("mirrors Cursor");
  });
});
