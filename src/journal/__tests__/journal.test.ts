import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  appendEvent,
  computeResume,
  readEvents,
  RUN_END_STEP,
  type JournalEvent,
} from "../journal.ts";

function ev(partial: Partial<JournalEvent>): JournalEvent {
  return {
    ts: "2026-08-26T12:00:00Z",
    runId: "run-1",
    step: "step",
    status: "succeeded",
    attempt: 1,
    ...partial,
  };
}

describe("journal", () => {
  test("append + read round-trip, skipping torn lines", async () => {
    const path = join(tmpdir(), `envsetup-j-${Date.now()}`, "journal.jsonl");
    await appendEvent(ev({ step: "a", status: "started" }), path);
    await appendEvent(ev({ step: "a" }), path);
    const existing = await Bun.file(path).text();
    await Bun.write(path, `${existing}{"torn`);
    const events = await readEvents(path);
    expect(events).toHaveLength(2);
    expect(events[1]?.step).toBe("a");
  });

  test("readEvents on missing file is empty", async () => {
    expect(await readEvents(join(tmpdir(), `nope-${Date.now()}.jsonl`))).toEqual([]);
  });
});

describe("computeResume", () => {
  test("empty journal → nothing to resume", () => {
    const r = computeResume([]);
    expect(r.runId).toBeNull();
    expect(r.finished).toBe(false);
    expect(r.completedSteps.size).toBe(0);
  });

  test("only the latest run counts; failed-then-succeeded steps are completed", () => {
    const r = computeResume([
      ev({ runId: "old", step: "x" }),
      ev({ runId: "run-2", step: "a" }),
      ev({ runId: "run-2", step: "b", status: "failed", error: "boom" }),
      ev({ runId: "run-2", step: "b", attempt: 2 }),
      ev({ runId: "run-2", step: "c", status: "failed", error: "down" }),
    ]);
    expect(r.runId).toBe("run-2");
    expect([...r.completedSteps].sort()).toEqual(["a", "b"]);
    expect([...r.failedSteps]).toEqual(["c"]);
    expect(r.finished).toBe(false);
  });

  test("run-end marker flips finished", () => {
    const r = computeResume([ev({ step: "a" }), ev({ step: RUN_END_STEP })]);
    expect(r.finished).toBe(true);
  });
});
