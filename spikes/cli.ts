import { defineCommand, runMain } from "citty";
const doctor = defineCommand({ meta: { name: "doctor" }, run() { console.log("DOCTOR-RAN"); } });
const main = defineCommand({
  meta: { name: "envsetup", version: "0.0.1", description: "spike" },
  subCommands: { doctor },
  run() { console.log("ROOT-RAN"); },
});
runMain(main);
