import { homedir } from "node:os";
import { defineItem } from "../item.ts";

/**
 * Git identity + SSH-signing prep. user.name and signing config are settable
 * now; user.email (GitHub noreply) and the actual keys arrive with the Stage C
 * auth flow, which updates this configuration (docs/decisions/ADR-009-github-auth-and-signing.md).
 */
export const gitIdentity = defineItem({
  id: "git-identity",
  title: "Git identity & signing config",
  kind: "config-only",
  deps: ["xcode-clt"],
  detect: async (ctx) => {
    const name = await ctx.run(["git", "config", "--global", "user.name"]);
    // No global user.name at all = git was never configured here.
    if (name.exitCode !== 0 || name.stdout.trim() === "") return { installed: false };
    // Verify the fixed signing config too (drift-aware) — not just that a name
    // exists. A name is present, so any mismatch is a real differ, not absence.
    const fixed: [string, string][] = [
      ["gpg.format", "ssh"],
      ["user.signingkey", `${homedir()}/.ssh/id_ed25519_sign.pub`],
      ["init.defaultBranch", "main"],
    ];
    for (const [key, expected] of fixed) {
      const r = await ctx.run(["git", "config", "--global", key]);
      if (r.stdout.trim() !== expected) return { installed: false, differs: true };
    }
    // gpgsign is stage-dependent: required once the signing key exists, and a
    // DEFECT (every commit fails) if enabled while the key is missing.
    const keyExists = await Bun.file(`${homedir()}/.ssh/id_ed25519_sign.pub`).exists();
    const gpgsign = (await ctx.run(["git", "config", "--global", "commit.gpgsign"])).stdout.trim();
    if (keyExists ? gpgsign !== "true" : gpgsign === "true") {
      return { installed: false, differs: true };
    }
    return { installed: true };
  },
  configure: async (ctx) => {
    const name = ctx.manifest.identity.name;
    const sets: string[][] = [
      ["user.name", name],
      ["gpg.format", "ssh"],
      ["user.signingkey", `${homedir()}/.ssh/id_ed25519_sign.pub`],
      ["init.defaultBranch", "main"],
    ];
    // gpgsign=true with a missing key file makes EVERY `git commit` fail
    // (`fatal: failed to write commit object` — verified empirically). Only
    // enable it once the key exists; ssh-keys flips it on after creating it.
    if (await Bun.file(`${homedir()}/.ssh/id_ed25519_sign.pub`).exists()) {
      sets.push(["commit.gpgsign", "true"]);
    } else {
      ctx.log("commit signing deferred until the signing key exists (ssh-keys)");
    }
    for (const [key, value] of sets) {
      const r = await ctx.run(["git", "config", "--global", key as string, value as string]);
      if (r.exitCode !== 0) throw new Error(`git config ${key} failed: ${r.stderr.trim()}`);
    }
    ctx.log("email + signing keys arrive with GitHub auth");
  },
  verify: async (ctx) =>
    (await ctx.run(["git", "config", "--global", "user.name"])).stdout.trim() !== "",
});
