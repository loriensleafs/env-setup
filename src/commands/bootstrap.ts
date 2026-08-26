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
import type { SelectGroups } from "../ui/group-multi-select.ts";

/** Placeholder until Stage C auth resolves the real GitHub noreply address. */
export const EMAIL_PENDING = "pending-noreply-resolution";

export interface BootstrapOptions {
  dryRun?: boolean;
}

function sectionFor(item: Item): string {
  if (item.required) return "Required";
  if (item.kind === "font") return "Fonts";
  if (item.kind === "brew-cask" && item.id.startsWith("font-")) return "Fonts";
  if (item.kind === "brew-formula") return "CLI tools";
  return "Apps";
}

function bail(message: string): never {
  p.cancel(message);
  process.exit(0);
}

export async function bootstrap(opts: BootstrapOptions = {}): Promise<void> {
  if (!process.stdout.isTTY) {
    console.error("envsetup bootstrap needs an interactive terminal (non-interactive mode arrives later)");
    process.exit(1);
  }

  p.intro(color.bold("envsetup"));

  // --- Resume detection -------------------------------------------------
  const priorResume = computeResume(await readEvents(journalPath()));
  const priorManifest = await loadManifest().catch(() => null);
  if (priorManifest && priorResume.runId && !priorResume.finished) {
    const resume = await p.confirm({
      message: `An earlier run didn't finish (${priorResume.completedSteps.size} steps done). Resume it?`,
    });
    if (p.isCancel(resume)) bail("cancelled");
    if (resume) {
      await executePlan(priorManifest, { resume: true, dryRun: opts.dryRun });
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
  const s = p.spinner();
  s.start("Scanning this machine");
  const detection = new Map<string, DetectResult>();
  const all = registry.all();
  for (let i = 0; i < all.length; i++) {
    const item = all[i] as (typeof all)[number];
    s.message(`Checking ${item.title} (${i + 1}/${all.length})`);
    detection.set(item.id, await item.detect(scanCtx).catch(() => ({ installed: false })));
  }
  const found = [...detection.values()].filter((d) => d.installed).length;
  s.stop(`Scanned ${detection.size} items — ${found} already installed`);

  // --- Identity + locations (Group 6) ------------------------------------
  // Zod schemas double as prompt validators (Standard Schema bridge).
  const nonEmpty = (what: string) => z.string().trim().min(1, `${what} is required`);
  const answers = await p.group(
    {
      name: () =>
        p.text({
          message: "Your name (git commits)",
          initialValue: "Peter Kloss",
          validate: nonEmpty("name"),
        }),
      githubUser: () =>
        p.text({
          message: "GitHub username",
          initialValue: "loriensleafs",
          validate: z
            .string()
            .trim()
            .regex(/^[a-zA-Z0-9-]+$/, "GitHub usernames are letters, digits, and dashes"),
        }),
      devDir: () =>
        p.path({
          message: "Dev directory (repos clone here — may not exist yet)",
          directory: true,
          initialValue: `${homedir()}/Dev`,
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
    registry.all()
      .filter((item) => {
        const d = detection.get(item.id) ?? { installed: false };
        return !(d.installed && d.satisfies !== false);
      })
      .map((item) => item.id),
  );
  const groups: SelectGroups = { Required: [], Apps: [], "CLI tools": [], Fonts: [] };
  for (const item of registry.all()) {
    if (!shown.has(item.id)) continue;
    const d = detection.get(item.id) ?? { installed: false };
    const hint = d.installed ? `installed${d.version ? ` ${d.version}` : ""} — needs update` : undefined;
    // Registry deps feed the UI cascade — only deps that are themselves shown
    // (absent ones are installed, i.e. already satisfied).
    const requires = (item.deps ?? []).filter((dep) => shown.has(dep));
    groups[sectionFor(item)]?.push({
      id: item.id,
      label: item.title,
      hint,
      requires: requires.length > 0 ? requires : undefined,
    });
  }
  for (const [section, items] of Object.entries(groups)) {
    if (items.length === 0) delete groups[section];
  }

  const picks = await groupMultiselect({ message: "What should this machine get?", groups });
  if (p.isCancel(picks)) bail("cancelled");
  const selection = picks as string[];

  // --- Per-item config screens -------------------------------------------
  // (Items with config prompts plug in here as they're built — none yet.)

  // --- Summary + confirm --------------------------------------------------
  const toInstall = selection.filter((id) => !(detection.get(id)?.installed ?? false));
  const alreadyThere = [...detection.values()].filter((d) => d.installed).length;
  p.note(
    [
      `${color.bold(String(toInstall.length))} items will be installed`,
      `${alreadyThere} already installed (untouched)`,
      `Dev directory: ${devDir}`,
      opts.dryRun ? color.yellow("DRY RUN — nothing will be installed") : "",
    ]
      .filter(Boolean)
      .join("\n"),
    "plan",
  );
  const go = await p.confirm({ message: "Proceed? (nothing has touched the system yet)" });
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
        return [item.id, { selected: selection.includes(item.id) || installed }];
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

  await executePlan(manifest, { dryRun: opts.dryRun, selection: toInstall });
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

async function executePlan(
  manifest: Manifest,
  opts: { resume?: boolean; dryRun?: boolean; selection?: string[] },
): Promise<void> {
  const registry = buildRegistry();
  const selection =
    opts.selection ??
    Object.entries(manifest.items)
      .filter(([, s]) => s.selected)
      .map(([id]) => id);

  if (opts.dryRun) {
    const order = registry.executionOrder(selection);
    p.note(order.join("\n"), "execution order (dry run)");
    p.outro("dry run complete — manifest saved, nothing installed");
    return;
  }

  const s = p.spinner();
  const order = registry.executionOrder(selection);
  let stepIndex = 0;
  const report = await orchestrate({
    registry,
    manifest,
    selection,
    journalPath: journalPath(),
    runner: run,
    resume: opts.resume,
    events: {
      onStepStart: (_id, title) => {
        stepIndex++;
        s.start(`${title} (${stepIndex}/${order.length})`);
      },
      onStepLog: (_id, message) => s.message(message),
      onStepEnd: (id, outcome: StepOutcome) => {
        if (outcome.kind === "succeeded") s.stop(`${color.green("✓")} ${id}`);
        else if (outcome.kind === "skipped-installed")
          s.stop(`${color.dim("✓")} ${id} ${color.dim("already installed")}`);
        else if (outcome.kind === "skipped-completed")
          s.stop(`${color.dim("↷")} ${id} ${color.dim("done in previous run")}`);
        else if (outcome.kind === "skipped-dependency")
          s.stop(`${color.yellow("↷")} ${id} ${color.dim(`skipped: ${outcome.because} failed`)}`);
        else s.stop(`${color.red("✗")} ${id} ${color.dim(outcome.error)}`);
      },
    },
  });

  // --- Triage summary -----------------------------------------------------
  if (report.aborted) {
    p.log.error(`required item ${report.aborted.id} failed: ${report.aborted.error}`);
    p.outro(color.red("run aborted — re-run the same command to resume after fixing the issue"));
    return;
  }
  if (report.failed.length > 0) {
    const lines = report.failed.map((f) => `${color.red("✗")} ${f.id}: ${f.error}`);
    for (const skip of report.skippedDependents) {
      lines.push(`${color.yellow("↷")} ${skip.id} (needs ${skip.because})`);
    }
    p.note(lines.join("\n"), "needs attention");
    p.outro(`${report.succeeded.length} installed, ${report.failed.length} failed — re-run to retry failures`);
  } else {
    p.outro(color.green(`all done — ${report.succeeded.length} installed, ${report.skippedInstalled.length + report.skippedCompleted.length} skipped`));
  }
}
