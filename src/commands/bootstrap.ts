import * as p from "@clack/prompts";
import color from "picocolors";
import { run } from "../exec/run.ts";
import { buildRegistry } from "../items/all.ts";
import type { DetectResult, Item, ItemContext } from "../items/item.ts";
import { computeResume, readEvents } from "../journal/journal.ts";
import { MANIFEST_VERSION, type Manifest } from "../manifest/schema.ts";
import { loadManifest, saveManifest } from "../manifest/store.ts";
import { orchestrate, type StepOutcome } from "../orchestrator/orchestrator.ts";
import { journalPath } from "../paths/paths.ts";
import { unifiedSelect } from "../ui/unified-select.ts";
import type { UnifiedOption } from "../ui/unified-select-state.ts";

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
  for (const item of registry.all()) {
    detection.set(item.id, await item.detect(scanCtx).catch(() => ({ installed: false })));
  }
  s.stop(`Scanned ${detection.size} items`);

  // --- Identity + locations (Group 6) ------------------------------------
  const name = await p.text({ message: "Your name (git commits)", initialValue: "Peter Kloss" });
  if (p.isCancel(name)) bail("cancelled");
  const githubUser = await p.text({ message: "GitHub username", initialValue: "loriensleafs" });
  if (p.isCancel(githubUser)) bail("cancelled");
  const devDir = await p.text({ message: "Dev directory", initialValue: "~/Dev" });
  if (p.isCancel(devDir)) bail("cancelled");

  // --- Unified selection --------------------------------------------------
  const options: UnifiedOption[] = registry.all().map((item) => {
    const d = detection.get(item.id) ?? { installed: false };
    let locked: UnifiedOption["locked"];
    if (d.installed && d.satisfies !== false) locked = "installed";
    else if (item.required) locked = "on";
    const hint = d.installed
      ? `installed${d.version ? ` ${d.version}` : ""}`
      : undefined;
    return { id: item.id, label: item.title, section: sectionFor(item), locked, hint };
  });
  // Stable section order: Required, Apps, CLI tools, Fonts
  const sectionRank: Record<string, number> = { Required: 0, Apps: 1, "CLI tools": 2, Fonts: 3 };
  options.sort((a, b) => (sectionRank[a.section] ?? 9) - (sectionRank[b.section] ?? 9));

  const picks = await unifiedSelect({ message: "What should this machine get?", options });
  if (p.isCancel(picks)) bail("cancelled");
  const selection = picks as string[];

  // --- Per-item config screens -------------------------------------------
  // (Items with config prompts plug in here as they're built — none yet.)

  // --- Summary + confirm --------------------------------------------------
  const toInstall = selection.filter((id) => !(detection.get(id)?.installed ?? false));
  const alreadyThere = options.filter((o) => o.locked === "installed").length;
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
  await saveManifest(manifest);
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
  const report = await orchestrate({
    registry,
    manifest,
    selection,
    journalPath: journalPath(),
    runner: run,
    resume: opts.resume,
    events: {
      onStepStart: (_id, title) => s.start(title),
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
