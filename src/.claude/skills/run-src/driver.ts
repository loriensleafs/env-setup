#!/usr/bin/env bun
// Driver for src/ (the CLI entry, src/index.ts): the safe, non-interactive
// surfaces — help routing and the read-only `doctor`. For the full interactive
// TUI walk use the repo-root skill (.claude/skills/run-envsetup/).
let failed = 0;
const check = (label: string, args: string[], needle: string) => {
  const r = Bun.spawnSync(["bun", "src/index.ts", ...args]);
  const out = r.stdout.toString() + r.stderr.toString();
  const ok = r.exitCode === 0 && out.includes(needle);
  console.log(`  ${ok ? "✓" : "✗"} ${label} (exit ${r.exitCode})`);
  if (!ok) failed++;
  return out;
};

console.log("src driver — bun src/index.ts\n");
check("--help lists the subcommands", ["--help"], "auth|connect|doctor|sync|secrets");
check("--version", ["--version"], "0.");
check("doctor --help", ["doctor", "--help"], "Diff this machine");
const out = check("doctor (read-only diff of this machine)", ["doctor"], "in sync");
console.log(
  `    ${out
    .trim()
    .split("\n")
    .at(-1)
    ?.replace(/\x1b\[[0-9;]*m/g, "")}`,
);

console.log(failed === 0 ? "\nPASS" : `\nFAIL — ${failed} check(s)`);
process.exit(failed === 0 ? 0 : 1);
