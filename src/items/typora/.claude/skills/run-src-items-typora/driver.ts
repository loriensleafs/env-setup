#!/usr/bin/env bun
/** Driver for src/items/typora — READ-ONLY. Describes the item and runs detect() (reads the theme dir + defaults). */
import { run } from "../../../../../exec/run.ts";
import { typoraConfig } from "../../../typora-config.ts";

console.log(
  `${typoraConfig.id}: kind=${typoraConfig.kind} deps=${typoraConfig.deps?.join(",")} ceremonies=${typoraConfig.ceremonies?.map((c) => c.id).join(",") ?? "-"}`,
);
const d = await typoraConfig.detect({ manifest: { items: {} } as never, log: () => {}, run });
console.log(`detect → installed=${d.installed}${d.differs ? " differs" : ""}`);
console.log("OK");
