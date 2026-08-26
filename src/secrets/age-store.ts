import { Decrypter, Encrypter } from "age-encryption";

/**
 * Passphrase-encrypted secrets blob (scrypt, age format) — the chezmoi-style
 * pattern decided in docs/PLAN.md Secrets. The .age file is committed to the
 * (public) repo; the passphrase lives in Peter's password manager.
 */
export async function encryptSecrets(secrets: Record<string, string>, passphrase: string): Promise<Uint8Array> {
  const enc = new Encrypter();
  enc.setPassphrase(passphrase);
  return enc.encrypt(JSON.stringify(secrets, null, 2));
}

export async function decryptSecrets(blob: Uint8Array, passphrase: string): Promise<Record<string, string>> {
  const dec = new Decrypter();
  dec.addPassphrase(passphrase);
  const text = await dec.decrypt(blob, "text");
  return JSON.parse(text) as Record<string, string>;
}
