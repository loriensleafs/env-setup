import { homedir } from "node:os";
import { join } from "node:path";
import { defineItem } from "../item.ts";

export interface PwaSpec {
  url: string;
  /** URL substring that identifies the installed bundle. */
  host: string;
  /** Final bundle/Dock name. */
  name: string;
}

export const PWAS: PwaSpec[] = [
  { url: "https://mail.google.com/mail/", host: "mail.google.com", name: "Mail" },
  { url: "https://calendar.google.com/calendar/", host: "calendar.google.com", name: "Calendar" },
  { url: "https://drive.google.com/drive/", host: "drive.google.com", name: "Drive" },
  { url: "https://keep.google.com/", host: "keep.google.com", name: "Notes" },
];

export const CHROME_APPS_DIR = join(homedir(), "Applications", "Chrome Apps.localized");

/**
 * Google web apps — DECIDED 2026-08-26 (supersedes the force-install policy):
 * installs happen via Chrome's own "Install Page as App" in the connect
 * ceremony (~3 clicks each; avoids a permanently policy-managed browser),
 * then bundles are renamed to the decided Dock names — bundle filename
 * controls the Dock label (Peter-verified). Full bundle synthesis was ruled
 * out empirically: unregistered app-ids get no app window. Chrome may
 * regenerate bundle names on updates; doctor/sync re-applies renames.
 */
export async function renamePwaBundles(
  readPlistUrl: (bundle: string) => Promise<string | null>,
  listBundles: () => Promise<string[]>,
  rename: (from: string, to: string) => Promise<void>,
): Promise<{ renamed: string[]; missing: string[] }> {
  const bundles = await listBundles();
  const renamed: string[] = [];
  const found = new Set<string>();
  for (const bundle of bundles) {
    const url = await readPlistUrl(bundle);
    if (url === null) continue;
    const spec = PWAS.find((p) => url.includes(p.host));
    if (!spec) continue;
    found.add(spec.name);
    const target = `${spec.name}.app`;
    if (bundle !== target) {
      await rename(bundle, target);
      renamed.push(`${bundle} → ${target}`);
    }
  }
  const missing = PWAS.filter((p) => !found.has(p.name)).map((p) => p.name);
  return { renamed, missing };
}

export const chromePwas = defineItem({
  id: "chrome-pwas",
  title: "Google web apps (Mail, Calendar, Drive, Notes)",
  kind: "config-only",
  deps: ["chrome"],
  ceremonies: [{ id: "chrome-pwas-install", title: "Install the 4 Google web apps in Chrome" }],
  detect: async () => {
    for (const p of PWAS) {
      if (!(await Bun.file(join(CHROME_APPS_DIR, `${p.name}.app`, "Contents", "Info.plist")).exists())) {
        return { installed: false };
      }
    }
    return { installed: true };
  },
  // No install(): the apps arrive via the ceremony; renames run there too and
  // on sync (detect fails when Chrome regenerates original names → re-ceremony
  // is NOT needed; the rename pass in the ceremony handler is idempotent).
});
