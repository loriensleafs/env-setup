import { homedir } from "node:os";
import { join } from "node:path";
import { defineItem } from "../item.ts";

interface PwaSpec {
  url: string;
  /** Dock label; also the policy custom_name. */
  name: string;
}

export const PWAS: PwaSpec[] = [
  { url: "https://mail.google.com/mail/", name: "Mail" },
  { url: "https://calendar.google.com/calendar/", name: "Calendar" },
  { url: "https://drive.google.com/drive/", name: "Drive" },
  { url: "https://keep.google.com/", name: "Notes" },
];

const CHROME_APPS_DIR = join(homedir(), "Applications", "Chrome Apps.localized");

/**
 * Installs the four Google web apps via Chrome's WebAppInstallForceList
 * managed policy (macOS preferences — the supported scripted mechanism;
 * no CLI flag exists). custom_name gives the Dock labels Peter chose.
 * Chrome materializes the app bundles on its next launch; the dock item
 * picks them up then (or on sync). Side effect: Chrome shows a
 * "managed by your organization" hint — policy-based config always does.
 */
export const chromePwas = defineItem({
  id: "chrome-pwas",
  title: "Google web apps (Mail, Calendar, Drive, Notes)",
  kind: "config-only",
  deps: ["chrome"],
  detect: async (ctx) => {
    const r = await ctx.run(["defaults", "read", "com.google.Chrome", "WebAppInstallForceList"]);
    if (r.exitCode !== 0) return { installed: false };
    const allListed = PWAS.every((p) => r.stdout.includes(p.url));
    const bundles = await Promise.all(
      PWAS.map((p) => Bun.file(join(CHROME_APPS_DIR, `${p.name}.app`, "Contents", "Info.plist")).exists()),
    );
    return { installed: allListed, version: bundles.every(Boolean) ? "apps materialized" : "policy set, apps pending Chrome launch" };
  },
  configure: async (ctx) => {
    const entries = PWAS.map(
      (p) =>
        `<dict><key>url</key><string>${p.url}</string><key>default_launch_container</key><string>window</string><key>custom_name</key><string>${p.name}</string></dict>`,
    ).join("");
    const r = await ctx.run([
      "defaults", "write", "com.google.Chrome", "WebAppInstallForceList", `<array>${entries}</array>`,
    ]);
    if (r.exitCode !== 0) throw new Error(`policy write failed: ${r.stderr.trim()}`);
    ctx.log("web apps install on Chrome's next launch (after sign-in they carry your account)");
  },
  verify: async (ctx) =>
    (await ctx.run(["defaults", "read", "com.google.Chrome", "WebAppInstallForceList"])).exitCode === 0,
});
