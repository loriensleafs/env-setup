import { homedir } from "node:os";
import { join } from "node:path";

// Dev-CLI convention on macOS (git, gh, ghostty, claude): XDG-style dirs under $HOME,
// honoring XDG_* overrides. Deliberate deviation from env-paths' Library/* mapping —
// see docs/decisions/ADR-007-manifest-journal-item-architecture.md (paths).
function xdg(envVar: string, fallback: string): string {
  const v = process.env[envVar];
  return v && v.trim() !== "" ? v : join(homedir(), fallback);
}

export function configDir(): string {
  return join(xdg("XDG_CONFIG_HOME", ".config"), "envsetup");
}

export function stateDir(): string {
  return join(xdg("XDG_STATE_HOME", ".local/state"), "envsetup");
}

export function manifestPath(): string {
  return join(configDir(), "manifest.json");
}

export function journalPath(): string {
  return join(stateDir(), "journal.jsonl");
}
