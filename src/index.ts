import { openSync } from "node:fs";
import tty from "node:tty";
import { defineCommand, runMain } from "citty";

/**
 * Terminal self-healing for the `curl … | sh` path (empirically verified
 * 2026-08-27, see docs/PLAN.md):
 *
 * 1. Piping the installer leaves stdin as the exhausted script pipe, and a
 *    shell-level `</dev/tty` re-attach DOESN'T work under Bun — input from a
 *    redirect-opened tty never arrives (reproduced for bun-run AND compiled,
 *    read-only and read-write). Opening /dev/tty OURSELVES as a tty.ReadStream
 *    DOES deliver input, so when stdin isn't a terminal but stdout is, we
 *    replace process.stdin with our own terminal stream (clack reads
 *    process.stdin at prompt time). Destroyed after runMain so non-interactive
 *    commands still exit cleanly.
 * 2. A 0-width terminal (some CI/expect PTYs) makes clack's erase-lines math
 *    go infinite and OOM the process at ~16GB (reproduced). If stdout claims
 *    to be a tty with no columns, ask the terminal via `stty size`, else pin
 *    a sane 80×24.
 */
let ttyStdin: tty.ReadStream | undefined;
if (!process.stdin.isTTY && process.stdout.isTTY) {
  try {
    ttyStdin = new tty.ReadStream(openSync("/dev/tty", "r+"));
    ttyStdin.pause();
    Object.defineProperty(process, "stdin", { value: ttyStdin, configurable: true });
  } catch {
    // Truly headless (no controlling terminal): leave stdin as-is; the
    // interactive commands' guards produce a clear message.
  }
}
if (process.stdout.isTTY && !process.stdout.columns) {
  let cols = 0;
  let rows = 0;
  try {
    const r = Bun.spawnSync(["sh", "-c", "stty size </dev/tty 2>/dev/null"]);
    const parts = r.stdout.toString().trim().split(/\s+/);
    if (parts.length === 2) {
      rows = Number(parts[0]) || 0;
      cols = Number(parts[1]) || 0;
    }
  } catch {
    // fall through to the pinned default
  }
  Object.defineProperty(process.stdout, "columns", { value: cols || 80, configurable: true });
  Object.defineProperty(process.stdout, "rows", { value: rows || 24, configurable: true });
}

const main = defineCommand({
  meta: {
    name: "envsetup",
    version: "0.1.2",
    description: "One-command Mac environment setup",
  },
  subCommands: {
    auth: () => import("./commands/auth.ts").then((m) => m.default),
    connect: () => import("./commands/connect.ts").then((m) => m.default),
    doctor: () => import("./commands/doctor.ts").then((m) => m.default),
    sync: () => import("./commands/sync.ts").then((m) => m.default),
    secrets: () => import("./commands/secrets.ts").then((m) => m.default),
  },
  args: {
    "show-installed": {
      type: "boolean",
      description:
        "Show already-installed items as toggleable options (for inspecting the dependency cascade)",
    },
    defaults: {
      type: "boolean",
      description: "Skip per-app config screens, accepting defaults",
    },
  },
  async run({ rawArgs, args }) {
    // citty invokes the root run() even when a subcommand matched — only
    // bootstrap when the invocation is bare.
    const sub = rawArgs.find((a) => !a.startsWith("-"));
    if (sub !== undefined) return;
    const { bootstrap } = await import("./commands/bootstrap.ts");
    await bootstrap({
      showInstalled: args["show-installed"] === true,
      acceptDefaults: args.defaults === true,
    });
  },
});

await runMain(main);
// Release the self-opened terminal so the event loop can drain (otherwise a
// non-interactive command that never read stdin would hang at exit).
ttyStdin?.destroy();
