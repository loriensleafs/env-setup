#!/usr/bin/env bun
// Direct-invocation driver for src/ceremonies: the handler table and
// pendingCeremonies() over the real registry with FIXTURE manifests. Handlers
// are looked up, never run (they open apps, paste licenses, prompt the user).
import { pendingCeremonies } from "../../../connect-phase.ts";
import { fallbackHandler, HANDLERS, handlerFor } from "../../../handlers.ts";
import { buildRegistry } from "../../../../items/all.ts";
import { MANIFEST_VERSION, type Manifest } from "../../../../manifest/schema.ts";

let failed = 0;
const check = (label: string, ok: boolean, detail = "") => {
  console.log(`  ${ok ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failed++;
};

console.log("src/ceremonies driver\n");
const ids = Object.keys(HANDLERS);
console.log(`  handlers (${ids.length}): ${ids.join(", ")}`);
check("handlerFor(known id) resolves", handlerFor("github-device-flow") !== undefined);
check("handlerFor(unknown) → undefined", handlerFor("nope") === undefined);
check(
  "fallbackHandler builds a manual-step handler",
  typeof fallbackHandler("Do the thing").run === "function",
);

const registry = buildRegistry();
const declared = new Set(registry.all().flatMap((i) => (i.ceremonies ?? []).map((c) => c.id)));
const unhandled = [...declared].filter((id) => !handlerFor(id));
check(
  `every declared ceremony id has a handler (${declared.size} declared)`,
  unhandled.length === 0,
  unhandled.join(",") || "all covered",
);

const manifest = (items: Manifest["items"]): Manifest => ({
  manifestVersion: MANIFEST_VERSION,
  createdAt: "2026-08-30T10:00:00Z",
  identity: { name: "D", githubUser: "d", email: "d@x" },
  locations: { devDir: "~/Dev", referenceDirName: "reference" },
  items,
});
check(
  "nothing selected → no pending ceremonies",
  (await pendingCeremonies(registry, manifest({}))).length === 0,
);
// chrome-pwas is ceremony-only (no install) → its ceremony is pending whenever selected
const pwas = await pendingCeremonies(registry, manifest({ "chrome-pwas": { selected: true } }));
check(
  "selecting chrome-pwas → its install ceremony is pending",
  pwas.some((c) => c.id === "chrome-pwas-install"),
  pwas.map((c) => c.id).join(","),
);

console.log(failed === 0 ? "\nPASS" : `\nFAIL — ${failed} check(s)`);
process.exit(failed === 0 ? 0 : 1);
