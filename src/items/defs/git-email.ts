import { defineItem } from "../item.ts";
import { storedToken } from "../../auth/auth-ceremony.ts";
import { fetchUser, noreplyEmail } from "../../auth/github-device-flow.ts";
import { saveManifest } from "../../manifest/store.ts";

/** Resolves the GitHub noreply address and sets git user.email (docs/PLAN.md). */
export const gitEmail = defineItem({
  id: "git-email",
  title: "Git commit email (GitHub noreply)",
  kind: "config-only",
  deps: ["github-auth", "git-identity"],
  detect: async (ctx) => {
    const r = await ctx.run(["git", "config", "--global", "user.email"]);
    return { installed: r.exitCode === 0 && r.stdout.includes("users.noreply.github.com") };
  },
  configure: async (ctx) => {
    const token = await storedToken(ctx.run);
    if (token === null) throw new Error("GitHub sign-in required first (token not in Keychain)");
    const user = await fetchUser(token);
    const email = noreplyEmail(user);
    const r = await ctx.run(["git", "config", "--global", "user.email", email]);
    if (r.exitCode !== 0) throw new Error(`git config user.email failed: ${r.stderr.trim()}`);
    // Persist the resolved address back into the manifest, replacing the
    // bootstrap placeholder (EMAIL_PENDING) so the saved manifest is truthful.
    if (ctx.manifest.identity.email !== email) {
      ctx.manifest.identity.email = email;
      await saveManifest(ctx.manifest);
      ctx.log("manifest identity.email updated");
    }
    ctx.log(`user.email = ${email}`);
  },
  verify: async (ctx) =>
    (await ctx.run(["git", "config", "--global", "user.email"])).stdout.includes("noreply"),
});
