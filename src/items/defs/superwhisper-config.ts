import { defineItem, type ItemContext } from "../item.ts";

const DOMAIN = "com.superduper.superwhisper";

/** Captured from Peter's configured machine (docs/PLAN.md superwhisper). */
const SETTINGS: [string, string[]][] = [
  // Hold RIGHT-COMMAND to talk (carbonKeyCode 54, modifiers 256).
  [
    "KeyboardShortcuts_pushToTalk",
    ["-string", '{"carbonModifiers":256,"mouseButtonNumbers":[],"carbonKeyCode":54}'],
  ],
  ["alwaysShowMiniRecorder", ["-bool", "true"]],
  ["showApplicationInDock", ["-bool", "false"]],
  ["showExperimentalModels", ["-bool", "true"]],
];

export const superwhisperConfig = defineItem({
  id: "superwhisper-config",
  title: "superwhisper configuration",
  kind: "config-only",
  deps: ["superwhisper"],
  ceremonies: [
    { id: "superwhisper-signin", title: "Sign in to superwhisper (license on clipboard)" },
    { id: "superwhisper-permissions", title: "Grant microphone + accessibility permissions" },
  ],
  detect: async (ctx) => {
    const r = await ctx.run(["defaults", "read", DOMAIN, "alwaysShowMiniRecorder"]);
    if (r.exitCode !== 0 || r.stdout.trim() !== "1") return { installed: false };
    const dock = await ctx.run(["defaults", "read", DOMAIN, "showApplicationInDock"]);
    return { installed: dock.stdout.trim() === "0" };
  },
  configure: async (ctx) => {
    for (const [key, args] of SETTINGS) {
      const r = await ctx.run(["defaults", "write", DOMAIN, key, ...args]);
      if (r.exitCode !== 0) throw new Error(`defaults write ${key} failed: ${r.stderr.trim()}`);
    }
    ctx.log("push-to-talk: hold right-⌘; sign-in + permissions happen in the connect phase");
  },
  verify: async (ctx) =>
    (await ctx.run(["defaults", "read", DOMAIN, "alwaysShowMiniRecorder"])).stdout.trim() === "1",
});
