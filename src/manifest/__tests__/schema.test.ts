import { describe, expect, test } from "bun:test";
import { MANIFEST_VERSION, manifestSchema } from "../schema.ts";

const valid = {
  manifestVersion: MANIFEST_VERSION,
  createdAt: "2026-08-26T12:00:00Z",
  identity: {
    name: "Peter Kloss",
    githubUser: "loriensleafs",
    email: "x@users.noreply.github.com",
  },
  locations: { devDir: "~/Dev", referenceDirName: "reference" },
  items: { ghostty: { selected: true }, chrome: { selected: true, config: { flags: [] } } },
};

describe("manifestSchema", () => {
  test("accepts a valid manifest", () => {
    expect(manifestSchema.parse(valid).items.ghostty?.selected).toBe(true);
  });

  test("applies location defaults", () => {
    const m = manifestSchema.parse({ ...valid, locations: {} });
    expect(m.locations.devDir).toBe("~/Dev");
    expect(m.locations.referenceDirName).toBe("reference");
  });

  test("rejects wrong version literal", () => {
    expect(() => manifestSchema.parse({ ...valid, manifestVersion: 99 })).toThrow();
  });

  test("rejects bad timestamps and empty identity", () => {
    expect(() => manifestSchema.parse({ ...valid, createdAt: "yesterday" })).toThrow();
    expect(() =>
      manifestSchema.parse({ ...valid, identity: { ...valid.identity, name: "" } }),
    ).toThrow();
  });
});
