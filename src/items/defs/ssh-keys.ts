import { homedir, hostname } from "node:os";
import { join } from "node:path";
import { defineItem, type ItemContext } from "../item.ts";
import { storedToken } from "../../auth/auth-ceremony.ts";

const SSH_DIR = join(homedir(), ".ssh");
const AUTH_KEY = join(SSH_DIR, "id_ed25519");
const SIGN_KEY = join(SSH_DIR, "id_ed25519_sign");

async function uploadKey(
  token: string,
  endpoint: "keys" | "ssh_signing_keys",
  title: string,
  pubKey: string,
): Promise<void> {
  const r = await fetch(`https://api.github.com/user/${endpoint}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
    body: JSON.stringify({ title, key: pubKey.trim() }),
  });
  // 422 with "key is already in use" is fine on re-runs.
  if (!r.ok && r.status !== 422) {
    throw new Error(`GitHub ${endpoint} upload failed: HTTP ${r.status} ${await r.text()}`);
  }
}

/**
 * Two fresh per-machine ed25519 keys (docs/decisions/ADR-009-github-auth-and-signing.md): auth key
 * (revoke freely) + signing key (never delete — Verified-badge continuity).
 * Public halves upload via API with machine-identifying titles; ~/.ssh/config
 * gets agent+keychain wiring. Private keys never leave the machine.
 */
export const sshKeys = defineItem({
  id: "ssh-keys",
  title: "SSH keys (auth + signing) + GitHub upload",
  kind: "system",
  deps: ["github-auth"],
  detect: async (ctx) => {
    const auth = await Bun.file(AUTH_KEY).exists();
    const sign = await Bun.file(SIGN_KEY).exists();
    if (!auth || !sign) return { installed: false };
    // Files exist — but "done" includes the GitHub registration (the upload
    // 401'd on the first real run and a files-only detect would never retry
    // it). Per-step detection runs AFTER github-auth, so the token is fresh.
    const token = await storedToken(ctx.run);
    if (token === null) return { installed: true }; // can't verify — don't churn
    try {
      const material = async (path: string) =>
        (await Bun.file(`${path}.pub`).text()).trim().split(/\s+/).slice(0, 2).join(" ");
      const registered = async (endpoint: string, key: string) => {
        const r = await fetch(`https://api.github.com/user/${endpoint}`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
        });
        if (!r.ok) return null; // stale token / API issue — unverifiable
        const list = (await r.json()) as { key: string }[];
        return list.some((k) => k.key.trim() === key);
      };
      const authOk = await registered("keys", await material(AUTH_KEY));
      const signOk = await registered("ssh_signing_keys", await material(SIGN_KEY));
      if (authOk === null || signOk === null) return { installed: true }; // unverifiable
      return authOk && signOk ? { installed: true } : { installed: false, differs: true }; // keys exist locally, not on GitHub
    } catch {
      return { installed: true }; // offline — trust the files
    }
  },
  install: async (ctx: ItemContext) => {
    const machine = hostname().replace(/\.local$/, "");
    const stamp = new Date().toISOString().slice(0, 10);
    for (const [path, comment] of [
      [AUTH_KEY, `${machine} auth (envsetup ${stamp})`],
      [SIGN_KEY, `${machine} signing (envsetup ${stamp})`],
    ] as const) {
      if (await Bun.file(path).exists()) {
        ctx.log(`${path} exists — keeping it`);
        continue;
      }
      const r = await ctx.run(["ssh-keygen", "-t", "ed25519", "-N", "", "-C", comment, "-f", path]);
      if (r.exitCode !== 0) throw new Error(`ssh-keygen failed: ${r.stderr.trim()}`);
    }
    // ~/.ssh/config: agent + keychain (idempotent append).
    const configPath = join(SSH_DIR, "config");
    const marker = "# envsetup github";
    const block = `${marker}\nHost github.com\n  AddKeysToAgent yes\n  UseKeychain yes\n  IdentityFile ${AUTH_KEY}\n`;
    const existing = (await Bun.file(configPath).exists()) ? await Bun.file(configPath).text() : "";
    if (!existing.includes(marker)) {
      await Bun.write(
        configPath,
        `${existing}${existing.endsWith("\n") || existing === "" ? "" : "\n"}${block}`,
      );
    }
    // The signing key now exists — safe to enable commit signing (git-identity
    // defers this exact write when the key file is absent, because gpgsign
    // without a key makes every `git commit` fail).
    await ctx.run(["git", "config", "--global", "commit.gpgsign", "true"]);
    // Upload public halves (auth as access key, signing as signing key).
    const token = await storedToken(ctx.run);
    if (token === null) {
      ctx.log("no stored GitHub token — key upload happens after the sign-in ceremony");
      return;
    }
    const machineTitle = `${machine} (envsetup ${stamp})`;
    await uploadKey(token, "keys", machineTitle, await Bun.file(`${AUTH_KEY}.pub`).text());
    await uploadKey(
      token,
      "ssh_signing_keys",
      `${machineTitle} signing`,
      await Bun.file(`${SIGN_KEY}.pub`).text(),
    );
    ctx.log("public keys registered on GitHub (auth + signing)");
  },
  verify: async () => (await Bun.file(AUTH_KEY).exists()) && Bun.file(SIGN_KEY).exists(),
});
