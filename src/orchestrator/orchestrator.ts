import { appendEvent, computeResume, readEvents, RUN_END_STEP } from "../journal/journal.ts";
import type { ItemContext } from "../items/item.ts";
import type { ItemRegistry } from "../items/registry.ts";
import type { Manifest } from "../manifest/schema.ts";
import type { Runner } from "../exec/run.ts";

export type StepOutcome =
  | { kind: "succeeded" }
  | { kind: "skipped-installed"; version?: string }
  | { kind: "skipped-completed" } // done in a previous (resumed) run
  | { kind: "skipped-dependency"; because: string }
  | { kind: "deferred" } // attended step (ceremony) — nothing to run here
  | { kind: "failed"; error: string };

export interface OrchestratorEvents {
  onStepStart?(id: string, title: string): void;
  onStepLog?(id: string, message: string): void;
  onStepEnd?(id: string, outcome: StepOutcome): void;
}

export interface RunReport {
  runId: string;
  succeeded: string[];
  skippedInstalled: string[];
  skippedCompleted: string[];
  skippedDependents: { id: string; because: string }[];
  /** Items whose only work is an attended ceremony (run `envsetup connect`). */
  deferred: string[];
  failed: { id: string; error: string }[];
  /** Set when a required item failed and the run stopped. */
  aborted?: { id: string; error: string };
  finished: boolean;
}

export interface OrchestratorOptions {
  registry: ItemRegistry;
  manifest: Manifest;
  /** Item ids to run (already filtered to the user's selection). */
  selection: string[];
  journalPath: string;
  runner: Runner;
  events?: OrchestratorEvents;
  /** Total attempts per step (decided policy: 2 = one auto-retry). */
  maxAttempts?: number;
  /** Resume: skip steps completed in the latest unfinished run. */
  resume?: boolean;
  runId?: string;
  /** Interactive yes/no for items that need a user decision mid-step. */
  ask?: (message: string) => Promise<boolean>;
}

/** Transitive dependents of `id` within `selection`, using registry deps. */
export function transitiveDependents(
  registry: ItemRegistry,
  selection: string[],
  id: string,
): Set<string> {
  const dependents = new Set<string>();
  let grew = true;
  while (grew) {
    grew = false;
    for (const other of selection) {
      if (dependents.has(other) || other === id) continue;
      const deps = registry.get(other)?.deps ?? [];
      if (deps.some((d) => d === id || dependents.has(d))) {
        dependents.add(other);
        grew = true;
      }
    }
  }
  return dependents;
}

export async function orchestrate(opts: OrchestratorOptions): Promise<RunReport> {
  const { registry, manifest, selection, journalPath, runner, events = {}, maxAttempts = 2 } = opts;

  const prior = opts.resume ? computeResume(await readEvents(journalPath)) : null;
  const priorCompleted = prior && !prior.finished ? prior.completedSteps : new Set<string>();
  const runId =
    opts.runId ?? (prior && !prior.finished && prior.runId ? prior.runId : crypto.randomUUID());

  const report: RunReport = {
    runId,
    succeeded: [],
    skippedInstalled: [],
    skippedCompleted: [],
    skippedDependents: [],
    deferred: [],
    failed: [],
    finished: false,
  };

  const order = registry.executionOrder(selection);
  const toSkip = new Map<string, string>(); // id -> failed dependency id
  const journal = (
    step: string,
    status: "started" | "succeeded" | "failed" | "skipped",
    attempt = 1,
    error?: string,
  ) =>
    appendEvent(
      { ts: new Date().toISOString(), runId, step, status, attempt, ...(error ? { error } : {}) },
      journalPath,
    );

  for (const id of order) {
    const item = registry.get(id);
    if (!item) continue;
    const ctx: ItemContext = {
      manifest,
      log: (m) => events.onStepLog?.(id, m),
      run: runner,
      ...(opts.ask ? { ask: opts.ask } : {}),
    };

    if (toSkip.has(id)) {
      const because = toSkip.get(id) as string;
      await journal(id, "skipped", 1, `dependency ${because} failed`);
      report.skippedDependents.push({ id, because });
      events.onStepEnd?.(id, { kind: "skipped-dependency", because });
      continue;
    }

    if (priorCompleted.has(id)) {
      report.skippedCompleted.push(id);
      events.onStepEnd?.(id, { kind: "skipped-completed" });
      continue;
    }

    events.onStepStart?.(id, item.title);

    // Detection short-circuit: present and not version-flagged → nothing to do.
    const detected = await item.detect(ctx).catch(() => ({ installed: false as const }));
    if (detected.installed && detected.satisfies !== false && item.install) {
      await journal(id, "skipped", 1, "already applied");
      report.skippedInstalled.push(id);
      events.onStepEnd?.(id, { kind: "skipped-installed", version: detected.version });
      continue;
    }

    // Nothing to run here: the item's work is an attended ceremony. Saying
    // "installed" for it was misleading (chrome-pwas on Peter's first sync).
    if (!item.install && !item.configure) {
      await journal(id, "skipped", 1, "deferred to ceremony");
      report.deferred.push(id);
      events.onStepEnd?.(id, { kind: "deferred" });
      continue;
    }

    let lastError = "";
    let succeeded = false;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await journal(id, "started", attempt);
      try {
        await item.install?.(ctx);
        if (item.configure) {
          const raw = manifest.items[id]?.config ?? item.defaultConfig;
          const config = item.configSchema ? item.configSchema.parse(raw) : raw;
          await item.configure(ctx, config);
        }
        if (item.verify && !(await item.verify(ctx))) {
          throw new Error("verification failed after install");
        }
        succeeded = true;
        await journal(id, "succeeded", attempt);
        break;
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        await journal(id, "failed", attempt, lastError);
      }
    }

    if (succeeded) {
      report.succeeded.push(id);
      events.onStepEnd?.(id, { kind: "succeeded" });
      continue;
    }

    events.onStepEnd?.(id, { kind: "failed", error: lastError });
    if (item.required) {
      // Decided policy: required failures stall the run (nothing else can proceed).
      report.aborted = { id, error: lastError };
      await journal(RUN_END_STEP, "failed", 1, `aborted: required item ${id} failed`);
      return report;
    }
    report.failed.push({ id, error: lastError });
    for (const dep of transitiveDependents(registry, selection, id)) {
      toSkip.set(dep, id);
    }
  }

  report.finished = true;
  await journal(RUN_END_STEP, "succeeded");
  return report;
}
