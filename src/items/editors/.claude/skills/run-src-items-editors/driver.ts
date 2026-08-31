#!/usr/bin/env bun
/** Driver for src/items/editors — READ-ONLY. Lists the shared editor spec and runs detect() for Cursor + VS Code. */
import { run } from "../../../../../exec/run.ts";
import { EDITOR_SETTINGS, EXTENSIONS, cursorConfig, vscodeConfig } from "../../../editor-config.ts";

console.log(`extensions (${EXTENSIONS.length}): ${EXTENSIONS.join(", ")}`);
console.log(
  `settings keys (${Object.keys(EDITOR_SETTINGS).length}): ${Object.keys(EDITOR_SETTINGS).join(", ")}`,
);
const ctx = { manifest: {} as never, log: () => {}, run };
for (const item of [cursorConfig, vscodeConfig]) {
  const d = await item.detect(ctx);
  console.log(
    `${item.id} (deps ${item.deps?.join(",")}) detect → installed=${d.installed}${d.differs ? " differs" : ""}`,
  );
}
console.log("OK");
