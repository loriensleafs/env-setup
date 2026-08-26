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

  test("invalid JSON falls through the chain (empty when no other source)", async () => {
    const dir = join(tmpdir(), `envsetup-iso-${Date.now()}`);
    const bad = join(dir, "bad.json");
    await Bun.write(bad, "{nope");
    process.env.ENVSETUP_SECRETS_FILE = bad;
    const prevCwd = process.cwd();
    const prevXdg = process.env.XDG_CONFIG_HOME;
    process.env.XDG_CONFIG_HOME = dir; // no config-dir secrets
    process.chdir(dir); // no repo .secrets.local.json
    try {
      expect(await loadSecrets()).toEqual({});
    } finally {
      process.chdir(prevCwd);
      if (prevXdg === undefined) delete process.env.XDG_CONFIG_HOME;
      else process.env.XDG_CONFIG_HOME = prevXdg;
    }
  });
});
