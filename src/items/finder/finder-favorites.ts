import { homedir } from "node:os";
import { join } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { defineItem } from "../item.ts";
import type { Runner } from "../../exec/run.ts";

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
import Darwin

// Rewrites Finder's sidebar Favorites to exactly the given paths, in order.
//
// LSSharedFileList was pulled from Apple's public headers in macOS 12, so we
// dlopen/dlsym it at runtime — CRUCIALLY typing the insert function's position
// param as OpaquePointer?, not CFTypeRef?. The kLSSharedFileListItemLast
// sentinel is the integer 0x2, not a real object; passing it as CFTypeRef makes
// Swift call swift_unknownObjectRetain(0x2) → segfault (the crash we hit).
// Technique verified against the maintained mysides-swift (7onnie/mysides).
// The list state lives in the sharedfilelistd daemon (XPC), so no Full Disk
// Access / TCC prompt is needed.
//
// usage: swift set-favorites.swift <path1> <path2> ...

typealias SFLCreateFn   = @convention(c) (CFAllocator?, CFString, CFTypeRef?) -> CFTypeRef?
typealias SFLSnapshotFn = @convention(c) (CFTypeRef, UnsafeMutablePointer<UInt32>) -> CFArray?
typealias SFLInsertFn   = @convention(c) (CFTypeRef, OpaquePointer?, CFString?, CFTypeRef?, CFURL, CFDictionary?, CFArray?) -> CFTypeRef?
typealias SFLRemoveFn   = @convention(c) (CFTypeRef, CFTypeRef) -> OSStatus
typealias SFLItemURLFn  = @convention(c) (CFTypeRef, UInt32, UnsafeMutableRawPointer?) -> Unmanaged<CFURL>?

let args = Array(CommandLine.arguments.dropFirst())
let listMode = args.first == "--list"
let paths = listMode ? [] : args
if !listMode && paths.isEmpty { print("no paths"); exit(1) }

guard let handle = dlopen("/System/Library/Frameworks/CoreServices.framework/CoreServices", RTLD_LAZY) else {
    print("FAIL dlopen CoreServices"); exit(1)
}
func sym<T>(_ name: String) -> T? {
    guard let p = dlsym(handle, name) else { return nil }
    return unsafeBitCast(p, to: T.self)
}
guard let create: SFLCreateFn = sym("LSSharedFileListCreate"),
      let snapshot: SFLSnapshotFn = sym("LSSharedFileListCopySnapshot"),
      let insert: SFLInsertFn = sym("LSSharedFileListInsertItemURL"),
      let remove: SFLRemoveFn = sym("LSSharedFileListItemRemove"),
      let itemURL: SFLItemURLFn = sym("LSSharedFileListItemCopyResolvedURL"),
      let kFavPtr = dlsym(handle, "kLSSharedFileListFavoriteItems"),
      let kLastPtr = dlsym(handle, "kLSSharedFileListItemLast") else {
    print("FAIL dlsym symbols"); exit(1)
}
let kFav = kFavPtr.assumingMemoryBound(to: CFString.self).pointee
let kLastRaw = kLastPtr.assumingMemoryBound(to: UInt.self).pointee
guard let kLast = OpaquePointer(bitPattern: kLastRaw) else { print("FAIL sentinel"); exit(1) }

guard let list = create(nil, kFav, nil) else { print("FAIL create list"); exit(1) }

// --list mode: print the current favorite file paths, one per line, in order.
// Flags 3 = NoUserInteraction | DoNotMountVolumes (no prompts, no side effects).
if listMode {
    var n: UInt32 = 0
    if let snap = snapshot(list, &n) as? [CFTypeRef] {
        for item in snap {
            if let u = itemURL(item, 3, nil)?.takeRetainedValue() {
                let url = u as URL
                if url.isFileURL { print(url.path) }
            }
        }
    }
    exit(0)
}

// Clear existing favorites.
var count: UInt32 = 0
if let snap = snapshot(list, &count) as? [CFTypeRef] {
    for item in snap { _ = remove(list, item) }
}

// Append each path with the Last sentinel → final order matches input order.
var ok = 0
for path in paths {
    let expanded = (path as NSString).expandingTildeInPath
    let name = (expanded as NSString).lastPathComponent
    let url = URL(fileURLWithPath: expanded) as CFURL
    if insert(list, kLast, name as CFString, nil, url, nil, nil) != nil {
        ok += 1
    } else {
        FileHandle.standardError.write("warn: could not add \\(expanded)\\n".data(using: .utf8)!)
    }
}
if ok == paths.count { print("OK favorites set (\\(ok))") } else { print("PARTIAL \\(ok)/\\(paths.count)"); exit(1) }
`;

const SWIFT_PATH = join(homedir(), ".config", "envsetup", "set-favorites.swift");
const BIN_PATH = SWIFT_PATH.replace(/\.swift$/, "");

/** Absolute, tilde-expanded target order. */
export function expandedFavorites(): string[] {
  return FAVORITES.map((p) => p.replace(/^~/, homedir()));
}

/** Ordered exact-equality: the sidebar must match the target list precisely. */
export function sameOrder(have: string[], want: string[]): boolean {
  return have.length === want.length && have.every((p, i) => p === want[i]);
}

/** Write + compile the helper if the binary is missing. Returns the binary path. */
async function ensureBinary(ctx: { run: Runner }): Promise<string> {
  if (await Bun.file(BIN_PATH).exists()) return BIN_PATH;
  await mkdir(join(SWIFT_PATH, ".."), { recursive: true });
  await writeFile(SWIFT_PATH, SET_FAVORITES_SWIFT);
  const build = await ctx.run(["swiftc", SWIFT_PATH, "-o", BIN_PATH]);
  if (build.exitCode !== 0)
    throw new Error(`compiling favorites helper failed: ${build.stderr.trim()}`);
  return BIN_PATH;
}

/** Read the current Finder Favorites (file paths, in order) via the helper. */
async function currentFavorites(ctx: { run: Runner }): Promise<string[]> {
  const bin = await ensureBinary(ctx);
  const r = await ctx.run([bin, "--list"]);
  if (r.exitCode !== 0) return [];
  return r.stdout
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

/** True when the sidebar already matches FAVORITES exactly, in order. */
async function matchesDesired(ctx: { run: Runner }): Promise<boolean> {
  return sameOrder(await currentFavorites(ctx), expandedFavorites());
}

/** Sets the Finder sidebar Favorites to the decided list, in order. */
export const finderFavorites = defineItem({
  id: "finder-favorites",
  title: "Finder sidebar favorites",
  kind: "system",
  deps: ["xcode-clt"], // needs swiftc to compile the helper
  configure: async (ctx) => {
    const bin = await ensureBinary(ctx);
    const r = await ctx.run([bin, ...expandedFavorites()]);
    if (r.exitCode !== 0 || !/OK favorites set/.test(r.stdout)) {
      throw new Error(`set favorites failed: ${(r.stdout + r.stderr).trim()}`);
    }
    await ctx.run(["killall", "Finder"]);
    ctx.log("Finder sidebar favorites set");
  },
  detect: async (ctx) => ({ installed: await matchesDesired(ctx) }),
  verify: async (ctx) => matchesDesired(ctx),
});
