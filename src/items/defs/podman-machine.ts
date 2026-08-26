import { z } from "zod";
import { defineItem } from "../item.ts";

const PODMAN = "/opt/homebrew/bin/podman";

export const podmanMachineSchema = z.object({
  cpus: z.number().int().min(1).max(16).default(4),
  memoryMb: z.number().int().min(1024).max(65536).default(8192),
  diskGb: z.number().int().min(20).max(500).default(100),
});
export type PodmanMachineConfig = z.infer<typeof podmanMachineSchema>;

/** Decided Podman defaults: 4 CPU / 8GB / 100GB, on-demand start, no GUI. */
export const podmanMachine = defineItem<PodmanMachineConfig>({
  id: "podman-machine",
  title: "Podman machine (4 CPU · 8GB · 100GB)",
  kind: "config-only",
  deps: ["podman"],
  configSchema: podmanMachineSchema,
  defaultConfig: podmanMachineSchema.parse({}),
  detect: async (ctx) => {
    const r = await ctx.run([PODMAN, "machine", "list", "--format", "{{.Name}}"]);
    return { installed: r.exitCode === 0 && r.stdout.trim() !== "" };
  },
  configure: async (ctx, config) => {
    const list = await ctx.run([PODMAN, "machine", "list", "--format", "{{.Name}}"]);
    if (list.exitCode === 0 && list.stdout.trim() !== "") {
      ctx.log("machine already exists — left untouched");
      return;
    }
    const r = await ctx.run([
      PODMAN, "machine", "init",
      "--cpus", String(config.cpus),
      "--memory", String(config.memoryMb),
      "--disk-size", String(config.diskGb),
    ]);
    if (r.exitCode !== 0) throw new Error(`podman machine init failed: ${r.stderr.trim().slice(-300)}`);
    ctx.log("machine created (not started — start on demand with `podman machine start`)");
  },
  verify: async (ctx) => (await ctx.run([PODMAN, "machine", "list"])).exitCode === 0,
});
