#!/usr/bin/env bun
// Direct-invocation driver for src/ui's PURE parts: the group-multiselect
// cascade logic, the radio cycle, and humanize(). The interactive prompts are
// driven separately under expect (demo-walk.exp, same directory).
import { humanize } from "../../../config-screens.ts";
import {
  computeDisabled,
  flatten,
  initialSelection,
  type SelectGroups,
  selectionResult,
} from "../../../group-multi-select.ts";
import { cycle } from "../../../radio-group.ts";

let failed = 0;
const check = (label: string, ok: boolean, detail = "") => {
  console.log(`  ${ok ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failed++;
};

console.log("src/ui driver — pure logic\n");
const groups: SelectGroups = {
  Required: [{ id: "brew", label: "Homebrew" }],
  Apps: [
    { id: "ghostty", label: "Ghostty", requires: ["brew"] },
    { id: "ghostty-config", label: "Ghostty config", requires: ["ghostty"] },
    { id: "drifted", label: "Drifted thing", initialSelected: false },
  ],
};
check("flatten lists every option", flatten(groups).length === 4);
const sel = initialSelection(groups);
check(
  "initialSelection: default-selected except initialSelected:false",
  sel.has("brew") && sel.has("ghostty") && !sel.has("drifted"),
);
check("nothing disabled while deps are selected", computeDisabled(groups, sel).disabled.size === 0);
sel.delete("brew");
const dis = computeDisabled(groups, sel);
check(
  "unselecting brew cascades: ghostty AND ghostty-config disabled",
  dis.disabled.has("ghostty") && dis.disabled.has("ghostty-config"),
  `reasons: ${[...dis.disabled].map(([k, v]) => `${k}→${v}`).join("; ")}`,
);
check(
  "selectionResult drops disabled items",
  !selectionResult(groups, sel).includes("ghostty-config"),
  selectionResult(groups, sel).join(",") || "(empty)",
);
check("cycle wraps both ways", cycle(3, 2, 1) === 0 && cycle(3, 0, -1) === 2);
check(
  "humanize('pushToTalk') → 'Push to talk'",
  humanize("pushToTalk") === "Push to talk",
  humanize("pushToTalk"),
);

console.log(failed === 0 ? "\nPASS" : `\nFAIL — ${failed} check(s)`);
process.exit(failed === 0 ? 0 : 1);
