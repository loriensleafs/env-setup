import { describe, expect, test } from "bun:test";
import { presentOption } from "../bootstrap.ts";

describe("presentOption (simplified reset-on-drift model)", () => {
  test("fresh install: no hint, default-checked", () => {
    expect(presentOption({ installed: false })).toEqual({});
  });

  test("installed but version-flagged: needs-update hint, stays checked", () => {
    const p = presentOption({ installed: true, version: "1.2.3", satisfies: false });
    expect(p.hint).toBe("installed 1.2.3 — needs update");
    expect(p.initialSelected).toBeUndefined();
  });

  test("drifted config: marked and UNCHECKED (opt-in reset)", () => {
    const p = presentOption({ installed: false, differs: true });
    expect(p.hint).toBe("installed — settings differ (select to reset)");
    expect(p.initialSelected).toBe(false);
  });

  test("never-configured is NOT treated as drifted", () => {
    expect(presentOption({ installed: false, differs: undefined })).toEqual({});
  });
});
