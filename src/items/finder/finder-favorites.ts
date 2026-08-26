import { homedir } from "node:os";
import { join } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { defineItem } from "../item.ts";

// Decided Finder sidebar Favorites order (top → bottom), from Peter's
// screenshot. Reasoning: Applications + Home at the top (most-launched),
// Apple's standard trio (Desktop/Documents/Downloads) together, then the
// personal dev dirs (Dev, .claude) at the bottom.
export const FAVORITES: string[] = [
  "/Applications",
  "~",
  "~/Desktop",
  "~/Documents",
  "~/Downloads",
  "~/Dev",
  "~/.claude",
];

export const SET_FAVORITES_SWIFT = `import Foundation
import CoreServices

// Rewrites the Finder sidebar Favorites list to exactly the given paths, in
// order. Uses LSSharedFileList (deprecated since 10.11 but still functional on
// macOS 26 — same deprecated-but-works bet as our Ghostty icon swap). mysides
// was Apple-disabled Oct 2025, so this is the reliable route.
//
// usage: swift set-favorites.swift <path1> <path2> ...

let paths = Array(CommandLine.arguments.dropFirst())
if paths.isEmpty { print("no paths"); exit(1) }

guard let list = LSSharedFileListCreate(nil, kLSSharedFileListFavoriteItems.takeUnretainedValue(), nil)?.takeRetainedValue() else {
    print("could not open Favorites list"); exit(1)
}

// Clear existing items.
if let existing = LSSharedFileListCopySnapshot(list, nil)?.takeRetainedValue() as? [LSSharedFileListItem] {
    for item in existing { LSSharedFileListItemRemove(list, item) }
}

// Insert in order (each after the previous → preserves top-to-bottom order).
var after = kLSSharedFileListItemBeforeFirst.takeUnretainedValue()
for path in paths {
    let expanded = (path as NSString).expandingTildeInPath
    let url = URL(fileURLWithPath: expanded) as CFURL
    if let inserted = LSSharedFileListInsertItemURL(list, after, nil, nil, url, nil, nil)?.takeRetainedValue() {
        after = inserted
    } else {
        FileHandle.standardError.write("warn: could not add \\(expanded)\\n".data(using: .utf8)!)
    }
}
print("OK favorites set (\\(paths.count))")
`;

const SWIFT_PATH = join(homedir(), ".config", "envsetup", "set-favorites.swift");

async function writeHelper(): Promise<string> {
  await mkdir(join(SWIFT_PATH, ".."), { recursive: true });
  await writeFile(SWIFT_PATH, SET_FAVORITES_SWIFT);
  return SWIFT_PATH;
}

/** Sets the Finder sidebar Favorites to the decided list, in order. */
export const finderFavorites = defineItem({
  id: "finder-favorites",
  title: "Finder sidebar favorites",
  kind: "system",
  configure: async (ctx) => {
    const helper = await writeHelper();
    const paths = FAVORITES.map((p) => p.replace(/^~/, homedir()));
    const r = await ctx.run(["swift", helper, ...paths]);
    if (r.exitCode !== 0 || !/OK favorites set/.test(r.stdout)) {
      throw new Error(`set favorites failed: ${(r.stdout + r.stderr).trim()}`);
    }
    await ctx.run(["killall", "Finder"]);
    ctx.log("Finder sidebar favorites set");
  },
  detect: async () => ({ installed: false }),
});
