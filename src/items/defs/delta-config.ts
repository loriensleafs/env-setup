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

async function readKeys(ctx: {
  run: (c: string[]) => Promise<{ stdout: string }>;
}): Promise<{ matches: boolean; anyPresent: boolean }> {
  let matches = true;
  let anyPresent = false;
  for (const [key, value] of GIT_CONFIG) {
    const r = await ctx.run(["git", "config", "--global", key]);
    const current = r.stdout.trim();
    if (current !== "") anyPresent = true;
    if (current !== value) matches = false;
  }
  return { matches, anyPresent };
}

export const deltaConfig = defineItem({
  id: "delta-config",
  title: "delta git integration (pager, navigate, line numbers)",
  kind: "config-only",
  deps: ["delta", "git-identity"], // needs the binary + git identity established first
  // Drift-aware: EVERY written key must match, not just core.pager. `differs`
  // = some git config is present but doesn't match (vs never configured).
  detect: async (ctx) => {
    const s = await readKeys(ctx);
    return { installed: s.matches, ...(!s.matches && s.anyPresent ? { differs: true } : {}) };
  },
  configure: async (ctx) => {
    for (const [key, value] of GIT_CONFIG) {
      const r = await ctx.run(["git", "config", "--global", key, value]);
      if (r.exitCode !== 0) throw new Error(`git config ${key} failed: ${r.stderr.trim()}`);
    }
    ctx.log("delta wired as git pager (n/N to navigate diffs)");
  },
  verify: async (ctx) => (await readKeys(ctx)).matches,
});
