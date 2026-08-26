import { defineItem } from "../item.ts";
import { getSecret, SECRET_KEYS } from "../../secrets/secrets.ts";

/**
 * CleanShot X: its defaults keys are undocumented and the app wasn't present
 * on the reference machine to inspect (docs/PLAN.md). Until a configured
 * machine exists to capture from, this item covers license activation as a
 * ceremony; the decided settings (shortcut takeover, ~/Screenshots, overlay,
 * PNG, no shadows, freeze-screen, no auto-copy, launch at login) are applied
 * manually once, then captured into real defaults writes for sync/doctor.
 */
export const cleanshotConfig = defineItem({
  id: "cleanshot-config",
  title: "CleanShot X configuration",
  kind: "config-only",
  deps: ["cleanshot"],
  ceremonies: [
    { id: "cleanshot-license", title: "Activate CleanShot license (key on clipboard)" },
    { id: "cleanshot-settings", title: "Apply decided CleanShot settings (guided checklist)" },
  ],
  detect: async (ctx) => {
    // Licensed state is the observable signal until settings keys are captured.
    const r = await ctx.run(["defaults", "read", "pl.maketheweb.cleanshotx"]);
    return { installed: r.exitCode === 0 && r.stdout.includes("license") };
  },
  configure: async (ctx) => {
    if ((await getSecret(SECRET_KEYS.cleanshotLicense)) === null) {
      ctx.log("no CleanShot license in the secret store — ceremony will ask for manual entry");
    }
    ctx.log("settings applied via guided ceremony until defaults keys are captured");
  },
});
