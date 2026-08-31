#!/usr/bin/env bun
// Direct-invocation driver for src/items (the item framework): defineItem,
// ItemRegistry.executionOrder, toposort + its errors, and the real registry
// (buildRegistry) inspected read-only. Never calls install/configure/verify.
import { buildRegistry } from "../../../all.ts";
import { defineItem } from "../../../item.ts";
import { DuplicateItemError, ItemRegistry } from "../../../registry.ts";
import { DependencyCycleError, toposort, UnknownDependencyError } from "../../../toposort.ts";

let failed = 0;
const check = (label: string, ok: boolean, detail = "") => {
  console.log(`  ${ok ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failed++;
};

console.log("src/items driver\n");
console.log("toposort:");
const order = toposort(
  ["leaf", "mid", "base"],
  new Map([
    ["leaf", ["mid"]],
    ["mid", ["base"]],
  ]),
);
check("orders base → mid → leaf", order.join(",") === "base,mid,leaf", order.join(" → "));
try {
  toposort(
    ["a", "b"],
    new Map([
      ["a", ["b"]],
      ["b", ["a"]],
    ]),
  );
  check("cycle throws DependencyCycleError", false);
} catch (e) {
  check("cycle throws DependencyCycleError", e instanceof DependencyCycleError);
}
try {
  toposort(["a"], new Map([["a", ["ghost"]]]));
  check("unknown dep throws UnknownDependencyError", false);
} catch (e) {
  check("unknown dep throws UnknownDependencyError", e instanceof UnknownDependencyError);
}

console.log("\nItemRegistry with fake items:");
const fake = (id: string, deps?: string[]) =>
  defineItem({
    id,
    title: id,
    kind: "brew-formula",
    deps,
    detect: async () => ({ installed: false }),
  });
const r = new ItemRegistry();
r.register(fake("brew"));
r.register(fake("jq", ["brew"]));
r.register(fake("delta", ["brew"]));
r.register(fake("delta-config", ["delta"]));
check(
  "executionOrder respects deps",
  r.executionOrder(["delta-config", "jq", "brew", "delta"])[0] === "brew",
  r.executionOrder().join(" → "),
);
check(
  "executionOrder ignores deps outside the run",
  r.executionOrder(["delta-config"]).join(",") === "delta-config",
);
try {
  r.register(fake("jq"));
  check("duplicate id throws DuplicateItemError", false);
} catch (e) {
  check("duplicate id throws DuplicateItemError", e instanceof DuplicateItemError);
}

console.log("\nthe real registry (buildRegistry, read-only):");
const real = buildRegistry();
const all = real.all();
const kinds = new Map<string, number>();
for (const it of all) kinds.set(it.kind, (kinds.get(it.kind) ?? 0) + 1);
check(`${all.length} items registered`, all.length > 40);
console.log(`    kinds: ${[...kinds].map(([k, n]) => `${k}=${n}`).join(", ")}`);
check("full execution order is a valid toposort", real.executionOrder().length === all.length);
const withCeremonies = all.filter((i) => i.ceremonies?.length).map((i) => i.id);
console.log(`    items with ceremonies: ${withCeremonies.join(", ")}`);
const withSchema = all.filter((i) => i.configSchema).map((i) => i.id);
console.log(`    items with configSchema: ${withSchema.join(", ")}`);

console.log(failed === 0 ? "\nPASS" : `\nFAIL — ${failed} check(s)`);
process.exit(failed === 0 ? 0 : 1);
