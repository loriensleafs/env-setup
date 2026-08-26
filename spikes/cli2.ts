import { defineCommand, runMain } from "citty";
const main = defineCommand({
  meta: { name: "t", version: "1.0.0" },
  args: {
    level: { type: "enum", options: ["low", "high"], default: "low" },
    force: { type: "boolean", alias: ["f"] },
    dir: { type: "string", default: "~/Dev" },
  },
  run({ args }) { console.log("ARGS", JSON.stringify({ level: args.level, force: args.force, dir: args.dir })); },
});
runMain(main);
