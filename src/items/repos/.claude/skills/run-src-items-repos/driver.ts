#!/usr/bin/env bun
/**
 * Driver for src/items/repos — READ-ONLY. Lists the decided repos, renders the
 * ACMElabs marketplace from a scratch fixture (no clones, no network), and runs
 * detect() for one repo item and the marketplace item.
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { run } from "../../../../../exec/run.ts";
import { acmelabsMarketplace, renderMarketplace } from "../../../acmelabs-marketplace.ts";
import { ACMELABS_REPOS, REFERENCE_REPOS, expandHome, repoItem } from "../../../repo-factory.ts";

const SCRATCH = process.env.SCRATCH ?? "/tmp/envsetup-repos-driver";
console.log(`ACMELABS_REPOS: ${ACMELABS_REPOS.map((r) => r.id).join(", ")}`);
console.log(`REFERENCE_REPOS: ${REFERENCE_REPOS.map((r) => r.dest.split("/").at(-1)).join(", ")}`);
console.log(`expandHome("~/Dev") → ${expandHome("~/Dev")}`);

const acme = join(SCRATCH, "ACMElabs");
const dirName = (ACMELABS_REPOS[0] as { dest: string }).dest.split("/").at(-1) as string;
await mkdir(join(acme, dirName, ".claude-plugin"), { recursive: true });
await Bun.write(
  join(acme, dirName, ".claude-plugin", "plugin.json"),
  JSON.stringify({ name: dirName, description: "fixture", version: "0.0.1" }),
);
const { content, included } = await renderMarketplace(acme);
console.log(
  `renderMarketplace(fixture with ${dirName} only) → included=${included} · ${content.split("\n").length} lines`,
);

const ctx = {
  manifest: { locations: { devDir: "~/Dev", referenceDirName: "reference" }, items: {} } as never,
  log: () => {},
  run,
};
const first = repoItem(ACMELABS_REPOS[0] as never);
console.log(`${first.id}.detect → ${JSON.stringify(await first.detect(ctx))}`);
const d = await acmelabsMarketplace.detect(ctx);
console.log(
  `${acmelabsMarketplace.id}.detect → installed=${d.installed}${d.differs ? " differs" : ""}`,
);
console.log("OK");
