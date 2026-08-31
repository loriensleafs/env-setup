#!/usr/bin/env bun
/**
 * Driver for src/items/chrome — READ-ONLY. Lists the captured Chrome
 * defaults, checks the embedded Swift helper matches assets/, and runs the
 * two items' detect() (what `envsetup doctor` does). Never configure().
 */
import { run } from "../../../../../exec/run.ts";
import { chromeConfig } from "../../../chrome-config.ts";
import { CHROME_FLAGS, PINNED_ACTIONS, PINNED_EXTENSIONS } from "../../../chrome-defaults.ts";
import { CHROME_APPS_DIR, INSTALL_SWIFT, PWAS, chromePwas } from "../../../chrome-pwas.ts";

const ctx = { manifest: {} as never, log: () => {}, run };
console.log(
  `flags: ${CHROME_FLAGS.length} · pinned actions: ${PINNED_ACTIONS.length} · pinned extensions: ${PINNED_EXTENSIONS.length}`,
);
console.log(`pwas: ${PWAS.map((p) => `${p.name}`).join(", ")} → ${CHROME_APPS_DIR}`);
const asset = await Bun.file(
  new URL("../../../assets/install-web-app.swift", import.meta.url),
).text();
if (asset !== INSTALL_SWIFT)
  throw new Error("INSTALL_SWIFT drifted from assets/install-web-app.swift");
console.log("INSTALL_SWIFT === assets/install-web-app.swift ✓");
// Typecheck only — running the helper installs a real Chrome app.
const tc = Bun.spawnSync([
  "xcrun",
  "swiftc",
  "-typecheck",
  new URL("../../../assets/install-web-app.swift", import.meta.url).pathname,
]);
if (tc.exitCode !== 0) throw new Error(`swiftc -typecheck failed:\n${tc.stderr.toString()}`);
console.log("swiftc -typecheck install-web-app.swift ✓");
for (const item of [chromeConfig, chromePwas]) {
  const d = await item.detect(ctx);
  console.log(`${item.id}.detect → installed=${d.installed}${d.differs ? " differs" : ""}`);
}
console.log("OK");
