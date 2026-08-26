import { afterEach, describe, expect, test } from "bun:test";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { getSecret, loadSecrets } from "../secrets.ts";

const saved = process.env.ENVSETUP_SECRETS_FILE;
afterEach(() => {
  if (saved === undefined) delete process.env.ENVSETUP_SECRETS_FILE;
  else process.env.ENVSETUP_SECRETS_FILE = saved;
});

describe("secrets", () => {
  test("reads from the override file", async () => {
    const path = join(tmpdir(), `envsetup-sec-${Date.now()}.json`);
    await Bun.write(path, JSON.stringify({ typora: "KEY-123" }));
    process.env.ENVSETUP_SECRETS_FILE = path;
    expect(await getSecret("typora")).toBe("KEY-123");
    expect(await getSecret("missing")).toBeNull();
  });

  test("invalid JSON falls through to empty", async () => {
    const path = join(tmpdir(), `envsetup-bad-${Date.now()}.json`);
    await Bun.write(path, "{nope");
    process.env.ENVSETUP_SECRETS_FILE = path;
    expect(await loadSecrets()).toEqual({});
  });
});
