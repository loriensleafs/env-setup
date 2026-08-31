#!/usr/bin/env bun
// Direct-invocation driver for src/paths: resolves the XDG-style dirs, with and
// without XDG_* overrides (overrides point at a temp dir; nothing is created).
import { mkdtempSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { configDir, journalPath, manifestPath, stateDir } from "../../../paths.ts";

let failed = 0;
const check = (label: string, ok: boolean, detail = "") => {
  console.log(`  ${ok ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failed++;
};

console.log("src/paths driver\n");
process.env.XDG_CONFIG_HOME = "";
process.env.XDG_STATE_HOME = "";
check(
  "configDir defaults to ~/.config/envsetup",
  configDir() === join(homedir(), ".config", "envsetup"),
  configDir(),
);
check(
  "stateDir defaults to ~/.local/state/envsetup",
  stateDir() === join(homedir(), ".local/state", "envsetup"),
  stateDir(),
);
check("manifestPath under configDir", manifestPath() === join(configDir(), "manifest.json"));
check("journalPath under stateDir", journalPath() === join(stateDir(), "journal.jsonl"));
const tmp = mkdtempSync(join(tmpdir(), "envsetup-paths-"));
process.env.XDG_CONFIG_HOME = join(tmp, "cfg");
process.env.XDG_STATE_HOME = join(tmp, "state");
check(
  "XDG_CONFIG_HOME override honoured",
  configDir() === join(tmp, "cfg", "envsetup"),
  configDir(),
);
check(
  "XDG_STATE_HOME override honoured",
  journalPath() === join(tmp, "state", "envsetup", "journal.jsonl"),
  journalPath(),
);

console.log(failed === 0 ? "\nPASS" : `\nFAIL — ${failed} check(s)`);
process.exit(failed === 0 ? 0 : 1);
