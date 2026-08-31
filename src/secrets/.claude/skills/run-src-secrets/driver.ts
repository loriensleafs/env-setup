#!/usr/bin/env bun
// Direct-invocation driver for src/secrets: age encrypt/decrypt round trip with
// a THROWAWAY passphrase and fake values, plus loadSecrets pointed at a temp
// file via ENVSETUP_SECRETS_FILE. Never touches secrets.json.age or ~/.config.
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { decryptSecrets, encryptSecrets } from "../../../age-store.ts";
import { getSecret, loadSecrets, SECRET_KEYS } from "../../../secrets.ts";

let failed = 0;
const check = (label: string, ok: boolean, detail = "") => {
  console.log(`  ${ok ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failed++;
};

console.log("src/secrets driver\n");
console.log(`  secret slots: ${Object.values(SECRET_KEYS).join(", ")}`);
const fake = { [SECRET_KEYS.typoraLicense]: "not-a-real-key", other: "value" };
const blob = await encryptSecrets(fake, "throwaway-passphrase");
check(
  "encryptSecrets → age armor-less binary starts with 'age-encryption.org/v1'",
  new TextDecoder().decode(blob.slice(0, 21)) === "age-encryption.org/v1",
);
const back = await decryptSecrets(blob, "throwaway-passphrase");
check(
  "decryptSecrets round trip",
  back[SECRET_KEYS.typoraLicense] === "not-a-real-key" && back.other === "value",
);
try {
  await decryptSecrets(blob, "wrong-passphrase");
  check("wrong passphrase is rejected", false);
} catch (e) {
  check("wrong passphrase is rejected", true, (e as Error).message.slice(0, 60));
}
const file = join(mkdtempSync(join(tmpdir(), "envsetup-secrets-")), "secrets.json");
await Bun.write(file, JSON.stringify({ [SECRET_KEYS.cleanshotLicense]: "fake" }));
process.env.ENVSETUP_SECRETS_FILE = file;
check(
  "loadSecrets reads ENVSETUP_SECRETS_FILE first",
  (await loadSecrets())[SECRET_KEYS.cleanshotLicense] === "fake",
  file,
);
check("getSecret(missing) → null", (await getSecret("nope")) === null);

console.log(failed === 0 ? "\nPASS" : `\nFAIL — ${failed} check(s)`);
process.exit(failed === 0 ? 0 : 1);
