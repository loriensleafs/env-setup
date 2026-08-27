import { defineItem } from "../item.ts";

/**
 * Wires the installed `delta` (git-delta) binary into git as the diff/pager.
 * delta is inert until git's pager points at it — this is the "installed but
 * not connected" gap the dependency audit caught. Co-located as its own item so
 * it only runs when delta is selected (deps: ["delta"]).
 *
 * Decided config (Peter, full setup): syntax-highlighted diffs, n/N navigation,
 * line numbers, and zdiff3 3-way merge conflict style.
 */
const GIT_CONFIG: [string, string][] = [
  ["core.pager", "delta"],
  ["interactive.diffFilter", "delta --color-only"],
  ["delta.navigate", "true"],
  ["delta.line-numbers", "true"],
  ["merge.conflictstyle", "zdiff3"],
];

async function allKeysMatch(ctx: {
  run: (c: string[]) => Promise<{ stdout: string }>;
}): Promise<boolean> {
  const checks = await Promise.all(
    GIT_CONFIG.map(async ([key, value]) => {
      const r = await ctx.run(["git", "config", "--global", key]);
      return r.stdout.trim() === value;
    }),
  );
  return checks.every(Boolean);
}

export const deltaConfig = defineItem({
  id: "delta-config",
  title: "delta git integration (pager, navigate, line numbers)",
  kind: "config-only",
  deps: ["delta", "git-identity"], // needs the binary + git identity established first
  // detect and verify are the same: EVERY written key must match (drift-aware),
  // not just core.pager — otherwise doctor misses a reverted navigate/line-numbers.
  detect: async (ctx) => ({ installed: await allKeysMatch(ctx) }),
  configure: async (ctx) => {
    for (const [key, value] of GIT_CONFIG) {
      const r = await ctx.run(["git", "config", "--global", key, value]);
      if (r.exitCode !== 0) throw new Error(`git config ${key} failed: ${r.stderr.trim()}`);
    }
    ctx.log("delta wired as git pager (n/N to navigate diffs)");
  },
  verify: (ctx) => allKeysMatch(ctx),
});
