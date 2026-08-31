import { homedir } from "node:os";
import { join } from "node:path";
import { mkdir, symlink, rm } from "node:fs/promises";
import { defineItem, type Item, type ItemContext } from "../item.ts";

/** ~/.local/bin is first on PATH via the dotfiles managed block. */
const LOCAL_BIN = join(homedir(), ".local", "bin");

/** Verified marketplace ids (anthropic.claude-code confirmed via gallery API 2026-08-26). */
export const EXTENSIONS: string[] = [
  "zhuangtongfa.material-theme", // One Dark Pro
  "pkief.material-icon-theme",
  "oven.bun-vscode",
  "golang.go",
  "usernamehw.errorlens",
  "yoavbls.pretty-ts-errors",
  "dbaeumer.vscode-eslint",
  "esbenp.prettier-vscode",
  "eamodio.gitlens",
  "christian-kohler.path-intellisense",
  "mikestead.dotenv",
  "anthropic.claude-code",
];

/**
 * Decided settings (docs/plan/PRD-001-envsetup.md Cursor pass); project configs win for lint/format.
 * Theme note: with `window.autoDetectColorScheme`, VS Code REWRITES
 * `workbench.colorTheme` from the preferred*ColorTheme keys on every OS scheme
 * flip (vscode #196119) — so we pin the `preferred*` keys and deliberately do
 * NOT set `workbench.colorTheme` (it's machine state, not config).
 */
export const EDITOR_SETTINGS: Record<string, unknown> = {
  "workbench.preferredDarkColorTheme": "One Dark Pro",
  "workbench.preferredLightColorTheme": "Default Light Modern",
  "workbench.iconTheme": "material-icon-theme",
  "editor.fontFamily": "'JetBrainsMono Nerd Font', Menlo, monospace",
  "editor.fontSize": 13,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  // Project config first (Peter's requirement) — these are the extensions'
  // defaults, encoded explicitly so drift is detectable.
  "prettier.requireConfig": false,
  "prettier.useEditorConfig": true,
  "eslint.workingDirectories": [{ mode: "auto" }],
  "window.autoDetectColorScheme": true,
};

export interface EditorSpec {
  id: string;
  title: string;
  /** The app item this config depends on. */
  appItemId: string;
  /**
   * The CLI binary INSIDE the app bundle — the source of truth, correct
   * regardless of how the app was installed (brew cask, manual, or the app's
   * own "Install command in PATH"). e.g. Cursor.app/Contents/Resources/app/bin/cursor.
   */
  bundleCli: string;
  /** The terminal command name to expose on PATH (e.g. "cursor", "code"). */
  command: string;
  /** User settings dir under ~/Library/Application Support. */
  supportDir: string;
}

export function editorConfigItem(spec: EditorSpec): Item {
  const settingsPath = join(
    homedir(),
    "Library",
    "Application Support",
    spec.supportDir,
    "User",
    "settings.json",
  );
  const linkPath = join(LOCAL_BIN, spec.command);

  /**
   * The in-bundle CLI is the ONLY source of truth: it's deterministic per app
   * and can't be confused with another editor's binary (Cursor also ships a
   * `code` shim, so a bare PATH lookup for "code" is unsafe). The app-item dep
   * guarantees the bundle exists before this config item runs.
   */
  async function resolveCli(): Promise<string | null> {
    return (await Bun.file(spec.bundleCli).exists()) ? spec.bundleCli : null;
  }

  /**
   * Guarantee `spec.command <path>` works in a terminal: symlink the in-bundle
   * CLI into ~/.local/bin (first on PATH). Fixes VS Code, whose brew cask does
   * not reliably land `code` in /opt/homebrew/bin.
   */
  async function ensureCliLink(ctx: ItemContext): Promise<void> {
    if (!(await Bun.file(spec.bundleCli).exists())) return;
    await mkdir(LOCAL_BIN, { recursive: true });
    // Refresh the symlink idempotently (points at the current bundle path).
    await rm(linkPath, { force: true }).catch(() => {});
    await symlink(spec.bundleCli, linkPath);
    ctx.log(`\`${spec.command}\` linked into ~/.local/bin`);
  }

  async function installedExtensions(ctx: ItemContext): Promise<Set<string>> {
    const cli = await resolveCli();
    if (!cli) return new Set();
    const r = await ctx.run([cli, "--list-extensions"]);
    if (r.exitCode !== 0) return new Set();
    return new Set(
      r.stdout
        .split("\n")
        .map((l) => l.trim().toLowerCase())
        .filter(Boolean),
    );
  }

  return defineItem({
    id: spec.id,
    title: spec.title,
    kind: "config-only",
    deps: [spec.appItemId, "font-jetbrains-nf"],
    ceremonies:
      spec.id === "cursor-config"
        ? [
            {
              id: "cursor-models",
              title: "Gate Cursor models (Haiku/Sonnet/Opus/Fable, default Opus)",
            },
          ]
        : undefined,
    detect: async (ctx) => {
      const file = Bun.file(settingsPath);
      // No settings file = never configured.
      if (!(await file.exists())) return { installed: false };
      let current: Record<string, unknown>;
      try {
        current = (await file.json()) as Record<string, unknown>;
      } catch {
        // A settings file exists but can't be parsed — hand-edited, differs.
        return { installed: false, differs: true };
      }
      // Drift-aware: EVERY decided key must match (deep, for the array/object
      // values). Extra user keys are fine — configure() merges, not replaces.
      for (const [key, want] of Object.entries(EDITOR_SETTINGS)) {
        if (JSON.stringify(current[key]) !== JSON.stringify(want)) {
          return { installed: false, differs: true };
        }
      }
      // The terminal command must resolve (Peter's requirement).
      if (!(await resolveCli())) return { installed: false };
      const have = await installedExtensions(ctx);
      const missing = EXTENSIONS.filter((e) => !have.has(e.toLowerCase()));
      // Settings are ours but extensions are missing → still a drift, not absence.
      return missing.length === 0 ? { installed: true } : { installed: false, differs: true };
    },
    configure: async (ctx) => {
      // Merge settings over whatever exists (user additions survive).
      let current: Record<string, unknown> = {};
      const file = Bun.file(settingsPath);
      if (await file.exists()) {
        try {
          current = (await file.json()) as Record<string, unknown>;
        } catch {
          const backup = `${settingsPath}.backup-${Date.now()}`;
          await Bun.write(backup, await file.text());
          ctx.log(`unparseable settings backed up to ${backup}`);
        }
      }
      await mkdir(join(settingsPath, ".."), { recursive: true });
      await Bun.write(
        settingsPath,
        `${JSON.stringify({ ...current, ...EDITOR_SETTINGS }, null, 2)}\n`,
      );

      // Make `cursor`/`code <path>` work in the terminal before using the CLI.
      await ensureCliLink(ctx);
      const cli = await resolveCli();
      if (!cli) throw new Error(`${spec.command} CLI not found (is ${spec.appItemId} installed?)`);

      const have = await installedExtensions(ctx);
      for (const ext of EXTENSIONS) {
        if (have.has(ext.toLowerCase())) continue;
        const r = await ctx.run([cli, "--install-extension", ext]);
        if (r.exitCode !== 0) {
          throw new Error(`--install-extension ${ext} failed: ${r.stderr.trim().slice(-200)}`);
        }
        ctx.log(`installed ${ext}`);
      }
    },
    verify: async (ctx) => {
      const have = await installedExtensions(ctx);
      return EXTENSIONS.every((e) => have.has(e.toLowerCase()));
    },
  });
}

export const cursorConfig = editorConfigItem({
  id: "cursor-config",
  title: "Cursor configuration",
  appItemId: "cursor",
  bundleCli: "/Applications/Cursor.app/Contents/Resources/app/bin/cursor",
  command: "cursor",
  supportDir: "Cursor",
});

export const vscodeConfig = editorConfigItem({
  id: "vscode-config",
  title: "VS Code configuration (mirrors Cursor)",
  appItemId: "vscode",
  bundleCli: "/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code",
  command: "code",
  supportDir: "Code",
});
