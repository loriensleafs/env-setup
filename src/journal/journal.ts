import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { z } from "zod";
import { journalPath } from "../paths/paths.ts";

export const journalEventSchema = z.object({
  ts: z.iso.datetime(),
  runId: z.string().min(1),
  step: z.string().min(1),
  status: z.enum(["started", "succeeded", "failed", "skipped"]),
  attempt: z.number().int().min(1).default(1),
  error: z.string().optional(),
});

export type JournalEvent = z.infer<typeof journalEventSchema>;

export async function appendEvent(event: JournalEvent, path = journalPath()): Promise<void> {
  journalEventSchema.parse(event);
  await mkdir(dirname(path), { recursive: true });
  const line = `${JSON.stringify(event)}\n`;
  const file = Bun.file(path);
  const existing = (await file.exists()) ? await file.text() : "";
  await Bun.write(path, existing + line);
}

export async function readEvents(path = journalPath()): Promise<JournalEvent[]> {
  const file = Bun.file(path);
  if (!(await file.exists())) return [];
  const events: JournalEvent[] = [];
  for (const line of (await file.text()).split("\n")) {
    if (line.trim() === "") continue;
    // A torn final line (crash mid-write) is skipped rather than fatal.
    try {
      events.push(journalEventSchema.parse(JSON.parse(line)));
    } catch {
      continue;
    }
  }
  return events;
}

export interface ResumeState {
  runId: string | null;
  /** Steps that succeeded in the latest run — safe to skip on resume. */
  completedSteps: Set<string>;
  /** Steps whose last event in the latest run is `failed`. */
  failedSteps: Set<string>;
  finished: boolean;
}

export const RUN_END_STEP = "__run__";

export function computeResume(events: JournalEvent[]): ResumeState {
  const latestRunId = events.at(-1)?.runId ?? null;
  const completedSteps = new Set<string>();
  const failedSteps = new Set<string>();
  let finished = false;
  if (latestRunId !== null) {
    for (const e of events) {
      if (e.runId !== latestRunId) continue;
      if (e.step === RUN_END_STEP) {
        finished = e.status === "succeeded";
        continue;
      }
      if (e.status === "succeeded") {
        completedSteps.add(e.step);
        failedSteps.delete(e.step);
      } else if (e.status === "failed") {
        failedSteps.add(e.step);
        completedSteps.delete(e.step);
      }
    }
  }
  return { runId: latestRunId, completedSteps, failedSteps, finished };
}
