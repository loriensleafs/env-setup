import { homedir } from "node:os";
import { defineItem } from "../item.ts";

/**
 * Git identity + SSH-signing prep. user.name and signing config are settable
 * now; user.email (GitHub noreply) and the actual keys arrive with the Stage C
 * auth flow, which updates this configuration (docs/PLAN.md git auth section).
 */
export const gitIdentity = defineItem({
  id: "git-identity",
  title: "Git identity & signing config",
  kind: "config-only",
  deps: ["xcode-clt"],
  detect: async (ctx) => {
    const name = await ctx.run(["git", "config", "--global", "user.name"]);
    const format = await ctx.run(["git", "config", "--global", "gpg.format"]);
    return {
      installed: name.exitCode === 0 && name.stdout.trim() !== "" && format.stdout.trim() === "ssh",
    };
  },
  configure: async (ctx) => {
    const name = ctx.manifest.identity.name;
    const sets: string[][] = [
      ["user.name", name],
      ["gpg.format", "ssh"],
      ["commit.gpgsign", "true"],
      ["user.signingkey", `${homedir()}/.ssh/id_ed25519_sign.pub`],
      ["init.defaultBranch", "main"],
    ];
    for (const [key, value] of sets) {
      const r = await ctx.run(["git", "config", "--global", key as string, value as string]);
      if (r.exitCode !== 0) throw new Error(`git config ${key} failed: ${r.stderr.trim()}`);
    }
    ctx.log("email + signing keys arrive with GitHub auth");
  },
  verify: async (ctx) =>
    (await ctx.run(["git", "config", "--global", "user.name"])).stdout.trim() !== "",
});
