#!/usr/bin/env bun
// Direct-invocation driver for src/orchestrator: orchestrate() over FAKE
// in-memory items with a mocked Runner and a temp journal. Nothing real runs.
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { defineItem, type Item } from "../../../../items/item.ts";
import { ItemRegistry } from "../../../../items/registry.ts";
import { MANIFEST_VERSION, type Manifest } from "../../../../manifest/schema.ts";
import { orchestrate, type StepOutcome, transitiveDependents } from "../../../orchestrator.ts";

let failed = 0;
const check = (label: string, ok: boolean, detail = "") => {
  console.log(`  ${ok ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failed++;
};

const manifest: Manifest = {
  manifestVersion: MANIFEST_VERSION,
  createdAt: "2026-08-30T10:00:00Z",
  identity: { name: "D", githubUser: "d", email: "d@x" },
  locations: { devDir: "~/Dev", referenceDirName: "reference" },
  items: {},
};
const runner = async () => ({ exitCode: 0, stdout: "", stderr: "" });
const installs: string[] = [];
const fake = (
  id: string,
  o: { deps?: string[]; installed?: boolean; fail?: number; ceremonyOnly?: boolean } = {},
): Item => {
  let fails = o.fail ?? 0;
  return defineItem({
    id,
    title: id,
    kind: "brew-formula",
    deps: o.deps,
    ceremonies: o.ceremonyOnly ? [{ id: `${id}-ceremony`, title: id }] : undefined,
    detect: async () => ({ installed: o.installed ?? false }),
    install: o.ceremonyOnly
      ? undefined
      : async () => {
          if (fails > 0) {
            fails--;
            throw new Error(`${id} failed`);
          }
          installs.push(id);
        },
  });
};
const r = new ItemRegistry();
r.register(fake("base"));
r.register(fake("already", { installed: true }));
r.register(fake("flaky", { deps: ["base"], fail: 1 })); // succeeds on the auto-retry
r.register(fake("broken", { deps: ["base"], fail: 5 })); // fails both attempts
r.register(fake("dependent", { deps: ["broken"] })); // skipped: its dep failed
r.register(fake("attended", { ceremonyOnly: true })); // deferred

const outcomes: Record<string, StepOutcome["kind"]> = {};
const journalPath = join(mkdtempSync(join(tmpdir(), "envsetup-orch-")), "journal.jsonl");
console.log(`src/orchestrator driver — journal ${journalPath}\n`);
const report = await orchestrate({
  registry: r,
  manifest,
  selection: ["dependent", "broken", "flaky", "already", "base", "attended"],
  journalPath,
  runner,
  events: {
    onStepEnd: (id, o) => {
      outcomes[id] = o.kind;
    },
  },
});
console.log(
  `  outcomes: ${Object.entries(outcomes)
    .map(([k, v]) => `${k}=${v}`)
    .join(", ")}`,
);
check(
  "base installed before flaky (dependency order)",
  installs.indexOf("base") < installs.indexOf("flaky"),
  installs.join(" → "),
);
check("already-installed item skipped", outcomes.already === "skipped-installed");
check("one auto-retry rescues flaky", outcomes.flaky === "succeeded");
check(
  "broken fails after 2 attempts",
  report.failed.some((f) => f.id === "broken"),
);
check("dependent skipped because its dep failed", outcomes.dependent === "skipped-dependency");
check("ceremony-only item is deferred", report.deferred.includes("attended"));
check("run finished (no required item failed)", report.finished && !report.aborted);
check(
  "transitiveDependents(broken) = dependent",
  [...transitiveDependents(r, ["broken", "dependent", "base"], "broken")].join(",") === "dependent",
);

console.log(failed === 0 ? "\nPASS" : `\nFAIL — ${failed} check(s)`);
process.exit(failed === 0 ? 0 : 1);
