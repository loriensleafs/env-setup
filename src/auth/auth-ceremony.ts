import * as p from "@clack/prompts";
import color from "picocolors";
import type { Runner } from "../exec/run.ts";
import {
  fetchUser,
  noreplyEmail,
  pollForToken,
  requestDeviceCode,
  type GithubUser,
} from "./github-device-flow.ts";

export const KEYCHAIN_SERVICE = "envsetup-github";

export interface AuthResult {
  user: GithubUser;
  email: string;
}

/** Reads the stored token (Keychain) if present. */
export async function storedToken(run: Runner): Promise<string | null> {
  const r = await run(["security", "find-generic-password", "-s", KEYCHAIN_SERVICE, "-w"]);
  return r.exitCode === 0 ? r.stdout.trim() : null;
}

/**
 * The one auth ceremony (docs/decisions/ADR-009-github-auth-and-signing.md: right after summary confirm).
 * Device flow under envsetup's app id → token into macOS Keychain → handed to
 * gh (so clones/API work) → gh becomes git's credential helper.
 */
export async function githubAuthCeremony(
  run: Runner,
  opts: { force?: boolean } = {},
): Promise<AuthResult> {
  const existing = opts.force ? null : await storedToken(run);
  if (existing !== null) {
    try {
      const user = await fetchUser(existing);
      p.log.success(`GitHub: already signed in as ${user.login}`);
      return { user, email: noreplyEmail(user) };
    } catch {
      p.log.warn("stored GitHub token no longer works — re-authenticating");
    }
  }

  const device = await requestDeviceCode();
  p.note(
    `${color.bold(device.user_code)}\n\nOpening ${device.verification_uri} — enter the code and approve.`,
    "GitHub sign-in",
  );
  await run(["open", device.verification_uri]);
  const s = p.spinner();
  s.start("Waiting for browser approval");
  const { accessToken } = await pollForToken(device);
  const user = await fetchUser(accessToken);
  s.stop(`Signed in as ${user.login}`);

  // Keychain (idempotent update), then hand the token to gh + git.
  await run([
    "security",
    "add-generic-password",
    "-U",
    "-s",
    KEYCHAIN_SERVICE,
    "-a",
    user.login,
    "-w",
    accessToken,
  ]);
  const ghLogin = Bun.spawn(["/opt/homebrew/bin/gh", "auth", "login", "--with-token"], {
    stdin: "pipe",
  });
  ghLogin.stdin.write(accessToken);
  await ghLogin.stdin.end();
  if ((await ghLogin.exited) !== 0) {
    p.log.warn("gh token handoff failed — gh commands may prompt separately");
  } else {
    await run(["/opt/homebrew/bin/gh", "auth", "setup-git"]);
  }
  return { user, email: noreplyEmail(user) };
}
