import { join } from "node:path";
import { configDir } from "../paths/paths.ts";

/**
 * Secret store facade. Today it reads a plain JSON file; the age-encrypted
 * store (docs/decisions/ADR-008-secrets-age-encrypted-in-repo.md) will decrypt into the same shape and slot in
 * behind loadSecrets without item changes.
 *
 * Resolution order:
 *  1. $ENVSETUP_SECRETS_FILE (tests / explicit override)
 *  2. <configDir>/secrets.json (written by the future age flow after unlock)
 *  3. ./.secrets.local.json (repo-dev convenience; git-ignored)
 */
export type Secrets = Record<string, string>;

export const SECRET_KEYS = {
  typoraLicense: "typora",
  superwhisperLicense: "superwhisper",
  cleanshotLicense: "cleanshot",
  anthropicApiKey: "anthropic-api-key",
  betterDisplayLicense: "better-display",
} as const;

export async function loadSecrets(): Promise<Secrets> {
  const candidates = [
    process.env.ENVSETUP_SECRETS_FILE,
    join(configDir(), "secrets.json"),
    ".secrets.local.json",
  ].filter((p): p is string => p !== undefined && p !== "");
  for (const path of candidates) {
    const file = Bun.file(path);
    if (await file.exists()) {
      try {
        return (await file.json()) as Secrets;
      } catch {
        // fall through to the next candidate
      }
    }
  }
  return {};
}

export async function getSecret(key: string): Promise<string | null> {
  return (await loadSecrets())[key] ?? null;
}
