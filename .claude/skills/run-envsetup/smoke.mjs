#!/usr/bin/env bun
/**
 * Smoke driver for the `envsetup` CLI.
 *
 * envsetup is a macOS environment-setup CLI. Its flagship command (bare
 * `envsetup` = bootstrap, and `sync`) INSTALLS software and mutates system
 * state — so this driver deliberately exercises ONLY the safe, non-interactive,
 * read-only surfaces: every `--help` screen and `doctor` (which just diffs the
 * machine against its manifest). It never runs bootstrap/sync/connect/auth or
 * the passphrase-gated `secrets` actions.
 *
 * Usage (from the repo root):
 *   bun .claude/skills/run-envsetup/smoke.mjs
 *
 * Exit 0 = every checked command ran and matched; non-zero = a check failed.
 */
import { spawnSync } from "node:child_process";

const ENTRY = "src/index.ts";
let pass = 0;
let fail = 0;

/** Run `bun <ENTRY> <args...>`, assert exit code + that stdout/stderr contains `needle`. */
function check(label, args, { needle = "", code = 0 } = {}) {
  const r = spawnSync("bun", [ENTRY, ...args], { encoding: "utf8" });
  const out = `${r.stdout ?? ""}${r.stderr ?? ""}`;
  const okCode = r.status === code;
  const okNeedle = needle === "" || out.includes(needle);
  if (okCode && okNeedle) {
    console.log(`  ✓ ${label}`);
    pass++;
  } else {
    console.log(
      `  ✗ ${label} — exit=${r.status} (want ${code})${needle && !okNeedle ? `, missing ${JSON.stringify(needle)}` : ""}`,
    );
    if (out.trim())
      console.log(
        out
          .split("\n")
          .slice(-6)
          .map((l) => `      ${l}`)
          .join("\n"),
      );
    fail++;
  }
  return out;
}

console.log("envsetup smoke — safe read-only surfaces\n");

console.log("help / routing:");
check("root --help lists subcommands", ["--help"], { needle: "auth|connect|doctor|sync|secrets" });
check("doctor --help", ["doctor", "--help"], { needle: "Diff this machine" });
check("sync --help", ["sync", "--help"], { needle: "Apply the manifest" });
check("secrets --help lists actions", ["secrets", "--help"], { needle: "init · list · show" });
check("auth --help", ["auth", "--help"], { needle: "GitHub" });
check("connect --help", ["connect", "--help"], { needle: "finishing steps" });

console.log("\nread-only machine diff:");
const doctor = check("doctor runs and reports a diff", ["doctor"], { needle: "satisfied" });
// doctor's outro is always "<n> satisfied · <n> missing · <n> drifted · <n> untracked · <n> shell-gap"
if (/\d+ satisfied .* drifted .* shell-gap/.test(doctor)) {
  console.log("  ✓ doctor outro shape (satisfied · missing · drifted · untracked · shell-gap)");
  pass++;
} else {
  console.log("  ✗ doctor outro shape not found");
  fail++;
}

console.log(`\n${fail === 0 ? "PASS" : "FAIL"} — ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
