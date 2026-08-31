#!/usr/bin/env bun
// Direct-invocation driver for src/exec — the injectable command Runner.
// Runs harmless commands only (echo / sh -c exit / env). Exit 0 = all checks hold.
import { run } from "../../../run.ts";

let failed = 0;
const check = (label: string, ok: boolean, detail = "") => {
  console.log(`  ${ok ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failed++;
};

console.log("src/exec driver — run() over harmless commands\n");
const echo = await run(["echo", "hello from run()"]);
check(
  "echo → stdout captured, exit 0",
  echo.exitCode === 0 && echo.stdout.trim() === "hello from run()",
);
const bad = await run(["sh", "-c", "echo oops >&2; exit 3"]);
check(
  "sh -c exit 3 → exitCode 3, stderr captured",
  bad.exitCode === 3 && bad.stderr.trim() === "oops",
);
const env = await run(["sh", "-c", "echo $ENVSETUP_DRIVER"], { env: { ENVSETUP_DRIVER: "yes" } });
check("opts.env is merged into the child env", env.stdout.trim() === "yes");
const cwd = await run(["pwd"], { cwd: "/tmp" });
check("opts.cwd sets the working directory", cwd.stdout.trim().endsWith("/tmp"), cwd.stdout.trim());

console.log(failed === 0 ? "\nPASS" : `\nFAIL — ${failed} check(s)`);
process.exit(failed === 0 ? 0 : 1);
