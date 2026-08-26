import { describe, expect, test } from "bun:test";
import { ACTIONS, workflowXml } from "../quick-actions.ts";

describe("quick actions", () => {
  test("three decided actions", () => {
    expect(ACTIONS.map((a) => a.name)).toEqual(["Copy Path", "Open in Ghostty", "Open in Cursor"]);
  });

  test("workflow XML embeds a bun invocation and escapes the path", () => {
    const xml = workflowXml("/Users/x/.config/envsetup/scripts/copy-path.ts");
    expect(xml).toContain(".bun/bin/bun");
    expect(xml).toContain("copy-path.ts");
    expect(xml).toContain("com.apple.Automator.servicesMenu");
    expect(xml).toContain("fileSystemObject");
    // XML remains parseable-ish: no raw ampersands from the shell string
    expect(xml).not.toMatch(/&(?!amp;|lt;|gt;|quot;|#)/);
  });
});
