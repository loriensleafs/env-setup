import { defineItem } from "../item.ts";
import { githubAuthCeremony } from "../../auth/auth-ceremony.ts";

/**
 * Auth gate: private clones and API work depend on this. Satisfied when gh is
 * authenticated; otherwise runs the device-flow ceremony (envsetup's own app
 * identity) when a terminal is attached.
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
    if (r.exitCode === 0) return;
    if (!process.stdout.isTTY) {
      throw new Error("GitHub sign-in needed — run envsetup in a terminal to approve in the browser");
    }
    await githubAuthCeremony(ctx.run);
  },
});
