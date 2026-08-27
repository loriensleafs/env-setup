import { z } from "zod";
import { defineItem } from "../item.ts";

const DOMAIN = "com.superduper.superwhisper";

/**
 * Push-to-talk hotkey choices. The app stores the key as
 * `{"carbonKeyCode":N,"mouseButtonNumbers":[],"carbonModifiers":M}` where the
 * keyCode picks the physical key and the modifier is the generic Carbon bit
 * (optionKey 2048, cmdKey 256, controlKey 4096). Captured from Peter's machine:
 * Right-Option (61/2048).
 */
const PTT_KEYS = {
  "right-option": { carbonKeyCode: 61, carbonModifiers: 2048 },
  "left-option": { carbonKeyCode: 58, carbonModifiers: 2048 },
  "right-command": { carbonKeyCode: 54, carbonModifiers: 256 },
  "right-control": { carbonKeyCode: 62, carbonModifiers: 4096 },
} as const;
export type PushToTalkKey = keyof typeof PTT_KEYS;

function pttValue(key: PushToTalkKey): string {
  const { carbonKeyCode, carbonModifiers } = PTT_KEYS[key];
  return JSON.stringify({ carbonKeyCode, mouseButtonNumbers: [], carbonModifiers });
}

export const superwhisperConfigSchema = z.object({
  /** Hold this key to talk. */
  pushToTalk: z
    .enum(["right-option", "left-option", "right-command", "right-control"])
    .default("right-option"),
  /** Keep the mini recorder visible even when idle. */
  alwaysShowMiniRecorder: z.boolean().default(true),
  /** Show superwhisper in the macOS Dock. Off = menu bar only. */
  showInDock: z.boolean().default(false),
  /** Expose experimental / preview models in the model picker. */
  showExperimentalModels: z.boolean().default(true),
  /** Show the larger recording view (off = mini recorder only). */
  recordingView: z.boolean().default(false),
  /** Automatically check for (and install) app updates via Sparkle. */
  autoUpdate: z.boolean().default(true),
});
export type SuperwhisperConfig = z.infer<typeof superwhisperConfigSchema>;

export const superwhisperConfig = defineItem<SuperwhisperConfig>({
  id: "superwhisper-config",
  title: "superwhisper configuration",
  kind: "config-only",
  deps: ["superwhisper"],
  configSchema: superwhisperConfigSchema,
  defaultConfig: superwhisperConfigSchema.parse({}),
  ceremonies: [
    { id: "superwhisper-signin", title: "Sign in to superwhisper (license on clipboard)" },
    { id: "superwhisper-permissions", title: "Grant microphone + accessibility permissions" },
  ],
  // Drift-aware: compares EVERY written key against the effective config (from
  // the manifest, or the schema defaults) — including the push-to-talk hotkey,
  // the item's primary feature. Reads the manifest config so a user override
  // (e.g. showInDock:true) is honored rather than hardcoded.
  detect: async (ctx) => ({ installed: await matchesConfig(ctx, effectiveConfig(ctx)) }),
  configure: async (ctx, config) => {
    for (const [key, expected] of expectedReads(config)) {
      const flag = key === "KeyboardShortcuts_pushToTalk" ? "-string" : "-bool";
      const value = flag === "-bool" ? (expected === "1" ? "true" : "false") : expected;
      const r = await ctx.run(["defaults", "write", DOMAIN, key, flag, value]);
      if (r.exitCode !== 0) throw new Error(`defaults write ${key} failed: ${r.stderr.trim()}`);
    }
    ctx.log(
      `push-to-talk: hold ${config.pushToTalk.replace("-", " ")}; sign-in + permissions happen in the connect phase`,
    );
  },
  verify: (ctx) => matchesConfig(ctx, effectiveConfig(ctx)),
});

/** The config the manifest records for this item, or the schema defaults. */
function effectiveConfig(ctx: {
  manifest: { items: Record<string, { config?: unknown }> };
}): SuperwhisperConfig {
  const raw = ctx.manifest.items["superwhisper-config"]?.config;
  return superwhisperConfigSchema.parse(raw ?? {});
}

/** [key, expected `defaults read` output] for a config — bools read back as "1"/"0". */
function expectedReads(config: SuperwhisperConfig): [string, string][] {
  const b = (v: boolean) => (v ? "1" : "0");
  return [
    ["KeyboardShortcuts_pushToTalk", pttValue(config.pushToTalk)],
    ["alwaysShowMiniRecorder", b(config.alwaysShowMiniRecorder)],
    ["showApplicationInDock", b(config.showInDock)],
    ["showExperimentalModels", b(config.showExperimentalModels)],
    ["recordingViewEnabled", b(config.recordingView)],
    // Sparkle auto-update (superwhisper bundles Sparkle.framework).
    ["SUEnableAutomaticChecks", b(config.autoUpdate)],
    ["SUAutomaticallyUpdate", b(config.autoUpdate)],
  ];
}

async function matchesConfig(
  ctx: { run: (c: string[]) => Promise<{ exitCode: number; stdout: string }> },
  config: SuperwhisperConfig,
): Promise<boolean> {
  for (const [key, expected] of expectedReads(config)) {
    const r = await ctx.run(["defaults", "read", DOMAIN, key]);
    if (r.exitCode !== 0 || r.stdout.trim() !== expected) return false;
  }
  return true;
}
