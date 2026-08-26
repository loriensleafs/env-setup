import { defineCommand, runMain } from "citty";

const main = defineCommand({
  meta: {
    name: "envsetup",
    version: "0.0.1",
    description: "One-command Mac environment setup",
  },
  subCommands: {
    doctor: () => import("./commands/doctor.ts").then((m) => m.default),
    sync: () => import("./commands/sync.ts").then((m) => m.default),
    secrets: () => import("./commands/secrets.ts").then((m) => m.default),
  },
  args: {
    "dry-run": { type: "boolean", description: "Plan and write the manifest, install nothing" },
    "show-installed": {
      type: "boolean",
      description: "Show already-installed items as toggleable options (for inspecting the dependency cascade)",
    },
  },
  async run({ rawArgs, args }) {
    // citty invokes the root run() even when a subcommand matched — only
    // bootstrap when the invocation is bare.
    const sub = rawArgs.find((a) => !a.startsWith("-"));
    if (sub !== undefined) return;
    const { bootstrap } = await import("./commands/bootstrap.ts");
    await bootstrap({ dryRun: args["dry-run"] === true, showInstalled: args["show-installed"] === true });
  },
});

runMain(main);
