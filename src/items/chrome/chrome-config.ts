import { homedir } from "node:os";
import { join } from "node:path";
import { mkdir } from "node:fs/promises";
import { defineItem, type ItemContext } from "../item.ts";
import { CHROME_FLAGS, PINNED_ACTIONS, PINNED_EXTENSIONS } from "./chrome-defaults.ts";

const CHROME_DIR = join(homedir(), "Library", "Application Support", "Google", "Chrome");
const LOCAL_STATE = join(CHROME_DIR, "Local State");
const PREFERENCES = join(CHROME_DIR, "Default", "Preferences");

async function readJson(path: string): Promise<Record<string, unknown> | null> {
  const file = Bun.file(path);
  if (!(await file.exists())) return null;
  try {
    return (await file.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function chromeRunning(ctx: ItemContext): Promise<boolean> {
  // Match ONLY stable ("Google Chrome"), not Beta/Dev/helpers.
  const r = await ctx.run(["pgrep", "-x", "Google Chrome"]);
  return r.exitCode === 0;
}

function arraysEqual(a: unknown, b: string[]): boolean {
  return Array.isArray(a) && a.length === b.length && b.every((v, i) => a[i] === v);
}

/**
 * Applies Peter's Chrome customization: 81 flags (Local State — unprotected),
 * pinned toolbar actions + pinned Claude extension (Preferences — empirically
 * verified unprotected 2026-08-26). Sign-in/sync/bookmarks are Stage C.
 * Chrome must be closed; the files are rewritten in place, preserving
 * everything else in them.
 */
export const chromeConfig = defineItem({
  id: "chrome-config",
  title: "Chrome customization (flags, toolbar)",
  kind: "config-only",
  deps: ["chrome"],
  ceremonies: [
    { id: "chrome-signin", title: "Sign in to Chrome (sync)" },
    { id: "chrome-default-browser", title: "Make Chrome the default browser" },
  ],
  detect: async () => {
    const ls = await readJson(LOCAL_STATE);
    const prefs = await readJson(PREFERENCES);
    if (!ls || !prefs) return { installed: false };
    const flags = (ls.browser as Record<string, unknown> | undefined)?.enabled_labs_experiments;
    const toolbar = (prefs.toolbar as Record<string, unknown> | undefined)?.pinned_actions;
    const pinnedExt = (prefs.extensions as Record<string, unknown> | undefined)?.pinned_extensions;
    return {
      installed:
        arraysEqual(flags, CHROME_FLAGS) &&
        arraysEqual(toolbar, PINNED_ACTIONS) &&
        arraysEqual(pinnedExt, PINNED_EXTENSIONS),
    };
  },
  configure: async (ctx) => {
    if (await chromeRunning(ctx)) {
      throw new Error("Chrome is running — quit it and retry (its files can't be edited live)");
    }
    // Local State: flags. File may not exist before first launch — create shell.
    const ls = (await readJson(LOCAL_STATE)) ?? {};
    const browser = (ls.browser as Record<string, unknown> | undefined) ?? {};
    browser.enabled_labs_experiments = CHROME_FLAGS;
    ls.browser = browser;
    await mkdir(join(LOCAL_STATE, ".."), { recursive: true });
    await Bun.write(LOCAL_STATE, JSON.stringify(ls));

    // Preferences: toolbar + pinned extensions + tab-search placement.
    const prefs = (await readJson(PREFERENCES)) ?? {};
    prefs.toolbar = { ...(prefs.toolbar as object | undefined), pinned_actions: PINNED_ACTIONS };
    prefs.extensions = {
      ...(prefs.extensions as object | undefined),
      pinned_extensions: PINNED_EXTENSIONS,
    };
    prefs.tab_search = { ...(prefs.tab_search as object | undefined), pinned_to_tabstrip: true };
    await mkdir(join(PREFERENCES, ".."), { recursive: true });
    await Bun.write(PREFERENCES, JSON.stringify(prefs));
    ctx.log("flags + toolbar applied; sign-in and sync happen in the connect phase");
  },
  verify: async () => {
    const ls = await readJson(LOCAL_STATE);
    return arraysEqual(
      (ls?.browser as Record<string, unknown> | undefined)?.enabled_labs_experiments,
      CHROME_FLAGS,
    );
  },
});
