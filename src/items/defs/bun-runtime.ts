import { homedir } from "node:os";
import { defineItem } from "../item.ts";

const BUN_BIN = `${homedir()}/.bun/bin/bun`;

/** Official installer (docs-primary; preserves `bun upgrade` self-update). */
export const bunRuntime = defineItem({
  id: "bun",
  title: "Bun",
  kind: "installer-script",
  required: true,
  zsh: () => ({
    comment: "bun",
    env: ['export PATH="$HOME/.bun/bin:$PATH"'],
    init: ['[ -s "$HOME/.bun/_bun" ] && source "$HOME/.bun/_bun"'],
  }),
  detect: async (ctx) => {
    for (const bin of [BUN_BIN, "bun"]) {
      const r = await ctx.run([bin, "--version"]);
      if (r.exitCode === 0) return { installed: true, version: r.stdout.trim() };
    }
    return { installed: false };
  },
  install: async (ctx) => {
    // NO_INSTALL_HINTS: our dotfiles step owns the PATH line, not the installer.
    const r = await ctx.run(["/bin/bash", "-c", "curl -fsSL https://bun.com/install | bash"], {
      env: { NO_INSTALL_HINTS: "1", SHELL: "" },
    });
    if (r.exitCode !== 0) throw new Error(`bun install failed: ${r.stderr.slice(-500)}`);
  },
  verify: async (ctx) => (await ctx.run([BUN_BIN, "--version"])).exitCode === 0,
});
