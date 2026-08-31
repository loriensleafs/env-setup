import * as p from "@clack/prompts";
import color from "picocolors";
import { run } from "../exec/run.ts";
import type { ItemRegistry } from "../items/registry.ts";
import type { Ceremony, ItemContext } from "../items/item.ts";
import type { Manifest } from "../manifest/schema.ts";
import { fallbackHandler, handlerFor } from "./handlers.ts";

export interface ConnectResult {
  pending: number;
  done: number;
  skipped: string[];
}

/**
 * The attended finishing steps (sign-ins, permission grants, license pastes,
 * the Chrome web-app install) for whatever is selected AND still needs them.
 * Deduped by ceremony id — several apps share e.g. `accessibility-grant`, and
 * the old `connect` command ran it once per app.
 */
export async function pendingCeremonies(
  registry: ItemRegistry,
  manifest: Manifest,
): Promise<Ceremony[]> {
  const ctx: ItemContext = { manifest, log: () => {}, run };
  const seen = new Set<string>();
  const pending: Ceremony[] = [];
  for (const item of registry.all()) {
    if (!(manifest.items[item.id]?.selected ?? false)) continue;
    if (!item.ceremonies?.length) continue;
    const d = await item.detect(ctx).catch(() => ({ installed: false }));
    if (!d.installed && item.install) continue; // app never made it — skip its ceremonies
    for (const c of item.ceremonies) {
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      pending.push(c);
    }
  }
  return pending;
}

/**
 * Run the connect phase. Used automatically at the end of bootstrap/sync
 * (Peter: finishing steps must not need a second command) and by
 * `envsetup connect` for re-running skipped ones.
 */
export async function runConnectPhase(
  registry: ItemRegistry,
  manifest: Manifest,
): Promise<ConnectResult> {
  const pending = await pendingCeremonies(registry, manifest);
  if (pending.length === 0) return { pending: 0, done: 0, skipped: [] };
  p.log.step(color.bold(`Finishing steps (${pending.length}) — these need you`));
  let done = 0;
  const skipped: string[] = [];
  for (const c of pending) {
    p.log.step(color.bold(c.title));
    const handler = handlerFor(c.id) ?? fallbackHandler(c.title);
    const ok = await handler.run({ run });
    if (ok) done++;
    else skipped.push(c.title);
  }
  if (skipped.length > 0) {
    p.note(skipped.join("\n"), "skipped — re-run `envsetup connect` anytime");
  }
  return { pending: pending.length, done, skipped };
}
