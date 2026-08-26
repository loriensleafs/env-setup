import { describe, expect, test } from "bun:test";
import { ghosttyConfigSchema, renderGhosttyConfig } from "../ghostty-config.ts";

describe("ghostty config", () => {
  test("defaults match the decided spec", () => {
    const c = ghosttyConfigSchema.parse({});
    expect(c).toEqual({
      fontFamily: "JetBrainsMono Nerd Font",
      fontSize: 13,
      theme: "One Dark Two",
      quickTerminal: true,
    });
  });

  test("render contains every decided option", () => {
    const out = renderGhosttyConfig(ghosttyConfigSchema.parse({}));
    for (const line of [
      "theme = One Dark Two",
      "font-family = JetBrainsMono Nerd Font",
      "font-size = 13",
      "shell-integration-features = cursor,title,path,sudo,ssh-env,ssh-terminfo",
      "copy-on-select = true",
      "clipboard-paste-protection = true",
      "window-save-state = always",
      "macos-option-as-alt = true",
      "keybind = global:cmd+grave_accent=toggle_quick_terminal",
    ]) {
      expect(out).toContain(line);
    }
    expect(out.startsWith("# managed by envsetup")).toBe(true);
  });

  test("quickTerminal false drops the keybind", () => {
    const out = renderGhosttyConfig(ghosttyConfigSchema.parse({ quickTerminal: false }));
    expect(out).not.toContain("toggle_quick_terminal");
  });

  test("font size clamps via schema", () => {
    expect(() => ghosttyConfigSchema.parse({ fontSize: 200 })).toThrow();
  });
});
