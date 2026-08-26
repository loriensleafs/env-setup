import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mkdir } from "node:fs/promises";
import { generateMarketplace } from "../acmelabs-marketplace.ts";

async function fakePlugin(root: string, dir: string, name: string) {
  const p = join(root, dir, ".claude-plugin");
  await mkdir(p, { recursive: true });
  await Bun.write(
    join(p, "plugin.json"),
    JSON.stringify({ name, description: `${name} desc`, version: "1.0.0" }),
  );
}

describe("generateMarketplace", () => {
  test("lists only cloned plugin repos, relative sources, real schema", async () => {
    const root = join(tmpdir(), `envsetup-mkt-${Date.now()}`);
    await fakePlugin(root, "skills", "skills");
    await fakePlugin(root, "code-review", "code-review");
    // ask-user-question NOT cloned; plugin-kit cloned but no plugin.json
    await mkdir(join(root, "plugin-kit"), { recursive: true });

    const included = await generateMarketplace(root);
    expect(included.sort()).toEqual(["code-review", "skills"]);

    const mkt = await Bun.file(join(root, ".claude-plugin", "marketplace.json")).json();
    expect(mkt.name).toBe("ACMElabs");
    expect(mkt.$schema).toContain("marketplace.schema.json");
    const sources = mkt.plugins.map((p: { source: string }) => p.source).sort();
    expect(sources).toEqual(["./code-review", "./skills"]);
  });
});
