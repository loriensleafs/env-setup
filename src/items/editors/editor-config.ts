import { homedir } from "node:os";
import { join } from "node:path";
import { mkdir } from "node:fs/promises";
import { defineItem, type Item, type ItemContext } from "../item.ts";

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

/** Decided settings (docs/PLAN.md Cursor pass); project configs win for lint/format. */
export const EDITOR_SETTINGS: Record<string, unknown> = {
  "workbench.colorTheme": "One Dark Pro",
  "workbench.iconTheme": "material-icon-theme",
  "editor.fontFamily": "'JetBrainsMono Nerd Font', Menlo, monospace",
  "editor.fontSize": 13,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  // Project config first (Peter's requirement) — these are the extensions'
  // defaults, encoded explicitly so drift is detectable.
  "prettier.requireConfig": false,
  "prettier.useEditorConfig": true,
  "eslint.workingDirectories": [{ "mode": "auto" }],
  "window.autoDetectColorScheme": true,
};

export interface EditorSpec {
  id: string;
  title: string;
  /** The app item this config depends on. */
  appItemId: string;
  /** CLI binary for --install-extension. */
  bin: string;
  /** User settings dir under ~/Library/Application Support. */
  supportDir: string;
}

export function editorConfigItem(spec: EditorSpec): Item {
  const settingsPath = join(
    homedir(), "Library", "Application Support", spec.supportDir, "User", "settings.json",
  );

  async function installedExtensions(ctx: ItemContext): Promise<Set<string>> {
    const r = await ctx.run([spec.bin, "--list-extensions"]);
    if (r.exitCode !== 0) return new Set();
    return new Set(r.stdout.split("\n").map((l) => l.trim().toLowerCase()).filter(Boolean));
  }

  return defineItem({
    id: spec.id,
    title: spec.title,
    kind: "config-only",
    deps: [spec.appItemId, "font-jetbrains-nf"],
    ceremonies: spec.id === "cursor-config"
      ? [{ id: "cursor-models", title: "Gate Cursor models (Haiku/Sonnet/Opus/Fable, default Opus)" }]
      : undefined,
    detect: async (ctx) => {
      const file = Bun.file(settingsPath);
      if (!(await file.exists())) return { installed: false };
      try {
        const current = (await file.json()) as Record<string, unknown>;
        if (current["workbench.colorTheme"] !== "One Dark Pro") return { installed: false };
      } catch {
        return { installed: false };
      }
      const have = await installedExtensions(ctx);
      const missing = EXTENSIONS.filter((e) => !have.has(e.toLowerCase()));
      return { installed: missing.length === 0 };
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
      await Bun.write(settingsPath, `${JSON.stringify({ ...current, ...EDITOR_SETTINGS }, null, 2)}\n`);

      const have = await installedExtensions(ctx);
      for (const ext of EXTENSIONS) {
        if (have.has(ext.toLowerCase())) continue;
        const r = await ctx.run([spec.bin, "--install-extension", ext]);
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
  bin: "/opt/homebrew/bin/cursor",
  supportDir: "Cursor",
});

export const vscodeConfig = editorConfigItem({
  id: "vscode-config",
  title: "VS Code configuration (mirrors Cursor)",
  appItemId: "vscode",
  bin: "/opt/homebrew/bin/code",
  supportDir: "Code",
});
