#!/usr/bin/env bun
// Driver for src/commands: presentOption() (the picker's drift/retry labelling)
// and each citty subcommand's meta, then the read-only `doctor --help` through
// the real entry. Never invokes bootstrap()/sync/connect/auth run().
import auth from "../../../auth.ts";
import { EMAIL_PENDING, presentOption } from "../../../bootstrap.ts";
import connect from "../../../connect.ts";
import doctor from "../../../doctor.ts";
import secrets from "../../../secrets.ts";
import sync from "../../../sync.ts";

let failed = 0;
const check = (label: string, ok: boolean, detail = "") => {
  console.log(`  ${ok ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failed++;
};

console.log("src/commands driver\n");
console.log("presentOption:");
check(
  "fresh install → no hint, checked",
  Object.keys(presentOption({ installed: false })).length === 0,
);
check(
  "drift → 'settings differ', unchecked",
  presentOption({ installed: false, differs: true }).initialSelected === false,
);
check(
  "failed last run → retry hint, checked",
  presentOption({ installed: false, differs: true }, true).hint === "failed last run — retry",
);
check(
  "installed (shown via --show-installed) → 'needs update'",
  presentOption({ installed: true, version: "1.2" }).hint?.includes("1.2") === true,
);
check("EMAIL_PENDING placeholder exported", EMAIL_PENDING.length > 0, EMAIL_PENDING);

console.log("\nsubcommand metas:");
for (const c of [auth, connect, doctor, secrets, sync]) {
  const meta = await (typeof c.meta === "function" ? c.meta() : c.meta);
  console.log(`  ${meta?.name}: ${meta?.description}`);
  check(`${meta?.name} has a description`, typeof meta?.description === "string");
}

console.log("\nread-only through the entry:");
const r = Bun.spawnSync(["bun", "src/index.ts", "doctor", "--help"]);
check(
  "bun src/index.ts doctor --help exits 0",
  r.exitCode === 0 && r.stdout.toString().includes("Diff this machine"),
);

console.log(failed === 0 ? "\nPASS" : `\nFAIL — ${failed} check(s)`);
process.exit(failed === 0 ? 0 : 1);
