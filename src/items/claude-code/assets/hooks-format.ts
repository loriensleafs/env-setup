#!/usr/bin/env bun
/**
 * Claude Code formatting hook — auto-format/lint a file whenever it changes.
 *
 * Wired to the `FileChanged` event (tool-agnostic: fires for Edit/Write/
 * MultiEdit AND when a Bash command rewrites a file — everything). It reads the
 * changed path from the payload and applies the PROJECT's own Biome (JS/TS/JSON)
 * or markdownlint (Markdown) config with `--fix`/`--write`. The project root is
 * located via $CLAUDE_PROJECT_DIR (Claude Code guarantees this is the session
 * root even if the file is in a subdir or the cwd changed) — never the ambient
 * cwd. A tool only runs when its config exists in the project, so this hook is
 * safe to drop into any repo. It NEVER blocks: always exits 0.
 *
 * The payload is read event-agnostically so the same script also works if wired
 * to PostToolUse: FileChanged puts the (project-relative) path in top-level
 * `file_path` + a `change_type`; the Edit/Write tools put it in
 * `tool_input.file_path` (NotebookEdit: `tool_input.notebook_path`).
 *
 * Loop-safety: FileChanged re-fires after the hook's own write, but Biome and
 * markdownlint only write when something actually changes, so a second pass on
 * an already-clean file makes no write and the chain stops (Claude Code also
 * debounces FileChanged by 500ms). `delete` changes are skipped.
 *
 * Typechecking is intentionally NOT done here (too slow per-change — it lives in
 * the pre-commit hook and CI instead).
 */
import { existsSync } from "node:fs";
import { extname, isAbsolute, join } from "node:path";

const projectDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();

const raw = await Bun.stdin.text();
let filePath = "";
let cwd = process.cwd();
try {
  const data = JSON.parse(raw) as {
    file_path?: string;
    change_type?: string;
    tool_input?: { file_path?: string; notebook_path?: string };
    cwd?: string;
  };
  // change_type is "delete"/"deleted" (FileChanged) — nothing to format.
  if (data.change_type?.startsWith("delete")) process.exit(0);
  filePath = data.file_path ?? data.tool_input?.file_path ?? data.tool_input?.notebook_path ?? "";
  cwd = data.cwd ?? cwd;
} catch {
  process.exit(0); // malformed payload — do nothing
}
if (!filePath) process.exit(0);

// FileChanged gives a path relative to the project root; the Edit/Write tools
// give absolute (or cwd-relative). Resolve against the project root first.
let abs = filePath;
if (!isAbsolute(filePath)) {
  const fromProject = join(projectDir, filePath);
  abs = existsSync(fromProject) ? fromProject : join(cwd, filePath);
}
// Only ever touch files inside the project root; skip a vanished file.
if (abs !== projectDir && !abs.startsWith(`${projectDir}/`)) process.exit(0);
if (!existsSync(abs)) process.exit(0);

const ext = extname(abs).toLowerCase();
const has = (name: string) => existsSync(join(projectDir, name));
const hasBiome = has("biome.json") || has("biome.jsonc");
const hasMarkdownlint = [
  ".markdownlint-cli2.jsonc",
  ".markdownlint-cli2.yaml",
  ".markdownlint-cli2.cjs",
  ".markdownlint.jsonc",
  ".markdownlint.json",
  ".markdownlint.yaml",
].some(has);

/** Prefer the project's local binary; fall back to PATH. */
const bin = (name: string) => {
  const local = join(projectDir, "node_modules", ".bin", name);
  return existsSync(local) ? local : name;
};

async function run(cmd: string[]): Promise<void> {
  try {
    await Bun.spawn(cmd, { cwd: projectDir, stdout: "ignore", stderr: "ignore" }).exited;
  } catch {
    // tool missing / spawn failed — a formatter must never break the edit flow
  }
}

const BIOME_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".jsonc"]);
if (BIOME_EXTS.has(ext) && hasBiome) {
  await run([bin("biome"), "check", "--write", "--no-errors-on-unmatched", abs]);
} else if (ext === ".md" && hasMarkdownlint) {
  await run([bin("markdownlint-cli2"), "--fix", abs]);
}

process.exit(0);
