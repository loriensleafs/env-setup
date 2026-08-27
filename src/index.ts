import { defineCommand, runMain } from "citty";

const main = defineCommand({
  meta: {
    name: "envsetup",
    version: "0.0.1",
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

runMain(main);
