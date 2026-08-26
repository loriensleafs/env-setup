import { describe, expect, test } from "bun:test";
import { decryptSecrets, encryptSecrets } from "../age-store.ts";

describe("age store", () => {
  test("round-trips secrets under a passphrase", async () => {
    const blob = await encryptSecrets({ typora: "KEY-1", cleanshot: "KEY-2" }, "correct horse");
    expect(blob.length).toBeGreaterThan(100);
    const back = await decryptSecrets(blob, "correct horse");
    expect(back).toEqual({ typora: "KEY-1", cleanshot: "KEY-2" });
  });

  test("wrong passphrase fails", async () => {
    const blob = await encryptSecrets({ a: "b" }, "right");
    await expect(decryptSecrets(blob, "wrong")).rejects.toThrow();
  });

  test("blob is age-armored binary, not plaintext", async () => {
    const blob = await encryptSecrets({ key: "SUPERSECRET" }, "pw");
    const asText = new TextDecoder().decode(blob);
    expect(asText).toContain("age-encryption.org");
    expect(asText).not.toContain("SUPERSECRET");
  });
});
