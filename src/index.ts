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
  async run() {
    const { bootstrap } = await import("./commands/bootstrap.ts");
    await bootstrap();
  },
});

runMain(main);
