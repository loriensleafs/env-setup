import { defineItem } from "../item.ts";

/**
 * Auth gate: private clones and API work depend on this. Today detect-only
 * (satisfied when `gh auth status` passes); the in-tool device flow lands
 * with the auth round and replaces the manual instruction.
 */
export const githubAuth = defineItem({
  id: "github-auth",
  title: "GitHub sign-in",
  kind: "system",
  deps: ["gh"],
  ceremonies: [{ id: "github-device-flow", title: "Approve GitHub sign-in in the browser" }],
  detect: async (ctx) => {
    const r = await ctx.run(["/opt/homebrew/bin/gh", "auth", "status"]);
    return { installed: r.exitCode === 0 };
  },
  install: async (ctx) => {
    const r = await ctx.run(["/opt/homebrew/bin/gh", "auth", "status"]);
    if (r.exitCode !== 0) {
      throw new Error("GitHub auth needed — run `gh auth login --web` and re-run (device flow lands in the auth phase)");
    }
  },
});
