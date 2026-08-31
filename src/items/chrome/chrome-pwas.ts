import { homedir } from "node:os";
import { join } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { defineItem } from "../item.ts";

export interface PwaSpec {
  url: string;
  /** Dock name + bundle filename. */
  name: string;
  /** URL substring identifying the created bundle (CrAppModeShortcutURL). */
  host: string;
}

/** Decided Google web apps (docs/plan/PRD-001-envsetup.md). */
export const PWAS: PwaSpec[] = [
  { url: "https://mail.google.com/mail/", name: "Mail", host: "mail.google.com" },
  { url: "https://calendar.google.com/calendar/", name: "Calendar", host: "calendar.google.com" },
  { url: "https://drive.google.com/drive/", name: "Drive", host: "drive.google.com" },
  { url: "https://keep.google.com/", name: "Notes", host: "keep.google.com" },
];

export const CHROME_APPS_DIR = join(homedir(), "Applications", "Chrome Apps.localized");

/**
 * Installs the four Google web apps as real Chrome apps by driving
 * ⋮ → Cast, Save, and Share → Install… through the accessibility API, then
 * renaming each bundle's filename to the decided Dock label. No enterprise
 * policy (no "managed by your organization" badge), real profile.
 * Requires a one-time Accessibility grant for the runner (Stage C ceremony).
 * The AX-driver Swift source is embedded so the compiled binary carries it.
 */
export const INSTALL_SWIFT = `import Cocoa
import ApplicationServices

// Installs a URL as a Chrome web app via ⋮ → Cast, Save, and Share → Install…,
// driven through the accessibility API. No enterprise policy, real profile, no
// "managed by your organization" badge. Core flow (spatial ⋮ detection, delta
// submenu scraping, window-rooted dialog button search) from a Gemini session;
// wrapped here with a URL-open prologue so it can drive any target.
//
// usage: swift install-web-app.swift <url> [app-name]
//   app-name: after install, the created .app bundle is renamed to this
//   (filename only — Chrome's self-repair reverts any Info.plist edits). Used
//   uniformly for both real PWAs and shortcut apps.

func getAXAttribute(element: AXUIElement, attribute: String) -> CFTypeRef? {
    var value: CFTypeRef?
    return AXUIElementCopyAttributeValue(element, attribute as CFString, &value) == .success ? value : nil
}
func getAXChildren(element: AXUIElement) -> [AXUIElement] {
    (getAXAttribute(element: element, attribute: kAXChildrenAttribute as String) as? [AXUIElement]) ?? []
}
func getAXPosition(element: AXUIElement) -> CGPoint? {
    guard let value = getAXAttribute(element: element, attribute: kAXPositionAttribute as String),
          CFGetTypeID(value) == AXValueGetTypeID() else { return nil }
    var point = CGPoint.zero
    return AXValueGetValue(value as! AXValue, .cgPoint, &point) ? point : nil
}

func findChromeMenuButtonSpatially(startingAt mainWindow: AXUIElement) -> AXUIElement? {
    var queue = [mainWindow]
    var allButtons: [(element: AXUIElement, position: CGPoint, desc: String)] = []
    while !queue.isEmpty {
        let current = queue.removeFirst()
        let role = getAXAttribute(element: current, attribute: kAXRoleAttribute as String) as? String
        if role == "AXWebArea" { continue }
        if role == kAXButtonRole as String || role == kAXPopUpButtonRole as String {
            if let pos = getAXPosition(element: current) {
                let desc = getAXAttribute(element: current, attribute: kAXDescriptionAttribute as String) as? String ?? ""
                allButtons.append((element: current, position: pos, desc: desc))
            }
        }
        queue.append(contentsOf: getAXChildren(element: current))
    }
    guard let reloadButton = allButtons.first(where: { $0.desc == "Reload" }) else { return nil }
    let toolbarY = reloadButton.position.y
    let toolbarRow = allButtons.filter { abs($0.position.y - toolbarY) <= 25.0 }.sorted { $0.position.x < $1.position.x }
    return toolbarRow.last?.element
}

func getChromeMenuItems(startingAt element: AXUIElement) -> [(title: String, element: AXUIElement)] {
    var items: [(title: String, element: AXUIElement)] = []
    var seen = Set<String>()
    var queue = [element]
    while !queue.isEmpty {
        let current = queue.removeFirst()
        let role = getAXAttribute(element: current, attribute: kAXRoleAttribute as String) as? String ?? "Unknown"
        if role == kAXMenuBarRole as String || role == "AXWebArea" { continue }
        if role == kAXMenuItemRole as String {
            let title = getAXAttribute(element: current, attribute: kAXTitleAttribute as String) as? String ?? ""
            let desc = getAXAttribute(element: current, attribute: kAXDescriptionAttribute as String) as? String ?? ""
            let displayText = title.isEmpty ? desc : title
            if !displayText.isEmpty && !seen.contains(displayText) { items.append((displayText, current)); seen.insert(displayText) }
        }
        queue.append(contentsOf: getAXChildren(element: current))
    }
    return items
}

func findDialogButton(startingAt element: AXUIElement, targetTitle: String) -> AXUIElement? {
    var queue = [element]
    while !queue.isEmpty {
        let current = queue.removeFirst()
        let role = getAXAttribute(element: current, attribute: kAXRoleAttribute as String) as? String ?? "Unknown"
        if role == "AXWebArea" { continue }
        if role == kAXButtonRole as String {
            let title = getAXAttribute(element: current, attribute: kAXTitleAttribute as String) as? String ?? ""
            let desc = getAXAttribute(element: current, attribute: kAXDescriptionAttribute as String) as? String ?? ""
            if title == targetTitle || desc == targetTitle { return current }
        }
        queue.append(contentsOf: getAXChildren(element: current))
    }
    return nil
}

import Foundation

// After install, rename the freshly-created bundle to \`name\` in ALL the places
// Chrome writes the app name: the .app filename, Info.plist (CFBundleName,
// CrAppModeShortcutName) and every InfoPlist.strings (CFBundleDisplayName,
// CFBundleName). The Dock hover label follows these.
func renameInstalledBundle(matchingURLHost host: String, to name: String) {
    let dir = ("~/Applications/Chrome Apps.localized" as NSString).expandingTildeInPath
    let fm = FileManager.default
    guard let entries = try? fm.contentsOfDirectory(atPath: dir) else { return }
    for entry in entries where entry.hasSuffix(".app") {
        let appPath = "\\(dir)/\\(entry)"
        let infoPath = "\\(appPath)/Contents/Info.plist"
        guard let info = NSDictionary(contentsOfFile: infoPath),
              let shortcutURL = info["CrAppModeShortcutURL"] as? String,
              shortcutURL.contains(host) else { continue }
        // ONLY rename the bundle filename. Editing Info.plist / InfoPlist.strings
        // trips Chrome's web-app self-repair, which regenerates the bundle and
        // reverts the name on next launch (Peter observed the flicker/revert).
        // The filename alone controls the Dock label and is left untouched by
        // Chrome's repair.
        let target = "\\(dir)/\\(name).app"
        if appPath != target {
            try? fm.removeItem(atPath: target)
            try? fm.moveItem(atPath: appPath, toPath: target)
        }
        print("Renamed bundle to '\\(name).app'.")
        return
    }
}

func run() {
    let url = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : ""
    let appName = CommandLine.arguments.count > 2 ? CommandLine.arguments[2] : ""
    if url.isEmpty { print("Error: no url argument."); exit(1) }

    let openProc = Process(); openProc.launchPath = "/usr/bin/open"; openProc.arguments = ["-a", "Google Chrome", url]
    try? openProc.run(); openProc.waitUntilExit()
    Thread.sleep(forTimeInterval: 5.0)

    guard let chromeApp = NSWorkspace.shared.runningApplications.first(where: { $0.bundleIdentifier == "com.google.Chrome" }) else {
        print("Error: Google Chrome is not running."); exit(1)
    }
    chromeApp.activate()
    let appElement = AXUIElementCreateApplication(chromeApp.processIdentifier)
    AXUIElementSetAttributeValue(appElement, "AXManualAccessibility" as CFString, kCFBooleanTrue)
    Thread.sleep(forTimeInterval: 1.0)
    guard let mainWindow = getAXAttribute(element: appElement, attribute: kAXMainWindowAttribute as String) as! AXUIElement? else {
        print("Error: Could not find Chrome's main window."); exit(1)
    }

    print("Locating the 3-dot menu...")
    guard let menuButton = findChromeMenuButtonSpatially(startingAt: mainWindow) else { print("Error: Spatial search failed."); exit(1) }
    AXUIElementPerformAction(menuButton, kAXPressAction as CFString)
    Thread.sleep(forTimeInterval: 1.5)

    let originalMenuItems = getChromeMenuItems(startingAt: appElement)
    let targetMenuName = "Cast, Save, and Share"
    guard let submenuParent = originalMenuItems.first(where: { $0.title.contains(targetMenuName) }) else {
        print("Error: Could not find '\\(targetMenuName)'."); exit(1)
    }
    print("Found '\\(targetMenuName)'. Opening submenu...")
    AXUIElementPerformAction(submenuParent.element, kAXPressAction as CFString)
    Thread.sleep(forTimeInterval: 1.0)

    let updatedMenuItems = getChromeMenuItems(startingAt: appElement)
    let originalTitles = Set(originalMenuItems.map { $0.title })
    let newSubmenuItems = updatedMenuItems.filter { !originalTitles.contains($0.title) }

    var installElement: AXUIElement? = nil
    var installTitle = ""
    for item in newSubmenuItems where item.title.hasPrefix("Install ") {
        installElement = item.element; installTitle = item.title; break
    }
    guard let install = installElement else {
        print("Notice: no 'Install…' option — the page may not be installable."); exit(0)
    }
    print("Clicking '\\(installTitle)'...")
    AXUIElementPerformAction(install, kAXPressAction as CFString)
    Thread.sleep(forTimeInterval: 1.5)

    if let nextButton = findDialogButton(startingAt: mainWindow, targetTitle: "Next") {
        print("Clicking 'Next'...")
        AXUIElementPerformAction(nextButton, kAXPressAction as CFString)
        Thread.sleep(forTimeInterval: 1.5)
    }
    if let dialogInstall = findDialogButton(startingAt: mainWindow, targetTitle: "Install") {
        print("Clicking final 'Install'...")
        AXUIElementPerformAction(dialogInstall, kAXPressAction as CFString)
        Thread.sleep(forTimeInterval: 2.5)
        if !appName.isEmpty, let host = URL(string: url)?.host {
            renameInstalledBundle(matchingURLHost: host, to: appName)
        }
        print("OK installed: \\(installTitle)")
    } else {
        print("Error: final 'Install' button not found."); exit(1)
    }
}

run()
`;

const SWIFT_PATH = join(homedir(), ".config", "envsetup", "install-web-app.swift");

export async function writeSwiftHelper(): Promise<string> {
  await mkdir(join(SWIFT_PATH, ".."), { recursive: true });
  await writeFile(SWIFT_PATH, INSTALL_SWIFT);
  return SWIFT_PATH;
}

export const chromePwas = defineItem({
  id: "chrome-pwas",
  title: "Google web apps (Mail, Calendar, Drive, Notes)",
  kind: "config-only",
  deps: ["chrome"],
  ceremonies: [
    { id: "chrome-pwas-install", title: "Install the 4 Google web apps (drives Chrome)" },
  ],
  detect: async (ctx) => {
    // Drift-aware: every bundle must exist AND actually be the web app we
    // intend (its CrAppModeShortcutURL host) — a same-named bundle pointing
    // elsewhere is drift, not done. Partial installs (some of the 4) are drift.
    let anyPresent = false;
    let matches = true;
    for (const p of PWAS) {
      const bundle = join(CHROME_APPS_DIR, `${p.name}.app`);
      if (!(await Bun.file(join(bundle, "Contents", "Info.plist")).exists())) {
        matches = false;
        continue;
      }
      anyPresent = true;
      const url = await ctx.run([
        "defaults",
        "read",
        join(bundle, "Contents", "Info"),
        "CrAppModeShortcutURL",
      ]);
      if (url.exitCode !== 0 || !url.stdout.includes(p.host)) matches = false;
    }
    return { installed: matches, ...(!matches && anyPresent ? { differs: true } : {}) };
  },
  // Install happens in the ceremony (needs Chrome + Accessibility + real profile).
});
