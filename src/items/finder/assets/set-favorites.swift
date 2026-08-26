import Foundation
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
        FileHandle.standardError.write("warn: could not add \(expanded)\n".data(using: .utf8)!)
    }
}
print("OK favorites set (\(paths.count))")
