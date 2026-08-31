#!/usr/bin/env bun
/**
 * Driver for src/items/claude-code/assets — the shipped Claude Code scripts.
 * Feeds each stdin-JSON script a fixture payload and asserts its contract.
 * hooks-notify.ts is NOT run: it has no dry-run path and fires a real macOS
 * notification + raises Ghostty.
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const ASSETS = new URL("../../../", import.meta.url).pathname;
const REPO = new URL("../../../../../../../", import.meta.url).pathname;
const SCRATCH = process.env.SCRATCH ?? "/tmp/envsetup-assets-driver";

async function feed(script: string, payload: unknown, env: Record<string, string> = {}) {
  const proc = Bun.spawn(["bun", join(ASSETS, script)], {
    stdin: new TextEncoder().encode(JSON.stringify(payload)),
    stdout: "pipe",
    stderr: "pipe",
    env: { ...process.env, ...env },
  });
  const [out, err, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  if (code !== 0) throw new Error(`${script} exit ${code}: ${err}`);
  return out;
}

// statusline.ts: one line, no trailing newline
const line = await feed("statusline.ts", {
  cwd: REPO,
  model: { display_name: "Fable 5" },
  context_window: { used_percentage: 42 },
});
if (line.includes("\n") || !line.includes("Fable 5"))
  throw new Error(`statusline: ${JSON.stringify(line)}`);
console.log(`statusline.ts → ${line.replace(/\x1b\[[0-9;]*m/g, "").slice(0, 90)}`);

// hooks-subagent-statusline.ts: one JSON line per task
const rows = await feed("hooks-subagent-statusline.ts", {
  columns: 100,
  tasks: [
    {
      id: "t1",
      name: "reviewer",
      status: "running",
      model: "claude-opus-5",
      effort: "high",
      contextWindowSize: 200000,
      tokenCount: 24000,
      startTime: Date.now() - 134000,
    },
    { id: "t2", name: "explorer", status: "completed", model: "claude-sonnet-5" },
  ],
});
const parsed = rows
  .trim()
  .split("\n")
  .map((l) => JSON.parse(l) as { id: string; content: string });
if (parsed.map((r) => r.id).join() !== "t1,t2") throw new Error(`subagent rows: ${rows}`);
console.log(
  `hooks-subagent-statusline.ts → ${parsed.length} rows: ${parsed.map((r) => r.content.replace(/\x1b\[[0-9;]*m/g, "")).join(" | ")}`,
);

// hooks-format.ts: formats a file inside a SCRATCH project with the repo's biome.json
const proj = join(SCRATCH, "project");
await mkdir(proj, { recursive: true });
// A minimal Biome config: the repo's own biome.json has `vcs.useIgnoreFile: true`,
// which makes Biome error out ("configuration resulted in errors") in a
// directory that is not a git repo — and the hook swallows that and exits 0.
await Bun.write(
  join(proj, "biome.json"),
  JSON.stringify({ formatter: { enabled: true, indentStyle: "space" } }),
);
const ugly = "const   x = {a:1,b:2}\nexport   default x\n";
await Bun.write(join(proj, "ugly.ts"), ugly);
await feed(
  "hooks-format.ts",
  { file_path: "ugly.ts", change_type: "modified", cwd: proj },
  { CLAUDE_PROJECT_DIR: proj, PATH: `${REPO}/node_modules/.bin:${process.env.PATH}` },
);
const formatted = await Bun.file(join(proj, "ugly.ts")).text();
if (formatted === ugly) throw new Error("hooks-format.ts did not format the fixture");
console.log(`hooks-format.ts → formatted ${proj}/ugly.ts: ${JSON.stringify(formatted.trim())}`);

// settings.template.json: hook blocks reference the shipped scripts
const tpl = (await Bun.file(join(ASSETS, "settings.template.json")).json()) as {
  hooks: Record<string, { hooks: { command: string }[] }[]>;
  statusLine: { command: string };
  subagentStatusLine: { command: string };
};
const cmds = [
  ...Object.values(tpl.hooks)
    .flat()
    .flatMap((h) => h.hooks.map((x) => x.command)),
  tpl.statusLine.command,
  tpl.subagentStatusLine.command,
];
for (const needle of ["notify.ts", "format.ts", "statusline.ts", "subagent-statusline.ts"]) {
  if (!cmds.some((c) => c.includes(needle)))
    throw new Error(`template does not reference ${needle}`);
}
console.log(
  `settings.template.json hooks: ${Object.keys(tpl.hooks).join(", ")} + statusLine + subagentStatusLine ✓`,
);
console.log("hooks-notify.ts: skipped (no dry-run path; fires a real notification)");
console.log("OK");
