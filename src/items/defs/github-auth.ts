import { defineItem } from "../item.ts";
import { githubAuthCeremony, storedToken } from "../../auth/auth-ceremony.ts";

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
    // The credential that matters is ENVSETUP's own Keychain token — git-email
    // and ssh-keys call the API with it. Checking `gh auth status` here let a
    // stale envsetup token masquerade as signed-in (both dependents 401'd on
    // the first real run). Validate the actual token against the API.
    const token = await storedToken(ctx.run);
    if (token === null) return { installed: false };
    try {
      const r = await fetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
      });
      // Present but rejected = stale credential, not absence.
      return { installed: r.ok, ...(r.ok ? {} : { differs: true }) };
    } catch {
      // Offline: can't validate — trust presence rather than forcing re-auth.
      return { installed: true };
    }
  },
  install: async (ctx) => {
    if (!process.stdout.isTTY) {
      throw new Error(
        "GitHub sign-in needed — run envsetup in a terminal to approve in the browser",
      );
    }
    // The ceremony short-circuits when the stored token still works, and
    // re-authenticates (device flow + gh handoff) when it doesn't.
    await githubAuthCeremony(ctx.run);
  },
});
