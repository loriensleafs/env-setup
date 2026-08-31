import { homedir } from "node:os";
import * as p from "@clack/prompts";
import color from "picocolors";
import { z } from "zod";
import { run } from "../exec/run.ts";
import { buildRegistry } from "../items/all.ts";
import type { DetectResult, Item, ItemContext } from "../items/item.ts";
import { computeResume, readEvents } from "../journal/journal.ts";
import { MANIFEST_VERSION, type Manifest } from "../manifest/schema.ts";
import { loadManifest, saveManifest } from "../manifest/store.ts";
import { orchestrate, type StepOutcome } from "../orchestrator/orchestrator.ts";
import { journalPath } from "../paths/paths.ts";
import { groupMultiselect } from "../ui/group-multi-select.ts";
import { interactiveCapable, promptInput } from "../ui/terminal.ts";
import { runConnectPhase } from "../ceremonies/connect-phase.ts";
import { promptItemConfig } from "../ui/config-screens.ts";
import type { SelectGroups } from "../ui/group-multi-select.ts";

/** Placeholder until Stage C auth resolves the real GitHub noreply address. */
export const EMAIL_PENDING = "pending-noreply-resolution";

export interface BootstrapOptions {
  /** Show installed items as toggleable options (cascade inspection). */
  showInstalled?: boolean;
  /** Skip per-app config screens, accepting each item's defaults. */
  acceptDefaults?: boolean;
}

function sectionFor(item: Item): string {
  if (item.required) return "Required";
  if (item.kind === "font") return "Fonts";
  if (item.kind === "brew-cask" && item.id.startsWith("font-")) return "Fonts";
  if (item.kind === "repo") return "Repos";
  if (item.kind === "system" || item.kind === "config-only") return "System & config";
  if (item.kind === "brew-formula") return "CLI tools";
  return "Apps";
}

/**
 * How a detection result presents in the selection list (Peter's simplified
 * model, 2026-08-27):
 * - installed but version-flagged → "needs update" hint, checked as usual;
 * - installed with DRIFTED config (`differs`) → marked and UNCHECKED: selecting
 *   it is the user's opt-in to reset the config to our defaults. Unselected,
 *   the machine's config is untouched;
 * - plain not-installed → no hint, checked (a normal fresh install).
 */
export function presentOption(
  d: DetectResult,
  failedLastRun = false,
): { hint?: string; initialSelected?: false } {
  // The journal remembers failures: an item that failed last run comes back
  // pre-checked and labelled, even if drift detection alone would have left
  // it as an unchecked opt-in (re-running the one command must pick it up).
  if (failedLastRun && !d.installed) return { hint: "failed last run — retry" };
  if (d.installed) {
    return { hint: `installed${d.version ? ` ${d.version}` : ""} — needs update` };
  }
  if (d.differs === true) {
    return { hint: "installed — settings differ (select to reset)", initialSelected: false };
  }
  return {};
}

function bail(message: string): never {
  p.cancel(message);
  process.exit(0);
}

export async function bootstrap(opts: BootstrapOptions = {}): Promise<void> {
  if (!process.stdout.isTTY) {
    console.error(
      "envsetup bootstrap needs an interactive terminal (non-interactive mode arrives later)",
    );
    process.exit(1);
  }
  // stdout can be a terminal while stdin is not — the `curl … | sh` case. The
  // CLI entry replaces piped stdin with a self-opened /dev/tty stream
  // (src/index.ts), so reaching here without a tty stdin means there is no
  // terminal to acquire at all. Fail with a clear message, not a silent
  // EOF-cancel at the first prompt.
  if (!interactiveCapable()) {
    console.error(
      "envsetup bootstrap can't read your keyboard (no terminal available on stdin\n" +
        "and /dev/tty could not be opened). Run it from an interactive terminal.",
    );
    process.exit(1);
  }

  p.intro(color.bold("envsetup"));

  // --- Resume detection -------------------------------------------------
  const priorResume = computeResume(await readEvents(journalPath()));
  const priorManifest = await loadManifest().catch(() => null);
  if (priorManifest && priorResume.runId && !priorResume.finished) {
    const resume = await p.confirm({
      message: `An earlier run didn't finish (${priorResume.completedSteps.size} steps done). Resume it?`,
      input: promptInput(),
    });
    if (p.isCancel(resume)) bail("cancelled");
    if (resume) {
      await executePlan(priorManifest, { resume: true });
      return;
    }
  }

  // --- Step zero: detection scan ----------------------------------------
  const registry = buildRegistry();
  const scanCtx: ItemContext = {
    manifest: emptyManifest(),
    log: () => {},
    run,
  };
  const detection = new Map<string, DetectResult>();
  const scanStart = Date.now();
  const sections = new Map<string, Item[]>();
  for (const item of registry.all()) {
    const section = sectionFor(item);
    const list = sections.get(section) ?? [];
    list.push(item);
    sections.set(section, list);
  }
  // Single task-log group: each message announces the section about to be
  // evaluated (work runs right after, parallel within the section); no counts,
  // no group.success — taskLog.success collapses everything to one line.
  const scanLog = p.taskLog({ title: "Initializing", spacing: 0 });
  const scanGroup = scanLog.group("");
  for (const [section, items] of sections) {
    scanGroup.message(`Evaluating ${section.toLowerCase()}`);
    await Promise.all(
      items.map(async (item) => {
        detection.set(
          item.id,
          await item.detect(scanCtx).catch(() => ({ installed: false as const })),
        );
      }),
    );
  }
  const elapsed = ((Date.now() - scanStart) / 1000).toFixed(1);
  scanLog.success(`Ready in ${elapsed}s`);

  // --- Identity + locations (Group 6) ------------------------------------
  // Zod schemas double as prompt validators (Standard Schema bridge).
  const nonEmpty = (what: string) => z.string().trim().min(1, `${what} is required`);
  const answers = await p.group(
    {
      name: () =>
        p.text({
          input: promptInput(),
          message: "Your name (git commits)",
          initialValue: priorManifest?.identity.name ?? "Peter Kloss",
          validate: nonEmpty("name"),
        }),
      githubUser: () =>
        p.text({
          input: promptInput(),
          message: "GitHub username",
          initialValue: priorManifest?.identity.githubUser ?? "loriensleafs",
          validate: z
            .string()
            .trim()
            .regex(/^[a-zA-Z0-9-]+$/, "GitHub usernames are letters, digits, and dashes"),
        }),
      devDir: () =>
        p.path({
          input: promptInput(),
          message: "Dev directory (repos clone here — may not exist yet)",
          directory: true,
          initialValue: priorManifest?.locations.devDir ?? `${homedir()}/Dev`,
          validate: z
            .string()
            .trim()
            .min(1, "a directory path is required")
            .regex(/^(~|\/)/, "use an absolute path (or ~/...)"),
        }),
    },
    { onCancel: () => bail("cancelled") },
  );
  const { name, githubUser, devDir } = answers;

  // --- Unified selection --------------------------------------------------
  // Already-installed-and-current items don't appear at all (Peter's call):
  // they're part of the machine and go straight into the manifest.
  // Everything shown is TOGGLEABLE (Peter revised detect+lock 2026-08-26);
  // safety comes from the requires-cascade: unselecting a dependency disables
  // its dependents with a visible reason.
  const shown = new Set(
    registry
      .all()
      .filter((item) => {
        if (opts.showInstalled) return true;
        const d = detection.get(item.id) ?? { installed: false };
        return !(d.installed && d.satisfies !== false);
      })
      .map((item) => item.id),
  );
  const groups: SelectGroups = {
    Required: [],
    Apps: [],
    "CLI tools": [],
    Fonts: [],
    Repos: [],
    "System & config": [],
  };
  for (const item of registry.all()) {
    if (!shown.has(item.id)) continue;
    const d = detection.get(item.id) ?? { installed: false };
    // Registry deps feed the UI cascade — only deps that are themselves shown
    // (absent ones are installed, i.e. already satisfied).
    const requires = (item.deps ?? []).filter((dep) => shown.has(dep));
    groups[sectionFor(item)]?.push({
      id: item.id,
      label: item.title,
      requires: requires.length > 0 ? requires : undefined,
      ...presentOption(d, priorResume.failedSteps.has(item.id)),
    });
  }
  for (const [section, items] of Object.entries(groups)) {
    if (items.length === 0) delete groups[section];
  }

  const picks = await groupMultiselect({
    message: "What should this machine get?",
    groups,
    input: promptInput(),
  });
  if (p.isCancel(picks)) bail("cancelled");
  const selection = picks as string[];

  // --- Per-item config screens -------------------------------------------
  const itemConfigs = new Map<string, unknown>();
  if (!opts.acceptDefaults) {
    const configurable = registry
      .all()
      .filter((item) => selection.includes(item.id) && item.configSchema !== undefined);
    for (const item of configurable) {
      const config = await promptItemConfig(item, undefined);
      if (p.isCancel(config as never)) bail("cancelled");
      itemConfigs.set(item.id, config);
    }
  }

  // --- Summary + confirm --------------------------------------------------
  const toInstall = selection.filter((id) => !(detection.get(id)?.installed ?? false));
  const alreadyThere = [...detection.values()].filter((d) => d.installed).length;
  p.note(
    [
      `${color.bold(String(toInstall.length))} items will be installed`,
      `${alreadyThere} already installed (untouched)`,
      `Dev directory: ${devDir}`,
    ]
      .filter(Boolean)
      .join("\n"),
    "plan",
  );
  const go = await p.confirm({
    message: "Proceed? (nothing has touched the system yet)",
    input: promptInput(),
  });
  if (p.isCancel(go) || !go) bail("nothing was changed");

  // --- Manifest -----------------------------------------------------------
  const manifest: Manifest = {
    manifestVersion: MANIFEST_VERSION,
    createdAt: new Date().toISOString(),
    identity: { name, githubUser, email: EMAIL_PENDING },
    locations: { devDir, referenceDirName: "reference" },
    items: Object.fromEntries(
      registry.all().map((item) => {
        // Already-installed items are part of the machine definition even though
        // they're not in today's install selection — doctor/sync treat the
        // manifest as "what this machine should have".
        const installed = detection.get(item.id)?.installed ?? false;
        const config = itemConfigs.get(item.id) ?? item.defaultConfig;
        return [
          item.id,
          {
            selected: selection.includes(item.id) || installed,
            ...(config !== undefined ? { config } : {}),
          },
        ];
      }),
    ),
  };
  try {
    await saveManifest(manifest);
  } catch (err) {
    p.log.error(`could not save the manifest: ${err instanceof Error ? err.message : String(err)}`);
    bail("nothing was changed");
  }
  p.log.success("manifest written");

  await executePlan(manifest, { selection: toInstall });
}

function emptyManifest(): Manifest {
  return {
    manifestVersion: MANIFEST_VERSION,
    createdAt: new Date().toISOString(),
    identity: { name: "-", githubUser: "-", email: EMAIL_PENDING },
    locations: { devDir: "~/Dev", referenceDirName: "reference" },
    items: {},
  };
}

export async function executePlan(
  manifest: Manifest,
  opts: { resume?: boolean; selection?: string[]; finishing?: boolean } = {},
): Promise<void> {
  const registry = buildRegistry();
  const selection =
    opts.selection ??
    Object.entries(manifest.items)
      .filter(([, s]) => s.selected)
      .map(([id]) => id);

  const order = registry.executionOrder(selection);
  const runStart = Date.now();
  // Append-only rendering: one spinner for the CURRENT step, completed steps
  // as plain log lines. (The earlier taskLog groups re-rendered the whole
  // block once it grew past the viewport, duplicating finished lines —
  // observed live on the first real bootstrap run.)
  p.log.step(`Installing ${order.length} items`);
  const stepSpinner = p.spinner();
  let stepIndex = 0;
  let spinning = false;
  let currentTitle = "";
  // Items can ask a yes/no question mid-step (e.g. "quit Chrome?"): pause
  // the spinner so the prompt renders cleanly, then resume it.
  const ask = async (message: string): Promise<boolean> => {
    const wasSpinning = spinning;
    if (wasSpinning) {
      stepSpinner.stop(currentTitle);
      spinning = false;
    }
    const answer = await p.confirm({ message, input: promptInput() });
    const yes = !p.isCancel(answer) && answer === true;
    if (wasSpinning) {
      stepSpinner.start(currentTitle);
      spinning = true;
    }
    return yes;
  };
  const report = await orchestrate({
    ask,
    registry,
    manifest,
    selection,
    journalPath: journalPath(),
    runner: run,
    resume: opts.resume,
    events: {
      onStepStart: (_id, title) => {
        stepIndex++;
        currentTitle = `${title} (${stepIndex}/${order.length})`;
        stepSpinner.start(currentTitle);
        spinning = true;
      },
      onStepLog: (_id, message) => {
        if (spinning) stepSpinner.message(message);
        else p.log.info(message);
      },
      onStepEnd: (id, outcome: StepOutcome) => {
        const stop = (msg: string) => {
          if (spinning) stepSpinner.stop(msg);
          else p.log.info(msg);
          spinning = false;
        };
        if (outcome.kind === "succeeded") stop(`${id} installed`);
        else if (outcome.kind === "skipped-installed") stop(`${id} already installed`);
        else if (outcome.kind === "skipped-completed") stop(`${id} done in previous run`);
        else if (outcome.kind === "deferred")
          stop(`${id} — attended step, run ${color.bold("envsetup connect")}`);
        else if (outcome.kind === "skipped-dependency") {
          // No spinner was started for skipped steps — surface as a log line.
          p.log.warn(`${id} skipped: ${outcome.because} failed`);
        } else stop(color.red(`${id} failed: ${outcome.error}`));
      },
    },
  });
  const runElapsed = ((Date.now() - runStart) / 1000).toFixed(1);

  // --- Triage summary -----------------------------------------------------
  if (report.aborted) {
    p.log.error(`required item ${report.aborted.id} failed: ${report.aborted.error}`);
    p.outro(color.red("run aborted — re-run the same command to resume after fixing the issue"));
    return;
  }
  if (report.failed.length > 0) {
    p.log.error(`${report.failed.length} of ${order.length} items failed (${runElapsed}s)`);
    for (const f of report.failed) p.log.error(`${f.id}: ${f.error}`);
  } else {
    p.log.success(`Installed ${report.succeeded.length} items in ${runElapsed}s`);
  }
  if (opts.finishing) return; // the post-connect pass ends here (no recursion)

  // --- Connect phase: attended steps, automatically ------------------------
  // The one-liner must finish the job — no second command. Run whatever
  // ceremonies are still pending, then a short finishing pass so items that
  // depend on what the ceremonies created (the Dock on the web-app bundles)
  // pick them up.
  if (interactiveCapable()) {
    const connect = await runConnectPhase(registry, manifest);
    if (connect.done > 0) {
      p.log.step("Finishing up");
      await executePlan(manifest, { finishing: true });
    }
  } else {
    p.log.info("attended steps skipped (no terminal) — run `envsetup connect` from a terminal");
  }

  const failedTail =
    report.failed.length > 0
      ? `${report.failed.length} failed — re-run to retry failures`
      : color.green("all done");
  p.outro(failedTail);
}
