import { homedir } from "node:os";
import { defineItem } from "../item.ts";

/** Official standalone installer (docs-primary; preserves `uv self update`). */
export const uv = defineItem({
  id: "uv",
  title: "uv (Python)",
  kind: "installer-script",
  required: true,
  detect: async (ctx) => {
    for (const bin of [`${homedir()}/.local/bin/uv`, "uv"]) {
      const r = await ctx.run([bin, "--version"]);
      if (r.exitCode === 0) return { installed: true, version: r.stdout.match(/uv\s+(\S+)/)?.[1] };
    }
    return { installed: false };
  },
  install: async (ctx) => {
    const r = await ctx.run(["/bin/bash", "-c", "curl -LsSf https://astral.sh/uv/install.sh | sh"], {
      env: { UV_NO_MODIFY_PATH: "1" },
    });
    if (r.exitCode !== 0) throw new Error(`uv install failed: ${r.stderr.slice(-500)}`);
  },
  verify: async (ctx) =>
    (await ctx.run([`${homedir()}/.local/bin/uv`, "--version"])).exitCode === 0,
});
