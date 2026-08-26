#!/usr/bin/env bun
// Interactive demo of the Stage A UI pieces. Run: bun src/ui/demo.ts
import * as p from "@clack/prompts";
import { horizontalRadio } from "./horizontal-radio.ts";
import { groupMultiselect } from "./group-multi-select.ts";

p.intro("envsetup UI demo");

const picks = await groupMultiselect({
  message: "What should this machine get?",
  groups: {
    Required: [
      { id: "xcode-clt", label: "Xcode Command Line Tools", locked: "on" },
      { id: "uv", label: "uv (Python)", locked: "on" },
    ],
    Apps: [
      { id: "chrome", label: "Google Chrome", hint: "installed 139 → will upgrade to 140" },
      { id: "ghostty", label: "Ghostty" },
      { id: "cursor", label: "Cursor" },
      { id: "raycast", label: "Raycast" },
      {
        id: "ghostty-config",
        label: "Ghostty config (One Dark Two, JetBrains Mono NF)",
        requires: ["ghostty", "jetbrains-font"],
      },
      {
        id: "chrome-pwas",
        label: "Google web apps in Dock (Mail, Calendar, Drive, Notes)",
        requires: ["chrome"],
      },
    ],
    Fonts: [
      { id: "jetbrains-font", label: "JetBrains Mono Nerd Font" },
      { id: "fira-font", label: "Fira Code Nerd Font" },
    ],
  },
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
