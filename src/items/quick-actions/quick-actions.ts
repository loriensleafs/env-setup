import { homedir } from "node:os";
import { join } from "node:path";
import { mkdir } from "node:fs/promises";
import { defineItem } from "../item.ts";

const SERVICES = join(homedir(), "Library", "Services");
const SCRIPTS = join(homedir(), ".config", "envsetup", "scripts");

interface ActionSpec {
  /** Menu label, workflow bundle name. */
  name: string;
  script: string;
}

export const ACTIONS: ActionSpec[] = [
  { name: "Copy Path", script: "copy-path.ts" },
  { name: "Open in Ghostty", script: "open-ghostty.ts" },
  { name: "Open in Cursor", script: "open-cursor.ts" },
];

/** Automator Quick Action .workflow XML: shell wrapper exec-ing a bun payload. */
export function workflowXml(scriptPath: string): string {
  const shell = `for f in "$@"; do "$HOME/.bun/bin/bun" ${JSON.stringify(scriptPath)} "$f"; done`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>AMApplicationBuild</key><string>528</string>
  <key>AMApplicationVersion</key><string>2.10</string>
  <key>AMDocumentVersion</key><string>2</string>
  <key>actions</key>
  <array>
    <dict>
      <key>action</key>
      <dict>
        <key>AMActionVersion</key><string>2.0.3</string>
        <key>AMParameterProperties</key><dict/>
        <key>ActionBundlePath</key><string>/System/Library/Automator/Run Shell Script.action</string>
        <key>ActionName</key><string>Run Shell Script</string>
        <key>ActionParameters</key>
        <dict>
          <key>COMMAND_STRING</key><string>${shell.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</string>
          <key>CheckedForUserDefaultShell</key><true/>
          <key>inputMethod</key><integer>1</integer>
          <key>shell</key><string>/bin/zsh</string>
          <key>source</key><string></string>
        </dict>
        <key>BundleIdentifier</key><string>com.apple.RunShellScript</string>
        <key>CFBundleVersion</key><string>2.0.3</string>
        <key>CanShowSelectedItemsWhenRun</key><false/>
        <key>CanShowWhenRun</key><true/>
        <key>Class Name</key><string>RunShellScriptAction</string>
        <key>InputUUID</key><string>0D3F4F10-1111-4E9C-9B1B-000000000001</string>
        <key>Keywords</key><array><string>Shell</string></array>
        <key>OutputUUID</key><string>0D3F4F10-1111-4E9C-9B1B-000000000002</string>
        <key>UUID</key><string>0D3F4F10-1111-4E9C-9B1B-000000000003</string>
      </dict>
    </dict>
  </array>
  <key>connectors</key><dict/>
  <key>workflowMetaData</key>
  <dict>
    <key>applicationBundleIDsByPath</key><dict/>
    <key>applicationPaths</key><array/>
    <key>inputTypeIdentifier</key><string>com.apple.Automator.fileSystemObject</string>
    <key>outputTypeIdentifier</key><string>com.apple.Automator.nothing</string>
    <key>presentationMode</key><integer>15</integer>
    <key>processesInput</key><false/>
    <key>serviceInputTypeIdentifier</key><string>com.apple.Automator.fileSystemObject</string>
    <key>serviceOutputTypeIdentifier</key><string>com.apple.Automator.nothing</string>
    <key>serviceProcessesInput</key><false/>
    <key>systemImageName</key><string>NSActionTemplate</string>
    <key>useAutomaticInputType</key><false/>
    <key>workflowTypeIdentifier</key><string>com.apple.Automator.servicesMenu</string>
  </dict>
</dict>
</plist>
`;
}

function workflowInfoPlist(name: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>NSServices</key>
  <array>
    <dict>
      <key>NSMenuItem</key><dict><key>default</key><string>${name}</string></dict>
      <key>NSMessage</key><string>runWorkflowAsService</string>
      <key>NSRequiredContext</key><dict/>
      <key>NSSendFileTypes</key><array><string>public.item</string></array>
    </dict>
  </array>
</dict>
</plist>
`;
}

// Payload sources, written to ~/.config/envsetup/scripts/ at configure time.
// Pure bun per the script-language rule (docs/PLAN.md).
const PAYLOADS: Record<string, string> = {
  "copy-path.ts": `#!/usr/bin/env bun
// Quick Action payload: copy the absolute path(s) of the selected items.
const paths = process.argv.slice(2);
if (paths.length > 0) {
  const proc = Bun.spawn(["pbcopy"], { stdin: "pipe" });
  proc.stdin.write(paths.join("\\n"));
  await proc.stdin.end();
  await proc.exited;
}
`,
  "open-ghostty.ts": `#!/usr/bin/env bun
// Quick Action payload: open Ghostty at the selected directory (or the
// selected file's parent directory).
import { dirname } from "node:path";
import { statSync } from "node:fs";
const target = process.argv[2];
if (target !== undefined) {
  const dir = statSync(target).isDirectory() ? target : dirname(target);
  await Bun.spawn(["open", "-a", "Ghostty", dir]).exited;
}
`,
  "open-cursor.ts": `#!/usr/bin/env bun
// Quick Action payload: open the selected file or directory in Cursor.
const target = process.argv[2];
if (target !== undefined) {
  await Bun.spawn(["open", "-a", "Cursor", target]).exited;
}
`,
};

export const quickActions = defineItem({
  id: "quick-actions",
  title: "Finder Quick Actions (Copy Path, Ghostty, Cursor)",
  kind: "system",
  deps: ["bun"],
  detect: async () => {
    for (const a of ACTIONS) {
      if (!(await Bun.file(join(SERVICES, `${a.name}.workflow`, "Contents", "document.wflow")).exists())) {
        return { installed: false };
      }
    }
    return { installed: true };
  },
  configure: async (ctx) => {
    await mkdir(SCRIPTS, { recursive: true });
    for (const a of ACTIONS) {
      const scriptPath = join(SCRIPTS, a.script);
      await Bun.write(scriptPath, PAYLOADS[a.script] as string);
      const bundle = join(SERVICES, `${a.name}.workflow`, "Contents");
      await mkdir(bundle, { recursive: true });
      await Bun.write(join(bundle, "document.wflow"), workflowXml(scriptPath));
      await Bun.write(join(bundle, "Info.plist"), workflowInfoPlist(a.name));
    }
    // Nudge pbs to register the new Services without logout.
    await ctx.run(["/System/Library/CoreServices/pbs", "-update"]);
    ctx.log("Quick Actions registered (right-click any file/folder → Quick Actions)");
  },
  verify: async () =>
    Bun.file(join(SERVICES, `${ACTIONS[0]?.name}.workflow`, "Contents", "document.wflow")).exists(),
});
