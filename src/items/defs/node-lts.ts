import { defineItem } from "../item.ts";
import { BREW } from "../factories/brew.ts";

const FNM = "/opt/homebrew/bin/fnm";

/** Node LTS managed by fnm (which is itself a brew item). */
export const nodeLts = defineItem({
  id: "node-lts",
  title: "Node.js LTS (via fnm)",
  kind: "installer-script",
  required: true,
  deps: ["fnm"],
  detect: async (ctx) => {
    const r = await ctx.run([FNM, "ls"]);
    if (r.exitCode !== 0) return { installed: false };
    const hasLts = /lts/i.test(r.stdout) || /v\d+/.test(r.stdout);
    const version = r.stdout.match(/v(\d+\.\d+\.\d+)/)?.[1];
    return { installed: hasLts, version };
  },
  install: async (ctx) => {
    const i = await ctx.run([FNM, "install", "--lts"]);
    if (i.exitCode !== 0) throw new Error(`fnm install --lts failed: ${i.stderr.trim()}`);
    const d = await ctx.run([FNM, "default", "lts-latest"]);
    if (d.exitCode !== 0) throw new Error(`fnm default failed: ${d.stderr.trim()}`);
    // Enable corepack → pnpm/yarn available on demand (bundled with Node; the
    // modern way to get them without pinning a global version).
    await ctx.run(["/bin/zsh", "-lc", "corepack enable 2>/dev/null || true"]);
    ctx.log("corepack enabled — pnpm/yarn available via `corepack prepare`");
  },
  verify: async (ctx) => (await ctx.run([FNM, "ls"])).exitCode === 0,
});
