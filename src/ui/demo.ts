#!/usr/bin/env bun
// Interactive demo of the Stage A UI pieces. Run: bun src/ui/demo.ts
import * as p from "@clack/prompts";
import { horizontalRadio } from "./horizontal-radio.ts";
import { unifiedSelect } from "./unified-select.ts";

p.intro("envsetup UI demo");

const picks = await unifiedSelect({
  message: "What should this machine get?",
  options: [
    { id: "xcode-clt", label: "Xcode Command Line Tools", section: "Required", locked: "on" },
    { id: "homebrew", label: "Homebrew", section: "Required", locked: "installed", hint: "installed 4.6.20 ✓" },
    { id: "bun", label: "Bun", section: "Required", locked: "installed", hint: "installed 1.4.0 ✓" },
    { id: "chrome", label: "Google Chrome", section: "Apps", hint: "installed 139 → will upgrade to 140" },
    { id: "ghostty", label: "Ghostty", section: "Apps" },
    { id: "cursor", label: "Cursor", section: "Apps" },
    { id: "raycast", label: "Raycast", section: "Apps" },
    { id: "jetbrains-font", label: "JetBrains Mono Nerd Font", section: "Fonts" },
    { id: "fira-font", label: "Fira Code Nerd Font", section: "Fonts" },
    {
      id: "ghostty-config",
      label: "Ghostty config (One Dark Two, JetBrains Mono NF)",
      section: "Apps",
      requires: ["ghostty", "jetbrains-font"],
    },
    {
      id: "chrome-pwas",
      label: "Google web apps in Dock (Mail, Calendar, Drive, Notes)",
      section: "Apps",
      requires: ["chrome"],
    },
  ],
});
if (p.isCancel(picks)) {
  p.cancel("demo cancelled");
  process.exit(0);
}
p.log.info(`selected: ${(picks as string[]).join(", ")}`);

const effort = await horizontalRadio({
  message: "Claude Code effort level",
  options: [{ value: "low" }, { value: "medium" }, { value: "high" }],
  initialValue: "high",
});
if (p.isCancel(effort)) {
  p.cancel("demo cancelled");
  process.exit(0);
}
p.log.info(`effort: ${String(effort)}`);

p.outro("demo complete");
