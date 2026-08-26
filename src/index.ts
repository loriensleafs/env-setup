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
  async run({ rawArgs }) {
    // citty invokes the root run() even when a subcommand matched — only
    // bootstrap when the invocation is bare.
    const sub = rawArgs.find((a) => !a.startsWith("-"));
    if (sub !== undefined) return;
    const { bootstrap } = await import("./commands/bootstrap.ts");
    await bootstrap();
  },
});

runMain(main);
