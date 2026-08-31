import { defineCommand, runMain } from "citty";
import { closePromptInput } from "./ui/terminal.ts";

/**
 * 0-width-terminal guard (empirically verified 2026-08-27): some PTYs (CI,
 * expect defaults) report a tty with 0 columns, which sends clack's
 * erase-lines math to infinity — the process balloons to ~16GB and dies with
 * "RangeError: Out of memory" (reproduced). If stdout claims a tty with no
 * columns, ask the terminal via `stty size`, else pin a sane 80×24.
 *
 * (Interactive input under `curl … | sh` is handled separately: every prompt
 * threads `input: promptInput()` — see src/ui/terminal.ts for why.)
 */
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
    version: "0.1.7",
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
// command that opened /dev/tty for prompts would hang at exit).
closePromptInput();
