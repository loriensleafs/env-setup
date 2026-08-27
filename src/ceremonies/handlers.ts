import * as p from "@clack/prompts";
import color from "picocolors";
import type { Runner } from "../exec/run.ts";
import { getSecret, SECRET_KEYS } from "../secrets/secrets.ts";

export interface CeremonyContext {
  run: Runner;
}

export interface CeremonyHandler {
  /** Returns true when completed (or already satisfied), false when skipped. */
  run(ctx: CeremonyContext): Promise<boolean>;
}

async function clipboard(text: string): Promise<void> {
  const proc = Bun.spawn(["pbcopy"], { stdin: "pipe" });
  proc.stdin.write(text);
  await proc.stdin.end();
  await proc.exited;
}

async function confirmDone(message: string): Promise<boolean> {
  const done = await p.confirm({ message });
  return !p.isCancel(done) && done === true;
}

function licenseCeremony(secretKey: string, appName: string, appPath: string): CeremonyHandler {
  return {
    async run(ctx) {
      const key = await getSecret(secretKey);
      if (key === null) {
        p.log.warn(
          `no ${appName} license in the secret store — run \`envsetup secrets unlock\` first, or enter it manually`,
        );
      } else {
        await clipboard(key);
        p.log.info(`${appName} license copied to clipboard`);
      }
      await ctx.run(["open", appPath]);
      return confirmDone(`${appName} activated?`);
    },
  };
}

export const HANDLERS: Record<string, CeremonyHandler> = {
  "typora-license": licenseCeremony(
    SECRET_KEYS.typoraLicense,
    "Typora",
    "/Applications/Typora.app",
  ),
  "cleanshot-verify": {
    async run(ctx) {
      p.log.info("CleanShot was licensed + configured from the manifest — verifying it took");
      await ctx.run(["open", "/Applications/CleanShot X.app"]);
      p.note(
        "Grant SCREEN RECORDING when it asks.\nIf it still shows a trial, the key is in the secret store: `envsetup secrets show`.",
        "CleanShot",
      );
      return confirmDone("CleanShot activated with screen-recording granted?");
    },
  },
  "superwhisper-signin": licenseCeremony(
    SECRET_KEYS.superwhisperLicense,
    "superwhisper",
    "/Applications/superwhisper.app",
  ),

  "superwhisper-permissions": {
    async run(ctx) {
      p.note(
        "superwhisper needs Microphone and Accessibility access.\nBoth panes open now — flip the toggles for superwhisper.",
        "permissions",
      );
      await ctx.run([
        "open",
        "x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone",
      ]);
      await ctx.run([
        "open",
        "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility",
      ]);
      return confirmDone("both permissions granted?");
    },
  },

  "chrome-default-browser": {
    async run(ctx) {
      p.log.info("Chrome will ask macOS to become the default — approve the system dialog");
      await ctx.run(["open", "-a", "Google Chrome", "--args", "--make-default-browser"]);
      return confirmDone("default-browser dialog approved?");
    },
  },

  "chrome-signin": {
    async run(ctx) {
      p.log.info("Sign in to Chrome (sync brings bookmarks + extensions; web apps install after)");
      await ctx.run(["open", "-a", "Google Chrome", "https://accounts.google.com"]);
      return confirmDone("signed in with sync on?");
    },
  },

  "claude-login": {
    async run(ctx) {
      p.note(
        "Run `claude` in a terminal — it walks through sign-in on first launch.",
        "Claude Code",
      );
      await ctx.run(["open", "-a", "Ghostty"]);
      return confirmDone("Claude Code signed in?");
    },
  },

  "cursor-models": {
    async run(ctx) {
      p.note(
        "Cursor → Settings → Models:\n• enable ONLY Haiku 4.5, Sonnet 5, Opus 5, Fable 5\n• default agent model: Opus 5\n(model gating is app-state — not scriptable)",
        "Cursor models",
      );
      await ctx.run(["open", "-a", "Cursor"]);
      return confirmDone("models configured?");
    },
  },

  "raycast-onboarding": {
    async run(ctx) {
      p.note(
        "Finish Raycast onboarding (⌘Space is already bound).\nRecommended starter extensions: Brew, GitHub, Kill Process.\nSet clipboard history to ⌥V in Raycast settings.",
        "Raycast",
      );
      await ctx.run(["open", "-a", "Raycast"]);
      return confirmDone("Raycast set up?");
    },
  },

  "chrome-pwas-install": {
    async run(ctx) {
      const { PWAS, writeSwiftHelper } = await import("../items/chrome/chrome-pwas.ts");
      const swiftPath = await writeSwiftHelper();
      p.note(
        "This drives Chrome to install 4 web apps.\nGrant Accessibility to this terminal if macOS prompts (System Settings → Privacy & Security → Accessibility).",
        "web apps",
      );
      let ok = 0;
      for (const app of PWAS) {
        const s = p.spinner();
        s.start(`Installing ${app.name}`);
        const r = await ctx.run(["swift", swiftPath, app.url, app.name]);
        if (r.exitCode === 0 && /OK installed/.test(r.stdout)) {
          ok++;
          s.stop(`${app.name} installed`);
        } else {
          s.stop(`${app.name} failed: ${(r.stdout + r.stderr).trim().split("\n").pop()}`);
        }
      }
      p.log.info("run `envsetup sync` to add them to the Dock");
      return ok === PWAS.length;
    },
  },

  "better-display-license": {
    async run(ctx) {
      const key = await getSecret(SECRET_KEYS.betterDisplayLicense);
      if (key === null) {
        p.log.warn(
          "no BetterDisplay license in the store — run `envsetup secrets unlock` first, or paste it manually",
        );
      } else {
        const pb = Bun.spawn(["pbcopy"], { stdin: "pipe" });
        pb.stdin.write(key);
        await pb.stdin.end();
        await pb.exited;
        p.log.info("BetterDisplay license copied to clipboard");
      }
      p.note(
        "BetterDisplay validates licenses online (Paddle) — no scriptable path.\nIn the app: open Settings, find the license/purchase section, and paste\n(\u2318V) the key. It activates over the network.\n\nIf \u2318V does nothing: with the Dock icon hidden the app has no Edit menu\n(waydabber #2228). Keep the Settings window open — the Dock icon auto-shows\nand \u2318V works again — or right-click the field and choose Paste.",
        "BetterDisplay license",
      );
      await ctx.run(["open", "/Applications/BetterDisplay.app"]);
      return confirmDone("BetterDisplay activated (shows as licensed)?");
    },
  },
  "better-display-settings": {
    async run(ctx) {
      p.note(
        "BetterDisplay's useful config is per-display (HiDPI/scaling, brightness,\nXDR). Set up your displays now; it's remembered per-machine.",
        "BetterDisplay",
      );
      await ctx.run(["open", "/Applications/BetterDisplay.app"]);
      return confirmDone("displays configured?");
    },
  },

  "accessibility-grant": {
    async run(ctx) {
      p.note(
        [
          "macOS won't let any tool flip these (SIP-protected) — but here they are",
          "in ONE place. Opening Accessibility now; enable ALL of these together:",
          "  \u2022 your terminal (Ghostty)  \u2014 envsetup's Chrome + Finder automation",
          "  \u2022 superwhisper             \u2014 dictation",
          "  \u2022 BetterDisplay            \u2014 display control",
          "Then Screen Recording (opens next) for CleanShot + Zoom.",
        ].join("\n"),
        "Permissions \u2014 one pass",
      );
      await ctx.run([
        "open",
        "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility",
      ]);
      const acc = await confirmDone("Accessibility enabled for all of the above?");
      await ctx.run([
        "open",
        "x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture",
      ]);
      const rec = await confirmDone("Screen Recording enabled for CleanShot + Zoom?");
      return acc && rec;
    },
  },

  "github-device-flow": {
    async run() {
      // Handled by the github-auth item / `envsetup auth`; nothing to do here.
      p.log.success("GitHub sign-in already handled");
      return true;
    },
  },
};

export function handlerFor(id: string): CeremonyHandler | undefined {
  return HANDLERS[id];
}

export function fallbackHandler(title: string): CeremonyHandler {
  return {
    async run() {
      p.note(title, "manual step");
      return confirmDone("done?");
    },
  };
}

export { color };
