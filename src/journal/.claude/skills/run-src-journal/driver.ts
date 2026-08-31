#!/usr/bin/env bun
// Direct-invocation driver for src/journal: append + read + computeResume on a
// throwaway JSONL file in a temp dir — never the real ~/.local/state journal.
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { appendEvent, computeResume, readEvents, RUN_END_STEP } from "../../../journal.ts";

let failed = 0;
const check = (label: string, ok: boolean, detail = "") => {
  console.log(`  ${ok ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failed++;
};

const path = join(mkdtempSync(join(tmpdir(), "envsetup-journal-")), "journal.jsonl");
console.log(`src/journal driver — ${path}\n`);
const ts = "2026-08-30T10:00:00Z";
await appendEvent({ ts, runId: "r1", step: "homebrew", status: "started", attempt: 1 }, path);
await appendEvent({ ts, runId: "r1", step: "homebrew", status: "succeeded", attempt: 1 }, path);
await appendEvent(
  { ts, runId: "r1", step: "jq", status: "failed", attempt: 1, error: "boom" },
  path,
);
await appendEvent(
  { ts, runId: "r1", step: "jq", status: "failed", attempt: 2, error: "boom" },
  path,
);
const resume = computeResume(await readEvents(path));
check("unfinished run detected", resume.runId === "r1" && !resume.finished);
check("homebrew is completed", resume.completedSteps.has("homebrew"));
check("jq is in failedSteps", resume.failedSteps.has("jq"));
await appendEvent({ ts, runId: "r1", step: RUN_END_STEP, status: "succeeded", attempt: 1 }, path);
check("RUN_END_STEP marks the run finished", computeResume(await readEvents(path)).finished);
// a torn trailing line (crash mid-write) must be tolerated by the reader
await Bun.write(path, `${await Bun.file(path).text()}{"ts":"2026-08-3`);
check(
  "readEvents returns the 5 complete events, drops the torn line",
  (await readEvents(path)).length === 5,
);
check("empty journal → no run", computeResume([]).runId === null);

console.log(failed === 0 ? "\nPASS" : `\nFAIL — ${failed} check(s)`);
process.exit(failed === 0 ? 0 : 1);
