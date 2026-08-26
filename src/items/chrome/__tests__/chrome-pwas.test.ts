import { describe, expect, test } from "bun:test";
import { PWAS, renamePwaBundles } from "../chrome-pwas.ts";

describe("renamePwaBundles", () => {
  test("renames by plist URL match, idempotent, reports missing", async () => {
    const bundles = ["Gmail.app", "Google Calendar.app", "Notes.app", "Claude.app"];
    const urls: Record<string, string> = {
      "Gmail.app": "https://mail.google.com/mail/?usp=installed_webapp",
      "Google Calendar.app": "https://calendar.google.com/calendar/r",
      "Notes.app": "https://keep.google.com/",
      "Claude.app": "https://claude.ai/",
    };
    const renames: string[] = [];
    const result = await renamePwaBundles(
      async (b) => urls[b] ?? null,
      async () => bundles,
      async (from, to) => void renames.push(`${from}>${to}`),
    );
    expect(renames).toEqual(["Gmail.app>Mail.app", "Google Calendar.app>Calendar.app"]);
    expect(result.missing).toEqual(["Drive"]); // keep found as Notes (already named), drive absent
  });

  test("four decided apps", () => {
    expect(PWAS.map((p) => p.name)).toEqual(["Mail", "Calendar", "Drive", "Notes"]);
  });
});
