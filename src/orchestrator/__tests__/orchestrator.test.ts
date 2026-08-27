import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { z } from "zod";
import { defineItem, type Item } from "../../items/item.ts";
import { ItemRegistry } from "../../items/registry.ts";
import { MANIFEST_VERSION, type Manifest } from "../../manifest/schema.ts";
import { readEvents } from "../../journal/journal.ts";
import { orchestrate, transitiveDependents } from "../orchestrator.ts";

const manifest = (items: Manifest["items"] = {}): Manifest => ({
  manifestVersion: MANIFEST_VERSION,
  createdAt: "2026-08-26T12:00:00Z",
  identity: { name: "P", githubUser: "l", email: "a@b" },
  locations: { devDir: "~/Dev", referenceDirName: "reference" },
  items,
});

const runner = async () => ({ exitCode: 0, stdout: "", stderr: "" });
const jpath = () => join(tmpdir(), `envsetup-orch-${Date.now()}-${Math.random()}`, "j.jsonl");

interface Probe {
  installs: string[];
  configures: unknown[];
}

function makeItem(
  id: string,
  probe: Probe,
  opts: {
    deps?: string[];
    required?: boolean;
    installed?: boolean;
    failTimes?: number;
    configSchema?: z.ZodType<unknown>;
    defaultConfig?: unknown;
    configure?: boolean;
  } = {},
): Item {
  let failures = opts.failTimes ?? 0;
  return defineItem({
    id,
    title: id,
    kind: "brew-formula",
    required: opts.required,
    deps: opts.deps,
    configSchema: opts.configSchema,
    defaultConfig: opts.defaultConfig,
    detect: async () => ({ installed: opts.installed ?? false }),
    install: async () => {
      if (failures > 0) {
        failures--;
        throw new Error(`${id} boom`);
      }
      probe.installs.push(id);
    },
    configure: opts.configure
      ? async (_ctx, config) => {
          probe.configures.push(config);
        }
      : undefined,
  });
}

describe("orchestrate", () => {
  test("happy path: installs in dependency order, journals, finishes", async () => {
    const probe: Probe = { installs: [], configures: [] };
    const r = new ItemRegistry();
    r.register(makeItem("base", probe));
    r.register(makeItem("mid", probe, { deps: ["base"] }));
    r.register(makeItem("leaf", probe, { deps: ["mid"] }));
    const path = jpath();
    const report = await orchestrate({
      registry: r,
      manifest: manifest(),
      selection: ["leaf", "base", "mid"],
      journalPath: path,
      runner,
    });
    expect(probe.installs).toEqual(["base", "mid", "leaf"]);
    expect(report.finished).toBe(true);
    expect(report.succeeded).toEqual(["base", "mid", "leaf"]);
    const events = await readEvents(path);
    expect(events.at(-1)?.step).toBe("__run__");
    expect(events.at(-1)?.status).toBe("succeeded");
  });

  test("already-installed items are skipped", async () => {
    const probe: Probe = { installs: [], configures: [] };
    const r = new ItemRegistry();
    r.register(makeItem("present", probe, { installed: true }));
    const report = await orchestrate({
      registry: r,
      manifest: manifest(),
      selection: ["present"],
      journalPath: jpath(),
      runner,
    });
    expect(probe.installs).toEqual([]);
    expect(report.skippedInstalled).toEqual(["present"]);
  });

  test("retry-once policy: fails once then succeeds", async () => {
    const probe: Probe = { installs: [], configures: [] };
    const r = new ItemRegistry();
    r.register(makeItem("flaky", probe, { failTimes: 1 }));
    const path = jpath();
    const report = await orchestrate({
      registry: r,
      manifest: manifest(),
      selection: ["flaky"],
      journalPath: path,
      runner,
    });
    expect(report.succeeded).toEqual(["flaky"]);
    const events = await readEvents(path);
    expect(events.filter((e) => e.step === "flaky" && e.status === "failed")).toHaveLength(1);
    expect(events.find((e) => e.step === "flaky" && e.status === "succeeded")?.attempt).toBe(2);
  });

  test("non-required failure: continues, skips transitive dependents", async () => {
    const probe: Probe = { installs: [], configures: [] };
    const r = new ItemRegistry();
    r.register(makeItem("bad", probe, { failTimes: 99 }));
    r.register(makeItem("child", probe, { deps: ["bad"] }));
    r.register(makeItem("grandchild", probe, { deps: ["child"] }));
    r.register(makeItem("bystander", probe));
    const report = await orchestrate({
      registry: r,
      manifest: manifest(),
      selection: ["bad", "child", "grandchild", "bystander"],
      journalPath: jpath(),
      runner,
    });
    expect(report.finished).toBe(true);
    expect(report.failed.map((f) => f.id)).toEqual(["bad"]);
    expect(report.skippedDependents.map((s) => s.id).sort()).toEqual(["child", "grandchild"]);
    expect(report.succeeded).toEqual(["bystander"]);
  });

  test("required failure aborts the run", async () => {
    const probe: Probe = { installs: [], configures: [] };
    const r = new ItemRegistry();
    r.register(makeItem("clt", probe, { required: true, failTimes: 99 }));
    r.register(makeItem("later", probe));
    const report = await orchestrate({
      registry: r,
      manifest: manifest(),
      selection: ["clt", "later"],
      journalPath: jpath(),
      runner,
    });
    expect(report.aborted?.id).toBe("clt");
    expect(report.finished).toBe(false);
    expect(probe.installs).toEqual([]);
  });

  test("resume skips completed steps of the unfinished run", async () => {
    const probe: Probe = { installs: [], configures: [] };
    const r = new ItemRegistry();
    r.register(makeItem("a", probe));
    r.register(makeItem("b", probe, { failTimes: 99 }));
    const path = jpath();
    const first = await orchestrate({
      registry: r,
      manifest: manifest(),
      selection: ["a", "b"],
      journalPath: path,
      runner,
    });
    expect(first.succeeded).toEqual(["a"]);
    expect(first.failed.map((f) => f.id)).toEqual(["b"]);
    // second run resumes: a skipped-as-completed... but run 1 FINISHED (non-required failure),
    // so resume starts fresh. Use an aborted run instead:
    const r2 = new ItemRegistry();
    r2.register(makeItem("a2", probe));
    r2.register(makeItem("req", probe, { required: true, failTimes: 1 })); // fails run 1 attempt... maxAttempts=2 would retry-succeed; force 2 failures
    const path2 = jpath();
    const probeX: Probe = { installs: [], configures: [] };
    const rX = new ItemRegistry();
    rX.register(makeItem("ok", probeX));
    rX.register(makeItem("z-boom", probeX, { required: true, failTimes: 2 }));
    const runA = await orchestrate({
      registry: rX,
      manifest: manifest(),
      selection: ["ok", "z-boom"],
      journalPath: path2,
      runner,
    });
    expect(runA.aborted?.id).toBe("z-boom");
    expect(probeX.installs).toEqual(["ok"]);
    // resume: ok skipped-as-completed, boom now succeeds (failTimes exhausted)
    const runB = await orchestrate({
      registry: rX,
      manifest: manifest(),
      selection: ["ok", "z-boom"],
      journalPath: path2,
      runner,
      resume: true,
    });
    expect(runB.skippedCompleted).toEqual(["ok"]);
    expect(runB.succeeded).toEqual(["z-boom"]);
    expect(runB.runId).toBe(runA.runId); // same run continued
    expect(probeX.installs).toEqual(["ok", "z-boom"]);
  });

  test("configure runs with schema-validated manifest config (falls back to defaults)", async () => {
    const probe: Probe = { installs: [], configures: [] };
    const schema = z.object({ cpus: z.number().int().min(1).max(16) });
    const r = new ItemRegistry();
    r.register(
      makeItem("podman", probe, {
        configSchema: schema,
        defaultConfig: { cpus: 4 },
        configure: true,
      }),
    );
    await orchestrate({
      registry: r,
      manifest: manifest({ podman: { selected: true, config: { cpus: 8 } } }),
      selection: ["podman"],
      journalPath: jpath(),
      runner,
    });
    expect(probe.configures).toEqual([{ cpus: 8 }]);
    // and defaults when manifest has none
    const probe2: Probe = { installs: [], configures: [] };
    const r2b = new ItemRegistry();
    r2b.register(
      makeItem("podman", probe2, {
        configSchema: schema,
        defaultConfig: { cpus: 4 },
        configure: true,
      }),
    );
    await orchestrate({
      registry: r2b,
      manifest: manifest(),
      selection: ["podman"],
      journalPath: jpath(),
      runner,
    });
    expect(probe2.configures).toEqual([{ cpus: 4 }]);
  });

  test("invalid manifest config fails the step (clamping happens at prompt time)", async () => {
    const probe: Probe = { installs: [], configures: [] };
    const schema = z.object({ cpus: z.number().int().min(1).max(16) });
    const r = new ItemRegistry();
    r.register(
      makeItem("podman", probe, {
        configSchema: schema,
        defaultConfig: { cpus: 4 },
        configure: true,
      }),
    );
    const report = await orchestrate({
      registry: r,
      manifest: manifest({ podman: { selected: true, config: { cpus: 999 } } }),
      selection: ["podman"],
      journalPath: jpath(),
      runner,
    });
    expect(report.failed.map((f) => f.id)).toEqual(["podman"]);
  });
});

describe("transitiveDependents", () => {
  test("walks chains within the selection only", () => {
    const r = new ItemRegistry();
    const probe: Probe = { installs: [], configures: [] };
    r.register(makeItem("a", probe));
    r.register(makeItem("b", probe, { deps: ["a"] }));
    r.register(makeItem("c", probe, { deps: ["b"] }));
    r.register(makeItem("d", probe));
    expect([...transitiveDependents(r, ["a", "b", "c", "d"], "a")].sort()).toEqual(["b", "c"]);
    expect([...transitiveDependents(r, ["a", "d"], "a")]).toEqual([]);
  });
});
