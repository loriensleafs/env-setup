#!/usr/bin/env bun
/** Driver for src/items/factories — builds items from the factories and runs detect() with a MOCKED runner (no brew calls). */
import type { RunResult } from "../../../../../exec/run.ts";
import { BREW, brewCask, brewFormula } from "../../../brew.ts";
import { fontZip } from "../../../font-zip.ts";

function ctxWith(responses: Record<string, RunResult>) {
  const calls: string[] = [];
  return {
    calls,
    manifest: {} as never,
    log: () => {},
    run: async (cmd: string[]) => {
      const key = cmd.join(" ");
      calls.push(key);
      for (const [pattern, result] of Object.entries(responses))
        if (key.includes(pattern)) return result;
      return { exitCode: 1, stdout: "", stderr: "not mocked" };
    },
  };
}

const jq = brewFormula({ id: "jq", title: "jq" });
const ctx = ctxWith({ "list --versions jq": { exitCode: 0, stdout: "jq 1.7.1\n", stderr: "" } });
console.log(
  `brewFormula(jq): kind=${jq.kind} deps=${jq.deps} detect=${JSON.stringify(await jq.detect(ctx))} via ${ctx.calls[0]?.replace(BREW, "brew")}`,
);
const ghostty = brewCask({ id: "ghostty", title: "Ghostty" });
const c2 = ctxWith({});
console.log(
  `brewCask(ghostty): kind=${ghostty.kind} detect(not brew-managed) → ${JSON.stringify(await ghostty.detect(c2))}`,
);
const font = fontZip({
  id: "font-demo",
  title: "Demo font",
  url: "https://example.invalid/demo.zip",
  probeFile: "DemoFont-Regular.ttf",
});
console.log(
  `fontZip(font-demo): kind=${font.kind} detect → ${JSON.stringify(await font.detect(c2))} (probes ~/Library/Fonts, no download)`,
);
console.log("OK");
