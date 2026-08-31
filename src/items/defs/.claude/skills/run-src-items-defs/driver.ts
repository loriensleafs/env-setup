#!/usr/bin/env bun
/**
 * Driver for src/items/defs — READ-ONLY. Exercises the pure helpers (menu
 * profiles, config schemas, the managed zsh block) and runs every item's
 * detect() with the real runner (exactly what `envsetup doctor` does).
 * Skips github-auth and ssh-keys: their detect() calls the GitHub API.
 */
import { join } from "node:path";
import { run } from "../../../../../exec/run.ts";
import type { Item } from "../../../item.ts";
import * as bd from "../../../better-display.ts";
import { bunRuntime } from "../../../bun-runtime.ts";
import { cleanshotConfig } from "../../../cleanshot-config.ts";
import { deltaConfig } from "../../../delta-config.ts";
import { DOCK_APPS, dock } from "../../../dock.ts";
import { makeDotfiles } from "../../../dotfiles.ts";
import { gitEmail } from "../../../git-email.ts";
import { gitIdentity } from "../../../git-identity.ts";
import { googleSans } from "../../../google-sans.ts";
import { homebrew } from "../../../homebrew.ts";
import { DEFAULTS, macosDefaults } from "../../../macos-defaults.ts";
import { nodeLts } from "../../../node-lts.ts";
import { personalFonts } from "../../../personal-fonts.ts";
import { podmanMachine, podmanMachineSchema } from "../../../podman-machine.ts";
import { raycastConfig } from "../../../raycast-config.ts";
import { MARK_END, MARK_START, assembleManagedBlock, zshGaps } from "../../../shell-block.ts";
import { superwhisperConfig, superwhisperConfigSchema } from "../../../superwhisper-config.ts";
import { uv } from "../../../uv.ts";
import { xcodeClt } from "../../../xcode-clt.ts";

const SCRATCH = process.env.SCRATCH ?? "/tmp/envsetup-defs-driver";

for (const profile of ["default", "minimal", "everything"] as const) {
  const levels = Object.values(bd.menuLevels(profile));
  const count = (l: string) => levels.filter((x) => x === l).length;
  console.log(
    `menuLevels(${profile}): top=${count("less")} submenu=${count("more")} hidden=${count("hide")} of ${bd.ALL_MENU_FEATURES.length}`,
  );
}
console.log(`betterDisplaySchema defaults: ${JSON.stringify(bd.betterDisplaySchema.parse({}))}`);
console.log(`podmanMachineSchema defaults: ${JSON.stringify(podmanMachineSchema.parse({}))}`);
console.log(
  `superwhisperConfigSchema defaults: ${JSON.stringify(superwhisperConfigSchema.parse({}))}`,
);
console.log(
  `macos DEFAULTS: ${DEFAULTS.length} keys · DOCK_APPS: ${DOCK_APPS.map((a) => a.label).join(" · ")}`,
);

const items: Item[] = [
  xcodeClt,
  homebrew,
  bunRuntime,
  uv,
  nodeLts,
  googleSans,
  personalFonts,
  gitIdentity,
  gitEmail,
  deltaConfig,
  macosDefaults,
  dock,
  raycastConfig,
  cleanshotConfig,
  superwhisperConfig as Item,
  podmanMachine as Item,
  bd.betterDisplay as Item,
];
const dotfiles = makeDotfiles(items);
const block = assembleManagedBlock(items);
const zshrc = join(SCRATCH, "zshrc");
await Bun.write(zshrc, `# user stuff\n${block}\n`);
const gaps = items.flatMap((i) => zshGaps(i, block));
console.log(
  `managed zsh block: ${block.split("\n").length} lines, ${MARK_START} … ${MARK_END}; gaps vs fixture: ${gaps.length}`,
);
if (gaps.length > 0) throw new Error(`unexpected zsh gaps: ${gaps.join(", ")}`);

const ctx = {
  manifest: { locations: { devDir: "~/Dev" }, items: {} } as never,
  log: () => {},
  run,
};
for (const item of [...items, dotfiles]) {
  const d = await item.detect(ctx);
  console.log(
    `  ${item.id.padEnd(20)} installed=${d.installed}${d.version ? ` v${d.version}` : ""}${d.differs ? " differs" : ""}`,
  );
}
console.log("skipped detect(): github-auth, ssh-keys (GitHub API calls)");
console.log("OK");
