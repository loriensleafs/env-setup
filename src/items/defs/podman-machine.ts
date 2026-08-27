import { homedir } from "node:os";
import { join } from "node:path";
import { mkdir } from "node:fs/promises";
import { z } from "zod";
import { defineItem } from "../item.ts";

const PODMAN = "/opt/homebrew/bin/podman";

/**
 * DOCKER_HOST tells Docker-API clients (test harnesses, IDE container plugins,
 * language SDKs) where the container engine's socket is. The `docker=podman`
 * alias covers the CLI, but those API clients read this env var. Podman's
 * socket path on macOS is per-machine (not static — it must come from
 * `podman machine inspect`), so we capture it ONCE here into a small file the
 * shell sources cheaply — no per-shell subprocess. Written to this path:
 */
const PODMAN_ENV = join(homedir(), ".config", "envsetup", "podman-env.zsh");

async function writeDockerHostEnv(ctx: {
  run: (c: string[]) => Promise<{ exitCode: number; stdout: string }>;
}): Promise<void> {
  const sock = await ctx.run([
    PODMAN,
    "machine",
    "inspect",
    "--format",
    "{{.ConnectionInfo.PodmanSocket.Path}}",
  ]);
  const path = sock.stdout.trim();
  if (sock.exitCode !== 0 || !path) return; // no machine yet — nothing to point at
  await mkdir(join(PODMAN_ENV, ".."), { recursive: true });
  await Bun.write(
    PODMAN_ENV,
    `# Written by envsetup podman-machine. Docker-API socket for podman.\nexport DOCKER_HOST="unix://${path}"\n`,
  );
}

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
  zsh: () => ({
    comment: "podman (docker CLI shim + DOCKER_HOST for Docker-API tools)",
    // Cheap source of the captured DOCKER_HOST (written at configure time) — no
    // `podman machine inspect` subprocess on every shell start.
    env: [
      '[ -f "$HOME/.config/envsetup/podman-env.zsh" ] && source "$HOME/.config/envsetup/podman-env.zsh"',
    ],
    aliases: ["command -v podman >/dev/null && alias docker=podman"],
  }),
  configSchema: podmanMachineSchema,
  defaultConfig: podmanMachineSchema.parse({}),
  detect: async (ctx) => {
    const list = await ctx.run([PODMAN, "machine", "list", "--format", "{{.Name}}"]);
    // No machine = never set up.
    if (list.exitCode !== 0 || list.stdout.trim() === "") return { installed: false };
    // Drift-aware: the machine exists — the captured DOCKER_HOST env file must
    // exist and point at the machine's actual socket, or Docker-API tools break
    // silently while everything "looks" installed.
    const sock = await ctx.run([
      PODMAN,
      "machine",
      "inspect",
      "--format",
      "{{.ConnectionInfo.PodmanSocket.Path}}",
    ]);
    const path = sock.stdout.trim();
    if (sock.exitCode !== 0 || !path) return { installed: true }; // socket unknowable — don't flag
    const envFile = Bun.file(PODMAN_ENV);
    const ok = (await envFile.exists()) && (await envFile.text()).includes(`unix://${path}`);
    return ok ? { installed: true } : { installed: false, differs: true };
  },
  configure: async (ctx, config) => {
    const list = await ctx.run([PODMAN, "machine", "list", "--format", "{{.Name}}"]);
    if (list.exitCode === 0 && list.stdout.trim() !== "") {
      await writeDockerHostEnv(ctx);
      ctx.log("machine already exists — left untouched (DOCKER_HOST refreshed)");
      return;
    }
    const r = await ctx.run([
      PODMAN,
      "machine",
      "init",
      "--cpus",
      String(config.cpus),
      "--memory",
      String(config.memoryMb),
      "--disk-size",
      String(config.diskGb),
    ]);
    if (r.exitCode !== 0)
      throw new Error(`podman machine init failed: ${r.stderr.trim().slice(-300)}`);
    await writeDockerHostEnv(ctx);
    ctx.log("machine created (not started — start on demand with `podman machine start`)");
  },
  verify: async (ctx) => (await ctx.run([PODMAN, "machine", "list"])).exitCode === 0,
});
