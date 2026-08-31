import { defineItem, type ItemContext } from "../item.ts";

const DOCKUTIL = "/opt/homebrew/bin/dockutil";

/** Peter's decided Dock order (docs/plan/PRD-001-envsetup.md). PWAs join once Chrome installs them. */
export const DOCK_APPS: { label: string; path: string }[] = [
  // Finder is pinned first by macOS itself.
  { label: "Apps", path: "/Applications" },
  { label: "System Settings", path: "/System/Applications/System Settings.app" },
  { label: "Ghostty", path: "/Applications/Ghostty.app" },
  { label: "Cursor", path: "/Applications/Cursor.app" },
  { label: "Typora", path: "/Applications/Typora.app" },
  { label: "Claude", path: "/Applications/Claude.app" },
  { label: "Chrome", path: "/Applications/Google Chrome.app" },
  { label: "Mail", path: "~/Applications/Chrome Apps.localized/Mail.app" },
  { label: "Calendar", path: "~/Applications/Chrome Apps.localized/Calendar.app" },
  { label: "Drive", path: "~/Applications/Chrome Apps.localized/Drive.app" },
  { label: "Notes", path: "~/Applications/Chrome Apps.localized/Notes.app" },
];

async function exists(ctx: ItemContext, path: string): Promise<boolean> {
  return (await ctx.run(["ls", path.replace("~", process.env.HOME ?? "~")])).exitCode === 0;
}

export const dock = defineItem({
  id: "dock",
  title: "Dock layout",
  kind: "system",
  // dockutil is a hard dep; the apps/PWAs are ordering-only (filtered to the
  // selection) so the Dock is built AFTER they're installed and is complete on
  // the first pass — absent ones are still skipped gracefully.
  deps: ["dockutil", "ghostty", "cursor", "typora", "claude-desktop", "chrome", "chrome-pwas"],
  detect: async (ctx) => {
    const r = await ctx.run([DOCKUTIL, "--list"]);
    if (r.exitCode !== 0) return { installed: false };
    const listed = r.stdout;
    const expected = [];
    for (const app of DOCK_APPS) {
      if (await exists(ctx, app.path)) expected.push(app.label);
    }
    const inOrder = expected.every((label) => listed.includes(label));
    const recentsOff =
      (await ctx.run(["defaults", "read", "com.apple.dock", "show-recents"])).stdout.trim() === "0";
    return { installed: inOrder && recentsOff };
  },
  configure: async (ctx) => {
    await ctx.run(["defaults", "write", "com.apple.dock", "show-recents", "-bool", "false"]);
    await ctx.run(["defaults", "write", "com.apple.dock", "orientation", "-string", "bottom"]);
    const clear = await ctx.run([DOCKUTIL, "--remove", "all", "--no-restart"]);
    if (clear.exitCode !== 0) throw new Error(`dockutil clear failed: ${clear.stderr.trim()}`);
    for (const app of DOCK_APPS) {
      const path = app.path.replace("~", process.env.HOME ?? "~");
      if (!(await exists(ctx, path))) {
        ctx.log(`${app.label} not present yet — skipped (sync adds it later)`);
        continue;
      }
      const add = await ctx.run([DOCKUTIL, "--add", path, "--no-restart"]);
      if (add.exitCode !== 0)
        throw new Error(`dockutil add ${app.label} failed: ${add.stderr.trim()}`);
    }
    await ctx.run(["killall", "Dock"]);
  },
  verify: async (ctx) => (await ctx.run([DOCKUTIL, "--list"])).exitCode === 0,
});
